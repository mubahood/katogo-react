import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { selectIsAuthenticated, logout } from "../../store/slices/authSlice";
import { useCart } from "../../hooks/useCart";
import {
  Home, Film, Radio, ShoppingBag, User, Search, Bell, LogOut,
  Settings, Clock, CreditCard, ChevronDown, X, Menu, BookOpen,
} from "lucide-react";
import SearchV2Service from "../../services/v2/SearchV2Service";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Suggestion {
  id?: number | string;
  title: string;
  type: string;
  poster?: string;
  thumbnail_url?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
const MainNavV2: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const { cartCount } = useCart();

  // Scroll state – nav becomes opaque once user has scrolled past hero
  const [scrolled, setScrolled] = useState(false);

  // Mobile menu open/close
  const [mobileOpen, setMobileOpen] = useState(false);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // User dropdown
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // ── Scroll listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  // ── Search debounce ────────────────────────────────────────────────────────
  const handleSearchInput = useCallback((q: string) => {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await SearchV2Service.getSuggestions(q);
        const data: Suggestion[] = Array.isArray(res) ? res : [];
        setSuggestions(data.slice(0, 8));
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleSuggestionClick = (s: Suggestion) => {
    const path =
      s.type === "Series" ? `/series/${s.id}` : `/watch/${s.id}`;
    navigate(path);
    setSearchOpen(false);
    setSuggestions([]);
    setSearchQuery("");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  // ── Active link helper ─────────────────────────────────────────────────────
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // ── Hero page detection (transparent header) ───────────────────────────────
  const isHeroPage = location.pathname === "/";
  const navOpaque = scrolled || !isHeroPage || mobileOpen;

  // ── Styles helpers ─────────────────────────────────────────────────────────
  const navBg = navOpaque
    ? "bg-black/95 shadow-lg shadow-black/30"
    : "bg-transparent";
  const navClass = `fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg} ${
    navOpaque ? "backdrop-blur-md" : ""
  }`;

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive(path)
        ? "text-red-500"
        : "text-gray-200 hover:text-white"
    }`;

  // ── Genre mega-dropdown items ──────────────────────────────────────────────
  const movieGenres = [
    "Action", "Comedy", "Drama", "Horror", "Romance",
    "Thriller", "Animation", "Documentary", "Family", "Sci-Fi",
  ];

  return (
    <>
      <nav className={navClass} style={{ height: 64 }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between max-w-[1440px]">

          {/* Left: Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              src="/media/logos/logo.png"
              alt="Katogo"
              className="h-8 w-auto object-contain"
            />
          </Link>

          {/* Centre: Desktop nav links */}
          <div className="hidden lg:flex items-center gap-6 ml-8">
            <Link to="/" className={linkClass("/")}>
              Home
            </Link>

            {/* Movies with genre mega-dropdown */}
            <div className="relative group">
              <Link
                to="/movies"
                className={`${linkClass("/movies")} flex items-center gap-1`}
              >
                Movies <ChevronDown size={14} />
              </Link>
              <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4 min-w-[320px] z-50">
                <div className="grid grid-cols-2 gap-1">
                  {movieGenres.map((g) => (
                    <Link
                      key={g}
                      to={`/movies?genre=${encodeURIComponent(g)}`}
                      className="text-sm text-gray-300 hover:text-red-400 hover:bg-gray-800 px-3 py-1.5 rounded transition-colors"
                    >
                      {g}
                    </Link>
                  ))}
                  <Link
                    to="/movies"
                    className="col-span-2 mt-2 text-sm text-red-400 hover:text-red-300 px-3 py-1.5 border-t border-gray-700 transition-colors"
                  >
                    Browse All Movies →
                  </Link>
                </div>
              </div>
            </div>

            {/* Series with genre mega-dropdown */}
            <div className="relative group">
              <Link
                to="/series"
                className={`${linkClass("/series")} flex items-center gap-1`}
              >
                Series <ChevronDown size={14} />
              </Link>
              <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4 min-w-[280px] z-50">
                <div className="grid grid-cols-2 gap-1">
                  {movieGenres.map((g) => (
                    <Link
                      key={g}
                      to={`/series?genre=${encodeURIComponent(g)}`}
                      className="text-sm text-gray-300 hover:text-red-400 hover:bg-gray-800 px-3 py-1.5 rounded transition-colors"
                    >
                      {g}
                    </Link>
                  ))}
                  <Link
                    to="/series"
                    className="col-span-2 mt-2 text-sm text-red-400 hover:text-red-300 px-3 py-1.5 border-t border-gray-700 transition-colors"
                  >
                    Browse All Series →
                  </Link>
                </div>
              </div>
            </div>

            <Link to="/live" className={linkClass("/live")}>Live TV</Link>
            <Link to="/blog" className={linkClass("/blog")}>Blog</Link>
            <Link to="/products" className={linkClass("/products")}>Shop</Link>
          </div>

          {/* Right: Search + Notification + User/Auth */}
          <div className="flex items-center gap-3 ml-auto lg:ml-4">

            {/* Search: icon or expanded bar */}
            {searchOpen ? (
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center"
              >
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="Search movies, series…"
                  className="bg-gray-800 text-white placeholder-gray-400 text-sm rounded-full px-4 py-2 w-56 sm:w-72 outline-none border border-gray-600 focus:border-red-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSuggestions([]); setSearchQuery(""); }}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>

                {/* Suggestions dropdown */}
                {(suggestions.length > 0 || searchLoading) && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {searchLoading && (
                      <div className="px-4 py-3 text-sm text-gray-400">Searching…</div>
                    )}
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-800 transition-colors"
                      >
                        {s.poster && (
                          <img
                            src={s.poster}
                            alt=""
                            className="w-8 h-10 object-cover rounded flex-shrink-0"
                            loading="lazy"
                          />
                        )}
                        <span className="text-sm text-white truncate">{s.title}</span>
                        <span className="ml-auto text-xs text-gray-500 flex-shrink-0">
                          {s.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="text-gray-300 hover:text-white transition-colors p-1"
                aria-label="Open search"
              >
                <Search size={20} />
              </button>
            )}

            {/* Notification bell (authenticated only) */}
            {isAuthenticated && (
              <Link
                to="/account/notifications"
                className="relative text-gray-300 hover:text-white transition-colors p-1"
                aria-label="Notifications"
              >
                <Bell size={20} />
              </Link>
            )}

            {/* Cart icon */}
            <Link
              to="/cart"
              className="relative text-gray-300 hover:text-white transition-colors p-1"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* User avatar + dropdown OR Login/Register */}
            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-sm font-semibold text-white overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (user?.name || user?.email || "U")[0].toUpperCase()
                    )}
                  </div>
                  <ChevronDown size={14} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium text-white truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <nav className="py-1">
                      <Link to="/account" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                        <User size={15} /> Profile
                      </Link>
                      <Link to="/account/watch-history" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                        <Clock size={15} /> Watch History
                      </Link>
                      <Link to="/account/subscriptions" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                        <CreditCard size={15} /> My Subscriptions
                      </Link>
                      <Link to="/account/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                        <Settings size={15} /> Settings
                      </Link>
                      <hr className="my-1 border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="text-sm text-gray-300 hover:text-white transition-colors px-3 py-1.5"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="text-sm bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-1.5 rounded-full transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-gray-300 hover:text-white transition-colors p-1 ml-1"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-gray-950 border-t border-gray-800 px-4 py-4 space-y-1">
            {[
              { to: "/", label: "Home", Icon: Home },
              { to: "/movies", label: "Movies", Icon: Film },
              { to: "/series", label: "Series", Icon: Film },
              { to: "/live", label: "Live TV", Icon: Radio },
              { to: "/blog", label: "Blog", Icon: BookOpen },
              { to: "/products", label: "Shop", Icon: ShoppingBag },
            ].map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to)
                    ? "bg-red-600/20 text-red-400"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            ))}

            {!isAuthenticated && (
              <div className="pt-3 flex flex-col gap-2 border-t border-gray-800">
                <Link
                  to="/auth/login"
                  className="text-center text-sm text-gray-300 hover:text-white border border-gray-600 rounded-lg px-4 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="text-center text-sm bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-2 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Spacer so content doesn't hide behind fixed nav */}
      <div style={{ height: 64 }} />
    </>
  );
};

export default MainNavV2;
