// src/app/pages/connect/ConnectDiscover.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import {
  ConnectUser,
  ConnectFilters,
} from '../../models/ConnectModels';
import ConnectApiService from '../../services/ConnectApiService';
import UserCard from './components/UserCard';
import ToastService from '../../services/ToastService';
import './ConnectDiscover.css';

const ConnectDiscover: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL
  const initializeFiltersFromURL = (): ConnectFilters => {
    const sortBy = searchParams.get('sort_by');
    const validSortOptions: Array<'last_online_at' | 'name' | 'created_at' | 'updated_at'> = [
      'last_online_at', 'name', 'created_at', 'updated_at'
    ];
    
    const filters: ConnectFilters = {
      sort_by: (sortBy && validSortOptions.includes(sortBy as any)) 
        ? sortBy as 'last_online_at' | 'name' | 'created_at' | 'updated_at'
        : 'last_online_at',
      sort_dir: (searchParams.get('sort_dir') as 'asc' | 'desc') || 'desc',
    };
    
    if (searchParams.get('search')) filters.search = searchParams.get('search')!;
    if (searchParams.get('sex')) filters.sex = searchParams.get('sex') as 'male' | 'female';
    if (searchParams.get('online_only') === 'yes') filters.online_only = true;
    if (searchParams.get('email_verified') === 'yes') filters.email_verified = true;
    if (searchParams.get('country')) filters.country = searchParams.get('country')!;
    if (searchParams.get('city')) filters.city = searchParams.get('city')!;
    if (searchParams.get('age_min')) filters.age_min = parseInt(searchParams.get('age_min')!);
    if (searchParams.get('age_max')) filters.age_max = parseInt(searchParams.get('age_max')!);
    if (searchParams.get('status')) filters.status = searchParams.get('status')!;
    
    return filters;
  };
  
  // Initialize page from URL
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialFilters = initializeFiltersFromURL();
  
  const [users, setUsers] = useState<ConnectUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  
  // Active filters (applied)
  const [activeFilters, setActiveFilters] = useState<ConnectFilters>(initialFilters);
  
  // Pending filters (in UI, not yet applied)
  const [pendingFilters, setPendingFilters] = useState<ConnectFilters>(initialFilters);

  // Update URL with all filter parameters
  const updateURLParams = useCallback((filters: ConnectFilters, pageNum: number) => {
    const params: Record<string, string> = {
      page: pageNum.toString(),
    };
    
    // Add all active filter parameters to URL
    if (filters.search) params.search = filters.search;
    if (filters.sex) params.sex = filters.sex;
    if (filters.online_only) params.online_only = 'yes';
    if (filters.email_verified) params.email_verified = 'yes';
    if (filters.country) params.country = filters.country;
    if (filters.city) params.city = filters.city;
    if (filters.age_min) params.age_min = filters.age_min.toString();
    if (filters.age_max) params.age_max = filters.age_max.toString();
    if (filters.status) params.status = filters.status;
    if (filters.sort_by) params.sort_by = filters.sort_by;
    if (filters.sort_dir) params.sort_dir = filters.sort_dir;
    
    setSearchParams(params);
  }, [setSearchParams]);

  // Load users with active filters
  const loadUsers = useCallback(async (pageNum: number, filters: ConnectFilters) => {
    try {
      setLoading(true);
      const response = await ConnectApiService.getUsersList(filters, pageNum, 20);
      
      setUsers(response.users);
      setPage(pageNum);
      setTotalPages(response.pagination.lastPage);
      setTotalUsers(response.pagination.total);
      
      // Update URL with all parameters
      updateURLParams(filters, pageNum);
    } catch (error) {
      console.error('Error loading users:', error);
      ToastService.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [updateURLParams]);

  // Initial load - use filters and page from URL
  useEffect(() => {
    loadUsers(initialPage, initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search with debounce - only trigger on searchQuery change
  useEffect(() => {
    // Skip if search query matches current active filters
    if (searchQuery === (activeFilters.search || '')) {
      return;
    }
    
    const timer = setTimeout(() => {
      const newFilters = { ...activeFilters, search: searchQuery || undefined };
      setActiveFilters(newFilters);
      setPendingFilters(newFilters);
      loadUsers(1, newFilters); // Reset to page 1 when searching
    }, 500);
    
    return () => clearTimeout(timer);
    // Only depend on searchQuery to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Toggle pending filter (UI only, not applied yet)
  const togglePendingFilter = (key: keyof ConnectFilters, value: any) => {
    setPendingFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[key] === value) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
  };
  
  // Apply filters button handler
  const handleApplyFilters = () => {
    setActiveFilters(pendingFilters);
    loadUsers(1, pendingFilters); // Reset to page 1 when applying filters
    setShowFilters(false); // Close filters panel
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    const defaultFilters: ConnectFilters = {
      sort_by: 'last_online_at',
      sort_dir: 'desc',
    };
    setPendingFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setSearchQuery('');
    loadUsers(1, defaultFilters);
  };
  
  // Count active filters (excluding sort params and search)
  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.sex) count++;
    if (activeFilters.online_only) count++;
    if (activeFilters.email_verified) count++;
    if (activeFilters.country) count++;
    if (activeFilters.city) count++;
    if (activeFilters.age_min) count++;
    if (activeFilters.age_max) count++;
    if (activeFilters.status) count++;
    return count;
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (page > 1) {
      loadUsers(page - 1, activeFilters);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      loadUsers(page + 1, activeFilters);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (pageNum: number) => {
    loadUsers(pageNum, activeFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChatClick = (user: ConnectUser) => {
    navigate(`/account/chats?userId=${user.id}`);
  };

  return (
    <div className="connect-discover">
      {/* Header */}
      <div className="connect-header">
        <div className="header-left">
          <h1 className="connect-title">Connect</h1>
          <span className="user-count">
            {totalUsers > 0 ? `${totalUsers} users` : `${users.length} users`}
          </span>
        </div>

        <div className="header-actions">
          {/* Search */}
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => {
                  setSearchQuery('');
                  const newFilters = { ...activeFilters };
                  delete newFilters.search;
                  setActiveFilters(newFilters);
                  setPendingFilters(newFilters);
                  loadUsers(1, newFilters);
                }}
              >
                <FiX />
              </button>
            )}
          </div>

          {/* Filters Button */}
          <button
            className={`filters-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="filter-badge">{getActiveFilterCount()}</span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-content">
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <div className="filter-buttons">
                <button
                  className={`filter-chip ${pendingFilters.online_only ? 'active' : ''}`}
                  onClick={() => togglePendingFilter('online_only', true)}
                >
                  Online Only
                </button>
                <button
                  className={`filter-chip ${pendingFilters.email_verified ? 'active' : ''}`}
                  onClick={() => togglePendingFilter('email_verified', true)}
                >
                  Verified Only
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Gender</label>
              <div className="filter-buttons">
                <button
                  className={`filter-chip ${pendingFilters.sex === 'male' ? 'active' : ''}`}
                  onClick={() => togglePendingFilter('sex', 'male')}
                >
                  Male
                </button>
                <button
                  className={`filter-chip ${pendingFilters.sex === 'female' ? 'active' : ''}`}
                  onClick={() => togglePendingFilter('sex', 'female')}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="filter-actions">
              <button
                className="clear-filters-btn"
                onClick={handleClearFilters}
              >
                Clear All Filters
              </button>
              <button
                className="apply-filters-btn"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="connect-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Finding amazing people...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No users found</h3>
            <p>Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <>
            {/* Grid View */}
            <div className="grid-view">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  variant="grid"
                  onChatClick={handleChatClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                >
                  <FiChevronLeft />
                  Previous
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`pagination-page ${page === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageClick(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="pagination-btn"
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                >
                  Next
                  <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectDiscover;
