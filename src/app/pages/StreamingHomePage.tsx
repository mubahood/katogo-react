// src/app/pages/HomePage.tsx - UgFlix Streaming Platform Dashboard
import React, { useEffect, useState, useCallback, memo } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Alert, Container, Spinner } from "react-bootstrap";
import { SEOHead } from "../components/seo";
import { generateHomePageMetaTags } from "../utils/seo";
import { selectIsAuthenticated, selectAuthLoading } from "../store/slices/authSlice";
import { manifestService, Movie, MovieCategory } from "../services/manifest.service";
import ToastService from "../services/ToastService";
import "./HomePage.css";

// Streaming platform styles
const streamingStyles = `
  .ugflix-home {
    background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
    min-height: 100vh;
    color: white;
    padding-top: 0;
  }

  .hero-banner {
    position: relative;
    height: 70vh;
    background: linear-gradient(
      rgba(0, 0, 0, 0.4),
      rgba(0, 0, 0, 0.7)
    ), url('https://images.unsplash.com/photo-1489599808821-cb6b1e5d2ab7?w=1920&h=1080&fit=crop') center/cover;
    display: flex;
    align-items: center;
    margin-bottom: 3rem;
  }

  .hero-content {
    max-width: 600px;
    z-index: 2;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 900;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #ff6b35, #f7931e, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  .hero-subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .movie-section {
    margin-bottom: 3rem;
  }

  .section-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: #ff6b35;
    display: flex;
    align-items: center;
  }

  .section-title::before {
    content: '';
    width: 4px;
    height: 30px;
    background: linear-gradient(135deg, #ff6b35, #ffd700);
    margin-right: 15px;
    border-radius: 2px;
  }

  .movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 0 15px;
  }

  .movie-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .movie-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(255, 107, 53, 0.2);
    border-color: #ff6b35;
  }

  .movie-poster {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

 

  .movie-info {
    padding: 1rem;
  }

  .movie-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: white;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .movie-genre {
    font-size: 0.9rem;
    color: #ffd700;
    margin-bottom: 0.5rem;
  }

  .movie-description {
    font-size: 0.85rem;
    opacity: 0.8;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .error-message {
    background: rgba(220, 53, 69, 0.1);
    border: 1px solid rgba(220, 53, 69, 0.3);
    border-radius: 10px;
    padding: 2rem;
    text-align: center;
    margin: 2rem 0;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    opacity: 0.7;
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .btn-primary-ugflix {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s ease;
    color: white;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }

  .btn-primary-ugflix:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(255, 107, 53, 0.3);
    color: white;
  }

  .btn-outline-ugflix {
    background: transparent;
    border: 2px solid #ff6b35;
    padding: 10px 28px;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s ease;
    color: #ff6b35;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }

  .btn-outline-ugflix:hover {
    background: #ff6b35;
    color: white;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .hero-title {
      font-size: 2.5rem;
    }
    
    .movie-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      padding: 0 10px;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }
  }
`;

// Featured Movie Card Component
const FeaturedMovieCard = memo(({ movie, onClick }: { movie: Movie; onClick: () => void }) => (
  <div className="movie-card" onClick={onClick}>
    <img 
      src={movie.thumbnail_url || '/placeholder-movie.jpg'} 
      alt={movie.title}
      className="movie-poster"
      onError={(e) => {
        (e.target as HTMLImageElement).src = '/placeholder-movie.jpg';
      }}
    />
    <div className="movie-info">
      <h3 className="movie-title">{movie.title}</h3>
      <div className="movie-genre">{movie.type || 'Movie'}</div>
      <p className="movie-description">{movie.description}</p>
    </div>
  </div>
));

// Movie Section Component
const MovieSection = memo(({ title, movies, loading, onMovieClick }: {
  title: string;
  movies: Movie[];
  loading: boolean;
  onMovieClick: (movie: Movie) => void;
}) => (
  <div className="movie-section">
    <h2 className="section-title">{title}</h2>
    
    {loading ? (
      <div className="loading-spinner">
        <Spinner animation="border" variant="warning" />
      </div>
    ) : movies.length === 0 ? (
      <div className="empty-state">
        <p>No movies available in this category yet.</p>
      </div>
    ) : (
      <div className="movie-grid">
        {movies.slice(0, 8).map((movie) => (
          <FeaturedMovieCard 
            key={movie.id} 
            movie={movie} 
            onClick={() => onMovieClick(movie)}
          />
        ))}
      </div>
    )}
  </div>
));

const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);

  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load manifest data
  const loadManifest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const manifestData = await manifestService.getManifest();
      
      if (manifestData.code === 1) {
        setManifest(manifestData.data);
      } else {
        setError(manifestData.message || 'Failed to load content');
      }
    } catch (err: any) {
      console.error('Failed to load manifest:', err);
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle movie click
  const handleMovieClick = useCallback((movie: Movie) => {
    // Navigate to movie details page (will implement later)
    console.log('Movie clicked:', movie);
    ToastService.info(`Selected: ${movie.title}`);
  }, []);

  // Load manifest on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadManifest();
    }
  }, [isAuthenticated, loadManifest]);

  // Handle authentication redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const successMessage = urlParams.get('success');
    
    if (successMessage) {
      ToastService.success(decodeURIComponent(successMessage));
      // Clean up URL
      navigate('/', { replace: true });
    }
  }, [location.search, navigate]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="ugflix-home">
        <style>{streamingStyles}</style>
        <div className="loading-spinner" style={{ height: '100vh' }}>
          <Spinner animation="border" variant="warning" style={{ width: '3rem', height: '3rem' }} />
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <>
      <SEOHead config={generateHomePageMetaTags()} />
      <div className="ugflix-home">
        <style>{streamingStyles}</style>
        
        {/* Hero Banner */}
        <div className="hero-banner">
          <Container>
            <div className="hero-content">
              <h1 className="hero-title">UgFlix</h1>
              <p className="hero-subtitle">
                Welcome to the ultimate streaming experience. Discover thousands of movies, 
                series, and exclusive content tailored just for you.
              </p>
              <div className="cta-buttons">
                <a href="#featured" className="btn-primary-ugflix">
                  Browse Movies
                </a>
                <a href="#trending" className="btn-outline-ugflix">
                  Trending Now
                </a>
              </div>
            </div>
          </Container>
        </div>

        <Container>
          {/* Error Message */}
          {error && (
            <Alert variant="danger" className="error-message">
              <h5>Unable to load content</h5>
              <p>{error}</p>
              <button 
                className="btn-primary-ugflix" 
                onClick={loadManifest}
                style={{ marginTop: '1rem' }}
              >
                Try Again
              </button>
            </Alert>
          )}

          {/* Featured Content */}
          {manifest?.topMovie && (
            <div id="featured">
              <MovieSection
                title="Featured Movie"
                movies={[manifest.topMovie]}
                loading={loading}
                onMovieClick={handleMovieClick}
              />
            </div>
          )}

          {/* Trending Movies */}
          {manifest?.trendingMovies && (
            <div id="trending">
              <MovieSection
                title="Trending Now"
                movies={manifest.trendingMovies}
                loading={loading}
                onMovieClick={handleMovieClick}
              />
            </div>
          )}

          {/* Recommended Movies */}
          {manifest?.recommendedMovies && (
            <MovieSection
              title="Recommended for You"
              movies={manifest.recommendedMovies}
              loading={loading}
              onMovieClick={handleMovieClick}
            />
          )}

          {/* Featured Movies */}
          {manifest?.featuredMovies && (
            <MovieSection
              title="Featured Movies"
              movies={manifest.featuredMovies}
              loading={loading}
              onMovieClick={handleMovieClick}
            />
          )}

          {/* Categories */}
          {manifest?.categories && manifest.categories.length > 0 && (
            <>
              {manifest.categories.map((category: MovieCategory) => (
                <MovieSection
                  key={category.id}
                  title={category.name}
                  movies={category.movies}
                  loading={loading}
                  onMovieClick={handleMovieClick}
                />
              ))}
            </>
          )}

          {/* Loading State */}
          {loading && !error && (
            <div className="loading-spinner">
              <Spinner animation="border" variant="warning" style={{ width: '3rem', height: '3rem' }} />
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && !manifest && (
            <div className="empty-state">
              <h3>Welcome to UgFlix!</h3>
              <p>Your streaming content will appear here.</p>
              <button className="btn-primary-ugflix" onClick={loadManifest}>
                Load Content
              </button>
            </div>
          )}
        </Container>
      </div>
    </>
  );
};

export default memo(HomePage);