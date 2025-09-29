// src/app/components/Account/AccountSidebar.tsx
import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import ToastService from '../../services/ToastService';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  section: string;
}

const AccountSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Comprehensive menu items organized by sections
  const menuItems: MenuItem[] = [
    // Account Overview
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'bi-speedometer2',
      path: '/account',
      section: 'overview'
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: 'bi-person',
      path: '/account/profile',
      section: 'overview'
    },
    
    // Entertainment
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: 'bi-collection-play',
      path: '/account/subscriptions',
      section: 'entertainment'
    },
    {
      id: 'watchlist',
      label: 'My Watchlist',
      icon: 'bi-bookmark-heart',
      path: '/account/watchlist',
      section: 'entertainment'
    },
    {
      id: 'history',
      label: 'Watch History',
      icon: 'bi-clock-history',
      path: '/account/history',
      section: 'entertainment'
    },
    {
      id: 'likes',
      label: 'My Likes',
      icon: 'bi-heart-fill',
      path: '/account/likes',
      section: 'entertainment'
    },
    
    // Marketplace
    {
      id: 'products',
      label: 'My Products',
      icon: 'bi-bag',
      path: '/account/products',
      section: 'marketplace'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: 'bi-box-seam',
      path: '/account/orders',
      section: 'marketplace'
    },
    
    // Communication
    {
      id: 'chats',
      label: 'My Chats',
      icon: 'bi-chat-dots',
      path: '/account/chats',
      section: 'communication'
    },
    
    // Settings
    {
      id: 'settings',
      label: 'Settings',
      icon: 'bi-gear',
      path: '/account/settings',
      section: 'settings'
    }
  ];

  const sections = [
    { id: 'overview', title: 'Account Overview' },
    { id: 'entertainment', title: 'Entertainment' },
    { id: 'marketplace', title: 'Marketplace' },
    { id: 'communication', title: 'Communication' },
    { id: 'settings', title: 'Account' }
  ];

  const isActive = (path: string) => {
    if (path === '/account') {
      return location.pathname === '/account';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    ToastService.logoutSuccess();
    navigate('/');
  };

  const getItemsBySection = (sectionId: string) => {
    return menuItems.filter(item => item.section === sectionId);
  };

  return (
    <div className="acc-sidebar-container">
  

      {/* Navigation Menu */}
      <Nav className="acc-sidebar-nav">
        {sections.map((section) => {
          const sectionItems = getItemsBySection(section.id);
          if (sectionItems.length === 0) return null;
          
          return (
            <div key={section.id} className="nav-section mb-3">
              <h6 className="nav-section-title text-muted small text-uppercase fw-bold mb-2 px-3">
                {section.title}
              </h6>
              {sectionItems.map((item) => (
                <Nav.Item key={item.id} className="acc-nav-item mb-1">
                  <Nav.Link
                    as={Link}
                    to={item.path}
                    className={`acc-nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <i className={`${item.icon} acc-nav-icon me-2`}></i>
                    <span className="acc-nav-text">{item.label}</span>
                  </Nav.Link>
                </Nav.Item>
              ))}
            </div>
          );
        })}

        {/* Logout */}
        <div className="nav-section border-top pt-3 mt-3">
          <Nav.Item className="acc-nav-item">
            <Nav.Link
              onClick={handleLogout}
              className="acc-nav-link acc-logout-link text-danger"
              role="button"
            >
              <i className="bi-box-arrow-right acc-nav-icon me-2"></i>
              <span className="acc-nav-text">Logout</span>
            </Nav.Link>
          </Nav.Item>
        </div>
      </Nav>
    </div>
  );
};

export default AccountSidebar;
