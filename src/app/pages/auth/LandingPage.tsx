// src/app/pages/auth/LandingPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { APP_CONFIG } from "../../constants";
import { SEOHead } from "../../components/seo";
import AuthGuard from "../../components/Auth/AuthGuard";


const LandingPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Remove body padding for landing page
  useEffect(() => {
    document.body.style.paddingTop = '0';
    return () => {
      document.body.style.paddingTop = 'calc(56px + 35px + 0px)';
    };
  }, []);

  const landingPageMeta = {
    basic: {
      title: `${APP_CONFIG.NAME} - Stream Movies & TV Shows | Uganda's Premier Streaming Platform`,
      description: `Stream thousands of movies and TV shows on ${APP_CONFIG.NAME}. Watch the latest releases, classic films, and exclusive content. Start your streaming journey today!`,
      keywords: "streaming, movies, TV shows, entertainment, Uganda, UgFlix, online streaming, watch movies, binge watch",
    },
    openGraph: {
      title: `${APP_CONFIG.NAME} - Uganda's Premier Streaming Platform`,
      description: "Stream thousands of movies and TV shows. Watch anywhere, anytime. Start your free trial today!",
      url: window.location.origin,
      image: APP_CONFIG.LOGO,
      type: "website",
      siteName: APP_CONFIG.NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${APP_CONFIG.NAME} - Stream Movies & TV Shows`,
      description: "Uganda's premier streaming platform. Watch thousands of movies and TV shows instantly!",
    },
  };

  const heroSlides = [
    {
      title: "Unlimited Movies & Series",
      subtitle: "Stream thousands of premium titles instantly",
      image: "https://images.unsplash.com/photo-1489599904323-b1ff8516e206?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80",
      accent: "New releases every week"
    },
    {
      title: "Watch Anywhere, Anytime",
      subtitle: "On your TV, laptop, phone & more",
      image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1952&q=80",
      accent: "Download for offline viewing"
    },
    {
      title: "Premium Content Library",
      subtitle: "Exclusive movies and original series",
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80", 
      accent: "4K Ultra HD available"
    }
  ];

  const features = [
    {
      icon: "🎬",
      title: "Unlimited Movies & Series",
      description: "Access thousands of premium movies and TV series in crystal-clear HD quality",
    },
    {
      icon: "📱",
      title: "Watch Anywhere, Anytime",
      description: "Stream seamlessly on any device - smartphone, tablet, smart TV, or computer",
    },
    {
      icon: "⚡",
      title: "Lightning-Fast Streaming",
      description: "Ultra-fast streaming technology with zero buffering and instant playback",
    },
    {
      icon: "🌟",
      title: "Premium Experience",
      description: "Curated content library with the latest releases and timeless classics",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Movies & Series" },
    { number: "500K+", label: "Active Users" },
    { number: "4K/HD", label: "Quality Streaming" },
    { number: "24/7", label: "Customer Support" },
  ];

  // Hero slideshow rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthGuard requireAuth={false}>
      <SEOHead config={landingPageMeta} />
      
      {/* UgFlix Landing Page */}
      <div className="ugflix-landing">
        {/* Hero Section */}
        <div className="ugflix-hero" style={{
          height: '100vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${heroSlides[currentSlide].image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 2s ease-in-out'
        }}>
          {/* Navigation Bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
            padding: '1rem 0'
          }}>
            <Container>
              <Row className="align-items-center">
                <Col>
                  <div className="d-flex align-items-center">
                    <img 
                      src={APP_CONFIG.LOGO}
                      alt={APP_CONFIG.NAME}
                      style={{ 
                        height: '40px',
                        marginRight: '1rem'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const textLogo = e.currentTarget.nextElementSibling as HTMLElement;
                        if (textLogo) textLogo.style.display = 'inline';
                      }}
                    />
                    <h1 
                      className="ugflix-text-gradient"
                      style={{
                        display: 'none',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        margin: 0
                      }}
                    >
                      {APP_CONFIG.NAME}
                    </h1>
                  </div>
                </Col>
                <Col xs="auto">
                  <Link 
                    to="/auth/login" 
                    className="ugflix-btn ugflix-btn-outline"
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    Sign In
                  </Link>
                </Col>
              </Row>
            </Container>
          </div>

          {/* Hero Content */}
          <Container style={{ zIndex: 50 }}>
            <Row>
              <Col lg={8} xl={6}>
                <div className="ugflix-hero-content">
                  <div 
                    className="ugflix-badge"
                    style={{
                      display: 'inline-block',
                      background: 'var(--ugflix-primary)',
                      color: 'var(--ugflix-bg-primary)',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '1rem'
                    }}
                  >
                    {heroSlides[currentSlide].accent}
                  </div>
                  
                  <h1 
                    className="ugflix-text-gradient"
                    style={{
                      fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                      fontWeight: 'bold',
                      lineHeight: '1.1',
                      marginBottom: '1rem'
                    }}
                  >
                    {heroSlides[currentSlide].title}
                  </h1>
                  
                  <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--ugflix-text-secondary)',
                    marginBottom: '2rem',
                    maxWidth: '500px'
                  }}>
                    {heroSlides[currentSlide].subtitle}
                  </p>

                  <div className="d-flex flex-wrap gap-3">
                    <Link 
                      to="/auth/register" 
                      className="ugflix-btn ugflix-btn-primary"
                      style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1.125rem',
                        fontWeight: '600'
                      }}
                    >
                      Start Streaming Now
                    </Link>
                    
                    <Link 
                      to="/auth/login" 
                      className="ugflix-btn ugflix-btn-secondary"
                      style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1.125rem'
                      }}
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>

          {/* Slide Indicators */}
          <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.5rem',
            zIndex: 50
          }}>
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  width: '12px',
                  height: '12px',
                  background: index === currentSlide ? 'var(--ugflix-primary)' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  borderRadius: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Features Section */}
        <section style={{
          padding: '5rem 0',
          background: 'var(--ugflix-bg-secondary)'
        }}>
          <Container>
            <Row className="text-center mb-5">
              <Col>
                <h2 className="ugflix-text-gradient" style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  Why Choose {APP_CONFIG.NAME}?
                </h2>
                <p style={{
                  fontSize: '1.25rem',
                  color: 'var(--ugflix-text-secondary)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  Experience entertainment like never before with our premium streaming platform
                </p>
              </Col>
            </Row>
            
            <Row className="g-4">
              {features.map((feature, index) => (
                <Col md={6} lg={3} key={index}>
                  <div className="ugflix-card h-100 text-center" style={{
                    padding: '1.5rem',
                    transition: 'all 0.3s ease',
                  }}>
                    <div style={{
                      fontSize: '3rem',
                      marginBottom: '1rem',
                      display: 'block'
                    }}>
                      {feature.icon}
                    </div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '0.75rem',
                      color: 'var(--ugflix-text-primary)'
                    }}>
                      {feature.title}
                    </h3>
                    <p style={{
                      color: 'var(--ugflix-text-secondary)',
                      fontSize: '1rem',
                      lineHeight: '1.6'
                    }}>
                      {feature.description}
                    </p>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Stats Section */}
        <section style={{
          padding: '4rem 0',
          background: 'var(--ugflix-bg-primary)'
        }}>
          <Container>
            <Row className="text-center">
              {stats.map((stat, index) => (
                <Col md={3} key={index} className="mb-4 mb-md-0">
                  <div className="ugflix-stat">
                    <div className="ugflix-text-gradient" style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>
                      {stat.number}
                    </div>
                    <div style={{
                      color: 'var(--ugflix-text-secondary)',
                      fontSize: '1.125rem',
                      fontWeight: '500'
                    }}>
                      {stat.label}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* CTA Section */}
        <section style={{
          padding: '5rem 0',
          background: 'linear-gradient(135deg, var(--ugflix-primary), var(--ugflix-primary-dark))',
          color: 'var(--ugflix-bg-primary)'
        }}>
          <Container>
            <Row className="text-center">
              <Col lg={8} className="mx-auto">
                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: 'var(--ugflix-bg-primary)'
                }}>
                  Ready to Start Streaming?
                </h2>
                <p style={{
                  fontSize: '1.25rem',
                  marginBottom: '2rem',
                  opacity: 0.9,
                  maxWidth: '500px',
                  margin: '0 auto 2rem'
                }}>
                  Join thousands of users already enjoying unlimited entertainment on {APP_CONFIG.NAME}
                </p>
                
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Link 
                    to="/auth/register" 
                    className="ugflix-btn"
                    style={{
                      background: 'var(--ugflix-bg-primary)',
                      color: 'var(--ugflix-primary)',
                      border: '2px solid var(--ugflix-bg-primary)',
                      padding: '0.75rem 1.5rem',
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Create Free Account
                  </Link>
                  
                  <Link 
                    to="/auth/login" 
                    className="ugflix-btn"
                    style={{
                      background: 'transparent',
                      color: 'var(--ugflix-bg-primary)',
                      border: '2px solid var(--ugflix-bg-primary)',
                      padding: '0.75rem 1.5rem',
                      fontSize: '1.125rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Already Have Account?
                  </Link>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Footer */}
        <footer style={{
          padding: '3rem 0',
          background: 'var(--ugflix-bg-secondary)',
          borderTop: '1px solid var(--ugflix-border)'
        }}>
          <Container>
            <Row className="text-center">
              <Col>
                <div className="d-flex align-items-center justify-content-center mb-4">
                  <img 
                    src={APP_CONFIG.LOGO}
                    alt={APP_CONFIG.NAME}
                    style={{ 
                      height: '32px',
                      marginRight: '0.75rem'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const textLogo = e.currentTarget.nextElementSibling as HTMLElement;
                      if (textLogo) textLogo.style.display = 'inline';
                    }}
                  />
                  <h3 
                    className="ugflix-text-gradient"
                    style={{
                      display: 'none',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      margin: 0
                    }}
                  >
                    {APP_CONFIG.NAME}
                  </h3>
                </div>
                
                <p style={{
                  color: 'var(--ugflix-text-secondary)',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}>
                  Uganda's premier streaming platform for movies and TV shows
                </p>
                
                <p style={{
                  color: 'var(--ugflix-text-muted)',
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  © 2024 {APP_CONFIG.NAME}. All rights reserved.
                </p>
              </Col>
            </Row>
          </Container>
        </footer>
      </div>
    </AuthGuard>
  );
};

export default LandingPage;