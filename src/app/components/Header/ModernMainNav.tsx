import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { selectIsAuthenticated } from "../../store/slices/authSlice";
import { loadWishlistFromAPI } from "../../store/slices/wishlistSlice";
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
  
  // Use manifest counts instead of individual state selectors
  const { cartCount } = useCart();
  const appCounts = useAppCounts();
  const { reloadManifest } = useManifest();
  const wishlistCount = appCounts.wishlist_count;

  // VJ list for the mega menu - Split into 3 equal columns (13-13-12)
  const vjList = [
    // Column 1 - 13 VJs
    ['Vj Junior', 'Vj Emmy', 'Vj Jovan', 'Vj Tom', 'Vj Shao Khan', 'Vj Jingo', 'Vj Ice P', 'Vj Kevo', 'Vj Kevin', 'Vj Kriss Sweet', 'Vj Hd', 'Vj Dan De', 'Vj Sammy'],
    // Column 2 - 13 VJs  
    ['Vj Ivo', 'Vj Isma K', 'Vj Little T', 'Vj Mox', 'Vj Muba', 'Vj Eddy', 'Vj Kam', 'Vj Lance', 'Vj KS', 'Vj Ulio', 'Vj Aaron', 'Vj Cabs', 'Vj Banks'],
    // Column 3 - 12 VJs
    ['Vj Jimmy', 'Vj Baros', 'Vj Kimuli', 'Vj Fredy', 'Vj Jumpers', 'Vj Ashim', 'Vj Pauleta', 'Vj Martin K', 'Vj Henrico', 'Vj Uncle T', 'Vj Soul', 'Vj Nelly']
  ];
  
  // Auth selectors
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authState = useSelector((state: RootState) => state.auth);
  
  // Debug authentication state
  useEffect(() => {
    console.log('🔐 Auth State Debug:', {
      isAuthenticated,
      hasUser: !!authState.user,
      hasToken: !!authState.token,
      isLoading: authState.isLoading,
      localStorage_token: localStorage.getItem('DB_TOKEN'),
      localStorage_user: localStorage.getItem('DB_LOGGED_IN_PROFILE')
    });
  }, [isAuthenticated, authState]);
  
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setMenuOpen(!isMenuOpen);
  const hasNotifications = false; // This would come from notifications state

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

  // Note: Wishlist is loaded via manifest, no need for separate API call

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
                {isAuthenticated ? (
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
                <Link to="/watchlist" className="mobile-action-link">
                  <div className="mobile-action-icon-wrapper">
                    <Heart size={18} />
                    {wishlistCount > 0 && (
                      <span className="mobile-cart-badge">{wishlistCount}</span>
                    )}
                  </div>
                </Link>
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

          {/* Enhanced Action Icons */}
          <div className="action-icons">
            <Link to="/movies" className="action-link">
              <div className="action-icon-wrapper">
                <Film size={18} className="action-icon" />
              </div>
              <div className="action-text">Movies</div>
            </Link>

            <Link to="/series" className="action-link">
              <div className="action-icon-wrapper">
                <Tv size={18} className="action-icon" />
              </div>
              <div className="action-text">Series</div>
            </Link>

            <Link to="/shop" className="action-link">
              <div className="action-icon-wrapper">
                <ShoppingCart size={18} className="action-icon" />
              </div>
              <div className="action-text">Shop</div>
            </Link>
            
            {isAuthenticated ? (
              <Link to="/account" className="action-link">
                <div className="action-icon-wrapper">
                  <User size={18} className="action-icon" />
                  {hasNotifications && <span className="notification-dot"></span>}
                </div>
                <div className="action-text">My Account</div>
              </Link>
            ) : (
              <Link to="/auth/login" className="action-link">
                <div className="action-icon-wrapper">
                  <LogIn size={18} className="action-icon" />
                </div>
                <div className="action-text">Login</div>
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
          {/* Mobile Navigation Links */}
          <div className="mobile-nav-section">
            <h6 className="mobile-nav-heading">Browse Content</h6>
            <ul className="nav-links">
              <li>
                <Link to="/movies" onClick={toggleMenu}>
                  <Film size={18} />
                  <span>Movies</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
              <li>
                <Link to="/series" onClick={toggleMenu}>
                  <Tv size={18} />
                  <span>Series</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
              <li>
                <Link to="/shop" onClick={toggleMenu}>
                  <ShoppingCart size={18} />
                  <span>Shop</span>
                  <ChevronRight size={16} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Mobile VJ Links - All VJs */}
          <div className="mobile-nav-section">
            <h6 className="mobile-nav-heading">All VJs</h6>
            <ul className="nav-links mobile-vj-links">
              {vjList.flat().map((vjName) => (
                <li key={vjName}>
                  <Link to={`/movies?search=${encodeURIComponent(vjName.replace('Vj ', ''))}`} onClick={toggleMenu}>
                    <span>{vjName}</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Account Actions */}
          {isAuthenticated ? (
            <div className="mobile-nav-section">
              <h6 className="mobile-nav-heading">
                Welcome back!
              </h6>
              <ul className="nav-links">
                <li>
                  <Link to="/account" onClick={toggleMenu}>
                    <User size={18} />
                    <span>My Account</span>
                    {hasNotifications && <span className="mobile-notification-dot"></span>}
                  </Link>
                </li>
                <li>
                  <Link to="/downloads" onClick={toggleMenu}>
                    <Download size={18} />
                    <span>My Downloads</span>
                  </Link>
                </li>
                <li>
                  <Link to="/watchlist"  onClick={toggleMenu}>
                    <Heart size={18} />
                    <span>My Watchlist</span>
                    {wishlistCount > 0 && (
                      <span className="mobile-cart-badge">{wishlistCount}</span>
                    )}
                  </Link>
                </li>
                <li>
                  <Link to="/premium" onClick={toggleMenu}>
                    <Star size={18} />
                    <span>Premium Plans</span>
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <div className="mobile-nav-section">
              <h6 className="mobile-nav-heading">Account</h6>
              <ul className="nav-links">
                <li>
                  <Link to="/auth/login" onClick={toggleMenu}>
                    <LogIn size={18} className="text-primary" />
                    <span>Login</span>
                  </Link>
                </li>
                <li>
                  <Link to="/auth/register" onClick={toggleMenu}>
                    <UserPlus size={18} className="text-success" />
                    <span>Create Account</span>
                  </Link>
                </li>
                <li>
                  <Link to="/watchlist"  onClick={toggleMenu}>
                    <Heart size={18} />
                    <span>My Watchlist</span>
                    {wishlistCount > 0 && (
                      <span className="mobile-cart-badge">{wishlistCount}</span>
                    )}
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Mobile Quick Links */}
          <div className="mobile-nav-section">
            <h6 className="mobile-nav-heading">Quick Links</h6>
            <ul className="nav-links">
              <li>
                <Link to="/movies" onClick={toggleMenu}>
                  <i className="bi bi-film text-primary"></i>
                  <span>Browse All Movies</span>
                </Link>
              </li>
              <li>
                <Link to="/movies?filter=trending" onClick={toggleMenu}>
                  <i className="bi bi-graph-up-arrow text-warning"></i>
                  <span>Trending Movies</span>
                </Link>
              </li>
              <li>
                <Link to="/movies?filter=new" onClick={toggleMenu}>
                  <i className="bi bi-star text-info"></i>
                  <span>New Releases</span>
                </Link>
              </li>
              <li>
                <Link to="/help" onClick={toggleMenu}>
                  <i className="bi bi-headset"></i>
                  <span>Help & Support</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModernMainNav;
