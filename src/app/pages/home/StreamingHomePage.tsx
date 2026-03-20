// src/app/pages/home/StreamingHomePage.tsx — HOME-02
// Main streaming home page using RTK Query manifestApi and new content components
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Info, Tv } from 'lucide-react';
import { useGetManifestQuery } from '../../store/api/manifestApi';
import ContentRow from '../../components/content/ContentRow';

// ──────────────────────────────────────────
// Hero Banner
// ──────────────────────────────────────────
const HeroBanner: React.FC<{
  movie?: {
    id: number;
    title: string;
    description: string;
    thumbnail_url: string;
    image_url?: string;
    genre?: string;
    year?: number;
    type: string;
  };
  isLoading: boolean;
}> = ({ movie, isLoading }) => {
  if (isLoading) {
    return (
      <div className="relative w-full h-[56vw] max-h-[80vh] min-h-[340px] bg-gray-900 animate-pulse">
        <div className="absolute bottom-16 left-6 sm:left-12 max-w-lg space-y-4">
          <div className="h-8 w-64 bg-gray-700 rounded" />
          <div className="h-4 w-48 bg-gray-700 rounded" />
          <div className="h-4 w-80 bg-gray-700 rounded" />
          <div className="flex gap-3 mt-4">
            <div className="h-10 w-28 bg-gray-700 rounded-full" />
            <div className="h-10 w-28 bg-gray-700 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const heroImage = movie.image_url || movie.thumbnail_url;
  const watchPath = movie.type === 'Series' ? `/series/${movie.id}` : `/watch/${movie.id}`;

  return (
    <div className="relative w-full h-[56vw] max-h-[80vh] min-h-[340px] overflow-hidden bg-gray-950">
      {/* Background image */}
      <img
        src={heroImage}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/20" />

      {/* Content */}
      <div className="absolute bottom-12 sm:bottom-20 left-4 sm:left-12 max-w-xl">
        {movie.genre && (
          <span className="inline-block bg-brand-red text-white text-xs font-semibold px-2 py-0.5 rounded mb-3 uppercase tracking-wider">
            {movie.genre.split(',')[0].trim()}
          </span>
        )}
        <h1 className="text-white text-3xl sm:text-5xl font-bold font-heading leading-tight mb-2">
          {movie.title}
        </h1>
        {movie.year && (
          <p className="text-gray-400 text-sm mb-3">{movie.year}</p>
        )}
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed line-clamp-3 mb-5">
          {movie.description}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to={watchPath}
            className="inline-flex items-center gap-2 bg-white text-black font-semibold px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors text-sm"
          >
            <Play size={16} fill="currentColor" /> Watch Now
          </Link>
          <button className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-white/30 transition-colors text-sm border border-white/40">
            <Plus size={16} /> My List
          </button>
          <Link
            to={watchPath}
            className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-4 py-2.5 rounded-full hover:bg-white/30 transition-colors text-sm border border-white/40"
          >
            <Info size={16} /> Info
          </Link>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────
// Live TV Teaser strip
// ──────────────────────────────────────────
const LiveTVTeaser: React.FC = () => (
  <div className="mx-4 sm:mx-6 mb-8 rounded-xl overflow-hidden bg-gradient-to-r from-red-900 to-red-700 relative">
    <div className="absolute inset-0 opacity-10 bg-[url('/tv-pattern.svg')] bg-repeat" />
    <div className="relative flex items-center justify-between px-6 py-5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Tv size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-lg font-heading">Live TV</p>
          <p className="text-red-200 text-sm">Watch live Ugandan & international channels</p>
        </div>
      </div>
      <Link
        to="/live"
        className="bg-white text-red-700 font-semibold px-5 py-2 rounded-full text-sm hover:bg-gray-100 transition-colors flex-shrink-0"
      >
        Watch Live
      </Link>
    </div>
  </div>
);

// ──────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────
const StreamingHomePage: React.FC = () => {
  const { data: manifest, isLoading, isError } = useGetManifestQuery();

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-red-400 text-lg font-semibold mb-2">Failed to load content</p>
        <p className="text-gray-500 text-sm">Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 -mt-[var(--nav-height,0px)]">
      {/* Hero */}
      <HeroBanner movie={manifest?.featured} isLoading={isLoading} />

      {/* Content rows */}
      <div className="pt-6">
        <ContentRow
          title="Continue Watching"
          items={manifest?.continue_watching}
          isLoading={isLoading}
        />
        <ContentRow
          title="Trending Now"
          items={manifest?.trending}
          seeAllLink="/movies?sort=trending"
          isLoading={isLoading}
        />
        <ContentRow
          title="Popular on Katogo"
          items={manifest?.popular}
          seeAllLink="/movies?sort=popular"
          isLoading={isLoading}
        />
        <ContentRow
          title="Recommended for You"
          items={manifest?.recommendations}
          isLoading={isLoading}
        />

        {/* Live TV teaser */}
        {!isLoading && <LiveTVTeaser />}

        {/* Genre-based rows from categories */}
        {manifest?.categories?.slice(0, 4).map((cat) => (
          <ContentRow
            key={cat.id}
            title={cat.name}
            items={manifest.trending?.filter((m) => m.genre?.toLowerCase().includes(cat.name.toLowerCase())).slice(0, 10)}
            seeAllLink={`/movies?category=${cat.slug}`}
            isLoading={false}
          />
        ))}
      </div>
    </div>
  );
};

export default StreamingHomePage;
