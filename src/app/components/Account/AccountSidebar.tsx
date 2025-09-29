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
}

const AccountSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Simplified menu items - only essential ones
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'bi-house',
      path: '/account',
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: 'bi-bag-check',
      path: '/account/orders',
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: 'bi-heart',
      path: '/account/wishlist',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'bi-person',
      path: '/account/profile',
    },
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

  return (
    <div className="acc-sidebar-container">
      {/* User Profile Header */}
      <div className="acc-sidebar-header">
        <div className="acc-user-avatar">
          <i className="bi bi-person-circle"></i>
        </div>
        <div className="acc-user-info">
          <h5 className="acc-user-name">
            {user?.first_name && user?.last_name 
              ? `${user.first_name} ${user.last_name}`
              : user?.email?.split('@')[0] || 'My Account'
            }
          </h5>
          <p className="acc-user-email">{user?.email}</p>
        </div>
      </div>

      {/* Navigation Menu */}
        <Nav className="acc-sidebar-nav">
          {/* Main Menu Items */}
          {menuItems.map((item) => (
            <Nav.Item key={item.id} className="acc-nav-item">
              <Nav.Link
                as={Link}
                to={item.path}
                className={`acc-nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <i className={`${item.icon} acc-nav-icon`}></i>
                <span className="acc-nav-text">{item.label}</span>
              </Nav.Link>
            </Nav.Item>
          ))}

          {/* Logout */}
          <Nav.Item className="acc-nav-item">
            <Nav.Link
              onClick={handleLogout}
              className="acc-nav-link acc-logout-link"
              role="button"
            >
              <i className="bi-box-arrow-right acc-nav-icon"></i>
              <span className="acc-nav-text">Logout</span>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
  );
};

export default AccountSidebar;
