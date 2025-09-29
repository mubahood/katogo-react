// src/app/components/Header/TopUtilityBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const TopUtilityBar: React.FC = () => {
  return (
    // Outer div for full-width background, hidden on mobile
    <div className="top-utility-bar-wrapper d-none d-lg-block">
      {/* Inner div to constrain content */}
      <div className="container-fluid d-flex justify-content-end align-items-center py-1" style={{paddingLeft: '60px', paddingRight: '60px'}}>
        <Link to="/movies" className="utility-link">Browse Movies</Link>
        <Link to="/watchlist" className="utility-link">My Watchlist</Link>
        <Link to="/premium" className="utility-link">Premium Plans</Link>
        <Link to="/mobile-apps" className="utility-link"><i className="bi bi-phone me-1"></i>Mobile Apps</Link>
      </div>
    </div>
  );
};

export default TopUtilityBar;