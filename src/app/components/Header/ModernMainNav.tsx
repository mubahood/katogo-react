import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { selectIsAuthenticated, restoreAuthState } from "../../store/slices/authSlice";
import { useCart } from "../../hooks/useCart";
import { useAppCounts, useMegaMenuCategories } from "../../hooks/useManifest";
import { useManifest } from "../../hooks/useManifest";
import LiveSearchBox from "../search/LiveSearchBox";
import OptimizedLazyImage from "../shared/OptimizedLazyImage";
import { 
  Home, 
  Search, 
  Heart, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Play, 
  Star, 
  TrendingUp, 
  Award, 
  Eye, 
  Zap, 
  Film, 
  Smile, 
  Moon, 
  Globe,
  Mic,
  Tv,
  FileText,
  ChevronDown,
  ChevronRight,
  Download,
  PlayCircle,
  UserPlus,
  LogIn
} from "react-feather";
import "./ModernMainNav.css";

const ModernMainNav: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  
  // Use manifest counts instead of individual state selectors
  const { cartCount } = useCart();
  const appCounts = useAppCounts();
  const { reloadManifest } = useManifest();

  // VJ list for the mega menu - Split into 3 equal columns (13-13-12)
  const vjList = [
    // Column 1 - 13 VJs
    ['Vj Junior', 'Vj Emmy', 'Vj Jovan', 'Vj Tom', 'Vj Shao Khan', 'Vj Jingo', 'Vj Ice P', 'Vj Kevo', 'Vj Kevin', 'Vj Kriss Sweet', 'Vj Hd', 'Vj Dan De', 'Vj Sammy'],
    // Column 2 - 13 VJs  
    ['Vj Ivo', 'Vj Isma K', 'Vj Little T', 'Vj Mox', 'Vj Muba', 'Vj Eddy', 'Vj Kam', 'Vj Lance', 'Vj KS', 'Vj Ulio', 'Vj Aaron', 'Vj Cabs', 'Vj Banks'],
    // Column 3 - 12 VJs
    ['Vj Jimmy', 'Vj Baros', 'Vj Kimuli', 'Vj Fredy', 'Vj Jumpers', 'Vj Ashim', 'Vj Pauleta', 'Vj Martin K', 'Vj Henrico', 'Vj Uncle T', 'Vj Soul', 'Vj Nelly']
  ];
  
  // Auth selectors with more robust state tracking
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authState = useSelector((state: RootState) => state.auth);
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  
  // Force re-render when auth state changes
  const [, forceUpdate] = useState({});
  
  // Debug authentication state with more detail
  useEffect(() => {
    const localToken = localStorage.getItem('ugflix_auth_token');
    const localUser = localStorage.getItem('ugflix_user');
    
    console.log('🔐 DETAILED Auth State Debug:', {
      // Redux state
      isAuthenticated,
      hasUser: !!authState.user,
      hasToken: !!authState.token,
      isLoading: authState.isLoading,
      userEmail: authState.user?.email,
      reduxTokenPreview: authState.token ? authState.token.substring(0, 20) + '...' : 'null',
      
      // localStorage state
      localStorage_hasToken: !!localToken,
      localStorage_hasUser: !!localUser,
      localStorage_tokenPreview: localToken ? localToken.substring(0, 20) + '...' : 'null',
      localStorage_userExists: localUser ? 'exists' : 'missing',
      
      // Critical checks
      bothTokensMatch: authState.token === localToken,
      shouldBeAuthenticated: !!(localToken && localUser),
      actuallyAuthenticated: isAuthenticated,
      
      // Detailed Redux state
      reduxAuthState: authState
    }); 
    
    // If localStorage has auth data but Redux doesn't, dispatch restore
    if (localToken && localUser && !isAuthenticated && !authState.isLoading) {
      console.log('🔧 Auth mismatch detected! Forcing auth restore...');
      dispatch(restoreAuthState());
    }
    
    // Force re-render after state changes
    forceUpdate({});
  }, [isAuthenticated, authState, dispatch, user, token]);
  
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setMenuOpen(!isMenuOpen);
  const hasNotifications = false; // This would come from notifications state

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

  // Helper function to render Feather icons based on icon name
  const renderFeatherIcon = (iconName: string, size = 16, className = '') => {
    const iconProps = { size, className };
    
    switch (iconName) {
      case 'Star': return <Star {...iconProps} />;
      case 'TrendingUp': return <TrendingUp {...iconProps} />;
      case 'Award': return <Award {...iconProps} />;
      case 'Eye': return <Eye {...iconProps} />;
      case 'Zap': return <Zap {...iconProps} />;
      case 'Film': return <Film {...iconProps} />;
      case 'Smile': return <Smile {...iconProps} />;
      case 'Heart': return <Heart {...iconProps} />;
      case 'Moon': return <Moon {...iconProps} />;
      case 'Globe': return <Globe {...iconProps} />;
      case 'Play': return <Play {...iconProps} />;
      case 'Mic': return <Mic {...iconProps} />;
      case 'FileText': return <FileText {...iconProps} />;
      case 'Tv': return <Tv {...iconProps} />;
      case 'Search': return <Search {...iconProps} />;
      case 'ChevronDown': return <ChevronDown {...iconProps} />;
      case 'ChevronRight': return <ChevronRight {...iconProps} />;
      case 'Download': return <Download {...iconProps} />;
      case 'PlayCircle': return <PlayCircle {...iconProps} />;
      case 'User': return <User {...iconProps} />;
      case 'UserPlus': return <UserPlus {...iconProps} />;
      case 'LogIn': return <LogIn {...iconProps} />;
      case 'X': return <X {...iconProps} />;
      default: return <Film {...iconProps} />; // Fallback icon
    }
  };

  // Enhanced mega menu hover handling
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      const categoryElement = categoryRef.current;
      const megaMenuElement = megaMenuRef.current;
      
      if (categoryElement && megaMenuElement) {
        const isOverCategory = categoryElement.contains(e.relatedTarget as Node);
        const isOverMegaMenu = megaMenuElement.contains(e.relatedTarget as Node);
        
        if (!isOverCategory && !isOverMegaMenu) {
          setMegaMenuOpen(false);
        }
      }
    };

    const categoryElement = categoryRef.current;
    const megaMenuElement = megaMenuRef.current;

    if (categoryElement) {
      categoryElement.addEventListener('mouseleave', handleMouseLeave);
    }
    if (megaMenuElement) {
      megaMenuElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (categoryElement) {
        categoryElement.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (megaMenuElement) {
        megaMenuElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <>
      {/* Modern Mobile Navigation Layout */}
      <div className="modern-mobile-nav d-lg-none">
        {/* Top Row: Menu Toggle + Logo + Action Icons */}
        <div className="mobile-nav-top">
          <div className="container-fluid">
            <div className="mobile-top-row">
              {/* Menu Toggle */}
              <button
                className="mobile-menu-toggle"
                type="button"
                onClick={toggleMenu}
                aria-label="Toggle navigation menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Logo */}
              <Link to="/" className="mobile-logo-wrapper">
                <img
                  src="/media/logos/logo-white.png"
                  alt="UgFlix"
                  className="mobile-logo"
                />
              </Link>

              {/* Action Icons */}
              <div className="mobile-action-icons">
                <Link to="/movies" className="mobile-action-link">
                  <div className="mobile-action-icon-wrapper">
                    <Film size={18} />
                  </div>
                </Link>
                {(isAuthenticated || (authState.user && authState.token)) ? (
                  <Link to="/account" className="mobile-action-link">
                    <div className="mobile-action-icon-wrapper">
                      <User size={18} />
                      {hasNotifications && <span className="mobile-notification-dot"></span>}
                    </div>
                  </Link>
                ) : (
                  <Link to="/auth/login" className="mobile-action-link">
                    <div className="mobile-action-icon-wrapper">
                      <User size={18} />
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Live Search */}
        <div className="mobile-nav-bottom">
          <div className="mobile-search-wrapper">
            <LiveSearchBox 
              placeholder="Search for movies, actors, genres..."
              className="mobile-search-box"
              size="sm"
              showRecentSearches={false}
            />
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="main-nav-wrapper d-none d-lg-block">
        <nav className="container-fluid d-flex align-items-center h-100" style={{paddingLeft: '60px', paddingRight: '60px'}}>
          {/* Desktop Logo */}
          <Link to="/" className="logo-wrapper me-4">
            <img
              src="/media/logos/logo.png"
              alt="UgFlix"
              className="main-logo"
            />
          </Link>

          {/* Enhanced Movie Categories Mega Menu */}
          <div 
            ref={categoryRef}
            className={`category-toggle  ${isMegaMenuOpen ? 'active' : ''}`}
            onMouseEnter={() => setMegaMenuOpen(true)}
          >
            <div className="category-toggle-content">
              <Mic size={18} className="category-icon" />
              <span className="category-text">VJs</span>
              <ChevronDown size={16} className="chevron-icon" />
            </div>
            
            {/* Enhanced Mega Menu */}
            <div 
              ref={megaMenuRef}
              className={`mega-menu m-0 ${isMegaMenuOpen ? 'show' : ''}`}
              onMouseEnter={() => setMegaMenuOpen(true)}
            >
              <div className="mega-menu-content">
           
                <div className="row g-4">
                  {vjList.map((column, columnIndex) => (
                    <div key={columnIndex} className="col-md-4">
                      <div className="mega-menu-section">
                        <div className="mega-menu-links">
                          {column.map((vjName) => (
                            <Link 
                              key={vjName}
                              to={`/movies?search=${encodeURIComponent(vjName.replace('Vj ', ''))}`} 
                              className="mega-menu-link vj-link"
                              onClick={() => setMegaMenuOpen(false)}
                            >
                              <span>{vjName}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Featured Movies Banner */}
                <div className="mega-menu-banner mt-4 pt-4">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="featured-category-card">
                        <div className="featured-content">
                          <div className="featured-icon">
                            <PlayCircle size={24} />
                          </div>
                          <div className="featured-text">
                            <h6>Premium Movies</h6>
                            <p>Unlimited access to exclusive content</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="featured-category-card">
                        <div className="featured-content">
                          <div className="featured-icon featured-icon-secondary">
                            <Download size={24} />
                          </div>
                          <div className="featured-text">
                            <h6>Download & Watch</h6>
                            <p>Watch offline anytime, anywhere</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Enhanced Live Search */}
          <div className="search-form flex-grow-1 position-relative">
            <LiveSearchBox 
              placeholder="Search for movies, actors, genres..."
              className="desktop-search-box"
              showRecentSearches={true}
            />
          </div>

          {/* Main Menu - Icon Links with Text (Navigation) */}
          <div className="main-menu-links">
            <Link to="/movies" className={`main-menu-link ${isActive('/movies') ? 'active' : ''}`}>
              <div className="main-menu-icon-wrapper">
                <Film size={20} className="main-menu-icon" />
              </div>
              <span>Movies</span>
            </Link>
            <Link to="/series" className={`main-menu-link ${isActive('/series') ? 'active' : ''}`}>
              <div className="main-menu-icon-wrapper">
                <Tv size={20} className="main-menu-icon" />
              </div>
              <span>Series</span>
            </Link>
            <Link to="/products" className={`main-menu-link ${isActive('/products') ? 'active' : ''}`}>
              <div className="main-menu-icon-wrapper">
                <ShoppingCart size={20} className="main-menu-icon" />
              </div>
              <span>Buy And Sell</span>
            </Link>
            <Link to="/connect" className={`main-menu-link ${isActive('/connect') ? 'active' : ''}`}>
              <div className="main-menu-icon-wrapper">
                <Globe size={20} className="main-menu-icon" />
              </div>
              <span>Connect</span>
            </Link>
            <Link to="/account/chats" className={`main-menu-link ${isActive('/account/chats') ? 'active' : ''}`}>
              <div className="main-menu-icon-wrapper">
                <FileText size={20} className="main-menu-icon" />
              </div>
              <span>Chats</span>
            </Link>
            {authState.isLoading ? (
              <div className="main-menu-link">
                <div className="main-menu-icon-wrapper">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
                <span>...</span>
              </div>
            ) : (isAuthenticated || (authState.user && authState.token)) ? (
              <Link to="/account" className={`main-menu-link ${isActive('/account') ? 'active' : ''}`}>
                <div className="main-menu-icon-wrapper">
                  <User size={20} className="main-menu-icon" />
                  {hasNotifications && <span className="notification-dot"></span>}
                </div>
                <span>Account</span>
              </Link>
            ) : (
              <Link to="/auth/login" className={`main-menu-link ${isActive('/auth/login') ? 'active' : ''}`}>
                <div className="main-menu-icon-wrapper">
                  <LogIn size={20} className="main-menu-icon" />
                </div>
                <span>Login</span>
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Enhanced Mobile Off-Canvas Menu */}
      <div
        className={`nav-overlay ${isMenuOpen ? "show" : ""}`}
        onClick={toggleMenu}
      ></div>
      <div className={`mobile-nav-offcanvas ${isMenuOpen ? "show" : ""}`}>
        <div className="offcanvas-header">
          <div className="offcanvas-logo">
            <OptimizedLazyImage 
              src="/media/logos/logo.png" 
              alt="UgFlix" 
              className="mobile-offcanvas-logo"
              options={{
                width: 150,
                height: 50,
                loading: 'eager' // Logo should load immediately
              }}
            />
          </div>
          <button 
            className="offcanvas-close-btn"
            onClick={toggleMenu}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="offcanvas-body">
          {/* Mobile Main Menu Section */}
          <div className="mobile-nav-section">
            <h6 className="mobile-nav-heading">Main Menu</h6>
            <ul className="nav-links">
              <li>
                <Link to="/movies" onClick={toggleMenu} className={isActive('/movies') ? 'active' : ''}>
                  <Film size={20} />
                  <span>Movies</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
              <li>
                <Link to="/series" onClick={toggleMenu} className={isActive('/series') ? 'active' : ''}>
                  <Tv size={20} />
                  <span>Series</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
              <li>
                <Link to="/products" onClick={toggleMenu} className={isActive('/products') ? 'active' : ''}>
                  <ShoppingCart size={20} />
                  <span>Buy And Sell</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
              <li>
                <Link to="/connect" onClick={toggleMenu} className={isActive('/connect') ? 'active' : ''}>
                  <Globe size={20} />
                  <span>Connect</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
              <li>
                <Link to="/account/chats" onClick={toggleMenu} className={isActive('/account/chats') ? 'active' : ''}>
                  <FileText size={20} />
                  <span>Chats</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
              <li>
                <Link to="/account" onClick={toggleMenu} className={isActive('/account') ? 'active' : ''}>
                  <User size={20} />
                  <span>Account</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Mobile Top Menu Section */}
          <div className="mobile-nav-section">
            <h6 className="mobile-nav-heading">Quick Actions</h6>
            <ul className="nav-links">
              <li>
                <Link to="/account/post-product" onClick={toggleMenu}>
                  <FileText size={20} />
                  <span>Post Product</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
              <li>
                <Link to="/account/watchlist" onClick={toggleMenu}>
                  <Heart size={20} />
                  <span>My Watch List</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
              <li>
                <Link to="/account/history" onClick={toggleMenu}>
                  <Eye size={20} />
                  <span>Watch History</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
              <li>
                <Link to="/help" onClick={toggleMenu}>
                  <FileText size={20} />
                  <span>Help And Support</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
              <li>
                <Link to="/account/subscription" onClick={toggleMenu}>
                  <Star size={20} />
                  <span>My Subscription</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
              <li>
                <Link to="/mobile-apps" onClick={toggleMenu}>
                  <i className="bi bi-phone" style={{fontSize: '20px'}}></i>
                  <span>Mobile Apps</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Authentication Section */}
          {authState.isLoading ? (
            <div className="mobile-nav-section">
              <h6 className="mobile-nav-heading">Loading...</h6>
              <div className="d-flex justify-content-center py-3">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          ) : !(isAuthenticated || (authState.user && authState.token)) ? (
            <div className="mobile-nav-section">
              <h6 className="mobile-nav-heading">Get Started</h6>
              <ul className="nav-links">
                <li>
                  <Link to="/auth/login" onClick={toggleMenu}>
                    <LogIn size={20} />
                    <span>Login</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
                <li>
                  <Link to="/auth/register" onClick={toggleMenu}>
                    <UserPlus size={20} />
                    <span>Create Account</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default ModernMainNav;
