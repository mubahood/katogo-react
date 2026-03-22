// src/app/components/content/MovieCard.tsx — HOME-04
// Overlay-focused movie card — navigates to movie detail
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { MovieV2 } from '../../services/v2/MoviesV2Service';
import { ManifestMovie } from '../../services/v2/ManifestV2Service';
import { getImageUrl } from '../../utils/imageUtils';

interface MovieCardProps {
  movie: MovieV2 | ManifestMovie;
  showEpisodeLabel?: boolean;
}

function movieDetailPath(movie: MovieV2 | ManifestMovie): string {
  return `/watch/${movie.id}`;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, showEpisodeLabel = false }) => {
  const [imgError, setImgError] = useState(false);

  const isPremium = movie.is_premium === 'Yes';
  const genre = movie.genre?.split(',')[0]?.trim();
  const ratingDisplay = movie.rating ? String(movie.rating) : null;
  const episodeNumber = 'episode_number' in movie ? movie.episode_number : undefined;

  const imageSrc = imgError
    ? '/placeholder-poster.jpg'
    : getImageUrl(movie.thumbnail_url || ('image_url' in movie ? movie.image_url : ''));

  return (
    <Link
      to={movieDetailPath(movie)}
      className="group relative cursor-pointer select-none no-underline"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden bg-[#1a1a1e]">
        <img
          src={imageSrc}
          alt={movie.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Always-visible bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Premium badge */}
        {isPremium && (
          <span className="absolute top-2.5 left-2.5 bg-brand-gold text-black text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-lg">
            Premium
          </span>
        )}

        {/* Episode label */}
        {showEpisodeLabel && episodeNumber && (
          <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-md">
            EP {episodeNumber}
          </span>
        )}

        {/* Hover play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-xl shadow-black/30 transition-transform duration-300 group-hover:scale-100 scale-75">
            <Play size={18} fill="black" className="text-black ml-0.5" />
          </div>
        </div>

        {/* Bottom overlay info */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
          <p className="text-white text-[12px] font-semibold leading-tight line-clamp-1 mb-1">
            {movie.title}
          </p>
          <div className="flex items-center gap-1.5 text-[10px]">
            {ratingDisplay && (
              <span className="flex items-center gap-0.5 text-brand-gold font-medium">
                <Star size={8} fill="currentColor" /> {ratingDisplay}
              </span>
            )}
            {movie.year && <span className="text-white/50">{movie.year}</span>}
            {genre && <span className="text-white/40">{genre}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
