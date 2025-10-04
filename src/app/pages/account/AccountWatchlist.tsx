// src/app/pages/account/AccountWatchlist.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, Spinner, Badge, ProgressBar } from 'react-bootstrap';
import { Play, Trash2, Calendar, Clock, Film } from 'react-feather';
import { AccountApiService } from '../../services/AccountApiService';
import Utils from '../../services/Utils';
import ToastService from '../../services/ToastService';

interface MovieWishlistItem {
  id: number; // wishlist ID
  user_id: number;
  movie_model_id: number;
  created_at: string;
  updated_at: string;
  status: string;
  movie: {
    id: number;
    title: string;
    description?: string;
    thumbnail_url: string;
    thumbnail?: string;
    year?: number;
    type: string; // 'movie' or 'series'
    category?: string;
    episode_number?: number;
    season_number?: number;
    duration?: number;
    rating?: number;
    wishlist_count?: number;
  };
}

interface MovieWishlistResponse {
  wishlists: MovieWishlistItem[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

const AccountWatchlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<MovieWishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadMovieWishlist();
  }, [currentPage]);

  const loadMovieWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await AccountApiService.getMovieWishlist(currentPage, 12);
      
      // Response structure: { wishlists, total, current_page, last_page, per_page }
      setWishlistItems(response.wishlists || []);
      setTotalItems(response.total || 0);
      setTotalPages(response.last_page || 1);
    } catch (err: any) {
      console.error('Error loading movie wishlist:', err);
      setError(err.message || 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

    const handleRemoveFromWishlist = async (wishlistId: number, title: string) => {
    if (!confirm(`Remove "${title}" from your wishlist?`)) return;

    try {
      setRemovingIds(prev => new Set(prev).add(wishlistId));
      
      await AccountApiService.removeFromMovieWishlist(wishlistId);
      
      // Remove from local state
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
      setTotalItems(prev => prev - 1);
      
      // Reload if page becomes empty and not on first page
      if (wishlistItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      console.error('Error removing from wishlist:', err);
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(wishlistId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getWatchLink = (item: MovieWishlistItem): string => {
    const movie = item.movie;
    if (movie.type === 'series' && movie.episode_number) {
      return `/watch/${movie.id}?episode=${movie.episode_number}`;
    }
    return `/watch/${movie.id}`;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="watchlist-pagination">
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(1)}
          className="me-2"
        >
          <i className="bi bi-chevron-double-left"></i>
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="me-2"
        >
          <i className="bi bi-chevron-left"></i>
        </Button>
        
        {pages.map(page => (
          <Button
            key={page}
            variant={currentPage === page ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={() => setCurrentPage(page)}
            className="me-2"
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="me-2"
        >
          <i className="bi bi-chevron-right"></i>
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
        >
          <i className="bi bi-chevron-double-right"></i>
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="account-watchlist-loading">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your watchlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="account-watchlist-error">
        <i className="bi bi-exclamation-triangle display-1 text-danger"></i>
        <h4 className="mt-3">Error Loading Watchlist</h4>
        <p className="text-muted">{error}</p>
        <Button onClick={loadMovieWishlist} variant="primary">
          <i className="bi bi-arrow-clockwise me-2"></i>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="account-watchlist">
      {/* Header */}
      <div className="watchlist-header">
        <div>
          <h2 className="watchlist-title">
            <Film className="me-2" size={28} />
            My Watchlist
          </h2>
          <p className="watchlist-subtitle">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </div>

      {/* Content */}
      {wishlistItems.length > 0 ? (
        <>
          <Row className="g-4 watchlist-grid">
            {wishlistItems.map((item) => {
              const movie = item.movie;
              if (!movie) return null;
              
              return (
              <Col key={item.id} xs={6} sm={6} md={4} lg={3} xl={2}>
                <Card className="watchlist-card h-100">
                  {/* Thumbnail */}
                  <div className="watchlist-card-image-wrapper">
                    <Card.Img
                      variant="top"
                      src={movie.thumbnail_url || movie.thumbnail || '/media/logos/placeholder-movie.png'}
                      alt={movie.title}
                      className="watchlist-card-image"
                      onError={(e: any) => {
                        e.target.src = '/media/logos/placeholder-movie.png';
                      }}
                    />

                    {/* Type Badge */}
                    <Badge 
                      bg={movie.type === 'movie' ? 'primary' : 'info'} 
                      className="watchlist-type-badge"
                    >
                      {movie.type === 'movie' ? 'Movie' : 'Series'}
                    </Badge>

                    {/* Play Overlay */}
                    <Link 
                      to={getWatchLink(item)} 
                      className="watchlist-play-overlay"
                    >
                      <Play size={48} className="play-icon" />
                    </Link>
                  </div>

                  <Card.Body className="watchlist-card-body">
                    {/* Title */}
                    <Card.Title className="watchlist-card-title">
                      <Link to={getWatchLink(item)} className="text-decoration-none">
                        {movie.title}
                      </Link>
                    </Card.Title>

                    {/* Episode Info for Series */}
                    {movie.type === 'series' && movie.episode_number && (
                      <div className="watchlist-episode-info">
                        S{movie.season_number || 1} E{movie.episode_number}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="watchlist-meta">
                      {movie.year && (
                        <span className="watchlist-year">
                          <Calendar size={14} className="me-1" />
                          {movie.year}
                        </span>
                      )}
                      {movie.duration && (
                        <span className="watchlist-duration">
                          <Clock size={14} className="me-1" />
                          {formatDuration(movie.duration)}
                        </span>
                      )}
                      {movie.rating && (
                        <span className="watchlist-rating">
                          <i className="bi bi-star-fill me-1"></i>
                          {movie.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Category */}
                    {movie.category && (
                      <div className="watchlist-category">
                        {movie.category}
                      </div>
                    )}

                    {/* Added Date */}
                    <div className="watchlist-added-date">
                      Added {formatDate(item.created_at)}
                    </div>

                    {/* Actions */}
                    <div className="watchlist-actions">
                      <Link 
                        to={getWatchLink(item)} 
                        className="btn btn-sm btn-primary w-100 mb-2"
                      >
                        <Play size={16} className="me-1" />
                        Watch Now
                      </Link>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="w-100"
                        onClick={() => handleRemoveFromWishlist(item.id, movie.title)}
                        disabled={removingIds.has(item.id)}
                      >
                        {removingIds.has(item.id) ? (
                          <>
                            <Spinner size="sm" animation="border" className="me-1" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 size={16} className="me-1" />
                            Remove
                          </>
                        )}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
            })}
          </Row>

          {/* Pagination */}
          {renderPagination()}
        </>
      ) : (
        <div className="watchlist-empty">
          <div className="empty-icon">
            <Film size={80} className="text-muted" />
          </div>
          <h4 className="mt-4">Your watchlist is empty</h4>
          <p className="text-muted mb-4">
            Movies and shows you add to your watchlist will appear here
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Button onClick={() => window.location.href = '/movies'} variant="primary">
              <i className="bi bi-film me-2"></i>
              Browse Movies
            </Button>
            <Button onClick={() => window.location.href = '/series'} variant="outline-primary">
              <i className="bi bi-tv me-2"></i>
              Browse Series
            </Button>
          </div>
        </div>
      )}

      <style>{`
        .account-watchlist {
          padding: 0;
          width: 100%;
        }

        .account-watchlist-loading,
        .account-watchlist-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .watchlist-grid {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -0.75rem;
        }

        .watchlist-grid > .col,
        .watchlist-grid > [class*="col-"] {
          padding: 0 0.75rem;
          margin-bottom: 1.5rem;
        }

        .watchlist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--ugflix-border, #333);
        }

        .watchlist-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          color: var(--ugflix-text-primary, #fff);
          display: flex;
          align-items: center;
        }

        .watchlist-subtitle {
          color: var(--ugflix-text-secondary, #999);
          margin: 0.5rem 0 0 0;
          font-size: 0.95rem;
        }

        .watchlist-card {
          background: var(--ugflix-bg-card, #1a1a1a);
          border: 1px solid var(--ugflix-border, #333);
          border-radius: 8px;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .watchlist-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(183, 28, 28, 0.3);
          border-color: var(--ugflix-primary, #B71C1C);
        }

        .watchlist-card-image-wrapper {
          position: relative;
          overflow: hidden;
          aspect-ratio: 2/3;
        }

        .watchlist-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .watchlist-card:hover .watchlist-card-image {
          transform: scale(1.05);
        }

        .watchlist-type-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 4px 8px;
          text-transform: uppercase;
          z-index: 2;
        }

        .watchlist-progress-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 2;
        }

        .watchlist-progress-bar {
          height: 4px;
          border-radius: 0;
        }

        .watchlist-play-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .watchlist-card:hover .watchlist-play-overlay {
          opacity: 1;
        }

        .watchlist-play-overlay .play-icon {
          color: var(--ugflix-primary, #B71C1C);
          filter: drop-shadow(0 0 10px rgba(183, 28, 28, 0.5));
        }

        .watchlist-card-body {
          padding: 1rem;
        }

        .watchlist-card-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .watchlist-card-title a {
          color: var(--ugflix-text-primary, #fff);
        }

        .watchlist-card-title a:hover {
          color: var(--ugflix-primary, #B71C1C);
        }

        .watchlist-episode-info {
          font-size: 0.85rem;
          color: var(--ugflix-primary, #B71C1C);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .watchlist-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.85rem;
          color: var(--ugflix-text-secondary, #999);
          margin-bottom: 0.5rem;
        }

        .watchlist-meta span {
          display: flex;
          align-items: center;
        }

        .watchlist-category {
          display: inline-block;
          font-size: 0.75rem;
          padding: 2px 8px;
          background: rgba(183, 28, 28, 0.2);
          color: var(--ugflix-primary, #B71C1C);
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .watchlist-added-date {
          font-size: 0.8rem;
          color: var(--ugflix-text-secondary, #999);
          margin-bottom: 1rem;
        }

        .watchlist-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .watchlist-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          padding: 3rem;
        }

        .watchlist-empty h4 {
          color: var(--ugflix-text-primary, #fff);
          font-weight: 600;
        }

        .watchlist-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid var(--ugflix-border, #333);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .watchlist-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .watchlist-title {
            font-size: 1.5rem;
          }

          .watchlist-card-title {
            font-size: 0.9rem;
          }

          .watchlist-pagination {
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .watchlist-grid {
            margin: 0 -0.5rem;
          }

          .watchlist-grid > .col,
          .watchlist-grid > [class*="col-"] {
            padding: 0 0.5rem;
            margin-bottom: 1rem;
          }
        }

        /* Extra small screens - 2 columns */
        @media (max-width: 576px) {
          .watchlist-card-body {
            padding: 0.75rem;
          }

          .watchlist-card-title {
            font-size: 0.85rem;
          }

          .watchlist-meta {
            font-size: 0.75rem;
          }
        }

        /* Large screens - 6 columns */
        @media (min-width: 1400px) {
          .watchlist-grid > [class*="col-xl-2"] {
            flex: 0 0 auto;
            width: 16.666667%;
          }
        }
      `}</style>
    </div>
  );
};

export default AccountWatchlist;
