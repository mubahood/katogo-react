// src/app/components/reviews/ReviewItem.tsx
import React, { useState } from 'react';
import { Button, Modal, Alert, Form } from 'react-bootstrap';
import { useDeleteProductReviewMutation, useUpdateProductReviewMutation } from '../../services/realProductsApi';
import { ReviewModel } from '../../models/ReviewModel';
import StarRating from './StarRating';
import Utils from '../../services/Utils';
import { DB_LOGGED_IN_PROFILE } from '../../../Constants';

interface ReviewItemProps {
  review: ReviewModel;
  isLast?: boolean;
  onReviewUpdated?: () => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  isLast = false,
  onReviewUpdated,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment);

  const currentUser = Utils.loadFromDatabase(DB_LOGGED_IN_PROFILE);
  const isOwner = currentUser && currentUser.id === review.user_id;

  const [updateReview, { isLoading: isUpdating }] = useUpdateProductReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteProductReviewMutation();

  const handleEditSubmit = async () => {
    try {
      await updateReview({
        reviewId: review.id,
        rating: editRating,
        comment: editComment,
        productId: review.product_id,
      }).unwrap();
      
      setShowEditModal(false);
      onReviewUpdated?.();
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReview({ 
        reviewId: review.id,
        productId: review.product_id
      }).unwrap();
      setShowDeleteModal(false);
      onReviewUpdated?.();
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <>
      <div className={`review-item ${!isLast ? 'mb-4' : ''}`}>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="review-header">
            <div className="d-flex align-items-center mb-2">
              <div className="reviewer-avatar me-3">
                <i className="bi bi-person-circle fs-4 text-muted"></i>
              </div>
              <div>
                <h6 className="reviewer-name mb-1">{review.user.name}</h6>
                <StarRating rating={review.rating} size="sm" />
              </div>
            </div>
          </div>
          
          {isOwner && (
            <div className="review-actions">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="me-2"
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </div>
          )}
        </div>

        <div className="review-content mb-3">
          <p className="review-comment mb-2">{review.comment}</p>
        </div>

        <div className="review-meta">
          <small className="text-muted">
            <i className="bi bi-clock me-1"></i>
            {formatRelativeTime(review.created_at)} • {formatDate(review.created_at)}
            {review.updated_at !== review.created_at && (
              <span className="ms-2">
                <i className="bi bi-pencil-square me-1"></i>
                Edited
              </span>
            )}
          </small>
        </div>
      </div>

      {/* Edit Review Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Your Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Rating</Form.Label>
              <div className="mt-2">
                <StarRating
                  rating={editRating}
                  interactive
                  onRatingChange={setEditRating}
                  size="lg"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Your Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Share your thoughts about this product..."
                maxLength={1000}
              />
              <Form.Text className="text-muted">
                {editComment.length}/1000 characters
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleEditSubmit}
            disabled={isUpdating || !editComment.trim()}
          >
            {isUpdating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Updating...
              </>
            ) : (
              'Update Review'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <Alert.Heading>Are you sure?</Alert.Heading>
            <p className="mb-0">
              This action cannot be undone. Your review will be permanently deleted.
            </p>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Deleting...
              </>
            ) : (
              'Delete Review'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .review-item {
          position: relative;
        }

        .review-header {
          flex: 1;
        }

        .reviewer-name {
          font-weight: 600;
          color: var(--text-color-dark);
          margin-bottom: 0;
        }

        .review-actions {
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        .review-item:hover .review-actions {
          opacity: 1;
        }

        .review-comment {
          line-height: 1.6;
          color: var(--text-color);
          margin-bottom: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .review-meta {
          font-size: 0.875rem;
        }

        .reviewer-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 576px) {
          .review-actions {
            opacity: 1;
          }
          
          .review-actions .btn {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </>
  );
};

export default ReviewItem;
