// src/app/components/content/ContentRow.tsx — HOME-03
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieV2 } from '../../services/v2/MoviesV2Service';
import MovieCard from './MovieCard';
import ContentRowSkeleton from './ContentRowSkeleton';

interface ContentRowProps {
  title: string;
  items?: MovieV2[];
  seeAllLink?: string;
  isLoading?: boolean;
  showEpisodeLabel?: boolean;
}

const ContentRow: React.FC<ContentRowProps> = ({
  title,
  items,
  seeAllLink,
  isLoading = false,
  showEpisodeLabel = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  if (isLoading) {
    return <ContentRowSkeleton title={title} />;
  }

  if (!isLoading && (!items || items.length === 0)) return null;

  return (
    <section className="mb-8">
      {/* Row header */}
      <div className="flex items-center justify-between mb-3 px-4 sm:px-6">
        <h2 className="text-white text-lg sm:text-xl font-semibold font-heading">{title}</h2>
        {seeAllLink && !isLoading && (
          <Link to={seeAllLink} className="text-brand-red text-sm hover:text-brand-gold transition-colors">
            See all
          </Link>
        )}
      </div>

      {/* Scroll container with arrow buttons */}
      <div className="relative group/row">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-2 rounded-r-lg opacity-0 group-hover/row:opacity-100 transition-opacity hidden sm:flex items-center"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items!.map((movie) => (
            <MovieCard key={movie.id} movie={movie} showEpisodeLabel={showEpisodeLabel} />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-2 rounded-l-lg opacity-0 group-hover/row:opacity-100 transition-opacity hidden sm:flex items-center"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default ContentRow;
