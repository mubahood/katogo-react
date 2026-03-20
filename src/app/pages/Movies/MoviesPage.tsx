// src/app/pages/Movies/MoviesPage.tsx
import React, { useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, ChevronDown, Film, X } from 'lucide-react';
import { useGetMoviesQuery } from '../../store/api/moviesApi';
import type { MoviesV2Params } from '../../services/v2/MoviesV2Service';
import MovieCard from '../../components/Movies/MovieCard';
import MovieCardSkeleton from '../../components/Movies/MovieCardSkeleton';
import Pagination from './components/Pagination';
import './MoviesPage.css';

interface MoviesPageProps {
  contentType?: 'Movie' | 'Series';
}

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Documentary', 'Animation', 'Family', 'Sci-Fi'];
const LANGUAGES = ['Luganda', 'English', 'Swahili', 'French'];
const VJS = ['VJ Junior', 'VJ Emmie', 'VJ Ice', 'VJ Remo', 'VJ Pimpa', 'VJ Kats'];
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
] as const;

const MoviesPage: React.FC<MoviesPageProps> = ({ contentType }) => {
  const navigate = useNavigate();
  const { type } = useParams<{ type?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive content type from prop, route param, or default
  const activeContentType = useMemo<'Movie' | 'Series' | undefined>(() => {
    if (contentType) return contentType;
    if (type === 'series') return 'Series';
    if (type === 'movies') return 'Movie';
    return undefined;
  }, [contentType, type]);

  // Read all filters from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const genre = searchParams.get('genre') || undefined;
  const language = searchParams.get('language') || undefined;
  const vj = searchParams.get('vj') || undefined;
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;
  const sort = (searchParams.get('sort') as MoviesV2Params['sort']) || 'newest';

  const queryParams: MoviesV2Params = {
    page: currentPage,
    per_page: 24,
    ...(activeContentType && { type: activeContentType }),
    ...(genre && { genre }),
    ...(language && { language }),
    ...(vj && { vj }),
    ...(year && { year }),
    sort,
  };

  const { data, isLoading, isError } = useGetMoviesQuery(queryParams);

  const movies = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.last_page ?? 1;
  const totalItems = pagination?.total ?? 0;

  // Update a single URL filter param, reset page to 1
  const setFilter = useCallback((key: string, value: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
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
  }, [setSearchParams]);

  const clearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      if (prev.get('page')) next.set('page', '1');
      return next;
    });
  };

  const hasActiveFilters = !!(genre || language || vj || year);

  const pageTitle = activeContentType === 'Series' ? 'Browse Series' : activeContentType === 'Movie' ? 'Browse Movies' : 'All Content';

  return (
    <div className="movies-page">
      <div className="movies-content">
        {/* Filter Bar */}
        <div className="movies-filters-bar">
          <div className="movies-filters-left">
            <Filter size={14} className="filter-icon" />
            <span className="filter-label">Filter:</span>

            {/* Genre */}
            <div className="filter-select-wrap">
              <select
                className="filter-select"
                value={genre || ''}
                onChange={(e) => setFilter('genre', e.target.value || null)}
              >
                <option value="">Genre</option>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown size={12} className="select-chevron" />
            </div>

            {/* Language */}
            <div className="filter-select-wrap">
              <select
                className="filter-select"
                value={language || ''}
                onChange={(e) => setFilter('language', e.target.value || null)}
              >
                <option value="">Language</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <ChevronDown size={12} className="select-chevron" />
            </div>

            {/* VJ */}
            <div className="filter-select-wrap">
              <select
                className="filter-select"
                value={vj || ''}
                onChange={(e) => setFilter('vj', e.target.value || null)}
              >
                <option value="">VJ</option>
                {VJS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <ChevronDown size={12} className="select-chevron" />
            </div>

            {/* Year */}
            <div className="filter-select-wrap">
              <select
                className="filter-select"
                value={year?.toString() || ''}
                onChange={(e) => setFilter('year', e.target.value || null)}
              >
                <option value="">Year</option>
                {YEARS.map((y) => <option key={y} value={y.toString()}>{y}</option>)}
              </select>
              <ChevronDown size={12} className="select-chevron" />
            </div>

            {hasActiveFilters && (
              <button className="filter-clear-btn" onClick={clearFilters}>
                <X size={12} /> Clear
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="filter-select-wrap">
            <select
              className="filter-select"
              value={sort}
              onChange={(e) => setFilter('sort', e.target.value)}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={12} className="select-chevron" />
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="movies-count">
            {totalItems > 0 ? `${totalItems} ${activeContentType ?? 'items'} found` : ''}
          </p>
        )}

        {/* Error State */}
        {isError && (
          <div className="movies-empty">
            <Film size={48} />
            <h3>Failed to load content</h3>
            <p>Please try again later.</p>
          </div>
        )}

        {/* Skeleton */}
        {isLoading && (
          <div className="movies-grid-v2">
            {Array.from({ length: 24 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && movies.length === 0 && (
          <div className="movies-empty">
            <Film size={48} />
            <h3>No {activeContentType?.toLowerCase() ?? 'content'} found</h3>
            {hasActiveFilters && <p>Try adjusting your filters.</p>}
          </div>
        )}

        {/* Movies Grid */}
        {movies.length > 0 && (
          <div className="movies-grid-v2">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie as any}
                onClick={(m: any) => navigate(`/watch/${m.id}`)}
                onPlay={(m: any) => navigate(`/watch/${m.id}`)}
                onAddToWatchlist={() => {}}
                showProgress={false}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={24}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
