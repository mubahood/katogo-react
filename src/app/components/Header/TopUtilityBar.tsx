// src/app/components/Header/TopUtilityBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const TopUtilityBar: React.FC = () => {
  return (
    // Outer div for full-width background, hidden on mobile
    <div className="top-utility-bar-wrapper d-none d-lg-block">
      {/* Inner div to constrain content - matching main nav width */}
      <div className="container-fluid d-flex justify-content-end align-items-center py-1" style={{paddingLeft: '60px', paddingRight: '60px'}}>
        <Link to="/account/products/new" className="utility-link">Post Product</Link>
        <Link to="/account/watchlist" className="utility-link">My Watch List</Link>
        <Link to="/account/history" className="utility-link">Watch History</Link>
        <Link to="/help" className="utility-link">Help And Support</Link>
        <a href="/account/subscriptions" className="utility-link" onClick={(e) => { e.preventDefault(); window.location.href = '/account/subscriptions'; }}>My Subscription</a>
        <Link to="/mobile-apps" className="utility-link"><i className="bi bi-phone me-1"></i>Mobile Apps</Link>
      </div>
    </div>
  );
};

export default TopUtilityBar;