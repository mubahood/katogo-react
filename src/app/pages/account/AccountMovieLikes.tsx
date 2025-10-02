// src/app/pages/account/AccountMovieLikes.tsx
/**
 * 🎬 MOVIE LIKES PAGE
 * 
 * Features:
 * ✅ Display all liked movies in a grid
 * ✅ Optimistic UI updates for unlike
 * ✅ Pagination support
 * ✅ Empty states
 * ✅ Loading states
 * ✅ Error handling
 * ✅ Responsive design
 * ✅ Uses MovieCard component for consistency
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiPlay, FiRefreshCw } from 'react-icons/fi';
import AccountPageWrapper from '../../components/Account/AccountPageWrapper';
import AccountCard from '../../components/Account/AccountCard';
import MovieCard from '../../components/Movies/MovieCard';
import { ApiService } from '../../services/ApiService';
import ToastService from '../../services/ToastService';
import { Movie } from '../../services/manifest.service';
import './AccountMovieLikes.css';

interface LikedMovie {
  like_id: number;
  movie_id: number;
  title: string;
  thumbnail: string;
  year: number;
  type: string;
  category: string;
  episode_number?: number;
  liked_at: string;
}

interface LikedMoviesResponse {
  items: LikedMovie[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

const AccountMovieLikes: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(20);

  // Load liked movies
  const loadLikedMovies = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ApiService.getLikedMovies(page, perPage);
      
      // Transform backend data to Movie format
      const transformedMovies: Movie[] = response.items.map((item: LikedMovie) => ({
        id: item.movie_id,
        title: item.title,
        thumbnail: item.thumbnail,
        thumbnail_url: item.thumbnail,
        year: item.year,
        type: item.type,
        category: item.category,
        episode_number: item.episode_number,
        has_liked: true, // They liked it!
        likes_count: 0,
        // Add other required Movie properties with defaults
        description: '',
        rating: 0,
        duration: 0,
        genres: [],
        cast: [],
        director: '',
        language: '',
        country: '',
        created_at: item.liked_at,
      }));

      setMovies(transformedMovies);
      setTotalItems(response.total);
      setTotalPages(response.last_page);
      setCurrentPage(response.current_page);

    } catch (err: any) {
      console.error('Failed to load liked movies:', err);
      setError(err.message || 'Failed to load liked movies');
      ToastService.error('Failed to load liked movies');
    } finally {
      setIsLoading(false);
    }
  }, [perPage]);

  // Initial load
  useEffect(() => {
    loadLikedMovies(currentPage);
  }, [currentPage, loadLikedMovies]);

  // Handle movie click - navigate to watch page
  const handleMovieClick = useCallback((movie: Movie) => {
    navigate(`/watch/${movie.id}`);
  }, [navigate]);

  // Handle unlike (when user clicks heart button)
  const handleUnlike = useCallback(async (movie: Movie) => {
    try {
      // Optimistic update
      setMovies(prev => prev.filter(m => m.id !== movie.id));
      setTotalItems(prev => prev - 1);

      // Call API to unlike
      await ApiService.toggleMovieLike(movie.id);
      
      // Success message handled by ApiService
    } catch (err: any) {
      console.error('Failed to unlike movie:', err);
      
      // Rollback on error
      loadLikedMovies(currentPage);
      ToastService.error('Failed to unlike movie');
    }
  }, [currentPage, loadLikedMovies]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadLikedMovies(currentPage);
  }, [currentPage, loadLikedMovies]);

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        className="pagination-btn"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          className="pagination-btn"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        className="pagination-btn"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    );

    return (
      <div className="movie-likes-pagination">
        {pages}
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="empty-icon">
        <FiHeart size={80} />
      </div>
      <h3 className="empty-title">No Liked Movies Yet</h3>
      <p className="empty-description">
        Movies you like will appear here. Start exploring and like your favorite movies!
      </p>
      <div className="empty-actions">
        <button
          className="empty-btn primary"
          onClick={() => navigate('/movies')}
        >
          <FiPlay />
          Browse Movies
        </button>
        <button
          className="empty-btn secondary"
          onClick={() => navigate('/explore')}
        >
          Explore
        </button>
      </div>
    </motion.div>
  );

  // Render error state
  const renderErrorState = () => (
    <motion.div
      className="error-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Failed to Load Liked Movies</h3>
      <p className="error-description">{error}</p>
      <button
        className="error-btn"
        onClick={handleRefresh}
      >
        <FiRefreshCw />
        Try Again
      </button>
    </motion.div>
  );

  // Render loading state
  const renderLoadingState = () => (
    <div className="movie-likes-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="movie-card-skeleton">
          <div className="skeleton-poster"></div>
          <div className="skeleton-title"></div>
          <div className="skeleton-meta"></div>
        </div>
      ))}
    </div>
  );

  return (
    <AccountPageWrapper
      title="My Liked Movies"
      subtitle={`${totalItems} ${totalItems === 1 ? 'movie' : 'movies'}`}
      actions={[
        {
          label: 'Refresh',
          onClick: handleRefresh,
          icon: <FiRefreshCw />,
          disabled: isLoading
        }
      ]}
      isLoading={false}
    >
      <AccountCard noPadding>
        {isLoading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : movies.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <div className="movie-likes-grid">
              {movies.map((movie) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <MovieCard
                    movie={movie}
                    onClick={() => handleMovieClick(movie)}
                    showAddButton={false}
                    onLikeToggle={(liked) => {
                      if (!liked) {
                        // User unliked the movie
                        handleUnlike(movie);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}

            {/* Stats footer */}
            <div className="movie-likes-footer">
              <p className="footer-text">
                Showing {movies.length} of {totalItems} liked movies
                {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
              </p>
            </div>
          </>
        )}
      </AccountCard>
    </AccountPageWrapper>
  );
};

export default AccountMovieLikes;
