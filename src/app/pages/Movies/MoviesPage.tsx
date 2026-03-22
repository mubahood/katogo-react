// src/app/pages/Movies/MoviesPage.tsx
// Clean, minimal movie listing page — Tailwind-only, v2 API
import React, { useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Film, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useGetMoviesQuery } from '../../store/api/moviesApi';
import { useGetManifestQuery } from '../../store/api/manifestApi';
import type { MoviesV2Params } from '../../services/v2/MoviesV2Service';
import MovieCard from '../../components/content/MovieCard';

interface MoviesPageProps {
  contentType?: 'Movie' | 'Series';
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'popular', label: 'Popular' },
  { value: 'rating', label: 'Top Rated' },
] as const;

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

/* ─── Pagination ────────────────────────────── */
const PaginationBar: React.FC<{
  current: number;
  total: number;
  onChange: (p: number) => void;
}> = ({ current, total, onChange }) => {
  if (total <= 1) return null;

  const pages: (number | '...')[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-10 pb-6">
      {/* Page info */}
      <p className="text-white/25 text-[11px] tabular-nums">Page {current} of {total}</p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(current - 1)}
          disabled={current <= 1}
          className="h-9 px-3 rounded-lg flex items-center justify-center text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-[12px] gap-1"
        >
          <ChevronLeft size={14} /> <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, i) =>
            p === '...' ? (
              <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-white/25 text-[12px]">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`w-9 h-9 rounded-lg text-[12px] font-medium transition-colors ${
                  p === current
                    ? 'bg-brand-red text-white shadow-lg shadow-red-500/20'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onChange(current + 1)}
          disabled={current >= total}
          className="h-9 px-3 rounded-lg flex items-center justify-center text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-[12px] gap-1"
        >
          <span className="hidden sm:inline">Next</span> <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

/* ─── Skeleton card ─────────────────────────── */
const CardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="aspect-[2/3] rounded-lg bg-white/[0.06]" />
    <div className="mt-2 h-3 w-3/4 rounded bg-white/[0.06]" />
    <div className="mt-1.5 h-2.5 w-1/2 rounded bg-white/[0.04]" />
  </div>
);

/* ─── Select dropdown ───────────────────────── */
const FilterSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}> = ({ value, onChange, placeholder, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="appearance-none bg-white/[0.05] border border-white/[0.08] text-[12px] text-white/70 rounded-lg pl-3 pr-7 py-2 cursor-pointer hover:bg-white/[0.08] transition-colors focus:outline-none focus:border-white/20"
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
const MoviesPage: React.FC<MoviesPageProps> = ({ contentType }) => {
  const { type } = useParams<{ type?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: manifest } = useGetManifestQuery();

  // Derive content type
  const activeContentType = useMemo<'Movie' | 'Series' | undefined>(() => {
    if (contentType) return contentType;
    if (type === 'series') return 'Series';
    if (type === 'movies') return 'Movie';
    return undefined;
  }, [contentType, type]);

  // Read filters from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const genre = searchParams.get('genre') || undefined;
  const vj = searchParams.get('vj') || undefined;
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;
  const sort = (searchParams.get('sort') as MoviesV2Params['sort']) || 'newest';

  const queryParams: MoviesV2Params = {
    page: currentPage,
    per_page: 24,
    ...(activeContentType && { type: activeContentType }),
    ...(genre && { genre }),
    ...(vj && { vj }),
    ...(year && { year }),
    sort,
  };

  const { data, isLoading, isError } = useGetMoviesQuery(queryParams);

  const movies = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.last_page ?? 1;
  const totalItems = pagination?.total ?? 0;

  // Dynamic genres & VJs from manifest
  const genres = manifest?.genres ?? [];
  const vjs = manifest?.vjs ?? [];

  const setFilter = useCallback((key: string, value: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.set('page', '1');
      return next;
    });
  }, [setSearchParams]);

  const handlePageChange = useCallback((page: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', page.toString());
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setSearchParams]);

  const clearFilters = () => setSearchParams(new URLSearchParams());

  const hasActiveFilters = !!(genre || vj || year);
  const activeFilterCount = [genre, vj, year].filter(Boolean).length;

  const pageTitle = activeContentType === 'Series' ? 'Series' : activeContentType === 'Movie' ? 'Movies' : 'Browse';

  return (
    <div className="min-h-screen bg-[#0a0a0c] pt-[60px] lg:pt-[64px] pb-[68px] lg:pb-10">
      <div className="px-3 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">

        {/* ── Header + Filter Bar ──────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 sm:pt-6 mb-6 sm:mb-8">
          {/* Title & count */}
          <div className="flex items-baseline gap-3">
            <h1 className="text-white text-base sm:text-lg font-semibold leading-tight">{pageTitle}</h1>
            {!isLoading && totalItems > 0 && (
              <span className="text-white/25 text-[11px] tabular-nums">{totalItems.toLocaleString()}</span>
            )}
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {genres.length > 0 && (
              <FilterSelect
                value={genre || ''}
                onChange={v => setFilter('genre', v || null)}
                placeholder="Genre"
                options={genres.map(g => ({ value: g, label: g }))}
              />
            )}
            {vjs.length > 0 && (
              <FilterSelect
                value={vj || ''}
                onChange={v => setFilter('vj', v || null)}
                placeholder="VJ"
                options={vjs.map(v => ({ value: v, label: v }))}
              />
            )}
            <FilterSelect
              value={year?.toString() || ''}
              onChange={v => setFilter('year', v || null)}
              placeholder="Year"
              options={YEARS.map(y => ({ value: y.toString(), label: y.toString() }))}
            />
            <FilterSelect
              value={sort}
              onChange={v => setFilter('sort', v === 'newest' ? null : v)}
              placeholder="Sort"
              options={SORT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
            />

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-[11px] font-medium text-red-400/80 hover:text-red-400 bg-red-500/10 hover:bg-red-500/15 transition-colors"
              >
                <X size={10} /> Clear{activeFilterCount > 1 ? ` (${activeFilterCount})` : ''}
              </button>
            )}
          </div>
        </div>

        {/* ── Error State ──────────────────────── */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Film size={32} className="text-white/10 mb-3" />
            <p className="text-white/40 text-[13px]">Failed to load content</p>
            <p className="text-white/20 text-[11px] mt-1">Check your connection and try again.</p>
          </div>
        )}

        {/* ── Skeleton Grid ────────────────────── */}
        {isLoading && (
          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
            {Array.from({ length: 24 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {/* ── Empty State ──────────────────────── */}
        {!isLoading && !isError && movies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Film size={32} className="text-white/10 mb-3" />
            <p className="text-white/40 text-[13px]">
              No {activeContentType?.toLowerCase() ?? 'content'} found
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-brand-red text-[12px] font-medium hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* ── Movies Grid ──────────────────────── */}
        {!isLoading && movies.length > 0 && (
          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {/* ── Pagination ───────────────────────── */}
        {!isLoading && totalPages > 1 && (
          <PaginationBar current={currentPage} total={totalPages} onChange={handlePageChange} />
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
