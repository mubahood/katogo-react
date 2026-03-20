import React from 'react';
import MovieCardSkeleton from '../Movies/MovieCardSkeleton';

interface ContentRowSkeletonProps {
  itemCount?: number;
  title?: string;
}

const ContentRowSkeleton: React.FC<ContentRowSkeletonProps> = ({
  itemCount = 8,
  title,
}) => {
  return (
    <section className="mb-8" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between mb-3 px-4 sm:px-6">
        <div className="space-y-2">
          {title ? <h2 className="text-white text-lg sm:text-xl font-semibold font-heading">{title}</h2> : null}
          <div className="h-4 w-28 rounded bg-gray-800 animate-pulse" />
        </div>
        <div className="h-4 w-16 rounded bg-gray-800 animate-pulse" />
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 sm:px-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <MovieCardSkeleton key={index} variant="compact" />
        ))}
      </div>
    </section>
  );
};

export default ContentRowSkeleton;