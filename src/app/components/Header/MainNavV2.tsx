import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { selectIsAuthenticated, logout } from "../../store/slices/authSlice";
import {
  Search, Bell, LogOut, User, Settings, Clock, CreditCard,
  ChevronDown, X, Menu, Film, Crown, TrendingUp,
} from "lucide-react";
import SearchV2Service, {
  SearchSuggestion,
  SearchTrending,
  SearchHistoryItem,
} from "../../services/v2/SearchV2Service";
import { getImageUrl } from "../../utils/imageUtils";
import { useSubscription } from "../../hooks/useSubscription";

/* ═══════════════════════════════════════════════════════════════════════════ */
const MainNavV2: React.FC = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch<AppDispatch>();
  const location  = useLocation();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector((s: RootState) => s.auth.user);
  const { hasActiveSubscription, daysRemaining, hoursRemaining, isExpiringSoon, isInGracePeriod, isLoading: subLoading } = useSubscription(isAuthenticated);

  /* ── state ─────────────────────────────────────────────────────────────── */
  const [scrolled, setScrolled]               = useState(false);
  const [mobileOpen, setMobileOpen]           = useState(false);
  const [searchOpen, setSearchOpen]           = useState(false);   // desktop
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false); // mobile
  const [query, setQuery]                     = useState("");
  const [suggestions, setSuggestions]         = useState<SearchSuggestion[]>([]);
  const [searching, setSearching]             = useState(false);
  const [userDDOpen, setUserDDOpen]           = useState(false);
  const [trending, setTrending]              = useState<SearchTrending | null>(null);
  const [history, setHistory]                = useState<SearchHistoryItem[]>([]);
  const [trendingLoaded, setTrendingLoaded]  = useState(false);

  const searchRef       = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const debounceRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userDDRef       = useRef<HTMLDivElement>(null);
  const searchWrapRef   = useRef<HTMLDivElement>(null);

  /* ── scroll ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* close everything on navigate */
  useEffect(() => {
    setMobileOpen(false);
    closeSearch();
    setUserDDOpen(false);
  }, [location.pathname]);

  /* outside-click: dropdowns */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userDDRef.current && !userDDRef.current.contains(e.target as Node))
        setUserDDOpen(false);
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* auto-focus search inputs */
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    if (mobileSearchOpen) setTimeout(() => mobileSearchRef.current?.focus(), 80);
  }, [mobileSearchOpen]);

  /* lock body scroll when mobile overlays are open */
  useEffect(() => {
    document.body.style.overflow = (mobileOpen || mobileSearchOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, mobileSearchOpen]);

  /* ── search logic ──────────────────────────────────────────────────────── */
  const loadTrendingAndHistory = useCallback(async () => {
    if (trendingLoaded) return;
    setTrendingLoaded(true);
    try {
      const t = await SearchV2Service.getTrending();
      setTrending(t);
    } catch { /* ok */ }
    if (isAuthenticated) {
      try {
        const data = await SearchV2Service.getSearchHistory(1, 10);
        setHistory(data.items ?? []);
      } catch { /* not logged in or error */ }
    }
  }, [trendingLoaded, isAuthenticated]);

  /* load trending/history when search panel opens */
  useEffect(() => {
    if (searchOpen || mobileSearchOpen) loadTrendingAndHistory();
  }, [searchOpen, mobileSearchOpen, loadTrendingAndHistory]);

  const doSearch = useCallback((q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await SearchV2Service.getSuggestions(q);
        setSuggestions(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch { setSuggestions([]); }
      finally { setSearching(false); }
    }, 400);
  }, []);

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    closeSearch();
  };

  const pickSuggestion = (s: SearchSuggestion) => {
    navigate(`/search?q=${encodeURIComponent(s.text)}`);
    closeSearch();
  };

  const searchFor = useCallback((term: string) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
    closeSearch();
  }, [navigate]);

  const closeSearch = () => {
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setSuggestions([]);
    setQuery("");
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      await SearchV2Service.deleteHistoryItem(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch { /* ok */ }
  };

  const handleClearHistory = async () => {
    try { await SearchV2Service.clearSearchHistory(); setHistory([]); } catch { /* ok */ }
  };

  const doLogout = () => { dispatch(logout()); navigate("/auth/login"); };

  /* ── helpers ───────────────────────────────────────────────────────────── */
  const active = (p: string) =>
    location.pathname === p || location.pathname.startsWith(p + "/");

  const isHeroPage = location.pathname === "/";
  const opaque     = scrolled || !isHeroPage || mobileOpen;

  const lnk = (p: string) =>
    `no-underline text-[13px] leading-none transition-colors duration-200 ${
      active(p) ? "text-red-500 font-medium" : "text-gray-300 hover:text-white"
    }`;

  /* ── Type icon + label helper ────────────────────────────────────────── */
  const typeConfig: Record<string, { icon: typeof Film; label: string; color: string }> = {
    movie:  { icon: Film,   label: "Movie",  color: "text-blue-400" },
    series: { icon: Film,   label: "Series", color: "text-purple-400" },
    vj:     { icon: User,   label: "VJ",     color: "text-green-400" },
    genre:  { icon: Film,   label: "Genre",  color: "text-amber-400" },
    search: { icon: Search, label: "",        color: "text-gray-500" },
  };

  /* ── Suggestion row (shared between desktop & mobile) ──────────────────── */
  const SuggestionRow = ({ s, mobile }: { s: SearchSuggestion; mobile?: boolean }) => {
    const cfg = typeConfig[s.type] || typeConfig.search;
    const IconComp = cfg.icon;
    return (
      <button
        type="button"
        onClick={() => pickSuggestion(s)}
        className={`w-full flex items-center gap-2.5 text-left transition-colors ${
          mobile
            ? "px-4 py-3 hover:bg-white/[0.04] active:bg-white/[0.08]"
            : "px-3 py-2 hover:bg-white/[0.04]"
        }`}
      >
        <Search size={mobile ? 15 : 14} className="text-gray-600 flex-shrink-0" />
        <span className={`${mobile ? "text-[14px]" : "text-[13px]"} text-gray-200 flex-1 truncate`}>
          {s.text}
        </span>
        {s.type !== "search" && (
          <span className={`text-[10px] ${cfg.color} bg-white/[0.04] px-1.5 py-0.5 rounded flex-shrink-0`}>
            {cfg.label}
          </span>
        )}
      </button>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Top nav bar ──────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          opaque
            ? "bg-black/90 backdrop-blur-lg shadow-[0_1px_3px_rgba(0,0,0,.4)]"
            : "bg-gradient-to-b from-black/70 to-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-3 lg:px-6 flex items-center justify-between h-12 lg:h-[52px]">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src="/media/logos/logo.png" alt="Katogo" className="h-7 w-auto object-contain" />
          </Link>

          {/* ── Desktop links ────────────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-5 ml-8">
            <Link to="/" className={lnk("/")}>Home</Link>
            <Link to="/movies" className={lnk("/movies")}>Movies</Link>
            <Link to="/series" className={lnk("/series")}>Series</Link>
            <Link to="/live" className={lnk("/live")}>Live TV</Link>
            <Link to="/news" className={lnk("/news")}>Local News</Link>
            <Link to="/blog" className={lnk("/blog")}>Blog</Link>
          </div>

          {/* ── Right section ────────────────────────────────────────────── */}
          <div className="flex items-center gap-1.5 ml-auto">

            {/* Desktop search (inline) */}
            <div className="hidden lg:block relative" ref={searchWrapRef}>
              {searchOpen ? (
                <form onSubmit={submitSearch} className="flex items-center">
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => doSearch(e.target.value)}
                    placeholder="Search movies, series…"
                    className="bg-white/[0.08] text-white placeholder-gray-500 text-[13px] rounded-full pl-3.5 pr-8 py-[5px] w-64 outline-none border border-white/[0.08] focus:border-white/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSuggestions([]); setQuery(""); }}
                    className="absolute right-2 text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={13} />
                  </button>

                  {/* Desktop dropdown panel */}
                  <div className="absolute top-full right-0 mt-2 w-[380px] bg-[#111114] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/60 overflow-hidden">

                    {/* Suggestions (when typing) */}
                    {query.trim() && (
                      <>
                        {searching && (
                          <div className="px-3 py-3 text-[12px] text-gray-500 text-center">Searching…</div>
                        )}
                        {!searching && suggestions.length === 0 && (
                          <div className="px-3 py-6 text-center">
                            <Search size={24} className="mx-auto mb-2 text-gray-600" />
                            <p className="text-[12px] text-gray-500">No results for "{query}"</p>
                          </div>
                        )}
                        {suggestions.map((s, i) => (
                          <SuggestionRow key={`d-${s.type}-${i}`} s={s} />
                        ))}
                        {query.trim() && !searching && suggestions.length > 0 && (
                          <button
                            type="submit"
                            className="w-full px-3 py-2.5 text-[12px] text-red-400 hover:bg-white/[0.04] border-t border-white/[0.06] transition-colors text-left"
                          >
                            See all results for "{query}" →
                          </button>
                        )}
                      </>
                    )}

                    {/* Empty state: Trending + History (when NOT typing) */}
                    {!query.trim() && (
                      <div className="max-h-[400px] overflow-y-auto">
                        {/* Search history */}
                        {history.length > 0 && (
                          <div className="px-3 pt-3 pb-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Clock size={11} /> Recent
                              </span>
                              <button
                                type="button"
                                onClick={handleClearHistory}
                                className="text-[10px] text-gray-600 hover:text-red-400 transition-colors"
                              >
                                Clear all
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {history.map((h) => (
                                <div key={h.id} className="flex items-center gap-1 bg-white/[0.05] hover:bg-white/[0.08] rounded-full pl-2.5 pr-1 py-1 transition-colors group">
                                  <button type="button" onClick={() => searchFor(h.query)} className="text-[12px] text-gray-300 hover:text-white transition-colors">
                                    {h.query}
                                  </button>
                                  <button type="button" onClick={() => handleDeleteHistory(h.id)} className="p-0.5 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                                    <X size={10} className="text-gray-500" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Trending terms */}
                        {trending && trending.trending_terms.length > 0 && (
                          <div className="px-3 pt-2 pb-2">
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                              <TrendingUp size={11} /> Trending
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {trending.trending_terms.slice(0, 8).map((term) => (
                                <button
                                  key={term}
                                  type="button"
                                  onClick={() => searchFor(term)}
                                  className="px-2.5 py-1 text-[12px] bg-white/[0.05] hover:bg-red-600/20 hover:text-red-400 text-gray-300 rounded-full transition-colors"
                                >
                                  {term}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Popular movies (compact row) */}
                        {trending && trending.popular_movies.length > 0 && (
                          <div className="px-3 pt-2 pb-3 border-t border-white/[0.04] mt-1">
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                              <Film size={11} /> Popular
                            </span>
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                              {trending.popular_movies.slice(0, 6).map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => navigate(`/watch/${m.id}`)}
                                  className="flex-shrink-0 w-16 group/card"
                                >
                                  <img
                                    src={getImageUrl(m.thumbnail_url || m.image_url)}
                                    alt={m.title}
                                    loading="lazy"
                                    className="w-16 h-22 object-cover rounded group-hover/card:ring-1 group-hover/card:ring-red-500/50 transition-all"
                                  />
                                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{m.title}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Fallback if nothing loaded */}
                        {!trending && history.length === 0 && (
                          <div className="px-3 py-6 text-center text-[12px] text-gray-600">
                            Start typing to search…
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="text-gray-400 hover:text-white transition-colors p-1.5"
                  aria-label="Search"
                >
                  <Search size={17} />
                </button>
              )}
            </div>

            {/* Mobile search trigger */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors p-1.5"
              aria-label="Search"
            >
              <Search size={17} />
            </button>

            {/* Remaining days badge */}
            {isAuthenticated && !subLoading && hasActiveSubscription && (
              <Link
                to="/account/subscriptions"
                title="Subscription status"
                className={`no-underline flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 border ${
                  isInGracePeriod
                    ? "bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/25"
                    : daysRemaining <= 1
                    ? "bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/25"
                    : daysRemaining <= 3
                    ? "bg-amber-500/12 text-amber-400 border-amber-500/25 hover:bg-amber-500/20"
                    : isExpiringSoon
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/15"
                    : "bg-emerald-500/12 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                }`}
              >
                <Crown
                  size={10}
                  className={
                    isInGracePeriod || daysRemaining <= 1
                      ? "text-red-400"
                      : daysRemaining <= 3
                      ? "text-amber-400"
                      : isExpiringSoon
                      ? "text-yellow-400"
                      : "text-emerald-400"
                  }
                />
                <span>
                  {daysRemaining === 0
                    ? `${hoursRemaining}h left`
                    : daysRemaining <= 2
                    ? `${daysRemaining}d ${hoursRemaining % 24}h`
                    : `${daysRemaining}d left`}
                </span>
              </Link>
            )}

            {/* Bell */}
            {isAuthenticated && (
              <Link
                to="/account/notifications"
                className="text-gray-400 hover:text-white transition-colors p-1.5"
                aria-label="Notifications"
              >
                <Bell size={17} />
              </Link>
            )}

            {/* User dropdown / auth */}
            {isAuthenticated ? (
              <div className="relative" ref={userDDRef}>
                <button
                  onClick={() => setUserDDOpen((v) => !v)}
                  className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors p-1"
                >
                  <div className="w-7 h-7 rounded-full bg-red-600/80 flex items-center justify-center text-[11px] font-semibold text-white overflow-hidden">
                    {user?.avatar ? (
                      <img src={getImageUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (user?.name || user?.email || "U")[0].toUpperCase()
                    )}
                  </div>
                  <ChevronDown size={11} className="hidden sm:block opacity-40" />
                </button>

                {userDDOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#141418] border border-white/[0.07] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,.6)] overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-[13px] font-medium text-white truncate">{user?.name || "User"}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <nav className="py-1.5 px-1.5">
                      {[
                        { to: "/account",                label: "Profile",       Icon: User },
                        { to: "/account/history",        label: "Watch History", Icon: Clock },
                        { to: "/account/subscriptions",  label: "Subscriptions", Icon: CreditCard },
                        { to: "/account/settings",       label: "Settings",      Icon: Settings },
                      ].map(({ to, label, Icon }) => (
                        <Link
                          key={to}
                          to={to}
                          className="no-underline flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all duration-150"
                        >
                          <Icon size={14} /> {label}
                        </Link>
                      ))}
                      <hr className="my-1.5 mx-1.5 border-white/[0.06]" />
                      <button
                        onClick={doLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-400 hover:bg-white/[0.05] rounded-lg transition-all duration-150"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link to="/auth/login" className="no-underline text-[12px] text-gray-400 hover:text-white transition-colors px-2.5 py-1">
                  Login
                </Link>
                <Link to="/auth/register" className="no-underline text-[12px] bg-red-600 hover:bg-red-500 text-white font-medium px-3 py-1 rounded-full transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-gray-400 hover:text-white transition-colors p-1.5"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile side drawer ───────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-12 right-0 bottom-0 w-60 bg-gray-950/95 backdrop-blur-xl border-l border-white/[0.06] z-40 lg:hidden overflow-y-auto">
            <div className="p-3 space-y-0.5">
              {[
                { to: "/",       label: "Home" },
                { to: "/movies", label: "Movies" },
                { to: "/series", label: "Series" },
                { to: "/live",   label: "Live TV" },
                { to: "/news",   label: "Local News" },
                { to: "/blog",   label: "Blog" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`block px-3 py-2 rounded-lg text-[13px] no-underline transition-colors ${
                    active(to)
                      ? "bg-red-500/10 text-red-400 font-medium"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {label}
                </Link>
              ))}

              {/* Subscription badge in mobile drawer */}
              {isAuthenticated && !subLoading && hasActiveSubscription && (
                <div className="pt-2 mt-1 border-t border-white/[0.06]">
                  <Link
                    to="/account/subscriptions"
                    className={`no-underline flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 border ${
                      isInGracePeriod || daysRemaining <= 1
                        ? "text-red-400 bg-red-500/10 border-red-500/20"
                        : daysRemaining <= 3
                        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        : isExpiringSoon
                        ? "text-yellow-400 bg-yellow-500/08 border-yellow-500/15"
                        : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    }`}
                  >
                    <Crown
                      size={14}
                      className={
                        isInGracePeriod || daysRemaining <= 1
                          ? "text-red-400"
                          : daysRemaining <= 3
                          ? "text-amber-400"
                          : isExpiringSoon
                          ? "text-yellow-400"
                          : "text-emerald-400"
                      }
                    />
                    <div className="flex flex-col leading-tight">
                      <span>
                        {daysRemaining === 0
                          ? `${hoursRemaining}h remaining`
                          : `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`}
                      </span>
                      <span className="text-[11px] opacity-60">Active subscription</span>
                    </div>
                  </Link>
                </div>
              )}

              {!isAuthenticated && (
                <div className="pt-3 mt-2 border-t border-white/[0.06] space-y-2">
                  <Link
                    to="/auth/login"
                    className="no-underline block text-center text-[13px] text-gray-400 hover:text-white border border-white/[0.08] rounded-lg px-4 py-2 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="no-underline block text-center text-[13px] bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg px-4 py-2 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Mobile full-screen search ────────────────────────────────────── */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-[#0a0a0c] z-50 lg:hidden flex flex-col">
          {/* search header */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-white/[0.06] flex-shrink-0">
            <div className="flex-1 flex items-center gap-2 bg-white/[0.06] rounded-lg px-3 py-2">
              <Search size={16} className="text-gray-500 flex-shrink-0" />
              <form onSubmit={submitSearch} className="flex-1">
                <input
                  ref={mobileSearchRef}
                  value={query}
                  onChange={(e) => doSearch(e.target.value)}
                  placeholder="Search movies, series, VJs…"
                  className="w-full bg-transparent text-white placeholder-gray-600 text-[15px] outline-none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </form>
              {query && (
                <button
                  onClick={() => { setQuery(""); setSuggestions([]); }}
                  className="text-gray-500 active:text-white transition-colors p-0.5"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={closeSearch}
              className="text-[14px] text-gray-400 active:text-white transition-colors flex-shrink-0"
            >
              Cancel
            </button>
          </div>

          {/* results area */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* ── Typing state: live suggestions ── */}
            {query.trim() && (
              <div>
                {searching && !suggestions.length && (
                  <div className="px-4 py-8 text-center">
                    <div className="inline-block w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin mb-2" />
                    <p className="text-[13px] text-gray-500">Searching…</p>
                  </div>
                )}
                {!searching && suggestions.length === 0 && (
                  <div className="px-4 py-12 text-center">
                    <Search size={36} className="mx-auto mb-3 text-gray-700" />
                    <p className="text-[15px] text-gray-400 font-medium">No results for "{query}"</p>
                    <p className="text-[13px] text-gray-600 mt-1">Try different keywords or check spelling</p>
                  </div>
                )}
                {suggestions.map((s, i) => (
                  <SuggestionRow key={`m-${s.type}-${i}`} s={s} mobile />
                ))}
                {query.trim() && !searching && suggestions.length > 0 && (
                  <button
                    onClick={() => submitSearch()}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-3.5 text-[14px] font-medium text-red-400 active:bg-white/[0.04] border-t border-white/[0.06] transition-colors"
                  >
                    <Search size={14} />
                    See all results for "{query}"
                  </button>
                )}
              </div>
            )}

            {/* ── Idle state: history + trending + popular ── */}
            {!query.trim() && (
              <div className="pt-3 pb-6 space-y-5">
                {/* Search history */}
                {history.length > 0 && (
                  <section className="px-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-semibold text-gray-300 flex items-center gap-1.5">
                        <Clock size={14} /> Recent
                      </span>
                      <button onClick={handleClearHistory} className="text-[12px] text-gray-600 active:text-red-400 transition-colors">
                        Clear all
                      </button>
                    </div>
                    <div className="space-y-0">
                      {history.map((h) => (
                        <div key={h.id} className="flex items-center gap-2 py-2.5 border-b border-white/[0.03] last:border-0">
                          <button onClick={() => searchFor(h.query)} className="flex items-center gap-2.5 text-left flex-1 min-w-0">
                            <Clock size={14} className="text-gray-600 flex-shrink-0" />
                            <span className="text-[14px] text-gray-300 truncate">{h.query}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteHistory(h.id)}
                            className="text-gray-700 active:text-red-400 transition-colors p-1.5 -mr-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Trending terms */}
                {trending && trending.trending_terms.length > 0 && (
                  <section className="px-4">
                    <span className="text-[13px] font-semibold text-gray-300 flex items-center gap-1.5 mb-2.5">
                      <TrendingUp size={14} /> Trending
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {trending.trending_terms.map((term) => (
                        <button
                          key={term}
                          onClick={() => searchFor(term)}
                          className="px-3.5 py-2 text-[13px] bg-white/[0.06] active:bg-red-600/20 active:text-red-400 text-gray-300 rounded-full transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Popular movies — horizontal scroll */}
                {trending && trending.popular_movies.length > 0 && (
                  <section>
                    <span className="text-[13px] font-semibold text-gray-300 flex items-center gap-1.5 mb-2.5 px-4">
                      <Film size={14} /> Popular Movies
                    </span>
                    <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide">
                      {trending.popular_movies.slice(0, 10).map((m) => (
                        <button key={m.id} onClick={() => { navigate(`/watch/${m.id}`); closeSearch(); }} className="flex-shrink-0 w-[100px] text-left group/card">
                          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-white/[0.03]">
                            <img
                              src={getImageUrl(m.thumbnail_url || m.image_url)}
                              alt={m.title}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-tight">{m.title}</p>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Popular series — horizontal scroll */}
                {trending && trending.popular_series.length > 0 && (
                  <section>
                    <span className="text-[13px] font-semibold text-gray-300 flex items-center gap-1.5 mb-2.5 px-4">
                      <Film size={14} /> Popular Series
                    </span>
                    <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide">
                      {trending.popular_series.slice(0, 10).map((s) => (
                        <button key={s.id} onClick={() => { navigate(`/watch/${s.id}`); closeSearch(); }} className="flex-shrink-0 w-[100px] text-left group/card">
                          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-white/[0.03]">
                            <img
                              src={getImageUrl(s.thumbnail_url || s.image_url)}
                              alt={s.title}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-tight">{s.title}</p>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Fallback */}
                {!trending && history.length === 0 && (
                  <div className="py-16 text-center px-4">
                    <Search size={40} className="mx-auto mb-3 text-gray-800" />
                    <p className="text-[15px] text-gray-500">Search for movies, series, actors…</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </>
  );
};

export default MainNavV2;
