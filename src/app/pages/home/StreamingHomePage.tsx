// src/app/pages/home/StreamingHomePage.tsx — HOME-02
// Cinematic streaming home with varied section layouts + preview popup
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play, Star, Volume2, VolumeX,
  Crown, ChevronRight, Sparkles, Zap, Film, Tv,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useGetManifestQuery } from '../../store/api/manifestApi';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { getImageUrl } from '../../utils/imageUtils';
import ContentRow from '../../components/content/ContentRow';
import type { ManifestMovie, ManifestSection } from '../../services/v2/ManifestV2Service';

/* ─── helpers ─────────────────────────────────── */
function seeAllLink(section: ManifestSection): string | undefined {
  const fp = section.filter_params;
  if (!fp || Object.keys(fp).length === 0) return undefined;
  return `/movies?${new URLSearchParams(fp).toString()}`;
}

function movieDetailPath(movie: ManifestMovie): string {
  return `/watch/${movie.id}`;
}

/* ═══════════════════════════════════════════════
   HERO — full viewport, video auto-play, cinematic
   ═══════════════════════════════════════════════ */
const HeroBanner: React.FC<{
  movie?: ManifestMovie;
  isLoading: boolean;
  /** Fallback movies to try if the main video URL fails (SSL, 404, etc.) */
  fallbackMovies?: ManifestMovie[];
}> = ({ movie, isLoading, fallbackMovies }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [activeMovie, setActiveMovie] = useState(movie);
  const triedUrls = useRef(new Set<string>());
  const previewStart = useRef(0);
  const navigate = useNavigate();

  // Sync activeMovie when prop changes
  useEffect(() => {
    setActiveMovie(movie);
    setVideoError(false);
    setVideoLoaded(false);
    triedUrls.current.clear();
  }, [movie?.id]);

  // Handle video load error — try fallback movies
  const handleVideoError = useCallback(() => {
    const currentUrl = activeMovie?.url || '';
    triedUrls.current.add(currentUrl);
    console.warn('[Hero] Video failed to load:', currentUrl);

    // Find first fallback with a different URL we haven't tried
    const next = fallbackMovies?.find(
      m => m.url && m.url !== '' && !triedUrls.current.has(m.url)
    );
    if (next) {
      console.log('[Hero] Trying fallback video:', next.title, next.url);
      setVideoLoaded(false);
      setActiveMovie(next);
    } else {
      console.log('[Hero] No fallback videos available — showing poster');
      setVideoError(true);
    }
  }, [activeMovie?.url, fallbackMovies]);

  // Autoplay: video is always opacity-100 (browsers skip invisible videos).
  // Poster <img> sits ON TOP and fades out once playback starts.
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !activeMovie?.url || videoError) return;

    const PREVIEW_DURATION = 180; // 3 minutes max preview

    const onPlaying = () => {
      console.log('[Hero] Video playing —', activeMovie.title);
      setVideoLoaded(true);

      // Seek to 10% of the movie to skip intros/logos
      if (Number.isFinite(vid.duration) && vid.duration > 0) {
        vid.currentTime = vid.duration * 0.1;
      }

      // Unmute after a short delay so user hears audio
      setTimeout(() => {
        vid.muted = false;
        vid.volume = 0.5;
        setMuted(false);
      }, 500);
    };
    vid.addEventListener('playing', onPlaying, { once: true });

    // Enforce 3-minute preview limit — loops back to 10% when exceeded
    previewStart.current = 0;
    const onTimeUpdate = () => {
      if (!Number.isFinite(vid.duration) || vid.duration <= 0) return;
      const startPoint = vid.duration * 0.1;
      if (previewStart.current === 0 && vid.currentTime >= startPoint) {
        previewStart.current = vid.currentTime;
      }
      if (previewStart.current > 0 && (vid.currentTime - previewStart.current) >= PREVIEW_DURATION) {
        vid.currentTime = startPoint;
        previewStart.current = startPoint;
      }
    };
    vid.addEventListener('timeupdate', onTimeUpdate);

    vid.muted = true;

    const tryPlay = () => {
      vid.play().catch((err) => {
        console.warn('[Hero] Autoplay blocked:', err.message);
      });
    };

    if (vid.readyState >= 3) {
      tryPlay();
    } else {
      vid.addEventListener('canplay', tryPlay, { once: true });
    }

    const fallbackTimer = setTimeout(tryPlay, 2000);

    return () => {
      vid.removeEventListener('playing', onPlaying);
      vid.removeEventListener('canplay', tryPlay);
      vid.removeEventListener('timeupdate', onTimeUpdate);
      clearTimeout(fallbackTimer);
    };
  }, [activeMovie?.url, videoError]);

  if (isLoading) {
    return (
      <div className="relative w-full h-screen bg-[#0a0a0c]">
        <div className="absolute inset-0 animate-pulse bg-white/[0.02]" />
        <div className="absolute bottom-20 left-4 sm:left-10 lg:left-16 max-w-lg space-y-3 z-10">
          <div className="h-3 w-20 bg-white/10 rounded" />
          <div className="h-10 w-72 bg-white/10 rounded-lg" />
          <div className="h-4 w-56 bg-white/[0.06] rounded" />
          <div className="flex gap-3 mt-6">
            <div className="h-11 w-32 bg-white/10 rounded-full" />
            <div className="h-11 w-32 bg-white/[0.06] rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  // Use activeMovie for video & content (may be a fallback), original movie for poster
  const displayMovie = activeMovie || movie;
  const posterUrl = getImageUrl(displayMovie.thumbnail_url);
  const watchPath = `/watch/${displayMovie.id}`;
  const genre = displayMovie.genre?.split(',')[0]?.trim();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0c]">
      {/* Video — always visible (opacity-0 blocks autoplay in some browsers) */}
      {displayMovie.url && !videoError ? (
        <video
          ref={videoRef}
          key={displayMovie.url}
          src={displayMovie.url}
          muted
          autoPlay
          playsInline
          preload="auto"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={handleVideoError}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}
      {/* Poster — sits ON TOP of video, fades out when video starts playing */}
      <img
        src={posterUrl}
        alt={displayMovie.title}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-[1] ${
          videoLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      />

      {/* Video loading indicator — centered over poster while video buffers */}
      {displayMovie.url && !videoError && !videoLoaded && (
        <div className="absolute inset-0 z-[3] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            {/* Outer ring */}
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-[2.5px] border-white/[0.08]" />
              <div
                className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-white/80"
                style={{ animation: 'spin 0.9s linear infinite' }}
              />
              {/* Play icon in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Play size={18} fill="white" className="text-white ml-0.5 opacity-40" />
              </div>
            </div>
            <span className="text-white/40 text-[11px] font-medium tracking-widest uppercase">Loading preview</span>
          </div>
        </div>
      )}

      {/* Gradients — z-[2] to sit above poster and video */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/40 to-transparent z-[2]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-black/20 z-[2]" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0c] to-transparent z-[2]" />

      {/* Mute toggle */}
      {displayMovie.url && videoLoaded && (
        <button
          onClick={() => {
            const next = !muted;
            setMuted(next);
            if (videoRef.current) videoRef.current.muted = next;
          }}
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
          className="absolute top-20 sm:top-24 right-4 sm:right-8 z-20 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      )}

      {/* Content */}
      <div className="absolute bottom-20 sm:bottom-24 left-4 sm:left-10 lg:left-16 max-w-xl z-10">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {genre && (
            <span className="bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">
              {genre}
            </span>
          )}
          {displayMovie.year && <span className="text-white/50 text-[11px]">{displayMovie.year}</span>}
          {displayMovie.rating > 0 && (
            <span className="flex items-center gap-0.5 text-brand-gold text-[11px]">
              <Star size={9} fill="currentColor" /> {displayMovie.rating.toFixed(1)}
            </span>
          )}
          {displayMovie.duration && <span className="text-white/40 text-[11px]">{displayMovie.duration}</span>}
          {displayMovie.vj && <span className="text-white/30 text-[11px]">VJ {displayMovie.vj}</span>}
        </div>

        <h1 className="text-white text-3xl sm:text-5xl lg:text-6xl font-bold font-heading leading-[1.1] mb-5 drop-shadow-2xl">
          {displayMovie.title}
        </h1>

        <div className="flex flex-wrap gap-2.5 sm:gap-3" style={{ position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => navigate(watchPath)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.5rem',
              background: '#fff',
              color: '#111',
              fontWeight: 700,
              fontSize: '0.875rem',
              letterSpacing: '0.02em',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e5e5e5'; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
          >
            <Play size={16} fill="currentColor" /> Watch Now
          </button>
          <Link
            to={movieDetailPath(displayMovie)}
            className="no-underline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.5rem',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.875rem',
              letterSpacing: '0.02em',
              borderRadius: '0.375rem',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
          >
            <Play size={16} style={{ opacity: 0.8 }} /> More Info
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   LAYOUT 2: SPOTLIGHT — 1 tall + 8 small (4x2)
   ═══════════════════════════════════════════════ */
const SpotlightSection: React.FC<{
  section: ManifestSection;
}> = ({ section }) => {
  const navigate = useNavigate();
  if (!section.items || section.items.length < 2) return null;
  const [big, ...rest] = section.items.slice(0, 9);
  const small = rest.slice(0, 8);
  const link = seeAllLink(section);

  return (
    <section className="mb-14 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-[15px] sm:text-base font-semibold font-heading">{section.title}</h2>
        {link && <Link to={link} className="no-underline text-white/40 text-[12px] hover:text-white/70 transition-colors">See all</Link>}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2.5" style={{ gridTemplateRows: 'repeat(2, minmax(0, 1fr))' }}>
        {/* Tall spotlight card — spans 2 rows */}
        <div
          className="row-span-2 relative rounded-xl overflow-hidden cursor-pointer group bg-[#1a1a1e]"
          onClick={() => navigate(movieDetailPath(big))}
        >
          <div className="h-full">
            <img
              src={getImageUrl(big.thumbnail_url)}
              alt={big.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 flex items-center justify-center shadow-2xl">
              <Play size={16} fill="black" className="text-black ml-0.5 sm:hidden" />
              <Play size={20} fill="black" className="text-black ml-0.5 hidden sm:block" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              {big.genre?.split(',')[0]?.trim() && (
                <span className="bg-brand-red text-white text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded uppercase">{big.genre.split(',')[0].trim()}</span>
              )}
              {big.rating > 0 && (
                <span className="flex items-center gap-0.5 text-brand-gold text-[9px] sm:text-[10px]"><Star size={7} fill="currentColor" /> {big.rating.toFixed(1)}</span>
              )}
            </div>
            <h3 className="text-white text-[13px] sm:text-lg font-bold leading-tight line-clamp-2">{big.title}</h3>
            <div className="hidden sm:flex items-center gap-2 mt-0.5 text-white/40 text-[11px]">
              {big.year && <span>{big.year}</span>}
              {big.vj && <span>VJ {big.vj}</span>}
            </div>
          </div>
        </div>

        {/* Small cards — 2 cols × 2 rows on mobile (4 visible), 4 cols × 2 rows on sm+ (8 visible) */}
        {small.map((movie, idx) => (
          <div
            key={movie.id}
            className={`relative rounded-xl overflow-hidden cursor-pointer group bg-[#1a1a1e]${idx >= 4 ? ' hidden sm:block' : ''}`}
            onClick={() => navigate(movieDetailPath(movie))}
          >
            <div className="h-full">
              <img
                src={getImageUrl(movie.thumbnail_url)}
                alt={movie.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                <Play size={12} fill="black" className="text-black ml-0.5 sm:hidden" />
                <Play size={14} fill="black" className="text-black ml-0.5 hidden sm:block" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2">
              <p className="text-white text-[10px] sm:text-[11px] font-semibold leading-tight line-clamp-1">{movie.title}</p>
              <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 text-[9px] sm:text-[10px]">
                {movie.rating > 0 && <span className="text-brand-gold flex items-center gap-0.5"><Star size={6} fill="currentColor" />{movie.rating.toFixed(1)}</span>}
                {movie.year && <span className="text-white/40">{movie.year}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   LAYOUT 3: FEATURED GRID — 2x3 large cards
   ═══════════════════════════════════════════════ */
const FeaturedGridSection: React.FC<{
  section: ManifestSection;
}> = ({ section }) => {
  const navigate = useNavigate();
  if (!section.items || section.items.length < 3) return null;
  const cards = section.items.slice(0, 6);
  const link = seeAllLink(section);

  return (
    <section className="mb-14 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-[15px] sm:text-base font-semibold font-heading">{section.title}</h2>
        {link && <Link to={link} className="no-underline text-white/40 text-[12px] hover:text-white/70 transition-colors">See all</Link>}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {cards.map(movie => (
          <div
            key={movie.id}
            className="relative rounded-lg sm:rounded-xl overflow-hidden cursor-pointer group bg-[#1a1a1e]"
            onClick={() => navigate(movieDetailPath(movie))}
          >
            <div className="aspect-[2/3]">
              <img
                src={getImageUrl(movie.thumbnail_url)}
                alt={movie.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                <Play size={18} fill="black" className="text-black ml-0.5" />
              </div>
            </div>
            {movie.is_premium === 'Yes' && (
              <span className="absolute top-2 left-2 bg-brand-gold text-black text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Premium</span>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-white text-[12px] font-semibold leading-tight line-clamp-1">{movie.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                {movie.rating > 0 && <span className="text-brand-gold flex items-center gap-0.5"><Star size={7} fill="currentColor" />{movie.rating.toFixed(1)}</span>}
                {movie.year && <span className="text-white/40">{movie.year}</span>}
                {movie.genre?.split(',')[0]?.trim() && <span className="text-white/30">{movie.genre.split(',')[0].trim()}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   LAYOUT 4: NUMBERED STRIP — Top 10 style
   ═══════════════════════════════════════════════ */
const NumberedStrip: React.FC<{
  title: string;
  items: ManifestMovie[];
}> = ({ title, items }) => {
  const navigate = useNavigate();
  if (items.length === 0) return null;
  const top = items.slice(0, 10);

  return (
    <section className="mb-14">
      <div className="flex items-center gap-2 mb-3.5 px-4 sm:px-6 lg:px-8">
        <h2 className="text-white text-[15px] sm:text-base font-semibold font-heading">{title}</h2>
      </div>
      <div
        className="flex gap-2 sm:gap-3 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {top.map((movie, i) => (
          <div
            key={movie.id}
            className="relative flex-shrink-0 flex items-end cursor-pointer group"
            onClick={() => navigate(movieDetailPath(movie))}
          >
            {/* Big number */}
            <span
              className="text-[60px] sm:text-[88px] font-black leading-none select-none text-transparent mr-[-10px] sm:mr-[-12px] z-10 relative"
              style={{ WebkitTextStroke: '2px rgba(255,255,255,0.15)' }}
            >
              {i + 1}
            </span>
            {/* Poster */}
            <div className="relative w-20 sm:w-28 aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden bg-[#1a1a1e] flex-shrink-0">
              <img
                src={getImageUrl(movie.thumbnail_url)}
                alt={movie.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
                  <Play size={14} fill="black" className="text-black ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   CONTINUE WATCHING — landscape cards + progress
   ═══════════════════════════════════════════════ */
const ContinueWatchingRow: React.FC<{
  items: ManifestMovie[];
}> = ({ items }) => {
  const navigate = useNavigate();
  if (items.length === 0) return null;

  return (
    <section className="mb-14">
      <div className="flex items-center gap-2 mb-3.5 px-4 sm:px-6 lg:px-8">
        <h2 className="text-white text-[15px] sm:text-base font-semibold font-heading">Continue Watching</h2>
      </div>
      <div
        className="flex gap-2 sm:gap-3 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map(movie => {
          const progress = movie.progress ?? 0;
          return (
            <div
              key={movie.id}
              className="relative flex-shrink-0 w-40 sm:w-52 cursor-pointer group"
              onClick={() => navigate(movieDetailPath(movie))}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1a1a1e]">
                <img
                  src={getImageUrl(movie.thumbnail_url)}
                  alt={movie.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <Play size={16} fill="black" className="text-black ml-0.5" />
                  </div>
                </div>
                {progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/15">
                    <div className="h-full bg-brand-red rounded-r-full" style={{ width: `${Math.min(progress * 100, 100)}%` }} />
                  </div>
                )}
              </div>
              <p className="text-white/70 text-[11px] font-medium leading-tight line-clamp-1 mt-1.5 px-0.5">{movie.title}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SUBSCRIPTION CTA
   ═══════════════════════════════════════════════ */
const premiumFeatures = [
  { icon: Film, label: 'All Movies & Series' },
  { icon: Tv, label: 'Live TV Channels' },
  { icon: Zap, label: 'No Ads, HD Quality' },
  { icon: Sparkles, label: 'Early Access' },
];

const SubscriptionCTA: React.FC<{
  isAuthenticated: boolean;
  subscription?: { has_active_subscription: boolean; days_remaining: number };
}> = ({ isAuthenticated, subscription }) => {
  if (subscription?.has_active_subscription) return null;

  const heading = isAuthenticated ? 'Upgrade to Premium' : 'Start Watching Today';
  const subtext = isAuthenticated
    ? 'Get unlimited access to everything — no interruptions.'
    : 'Create a free account and explore. Subscribe to unlock everything.';
  const cta = isAuthenticated ? 'View Plans' : 'Get Started Free';
  const ctaLink = isAuthenticated ? '/subscription/plans' : '/auth/register';

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 mb-12">
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #261a08 0%, #351910 40%, #291025 100%)',
          border: '1px solid rgba(212,160,23,0.18)',
          boxShadow: '0 0 40px rgba(212,160,23,0.08), 0 2px 16px rgba(0,0,0,0.5)',
        }}
      >
        {/* Gold accent glow — top-right */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full" style={{ background: 'radial-gradient(circle, rgba(218,165,32,0.3) 0%, transparent 70%)' }} />
        {/* Bottom-left subtle glow */}
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(218,165,32,0.12) 0%, transparent 70%)' }} />
        {/* Top gold border accent */}
        <div className="absolute top-0 inset-x-0 h-[1.5px]" style={{ background: 'linear-gradient(90deg, transparent 5%, #d4a017 50%, transparent 95%)' }} />

        <div className="relative px-4 sm:px-5 py-4 sm:py-4">
          {/* Header + CTA — stacked on mobile, side-by-side on sm+ */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f0c040, #d4a017)', boxShadow: '0 2px 10px rgba(212,160,23,0.4)' }}
              >
                <Crown size={17} className="text-black" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-[14px] sm:text-[15px] font-heading leading-tight mb-0">{heading}</p>
                <p className="text-white/50 text-[11px] sm:text-[12px] leading-snug mt-0.5 mb-0 line-clamp-2 sm:truncate">{subtext}</p>
              </div>
            </div>
            <Link
              to={ctaLink}
              className="no-underline inline-flex items-center justify-center sm:justify-start gap-1.5 font-bold px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg text-[13px] sm:text-[13px] transition-all duration-200 flex-shrink-0 active:scale-[0.97] text-black whitespace-nowrap w-full sm:w-auto"
              style={{ background: 'linear-gradient(135deg, #f0c040, #d4a017)', boxShadow: '0 2px 12px rgba(212,160,23,0.35)' }}
            >
              {cta} <ChevronRight size={14} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Feature chips — compact row */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
            {premiumFeatures.map(f => (
              <div
                key={f.label}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5"
                style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.18)' }}
              >
                <f.icon size={12} className="text-[#f0c040] flex-shrink-0" />
                <span className="text-white/70 text-[10px] sm:text-[11px] font-medium leading-none whitespace-nowrap">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
const StreamingHomePage: React.FC = () => {
  const { data: manifest, isLoading, isError } = useGetManifestQuery();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-red-400 text-[15px] font-semibold mb-1">Failed to load content</p>
        <p className="text-white/30 text-[13px]">Please check your connection and try again.</p>
      </div>
    );
  }

  const sections = manifest?.sections ?? [];

  // Guest landing — no data when unauthenticated
  if (!isLoading && !manifest?.featured && sections.length === 0 && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0c]">
        <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c] via-brand-red/5 to-[#0a0a0c]" />
          <div className="relative z-10 text-center px-6 max-w-lg">
            <h1 className="text-white text-3xl sm:text-5xl font-bold font-heading mb-4 leading-tight">
              Ugandan Movies &amp; Series
            </h1>
            <p className="text-white/50 text-[14px] sm:text-[15px] leading-relaxed mb-8 max-w-md mx-auto">
              Stream the latest Ugandan, Luganda-translated, and African movies. Sign in to start watching.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/auth/login"
                className="no-underline inline-flex items-center justify-center gap-2 bg-white text-black font-semibold px-8 py-3.5 rounded-full text-[14px] hover:bg-white/90 transition-all active:scale-95 shadow-2xl shadow-white/10"
              >
                <Play size={16} fill="currentColor" /> Sign In to Watch
              </Link>
              <Link
                to="/auth/register"
                className="no-underline inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md text-white font-medium px-8 py-3.5 rounded-full text-[14px] hover:bg-white/20 transition-all border border-white/15 active:scale-95"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const continueWatching = sections.find(s => s.key === 'continue_watching');
  const latest = sections.find(s => s.key === 'latest');
  const trending = sections.find(s => s.key === 'trending');
  const popular = sections.find(s => s.key === 'popular');
  const series = sections.find(s => s.key === 'series');
  const topRated = sections.find(s => s.key === 'top_rated');
  const forYou = sections.find(s => s.key === 'for_you');
  const hiddenGems = sections.find(s => s.key === 'hidden_gems');
  const newThisWeek = sections.find(s => s.key === 'new_this_week');

  // Remaining genre + VJ sections
  const handledKeys = new Set([
    'continue_watching', 'latest', 'trending', 'popular', 'series',
    'top_rated', 'for_you', 'hidden_gems', 'new_this_week',
  ]);
  const otherSections = sections.filter(s => !handledKeys.has(s.key) && s.items?.length > 0);

  // Collect fallback movies with video URLs from trending/popular/latest sections
  const heroFallbacks = React.useMemo(() => {
    const candidates: ManifestMovie[] = [];
    for (const s of [trending, popular, latest, ...(otherSections || [])]) {
      if (!s?.items) continue;
      for (const m of s.items) {
        if (m.url && m.url !== '' && m.id !== manifest?.featured?.id) {
          candidates.push(m);
          if (candidates.length >= 5) break;
        }
      }
      if (candidates.length >= 5) break;
    }
    return candidates;
  }, [trending, popular, latest, otherSections, manifest?.featured?.id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c]">
        <HeroBanner isLoading />
        <div className="pt-6">
          {[1, 2, 3].map(i => <ContentRow key={i} title="" isLoading />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <HeroBanner movie={manifest?.featured} fallbackMovies={heroFallbacks} isLoading={false} />

      <div className="pt-10 sm:pt-14 pb-16 lg:pb-0">
        {/* Continue Watching */}
        {isAuthenticated && continueWatching && continueWatching.items.length > 0 && (
          <ContinueWatchingRow items={continueWatching.items} />
        )}

        {/* LAYOUT 1: Standard row — Latest */}
        {latest && latest.items.length > 0 && (
          <ContentRow title={latest.title} items={latest.items} seeAllLink={seeAllLink(latest)} />
        )}

        {/* LAYOUT 2: Spotlight — Trending (big + small grid) */}
        {trending && trending.items.length >= 2 && (
          <SpotlightSection section={trending} />
        )}

        {/* LAYOUT 4: Numbered strip — Popular Top 10 */}
        {popular && popular.items.length > 0 && (
          <NumberedStrip title="Top 10 Today" items={popular.items} />
        )}

        {/* Subscription CTA */}
        <SubscriptionCTA isAuthenticated={isAuthenticated} subscription={manifest?.subscription} />

        {/* LAYOUT 3: Featured Grid — Series */}
        {series && series.items.length >= 3 && (
          <FeaturedGridSection section={series} />
        )}

        {/* Standard row — New This Week */}
        {newThisWeek && newThisWeek.items.length > 0 && (
          <ContentRow title={newThisWeek.title} items={newThisWeek.items} seeAllLink={seeAllLink(newThisWeek)} />
        )}

        {/* Spotlight — Top Rated */}
        {topRated && topRated.items.length >= 2 && (
          <SpotlightSection section={topRated} />
        )}

        {/* Standard row — For You (authenticated only) */}
        {isAuthenticated && forYou && forYou.items.length > 0 && (
          <ContentRow title={forYou.title} items={forYou.items} />
        )}

        {/* Featured Grid — Hidden Gems */}
        {hiddenGems && hiddenGems.items.length >= 3 && (
          <FeaturedGridSection section={hiddenGems} />
        )}

        {/* Genre + VJ rows — alternate between standard row and spotlight */}
        {otherSections.map((section, i) =>
          i % 3 === 1 && section.items.length >= 2 ? (
            <SpotlightSection key={section.key} section={section} />
          ) : i % 3 === 2 && section.items.length >= 3 ? (
            <FeaturedGridSection key={section.key} section={section} />
          ) : (
            <ContentRow key={section.key} title={section.title} items={section.items} seeAllLink={seeAllLink(section)} />
          )
        )}
      </div>
    </div>
  );
};

export default StreamingHomePage;
