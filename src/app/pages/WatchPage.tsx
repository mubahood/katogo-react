// src/app/pages/WatchPage.tsx
// Clean, responsive watch/player page — Tailwind-only, V2 API via RTK Query
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Download, Share2, Star, Clock, Users, Play, Flag, ChevronLeft, Loader2, Wrench, CheckCircle2, XCircle } from 'lucide-react';
import ReportContentModal from '../components/moderation/ReportContentModal';
import { CustomVideoPlayer } from '../components/VideoPlayer/CustomVideoPlayer';
import { useGetMovieQuery, useGetRelatedMoviesQuery, useGetSeriesEpisodesQuery } from '../store/api/moviesApi';
import type { MovieV2 } from '../services/v2/MoviesV2Service';
import { ApiService } from '../services/ApiService';
import { http_post } from '../services/Api';
import AnalyticsV2Service from '../services/v2/AnalyticsV2Service';
import MoviesV2Service from '../services/v2/MoviesV2Service';

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = String(Math.floor(seconds % 60)).padStart(2, '0');
  return `${m}:${s}`;
};

/* ─── Action Button ─────────────────────────── */
const ActionBtn: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}> = ({ icon, label, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 ${
      active
        ? 'bg-brand-red/20 text-brand-red border border-brand-red/30'
        : 'bg-white/[0.05] text-white/60 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/80'
    } disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

/* ─── Related Movie Card ────────────────────── */
const RelatedCard: React.FC<{
  movie: MovieV2;
  isNext?: boolean;
  onClick: () => void;
}> = ({ movie, isNext, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex gap-3 p-2 rounded-lg text-left transition-colors group ${
      isNext ? 'bg-brand-red/10 border border-brand-red/20' : 'hover:bg-white/[0.05]'
    }`}
  >
    <div className="relative flex-shrink-0 w-[120px] sm:w-[140px] aspect-video rounded-md overflow-hidden bg-[#1a1a1e]">
      <img
        src={movie.thumbnail_url}
        alt={movie.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
        <Play size={20} fill="white" className="text-white" />
      </div>
      {isNext && (
        <div className="absolute top-1 left-1 bg-brand-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
          UP NEXT
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0 py-0.5">
      <p className="text-white text-[12px] sm:text-[13px] font-medium leading-tight line-clamp-2 mb-1.5">
        {movie.title}
      </p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-white/40">
        {movie.type === 'Series' && movie.episode_number && (
          <span className="text-brand-gold font-medium">Ep {movie.episode_number}</span>
        )}
        {movie.vj && <span>VJ {movie.vj}</span>}
        {movie.rating && (
          <span className="flex items-center gap-0.5 text-brand-gold">
            <Star size={9} fill="currentColor" /> {String(movie.rating)}
          </span>
        )}
        {movie.duration && (
          <span className="flex items-center gap-0.5">
            <Clock size={9} /> {movie.duration}
          </span>
        )}
      </div>
    </div>
  </button>
);

/* ─── Episode Row (series sidebar) ───────────── */
const EpisodeRow: React.FC<{
  episode: MovieV2;
  isCurrent: boolean;
  isNext: boolean;
  onClick: () => void;
}> = ({ episode, isCurrent, isNext, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors group ${
      isCurrent
        ? 'bg-brand-red/15 border border-brand-red/20'
        : isNext
        ? 'bg-white/[0.04] border border-white/[0.06]'
        : 'hover:bg-white/[0.04]'
    }`}
  >
    {/* Episode number badge */}
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${
      isCurrent ? 'bg-brand-red text-white' : 'bg-white/[0.06] text-white/40'
    }`}>
      {episode.episode_number || '?'}
    </div>
    {/* Thumbnail */}
    <div className="relative flex-shrink-0 w-[80px] aspect-video rounded overflow-hidden bg-[#1a1a1e]">
      <img src={episode.thumbnail_url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      {isCurrent && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Play size={14} fill="white" className="text-white" />
        </div>
      )}
      {isNext && !isCurrent && (
        <div className="absolute top-0.5 left-0.5 bg-brand-red text-white text-[7px] font-bold px-1 py-0.5 rounded">
          NEXT
        </div>
      )}
    </div>
    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className={`text-[12px] font-medium leading-tight line-clamp-2 ${isCurrent ? 'text-white' : 'text-white/70'}`}>
        {episode.episode_title || episode.title}
      </p>
      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/30">
        {episode.duration && <span>{episode.duration}</span>}
        {episode.vj && <span>VJ {episode.vj}</span>}
      </div>
    </div>
  </button>
);

/* ═══════════════════════════════════════════════
   WATCH PAGE — V2 API with RTK Query
   ═══════════════════════════════════════════════ */
const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const movieId = Number(id);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── V2 API via RTK Query ─────────────────────
  const {
    data: movie,
    isLoading,
    isError,
    error: fetchError,
  } = useGetMovieQuery(movieId, { skip: !movieId || isNaN(movieId) });

  const { data: relatedMovies = [] } = useGetRelatedMoviesQuery(movieId, {
    skip: !movieId || isNaN(movieId),
  });

  // ─── Series detection: if movie is a series, fetch all episodes ─────
  const isSeries = movie?.type === 'Series';
  const categoryId = movie?.category_id;
  const { data: episodes = [] } = useGetSeriesEpisodesQuery(
    { categoryId: categoryId! },
    { skip: !isSeries || !categoryId },
  );

  // ─── Derived series data ──────────────────────
  const currentEpIndex = isSeries ? episodes.findIndex(ep => ep.id === movieId) : -1;
  const nextEpisode = currentEpIndex >= 0 && currentEpIndex < episodes.length - 1
    ? episodes[currentEpIndex + 1] : null;
  const prevEpisode = currentEpIndex > 0 ? episodes[currentEpIndex - 1] : null;
  const hasNext = isSeries ? !!nextEpisode : relatedMovies.length > 0;
  const hasPrev = isSeries ? !!prevEpisode : false;

  // Group episodes by season for display
  const seasonGroups = React.useMemo(() => {
    if (!episodes.length) return [];
    const map = new Map<number, MovieV2[]>();
    for (const ep of episodes) {
      const s = Number(ep.season_number || 1);
      if (!map.has(s)) map.set(s, []);
      map.get(s)!.push(ep);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [episodes]);
  const hasMultipleSeasons = seasonGroups.length > 1;

  // ─── Local state ──────────────────────────────
  const [shouldAutoPlay, setShouldAutoPlay] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixToast, setFixToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [resumeSeconds, setResumeSeconds] = useState<number | null>(null);
  const [resumeToast, setResumeToast] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // ─── Sync likes count from movie data ─────────
  useEffect(() => {
    if (movie) setLikesCount(movie.likes_count || 0);
  }, [movie]);

  // ─── Fetch user interactions via v1 (has_liked, has_wishlisted) ───
  useEffect(() => {
    if (!movieId || isNaN(movieId)) return;
    ApiService.getMovieById(String(movieId))
      .then((data: any) => {
        if (data?.user_interactions) {
          setLiked(data.user_interactions.has_liked || false);
          setWatchlisted(data.user_interactions.has_wishlisted || false);
        }
      })
      .catch(() => {});
  }, [movieId]);

  // ─── Analytics: play event + resume check ─────
  useEffect(() => {
    if (!movie) return;
    MoviesV2Service.reportPlayback(movie.id);
    AnalyticsV2Service.trackAction({
      external_video_id: movie.id,
      action: 'play',
      video_title: movie.title,
      genre: movie.genre,
    });
    setResumeSeconds(null);
    setResumeToast(false);
    AnalyticsV2Service.getProgress(movie.id).then((prog) => {
      if (prog && prog.progress_seconds > 30) {
        setResumeSeconds(prog.progress_seconds);
        setResumeToast(true);
        setTimeout(() => setResumeToast(false), 4000);
      }
    });
  }, [movie?.id]);

  // ─── V2 progress saving: every 5 seconds ─────
  useEffect(() => {
    if (!movie) return;
    const saveV2 = () => {
      const v = document.querySelector('video') as HTMLVideoElement | null;
      if (v && !v.paused && !v.ended && v.currentTime > 0) {
        AnalyticsV2Service.saveProgress({
          external_video_id: movie.id,
          progress_seconds: Math.floor(v.currentTime),
          duration_seconds: isNaN(v.duration) ? undefined : Math.floor(v.duration),
          video_title: movie.title,
        });
      }
    };
    progressRef.current = setInterval(saveV2, 5_000);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [movie?.id]);

  // ─── Report playback failures ─────────────────
  useEffect(() => {
    if (!movie) return;
    const mid = movie.id;
    const handler = (e: Event) => {
      const v = e.target as HTMLVideoElement;
      http_post('video-playback-failures', {
        movie_id: mid,
        error_message: v.error?.message || 'Unknown playback error',
      }).catch(() => {});
    };
    const v = document.querySelector('video');
    v?.addEventListener('error', handler);
    return () => v?.removeEventListener('error', handler);
  }, [movie?.id]);

  // ─── Keyboard shortcuts ───────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const v = document.querySelector('video') as HTMLVideoElement;
      if (!v) return;
      switch (e.key.toLowerCase()) {
        case ' ': case 'k': e.preventDefault(); v.paused ? v.play() : v.pause(); break;
        case 'arrowleft': case 'j': e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 10); break;
        case 'arrowright': case 'l': e.preventDefault(); v.currentTime = Math.min(v.duration, v.currentTime + 10); break;
        case 'arrowup': e.preventDefault(); v.volume = Math.min(1, v.volume + 0.1); break;
        case 'arrowdown': e.preventDefault(); v.volume = Math.max(0, v.volume - 0.1); break;
        case 'm': e.preventDefault(); v.muted = !v.muted; break;
        case 'f': e.preventDefault(); document.fullscreenElement ? document.exitFullscreen() : v.requestFullscreen(); break;
        case 'n': e.preventDefault(); handleNext(); break;
        case 'p': e.preventDefault(); handlePrev(); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [movie, relatedMovies]);

  // ─── Episode navigation (series-aware) ────────
  const handleNext = useCallback(() => {
    if (isSeries && nextEpisode) {
      setShouldAutoPlay(true); navigate(`/watch/${nextEpisode.id}`); return;
    }
    if (relatedMovies.length) { setShouldAutoPlay(true); navigate(`/watch/${relatedMovies[0].id}`); }
  }, [isSeries, nextEpisode, relatedMovies, navigate]);

  const handlePrev = useCallback(() => {
    if (isSeries && prevEpisode) {
      setShouldAutoPlay(true); navigate(`/watch/${prevEpisode.id}`);
    }
  }, [isSeries, prevEpisode, navigate]);

  // ─── Interaction handlers ─────────────────────
  const handleLike = async () => {
    if (!movie || isLiking) return;
    const pLiked = liked, pCount = likesCount;
    setLiked(!liked);
    setLikesCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
    setIsLiking(true);
    try {
      const res = await ApiService.toggleMovieLike(movie.id);
      setLiked(res.liked);
      setLikesCount(res.likes_count);
    } catch { setLiked(pLiked); setLikesCount(pCount); }
    finally { setIsLiking(false); }
  };

  const handleWatchlist = async () => {
    if (!movie || isWishlisting) return;
    const prev = watchlisted;
    setWatchlisted(!watchlisted);
    setIsWishlisting(true);
    try {
      const res = await ApiService.toggleMovieWishlist(movie.id);
      setWatchlisted(res.wishlisted);
    } catch { setWatchlisted(prev); }
    finally { setIsWishlisting(false); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: movie?.title, text: `Watch "${movie?.title}" on UgFlix`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  const handleDownload = () => {
    if (!movie) return;
    AnalyticsV2Service.recordDownload({ movie_model_id: movie.id, download_type: 'in_app', title: movie.title, genre: movie.genre });
    window.open(movie.url, '_blank');
  };

  const handleFixMovie = async () => {
    if (!movie || isFixing) return;
    setIsFixing(true);
    setFixToast(null);
    try {
      const res = await http_post(`v2/movies/${movie.id}/fix`, { action: 'fix' });
      const resp = (res as any)?.data ?? res;
      if (resp?.code === 1 && resp?.data) {
        const changes = resp.data.changes as string[] | undefined;
        const msg = changes?.length ? `Fixed: ${changes.join(', ')}` : resp.data.message || 'Movie fixed successfully';
        setFixToast({ type: 'success', message: msg });
        if (resp.data.movie) window.location.reload();
      } else {
        setFixToast({ type: 'error', message: resp?.message || 'Fix failed' });
      }
    } catch { setFixToast({ type: 'error', message: 'Network error — could not fix movie' }); }
    finally { setIsFixing(false); setTimeout(() => setFixToast(null), 4000); }
  };

  // ─── Loading state ────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-brand-red animate-spin" />
          <p className="text-white/40 text-[13px]">Loading...</p>
        </div>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────
  if (isError || !movie) {
    const errMsg =
      fetchError && 'data' in fetchError
        ? (fetchError.data as any)?.message
        : 'Movie not found';
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-white text-lg font-semibold mb-2">
            {isError ? 'Error Loading Movie' : 'Movie Not Found'}
          </h2>
          <p className="text-white/40 text-[13px] mb-4">
            {errMsg || "The movie you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/[0.08] text-white text-[13px] rounded-lg hover:bg-white/[0.12] transition-colors"
          >
            <ChevronLeft size={14} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const descShort = movie.description && movie.description.length > 200;

  // ─── Main render ──────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      {/* Share toast */}
      {showShareToast && (
        <div className="fixed top-14 right-4 z-50 flex items-center gap-2.5 bg-brand-red text-white text-[13px] font-medium px-4 py-3 rounded-lg shadow-xl animate-[slideIn_0.3s_ease]">
          <Share2 size={16} />
          Link copied to clipboard!
        </div>
      )}
      {/* Fix toast */}
      {fixToast && (
        <div className={`fixed top-14 right-4 z-50 flex items-center gap-2.5 text-white text-[13px] font-medium px-4 py-3 rounded-lg shadow-xl animate-[slideIn_0.3s_ease] ${
          fixToast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {fixToast.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {fixToast.message}
        </div>
      )}

      {/* Resume toast */}
      {resumeToast && resumeSeconds !== null && (
        <div className="fixed top-14 right-4 z-50 flex items-center gap-2.5 bg-white/10 backdrop-blur-sm text-white text-[13px] font-medium px-4 py-3 rounded-lg shadow-xl animate-[slideIn_0.3s_ease]">
          <Clock size={16} className="text-brand-gold" />
          Resuming from {formatTime(resumeSeconds)}
        </div>
      )}

      {/* ─── Video Player (full width) ─── */}
      <div className="w-full bg-black">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative w-full aspect-video">
            <CustomVideoPlayer
              url={movie.url}
              movieId={movie.id}
              poster={movie.thumbnail_url || movie.image_url}
              autoPlay={shouldAutoPlay}
              startPosition={resumeSeconds ?? undefined}
              onNext={hasNext ? handleNext : undefined}
              onPrevious={hasPrev ? handlePrev : undefined}
              onEnded={hasNext ? handleNext : undefined}
            />
          </div>
        </div>
      </div>

      {/* ─── Content below player ─── */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 pt-4 pb-24 lg:pb-10">

          {/* ── Left: Movie info ── */}
          <div className="flex-1 min-w-0">
            {/* Title + episode badge */}
            <div className="flex items-start gap-2 mb-2">
              {isSeries && movie.episode_number && (
                <span className="flex-shrink-0 mt-0.5 bg-brand-gold/20 text-brand-gold font-semibold px-2 py-0.5 rounded text-[10px]">
                  EP {movie.episode_number}
                </span>
              )}
              <div className="min-w-0">
                <h1 className="text-white text-[15px] sm:text-lg lg:text-xl font-semibold leading-tight">
                  {movie.title}
                </h1>
                {isSeries && movie.series_title && movie.series_title !== movie.title && (
                  <p className="text-white/30 text-[11px] mt-0.5">{movie.series_title}</p>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/40 mb-3">
              {movie.year ? <span>{movie.year}</span> : null}
              {movie.genre ? <span className="bg-white/[0.06] px-2 py-0.5 rounded">{movie.genre}</span> : null}
              {movie.duration ? (
                <span className="flex items-center gap-1"><Clock size={10} /> {movie.duration}</span>
              ) : null}
              {movie.language ? <span>{movie.language}</span> : null}
              <span className="flex items-center gap-1"><Users size={10} /> {formatNumber(movie.views_count)}</span>
              <span className="flex items-center gap-1"><Heart size={10} /> {formatNumber(likesCount)}</span>
            </div>

            {/* VJ / Director / Stars */}
            {(movie.vj || movie.director) && (
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/35 mb-3">
                {movie.vj && <span>VJ: <span className="text-white/55">{movie.vj}</span></span>}
                {movie.director && <span>Director: <span className="text-white/55">{movie.director}</span></span>}
                {movie.stars && <span>Stars: <span className="text-white/55">{movie.stars}</span></span>}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-4">
              <ActionBtn icon={<Heart size={14} fill={liked ? 'currentColor' : 'none'} />} label="Like" active={liked} disabled={isLiking} onClick={handleLike} />
              <ActionBtn icon={<Star size={14} fill={watchlisted ? 'currentColor' : 'none'} />} label="Watchlist" active={watchlisted} disabled={isWishlisting} onClick={handleWatchlist} />
              <ActionBtn icon={<Share2 size={14} />} label="Share" onClick={handleShare} />
              <ActionBtn icon={<Download size={14} />} label="Download" onClick={handleDownload} />
              <ActionBtn icon={isFixing ? <Loader2 size={14} className="animate-spin" /> : <Wrench size={14} />} label={isFixing ? 'Fixing...' : 'Fix'} disabled={isFixing} onClick={handleFixMovie} />
              <ActionBtn icon={<Flag size={14} />} label="Report" onClick={() => setReportModalOpen(true)} />
            </div>

            {/* Description */}
            {movie.description && (
              <div className="mb-4">
                <p className={`text-white/45 text-[12px] sm:text-[13px] leading-relaxed max-w-2xl ${!showFullDesc && descShort ? 'line-clamp-3' : ''}`}>
                  {movie.description}
                </p>
                {descShort && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="text-white/30 text-[11px] mt-1 hover:text-white/50 transition-colors"
                  >
                    {showFullDesc ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}

            {/* Episodes strip (mobile, series only) — from v2/series/{categoryId}/episodes */}
            {isSeries && episodes.length > 1 && (
              <div className="lg:hidden mb-4">
                <h3 className="text-white text-[13px] font-semibold mb-2">
                  Episodes{hasMultipleSeasons ? '' : ` (${episodes.length})`}
                </h3>
                {hasMultipleSeasons ? (
                  // Multiple seasons: show grouped
                  <div className="space-y-3">
                    {seasonGroups.map(([sNum, eps]) => (
                      <div key={sNum}>
                        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wide mb-1.5">Season {sNum}</p>
                        <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-3 px-3 scrollbar-hide">
                          {eps.map(ep => {
                            const isCurrent = ep.id === movie.id;
                            return (
                              <button
                                key={ep.id}
                                onClick={() => { if (!isCurrent) { setShouldAutoPlay(true); navigate(`/watch/${ep.id}`); } }}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                                  isCurrent
                                    ? 'bg-brand-red text-white'
                                    : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/70'
                                }`}
                              >
                                Ep {ep.episode_number}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Single season: flat strip
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide">
                    {episodes.map(ep => {
                      const isCurrent = ep.id === movie.id;
                      return (
                        <button
                          key={ep.id}
                          onClick={() => { if (!isCurrent) { setShouldAutoPlay(true); navigate(`/watch/${ep.id}`); } }}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                            isCurrent
                              ? 'bg-brand-red text-white'
                              : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/70'
                          }`}
                        >
                          Ep {ep.episode_number}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="w-full lg:w-[360px] flex-shrink-0">
            {/* Series: show full episode list from dedicated API */}
            {isSeries && episodes.length > 0 ? (
              <div>
                <h3 className="text-white text-[13px] sm:text-[14px] font-semibold mb-2">
                  Episodes ({episodes.length})
                </h3>
                <div className="flex flex-col gap-0.5 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {hasMultipleSeasons ? (
                    seasonGroups.map(([sNum, eps]) => (
                      <div key={sNum} className="mb-3">
                        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wide px-2 mb-1">Season {sNum}</p>
                        {eps.map(ep => (
                          <EpisodeRow
                            key={ep.id}
                            episode={ep}
                            isCurrent={ep.id === movie.id}
                            isNext={nextEpisode?.id === ep.id}
                            onClick={() => { if (ep.id !== movie.id) { setShouldAutoPlay(true); navigate(`/watch/${ep.id}`); } }}
                          />
                        ))}
                      </div>
                    ))
                  ) : (
                    episodes.map(ep => (
                      <EpisodeRow
                        key={ep.id}
                        episode={ep}
                        isCurrent={ep.id === movie.id}
                        isNext={nextEpisode?.id === ep.id}
                        onClick={() => { if (ep.id !== movie.id) { setShouldAutoPlay(true); navigate(`/watch/${ep.id}`); } }}
                      />))
                  )}
                </div>
                {/* Related movies below episodes for series */}
                {relatedMovies.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-white text-[13px] sm:text-[14px] font-semibold mb-2">You May Also Like</h3>
                    <div className="flex flex-col gap-0.5">
                      {relatedMovies.filter(rm => rm.category_id !== movie.category_id).slice(0, 6).map(rm => (
                        <RelatedCard key={rm.id} movie={rm} onClick={() => { setShouldAutoPlay(true); navigate(`/watch/${rm.id}`); }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Movies: show related
              <div>
                <h3 className="text-white text-[13px] sm:text-[14px] font-semibold mb-2">Related Movies</h3>
                {relatedMovies.length > 0 ? (
                  <div className="flex flex-col gap-0.5 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {relatedMovies.map(rm => (
                      <RelatedCard key={rm.id} movie={rm} onClick={() => { setShouldAutoPlay(true); navigate(`/watch/${rm.id}`); }} />
                    ))}
                  </div>
                ) : (
                  <p className="text-white/25 text-[12px]">No related movies available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report modal */}
      <ReportContentModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        contentType="movie"
        contentId={movie.id}
      />
    </div>
  );
};

export default WatchPage;
