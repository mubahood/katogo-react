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
  
  // Initialize page from URL
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [users, setUsers] = useState<ConnectUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState<ConnectFilters>({
    sort_by: 'last_online_at',
    sort_dir: 'desc',
  });

  // Load users
  const loadUsers = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await ConnectApiService.getUsersList(filters, pageNum, 20);
      
      setUsers(response.users);
      setPage(pageNum);
      setTotalPages(response.pagination.lastPage);
      setTotalUsers(response.pagination.total);
      
      // Update URL with page number
      setSearchParams({ page: pageNum.toString() });
    } catch (error) {
      console.error('Error loading users:', error);
      ToastService.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters, setSearchParams]);

  // Initial load - use page from URL
  useEffect(() => {
    loadUsers(initialPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search with debounce
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, search: query || undefined }));
  };

  // Filter handlers
  const toggleFilter = (key: keyof ConnectFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[key] === value) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (page > 1) {
      loadUsers(page - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      loadUsers(page + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (pageNum: number) => {
    loadUsers(pageNum);
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
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => handleSearch('')}
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
                  className={`filter-chip ${filters.online_only ? 'active' : ''}`}
                  onClick={() => toggleFilter('online_only', true)}
                >
                  Online Only
                </button>
                <button
                  className={`filter-chip ${filters.email_verified ? 'active' : ''}`}
                  onClick={() => toggleFilter('email_verified', true)}
                >
                  Verified Only
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Gender</label>
              <div className="filter-buttons">
                <button
                  className={`filter-chip ${filters.sex === 'male' ? 'active' : ''}`}
                  onClick={() => toggleFilter('sex', 'male')}
                >
                  Male
                </button>
                <button
                  className={`filter-chip ${filters.sex === 'female' ? 'active' : ''}`}
                  onClick={() => toggleFilter('sex', 'female')}
                >
                  Female
                </button>
              </div>
            </div>

            <button
              className="clear-filters-btn"
              onClick={() => {
                setFilters({ sort_by: 'last_online_at', sort_dir: 'desc' });
              }}
            >
              Clear All Filters
            </button>
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
