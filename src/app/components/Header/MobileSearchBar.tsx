// src/app/components/Header/MobileSearchBar.tsx
import React from 'react';

const MobileSearchBar: React.FC = () => {
  return (
    // 'd-lg-none' makes this component ONLY visible on mobile screens
    <div className="mobile-search-wrapper d-lg-none">
      <form role="search">
        <div className="input-group">
          <input type="search" className="form-control" placeholder="I'm shopping for..." />
          <button className="btn btn-search" type="submit">
            <i className="bi bi-search"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MobileSearchBar;