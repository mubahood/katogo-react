// src/app/components/reviews/ReviewList.tsx
import React, { useState } from 'react';
import { Card, Button, Spinner, Alert, Row, Col, Form } from 'react-bootstrap';
import { useGetProductReviewsQuery, useGetReviewStatsQuery } from '../../services/realProductsApi';
import { ReviewModel } from '../../models/ReviewModel';
import ReviewItem from './ReviewItem.tsx';
import StarRating from './StarRating';

interface ReviewListProps {
  productId: number;
  onWriteReviewClick?: () => void;
  showWriteReviewButton?: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({
  productId,
  onWriteReviewClick,
  showWriteReviewButton = true,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_rating' | 'lowest_rating'>('newest');

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useGetProductReviewsQuery({
    productId,
    page: currentPage,
    perPage: 10,
    sortBy,
  });

  const {
    data: statsData,
    isLoading: statsLoading,
  } = useGetReviewStatsQuery({ productId });

  const reviews = reviewsData?.reviews || [];
  const pagination = reviewsData?.pagination || {};
  const stats = statsData || { total_reviews: 0, average_rating: 0, rating_breakdown: {} };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort as typeof sortBy);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (!pagination.last_page || pagination.last_page <= 1) return null;

    const pages = [];
    const currentPage = pagination.current_page;
    const lastPage = pagination.last_page;

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <Button
          key="prev"
          variant="outline-primary"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          className="me-2"
        >
          Previous
        </Button>
      );
    }

    // Page numbers (show up to 5 pages)
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(lastPage, currentPage + 2);

    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={1 === currentPage ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => handlePageChange(1)}
          className="me-2"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="me-2">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="me-2"
        >
          {i}
        </Button>
      );
    }

    if (endPage < lastPage) {
      if (endPage < lastPage - 1) {
        pages.push(<span key="ellipsis2" className="me-2">...</span>);
      }
      pages.push(
        <Button
          key={lastPage}
          variant={lastPage === currentPage ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => handlePageChange(lastPage)}
          className="me-2"
        >
          {lastPage}
        </Button>
      );
    }

    // Next button
    if (currentPage < lastPage) {
      pages.push(
        <Button
          key="next"
          variant="outline-primary"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      );
    }

    return <div className="d-flex justify-content-center mt-4">{pages}</div>;
  };

  const renderRatingBreakdown = () => {
    if (!stats.rating_breakdown) return null;

    const breakdown = stats.rating_breakdown;
    const total = stats.total_reviews;

    return (
      <div className="rating-breakdown mb-4">
        {[5, 4, 3, 2, 1].map(rating => {
          const count = breakdown[`${rating}_star${rating === 1 ? '' : 's'}`] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={rating} className="d-flex align-items-center mb-2">
              <div className="rating-label" style={{ minWidth: '60px' }}>
                {rating} <i className="bi bi-star-fill text-warning"></i>
              </div>
              <div className="progress flex-grow-1 mx-3" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-warning"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="rating-count" style={{ minWidth: '40px', textAlign: 'right' }}>
                {count}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (reviewsLoading && currentPage === 1) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4 text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted mb-0">Loading reviews...</p>
        </Card.Body>
      </Card>
    );
  }

  if (reviewsError) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Alert variant="danger">
            <Alert.Heading>Error Loading Reviews</Alert.Heading>
            <p className="mb-0">
              Failed to load reviews. Please try again later.
            </p>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => refetchReviews()}
              className="mt-2"
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Retry
            </Button>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h5 className="section-title mb-0">
            <i className="bi bi-star me-2"></i>
            Customer Reviews ({stats.total_reviews})
          </h5>
          {showWriteReviewButton && (
            <Button
              variant="primary"
              size="sm"
              onClick={onWriteReviewClick}
              className="write-review-btn"
            >
              <i className="bi bi-pencil me-2"></i>
              Write Review
            </Button>
          )}
        </div>

        {/* Review Statistics */}
        {stats.total_reviews > 0 && (
          <Row className="mb-4">
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <div className="display-6 fw-bold text-primary mb-2">
                  {stats.average_rating.toFixed(1)}
                </div>
                <StarRating rating={stats.average_rating} size="lg" />
                <div className="text-muted mt-2">
                  Based on {stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}
                </div>
              </div>
            </Col>
            <Col md={8}>
              {renderRatingBreakdown()}
            </Col>
          </Row>
        )}

        {/* Sort and Filter Controls */}
        {reviews.length > 0 && (
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Sort by:</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  size="sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest_rating">Highest Rating</option>
                  <option value="lowest_rating">Lowest Rating</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-star fs-1 text-muted mb-3 d-block"></i>
            <h6>No Reviews Yet</h6>
            <p className="text-muted mb-3">
              Be the first to review this product!
            </p>
            {showWriteReviewButton && (
              <Button
                variant="primary"
                onClick={onWriteReviewClick}
              >
                <i className="bi bi-pencil me-2"></i>
                Write the First Review
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="reviews-list">
              {reviews.map((review: ReviewModel, index: number) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  isLast={index === reviews.length - 1}
                  onReviewUpdated={() => refetchReviews()}
                />
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        <style>{`
          .section-title {
            color: var(--primary-color);
            font-weight: 600;
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
          }

          .write-review-btn {
            border-radius: 0.375rem;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .write-review-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .rating-breakdown {
            font-size: 0.875rem;
          }

          .rating-label {
            font-weight: 500;
            color: var(--text-color-dark);
          }

          .rating-count {
            font-weight: 500;
            color: var(--text-color-muted);
          }

          .reviews-list > * + * {
            border-top: 1px solid var(--border-color);
            padding-top: 1.5rem;
          }

          .reviews-list > *:not(:last-child) {
            padding-bottom: 1.5rem;
          }
        `}</style>
      </Card.Body>
    </Card>
  );
};

export default ReviewList;
