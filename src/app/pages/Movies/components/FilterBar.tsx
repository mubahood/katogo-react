// src/app/pages/Movies/components/FilterBar.tsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Offcanvas } from 'react-bootstrap';
import { Filter, X, ChevronDown } from 'react-feather';
import { manifestService } from '../../../services/manifest.service';
import './FilterBar.css';

export interface FilterOptions {
  genre?: string;
  vj?: string;
  type?: 'Movie' | 'Series' | 'All';
  year?: number;
  is_premium?: boolean;
}

interface FilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  availableGenres?: string[];
  availableVJs?: string[];
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  availableGenres = [],
  availableVJs = [],
  className = ''
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [genres, setGenres] = useState<string[]>(availableGenres);
  const [vjs, setVJs] = useState<string[]>(availableVJs);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Load genres and VJs from manifest if not provided
  useEffect(() => {
    if (availableGenres.length === 0 || availableVJs.length === 0) {
      loadFilterOptions();
    }
  }, [availableGenres, availableVJs]);

  const loadFilterOptions = async () => {
    try {
      setIsLoadingOptions(true);
      const manifest = await manifestService.getManifest();
      
      if (manifest.code === 1 && manifest.data) {
        if (manifest.data.genres) {
          setGenres(manifest.data.genres);
        }
        if (manifest.data.vj) {
          setVJs(manifest.data.vj);
        }
      }
    } catch (error) {
      console.error('Failed to load filter options:', error);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'All' || value === '' ? undefined : value
    });
  };

  const hasActiveFilters = () => {
    return filters.genre || filters.vj || (filters.type && filters.type !== 'All') || filters.year || filters.is_premium;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.genre) count++;
    if (filters.vj) count++;
    if (filters.type && filters.type !== 'All') count++;
    if (filters.year) count++;
    if (filters.is_premium) count++;
    return count;
  };

  // Filter Controls Component (reusable for desktop and mobile)
  const FilterControls = () => (
    <div className="filter-controls">
      {/* Genre Filter */}
      <div className="filter-group">
        <label className="filter-label">Genre</label>
        <Form.Select
          value={filters.genre || 'All'}
          onChange={(e) => handleFilterChange('genre', e.target.value)}
          className="filter-select"
          disabled={isLoadingOptions}
        >
          <option value="All">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </Form.Select>
      </div>

      {/* VJ Filter */}
      <div className="filter-group">
        <label className="filter-label">VJ</label>
        <Form.Select
          value={filters.vj || 'All'}
          onChange={(e) => handleFilterChange('vj', e.target.value)}
          className="filter-select"
          disabled={isLoadingOptions}
        >
          <option value="All">All VJs</option>
          {vjs.map((vj) => (
            <option key={vj} value={vj}>
              VJ {vj}
            </option>
          ))}
        </Form.Select>
      </div>

      {/* Type Filter */}
      <div className="filter-group">
        <label className="filter-label">Type</label>
        <Form.Select
          value={filters.type || 'All'}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="filter-select"
        >
          <option value="All">All Types</option>
          <option value="Movie">Movies</option>
          <option value="Series">Series</option>
        </Form.Select>
      </div>

      {/* Premium Filter */}
      <div className="filter-group filter-group-checkbox">
        <Form.Check
          type="checkbox"
          id="premium-filter"
          label="Premium Only"
          checked={filters.is_premium || false}
          onChange={(e) => handleFilterChange('is_premium', e.target.checked)}
          className="filter-checkbox"
        />
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters() && (
        <div className="filter-group filter-group-actions">
          <Button
            variant="outline-danger"
            size="sm"
            onClick={onClearFilters}
            className="clear-filters-btn"
          >
            <X size={14} />
            <span>Clear</span>
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <div className="mobile-filter-toggle d-lg-none">
        <Button
          variant="dark"
          onClick={() => setShowMobileFilters(true)}
          className="filter-toggle-btn"
        >
          <Filter size={18} />
          <span>Filters</span>
          {hasActiveFilters() && (
            <span className="filter-count-badge">{getActiveFiltersCount()}</span>
          )}
        </Button>
      </div>

      {/* Desktop Filter Bar */}
      <div className={`filter-bar desktop-filters d-none d-lg-flex ${className}`}>
        <div className="filter-bar-content">
          <div className="filter-bar-title">
            <Filter size={18} />
            <span>Filter Movies</span>
            {hasActiveFilters() && (
              <span className="active-count">({getActiveFiltersCount()} active)</span>
            )}
          </div>
          <FilterControls />
        </div>
      </div>

      {/* Mobile Filter Offcanvas */}
      <Offcanvas
        show={showMobileFilters}
        onHide={() => setShowMobileFilters(false)}
        placement="bottom"
        className="mobile-filters-offcanvas"
      >
        <Offcanvas.Header closeButton className="filters-offcanvas-header">
          <Offcanvas.Title>
            <Filter size={20} />
            <span>Filter Movies</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="filters-offcanvas-body">
          <FilterControls />
          
          {/* Apply Button for Mobile */}
          <div className="mobile-filter-actions">
            <Button
              variant="primary"
              onClick={() => setShowMobileFilters(false)}
              className="apply-filters-btn"
            >
              Apply Filters
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default FilterBar;
