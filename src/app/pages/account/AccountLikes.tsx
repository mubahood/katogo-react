// src/app/pages/account/AccountLikes.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AccountApiService, { LikedContent } from '../../services/AccountApiService';

const AccountLikes: React.FC = () => {
  const [likedContent, setLikedContent] = useState<LikedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadLikedContent();
  }, [currentPage]);

  const loadLikedContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await AccountApiService.getLikedContent(currentPage);
      setLikedContent(response.data);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Error loading liked content:', error);
      setError('Failed to load liked content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlike = async (likeId: number) => {
    try {
      await AccountApiService.unlikeContent(likeId);
      // Remove from local state
      setLikedContent(prev => prev.filter(item => item.id !== likeId));
      setTotalItems(prev => prev - 1);
    } catch (error) {
      console.error('Error unliking content:', error);
    }
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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star text-warning"></i>);
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading liked content...</span>
      </div>
    );
  }

  return (
    <div className="account-likes">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title mb-2">My Likes</h2>
          <p className="text-muted">Content you've liked and enjoyed</p>
        </div>
        <Badge bg="primary" className="fs-6">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {likedContent.length > 0 ? (
        <>
          <Row>
            {likedContent.map((item) => (
              <Col md={6} lg={4} key={item.id} className="mb-4">
                <Card className="h-100 border-0 shadow-sm liked-content-card">
                  <div className="position-relative">
                    {item.product.image ? (
                      <Card.Img 
                        variant="top" 
                        src={item.product.image} 
                        alt={item.product.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="bg-light d-flex align-items-center justify-content-center"
                        style={{ height: '200px' }}
                      >
                        <i className="bi bi-heart display-4 text-muted"></i>
                      </div>
                    )}
                    
                    {/* Like indicator */}
                    <div className="position-absolute top-0 end-0 p-2">
                      <Button
                        variant="danger"
                        size="sm"
                        className="rounded-circle"
                        onClick={() => handleUnlike(item.id)}
                        title="Unlike"
                      >
                        <i className="bi bi-heart-fill"></i>
                      </Button>
                    </div>
                  </div>
                  
                  <Card.Body>
                    <h6 className="card-title mb-2">{item.product.name}</h6>
                    
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      {item.product.price && (
                        <span className="text-primary fw-bold">
                          ${item.product.price.toFixed(2)}
                        </span>
                      )}
                      <small className="text-muted">
                        Liked {formatDate(item.liked_at)}
                      </small>
                    </div>

                    {item.product.rating && (
                      <div className="rating mb-3">
                        <div className="d-flex align-items-center">
                          <div className="stars me-2">
                            {renderStars(item.product.rating)}
                          </div>
                          <small className="text-muted">
                            ({item.product.rating.toFixed(1)})
                          </small>
                        </div>
                      </div>
                    )}
                  </Card.Body>

                  <Card.Footer className="bg-transparent border-0 pt-0">
                    <div className="d-grid gap-2 d-md-flex">
                      <Button 
                        onClick={() => window.location.href = `/product/${item.product_id}`}
                        variant="outline-primary" 
                        size="sm"
                        className="flex-grow-1"
                      >
                        <i className="bi bi-eye me-2"></i>
                        View Details
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleUnlike(item.id)}
                        title="Remove from likes"
                      >
                        <i className="bi bi-heart-fill"></i>
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalItems > 12 && (
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
                Page {currentPage} of {Math.ceil(totalItems / 12)}
              </span>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={currentPage >= Math.ceil(totalItems / 12)}
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
            <i className="bi bi-heart display-1 text-muted"></i>
          </div>
          <h4 className="mb-3">No Liked Content</h4>
          <p className="text-muted mb-4">
            Start liking movies, shows, and products to see them here.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Button onClick={() => window.location.href = '/movies'} variant="primary">
              <i className="bi bi-play-circle me-2"></i>
              Browse Movies
            </Button>
            <Button onClick={() => window.location.href = '/products'} variant="outline-primary">
              <i className="bi bi-bag me-2"></i>
              Browse Products
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountLikes;