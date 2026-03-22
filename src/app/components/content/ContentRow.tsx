// src/app/components/content/ContentRow.tsx — HOME-03
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieV2 } from '../../services/v2/MoviesV2Service';
import { ManifestMovie } from '../../services/v2/ManifestV2Service';
import MovieCard from './MovieCard';
import ContentRowSkeleton from './ContentRowSkeleton';

type ContentItem = MovieV2 | ManifestMovie;

interface ContentRowProps {
  title: string;
  items?: ContentItem[];
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
    <section className="mb-14">
      {/* Row header */}
      <div className="flex items-center justify-between mb-3.5 px-4 sm:px-6 lg:px-8">
        <h2 className="text-white text-[15px] sm:text-base font-semibold font-heading">{title}</h2>
        {seeAllLink && (
          <Link to={seeAllLink} className="no-underline text-white/40 text-[12px] hover:text-white/70 transition-colors">
            See all
          </Link>
        )}
      </div>

      {/* Scroll container */}
      <div className="relative group/row">
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hidden sm:flex border border-white/10"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 sm:gap-2.5 overflow-x-auto scroll-smooth px-4 sm:px-6 lg:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items!.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-[130px] sm:w-[160px]">
              <MovieCard movie={movie} showEpisodeLabel={showEpisodeLabel} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hidden sm:flex border border-white/10"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
};

export default ContentRow;
