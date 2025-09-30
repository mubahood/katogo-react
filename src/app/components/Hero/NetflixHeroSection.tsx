// src/app/components/Hero/NetflixHeroSection.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Play, Plus, Info, Volume2, VolumeX, RotateCcw } from 'react-feather';
import type { Movie } from '../../services/manifest.service';
import { truncateDescription } from '../../utils';

interface NetflixHeroSectionProps {
  movie: Movie;
  onWatchClick?: (movie: Movie) => void;
  onAddToWatchlist?: (movie: Movie) => void;
  onMoreInfo?: (movie: Movie) => void;
}

const NetflixHeroSection: React.FC<NetflixHeroSectionProps> = ({
  movie,
  onWatchClick,
  onAddToWatchlist,
  onMoreInfo
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // Get mute state from localStorage (default to unmuted)
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem('ugflix_hero_muted');
    return savedMute ? JSON.parse(savedMute) : false; // Default to sound ON
  });

  // Save mute state to localStorage
  const saveMuteState = useCallback((muted: boolean) => {
    localStorage.setItem('ugflix_hero_muted', JSON.stringify(muted));
    setIsMuted(muted);
  }, []);

  // Calculate video start time (10% of duration)
  const handleVideoLoaded = useCallback(() => {
    const video = videoRef.current;
    if (video && video.duration) {
      const startTime = video.duration * 0.1; // Start at 10%
      video.currentTime = startTime;
      video.muted = true; // Always start muted for better autoplay success
      setIsVideoLoaded(true);
      setIsVideoLoading(false);
      
      // Immediate autoplay attempt
      const attemptAutoplay = async () => {
        try {
          await video.play();
          setIsPlaying(true);
          setShowVideo(true);
          video.muted = isMuted; // Apply user's mute preference after successful play
          console.log('🎬 Video autoplay successful');
        } catch (err) {
          console.log('🎬 Autoplay blocked - user interaction required:', err);
          // Use Intersection Observer as fallback
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                  // Try again when hero is more visible
                  video.play().then(() => {
                    setIsPlaying(true);
                    setShowVideo(true);
                    video.muted = isMuted;
                    console.log('🎬 Video started with Intersection Observer');
                  }).catch(() => {
                    console.log('🎬 Still blocked - click to play overlay will appear');
                  });
                  observer.disconnect();
                }
              });
            },
            { threshold: 0.3 }
          );

          const heroElement = video.closest('.ugflix-hero-section');
          if (heroElement) {
            observer.observe(heroElement);
          }
        }
      };

      // Small delay to ensure video is fully ready
      setTimeout(attemptAutoplay, 100);
    }
  }, [isMuted]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => handleVideoLoaded();
    
    const handleCanPlay = () => {
      // Additional autoplay attempt when video can play
      if (!isPlaying && !showVideo) {
        video.play().then(() => {
          setIsPlaying(true);
          setShowVideo(true);
          console.log('🎬 Video autoplay successful on canplay');
        }).catch(() => {
          console.log('🎬 Autoplay still blocked on canplay');
        });
      }
    };
    
    const handleError = () => {
      console.error('Video failed to load');
      setVideoError(true);
      setIsVideoLoading(false);
    };
    const handleEnded = () => {
      // Loop back to 10% when video ends
      if (video.duration) {
        video.currentTime = video.duration * 0.1;
        video.play().catch(() => {
          console.log('Video replay failed - user interaction required');
        });
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
    };
  }, [handleVideoLoaded, isPlaying, showVideo]);

  // Handle scroll to pause video when scrolling past hero section
  useEffect(() => {
    const handleScroll = () => {
      const video = videoRef.current;
      if (!video || !isPlaying) return;

      const heroSection = video.closest('.ugflix-hero-section');
      if (!heroSection) return;

      const rect = heroSection.getBoundingClientRect();
      const isHeroVisible = rect.bottom > 0 && rect.top < window.innerHeight;

      if (!isHeroVisible && isPlaying) {
        video.pause();
        setIsPlaying(false);
        console.log('🎬 Video paused - hero section not visible');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPlaying]);

  // Handle page visibility change (tab/window switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.hidden) {
        if (isPlaying) {
          video.pause();
          setIsPlaying(false);
          console.log('🎬 Video paused - tab hidden');
        }
      } else {
        // Optionally resume when tab becomes visible again
        // Only if user hasn't manually paused
        if (showVideo && !video.paused) {
          video.play().catch(() => {
            console.log('🎬 Video resume failed - user interaction required');
          });
          setIsPlaying(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, showVideo]);

  // Toggle mute and save to localStorage
  const toggleMute = () => {
    if (videoRef.current) {
      const newMuteState = !isMuted;
      videoRef.current.muted = newMuteState;
      saveMuteState(newMuteState);
    }
  };

  // Replay video from 10%
  const replayVideo = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      video.currentTime = video.duration * 0.1;
      video.play().then(() => {
        setIsPlaying(true);
        setShowVideo(true);
      }).catch((err) => {
        console.log('🎬 Video replay failed:', err.message);
      });
    }
  };

  // Handle user click to start video (for autoplay restrictions)
  const handleVideoClick = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isVideoLoaded) return;
    
    if (!showVideo) {
      // Start video if not showing
      video.play().then(() => {
        setIsPlaying(true);
        setShowVideo(true);
        video.muted = isMuted; // Apply user's mute preference
        console.log('🎬 Video started via user interaction');
      }).catch((err) => {
        console.error('🎬 Video play failed:', err);
      });
    } else if (isPlaying) {
      // Pause if already playing
      video.pause();
      setIsPlaying(false);
    } else {
      // Resume if paused
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('🎬 Video resume failed:', err);
      });
    }
  }, [showVideo, isVideoLoaded, isPlaying, isMuted]);

  return (
    <>
      <style>{`
        .ugflix-hero-section {
          position: relative;
          width: 100vw;
          height: 75vh;
          min-height: 500px;
          max-height: 800px;
          margin-left: calc(-50vw + 50%);
          margin-top: 0;
          overflow: hidden;
          background: var(--ugflix-bg-primary);
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .hero-background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: blur(2px) brightness(0.3);
          transform: scale(1.05);
          transition: opacity 0.5s ease-out;
          opacity: 1;
        }

        .hero-background-image.video-loaded {
          opacity: 0;
        }

        .hero-background-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 1.2s ease-in-out;
          z-index: 2;
        }

        .hero-background-video.show {
          opacity: 1;
        }

        .hero-video-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
          color: var(--ugflix-text-muted);
          font-size: 0.9rem;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(10, 10, 10, 0.85) 0%,
            rgba(10, 10, 10, 0.6) 45%,
            rgba(10, 10, 10, 0.2) 80%,
            transparent 100%
          ), linear-gradient(
            to top,
            rgba(10, 10, 10, 0.8) 0%,
            rgba(10, 10, 10, 0.2) 60%,
            transparent 100%
          );
          z-index: 4;
        }

        .hero-content {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          transform: translateY(-50%);
          z-index: 5;
          padding: 0;
        }

        .hero-container-fluid {
          width: 100%;
          max-width: none;
          padding: 0 60px;
          margin: 0 auto;
        }

        @media (max-width: 1400px) {
          .hero-container-fluid {
            padding: 0 40px;
          }
        }

        @media (max-width: 1200px) {
          .hero-container-fluid {
            padding: 0 30px;
          }
        }

        @media (max-width: 768px) {
          .hero-container-fluid {
            padding: 0 20px;
          }
        }

        @media (max-width: 480px) {
          .hero-container-fluid {
            padding: 0 16px;
          }
        }

        .hero-title {
          font-size: clamp(1.8rem, 4vw, 3rem);
          font-weight: 700;
          color: var(--ugflix-text-primary);
          text-shadow: 2px 4px 12px rgba(0, 0, 0, 0.9);
          margin-bottom: 0.8rem;
          line-height: 1.1;
          letter-spacing: -0.01em;
          max-width: 800px;
        }

        .hero-vj {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--ugflix-primary);
          color: var(--ugflix-text-primary);
          padding: 0.3rem 0.8rem;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
          border-radius: 0;
        }

        .hero-description {
          font-size: clamp(0.85rem, 1.2vw, 1rem);
          color: var(--ugflix-text-secondary);
          line-height: 1.4;
          margin-bottom: 1.8rem;
          max-width: 500px;
          text-shadow: 1px 2px 6px rgba(0, 0, 0, 0.8);
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .hero-actions {
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .hero-btn-primary {
          background: var(--ugflix-text-primary);
          color: var(--ugflix-bg-primary);
          border: none;
          padding: 0.7rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: var(--ugflix-transition);
          border-radius: 0;
          min-width: 140px;
          justify-content: center;
          cursor: pointer;
        }

        .hero-btn-primary:hover {
          background: rgba(255, 255, 255, 0.85);
          color: var(--ugflix-bg-primary);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .hero-btn-secondary {
          background: rgba(42, 42, 42, 0.8);
          color: var(--ugflix-text-primary);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.7rem 1.3rem;
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: var(--ugflix-transition);
          border-radius: 0;
          min-width: 120px;
          justify-content: center;
          backdrop-filter: blur(10px);
          cursor: pointer;
        }

        .hero-btn-secondary:hover {
          background: rgba(42, 42, 42, 0.9);
          border-color: rgba(255, 255, 255, 0.4);
          color: var(--ugflix-text-primary);
          transform: translateY(-1px);
        }

        .hero-controls {
          position: absolute;
          bottom: 1.5rem;
          right: 1.5rem;
          display: flex;
          gap: 0.8rem;
          z-index: 6;
        }

        .hero-control-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--ugflix-text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--ugflix-transition);
          backdrop-filter: blur(10px);
          cursor: pointer;
        }

        .hero-control-btn:hover {
          background: rgba(0, 0, 0, 0.85);
          border-color: var(--ugflix-primary);
          color: var(--ugflix-primary);
          transform: scale(1.08);
        }

        .hero-fade-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 120px;
          background: linear-gradient(transparent, var(--ugflix-bg-primary));
          z-index: 3;
        }

        /* Device-responsive heights */
        @media (max-height: 600px) {
          .ugflix-hero-section {
            height: 85vh;
            min-height: 450px;
          }
        }

        @media (max-height: 500px) {
          .ugflix-hero-section {
            height: 90vh;
            min-height: 400px;
          }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .ugflix-hero-section {
            height: 60vh;
            min-height: 400px;
            max-height: 500px;
            margin-top: 0;
          }

          .hero-content {
            padding: 0 20px;
          }

          .hero-title {
            font-size: clamp(1.5rem, 6vw, 2.2rem);
            margin-bottom: 0.6rem;
          }

          .hero-description {
            font-size: 0.85rem;
            margin-bottom: 1.3rem;
            max-width: 100%;
            -webkit-line-clamp: 2;
          }

          .hero-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 0.6rem;
          }

          .hero-btn-primary,
          .hero-btn-secondary {
            width: 100%;
            padding: 0.8rem 1.2rem;
            font-size: 0.9rem;
            min-width: auto;
          }

          .hero-controls {
            bottom: 1rem;
            right: 1rem;
            gap: 0.6rem;
          }

          .hero-control-btn {
            width: 38px;
            height: 38px;
          }

          .hero-vj {
            font-size: 0.7rem;
            padding: 0.25rem 0.6rem;
            margin-bottom: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .ugflix-hero-section {
            height: 55vh;
            min-height: 350px;
            margin-top: 0;
          }

          .hero-title {
            font-size: clamp(1.4rem, 8vw, 2rem);
          }

          .hero-description {
            font-size: 0.8rem;
            line-height: 1.3;
            -webkit-line-clamp: 2;
          }

          .hero-content {
            padding: 0 16px;
          }
        }

        /* Loading states */
        .hero-loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 107, 53, 0.3);
          border-left-color: var(--ugflix-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div className="ugflix-hero-section">
        {/* Background Layer */}
        <div className="hero-background">
          {/* Blurred Image Loader/Fallback */}
          <img
            src={movie.thumbnail_url}
            alt={movie.title}
            className={`hero-background-image ${showVideo ? 'video-loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599808821-cb6b1e5d2ab7?w=1920&h=1080&fit=crop';
            }}
          />

          {/* Video Loading Indicator */}
          {isVideoLoading && movie.url && (
            <div className="hero-video-loading">
              <span className="hero-loading-spinner"></span>
              Loading video...
            </div>
          )}

          {/* Primary Video Background */}
          {movie.url && !videoError && (
            <video
              ref={videoRef}
              className={`hero-background-video ${showVideo ? 'show' : ''}`}
              autoPlay
              muted
              playsInline
              loop
              preload="metadata"
              onClick={handleVideoClick}
              style={{ cursor: 'pointer' }}
            >
              <source src={movie.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {/* Click to play overlay (shown when video is loaded but not playing) */}
          {isVideoLoaded && !showVideo && !videoError && (
            <div 
              onClick={handleVideoClick}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                zIndex: 3
              }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease'
              }}>
                <Play size={32} color="#000" fill="#000" />
              </div>
            </div>
          )}
        </div>

        {/* Overlay Gradient */}
        <div className="hero-overlay" />

        {/* Main Content */}
        <div className="hero-content">
          <div className="hero-container-fluid">
            <Row>
              <Col lg={8} xl={7}>
                {/* VJ Badge */}
                {movie.vj && (
                  <div className="hero-vj">
                    <Play size={12} />
                    <span>{movie.vj}</span>
                  </div>
                )}

                {/* Movie Title */}
                <h1 className="hero-title">{movie.title}</h1>

                {/* Movie Description */}
                <p className="hero-description">
                  {truncateDescription(movie.description, 120) || 'Experience premium entertainment with stunning visuals and compelling storytelling.'}
                </p>

                {/* Action Buttons */}
                <div className="hero-actions">
                  <button
                    className="hero-btn-primary"
                    onClick={() => onWatchClick?.(movie)}
                  >
                    <Play size={16} fill="currentColor" />
                    <span>Play</span>
                  </button>

                  <button
                    className="hero-btn-secondary"
                    onClick={() => onAddToWatchlist?.(movie)}
                  >
                    <Plus size={16} />
                    <span>My List</span>
                  </button>

                  <button
                    className="hero-btn-secondary"
                    onClick={() => onMoreInfo?.(movie)}
                  >
                    <Info size={16} />
                    <span>Info</span>
                  </button>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Video Controls */}
        {(isVideoLoaded || showVideo) && (
          <div className="hero-controls">
            <button
              className="hero-control-btn"
              onClick={replayVideo}
              title="Replay from start"
            >
              <RotateCcw size={16} />
            </button>
            
            <button
              className="hero-control-btn"
              onClick={toggleMute}
              title={isMuted ? 'Turn sound on' : 'Turn sound off'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        )}

        {/* Bottom Fade */}
        <div className="hero-fade-bottom" />
      </div>
    </>
  );
};

export default NetflixHeroSection;