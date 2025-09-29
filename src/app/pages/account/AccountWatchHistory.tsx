// src/app/pages/account/AccountWatchHistory.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AccountApiService, { WatchHistoryItem } from '../../services/AccountApiService';

const AccountWatchHistory: React.FC = () => {
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadWatchHistory();
  }, [currentPage]);

  const loadWatchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await AccountApiService.getWatchHistory(currentPage);
      setWatchHistory(response.data);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Error loading watch history:', error);
      setError('Failed to load watch history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your entire watch history? This action cannot be undone.')) {
      try {
        await AccountApiService.clearWatchHistory();
        setWatchHistory([]);
        setTotalItems(0);
      } catch (error) {
        console.error('Error clearing watch history:', error);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 50) return 'warning';
    return 'info';
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading watch history...</span>
      </div>
    );
  }

  return (
    <div className="account-watch-history">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title mb-2">Watch History</h2>
          <p className="text-muted">Your recently watched movies and shows</p>
        </div>
        {watchHistory.length > 0 && (
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={handleClearHistory}
          >
            <i className="bi bi-trash me-2"></i>
            Clear History
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {watchHistory.length > 0 ? (
        <>
          <Row>
            {watchHistory.map((item) => (
              <Col md={6} lg={4} key={item.id} className="mb-4">
                <Card className="h-100 border-0 shadow-sm watch-history-card">
                  <div className="position-relative">
                    {item.product.thumbnail ? (
                      <Card.Img 
                        variant="top" 
                        src={item.product.thumbnail} 
                        alt={item.product.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="bg-light d-flex align-items-center justify-content-center"
                        style={{ height: '200px' }}
                      >
                        <i className="bi bi-play-circle display-4 text-muted"></i>
                      </div>
                    )}
                    
                    {/* Progress overlay */}
                    <div className="position-absolute bottom-0 start-0 end-0 p-2 bg-dark bg-opacity-75">
                      <ProgressBar 
                        now={item.progress_percentage} 
                        variant={getProgressColor(item.progress_percentage)}
                        size="sm"
                        className="mb-1"
                      />
                      <div className="d-flex justify-content-between align-items-center text-white small">
                        <span>{formatDuration(item.watch_duration)}</span>
                        <span>{item.progress_percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <Card.Body>
                    <h6 className="card-title mb-2">{item.product.name}</h6>
                    
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">
                        Watched {formatDate(item.last_watched_at)}
                      </small>
                      {item.progress_percentage >= 90 && (
                        <Badge bg="success" className="small">
                          Completed
                        </Badge>
                      )}
                    </div>

                    {item.product.duration && (
                      <div className="progress-details small text-muted mb-3">
                        {formatDuration(item.watch_duration)} of {formatDuration(item.product.duration)}
                      </div>
                    )}
                  </Card.Body>

                  <Card.Footer className="bg-transparent border-0 pt-0">
                    <div className="d-grid gap-2 d-md-flex">
                      <Button 
                        as={Link}
                        to={`/watch/${item.product_id}`}
                        variant="primary" 
                        size="sm"
                        className="flex-grow-1"
                      >
                        <i className="bi bi-play-fill me-2"></i>
                        {item.progress_percentage >= 90 ? 'Watch Again' : 'Continue'}
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalItems > 10 && (
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="outline-primary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="me-2"
              >
                <i className="bi bi-chevron-left"></i> Previous
              </Button>
              <span className="align-self-center mx-3 small text-muted">
                Page {currentPage} of {Math.ceil(totalItems / 10)}
              </span>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={currentPage >= Math.ceil(totalItems / 10)}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="ms-2"
              >
                Next <i className="bi bi-chevron-right"></i>
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-clock-history display-1 text-muted"></i>
          </div>
          <h4 className="mb-3">No Watch History</h4>
          <p className="text-muted mb-4">
            Start watching movies and shows to build your viewing history.
          </p>
          <Button as={Link} to="/movies" variant="primary">
            <i className="bi bi-play-circle me-2"></i>
            Browse Movies
          </Button>
        </div>
      )}
    </div>
  );
};

export default AccountWatchHistory;