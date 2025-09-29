// src/app/pages/account/AccountSubscriptions.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import AccountApiService, { Subscription } from '../../services/AccountApiService';
import ToastService from '../../services/ToastService';

const AccountSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await AccountApiService.getSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setError('Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: number) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      try {
        await AccountApiService.cancelSubscription(subscriptionId);
        loadSubscriptions(); // Reload to show updated status
      } catch (error) {
        console.error('Error cancelling subscription:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'cancelled': return 'warning';
      case 'expired': return 'danger';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading subscriptions...</span>
      </div>
    );
  }

  return (
    <div className="account-subscriptions">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title mb-2">My Subscriptions</h2>
          <p className="text-muted">Manage your active and past subscriptions</p>
        </div>
        <Button variant="primary" size="sm">
          <i className="bi bi-plus-circle me-2"></i>
          Browse Plans
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {subscriptions.length > 0 ? (
        <Row>
          {subscriptions.map((subscription) => (
            <Col md={6} lg={4} key={subscription.id} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-transparent border-0 pb-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title mb-1">{subscription.plan_name}</h5>
                      <Badge bg={getStatusColor(subscription.status)} className="mb-2">
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-end">
                      <h4 className="text-primary mb-0">${subscription.price}</h4>
                      <small className="text-muted">/{subscription.billing_cycle}</small>
                    </div>
                  </div>
                </Card.Header>
                
                <Card.Body>
                  <div className="subscription-dates mb-3">
                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span>Started:</span>
                      <span>{formatDate(subscription.started_at)}</span>
                    </div>
                    <div className="d-flex justify-content-between small text-muted">
                      <span>
                        {subscription.status === 'active' ? 'Renews:' : 'Expired:'}
                      </span>
                      <span>{formatDate(subscription.expires_at)}</span>
                    </div>
                  </div>

                  {subscription.features && subscription.features.length > 0 && (
                    <div className="subscription-features mb-3">
                      <h6 className="small text-muted mb-2">Features:</h6>
                      <ul className="list-unstyled small">
                        {subscription.features.map((feature, index) => (
                          <li key={index} className="mb-1">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card.Body>

                <Card.Footer className="bg-transparent border-0 pt-0">
                  {subscription.status === 'active' && (
                    <div className="d-grid gap-2">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleCancelSubscription(subscription.id)}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel Subscription
                      </Button>
                    </div>
                  )}
                  {subscription.status === 'cancelled' && (
                    <div className="text-center">
                      <small className="text-muted">
                        Access until {formatDate(subscription.expires_at)}
                      </small>
                    </div>
                  )}
                  {subscription.status === 'expired' && (
                    <Button variant="primary" size="sm" className="w-100">
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Renew Subscription
                    </Button>
                  )}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-collection-play display-1 text-muted"></i>
          </div>
          <h4 className="mb-3">No Subscriptions</h4>
          <p className="text-muted mb-4">
            You don't have any active subscriptions. Browse our plans to get started.
          </p>
          <Button variant="primary">
            <i className="bi bi-plus-circle me-2"></i>
            Browse Subscription Plans
          </Button>
        </div>
      )}
    </div>
  );
};

export default AccountSubscriptions;