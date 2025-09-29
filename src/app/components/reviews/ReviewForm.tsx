// src/app/components/reviews/ReviewForm.tsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useAddProductReviewMutation, useGetUserReviewQuery, useUpdateProductReviewMutation } from '../../services/realProductsApi';
import { showNotification } from '../../store/slices/notificationSlice';
import StarRating from './StarRating';
import Utils from '../../services/Utils';
import { DB_LOGGED_IN_PROFILE } from '../../../Constants';

interface ReviewFormProps {
  productId: number;
  onReviewSubmitted?: () => void;
  show?: boolean;
  onHide?: () => void;
  asModal?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onReviewSubmitted,
  show = false,
  onHide,
  asModal = false,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const dispatch = useDispatch();
  const currentUser = Utils.loadFromDatabase(DB_LOGGED_IN_PROFILE);

  // Check if user already has a review
  const {
    data: existingReview,
    isLoading: loadingExistingReview,
  } = useGetUserReviewQuery({ productId }, {
    skip: !currentUser,
  });

  const [addReview, { isLoading: isSubmitting }] = useAddProductReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateProductReviewMutation();

  const isEditing = !!existingReview;
  const isLoading = isSubmitting || isUpdating;

  // Populate form with existing review data
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) {
      return;
    }
    
    setError('');
    setSuccess('');

    if (!currentUser) {
      setError('You must be logged in to submit a review.');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a review comment.');
      return;
    }

    try {
      let response;
      if (isEditing) {
        response = await updateReview({
          reviewId: existingReview.id,
          rating,
          comment: comment.trim(),
          productId: existingReview.product_id,
        }).unwrap();
        
        const successMessage = 'Your review has been updated successfully!';
        setSuccess(successMessage);
        dispatch(showNotification({ 
          message: successMessage, 
          type: 'success' 
        }));
      } else {
        response = await addReview({
          productId,
          rating,
          comment: comment.trim(),
        }).unwrap();
        
        const successMessage = 'Thank you for your review!';
        setSuccess(successMessage);
        dispatch(showNotification({ 
          message: successMessage, 
          type: 'success' 
        }));
      }

      // Call the callback only after successful submission
      onReviewSubmitted?.();

      // If it's a modal, close it after a delay to show success state
      if (asModal && onHide) {
        setTimeout(() => {
          onHide();
          // Reset form state after modal closes
          setRating(0);
          setComment('');
          setSuccess('');
          setError('');
        }, 1500);
      } else {
        // Reset form for inline forms after delay
        setTimeout(() => {
          setRating(0);
          setComment('');
          setSuccess('');
          setError('');
        }, 3000);
      }
    } catch (err: any) {
      console.error('Review submission error:', err);
      
      // Extract error message from different possible locations
      let errorMessage = 'Failed to submit review. Please try again.';
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      dispatch(showNotification({ 
        message: errorMessage, 
        type: 'error' 
      }));
      
      // Don't close modal on error - let user try again
    }
  };

  const handleCancel = () => {
    if (asModal && onHide) {
      onHide();
    } else {
      // Reset form
      setRating(existingReview ? existingReview.rating : 0);
      setComment(existingReview ? existingReview.comment : '');
      setError('');
      setSuccess('');
    }
  };

  if (loadingExistingReview) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4 text-center">
          <div className="spinner-border text-primary mb-3" />
          <p className="text-muted mb-0">Loading...</p>
        </Card.Body>
      </Card>
    );
  }

  if (!currentUser) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4 text-center">
          <i className="bi bi-person-circle fs-1 text-muted mb-3 d-block"></i>
          <h6>Sign In to Write a Review</h6>
          <p className="text-muted mb-0">
            You need to be logged in to share your thoughts about this product.
          </p>
        </Card.Body>
      </Card>
    );
  }

  const formContent = (
    <>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">
            Rate this product <span className="text-danger">*</span>
          </Form.Label>
          <div className="mt-2">
            <StarRating
              rating={rating}
              interactive
              onRatingChange={setRating}
              size="lg"
            />
            {rating > 0 && (
              <div className="mt-2">
                <small className="text-muted">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </small>
              </div>
            )}
          </div>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">
            Your review <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this product. What did you like or dislike about it?"
            maxLength={1000}
            required
          />
          <Form.Text className="text-muted">
            {comment.length}/1000 characters
          </Form.Text>
        </Form.Group>

        <div className="d-flex gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || rating === 0 || !comment.trim() || success !== ''}
            className="flex-grow-1"
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                {isEditing ? 'Updating Review...' : 'Submitting Review...'}
              </>
            ) : success ? (
              <>
                <i className="bi bi-check-circle me-2"></i>
                {isEditing ? 'Review Updated!' : 'Review Submitted!'}
              </>
            ) : (
              <>
                <i className="bi bi-send me-2"></i>
                {isEditing ? 'Update Review' : 'Submit Review'}
              </>
            )}
          </Button>

          {(asModal || isEditing) && (
            <Button
              type="button"
              variant="outline-secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      </Form>

      <style>{`
        .review-form-card {
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-sm);
          background: var(--white);
        }

        .form-label {
          color: var(--text-color-dark);
        }

        .form-control:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 0.2rem rgba(var(--primary-color-rgb), 0.25);
        }

        .btn-primary {
          background-color: var(--primary-color);
          border-color: var(--primary-color);
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .btn-outline-secondary {
          border-color: var(--border-color);
          color: var(--text-color);
        }

        .btn-outline-secondary:hover:not(:disabled) {
          background-color: var(--background-light);
          border-color: var(--text-color-muted);
        }
      `}</style>
    </>
  );

  if (asModal) {
    return (
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {formContent}
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Card className="border-0 shadow-sm review-form-card">
      <Card.Body className="p-4">
        <h5 className="section-title mb-4">
          <i className="bi bi-pencil-square me-2"></i>
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </h5>
        {formContent}
      </Card.Body>
    </Card>
  );
};

export default ReviewForm;
