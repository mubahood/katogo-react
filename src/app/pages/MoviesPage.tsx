// src/app/pages/MoviesPage.tsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import DynamicBreadcrumb from "../components/shared/DynamicBreadcrumb";
import { SEOHead } from "../components/seo";

const MoviesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search');
  const genre = searchParams.get('genre');
  const filter = searchParams.get('filter');

  // Determine page title based on parameters
  const getPageTitle = () => {
    if (search) return `Search Results: "${search}"`;
    if (genre) return `${genre.charAt(0).toUpperCase() + genre.slice(1)} Movies`;
    if (filter === 'trending') return 'Trending Movies';
    if (filter === 'new') return 'New Releases';
    return 'Browse Movies';
  };

  // SEO metadata
  const seoTitle = `${getPageTitle()} | UgFlix - Watch Movies Online`;
  const seoDescription = search 
    ? `Find movies matching "${search}" on UgFlix. Stream unlimited movies online.`
    : genre
    ? `Watch ${genre} movies online on UgFlix. Unlimited streaming of ${genre} films.`
    : 'Browse and watch thousands of movies online on UgFlix. Unlimited streaming of the latest and classic films.';

  return (
    <>
      <SEOHead 
        config={{
          basic: {
            title: seoTitle,
            description: seoDescription,
            keywords: `movies, streaming, ${genre || 'entertainment'}, watch online, UgFlix`
          },
          openGraph: {
            title: seoTitle,
            description: seoDescription,
            type: 'website',
            siteName: 'UgFlix',
            locale: 'en_US'
          },
          twitter: {
            card: 'summary',
            title: seoTitle,
            description: seoDescription
          }
        }}
      />
      
      <div className="movies-page">
        <Container>
          {/* Breadcrumb */}
          <DynamicBreadcrumb />
          
          {/* Page Header */}
          <div className="movies-header mb-4">
            <Row className="align-items-center">
              <Col>
                <h1 className="page-title">{getPageTitle()}</h1>
                {search && (
                  <p className="movies-count text-muted">
                    Showing results for "{search}"
                  </p>
                )}
                {genre && (
                  <p className="movies-count text-muted">
                    Explore our collection of {genre} movies
                  </p>
                )}
              </Col>
            </Row>
          </div>

          {/* Movies Content */}
          <Row>
            <Col>
              <Card className="text-center p-5">
                <Card.Body>
                  <div className="mb-4">
                    <i className="bi bi-film display-1 text-primary"></i>
                  </div>
                  <h3 className="mb-3">Movies Coming Soon</h3>
                  <p className="text-muted mb-4">
                    We're working on bringing you an amazing collection of movies. 
                    Stay tuned for the latest releases, trending films, and timeless classics.
                  </p>
                  <Alert variant="info" className="mx-auto" style={{maxWidth: '500px'}}>
                    <i className="bi bi-info-circle me-2"></i>
                    This page is currently under development. Check back soon for updates!
                  </Alert>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <style>{`
        .movies-page {
          padding: 20px 0;
          min-height: 60vh;
          background: var(--ugflix-bg-primary, #0a0a0a);
          color: var(--ugflix-text-primary, #ffffff);
        }

        .movies-header .page-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--ugflix-text-primary, #ffffff);
          margin-bottom: 8px;
        }

        .movies-count {
          font-size: 14px;
          color: var(--ugflix-text-secondary, #cccccc);
        }

        .card {
          background: var(--ugflix-bg-card, #1e1e1e);
          border: 1px solid var(--ugflix-border, #333333);
          border-radius: var(--ugflix-border-radius, 0px);
        }

        .card-body h3 {
          color: var(--ugflix-text-primary, #ffffff);
        }

        .text-primary {
          color: var(--ugflix-primary, #ff6b35) !important;
        }

        .text-muted {
          color: var(--ugflix-text-muted, #888888) !important;
        }
      `}</style>
    </>
  );
};

export default MoviesPage;