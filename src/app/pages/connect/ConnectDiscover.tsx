// src/app/pages/connect/ConnectDiscover.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { FiGrid, FiList, FiLayers, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import {
  ConnectUser,
  ConnectFilters,
  ConnectViewType,
} from '../../models/ConnectModels';
import ConnectApiService from '../../services/ConnectApiService';
import UserCard from './components/UserCard';
import Utils from '../../utils/Utils';
import './ConnectDiscover.css';

const ConnectDiscover: React.FC = () => {
  const [users, setUsers] = useState<ConnectUser[]>([]);
  const [viewType, setViewType] = useState<ConnectViewType>('cards');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState<ConnectFilters>({
    sort_by: 'last_online_at',
    sort_dir: 'desc',
  });

  const observerTarget = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Load users
  const loadUsers = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      setLoading(pageNum === 1);
      const response = await ConnectApiService.getUsersList(filters, pageNum, 20);
      
      if (append) {
        setUsers(prev => [...prev, ...response.users]);
      } else {
        setUsers(response.users);
      }
      
      setHasMore(response.pagination.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading users:', error);
      Utils.toast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && viewType !== 'cards') {
          loadUsers(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, page, viewType, loadUsers]);

  // Search with debounce
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: query || undefined }));
      setPage(1);
    }, 500);
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
    setPage(1);
  };

  // Swipe handlers
  const handleSwipe = (user: ConnectUser, direction: 'left' | 'right') => {
    if (direction === 'right') {
      Utils.toast(`Liked ${user.name}! 💚`, 'success');
      // TODO: Call like API
    }
    // Remove from stack
    setUsers(prev => prev.filter(u => u.id !== user.id));
    
    // Load more if running low
    if (users.length < 5 && hasMore) {
      loadUsers(page + 1, true);
    }
  };

  const handleUndoSwipe = () => {
    Utils.toast('Undo not yet implemented', 'info');
  };

  const handleChatClick = (user: ConnectUser) => {
    Utils.toast(`Opening chat with ${user.name}...`, 'info');
    // TODO: Navigate to chat
  };

  return (
    <div className="connect-discover">
      {/* Header */}
      <div className="connect-header">
        <div className="header-left">
          <h1 className="connect-title">Connect</h1>
          <span className="user-count">{users.length} users</span>
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

          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewType === 'cards' ? 'active' : ''}`}
              onClick={() => setViewType('cards')}
              title="Card view"
            >
              <FiLayers />
            </button>
            <button
              className={`view-btn ${viewType === 'grid' ? 'active' : ''}`}
              onClick={() => setViewType('grid')}
              title="Grid view"
            >
              <FiGrid />
            </button>
            <button
              className={`view-btn ${viewType === 'list' ? 'active' : ''}`}
              onClick={() => setViewType('list')}
              title="List view"
            >
              <FiList />
            </button>
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
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="filters-panel"
          >
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
                  setPage(1);
                }}
              >
                Clear All Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="connect-content">
        {loading && page === 1 ? (
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
            {viewType === 'cards' && (
              <SwipeView
                users={users}
                onSwipe={handleSwipe}
                onChatClick={handleChatClick}
              />
            )}

            {viewType === 'grid' && (
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
            )}

            {viewType === 'list' && (
              <div className="list-view">
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    variant="list"
                    onChatClick={handleChatClick}
                  />
                ))}
              </div>
            )}

            {/* Infinite scroll trigger */}
            {viewType !== 'cards' && hasMore && (
              <div ref={observerTarget} className="load-more-trigger">
                {loading && <div className="spinner"></div>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Swipe View Component
interface SwipeViewProps {
  users: ConnectUser[];
  onSwipe: (user: ConnectUser, direction: 'left' | 'right') => void;
  onChatClick: (user: ConnectUser) => void;
}

const SwipeView: React.FC<SwipeViewProps> = ({ users, onSwipe, onChatClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleDragEnd = (event: any, info: PanInfo, user: ConnectUser) => {
    const threshold = 100;
    const velocity = info.velocity.x;

    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      onSwipe(user, direction);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const visibleUsers = users.slice(currentIndex, currentIndex + 3);

  if (visibleUsers.length === 0) {
    return (
      <div className="swipe-empty">
        <div className="empty-icon">🎉</div>
        <h3>You've seen everyone!</h3>
        <p>Check back later for more profiles</p>
      </div>
    );
  }

  return (
    <div className="swipe-view">
      <div className="swipe-cards-container">
        <AnimatePresence>
          {visibleUsers.map((user, index) => (
            <motion.div
              key={user.id}
              className="swipe-card-wrapper"
              initial={{ scale: 0.95, y: index * 10, opacity: 0 }}
              animate={{
                scale: index === 0 ? 1 : 0.95 - index * 0.05,
                y: index * 10,
                opacity: 1,
                zIndex: visibleUsers.length - index,
              }}
              exit={{
                x: 500,
                opacity: 0,
                rotate: 20,
                transition: { duration: 0.3 },
              }}
              drag={index === 0 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(e, info) => handleDragEnd(e, info, user)}
              whileDrag={{ cursor: 'grabbing' }}
            >
              <UserCard
                user={user}
                variant="swipe"
                onChatClick={onChatClick}
                onLikeClick={() => onSwipe(user, 'right')}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="swipe-hint">
        <span>← Swipe to pass</span>
        <span>Swipe to like →</span>
      </div>
    </div>
  );
};

export default ConnectDiscover;
