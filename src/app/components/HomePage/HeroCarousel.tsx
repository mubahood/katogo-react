// src/app/components/HomePage/HeroCarousel.tsx
import React from "react";
import { Carousel, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useManifestCategories, useManifest } from "../../hooks/useManifest";
import Utils from "../../utils/imageUtils";

// Inline styles for HeroCarousel following the unified design system
const heroCarouselStyles = `
  .hero-carousel-wrapper {
    width: 100%;
    height: 400px;
    position: relative;
    background-color: var(--background-light);
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  .hero-carousel-container {
    width: 100%;
    height: 100%;
  }

  .carousel {
    height: 100%;
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  .carousel-inner {
    height: 100%;
    border-radius: var(--border-radius);
  }

  .carousel-item {
    height: 100%;
  }

  .hero-slide {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: var(--border-radius);
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .hero-slide-link {
    display: block;
    width: 100%;
    height: 100%;
    text-decoration: none;
    color: inherit;
  }

  .hero-slide-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.2)); /* Much lighter gradient */
    padding: 2rem 1.5rem 1.5rem;
    color: var(--white);
  }

  .hero-category-badge {
    background-color: var(--primary-color);
    color: var(--white);
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
    font-size: 0.9rem;
    font-weight: 600;
    display: inline-block;
    margin-bottom: 0.5rem;
  }

  .hero-slide-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.1); /* Much lighter hover overlay */
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .hero-slide:hover .hero-slide-overlay {
    opacity: 1;
  }

  .hero-slide-overlay-content {
    text-align: center;
    color: var(--white);
  }

  .hero-slide-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .hero-slide-button {
    background-color: var(--white);
    color: var(--primary-color);
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    font-weight: 600;
    text-decoration: none;
    display: inline-block;
    transition: all 0.2s ease;
  }

  .hero-slide-button:hover {
    background-color: var(--primary-color);
    color: var(--white);
    text-decoration: none;
  }

  .carousel-indicators {
    bottom: 1rem;
    margin-bottom: 0;
  }

  .carousel-indicators [data-bs-target] {
    width: 8px;
    height: 8px;
    border-radius: var(--border-radius);
    background-color: rgba(255, 255, 255, 0.5);
    border: none;
    margin: 0 0.25rem;
    transition: all 0.2s ease;
  }

  .carousel-indicators .active {
    background-color: var(--white);
    transform: scale(1.2);
  }

  .hero-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    flex-direction: column;
    gap: 1rem;
    color: var(--text-color-medium);
  }

  .hero-error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    flex-direction: column;
    text-align: center;
    color: var(--text-color-medium);
  }

  @media (max-width: 767.98px) {
    .hero-carousel-wrapper {
      height: 300px;
    }
    
    .hero-slide-content {
      padding: 1.5rem 1rem 1rem;
    }
    
    .hero-category-badge {
      font-size: 0.8rem;
      padding: 0.4rem 0.8rem;
    }
    
    .hero-slide-title {
      font-size: 1.25rem;
    }
    
    .hero-slide-button {
      padding: 0.6rem 1.2rem;
      font-size: 0.9rem;
    }
  }

  @media (max-width: 480px) {
    .hero-carousel-wrapper {
      height: 250px;
    }
    
    .hero-slide-content {
      padding: 1rem 0.75rem 0.75rem;
    }
    
    .hero-slide-title {
      font-size: 1.1rem;
    }
  }
`;

const HeroCarousel: React.FC = () => {
  const categories = useManifestCategories();
  const { isLoading, error } = useManifest();

  // Filter categories that have show_in_banner = "Yes" exactly like Flutter
  const bannerCategories =
    categories?.filter((cat) => {
      const showInBanner =
        cat.show_in_banner?.toString().toLowerCase() === "yes";
      const hasBannerImage = cat.banner_image && cat.banner_image.trim() !== "";
      return showInBanner; // Only check show_in_banner, image is optional
    }) || [];

  if (isLoading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: heroCarouselStyles }} />
        <div className="hero-carousel-wrapper">
          <div className="hero-loading">
            <Spinner animation="border" variant="primary" />
            <span>Loading banners...</span>
          </div>
        </div>
      </>
    );
  }

  if (error || bannerCategories.length === 0) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: heroCarouselStyles }} />
        <div className="hero-carousel-wrapper">
          <div className="hero-error">
            <h5>No banners configured</h5>
            <p>Contact admin to set up category banners</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: heroCarouselStyles }} />
      <div className="hero-carousel-wrapper">
        <div className="hero-carousel-container">
          <Carousel
            interval={4000} // 4 seconds like Flutter
            fade={true} // Modern fade effect
            pause="hover"
            controls={false}
            indicators={true}
            aria-label="Product category banners"
          >
            {bannerCategories.map((category) => {
              const bannerImageUrl = category.banner_image
                ? Utils.img(category.banner_image)
                : null;

              return (
                <Carousel.Item key={category.id}>
                  <Link
                    to={`/products?category=${category.id}`}
                    className="hero-slide-link"
                    aria-label={`Shop ${category.category} products`}
                  >
                    <div
                      className="hero-slide"
                      style={{
                        background: bannerImageUrl
                          ? `linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.1)), url(${bannerImageUrl})` /* Much lighter overlay */
                          : `linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      {/* Category badge and content */}
                      <div className="hero-slide-content">
                        <span className="hero-category-badge">
                          {category.category}
                        </span>
                      </div>

                      {/* Hover overlay */}
                      <div className="hero-slide-overlay">
                        <div className="hero-slide-overlay-content">
                          <h3 className="hero-slide-title">Shop {category.category}</h3>
                          <span className="hero-slide-button">
                            Explore Collection →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Carousel.Item>
              );
            })}
          </Carousel>
        </div>
      </div>
    </>
  );
};

export default React.memo(HeroCarousel);
