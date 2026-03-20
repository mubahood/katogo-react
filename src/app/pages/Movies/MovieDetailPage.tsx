// src/app/pages/Movies/MovieDetailPage.tsx (MOVIES-03)
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Heart, BookmarkPlus, Share2, Star, Calendar, Clock, Globe, Users, Flag, ChevronRight } from 'lucide-react';
import { useGetMovieQuery, useGetRelatedMoviesQuery } from '../../store/api/moviesApi';
import ReportContentModal from '../../components/moderation/ReportContentModal';
import ContentRow from '../../components/content/ContentRow';
import { ApiService } from '../../services/ApiService';
import type { MovieV2 } from '../../services/v2/MoviesV2Service';

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const movieId = Number(id);

  const { data: movie, isLoading, isError } = useGetMovieQuery(movieId, { skip: !movieId });
  const { data: related, isLoading: relatedLoading } = useGetRelatedMoviesQuery(movieId, { skip: !movieId });

  const [inWatchlist, setInWatchlist] = useState<boolean | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [actionLoading, setActionLoading] = useState<'watchlist' | 'like' | null>(null);

  const watchlistState = inWatchlist ?? false;
  const likeState = isLiked;

  const handleWatchlistToggle = async () => {
    if (!movie) return;
    setActionLoading('watchlist');
    try {
      const result = await ApiService.toggleMovieWishlist(movie.id);
      setInWatchlist(result.wishlisted);
    } catch {
      // non-critical
    } finally {
      setActionLoading(null);
    }
  };

  const handleLikeToggle = async () => {
    if (!movie) return;
    setActionLoading('like');
    try {
      const result = await ApiService.toggleMovieLike(movie.id);
      setIsLiked(result.liked);
    } catch {
      // non-critical
    } finally {
      setActionLoading(null);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: movie?.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Backdrop skeleton */}
        <div className="w-full h-72 md:h-96 bg-gray-800 animate-pulse" />
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
          <div className="h-8 w-64 bg-gray-800 animate-pulse rounded" />
          <div className="h-4 w-full max-w-xl bg-gray-800 animate-pulse rounded" />
          <div className="h-4 w-full max-w-lg bg-gray-800 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Movie not found.</p>
        <button onClick={() => navigate(-1)} className="text-red-500 hover:underline">Go back</button>
      </div>
    );
  }

  const backdropUrl = movie.poster_url || movie.thumbnail_url;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Backdrop */}
      <div className="relative w-full h-72 md:h-[420px] overflow-hidden">
        <img
          src={backdropUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover object-top opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-40 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={movie.thumbnail_url}
              alt={movie.title}
              loading="lazy"
              className="w-40 md:w-56 rounded-lg shadow-2xl border border-gray-700"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">{movie.title}</h1>
                {movie.series_title && (
                  <p className="text-gray-400 mt-1">Part of <span className="text-white font-medium">{movie.series_title}</span></p>
                )}
              </div>
              <button
                onClick={() => setShowReport(true)}
                className="flex items-center gap-1 text-gray-500 hover:text-red-400 transition-colors text-sm mt-1"
              >
                <Flag size={14} /> Report
              </button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">{movie.type}</span>
              {movie.is_premium === 'Yes' && (
                <span className="bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded">PREMIUM</span>
              )}
              {movie.genre && (
                <Link to={`/movies?genre=${encodeURIComponent(movie.genre)}`} className="bg-gray-700 hover:bg-gray-600 text-gray-100 text-xs px-2 py-1 rounded transition-colors">
                  {movie.genre}
                </Link>
              )}
              {movie.language && (
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">{movie.language}</span>
              )}
              {movie.vj && (
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">VJ {movie.vj}</span>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {movie.year && (
                <span className="flex items-center gap-1"><Calendar size={14} />{movie.year}</span>
              )}
              {movie.duration && (
                <span className="flex items-center gap-1"><Clock size={14} />{movie.duration}</span>
              )}
              {movie.rating && (
                <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400" />{movie.rating}</span>
              )}
              {movie.imdb_rating && (
                <span className="flex items-center gap-1 text-yellow-400">IMDB {movie.imdb_rating}</span>
              )}
              {movie.country && (
                <span className="flex items-center gap-1"><Globe size={14} />{movie.country}</span>
              )}
              {movie.views_count > 0 && (
                <span className="flex items-center gap-1"><Users size={14} />{movie.views_count.toLocaleString()} views</span>
              )}
            </div>

            {/* Description */}
            {movie.description && (
              <p className="text-gray-300 leading-relaxed max-w-2xl">{movie.description}</p>
            )}

            {/* Director / Stars */}
            {(movie.director || movie.stars || movie.actor) && (
              <div className="space-y-1 text-sm text-gray-400">
                {movie.director && <p><span className="text-gray-200 font-medium">Director:</span> {movie.director}</p>}
                {(movie.stars || movie.actor) && <p><span className="text-gray-200 font-medium">Cast:</span> {movie.stars || movie.actor}</p>}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => navigate(`/watch/${movie.id}`)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <Play size={18} fill="white" /> Watch Now
              </button>

              <button
                onClick={handleWatchlistToggle}
                disabled={actionLoading === 'watchlist'}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors border ${
                  watchlistState
                    ? 'bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600/30'
                    : 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700'
                }`}
              >
                <BookmarkPlus size={16} />
                {watchlistState ? 'In Watchlist' : 'Add to Watchlist'}
              </button>

              <button
                onClick={handleLikeToggle}
                disabled={actionLoading === 'like'}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors border ${
                  likeState
                    ? 'bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600/30'
                    : 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700'
                }`}
              >
                <Heart size={16} fill={likeState ? 'currentColor' : 'none'} />
                {movie.likes_count ? `${movie.likes_count.toLocaleString()} Likes` : 'Like'}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-gray-800 border border-gray-600 hover:bg-gray-700 text-gray-200 px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Related Movies */}
        {(related?.length || relatedLoading) && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">You May Also Like</h2>
              <Link to="/movies" className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                Browse All <ChevronRight size={14} />
              </Link>
            </div>
            <ContentRow
              title=""
              items={related as MovieV2[]}
              isLoading={relatedLoading}
            />
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportContentModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        contentType="movie"
        contentId={movie.id}
      />
    </div>
  );
};

export default MovieDetailPage;
