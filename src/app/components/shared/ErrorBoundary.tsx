// src/app/components/shared/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Container, Card } from 'react-bootstrap';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  sentryEventId?: string;
}

/**
 * Production-ready Error Boundary with comprehensive error handling
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to external service in production
    const sentryEventId = this.logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      sentryEventId,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo): string | undefined => {
    // ERR-02/05: Send to Sentry
    try {
      return Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
          errorId: this.state.errorId,
          userId: this.getUserId(),
          url: window.location.href,
        },
      });
    } catch { /* ignore if Sentry not configured */ }

    if (!import.meta.env.PROD) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    return undefined;
  };

  private getUserId = (): string | null => {
    try {
      const user = localStorage.getItem('ugflix_user');
      return user ? JSON.parse(user)?.id?.toString() : null;
    } catch {
      return null;
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, sentryEventId: undefined });
  };

  private handleReportProblem = () => {
    try {
      if (this.state.sentryEventId) {
        Sentry.showReportDialog({ eventId: this.state.sentryEventId });
        return;
      }
    } catch {
      // fall through to alert fallback
    }

    alert(`Error ID: ${this.state.errorId ?? 'unknown'}. Please contact support.`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Container className="py-5">
          <Card className="mx-auto" style={{ maxWidth: '600px' }}>
            <Card.Body className="text-center p-5">
              <div className="mb-4">
                <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '4rem' }}></i>
              </div>
              
              <h2 className="h4 mb-3 text-danger">Oops! Something went wrong</h2>
              
              <p className="text-muted mb-4">
                We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
              </p>

              {this.state.errorId && (
                <Alert variant="light" className="text-start">
                  <small>
                    <strong>Error ID:</strong> {this.state.errorId}<br />
                    <strong>Time:</strong> {new Date().toLocaleString()}
                  </small>
                </Alert>
              )}

              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Button 
                  variant="primary" 
                  onClick={this.handleRetry}
                  className="me-md-2"
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Try Again
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={this.handleGoHome}
                  className="me-md-2"
                >
                  <i className="bi bi-house me-2"></i>
                  Go Home
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={this.handleReload}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Reload Page
                </Button>

                <Button
                  variant="outline-danger"
                  onClick={this.handleReportProblem}
                >
                  <i className="bi bi-flag me-2"></i>
                  Report Problem
                </Button>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <Alert variant="danger" className="mt-4 text-start">
                  <details>
                    <summary className="fw-bold">Development Error Details</summary>

                    <pre className="mt-2 small">
                      {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                      {this.state.errorInfo?.componentStack && (
                        '\n\nComponent Stack:' + this.state.errorInfo.componentStack
                      )}
                    </pre>
                  </details>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;