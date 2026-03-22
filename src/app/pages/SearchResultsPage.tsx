// src/app/pages/SearchResultsPage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, Film, Tv, X, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import SearchV2Service, {
  SearchTrending,
  SearchHistoryItem,
} from '../services/v2/SearchV2Service';
import type { MovieV2 } from '../services/v2/MoviesV2Service';
import { getImageUrl } from '../utils/imageUtils';

const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || '';

  const [tab, setTab] = useState<'all' | 'movies' | 'series'>('all');
  const [results, setResults] = useState<MovieV2[]>([]);
  const [filtered, setFiltered] = useState<MovieV2[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState<SearchTrending | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    if (q.length >= 2) {
      setPage(1);
      runSearch(q, 1);
    } else {
      setResults([]);
      setTotal(0);
      loadTrending();
      loadHistory();
    }
  }, [q]);

  useEffect(() => {
    if (q.length >= 2) runSearch(q, page);
  }, [page]);

  useEffect(() => {
    if (tab === 'movies') setFiltered(results.filter((r) => r.type === 'Movie'));
    else if (tab === 'series') setFiltered(results.filter((r) => r.type !== 'Movie'));
    else setFiltered(results);
  }, [tab, results]);

  const runSearch = async (query: string, pageNum: number) => {
    setLoading(true);
    try {
      const data = await SearchV2Service.searchAll(query, pageNum, 20);
      if (pageNum === 1) setResults(data.items ?? []);
      else setResults((prev) => [...prev, ...(data.items ?? [])]);
      setTotal(data.pagination?.total ?? 0);
    } catch { /* silently */ } finally { setLoading(false); }
  };

  const loadTrending = async () => {
    try { setTrending(await SearchV2Service.getTrending()); } catch { /* ok */ }
  };

  const loadHistory = async () => {
    try {
      const data = await SearchV2Service.getSearchHistory(1, 10);
      setHistory(data.items ?? []);
    } catch { /* user may not be logged in */ }
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

  const searchFor = useCallback((term: string) => {
    setSearchParams({ q: term });
  }, [setSearchParams]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState(q);

  /* sync input when q changes (e.g. from trending click) */
  useEffect(() => { setInputVal(q); }, [q]);

  const handleInlineSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) setSearchParams({ q: inputVal.trim() });
  };

  const movieCount = results.filter((r) => r.type === 'Movie').length;
  const seriesCount = results.filter((r) => r.type !== 'Movie').length;

  return (
    <div className="min-h-screen bg-[var(--ugflix-bg-primary,#0d0d0d)] pb-24 pt-2 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Inline search bar */}
        <form onSubmit={handleInlineSearch} className="mb-4">
          <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-white/20 transition-colors">
            <Search size={18} className="text-gray-500 flex-shrink-0" />
            <input
              ref={inputRef}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search movies, series, actors…"
              className="flex-1 bg-transparent text-white placeholder-gray-600 text-[14px] outline-none"
            />
            {inputVal && (
              <button type="button" onClick={() => { setInputVal(''); setSearchParams({}); }} className="text-gray-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        </form>

        <h1 className="text-lg font-semibold text-white mb-1">
          {q ? `Results for "${q}"` : 'Search'}
        </h1>

        {/* Tabs — shown when results exist */}
        {q && results.length > 0 && (
          <>
            <p className="text-xs text-[var(--ugflix-text-muted,#888)] mb-3">
              {total} result{total !== 1 ? 's' : ''} found
            </p>
            <div className="flex gap-1 mb-4 border-b border-[var(--ugflix-border,#1e1e1e)]">
              {([
                { key: 'all' as const, label: 'All', count: results.length },
                { key: 'movies' as const, label: 'Movies', count: movieCount },
                { key: 'series' as const, label: 'Series', count: seriesCount },
              ]).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    tab === key
                      ? 'border-[var(--color-brand-red,#E50914)] text-white'
                      : 'border-transparent text-[var(--ugflix-text-muted,#888)] hover:text-white'
                  }`}
                >
                  {label} <span className="ml-1 opacity-60">({count})</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-md bg-[var(--ugflix-bg-secondary,#161616)] animate-pulse" />
            ))}
          </div>
        )}

        {/* Results grid */}
        {!loading && filtered.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {filtered.map((item) => (
                <button key={item.id} onClick={() => navigate(`/watch/${item.id}`)} className="group text-left">
                  <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-[var(--ugflix-bg-secondary,#161616)] mb-1">
                    <img
                      src={getImageUrl(item.thumbnail_url || item.image_url)}
                      alt={item.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.is_premium === 'Yes' && (
                      <span className="absolute top-1 left-1 text-[10px] bg-[var(--color-brand-gold,#F5A623)] text-black font-bold px-1 rounded">PRO</span>
                    )}
                  </div>
                  <p className="text-xs text-white font-medium leading-tight line-clamp-2">{item.title}</p>
                  {item.vj && <p className="text-[10px] text-[var(--ugflix-text-muted,#888)]">VJ {item.vj}</p>}
                </button>
              ))}
            </div>
            {results.length < total && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                  className="px-6 py-2 text-sm border border-[var(--ugflix-border,#1e1e1e)] rounded-lg text-white hover:border-[var(--color-brand-red,#E50914)] transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && q.length >= 2 && filtered.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto mb-3 text-[var(--ugflix-text-muted,#888)]" />
            <h3 className="text-white font-medium mb-1">No results for "{q}"</h3>
            <p className="text-sm text-[var(--ugflix-text-muted,#888)]">Try different keywords</p>
          </div>
        )}

        {/* No query — show History + Trending */}
        {!q && (
          <div className="space-y-8">
            {history.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-[var(--ugflix-text-secondary,#ccc)] flex items-center gap-1.5">
                    <Clock size={14} /> Recent Searches
                  </h2>
                  <button onClick={handleClearHistory} className="text-xs text-[var(--color-brand-red,#E50914)] hover:underline">
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((h) => (
                    <div key={h.id} className="flex items-center gap-1 bg-[var(--ugflix-bg-secondary,#161616)] rounded-full pl-3 pr-1.5 py-1 group">
                      <button onClick={() => searchFor(h.query)} className="text-xs text-white hover:text-[var(--color-brand-red,#E50914)] transition-colors">
                        {h.query}
                      </button>
                      <button onClick={() => handleDeleteHistory(h.id)} className="p-0.5 rounded-full hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
                        <X size={10} className="text-[var(--ugflix-text-muted,#888)]" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {trending && (
              <>
                {trending.trending_terms.length > 0 && (
                  <section>
                    <h2 className="text-sm font-semibold text-[var(--ugflix-text-secondary,#ccc)] flex items-center gap-1.5 mb-3">
                      <TrendingUp size={14} /> Trending
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {trending.trending_terms.map((term) => (
                        <button key={term} onClick={() => searchFor(term)}
                          className="px-3 py-1.5 text-xs bg-[var(--ugflix-bg-secondary,#161616)] rounded-full text-white hover:bg-[var(--color-brand-red,#E50914)] transition-colors">
                          {term}
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                {trending.popular_movies.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold text-white flex items-center gap-1.5"><Film size={14} /> Popular Movies</h2>
                      <Link to="/movies" className="text-xs text-[var(--ugflix-text-muted,#888)] flex items-center gap-0.5 hover:text-white">See all <ChevronRight size={12} /></Link>
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                      {trending.popular_movies.slice(0, 6).map((m) => (
                        <button key={m.id} onClick={() => navigate(`/watch/${m.id}`)} className="group text-left">
                          <img src={getImageUrl(m.thumbnail_url || m.image_url)} alt={m.title} loading="lazy" referrerPolicy="no-referrer" className="w-full aspect-[2/3] object-cover rounded-md mb-1 group-hover:scale-105 transition-transform duration-300" />
                          <p className="text-xs text-white line-clamp-1">{m.title}</p>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                {trending.popular_series.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold text-white flex items-center gap-1.5"><Tv size={14} /> Popular Series</h2>
                      <Link to="/series" className="text-xs text-[var(--ugflix-text-muted,#888)] flex items-center gap-0.5 hover:text-white">See all <ChevronRight size={12} /></Link>
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                      {trending.popular_series.slice(0, 6).map((s) => (
                        <button key={s.id} onClick={() => navigate(`/watch/${s.id}`)} className="group text-left">
                          <img src={getImageUrl(s.thumbnail_url || s.image_url)} alt={s.title} loading="lazy" referrerPolicy="no-referrer" className="w-full aspect-[2/3] object-cover rounded-md mb-1 group-hover:scale-105 transition-transform duration-300" />
                          <p className="text-xs text-white line-clamp-1">{s.title}</p>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
