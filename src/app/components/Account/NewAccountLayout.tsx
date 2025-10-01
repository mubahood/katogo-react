// src/app/components/Account/NewAccountLayout.tsx
/**
 * 🎯 NEW MODULAR ACCOUNT LAYOUT - Built from Scratch
 * 
 * Features:
 * ✅ Mobile-first responsive design
 * ✅ Modular and flexible architecture
 * ✅ Smooth animations with framer-motion
 * ✅ Collapsible sidebar for better space management
 * ✅ Breadcrumb navigation
 * ✅ Fully integrated with theme system
 * ✅ Authentication-aware
 * ✅ Accessible and semantic HTML
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, FiX, FiHome, FiUser, FiVideo, FiHeart, 
  FiClock, FiShoppingBag, FiPackage, FiMessageCircle,
  FiSettings, FiLogOut, FiChevronRight, FiStar,
  FiTrendingUp
} from 'react-icons/fi';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import ToastService from '../../services/ToastService';
import './NewAccountLayout.css';

// Menu item interface
interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  section: string;
}

// Section interface
interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

const NewAccountLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Local state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  // Check if mobile on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false); // Close mobile menu when switching to desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Menu structure
  const menuSections: MenuSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <FiHome />,
          path: '/account',
          section: 'overview'
        },
        {
          id: 'profile',
          label: 'My Profile',
          icon: <FiUser />,
          path: '/account/profile',
          section: 'overview'
        }
      ]
    },
    {
      id: 'entertainment',
      title: 'Entertainment',
      items: [
        {
          id: 'subscriptions',
          label: 'Subscriptions',
          icon: <FiStar />,
          path: '/account/subscriptions',
          section: 'entertainment'
        },
        {
          id: 'watchlist',
          label: 'My Watchlist',
          icon: <FiVideo />,
          path: '/account/watchlist',
          section: 'entertainment'
        },
        {
          id: 'history',
          label: 'Watch History',
          icon: <FiClock />,
          path: '/account/history',
          section: 'entertainment'
        },
        {
          id: 'likes',
          label: 'My Likes',
          icon: <FiHeart />,
          path: '/account/likes',
          section: 'entertainment'
        }
      ]
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      items: [
        {
          id: 'products',
          label: 'My Products',
          icon: <FiShoppingBag />,
          path: '/account/products',
          section: 'marketplace'
        },
        {
          id: 'orders',
          label: 'My Orders',
          icon: <FiPackage />,
          path: '/account/orders',
          section: 'marketplace'
        }
      ]
    },
    {
      id: 'communication',
      title: 'Communication',
      items: [
        {
          id: 'chats',
          label: 'My Chats',
          icon: <FiMessageCircle />,
          path: '/account/chats',
          section: 'communication'
        }
      ]
    }
  ];

  // Settings item (separate from sections)
  const settingsItem: MenuItem = {
    id: 'settings',
    label: 'Settings',
    icon: <FiSettings />,
    path: '/account/settings',
    section: 'settings'
  };

  // Check if path is active
  const isActive = (path: string): boolean => {
    if (path === '/account') {
      return location.pathname === '/account' || location.pathname === '/account/';
    }
    return location.pathname.startsWith(path);
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    ToastService.logoutSuccess();
    navigate('/');
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Get current page title from path
  const getCurrentPageTitle = (): string => {
    const path = location.pathname;
    const allItems = menuSections.flatMap(section => section.items);
    allItems.push(settingsItem);
    
    const currentItem = allItems.find(item => {
      if (item.path === '/account') {
        return path === '/account' || path === '/account/';
      }
      return path.startsWith(item.path);
    });

    return currentItem?.label || 'Dashboard';
  };

  // Breadcrumb generation
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Account', path: '/account' }];

    if (pathSegments.length > 1) {
      const currentPage = getCurrentPageTitle();
      if (currentPage !== 'Dashboard') {
        breadcrumbs.push({ label: currentPage, path: location.pathname });
      }
    }

    return breadcrumbs;
  };

  return (
    <div className="new-account-layout">
      {/* Mobile Header */}
      {isMobile && (
        <div className="account-mobile-header">
          <button
            className="mobile-menu-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="mobile-page-title">{getCurrentPageTitle()}</h1>
          <div className="mobile-header-spacer" />
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <div className="account-layout-container">
        {/* Sidebar */}
        <motion.aside
          className={`account-sidebar ${isSidebarOpen ? 'open' : ''}`}
          initial={false}
          animate={{
            x: isMobile && !isSidebarOpen ? '-100%' : 0
          }}
          transition={{ type: 'tween', duration: 0.3 }}
        >
          {/* User Profile Section */}
          <div className="sidebar-user-profile">
            <div className="user-avatar">
              {user?.photo ? (
                <img src={user.photo} alt={user.name} />
              ) : (
                <FiUser size={32} />
              )}
            </div>
            <div className="user-info">
              <h3 className="user-name">{user?.name || 'User'}</h3>
              <p className="user-email">{user?.email || 'user@example.com'}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="sidebar-nav">
            {menuSections.map((section) => (
              <div key={section.id} className="nav-section">
                <h4 className="section-title">{section.title}</h4>
                <ul className="nav-items">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="nav-badge">{item.badge}</span>
                        )}
                        {isActive(item.path) && (
                          <motion.span
                            className="active-indicator"
                            layoutId="activeIndicator"
                          />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Settings */}
            <div className="nav-section">
              <h4 className="section-title">Account</h4>
              <ul className="nav-items">
                <li>
                  <Link
                    to={settingsItem.path}
                    className={`nav-link ${isActive(settingsItem.path) ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{settingsItem.icon}</span>
                    <span className="nav-label">{settingsItem.label}</span>
                    {isActive(settingsItem.path) && (
                      <motion.span
                        className="active-indicator"
                        layoutId="activeIndicator"
                      />
                    )}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Logout */}
            <div className="nav-section nav-section-logout">
              <ul className="nav-items">
                <li>
                  <button
                    onClick={handleLogout}
                    className="nav-link logout-link"
                  >
                    <span className="nav-icon">
                      <FiLogOut />
                    </span>
                    <span className="nav-label">Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="account-main-content">
          {/* Breadcrumb */}
          {!isMobile && (
            <nav className="account-breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb-list">
                {getBreadcrumbs().map((crumb, index) => (
                  <li key={index} className="breadcrumb-item">
                    {index < getBreadcrumbs().length - 1 ? (
                      <>
                        <Link to={crumb.path}>{crumb.label}</Link>
                        <FiChevronRight className="breadcrumb-separator" />
                      </>
                    ) : (
                      <span className="breadcrumb-current">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Page Content */}
          <div className="account-page-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewAccountLayout;
