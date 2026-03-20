import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Play, Volume2, VolumeX } from 'lucide-react';
import { APP_CONFIG } from '../../constants';
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
  video_url: '',
  type: 'Featured',
  year: new Date().getFullYear().toString(),
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [movie, setMovie] = useState<RandomMovie>(fallbackMovie);
  const [isFetchingMovie, setIsFetchingMovie] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    document.body.style.paddingTop = '0';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('landing-active');

    return () => {
      document.body.style.paddingTop = 'calc(56px + 35px + 0px)';
      document.body.style.overflow = 'auto';
      document.body.classList.remove('landing-active');
    };
  }, []);

  useEffect(() => {
    const fetchRandomMovie = async () => {
      try {
        const response = await http_get('random-movie');
        if (response.code === 1 && response.data) {
          setMovie({
            ...fallbackMovie,
            ...response.data,
            title: response.data.title || fallbackMovie.title,
            video_url: response.data.video_url || '',
          });
          setVideoError(false);
          setVideoReady(false);
          setIsPlaybackActive(false);
          return;
        }
      } catch (error) {
        console.error('Failed to fetch random movie:', error);
      } finally {
        setIsFetchingMovie(false);
      }

      setMovie(fallbackMovie);
    };

    fetchRandomMovie();
  }, []);

  const playPreview = async (withSound: boolean) => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    video.defaultMuted = !withSound;
    video.muted = !withSound;
    video.volume = withSound ? 1 : 0;
    setIsMuted(!withSound);

    try {
      await video.play();
    } catch {
      // Unmuted autoplay can still be blocked until the user interacts.
    }
  };

  const ensureAudiblePlayback = async () => {
    await playPreview(true);
  };

  const handleLoadedData = async () => {
    const video = videoRef.current;
    if (!video) {
      setVideoReady(true);
      return;
    }

    if (Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = video.duration * 0.08;
    }

    setVideoReady(true);
    await playPreview(false);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

    const startPoint = video.duration * 0.08;
    const endPoint = video.duration * 0.3;
    if (video.currentTime >= endPoint) {
      video.currentTime = startPoint;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    video.volume = nextMuted ? 0 : 1;
    setIsMuted(nextMuted);

    if (!nextMuted) {
      video.play().catch(() => undefined);
    }
  };

  const showLoader = isFetchingMovie || (!!movie.video_url && !videoError && (!videoReady || !isPlaybackActive));

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
        {movie.video_url && !videoError ? (
          <video
            ref={videoRef}
            className="landing-video"
            autoPlay
            muted={isMuted}
            playsInline
            preload="metadata"
            onLoadedData={handleLoadedData}
            onPlay={() => setIsPlaybackActive(true)}
            onPlaying={() => setIsPlaybackActive(true)}
            onPause={() => setIsPlaybackActive(false)}
            onWaiting={() => setIsPlaybackActive(false)}
            onStalled={() => setIsPlaybackActive(false)}
            onTimeUpdate={handleTimeUpdate}
            onError={() => {
              setVideoError(true);
              setVideoReady(true);
              setIsPlaybackActive(false);
            }}
          >
            <source src={movie.video_url} type="video/mp4" />
          </video>
        ) : (
          <div
            className="landing-fallback"
            style={{
              backgroundImage: movie.image_url || movie.thumbnail_url
                ? `url(${movie.image_url || movie.thumbnail_url})`
                : undefined,
            }}
          />
        )}

        <div className="landing-overlay" />

        {showLoader ? (
          <div className="landing-loader" aria-live="polite" aria-label="Loading movie preview">
            <div className="landing-loader-panel">
              <div className="landing-loader-mark" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="landing-loader-copy">
                <strong>Loading preview</strong>
                <span>{movie.title || fallbackMovie.title}</span>
              </div>
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
            <button className="landing-primary-btn" onClick={() => navigate('/auth/register')}>
              <Play size={18} />
              Start watching
            </button>
            <button className="landing-secondary-btn" onClick={() => navigate('/mobile-apps')}>
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
        .landing-fallback {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .landing-fallback {
          background-position: center;
          background-size: cover;
          background-image: linear-gradient(180deg, #121212 0%, #000 100%);
        }

        .landing-overlay {
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