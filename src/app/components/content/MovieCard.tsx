// src/app/components/content/MovieCard.tsx — HOME-04
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Info, Star } from 'lucide-react';
import { MovieV2 } from '../../services/v2/MoviesV2Service';

interface MovieCardProps {
  movie: MovieV2;
  /** Show episode label for series rows */
  showEpisodeLabel?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, showEpisodeLabel = false }) => {
  const [imgError, setImgError] = useState(false);

  const isPremium = movie.is_premium === 'Yes';
  const isSeries = movie.type === 'Series';
  const watchPath = isSeries ? `/series/${movie.id}` : `/watch/${movie.id}`;

  const imageSrc = imgError
    ? '/placeholder-poster.jpg'
    : movie.thumbnail_url || movie.image_url || '/placeholder-poster.jpg';

  const ratingDisplay = movie.rating ? movie.rating.toFixed(1) : null;

  return (
    <div className="group relative flex-shrink-0 w-36 sm:w-44 cursor-pointer select-none">
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
        <img
          src={imageSrc}
          alt={movie.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Premium badge */}
        {isPremium && (
          <span className="absolute top-2 left-2 bg-brand-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
            PREMIUM
          </span>
        )}

        {/* Episode label */}
        {showEpisodeLabel && movie.episode_number && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
            EP {movie.episode_number}
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <Link
            to={watchPath}
            className="p-2 bg-white rounded-full text-black hover:bg-gray-200 transition-colors"
            title="Play"
          >
            <Play size={16} fill="currentColor" />
          </Link>
          <button
            className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors border border-white/50"
            title="Add to watchlist"
          >
            <Plus size={16} />
          </button>
          <Link
            to={watchPath}
            className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors border border-white/50"
            title="More info"
          >
            <Info size={16} />
          </Link>
        </div>
      </div>

      {/* Info below poster */}
      <div className="mt-2 px-0.5">
        <p className="text-white text-sm font-medium leading-tight line-clamp-1" title={movie.title}>
          {movie.title}
        </p>
        <div className="flex items-center gap-2 mt-1 text-gray-400 text-xs">
          {movie.year && <span>{movie.year}</span>}
          {ratingDisplay && (
            <span className="flex items-center gap-0.5 text-brand-gold">
              <Star size={10} fill="currentColor" />
              {ratingDisplay}
            </span>
          )}
          {movie.genre && (
            <span className="bg-gray-700 text-gray-300 px-1.5 rounded">{movie.genre.split(',')[0].trim()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
