/**
 * Subscription Layout
 * 
 * Minimal layout for subscription-related pages
 * No header, no navigation - just subscription content and logout
 */

import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import './SubscriptionLayout-dark.css';
import { FaSignOutAlt, FaHome } from 'react-icons/fa';

const SubscriptionLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Confirm logout
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <div className="subscription-layout m-0">
      {/* Minimal Top Bar with Logo and Logout */}
      <div className="subscription-topbar">
        <div className="topbar-content">
          <div className="logo-section">
            <Link to="/" className="app-logo-link" title="Go to Home">
              <span className="app-logo">🎬 UGFlix</span>
            </Link>
          </div>
          <div className="topbar-actions">
            <Link to="/" className="home-btn" title="Go to Home">
              <FaHome />
              <span>Home</span>
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Subscription Content */}
      <main className="subscription-content">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="subscription-footer">
        <p>&copy; 2025 UGFlix. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SubscriptionLayout;
