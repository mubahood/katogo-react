import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Play, Volume2, VolumeX } from 'lucide-react';
import { APP_CONFIG } from '../../constants';
import { triggerPwaInstall } from '../../hooks/usePwaInstall';
import { SEOHead } from '../../components/seo';
import { http_get } from '../../services/Api';

interface RandomMovie {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  image_url?: string;
  year?: string;
  rating?: string;
  genre?: string;
  type?: string;
  category?: string;
  actor?: string;
  vj?: string;
}

const fallbackMovie: RandomMovie = {
  id: 0,
  title: 'Featured Luganda Movie',
  description: '',
  video_url: 'https://munotech2.b-cdn.net/masg/masa43/The.Secret.Of.My.Success.%20vj%20tom.mp4',
  type: 'Featured',
  year: new Date().getFullYear().toString(),
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewStartRef = useRef(0);
  const [movie, setMovie] = useState<RandomMovie>(fallbackMovie);
  const [isFetchingMovie, setIsFetchingMovie] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const PREVIEW_DURATION = 180; // 3 minutes

  useEffect(() => {
    document.body.style.paddingTop = '0';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('landing-active');

    return () => {
      document.body.style.paddingTop = '';
      document.body.style.overflow = 'auto';
      document.body.classList.remove('landing-active');
    };
  }, []);

  // Fetch random movie — retry up to 3 times if video fails to load
  const fetchMovie = async () => {
    try {
      const response = await http_get(
        'random-movie',
        { _ts: Date.now() },
        {
          includeUser: false,
          headers: {
            'X-Request-Type': 'player-media',
            'X-Player-Context': 'landing-page-preview',
            'Cache-Control': 'no-cache',
          },
        }
      );
      if (response?.code === 1 && response?.data) {
        const payload = response.data;
        const normalizedVideoUrl =
          payload.video_url ||
          payload.videoUrl ||
          payload.url ||
          payload.file ||
          '';

        if (normalizedVideoUrl) {
          const apiMovie: RandomMovie = {
            ...fallbackMovie,
            ...payload,
            title: payload.title || payload.name || fallbackMovie.title,
            description: payload.description || payload.desc || '',
            video_url: normalizedVideoUrl,
            thumbnail_url: payload.thumbnail_url || payload.thumbnailUrl || payload.image_url || payload.imageUrl,
            image_url: payload.image_url || payload.imageUrl || payload.thumbnail_url || payload.thumbnailUrl,
          };
          return apiMovie;
        }
      }
    } catch {
      // silent
    }
    return null;
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const apiMovie = await fetchMovie();
      if (!cancelled) {
        setVideoError(false);
        setVideoLoaded(false);
        setMovie(apiMovie || fallbackMovie);
        setIsFetchingMovie(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  // Playback — all controlled by JavaScript, no HTML autoPlay/muted
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !movie.video_url) return;

    previewStartRef.current = 0;

    // Mute via JS so browser allows play()
    vid.muted = true;
    vid.volume = 0;

    const onPlaying = () => {
      console.log('[Landing] Video playing —', movie.title);
      setVideoLoaded(true);

      // Seek to 10% to skip intros
      if (Number.isFinite(vid.duration) && vid.duration > 0) {
        vid.currentTime = vid.duration * 0.1;
      }

      // Unmute after short delay
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.muted = false;
          videoRef.current.volume = 0.5;
          setIsMuted(false);
        }
      }, 500);
    };
    vid.addEventListener('playing', onPlaying, { once: true });

    // 3-minute preview enforcement
    const onTimeUpdate = () => {
      if (!Number.isFinite(vid.duration) || vid.duration <= 0) return;
      const startPoint = vid.duration * 0.1;
      if (previewStartRef.current === 0 && vid.currentTime >= startPoint) {
        previewStartRef.current = vid.currentTime;
      }
      if (previewStartRef.current > 0 && (vid.currentTime - previewStartRef.current) >= PREVIEW_DURATION) {
        vid.currentTime = startPoint;
        previewStartRef.current = startPoint;
      }
    };
    vid.addEventListener('timeupdate', onTimeUpdate);

    // Only play() once the browser has enough data (canplay)
    const tryPlay = () => {
      vid.play().catch((err) => {
        console.warn('[Landing] Play blocked:', err.message);
      });
    };

    if (vid.readyState >= 3) {
      tryPlay();
    } else {
      vid.addEventListener('canplay', tryPlay, { once: true });
    }

    return () => {
      vid.removeEventListener('playing', onPlaying);
      vid.removeEventListener('canplay', tryPlay);
      vid.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [movie.video_url]);

  // Video error — just show poster
  const handleVideoError = () => {
    console.warn('[Landing] Video failed:', movie.video_url);
    setVideoError(true);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    video.volume = nextMuted ? 0 : 0.5;
    setIsMuted(nextMuted);

    if (!nextMuted) {
      video.play().catch(() => undefined);
    }
  };

  const ensureAudiblePlayback = async () => {
    if (!videoRef.current) return;
    videoRef.current.muted = false;
    videoRef.current.volume = 0.5;
    setIsMuted(false);
    try { await videoRef.current.play(); } catch {}
  };

  const showLoader = isFetchingMovie || !videoLoaded;

  const landingPageMeta = {
    basic: {
      title: `${APP_CONFIG.NAME} - Watch Luganda Movies`,
      description: `Watch Luganda translated movies and featured releases on ${APP_CONFIG.NAME}.`,
      keywords: 'Luganda movies, Ugandan streaming, Katogo, UgFlix',
    },
    openGraph: {
      title: `${APP_CONFIG.NAME} - Watch Luganda Movies`,
      description: `Watch Luganda translated movies and featured releases on ${APP_CONFIG.NAME}.`,
      url: window.location.origin,
      image: APP_CONFIG.LOGO,
      type: 'website',
      siteName: APP_CONFIG.NAME,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${APP_CONFIG.NAME} - Watch Luganda Movies`,
      description: `Watch Luganda translated movies and featured releases on ${APP_CONFIG.NAME}.`,
    },
  };

  return (
    <>
      <SEOHead config={landingPageMeta} />

      <div className="landing-shell" onClick={ensureAudiblePlayback}>
        {/* Video — render after fetch completes, stays mounted even on error */}
        {!isFetchingMovie && movie.video_url ? (
          <video
            ref={videoRef}
            key={movie.video_url}
            src={movie.video_url}
            className="landing-video"
            muted
            playsInline
            preload="auto"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={handleVideoError}
          />
        ) : null}

        {/* Poster thumbnail — sits ON TOP of video, fades out when playback starts */}
        {(movie.image_url || movie.thumbnail_url) ? (
          <img
            src={movie.image_url || movie.thumbnail_url}
            alt={movie.title || 'Movie preview'}
            className="landing-poster"
            style={{ opacity: videoLoaded ? 0 : 1 }}
          />
        ) : (
          <div
            className="landing-fallback"
            style={{ opacity: videoLoaded ? 0 : 1 }}
          />
        )}

        <div className="landing-overlay" />

        {showLoader ? (
          <div className="absolute inset-0 z-[3] flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-[2.5px] border-white/[0.08]" />
                <div
                  className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-white/80"
                  style={{ animation: 'spin 0.9s linear infinite' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play size={18} fill="white" className="text-white ml-0.5 opacity-40" />
                </div>
              </div>
              <span className="text-white/40 text-[11px] font-medium tracking-widest uppercase">Loading preview</span>
            </div>
          </div>
        ) : null}

        <header className="landing-header">
          <button className="landing-brand" onClick={() => navigate('/landing')}>
            <img src={APP_CONFIG.LOGO} alt={APP_CONFIG.NAME} />
          </button>
        </header>

        <div className="landing-bottom-bar">
          <div className="landing-bottom-copy">
            <span className="landing-eyebrow">Now showing</span>
            <h1>{movie.title || fallbackMovie.title}</h1>
          </div>

          <div className="landing-actions" onClick={(e) => e.stopPropagation()}>
            <button className="landing-primary-btn" onClick={() => navigate('/auth/login')}>
              <Play size={18} />
              Start watching
            </button>
            <button className="landing-secondary-btn" onClick={async (e) => {
              e.stopPropagation();
              const result = await triggerPwaInstall();
              if (result === 'unavailable') navigate('/mobile-apps');
            }}>
              <Download size={18} />
              Install now
            </button>
          </div>
        </div>

        {movie.video_url && !videoError ? (
          <button
            className="landing-volume-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            title={isMuted ? 'Unmute preview' : 'Mute preview'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        ) : null}
      </div>

      <style>{`
        html.landing-active {
          height: 100svh;
          overflow: hidden;
        }

        body.landing-active {
          background: #000;
          overflow: hidden;
          height: 100svh;
          min-height: 100svh;
        }

        .landing-shell {
          position: relative;
          width: 100vw;
          height: 100svh;
          overflow: hidden;
          background: #000;
          color: #fff;
        }

        .landing-video,
        .landing-fallback,
        .landing-overlay {
          position: absolute;
          inset: 0;
        }

        .landing-video,
        .landing-fallback,
        .landing-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .landing-poster {
          position: absolute;
          inset: 0;
          z-index: 1;
          transition: opacity 1s ease;
          pointer-events: none;
        }

        .landing-fallback {
          background-position: center;
          background-size: cover;
          background-image: linear-gradient(180deg, #121212 0%, #000 100%);
        }

        .landing-overlay {
          z-index: 2;
          background:
            linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.28) 35%, rgba(0,0,0,0.72) 100%),
            radial-gradient(circle at bottom left, rgba(229, 9, 20, 0.18), transparent 28%);
        }

        .landing-header,
        .landing-bottom-bar,
        .landing-loader,
        .landing-volume-btn {
          position: relative;
          z-index: 2;
        }

        .landing-loader {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          pointer-events: none;
        }

        .landing-loader-panel {
          display: grid;
          gap: 0.85rem;
          min-width: min(86vw, 320px);
          max-width: 360px;
          padding: 1rem 1.05rem;
          background: rgba(9, 9, 11, 0.58);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 28px 80px rgba(0,0,0,0.32);
          backdrop-filter: blur(16px);
        }

        .landing-loader-mark {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .landing-loader-mark span {
          width: 0.6rem;
          height: 0.6rem;
          border-radius: 999px;
          background: #fff;
          opacity: 0.3;
          animation: landingPulse 1.2s ease-in-out infinite;
        }

        .landing-loader-mark span:nth-child(2) {
          animation-delay: 0.16s;
        }

        .landing-loader-mark span:nth-child(3) {
          animation-delay: 0.32s;
        }

        .landing-loader-copy {
          display: grid;
          gap: 0.2rem;
        }

        .landing-loader-copy strong {
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.01em;
        }

        .landing-loader-copy span {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.7);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .landing-header {
          padding: max(1rem, env(safe-area-inset-top)) 1rem 0;
        }

        .landing-brand {
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
        }

        .landing-brand img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          border-radius: 12px;
          display: block;
        }

        .landing-primary-btn,
        .landing-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          min-height: 46px;
          padding: 0.85rem 1.1rem;
          border: 0;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 700;
          transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease;
        }

        .landing-primary-btn {
          background: #e50914;
          color: #fff;
          box-shadow: 0 12px 30px rgba(229, 9, 20, 0.28);
        }

        .landing-secondary-btn {
          background: rgba(255,255,255,0.08);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(10px);
        }

        .landing-bottom-bar {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1rem max(1rem, env(safe-area-inset-bottom));
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.78) 55%, rgba(0,0,0,0.92) 100%);
        }

        .landing-primary-btn:hover,
        .landing-secondary-btn:hover,
        .landing-volume-btn:hover {
          transform: translateY(-1px);
          opacity: 0.95;
        }

        .landing-bottom-copy {
          display: grid;
          gap: 0.25rem;
          min-width: 0;
          max-width: 420px;
          padding: 0.7rem 0.85rem;
          background: rgba(0,0,0,0.38);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
        }

        .landing-eyebrow {
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
        }

        .landing-bottom-copy h1 {
          margin: 0;
          font-size: clamp(0.9rem, 1.6vw, 1.05rem);
          line-height: 1.3;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .landing-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .landing-volume-btn {
          position: absolute;
          right: max(1rem, env(safe-area-inset-right));
          top: max(1rem, env(safe-area-inset-top));
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(10px);
          color: #fff;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .landing-bottom-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .landing-bottom-copy {
            max-width: none;
          }

          .landing-actions {
            justify-content: stretch;
          }
        }

        @media (max-width: 640px) {
          .landing-bottom-bar {
            padding: 0.9rem 0.9rem max(0.9rem, env(safe-area-inset-bottom));
            gap: 0.75rem;
          }

          .landing-loader {
            align-items: flex-end;
            padding: 1rem 0.9rem 7rem;
          }

          .landing-loader-panel {
            min-width: 100%;
            max-width: none;
          }

          .landing-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .landing-primary-btn,
          .landing-secondary-btn {
            width: 100%;
          }

          .landing-bottom-copy h1 {
            white-space: normal;
            font-size: 0.92rem;
          }
        }

        @keyframes landingPulse {
          0%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }

          50% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
      `}</style>
    </>
  );
};

export default LandingPage;