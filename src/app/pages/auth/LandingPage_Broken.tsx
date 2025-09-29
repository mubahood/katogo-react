// src/app/pages/auth/LandingPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { APP_CONFIG } from "../../constants";
import { SEOHead } from "../../components/seo";
import "../../styles/auth-theme.css";
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
                        fontWeight: 'var(--ugflix-font-bold)',
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
                      padding: 'var(--ugflix-space-2) var(--ugflix-space-4)',
                      fontSize: 'var(--ugflix-text-sm)'
                    }}
                  >
                    Sign In
                  </Link>
                </Col>
              </Row>
            </Container>
          </div>

          {/* Hero Content */}
          <Container style={{ zIndex: 10, position: 'relative' }}>
            <Row>
              <Col lg={6}>
                <div className="ugflix-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div style={{
                    background: 'var(--ugflix-accent)',
                    color: 'var(--ugflix-background)',
                    padding: 'var(--ugflix-space-1) var(--ugflix-space-3)',
                    borderRadius: 'var(--ugflix-radius-full)',
                    display: 'inline-block',
                    fontSize: 'var(--ugflix-text-xs)',
                    fontWeight: 'var(--ugflix-font-bold)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: 'var(--ugflix-space-4)'
                  }}>
                    {heroSlides[currentSlide].accent}
                  </div>
                  
                  <h1 style={{
                    fontSize: 'clamp(var(--ugflix-text-4xl), 8vw, var(--ugflix-text-6xl))',
                    fontWeight: 'var(--ugflix-font-extrabold)',
                    lineHeight: '1.1',
                    marginBottom: 'var(--ugflix-space-6)',
                    textShadow: 'var(--ugflix-glow-text)'
                  }}>
                    {heroSlides[currentSlide].title}
                  </h1>
                  
                  <p style={{
                    fontSize: 'var(--ugflix-text-xl)',
                    color: 'var(--ugflix-text-secondary)',
                    marginBottom: 'var(--ugflix-space-8)',
                    maxWidth: '500px',
                    lineHeight: '1.6'
                  }}>
                    {heroSlides[currentSlide].subtitle}
                  </p>
                  
                  <div className="d-flex flex-column flex-sm-row gap-3">
                    <Link 
                      to="/auth/register"
                      className="ugflix-btn ugflix-btn-primary"
                      style={{
                        padding: 'var(--ugflix-space-4) var(--ugflix-space-8)',
                        fontSize: 'var(--ugflix-text-lg)',
                        fontWeight: 'var(--ugflix-font-bold)'
                      }}
                    >
                      <i className="bi bi-play-fill me-2" style={{ fontSize: '1.5em' }}></i>
                      Start Watching Free
                    </Link>
                    
                    <button 
                      className="ugflix-btn ugflix-btn-outline"
                      style={{
                        padding: 'var(--ugflix-space-4) var(--ugflix-space-6)',
                        fontSize: 'var(--ugflix-text-lg)'
                      }}
                    >
                      <i className="bi bi-info-circle me-2"></i>
                      Learn More
                    </button>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>

          {/* Slide Indicators */}
          <div style={{
            position: 'absolute',
            bottom: 'var(--ugflix-space-8)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 'var(--ugflix-space-2)',
            zIndex: 10
          }}>
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  background: index === currentSlide ? 'var(--ugflix-primary)' : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  transition: 'all var(--ugflix-duration-normal) ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div style={{
          background: 'var(--ugflix-background-secondary)',
          padding: 'var(--ugflix-space-20) 0'
        }}>
          <Container>
            <Row className="text-center mb-5">
              <Col>
                <h2 style={{
                  fontSize: 'var(--ugflix-text-4xl)',
                  fontWeight: 'var(--ugflix-font-bold)',
                  marginBottom: 'var(--ugflix-space-4)'
                }}>
                  Why Choose {APP_CONFIG.NAME}?
                </h2>
                <p style={{
                  fontSize: 'var(--ugflix-text-lg)',
                  color: 'var(--ugflix-text-secondary)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  Experience entertainment like never before with our premium streaming platform
                </p>
              </Col>
            </Row>
            
            <Row className="g-4">
              {[
                {
                  icon: "bi-play-circle-fill",
                  title: "Unlimited Streaming",
                  description: "Watch as many movies and shows as you want, ad-free",
                  color: "var(--ugflix-primary)"
                },
                {
                  icon: "bi-download",
                  title: "Download & Watch Offline",
                  description: "Download content to watch anywhere, even without internet",
                  color: "var(--ugflix-accent)"
                },
                {
                  icon: "bi-display",
                  title: "Watch on Any Device",
                  description: "Stream on your TV, laptop, phone, and tablet",
                  color: "var(--ugflix-info)"
                },
                {
                  icon: "bi-badge-hd",
                  title: "4K Ultra HD",
                  description: "Enjoy crystal-clear picture quality and immersive sound",
                  color: "var(--ugflix-success)"
                },
                {
                  icon: "bi-people",
                  title: "Multiple Profiles",
                  description: "Create profiles for different family members",
                  color: "var(--ugflix-warning)"
                },
                {
                  icon: "bi-shield-check",
                  title: "Safe & Secure",
                  description: "Your data and privacy are protected with us",
                  color: "var(--ugflix-primary)"
                }
              ].map((feature, index) => (
                <Col md={6} lg={4} key={index}>
                  <div 
                    className="ugflix-card ugflix-scale-in h-100"
                    style={{
                      padding: 'var(--ugflix-space-6)',
                      textAlign: 'center',
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${feature.color}, ${feature.color}33)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto var(--ugflix-space-4)',
                      boxShadow: `0 8px 32px ${feature.color}33`
                    }}>
                      <i className={`${feature.icon} text-white`} style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h4 style={{
                      fontSize: 'var(--ugflix-text-xl)',
                      fontWeight: 'var(--ugflix-font-bold)',
                      marginBottom: 'var(--ugflix-space-3)',
                      color: 'var(--ugflix-text-primary)'
                    }}>
                      {feature.title}
                    </h4>
                    <p style={{
                      color: 'var(--ugflix-text-secondary)',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {feature.description}
                    </p>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </div>

        {/* CTA Section */}
        <div style={{
          background: 'var(--ugflix-gradient-hero)',
          padding: 'var(--ugflix-space-20) 0',
          textAlign: 'center'
        }}>
          <Container>
            <Row className="justify-content-center">
              <Col lg={8}>
                <h2 style={{
                  fontSize: 'var(--ugflix-text-5xl)',
                  fontWeight: 'var(--ugflix-font-extrabold)',
                  marginBottom: 'var(--ugflix-space-6)',
                  textShadow: 'var(--ugflix-glow-text)'
                }}>
                  Ready to start your streaming journey?
                </h2>
                <p style={{
                  fontSize: 'var(--ugflix-text-xl)',
                  color: 'var(--ugflix-text-secondary)',
                  marginBottom: 'var(--ugflix-space-8)',
                  lineHeight: '1.6'
                }}>
                  Join thousands of users already enjoying unlimited entertainment on {APP_CONFIG.NAME}
                </p>
                
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-4">
                  <Link 
                    to="/auth/register"
                    className="ugflix-btn ugflix-btn-primary"
                    style={{
                      padding: 'var(--ugflix-space-5) var(--ugflix-space-10)',
                      fontSize: 'var(--ugflix-text-xl)',
                      fontWeight: 'var(--ugflix-font-bold)'
                    }}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Create Free Account
                  </Link>
                  
                  <Link 
                    to="/auth/login"
                    className="ugflix-btn ugflix-btn-accent"
                    style={{
                      padding: 'var(--ugflix-space-5) var(--ugflix-space-8)',
                      fontSize: 'var(--ugflix-text-xl)',
                      fontWeight: 'var(--ugflix-font-bold)'
                    }}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In Now
                  </Link>
                </div>
                
                <p style={{
                  marginTop: 'var(--ugflix-space-6)',
                  fontSize: 'var(--ugflix-text-sm)',
                  color: 'var(--ugflix-text-muted)'
                }}>
                  No credit card required • Cancel anytime • Watch instantly
                </p>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Footer */}
        <div style={{
          background: 'var(--ugflix-background)',
          padding: 'var(--ugflix-space-12) 0',
          borderTop: '1px solid var(--ugflix-border)'
        }}>
          <Container>
            <Row className="text-center">
              <Col>
                <div style={{ marginBottom: 'var(--ugflix-space-6)' }}>
                  <img 
                    src={APP_CONFIG.LOGO}
                    alt={APP_CONFIG.NAME}
                    style={{ height: '32px', opacity: 0.7 }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const textLogo = e.currentTarget.nextElementSibling as HTMLElement;
                      if (textLogo) textLogo.style.display = 'inline';
                    }}
                  />
                  <span 
                    className="ugflix-text-gradient"
                    style={{
                      display: 'none',
                      fontSize: 'var(--ugflix-text-xl)',
                      fontWeight: 'var(--ugflix-font-bold)'
                    }}
                  >
                    {APP_CONFIG.NAME}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 'var(--ugflix-space-6)',
                  marginBottom: 'var(--ugflix-space-6)',
                  flexWrap: 'wrap'
                }}>
                  {[
                    { to: "/terms", text: "Terms of Service" },
                    { to: "/privacy", text: "Privacy Policy" },
                    { to: "/help", text: "Help Center" },
                    { to: "/about", text: "About Us" },
                    { to: "/contact", text: "Contact" }
                  ].map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      style={{
                        color: 'var(--ugflix-text-muted)',
                        textDecoration: 'none',
                        fontSize: 'var(--ugflix-text-sm)',
                        transition: 'color var(--ugflix-duration-normal) ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ugflix-text-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ugflix-text-muted)'}
                    >
                      {link.text}
                    </Link>
                  ))}
                </div>
                
                <p style={{
                  color: 'var(--ugflix-text-muted)',
                  fontSize: 'var(--ugflix-text-sm)',
                  margin: 0
                }}>
                  © 2025 {APP_CONFIG.NAME}. All rights reserved. | Uganda's Premier Streaming Platform
                </p>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
};

export default LandingPage;