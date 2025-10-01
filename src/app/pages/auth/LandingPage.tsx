// src/app/pages/auth/LandingPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import { APP_CONFIG } from "../../constants";
import { SEOHead } from "../../components/seo";
import { http_get } from "../../services/Api";

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

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [movie, setMovie] = useState<RandomMovie | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Remove body padding for landing page and prevent scrolling
  useEffect(() => {
    document.body.style.paddingTop = '0';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    document.body.style.height = '100vh'; // Lock height
    document.body.classList.add('landing-active');
    
    return () => {
      document.body.style.paddingTop = 'calc(56px + 35px + 0px)';
      document.body.style.overflow = 'auto'; // Restore scrolling
      document.body.style.height = 'auto'; // Restore height
      document.body.classList.remove('landing-active');
    };
  }, []);

  // Fetch random movie for background
  useEffect(() => {
    const fetchRandomMovie = async () => {
      try {
        const response = await http_get('random-movie');
        if (response.code === 1 && response.data) {
          console.log('✅ Random movie loaded:', response.data);
          setMovie(response.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('❌ Failed to fetch random movie:', error);
        // Set fallback content if API fails
        setMovie({
          id: 0,
          title: `Welcome to ${APP_CONFIG.NAME}`,
          description: "Uganda's premier streaming platform. Watch thousands of movies and TV shows instantly! Stream the latest releases, classic films, and exclusive content.",
          video_url: "",
          genre: "Entertainment",
          type: "Platform",
          year: new Date().getFullYear().toString()
        });
      }
    };

    fetchRandomMovie();
  }, []);

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

  const landingPageMeta = {
    basic: {
      title: `${APP_CONFIG.NAME} - Stream Movies & TV Shows | Uganda's Premier Streaming Platform`,
      description: `Stream thousands of movies and TV shows on ${APP_CONFIG.NAME}. Watch the latest releases, classic films, and exclusive content. Start your streaming journey today!`,
      keywords: "streaming, movies, TV shows, entertainment, Uganda, UgFlix, online streaming, watch movies, binge watch",
    },
    openGraph: {
      title: `${APP_CONFIG.NAME} - Uganda's Premier Streaming Platform`,
      description: "Stream thousands of movies and TV shows. Watch anywhere, anytime. Start your free trial today!",
      url: window.location.origin,
      image: APP_CONFIG.LOGO,
      type: "website",
      siteName: APP_CONFIG.NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${APP_CONFIG.NAME} - Stream Movies & TV Shows`,
      description: "Uganda's premier streaming platform. Watch thousands of movies and TV shows instantly!",
    },
  };

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

  return (
    <>
      <SEOHead config={landingPageMeta} />
      
      {/* Full-Screen Video Background Landing Page */}
      <div className="video-landing-container">
        {/* Video Background */}
        {movie?.video_url && !videoError && (
          <video
            ref={videoRef}
            className="video-background"
            autoPlay
            muted={isMuted}
            loop
            playsInline
            onLoadedData={handleVideoLoad}
            onTimeUpdate={handleVideoTimeUpdate}
            onError={handleVideoError}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              zIndex: -2,
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 1s ease-in-out'
            }}
          >
            <source src={movie.video_url} type="video/mp4" />
          </video>
        )}

        {/* Fallback Background Image */}
        {(!movie?.video_url || videoError) && (
          <div
            className="fallback-background"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundImage: movie?.image_url || movie?.thumbnail_url
                ? `url(${movie.image_url || movie.thumbnail_url})`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: -2
            }}
          />
        )}

        {/* Dark Overlay */}
        <div
          className="video-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7))',
            zIndex: -1
          }}
        />

        {/* Volume Control Button */}
        {movie?.video_url && !videoError && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              zIndex: 100,
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              color: 'white',
              fontSize: '1.25rem',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              opacity: showControls || isMuted ? 1 : 0.7,
              transform: showControls ? 'scale(1.1)' : 'scale(1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            title={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        )}

        {/* Header */}
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
            padding: '1rem 0',
            transition: 'all 0.3s ease'
          }}
        >
          <Container>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <img 
                  src={APP_CONFIG.LOGO}
                  alt={APP_CONFIG.NAME}
                  style={{ 
                    height: '40px',
                    marginRight: '1rem',
                    filter: 'brightness(1.2)'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const textLogo = e.currentTarget.nextElementSibling as HTMLElement;
                    if (textLogo) textLogo.style.display = 'inline';
                  }}
                />
                <h1 
                  style={{
                    display: 'none',
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    margin: 0,
                    background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {APP_CONFIG.NAME}
                </h1>
              </div>
              
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => navigate('/auth/login')}
                style={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
              >
                Sign In
              </Button>
            </div>
          </Container>
        </header>

        {/* Main Content */}
        <main
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            width: '100vw',
            position: 'relative',
            zIndex: 50,
            padding: '2rem 1rem'
          }}
        >
          <Container>
            <div
              className="text-center"
              style={{
                maxWidth: '800px',
                margin: '0 auto',
                color: 'white'
              }}
            >
              {/* Movie Badge */}
              {movie?.type && (
                <div
                  className="movie-badge"
                  style={{
                    display: 'inline-block',
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '25px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '1.5rem',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {movie.type} • {movie.year} • {movie.genre}
                </div>
              )}

              {/* Main Title */}
              <h1
                className="fade-in-up"
                style={{
                  fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                  fontWeight: 'bold',
                  lineHeight: '1.1',
                  marginBottom: '1.5rem',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animationDelay: '0.3s'
                }}
              >
                {movie?.title || `Welcome to ${APP_CONFIG.NAME}`}
              </h1>

              {/* Description */}
              <div
                className="fade-in-up"
                style={{
                  fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                  lineHeight: '1.6',
                  marginBottom: '3rem',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  opacity: 0.95,
                  maxWidth: '600px',
                  margin: '0 auto 3rem',
                  animationDelay: '0.6s'
                }}
                dangerouslySetInnerHTML={{
                  __html: movie?.description
                    ? (movie.description.length > 150 
                        ? movie.description.substring(0, 150).trim() + '...'
                        : movie.description
                      )
                    : "Uganda's premier streaming platform. <strong>Watch thousands of movies and TV shows</strong> instantly!"
                }}
              />

              {/* Action Buttons */}
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center fade-in-up" style={{animationDelay: '0.9s'}}>
                <Button
                  size="lg"
                  className="pulse-hover"
                  onClick={() => navigate('/auth/register')}
                  style={{
                    background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                    border: 'none',
                    padding: '1rem 2.5rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    borderRadius: '50px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: '0 8px 32px rgba(255,107,107,0.4)',
                    transition: 'all 0.3s ease',
                    minWidth: '200px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(255,107,107,0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,107,107,0.4)';
                  }}
                >
                  ▶ Start Streaming
                </Button>

                <Button
                  variant="outline-light"
                  size="lg"
                  className="pulse-hover"
                  onClick={() => navigate('/auth/login')}
                  style={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    padding: '1rem 2.5rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    borderRadius: '50px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    transition: 'all 0.3s ease',
                    minWidth: '200px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Sign In
                </Button>
              </div>

              {/* Movie Info */}
              {movie && (movie.actor || movie.rating) && (
                <div
                  className="fade-in-up"
                  style={{
                    marginTop: '3rem',
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '15px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.9rem',
                    opacity: 0.8,
                    animationDelay: '1.2s'
                  }}
                >
                  {movie.actor && <div>Starring: {movie.actor}</div>}
                  {movie.rating && <div>Rating: {movie.rating}/10</div>}
                </div>
              )}
            </div>
          </Container>
        </main>

        {/* Loading Indicator for Video */}
        {movie?.video_url && !videoLoaded && !videoError && (
          <div
            className="loading-indicator"
            style={{
              position: 'fixed',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontSize: '0.875rem',
              opacity: 0.7,
              zIndex: 50,
              textAlign: 'center',
              background: 'rgba(0,0,0,0.3)',
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              backdropFilter: 'blur(10px)'
            }}
          >
            Loading movie...
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        .video-landing-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #000;
        }
        
        .video-background {
          width: 100vw;
          height: 100vh;
          object-fit: cover;
        }
        
        /* Ensure no scrolling */
        body.landing-active {
          overflow: hidden !important;
          height: 100vh !important;
        }
        
        /* Fade in animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out both;
        }
        
        .slide-in-left {
          animation: slideInLeft 0.6s ease-out both;
        }
        
        .slide-in-right {
          animation: slideInRight 0.6s ease-out both;
        }
        
        .pulse-hover:hover {
          animation: pulse 0.6s ease-in-out;
        }
        
        /* Button hover effects */
        .video-landing-container .btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .video-landing-container .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.3);
        }
        
        .video-landing-container .btn:active {
          transform: translateY(-1px);
        }
        
        /* Movie badge animation */
        .video-landing-container .movie-badge {
          animation: fadeInUp 0.6s ease-out both;
          animation-delay: 0.2s;
        }
        
        /* Video overlay smooth transition */
        .video-overlay {
          transition: background 0.5s ease-in-out;
        }
        
        /* Header slide down */
        .video-landing-container header {
          animation: slideInDown 0.8s ease-out both;
        }
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Loading indicator animation */
        @keyframes loadingPulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        
        .loading-indicator {
          animation: loadingPulse 1.5s ease-in-out infinite;
        }
        
        /* Mobile optimizations */
        @media (max-width: 576px) {
          .video-landing-container main {
            padding: 1rem 0.5rem;
          }
          
          .video-landing-container .d-flex.gap-3 {
            flex-direction: column !important;
            gap: 1rem !important;
          }
          
          .video-landing-container h1 {
            font-size: clamp(1.75rem, 8vw, 2.5rem) !important;
          }
          
          .video-landing-container .fade-in-up {
            font-size: clamp(0.9rem, 3.5vw, 1.1rem) !important;
          }
          
          /* Volume button mobile positioning */
          .video-landing-container button[title*='video'] {
            bottom: 1rem !important;
            right: 1rem !important;
            width: 45px !important;
            height: 45px !important;
            font-size: 1.1rem !important;
          }
        }
        
        /* Tablet optimizations */
        @media (max-width: 768px) {
          .video-landing-container header {
            padding: 0.75rem 0;
          }
          
          .video-landing-container header img {
            height: 32px !important;
          }
        }
        
        /* High DPI displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .video-background {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        }
        
        /* Landscape mobile fixes */
        @media (max-height: 500px) and (orientation: landscape) {
          .video-landing-container main {
            padding: 0.5rem;
          }
          
          .video-landing-container h1 {
            font-size: clamp(1.25rem, 5vw, 2rem) !important;
            margin-bottom: 0.5rem !important;
          }
          
          .video-landing-container .fade-in-up {
            font-size: clamp(0.8rem, 2.5vw, 1rem) !important;
            margin-bottom: 1.5rem !important;
          }
          
          .video-landing-container .btn {
            padding: 0.5rem 1.5rem !important;
            font-size: 0.875rem !important;
          }
          
          .video-landing-container button[title*='video'] {
            bottom: 0.5rem !important;
            right: 0.5rem !important;
            width: 40px !important;
            height: 40px !important;
          }
        }
        
        /* Smooth scrolling for future use */
        html {
          scroll-behavior: smooth;
        }
        
        /* Focus states for accessibility */
        .video-landing-container button:focus,
        .video-landing-container .btn:focus {
          outline: 2px solid rgba(255,255,255,0.8);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
};

export default LandingPage;