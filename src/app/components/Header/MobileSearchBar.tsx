// src/app/components/Header/MobileSearchBar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LiveSearchBox from '../search/LiveSearchBox';

const MobileSearchBar: React.FC = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    // Navigate to movies page with search query
    navigate(`/movies?search=${encodeURIComponent(query)}`);
  };

  return (
    // 'd-lg-none' makes this component ONLY visible on mobile screens
    <div className="mobile-search-wrapper d-lg-none">
      <LiveSearchBox
        placeholder="Search movies, series, actors..."
        onSearchSubmit={handleSearch}
        size="sm"
      />
    </div>
  );
};

export default MobileSearchBar;