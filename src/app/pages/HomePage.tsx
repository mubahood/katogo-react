// src/app/pages/HomePage.tsx - UgFlix Main Homepage
import React, { useState, useEffect, useCallback } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "../components/seo";
import { manifestService, type Movie } from "../services/manifest.service";
import NetflixHeroSection from "../components/Hero/NetflixHeroSection";
import { ContentSections } from "../components/Movies";
import ToastService from "../services/ToastService";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [topMovie, setTopMovie] = useState<Movie | null>(null);
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Load manifest and extract top movie
  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      console.log('🎬 Loading UgFlix manifest...');
      
      const manifest = await manifestService.getManifest();
      
      if (manifest.code === 1 && manifest.data) {
        // Extract top movie from manifest
        let featuredMovie: Movie | null = null;
        
        // Check for top_movie in data (API returns array)
        if (manifest.data.top_movie && manifest.data.top_movie.length > 0) {
          featuredMovie = manifest.data.top_movie[0];
        }
        // Fallback to first movie from any list
        else if (manifest.data.lists && manifest.data.lists.length > 0) {
          for (const list of manifest.data.lists) {
            if (list.movies && list.movies.length > 0) {
              featuredMovie = list.movies[0];
              break;
            }
          }
        }

        setTopMovie(featuredMovie);
        setManifest(manifest);
        
        // Debug: Log manifest data structure
        console.log('🎬 Full manifest data:', manifest.data);
        console.log('🎬 Top movie:', manifest.data.top_movie?.length || 0);
        console.log('🎬 Lists:', manifest.data.lists?.length || 0);
        console.log('🎬 Genres:', manifest.data.genres?.length || 0);
        
        if (featuredMovie) {
          console.log(`🎬 Loaded featured movie: ${featuredMovie.title}`);
        } else {
          console.warn('🎬 No featured movie found in manifest');
        }
      } else {
        throw new Error(manifest.message || 'Failed to load content');
      }
    } catch (error: any) {
      console.error('❌ Failed to load manifest:', error);
      const errorMessage = error.message || 'Failed to load streaming content. Please try again.';
      setError(errorMessage);
      ToastService.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load content on mount
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Handle movie actions
  const handleWatchMovie = useCallback((movie: Movie) => {
    console.log('▶️ Watch movie:', movie.title);
    navigate(`/watch/${movie.id}`);
    ToastService.success(`Starting ${movie.title}`);
  }, [navigate]);

  const handleAddToWatchlist = useCallback((movie: Movie) => {
    console.log('➕ Add to watchlist:', movie.title);
    navigate('/watchlist');
    ToastService.success(`Added ${movie.title} to your list`);
  }, [navigate]);

  const handleMoreInfo = useCallback((movie: Movie) => {
    console.log('ℹ️ More info:', movie.title);
    navigate(`/movies/${movie.id}`);
  }, [navigate]);

  // Loading state
  if (loading) {
    return (
      <>
        <SEOHead
          config={{
            basic: {
              title: "UgFlix - Loading...",
              description: "Loading your premium streaming experience"
            },
            openGraph: {
              title: "UgFlix - Loading...",
              description: "Loading your premium streaming experience",
              type: "website",
              siteName: "UgFlix",
              locale: "en_US"
            },
            twitter: {
              card: "summary_large_image",
              title: "UgFlix - Loading...",
              description: "Loading your premium streaming experience"
            }
          }}
        />
        <div 
          className="d-flex justify-content-center align-items-center" 
          style={{ 
            height: '100vh', 
            background: 'var(--ugflix-bg-primary)',
            flexDirection: 'column',
            gap: '2rem'
          }}
        >
          <div className="text-center">
            <Spinner 
              animation="border" 
              variant="warning" 
              style={{ 
                width: '4rem', 
                height: '4rem',
                borderColor: 'var(--ugflix-primary)',
                borderRightColor: 'transparent'
              }} 
            />
            <h5 className="mt-3" style={{ color: 'var(--ugflix-text-primary)' }}>
              Loading UgFlix...
            </h5>
            <p style={{ color: 'var(--ugflix-text-muted)' }}>
              Preparing your streaming experience
            </p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <SEOHead
          config={{
            basic: {
              title: "UgFlix - Error",
              description: "Unable to load content"
            },
            openGraph: {
              title: "UgFlix - Error",
              description: "Unable to load content",
              type: "website",
              siteName: "UgFlix",
              locale: "en_US"
            },
            twitter: {
              card: "summary_large_image",
              title: "UgFlix - Error",
              description: "Unable to load content"
            }
          }}
        />
        <div 
          className="d-flex justify-content-center align-items-center" 
          style={{ 
            height: '100vh', 
            background: 'var(--ugflix-bg-primary)',
            padding: '2rem'
          }}
        >
          <Container>
            <Alert variant="danger" className="text-center">
              <Alert.Heading>
                <i className="bi bi-exclamation-triangle me-2"></i>
                Unable to Load Content
              </Alert.Heading>
              <p>{error}</p>
              <hr />
              <button 
                className="btn btn-outline-danger"
                onClick={loadContent}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Try Again
              </button>
            </Alert>
          </Container>
        </div>
      </>
    );
  }

  // No content state
  if (!topMovie) {
    return (
      <>
        <SEOHead
          config={{
            basic: {
              title: "UgFlix - Premium Streaming Platform",
              description: "Welcome to UgFlix - Your ultimate streaming destination"
            },
            openGraph: {
              title: "UgFlix - Premium Streaming Platform",
              description: "Welcome to UgFlix - Your ultimate streaming destination",
              type: "website",
              siteName: "UgFlix",
              locale: "en_US"
            },
            twitter: {
              card: "summary_large_image",
              title: "UgFlix - Premium Streaming Platform",
              description: "Welcome to UgFlix - Your ultimate streaming destination"
            }
          }}
        />
        <div 
          className="d-flex justify-content-center align-items-center" 
          style={{ 
            height: '100vh', 
            background: 'var(--ugflix-bg-primary)',
            padding: '2rem'
          }}
        >
          <Container>
            <div className="text-center">
              <div style={{ fontSize: '4rem', color: 'var(--ugflix-primary)', marginBottom: '2rem' }}>
                🎭
              </div>
              <h3 style={{ color: 'var(--ugflix-text-primary)', marginBottom: '1rem' }}>
                Welcome to UgFlix
              </h3>
              <p style={{ color: 'var(--ugflix-text-muted)', marginBottom: '2rem' }}>
                Your content library is being prepared. Please check back soon!
              </p>
              <button 
                className="btn"
                style={{ 
                  background: 'var(--ugflix-primary)',
                  color: 'var(--ugflix-text-primary)',
                  border: 'none',
                  padding: '0.75rem 2rem'
                }}
                onClick={loadContent}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh Content
              </button>
            </div>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        config={{
          basic: {
            title: `${topMovie.title} - UgFlix`,
            description: topMovie.description || "Welcome to UgFlix - Your ultimate streaming destination for movies and entertainment"
          },
          openGraph: {
            title: `${topMovie.title} - UgFlix`,
            description: topMovie.description || "Welcome to UgFlix - Your ultimate streaming destination",
            type: "website",
            siteName: "UgFlix",
            locale: "en_US",
            image: topMovie.thumbnail_url
          },
          twitter: {
            card: "summary_large_image",
            title: `${topMovie.title} - UgFlix`,
            description: topMovie.description || "Welcome to UgFlix - Your ultimate streaming destination",
            image: topMovie.thumbnail_url
          }
        }}
      />
      
      <div className="ugflix-home">
        {/* Netflix-Style Hero Section */}
        <NetflixHeroSection 
          movie={topMovie}
          onWatchClick={handleWatchMovie}
          onAddToWatchlist={handleAddToWatchlist}
          onMoreInfo={handleMoreInfo}
        />
        
        {/* Dynamic Content Sections */}
        {manifest && (
          <ContentSections
            manifest={manifest}
            loading={loading}
            onMovieClick={handleWatchMovie}
            onRetry={loadContent}
          />
        )}
      </div>
    </>
  );
};

export default HomePage;