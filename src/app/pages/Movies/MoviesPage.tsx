// src/app/pages/Movies/MoviesPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { SEOHead } from '../../components/seo';
import MoviesApiService, { MoviesApiParams } from '../../services/MoviesApiService';
import { Movie as MovieType } from '../../types/Streaming';
import MovieCard from '../../components/Movies/MovieCard';
import MovieCardSkeleton from '../../components/Movies/MovieCardSkeleton';
import Pagination from './components/Pagination';
import ToastService from '../../services/ToastService';
import './MoviesPage.css';

interface MoviesPageProps {
  contentType?: 'Movie' | 'Series'; // Can be set via prop or route
}

const MoviesPage: React.FC<MoviesPageProps> = ({ contentType }) => {
  const navigate = useNavigate();
  const { type } = useParams<{ type?: string }>(); // From route: /movies or /series
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine the content type (from prop or route or default to 'Movie')
  const activeContentType: 'Movie' | 'Series' | 'All' = useMemo(() => {
    if (contentType) return contentType;
    if (type === 'series') return 'Series';
    if (type === 'movies') return 'Movie';
    return 'All';
  }, [contentType, type]);

  // State
  const [movies, setMovies] = useState<MovieType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Search query from URL
  const searchQuery = searchParams.get('search') || '';

  // Filters are handled in header, no local state needed


  // Load movies on mount and when page or search changes
  useEffect(() => {
    loadMovies();
  }, [currentPage, activeContentType, searchQuery]);

  // Load page from URL
  useEffect(() => {
    const page = searchParams.get('page');
    if (page) setCurrentPage(parseInt(page));
  }, []);

  // Load movies from API
  const loadMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎬 MoviesPage: Loading movies', {
        page: currentPage,
        activeContentType,
        searchQuery
      });

      // Build API params
      const apiParams: MoviesApiParams = {
        page: currentPage,
        per_page: itemsPerPage,
        type: activeContentType !== 'All' ? activeContentType : undefined,
        sort_by: 'created_at',
        sort_dir: 'desc',
      };

      // Add search query if present
      if (searchQuery) {
        apiParams.search = searchQuery;
      }

      // For series, only get first episodes
      if (activeContentType === 'Series') {
        apiParams.is_first_episode = 'Yes';
      }

      const response = await MoviesApiService.getMovies(apiParams);

      if (response.code === 1 && response.data) {
        setMovies(response.data.items);
        setTotalPages(response.data.pagination.last_page);
        setTotalItems(response.data.pagination.total);
        setItemsPerPage(response.data.pagination.per_page);

        console.log('✅ MoviesPage: Movies loaded successfully', {
          count: response.data.items.length,
          total: response.data.pagination.total
        });
      } else {
        throw new Error(response.message || 'Failed to load movies');
      }
    } catch (err: any) {
      console.error('❌ MoviesPage: Error loading movies:', err);
      setError(err.message || 'Failed to load movies. Please try again.');
      ToastService.error('Failed to load movies');
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeContentType, itemsPerPage, searchQuery]);

  // Filters and search are handled in the header

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    console.log('📄 MoviesPage: Page changed to:', page);
    setCurrentPage(page);
    
    // Update URL
    searchParams.set('page', page.toString());
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  // Handle movie click
  const handleMovieClick = useCallback((movie: any) => {
    console.log('🎬 MoviesPage: Movie clicked:', movie.title);
    navigate(`/watch/${movie.id}`);
  }, [navigate]);

  // Handle play movie
  const handlePlayMovie = useCallback((movie: any) => {
    console.log('▶️ MoviesPage: Play movie:', movie.title);
    navigate(`/watch/${movie.id}`);
    ToastService.success(`Playing ${movie.title}`);
  }, [navigate]);

  // Handle add to watchlist
  const handleAddToWatchlist = useCallback((movie: any) => {
    console.log('➕ MoviesPage: Add to watchlist:', movie.title);
    // TODO: Implement watchlist functionality
    ToastService.success(`Added ${movie.title} to watchlist`);
  }, []);

  // Get page title
  const getPageTitle = (): string => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (activeContentType === 'Series') return 'Browse Series';
    if (activeContentType === 'Movie') return 'Browse Movies';
    return 'Browse Content';
  };

  // Get page subtitle
  const getPageSubtitle = (): string => {
    if (searchQuery) {
      return `${totalItems} result${totalItems !== 1 ? 's' : ''} found`;
    }
    return `${totalItems} ${activeContentType === 'Series' ? 'series' : activeContentType === 'Movie' ? 'movies' : 'items'} available`;
  };

  return (
    <>
      {/* SEO Head */}
      <SEOHead
        config={{
          basic: {
            title: `${getPageTitle()} | UgFlix`,
            description: `Browse and discover ${activeContentType === 'Series' ? 'series' : activeContentType === 'Movie' ? 'movies' : 'content'} on UgFlix. Filter by genre, VJ, and more.`
          },
          openGraph: {
            title: `${getPageTitle()} | UgFlix`,
            description: `Browse and discover ${activeContentType === 'Series' ? 'series' : activeContentType === 'Movie' ? 'movies' : 'content'} on UgFlix`,
            type: 'website',
            siteName: 'UgFlix',
            locale: 'en_US'
          },
          twitter: {
            card: 'summary_large_image',
            title: `${getPageTitle()} | UgFlix`,
            description: `Browse and discover ${activeContentType === 'Series' ? 'series' : activeContentType === 'Movie' ? 'movies' : 'content'} on UgFlix`
          }
        }}
      />

      <div className="movies-page">
        {/* Main Content */}
        <Container fluid className="movies-content">
          

          {/* Error State */}
          {error && (
            <Alert variant="danger" className="movies-error">
              <Alert.Heading>Oops! Something went wrong</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}

          {/* Loading State */}
          {loading && movies.length === 0 && (
            <Row className="movies-grid">
              {Array.from({ length: itemsPerPage }).map((_, index) => (
                <Col key={index} xs={6} sm={4} md={3} lg={2} className="movie-col">
                  <MovieCardSkeleton />
                </Col>
              ))}
            </Row>
          )}

          {/* Empty State */}
          {!loading && movies.length === 0 && !error && (
            <div className="movies-empty">
              <div className="empty-icon">🎬</div>
              {searchQuery ? (
                <>
                  <h3>No results found for "{searchQuery}"</h3>
                  <p>Try searching with different keywords or browse all content.</p>
                </>
              ) : (
                <>
                  <h3>No {activeContentType === 'Series' ? 'series' : 'movies'} found</h3>
                  <p>Check back later for new content.</p>
                </>
              )}
            </div>
          )}

          {/* Movies Grid */}
          {movies.length > 0 && (
            <Row className="movies-grid">
              {movies.map((movie) => (
                <Col key={movie.id} xs={6} sm={4} md={3} lg={2} className="movie-col">
                  <MovieCard
                    movie={movie as any}
                    onClick={handleMovieClick}
                    onPlay={handlePlayMovie}
                    onAddToWatchlist={handleAddToWatchlist}
                    showProgress={true}
                  />
                </Col>
              ))}
            </Row>
          )}

          {/* Pagination */}
          {movies.length > 0 && !loading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              isLoading={loading}
            />
          )}
        </Container>
      </div>
    </>
  );
};

export default MoviesPage;
