// src/app/components/HomePage/HeroSection.tsx
import React from "react";
import CategoryList from "./CategoryList";
import HeroCarousel from "./HeroCarousel";

// Inline styles for HeroSection following the unified design system
const heroSectionStyles = `
  .hero-section {
    margin: 0;
    padding: 0;
    width: 100%;
    max-width: 100%;
  }

  .hero-row {
    display: flex;
    gap: 1rem;
    align-items: stretch;
    width: 100%;
    max-width: 100%;
  }

  .hero-categories-col {
    flex: 0 0 280px;
    min-height: 400px;
    min-width: 280px;
  }

  .hero-carousel-col {
    flex: 1;
    min-height: 400px;
    min-width: 0;
  }

  @media (max-width: 991.98px) {
    .hero-categories-col {
      display: none;
    }
    .hero-carousel-col{
      min-height: 260px!important; 
      margin-top: 30px!important;
    } 
    
    .hero-row {
      gap: 0;
    }
  }

  @media (max-width: 767.98px) {
    .hero-section {
      margin: 0; /* Remove margin to eliminate gap */
    }
  }
`;

const HeroSection: React.FC = () => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: heroSectionStyles }} />
      <section className="hero-section">
        <div className="hero-row">
          {/* Left Column for Categories */}
          <div className="hero-categories-col">
            <CategoryList />
          </div>

          {/* Right Column for Carousel */}
          <div className="hero-carousel-col">
            <HeroCarousel />
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
