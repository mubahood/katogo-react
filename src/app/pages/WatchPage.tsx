// src/app/pages/WatchPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Heart, Download, Share2, Star, Calendar, Clock, Users } from 'lucide-react';
import MovieListBuilder from '../components/Movies/MovieListBuilder';
import { CustomVideoPlayer } from '../components/VideoPlayer/CustomVideoPlayer';
import { ApiService } from '../services/ApiService';
import './WatchPage.css';

interface MovieData {
  id: number;
  title: string;
  description: string;
  year: string;
  rating: string;
  duration?: string;
  genre: string;
  director?: string;
  country?: string;
  language?: string;
  thumbnail_url: string;
  url: string;
  views_count: number;
  likes_count: number;
  type: 'Movie' | 'Series';
  episode_number?: number;
  category?: string;
}

interface ApiMovieResponse {
  movie: MovieData;
  related_movies: MovieData[];
  user_interactions: {
    has_liked: boolean;
    has_viewed: boolean;
  };
}

const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movieData, setMovieData] = useState<ApiMovieResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Check if page content overflows viewport
  const checkOverflow = useCallback(() => {
    const contentHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const overflow = contentHeight > viewportHeight;
    setHasOverflow(overflow);
    
    console.log('📏 Content height:', contentHeight, 'Viewport:', viewportHeight, 'Overflow:', overflow);
  }, []);

  useEffect(() => {
    if (id) {
      fetchMovieData(id);
    }
  }, [id]);

  // Check overflow after data loads and on window resize
  useEffect(() => {
    if (movieData) {
      // Use setTimeout to ensure DOM has updated
      const timer = setTimeout(checkOverflow, 100);
      return () => clearTimeout(timer);
    }
  }, [movieData, checkOverflow]);

  useEffect(() => {
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [checkOverflow]);

  const fetchMovieData = async (movieId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the new backend API endpoint
      const data = await ApiService.getMovieById(movieId);
      setMovieData(data);
      
    } catch (err) {
      console.error('Error fetching movie data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred loading the movie');
    } finally {
      setLoading(false);
    }
  };

  // Get current movie (for series, this could be a specific episode)
  const getCurrentMovie = (): MovieData | null => {
    if (!movieData) return null;
    
    // If it's a series, we might want to show episodes in related movies
    // For now, just return the main movie
    return movieData.movie;
  };

  // Handle next episode for series
  const handleNextEpisode = () => {
    if (!movieData || movieData.movie.type !== 'Series') return;
    
    const relatedEpisodes = movieData.related_movies.filter(m => 
      m.type === 'Series' && m.category === movieData.movie.category
    );
    
    if (currentEpisodeIndex < relatedEpisodes.length - 1) {
      const nextEpisode = relatedEpisodes[currentEpisodeIndex + 1];
      navigate(`/watch/${nextEpisode.id}`);
    }
  };

  // Handle previous episode for series
  const handlePreviousEpisode = () => {
    if (!movieData || movieData.movie.type !== 'Series') return;
    
    const relatedEpisodes = movieData.related_movies.filter(m => 
      m.type === 'Series' && m.category === movieData.movie.category
    );
    
    if (currentEpisodeIndex > 0) {
      const prevEpisode = relatedEpisodes[currentEpisodeIndex - 1];
      navigate(`/watch/${prevEpisode.id}`);
    }
  };

  // Check if there are next/previous episodes
  const hasNextEpisode = (): boolean => {
    if (!movieData || movieData.movie.type !== 'Series') return false;
    const relatedEpisodes = movieData.related_movies.filter(m => 
      m.type === 'Series' && m.category === movieData.movie.category
    );
    return currentEpisodeIndex < relatedEpisodes.length - 1;
  };

  const hasPreviousEpisode = (): boolean => {
    if (!movieData || movieData.movie.type !== 'Series') return false;
    return currentEpisodeIndex > 0;
  };

  // Handle related movie click
  const handleRelatedMovieClick = (relatedMovie: MovieData) => {
    navigate(`/watch/${relatedMovie.id}`);
  };



  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handleLike = async () => {
    if (!movieData) return;
    
    try {
      // TODO: Implement API call to like/unlike movie
      console.log('Like movie:', movieData.movie.id);
    } catch (error) {
      console.error('Error liking movie:', error);
    }
  };

  const handleShare = () => {
    const movie = getCurrentMovie();
    if (navigator.share) {
      navigator.share({
        title: movie?.title,
        text: `Watch "${movie?.title}" on UgFlix`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="watch-page-loading">
        <Spinner animation="border" variant="warning" />
        <div className="loading-text">Loading movie...</div>
      </div>
    );
  }

  if (error || !movieData) {
    return (
      <div className="watch-page-error">
        <h2>{error ? 'Error Loading Movie' : 'Movie Not Found'}</h2>
        <p>{error || "The movie you're looking for doesn't exist."}</p>
        <button onClick={() => navigate(-1)} className="back-btn">
          Go Back
        </button>
      </div>
    );
  }

  const movie = getCurrentMovie();
  if (!movie) return null;

  return (
    <div className={`watch-page ${hasOverflow ? 'has-overflow' : 'no-overflow'}`}>
      <Container fluid className="px-2 px-md-4">
        {/* Main Content */}
        <Row className="g-4 mb-5">
          {/* Video Player - Left Side */}
          <Col lg={8}>
            <div className="video-container">
              <CustomVideoPlayer
                url={movie.url}
                movieId={movie.id}
                poster={movie.thumbnail_url}
                autoPlay={true}
                onNext={hasNextEpisode() ? handleNextEpisode : undefined}
                onPrevious={hasPreviousEpisode() ? handlePreviousEpisode : undefined}
              />
            </div>

            {/* Mobile: Movie Title and Related Movies immediately after video */}
            <div className="mobile-movie-section d-lg-none">
              <h2 className="current-movie-title mobile-title">{movie.title}</h2>
              
              {/* Mobile Related Movies */}
              {movieData.related_movies.length > 0 && (
                <div className="mobile-related-movies">
                  <h4 className="related-movies-heading mobile-heading">
                    {movie.type === 'Series' ? 'More Episodes' : 'Related Movies'}
                  </h4>
                  <div className="related-movies-mobile-grid">
                    {movieData.related_movies.slice(0, 6).map((relatedMovie) => (
                      <div 
                        key={relatedMovie.id} 
                        className="mobile-movie-card"
                        onClick={() => handleRelatedMovieClick(relatedMovie)}
                      >
                        <div className="mobile-movie-poster">
                          <img 
                            src={relatedMovie.thumbnail_url} 
                            alt={relatedMovie.title}
                            loading="lazy"
                          />
                          <div className="mobile-play-overlay">
                            <div className="mobile-play-icon">▶</div>
                          </div>
                          <div className="mobile-movie-gradient"></div>
                        </div>
                        <div className="mobile-movie-info">
                          <h6 className="mobile-movie-title">{relatedMovie.title}</h6>
                          <div className="mobile-movie-meta">
                            <span className="mobile-year">{relatedMovie.year}</span>
                            {relatedMovie.type === 'Series' && relatedMovie.episode_number && (
                              <span className="mobile-episode">Ep {relatedMovie.episode_number}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Col>

          {/* Desktop: Movie Title and Related Movies - Right Side */}
          <Col lg={4} className="d-none d-lg-block">
            <div className="right-sidebar">
              {/* Movie Title */}
              <h2 className="current-movie-title">{movie.title}</h2>
              
              {/* Related Movies Horizontal Slider */}
              {movieData.related_movies.length > 0 && (
                <div className="related-movies-sidebar">
                  <h4 className="related-movies-heading">
                    {movie.type === 'Series' ? 'More Episodes' : 'Related Movies'}
                  </h4>
                  <div className="related-movies-horizontal">
                    {movieData.related_movies.map((relatedMovie) => (
                      <div 
                        key={relatedMovie.id} 
                        className="related-movie-item"
                        onClick={() => handleRelatedMovieClick(relatedMovie)}
                      >
                        <div className="related-movie-poster">
                          <img 
                            src={relatedMovie.thumbnail_url} 
                            alt={relatedMovie.title}
                            loading="lazy"
                          />
                          <div className="related-play-overlay">
                            <div className="play-icon-small">▶</div>
                          </div>
                        </div>
                        <div className="related-movie-title-info">
                          <h6>{relatedMovie.title}</h6>
                          <div className="related-movie-meta">
                            <span>{relatedMovie.year}</span>
                            {relatedMovie.type === 'Series' && relatedMovie.episode_number && (
                              <span>Ep {relatedMovie.episode_number}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>


      </Container>
    </div>
  );
};

export default WatchPage;