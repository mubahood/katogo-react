// src/app/components/Header/TopUtilityBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const TopUtilityBar: React.FC = () => {
  return (
    // Outer div for full-width background, hidden on mobile
    <div className="top-utility-bar-wrapper d-none d-lg-block">
      {/* Inner div to constrain content */}
      <div className="container d-flex justify-content-end align-items-center py-1">
        <Link to="/upload-content" className="utility-link">Upload Content</Link>
        <Link to="/about" className="utility-link">About UgFlix</Link>
        <Link to="/contact" className="utility-link">Contact Support</Link>
        <Link to="/help" className="utility-link">Help Center</Link>
        <Link to="/mobile-apps" className="utility-link"><i className="bi bi-phone me-1"></i>Mobile Apps</Link>
        <Link to="/premium" className="utility-link"><i className="bi bi-star me-1"></i>Go Premium</Link>
      </div>
    </div>
  );
};

export default TopUtilityBar;