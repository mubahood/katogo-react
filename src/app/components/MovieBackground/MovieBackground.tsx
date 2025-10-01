// src/app/components/MovieBackground/MovieBackground.tsx
import React, { useEffect, useState, useRef } from "react";
import { http_get } from "../../services/Api";
import { APP_CONFIG } from "../../constants";

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

interface MovieBackgroundProps {
  className?: string;
  showOverlay?: boolean;
  overlayOpacity?: number;
  showMovieInfo?: boolean;
  muted?: boolean;
  showControls?: boolean;
}

const MovieBackground: React.FC<MovieBackgroundProps> = ({
  className = "",
  showOverlay = true,
  overlayOpacity = 0.7,
  showMovieInfo = false,
  muted = true,
  showControls = false,
}) => {
  const [movie, setMovie] = useState<RandomMovie | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch random movie for background
  useEffect(() => {
    const fetchRandomMovie = async () => {
      try {
        const response = await http_get('random-movie');
        if (response.code === 1 && response.data) {
          console.log('✅ Auth movie loaded:', response.data);
          setMovie(response.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('❌ Failed to fetch random movie:', error);
        // Set fallback content if API fails
        setMovie({
          id: 0,
          title: `${APP_CONFIG.NAME}`,
          description: "Uganda's premier streaming platform for movies and entertainment.",
          video_url: "",
          genre: "Entertainment",
          type: "Platform",
          year: new Date().getFullYear().toString()
        });
      }
    };

    fetchRandomMovie();
  }, []);

  const handleVideoLoad = () => {
    if (videoRef.current) {
      // Start video at 10% of its total length for more engaging content
      const startTime = videoRef.current.duration * 0.1;
      videoRef.current.currentTime = startTime;
      
      // Ensure video plays automatically
      videoRef.current.play().catch(console.error);
    }
    setVideoLoaded(true);
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const thirtyPercentMark = duration * 0.3;
      
      // If video goes beyond 30% of total length, loop back to 10%
      if (currentTime >= thirtyPercentMark) {
        videoRef.current.currentTime = duration * 0.1;
      }
    }
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  // Ensure video autoplays when loaded
  useEffect(() => {
    if (movie?.video_url && videoRef.current && videoLoaded) {
      const playVideo = async () => {
        try {
          await videoRef.current?.play();
        } catch (error) {
          console.log('Autoplay prevented by browser:', error);
        }
      };
      playVideo();
    }
  }, [movie, videoLoaded]);

  return (
    <div className={`movie-background-container ${className}`}>
      {/* Video Background */}
      {movie?.video_url && !videoError && (
        <video
          ref={videoRef}
          className="movie-background-video"
          autoPlay
          muted={isMuted}
          loop
          playsInline
          onLoadedData={handleVideoLoad}
          onTimeUpdate={handleVideoTimeUpdate}
          onError={handleVideoError}
        >
          <source src={movie.video_url} type="video/mp4" />
        </video>
      )}

      {/* Fallback Background Image */}
      {(!movie?.video_url || videoError) && (
        <div
          className="movie-background-fallback"
          style={{
            backgroundImage: movie?.image_url || movie?.thumbnail_url
              ? `url(${movie.image_url || movie.thumbnail_url})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        />
      )}

      {/* Overlay */}
      {showOverlay && (
        <div
          className="movie-background-overlay"
          style={{
            background: `linear-gradient(rgba(0,0,0,${overlayOpacity * 0.6}), rgba(0,0,0,${overlayOpacity}))`
          }}
        />
      )}

      {/* Volume Control - Always visible when video is available */}
      {movie?.video_url && !videoError && (
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="movie-background-volume-control visible"
          title={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      )}

      {/* Movie Info Overlay */}
      {showMovieInfo && movie && (
        <div className="movie-background-info">
          <div className="movie-badge">
            {movie.type} • {movie.year} • {movie.genre}
          </div>
          <h3 className="movie-title">{movie.title}</h3>
          {movie.description && (
            <p 
              className="movie-description"
              dangerouslySetInnerHTML={{
                __html: movie.description.length > 120 
                  ? movie.description.substring(0, 120).trim() + '...'
                  : movie.description
              }}
            />
          )}
        </div>
      )}

      {/* Loading Indicator */}
      {movie?.video_url && !videoLoaded && !videoError && (
        <div className="movie-background-loading">
          <div className="loading-spinner"></div>
          <span>Loading movie...</span>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .movie-background-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #000;
        }
        
        .movie-background-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 1;
          opacity: ${videoLoaded ? 1 : 0};
          transition: opacity 1s ease-in-out;
        }
        
        .movie-background-fallback {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 1;
        }
        
        .movie-background-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          transition: background 0.5s ease;
        }
        
        .movie-background-volume-control {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          z-index: 10;
          background: rgba(0,0,0,0.7);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          color: white;
          font-size: 1.1rem;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          opacity: 1;
          transform: scale(1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .movie-background-volume-control:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.6);
          transform: scale(1.1);
        }
        
        .movie-background-info {
          position: absolute;
          bottom: 2rem;
          left: 2rem;
          right: 2rem;
          z-index: 5;
          color: white;
          max-width: 400px;
        }
        
        .movie-badge {
          display: inline-block;
          background: rgba(255,255,255,0.15);
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .movie-title {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          line-height: 1.2;
        }
        
        .movie-description {
          font-size: 0.875rem;
          line-height: 1.4;
          opacity: 0.9;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
          margin: 0;
        }
        
        .movie-background-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 5;
          color: white;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .movie-background-info {
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
          }
          
          .movie-background-volume-control {
            bottom: 0.8rem;
            right: 0.8rem;
            width: 38px;
            height: 38px;
            font-size: 1rem;
          }
          
          .movie-title {
            font-size: 1rem;
          }
          
          .movie-description {
            font-size: 0.8rem;
          }
        }
        
        /* Ultra small mobile */
        @media (max-width: 480px) {
          .movie-background-volume-control {
            bottom: 0.5rem;
            right: 0.5rem;
            width: 32px;
            height: 32px;
            font-size: 0.875rem;
          }
          
          .movie-background-info {
            bottom: 0.5rem;
            left: 0.5rem;
            right: 0.5rem;
          }
          
          .movie-title {
            font-size: 0.875rem;
          }
          
          .movie-description {
            font-size: 0.75rem;
          }
        }
        
        /* High DPI displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .movie-background-video {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        }
      `}</style>
    </div>
  );
};

export default MovieBackground;