// src/app/components/content/MoviePreviewModal.tsx
// Movie preview popup — shows info + 5-min video preview starting at 10%
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Play, Plus, Star, Clock, Film, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { ManifestMovie } from '../../services/v2/ManifestV2Service';
import { getImageUrl } from '../../utils/imageUtils';

const PREVIEW_MAX_SECONDS = 300; // 5 minutes

interface Props {
  movie: ManifestMovie;
  onClose: () => void;
}

const MoviePreviewModal: React.FC<Props> = ({ movie, onClose }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const watchTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const [muted, setMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [remaining, setRemaining] = useState(PREVIEW_MAX_SECONDS);

  const videoUrl = movie.url;
  const posterUrl = getImageUrl(movie.thumbnail_url);
  const watchPath = `/watch/${movie.id}`;
  const genre = movie.genre?.split(',')[0]?.trim();

  // Seek to 10% once metadata loads
  const handleLoadedMetadata = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const tenPercent = vid.duration * 0.1;
    if (isFinite(tenPercent) && tenPercent > 0) {
      vid.currentTime = tenPercent;
    }
    vid.play().catch(() => {});
    setVideoReady(true);
  }, []);

  // Track watch time, enforce 5-min limit
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const vid = videoRef.current;
      if (!vid || vid.paused) return;
      watchTimeRef.current += 1;
      const left = PREVIEW_MAX_SECONDS - watchTimeRef.current;
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        vid.pause();
        setPreviewEnded(true);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const goWatch = () => {
    onClose();
    navigate(watchPath);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-auto bg-[#141418] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/[0.07] max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Video area */}
        <div className="relative aspect-video bg-black flex-shrink-0">
          {videoUrl && !videoError ? (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={posterUrl}
              muted={muted}
              playsInline
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onLoadedMetadata={handleLoadedMetadata}
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          )}

          {/* Loading spinner */}
          {!videoReady && !videoError && videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 size={32} className="text-white animate-spin" />
            </div>
          )}

          {/* Preview ended overlay */}
          {previewEnded && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              <p className="text-white/70 text-[13px]">Preview ended</p>
              <button
                onClick={goWatch}
                className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-2.5 rounded-full text-[13px]"
              >
                <Play size={15} fill="currentColor" /> Watch Full Movie
              </button>
            </div>
          )}

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3">
            {/* Preview timer */}
            {videoReady && !previewEnded && (
              <span className="bg-black/60 backdrop-blur-sm text-white/70 text-[11px] font-medium px-2.5 py-1 rounded-full">
                Preview · {formatTime(remaining)}
              </span>
            )}
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Bottom bar — mute toggle */}
          {videoReady && !previewEnded && !videoError && (
            <div className="absolute bottom-3 right-3">
              <button
                onClick={() => setMuted(m => !m)}
                className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* Meta row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {genre && (
              <span className="bg-brand-red/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                {genre}
              </span>
            )}
            {movie.year && (
              <span className="text-white/50 text-[11px]">{movie.year}</span>
            )}
            {movie.rating > 0 && (
              <span className="flex items-center gap-0.5 text-brand-gold text-[11px]">
                <Star size={9} fill="currentColor" /> {movie.rating.toFixed(1)}
              </span>
            )}
            {movie.duration && (
              <span className="flex items-center gap-0.5 text-white/40 text-[11px]">
                <Clock size={9} /> {movie.duration}
              </span>
            )}
            {movie.type === 'Series' && (
              <span className="flex items-center gap-0.5 text-white/40 text-[11px]">
                <Film size={9} /> Series
              </span>
            )}
          </div>

          <h2 className="text-white text-lg sm:text-xl font-bold font-heading leading-tight mb-3">
            {movie.title}
          </h2>

          {movie.vj && (
            <p className="text-white/40 text-[12px] mb-4">Translated by VJ {movie.vj}</p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={goWatch}
              className="inline-flex items-center gap-2 bg-white text-black font-semibold px-5 py-2.5 rounded-full text-[13px] hover:bg-white/90 transition-all"
            >
              <Play size={14} fill="currentColor" /> {previewEnded ? 'Watch Full Movie' : 'Watch Now'}
            </button>
            <button className="inline-flex items-center gap-2 bg-white/10 text-white font-medium px-4 py-2.5 rounded-full text-[13px] hover:bg-white/15 transition-all border border-white/[0.1]">
              <Plus size={14} /> My List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoviePreviewModal;
