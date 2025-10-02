// src/app/components/Header/MobileBottomNav.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { 
  Film, 
  Tv, 
  ShoppingCart, 
  Globe, 
  MessageSquare,
  User
} from 'react-feather';
import './MobileBottomNav.css';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const authState = useSelector((state: RootState) => state.auth);

  // Intelligent helper function to check if route is active
  const isActive = (section: string) => {
    const pathname = location.pathname;
    const search = location.search;
    
    switch(section) {
      case '/movies':
        // Movies active for: /movies, /movies/*, /watch/*, search results with movies
        return pathname === '/movies' || 
               pathname.startsWith('/movies/') ||
               pathname.startsWith('/watch/') ||
               (pathname === '/search' && search.includes('type=movie'));
      
      case '/series':
        // Series active for: /series, /series/*
        return pathname === '/series' || pathname.startsWith('/series/');
      
      case '/products':
        // Products active for: /products, /products/*, /product/*, /account/post-product
        return pathname === '/products' || 
               pathname.startsWith('/products/') ||
               pathname.startsWith('/product/') ||
               pathname === '/account/post-product';
      
      case '/connect':
        // Connect active for: /connect, /connect/*
        return pathname === '/connect' || pathname.startsWith('/connect/');
      
      case '/account/chats':
        // Chats active for: /account/chats, /account/chats/*, /account/chat/*
        return pathname === '/account/chats' || 
               pathname.startsWith('/account/chats/') ||
               pathname.startsWith('/account/chat/');
      
      case '/account':
        // Account active for: /account but NOT chats (chats has its own tab)
        return pathname === '/account' || 
               (pathname.startsWith('/account/') && 
                !pathname.startsWith('/account/chat') &&
                pathname !== '/account/post-product');
      
      case '/auth/login':
        // Login active for: /auth/login, /auth/register, /auth/*
        return pathname.startsWith('/auth/');
      
      default:
        return pathname === section || pathname.startsWith(section + '/');
    }
  };

  return (
    <nav className="mobile-bottom-nav d-lg-none">
      <Link 
        to="/movies" 
        className={`bottom-nav-item ${isActive('/movies') ? 'active' : ''}`}
      >
        <div className="bottom-nav-icon-wrapper">
          <Film size={22} className="bottom-nav-icon" />
        </div>
        <span className="bottom-nav-label">Movies</span>
      </Link>

      <Link 
        to="/series" 
        className={`bottom-nav-item ${isActive('/series') ? 'active' : ''}`}
      >
        <div className="bottom-nav-icon-wrapper">
          <Tv size={22} className="bottom-nav-icon" />
        </div>
        <span className="bottom-nav-label">Series</span>
      </Link>

      <Link 
        to="/products" 
        className={`bottom-nav-item ${isActive('/products') ? 'active' : ''}`}
      >
        <div className="bottom-nav-icon-wrapper">
          <ShoppingCart size={22} className="bottom-nav-icon" />
        </div>
        <span className="bottom-nav-label">Buy & Sell</span>
      </Link>

      <Link 
        to="/connect" 
        className={`bottom-nav-item ${isActive('/connect') ? 'active' : ''}`}
      >
        <div className="bottom-nav-icon-wrapper">
          <Globe size={22} className="bottom-nav-icon" />
        </div>
        <span className="bottom-nav-label">Connect</span>
      </Link>

      <Link 
        to="/account/chats" 
        className={`bottom-nav-item ${isActive('/account/chats') ? 'active' : ''}`}
      >
        <div className="bottom-nav-icon-wrapper">
          <MessageSquare size={22} className="bottom-nav-icon" />
        </div>
        <span className="bottom-nav-label">Chats</span>
      </Link>

      {(isAuthenticated || (authState.user && authState.token)) ? (
        <Link 
          to="/account" 
          className={`bottom-nav-item ${isActive('/account') ? 'active' : ''}`}
        >
          <div className="bottom-nav-icon-wrapper">
            <User size={22} className="bottom-nav-icon" />
          </div>
          <span className="bottom-nav-label">Account</span>
        </Link>
      ) : (
        <Link 
          to="/auth/login" 
          className={`bottom-nav-item ${isActive('/auth/login') ? 'active' : ''}`}
        >
          <div className="bottom-nav-icon-wrapper">
            <User size={22} className="bottom-nav-icon" />
          </div>
          <span className="bottom-nav-label">Login</span>
        </Link>
      )}
    </nav>
  );
};

export default MobileBottomNav;
