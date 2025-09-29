// src/app/components/Movies/ContentSections.tsx
import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieListBuilder from './MovieListBuilder';
import type { Movie, MovieList, ManifestResponse } from '../../services/manifest.service';

interface ContentSectionsProps {
  manifest: ManifestResponse;
  loading?: boolean;
  onMovieClick?: (movie: Movie) => void;
  onRetry?: () => void;
}

const ContentSections: React.FC<ContentSectionsProps> = ({
  manifest,
  loading = false,
  onMovieClick,
  onRetry
}) => {
  const navigate = useNavigate();

  // Debug: Log what we receive
  console.log('📺 ContentSections rendered with:', {
    manifest: !!manifest,
    manifestCode: manifest?.code,
    loading,
    hasData: !!manifest?.data,
    topMovieCount: manifest?.data?.top_movie?.length || 0,
    listsCount: manifest?.data?.lists?.length || 0,
    genresCount: manifest?.data?.genres?.length || 0
  });

  // Handle movie play
  const handleMoviePlay = useCallback((movie: Movie) => {
    navigate(`/watch/${movie.id}`);
  }, [navigate]);

  // Handle add to watchlist
  const handleAddToWatchlist = useCallback((movie: Movie) => {
    console.log('Add to watchlist:', movie.title);
  }, []);

  // Handle view all for category
  const handleViewAll = useCallback((categoryTitle: string) => {
    const categorySlug = categoryTitle.toLowerCase().replace(/\s+/g, '-');
    navigate(`/category/${categorySlug}`);
  }, [navigate]);

  // Handle movie click
  const handleMovieClick = useCallback((movie: Movie) => {
    if (onMovieClick) {
      onMovieClick(movie);
    } else {
      navigate(`/movies/${movie.id}`);
    }
  }, [navigate, onMovieClick]);

  // If loading or no manifest, show skeleton sections
  if (loading || !manifest || manifest.code !== 1 || !manifest.data) {
    return (
      <div className="content-sections">
        <MovieListBuilder
          title="Featured Movies"
          movies={[]}
          loading={true}
          variant="large"
          showProgress={false}
        />
        <MovieListBuilder
          title="Trending Now"
          movies={[]}
          loading={true}
          variant="default"
          showProgress={false}
        />
        <MovieListBuilder
          title="Recommended for You"
          movies={[]}
          loading={true}
          variant="default"
          showProgress={true}
        />
      </div>
    );
  }

  const { data } = manifest;

  // Debug: Check what data we have (using actual API structure)
  console.log('📺 Manifest data structure:', {
    topMovie: data?.top_movie ? data.top_movie.length : 'undefined',
    lists: data?.lists ? data.lists.length : 'undefined',
    genres: data?.genres ? data.genres.length : 'undefined',
    allDataKeys: data ? Object.keys(data) : 'no data'
  });

  return (
    <div className="content-sections">
      {/* Dynamic Movie Lists from Backend */}
      {data.lists && data.lists.length > 0 && (
        <>
          {data.lists.map((list: any, index: number) => {
            // Determine variant based on section title
            let variant: 'default' | 'large' | 'compact' = 'default';
            let showProgress = false;
            
            if (list.title === 'Featured Movies' || index === 0) {
              variant = 'large';
            } else if (list.title === 'Continue Watching') {
              showProgress = true;
            }

            return (
              <MovieListBuilder
                key={`${list.title}-${index}`}
                title={list.title}
                movies={list.movies || []}
                variant={variant}
                showProgress={showProgress}
                maxItems={variant === 'large' ? 10 : 12}
                onMovieClick={handleMovieClick}
                onMoviePlay={handleMoviePlay}
                onAddToWatchlist={handleAddToWatchlist}
                onViewAll={handleViewAll}
                onRetry={onRetry}
              />
            );
          })}
        </>
      )}
    </div>
  );
};

export default memo(ContentSections);