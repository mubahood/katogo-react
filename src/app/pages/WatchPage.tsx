// src/app/pages/WatchPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Heart, Download, Share2, Star, Calendar, Clock, Users, Play } from 'lucide-react';
import MovieListBuilder from '../components/Movies/MovieListBuilder';
import { CustomVideoPlayer } from '../components/VideoPlayer/CustomVideoPlayer';
import { ApiService } from '../services/ApiService';

interface MovieData {
  id: number;
  title: string;
  description: string;
  year: string;
  rating: string;
  duration?: string;
  genre: string;
  director?: string;
  country?: string;
  language?: string;
  thumbnail_url: string;
  url: string;
  views_count: number;
  likes_count: number;
  type: 'Movie' | 'Series';
  episode_number?: number;
  category?: string;
}

interface ApiMovieResponse {
  movie: MovieData;
  related_movies: MovieData[];
  user_interactions: {
    has_liked: boolean;
    has_viewed: boolean;
  };
}

// Inline styles for WatchPage - Following UgFlix Design System
const watchPageStyles = `
  .watch-page {
    background: var(--ugflix-bg-primary);
    color: var(--ugflix-text-primary);
    min-height: 100vh;
    padding-top: 0 !important;
    margin-top: 0 !important;
    padding-bottom: 80px;
  }

  .watch-container {
    padding: 0 !important;
    max-width: var(--ugflix-max-width);
    margin: 0 auto;
  }

  .watch-page .row {
    margin: 0;
    --bs-gutter-x: 0;
  }

  .share-toast {
    position: fixed;
    top: calc(var(--ugflix-header-height) + 5px);
    right: 20px;
    background: var(--ugflix-primary);
    color: var(--ugflix-text-primary);
    padding: 12px 20px;
    border-radius: var(--ugflix-border-radius);
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: var(--ugflix-shadow);
    z-index: 9999;
    animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
  }

  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes fadeOut {
    to { opacity: 0; transform: translateX(100%); }
  }

  .video-container {
    position: relative;
    background: #000;
    width: 100%;
    aspect-ratio: 16/9;
    margin: 0;
    border-radius: var(--ugflix-border-radius);
    overflow: hidden;
  }

  .movie-info-section {
    background: transparent;
    padding: 0.5rem 1rem; /* Add horizontal padding for mobile */
    border-bottom: none;
  }

  .movie-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--ugflix-text-high-contrast);
    margin: 0 0 0.75rem 0;
    line-height: 1.4;
  }

  .movie-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0;
    border-bottom: none;
  }

  .meta-badges {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .meta-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.6rem;
    border-radius: var(--ugflix-border-radius);
    font-size: 0.7rem;
    font-weight: 500;
    background: transparent;
    color: var(--ugflix-text-muted);
    border: 1px solid var(--ugflix-border);
  }

  .meta-badge svg {
    width: 12px;
    height: 12px;
  }

  .year-badge {
    background: transparent;
    color: var(--ugflix-text-muted);
    border-color: var(--ugflix-border);
  }

  .rating-badge {
    background: transparent;
    color: var(--ugflix-accent);
    border-color: var(--ugflix-border);
  }

  .duration-badge {
    background: transparent;
    color: var(--ugflix-text-muted);
    border-color: var(--ugflix-border);
  }

  .episode-badge {
    background: transparent;
    color: var(--ugflix-text-muted);
    border-color: var(--ugflix-border);
  }

  .movie-stats {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.7rem;
    color: var(--ugflix-text-muted);
    font-weight: 400;
  }

  .stat-item svg {
    width: 13px;
    height: 13px;
    color: var(--ugflix-text-muted);
  }

  .genre-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 0.75rem;
  }

  .genre-tag {
    padding: 0.3rem 0.65rem;
    border-radius: var(--ugflix-border-radius);
    font-size: 0.65rem;
    font-weight: 500;
    background: transparent;
    color: var(--ugflix-text-muted);
    border: 1px solid var(--ugflix-border);
    transition: var(--ugflix-transition-fast);
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .genre-tag:hover {
    background: var(--ugflix-hover-bg-subtle);
    border-color: var(--ugflix-primary);
    color: var(--ugflix-primary);
  }

  .action-buttons {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0;
    padding: 0;
    border-bottom: none;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.4rem 0.75rem;
    border-radius: var(--ugflix-border-radius);
    font-size: 0.7rem;
    font-weight: 500;
    border: 1px solid var(--ugflix-border);
    background: transparent;
    color: var(--ugflix-text-secondary);
    cursor: pointer;
    transition: var(--ugflix-transition-fast);
    text-transform: none;
    letter-spacing: 0;
  }

  .action-btn:hover {
    background: var(--ugflix-hover-bg-subtle);
    border-color: var(--ugflix-primary);
    color: var(--ugflix-primary);
    transform: translateY(-1px);
  }

  .action-btn:active {
    transform: translateY(0);
  }

  .action-btn svg {
    width: 13px;
    height: 13px;
  }

  .like-btn.active {
    background: var(--ugflix-hover-bg-medium);
    border-color: var(--ugflix-primary);
    color: var(--ugflix-primary);
  }

  .watchlist-btn.active {
    background: var(--ugflix-accent-hover-bg);
    border-color: var(--ugflix-accent);
    color: var(--ugflix-accent);
  }

  .share-btn:hover {
    background: rgba(59, 130, 246, 0.1);
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .download-btn:hover {
    background: rgba(76, 175, 80, 0.1);
    border-color: var(--ugflix-text-success);
    color: var(--ugflix-text-success);
  }

  .movie-description {
    margin-bottom: 0.75rem;
  }

  .section-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--ugflix-text-secondary);
    margin: 0 0 0.4rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .movie-description p {
    font-size: 0.85rem;
    line-height: 1.6;
    color: var(--ugflix-text-secondary);
    margin: 0;
  }

  .movie-details {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .detail-row {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    font-size: 0.8rem;
  }

  .detail-label {
    font-weight: 500;
    color: var(--ugflix-text-muted);
    min-width: 65px;
    font-size: 0.75rem;
  }

  .detail-value {
    color: var(--ugflix-text-secondary);
    flex: 1;
    font-size: 0.8rem;
  }

  .related-movies-sidebar {
    background: transparent;
    padding: 0 1rem; /* Add horizontal padding to prevent touching screen borders */
    height: 100%;
  }

  .sidebar-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--ugflix-text-high-contrast);
    margin: 0 0 0.75rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--ugflix-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .related-movies-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .related-movies-list::-webkit-scrollbar {
    width: 5px;
  }

  .related-movies-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .related-movies-list::-webkit-scrollbar-thumb {
    background: var(--ugflix-primary);
    border-radius: 10px;
  }

  .related-movies-list::-webkit-scrollbar-thumb:hover {
    background: var(--ugflix-primary-light);
  }

  .related-movie-card {
    display: flex;
    gap: 1rem;
    cursor: pointer;
    transition: var(--ugflix-transition-fast);
    border-radius: var(--ugflix-border-radius);
    overflow: hidden;
    background: transparent;
    border: 1px solid var(--ugflix-border);
    padding: 0.75rem;
    position: relative;
    min-height: 120px;
  }

  .related-movie-card.next-episode {
    border: 2px solid var(--ugflix-primary);
    background: rgba(183, 28, 28, 0.08);
    box-shadow: 0 0 20px rgba(183, 28, 28, 0.3);
  }

  .related-movie-card.next-episode::before {
    opacity: 1;
    width: 5px;
  }

  .related-movie-card.next-episode .next-badge {
    display: flex;
  }

  .related-movie-card:hover {
    border-color: var(--ugflix-primary);
    background: var(--ugflix-hover-bg-subtle);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .related-movie-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--ugflix-primary);
    opacity: 0;
    transition: var(--ugflix-transition-fast);
  }

  .related-movie-card:hover::before {
    opacity: 1;
  }

  .related-movie-thumbnail {
    position: relative;
    width: 160px;
    min-width: 160px;
    height: 90px;
    background: #000;
    overflow: hidden;
    border-radius: var(--ugflix-border-radius);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .related-movie-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: var(--ugflix-transition);
  }

  .related-movie-card:hover .related-movie-thumbnail img {
    transform: scale(1.1);
    filter: brightness(1.1);
  }

  .play-overlay-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    background: rgba(183, 28, 28, 0.95);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: var(--ugflix-transition-fast);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .play-overlay-icon svg {
    margin-left: 2px;
  }

  .related-movie-card:hover .play-overlay-icon {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.15);
  }

  .related-movie-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.35rem 0;
    min-width: 0;
  }

  .related-movie-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--ugflix-text-high-contrast);
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
    transition: var(--ugflix-transition-fast);
  }

  .related-movie-card:hover .related-movie-title {
    color: var(--ugflix-primary);
  }

  .related-movie-meta {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.7rem;
    flex-wrap: wrap;
  }

  .meta-type {
    padding: 0.3rem 0.6rem;
    border-radius: var(--ugflix-border-radius);
    background: rgba(183, 28, 28, 0.15);
    color: var(--ugflix-primary);
    font-weight: 600;
    border: 1px solid var(--ugflix-primary);
    font-size: 0.65rem;
    text-transform: uppercase;
  }

  .meta-vj {
    padding: 0.3rem 0.6rem;
    border-radius: var(--ugflix-border-radius);
    background: transparent;
    color: var(--ugflix-text-muted);
    font-weight: 500;
    border: 1px solid var(--ugflix-border);
    font-size: 0.65rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
  }

  .meta-episode {
    padding: 0.3rem 0.6rem;
    border-radius: var(--ugflix-border-radius);
    background: var(--ugflix-primary);
    color: var(--ugflix-text-primary);
    font-weight: 600;
    font-size: 0.7rem;
  }

  .meta-rating {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--ugflix-accent);
    font-weight: 600;
    font-size: 0.7rem;
  }

  .meta-rating svg {
    width: 12px;
    height: 12px;
  }

  .meta-duration {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--ugflix-text-muted);
    font-size: 0.7rem;
  }

  .meta-duration svg {
    width: 12px;
    height: 12px;
  }

  .next-badge {
    display: none;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.35rem 0.7rem;
    border-radius: var(--ugflix-border-radius);
    background: var(--ugflix-primary);
    color: var(--ugflix-text-primary);
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    z-index: 2;
    box-shadow: 0 2px 8px rgba(183, 28, 28, 0.5);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .no-related {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--ugflix-text-muted);
    font-size: 0.85rem;
  }

  .watch-page-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
    gap: 1.5rem;
  }

  .loading-text {
    font-size: 1rem;
    font-weight: 500;
    color: var(--ugflix-text-secondary);
  }

  .watch-page-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
    text-align: center;
    padding: 2rem;
  }

  .watch-page-error h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: var(--ugflix-primary);
  }

  .watch-page-error p {
    font-size: 0.95rem;
    color: var(--ugflix-text-muted);
    margin-bottom: 2rem;
    max-width: 500px;
  }

  .back-btn {
    background: var(--ugflix-primary);
    border: none;
    color: var(--ugflix-text-primary);
    padding: 0.875rem 2rem;
    border-radius: var(--ugflix-border-radius);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--ugflix-transition-fast);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .back-btn:hover {
    background: var(--ugflix-primary-light);
    transform: translateY(-2px);
    box-shadow: var(--ugflix-shadow-hover);
  }

  .left-content,
  .right-content {
    padding: 0;
  }

  @media (max-width: 575px) {
    .related-movie-card {
      min-height: 100px;
      padding: 0.6rem;
      gap: 0.75rem;
    }

    .related-movie-thumbnail {
      width: 130px;
      min-width: 130px;
      height: 73px;
    }

    .related-movie-title {
      font-size: 0.8rem;
      margin: 0 0 0.4rem 0;
    }

    .related-movie-meta {
      gap: 0.4rem;
    }

    .meta-type,
    .meta-vj,
    .meta-episode,
    .meta-rating,
    .meta-duration {
      font-size: 0.6rem;
      padding: 0.25rem 0.5rem;
    }

    .next-badge {
      font-size: 0.6rem;
      padding: 0.3rem 0.6rem;
      top: 0.4rem;
      right: 0.4rem;
    }

    .play-overlay-icon {
      width: 35px;
      height: 35px;
    }
  }

  @media (min-width: 576px) {
    .movie-info-section {
      padding: 0.5rem 1.5rem; /* Increase padding on small tablets */
    }
    
    .movie-title {
      font-size: 1rem;
    }

    .related-movies-sidebar {
      padding: 0 1.5rem; /* Increase padding on slightly larger screens */
    }

    .related-movie-card {
      min-height: 120px;
    }
  }

  @media (min-width: 768px) {
    .movie-info-section {
      padding: 1rem 1.5rem; /* Maintain comfortable padding on tablets */
    }
    
    .movie-title {
      font-size: 1.2rem;
    }
    
    .meta-badge {
      font-size: 0.75rem;
      padding: 0.35rem 0.7rem;
    }
    
    .stat-item {
      font-size: 0.75rem;
    }
    
    .action-btn {
      font-size: 0.75rem;
      padding: 0.45rem 0.85rem;
    }
    
    .genre-tag {
      font-size: 0.7rem;
      padding: 0.35rem 0.75rem;
    }
    
    .movie-description p {
      font-size: 0.9rem;
      line-height: 1.7;
    }
    
    .detail-row {
      font-size: 0.85rem;
    }
    
    .sidebar-title {
      font-size: 0.9rem;
    }
    
    .related-movie-title {
      font-size: 0.85rem;
    }

    .related-movie-card {
      min-height: 125px;
    }

    .related-movie-thumbnail {
      width: 170px;
      min-width: 170px;
      height: 95px;
    }
  }

  @media (min-width: 992px) {
    .watch-container {
      padding: 0 0rem !important;
    }
    
    .left-content {
      padding-right: 0.75rem !important;
    }
    
    .right-content {
      padding-left: 0.75rem !important;
    }
    
    .movie-info-section {
      padding: 1rem 1.5rem;
    }
    
    .movie-title {
      font-size: 1.25rem;
    }
    
    .related-movies-sidebar {
      position: sticky;
      top: 0;
      padding: 0 1.5rem; /* Keep padding on desktop to maintain consistent spacing */
      max-height: 100vh;
      overflow: hidden;
    }
    
    .related-movies-list {
      max-height: calc(100vh - 100px);
    }

    .related-movie-card {
      min-height: 130px;
    }
  }

  @media (min-width: 1200px) {
    .watch-container {
      padding: 0 0rem !important;
    }
    
    .movie-info-section {
      padding: 1rem 2rem; /* Larger padding on desktop */
    }
    
    .movie-title {
      font-size: 1.3rem;
    }
    
    .sidebar-title {
      font-size: 0.95rem;
    }
  }

    @media (min-width: 1400px) {
    .movie-info-section {
      padding: 1.5rem 3rem; /* Maximum padding on large screens */
    }
`;

const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movieData, setMovieData] = useState<ApiMovieResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(true);

  // Inject styles into document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = watchPageStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Check if page content overflows viewport
  const checkOverflow = useCallback(() => {
    const contentHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const overflow = contentHeight > viewportHeight;
    setHasOverflow(overflow);
    
    console.log('📏 Content height:', contentHeight, 'Viewport:', viewportHeight, 'Overflow:', overflow);
  }, []);

  useEffect(() => {
    if (id) {
      fetchMovieData(id);
    }
  }, [id]);

  // Check overflow after data loads and on window resize
  useEffect(() => {
    if (movieData) {
      // Use setTimeout to ensure DOM has updated
      const timer = setTimeout(checkOverflow, 100);
      return () => clearTimeout(timer);
    }
  }, [movieData, checkOverflow]);

  useEffect(() => {
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [checkOverflow]);

  // Keyboard controls for video player
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      if (!videoElement) return;

      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          if (videoElement.paused) {
            videoElement.play();
          } else {
            videoElement.pause();
          }
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
          break;
        case 'arrowup':
          e.preventDefault();
          videoElement.volume = Math.min(1, videoElement.volume + 0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          videoElement.volume = Math.max(0, videoElement.volume - 0.1);
          break;
        case 'm':
          e.preventDefault();
          videoElement.muted = !videoElement.muted;
          break;
        case 'f':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            videoElement.requestFullscreen();
          }
          break;
        case 'n':
          e.preventDefault();
          if (hasNextEpisode()) {
            handleNextEpisode();
          }
          break;
        case 'p':
          e.preventDefault();
          if (hasPreviousEpisode()) {
            handlePreviousEpisode();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movieData, currentEpisodeIndex]);

  const fetchMovieData = async (movieId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the new backend API endpoint
      const data = await ApiService.getMovieById(movieId);
      
      // CRITICAL FIX: Convert related_movies from object to array if needed
      if (data.related_movies && !Array.isArray(data.related_movies)) {
        console.warn('Converting related_movies from object to array');
        data.related_movies = Object.values(data.related_movies);
      }
      
      // Ensure related_movies is always an array
      if (!data.related_movies) {
        data.related_movies = [];
      }
      
      setMovieData(data);
      
    } catch (err) {
      console.error('Error fetching movie data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred loading the movie');
    } finally {
      setLoading(false);
    }
  };

  // Get current movie (for series, this could be a specific episode)
  const getCurrentMovie = (): MovieData | null => {
    if (!movieData) return null;
    
    // If it's a series, we might want to show episodes in related movies
    // For now, just return the main movie
    return movieData.movie;
  };

  // Get next episode for series
  const getNextEpisode = (): MovieData | null => {
    if (!movieData || movieData.movie.type !== 'Series') return null;
    if (!Array.isArray(movieData.related_movies) || movieData.related_movies.length === 0) return null;
    
    const currentEpisode = movieData.movie.episode_number || 0;
    
    // Find the next episode by episode number
    const nextEp = movieData.related_movies.find(m => 
      m.type === 'Series' && 
      m.category === movieData.movie.category &&
      m.episode_number === currentEpisode + 1
    );
    
    if (nextEp) return nextEp;
    
    // If not found by episode number, find the first episode with a higher number
    const sortedEpisodes = movieData.related_movies
      .filter(m => m.type === 'Series' && m.category === movieData.movie.category)
      .sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
    
    const nextInLine = sortedEpisodes.find(m => (m.episode_number || 0) > currentEpisode);
    return nextInLine || null;
  };

  // Handle next episode for series or related movie
  const handleNextEpisode = () => {
    if (!movieData) return;
    
    // For series, try to find next episode
    if (movieData.movie.type === 'Series') {
      const nextEpisode = getNextEpisode();
      
      if (nextEpisode) {
        setShouldAutoPlay(true);
        navigate(`/watch/${nextEpisode.id}`);
        return;
      }
    }
    
    // For movies or when no more episodes, play first related movie
    if (Array.isArray(movieData.related_movies) && movieData.related_movies.length > 0) {
      const nextMovie = movieData.related_movies[0];
      setShouldAutoPlay(true);
      navigate(`/watch/${nextMovie.id}`);
    }
  };

  // Handle previous episode for series
  const handlePreviousEpisode = () => {
    if (!movieData || movieData.movie.type !== 'Series') return;
    if (!Array.isArray(movieData.related_movies)) return;
    
    const relatedEpisodes = movieData.related_movies.filter(m => 
      m.type === 'Series' && m.category === movieData.movie.category
    );
    
    if (currentEpisodeIndex > 0) {
      const prevEpisode = relatedEpisodes[currentEpisodeIndex - 1];
      navigate(`/watch/${prevEpisode.id}`);
    }
  };

  // Check if there are next/previous episodes
  const hasNextEpisode = (): boolean => {
    if (!movieData || !Array.isArray(movieData.related_movies)) return false;
    
    // For series, check if there are more episodes
    if (movieData.movie.type === 'Series') {
      const relatedEpisodes = movieData.related_movies.filter(m => 
        m.type === 'Series' && m.category === movieData.movie.category
      );
      if (currentEpisodeIndex < relatedEpisodes.length - 1) return true;
    }
    
    // Always return true if there are related movies
    return movieData.related_movies.length > 0;
  };

  const hasPreviousEpisode = (): boolean => {
    if (!movieData || movieData.movie.type !== 'Series') return false;
    if (!Array.isArray(movieData.related_movies)) return false;
    return currentEpisodeIndex > 0;
  };

  // Handle related movie click
  const handleRelatedMovieClick = (relatedMovie: MovieData) => {
    navigate(`/watch/${relatedMovie.id}`);
  };



  const [liked, setLiked] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    if (movieData) {
      setLiked(movieData.user_interactions.has_liked);
    }
  }, [movieData]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handleLike = async () => {
    if (!movieData) return;
    
    try {
      setLiked(!liked);
      // TODO: Implement API call to like/unlike movie
      console.log('Like movie:', movieData.movie.id);
    } catch (error) {
      console.error('Error liking movie:', error);
      setLiked(liked); // Revert on error
    }
  };

  const handleWatchlist = async () => {
    if (!movieData) return;
    
    try {
      setWatchlisted(!watchlisted);
      // TODO: Implement API call to add/remove from watchlist
      console.log('Toggle watchlist:', movieData.movie.id);
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      setWatchlisted(watchlisted); // Revert on error
    }
  };

  const handleShare = () => {
    const movie = getCurrentMovie();
    if (navigator.share) {
      navigator.share({
        title: movie?.title,
        text: `Watch "${movie?.title}" on UgFlix`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  const handleDownload = () => {
    const movie = getCurrentMovie();
    if (!movie) return;
    // Open video URL in new tab for download
    window.open(movie.url, '_blank');
  };

  if (loading) {
    return (
      <div className="watch-page-loading">
        <Spinner animation="border" variant="warning" />
        <div className="loading-text">Loading movie...</div>
      </div>
    );
  }

  if (error || !movieData) {
    return (
      <div className="watch-page-error">
        <h2>{error ? 'Error Loading Movie' : 'Movie Not Found'}</h2>
        <p>{error || "The movie you're looking for doesn't exist."}</p>
        <button onClick={() => navigate(-1)} className="back-btn">
          Go Back
        </button>
      </div>
    );
  }

  const movie = getCurrentMovie();
  if (!movie) return null;

  return (
    <div className={`watch-page ${hasOverflow ? 'has-overflow' : 'no-overflow'}`}>
      <Container fluid className="watch-container">
        {/* Share Toast */}
        {showShareToast && (
          <div className="share-toast">
            <Share2 size={18} />
            Link copied to clipboard!
          </div>
        )}

        {/* Main Content */}
        <Row className="g-3 g-md-4">
          {/* Left Column: Video Player + Movie Info */}
          <Col lg={8} className="left-content">
            {/* Video Player */}
            <div className="video-container">
              <CustomVideoPlayer
                url={movie.url}
                movieId={movie.id}
                poster={movie.thumbnail_url}
                autoPlay={shouldAutoPlay}
                onNext={hasNextEpisode() ? handleNextEpisode : undefined}
                onPrevious={hasPreviousEpisode() ? handlePreviousEpisode : undefined}
                onEnded={hasNextEpisode() ? handleNextEpisode : undefined}
              />
            </div>

            {/* Movie Information Section */}
            <div className="movie-info-section">
              {/* Movie Title */}
              <h1 className="movie-title">{movie.title}</h1>

              {/* Movie Meta */}
              <div className="movie-meta-row">
                <div className="meta-badges">
                   
                  {movie.type === 'Series' && movie.episode_number && (
                    <span className="meta-badge episode-badge">
                      Ep {movie.episode_number}
                    </span>
                  )}
                  <span className="stat-item">
                    <Users size={13} />
                    {formatNumber(movie.views_count)}
                  </span>
                  <span className="stat-item">
                    <Heart size={13} />
                    {formatNumber(movie.likes_count)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <button 
                    className={`action-btn like-btn ${liked ? 'active' : ''}`}
                    onClick={handleLike}
                  >
                    <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                    Like
                  </button>
                  <button 
                    className={`action-btn watchlist-btn ${watchlisted ? 'active' : ''}`}
                    onClick={handleWatchlist}
                  >
                    <Star size={14} fill={watchlisted ? 'currentColor' : 'none'} />
                    Watchlist
                  </button>
                  <button 
                    className="action-btn share-btn"
                    onClick={handleShare}
                  >
                    <Share2 size={14} />
                    Share
                  </button>
                  <button 
                    className="action-btn download-btn"
                    onClick={handleDownload}
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>

              
               
            </div>
          </Col>

          {/* Right Column: Related Movies */}
          <Col lg={4} className="right-content">
            <div className="related-movies-sidebar">
              <h3 className="sidebar-title">
                {movie.type === 'Series' ? 'More Episodes' : 'Related Movies'}
              </h3>
              
              {Array.isArray(movieData.related_movies) && movieData.related_movies.length > 0 ? (
                <div className="related-movies-list">
                  {movieData.related_movies.map((relatedMovie) => {
                    const nextEpisode = getNextEpisode();
                    const isNextEpisode = nextEpisode && nextEpisode.id === relatedMovie.id;
                    
                    return (
                      <div 
                        key={relatedMovie.id} 
                        className={`related-movie-card ${isNextEpisode ? 'next-episode' : ''}`}
                        onClick={() => handleRelatedMovieClick(relatedMovie)}
                      >
                        {isNextEpisode && (
                          <div className="next-badge">▶ Up Next</div>
                        )}
                        <div className="related-movie-thumbnail">
                          <img 
                            src={relatedMovie.thumbnail_url} 
                            alt={relatedMovie.title}
                            loading="lazy"
                          />
                          <div className="play-overlay-icon">
                            <Play size={20} fill="white" />
                          </div>
                        </div>
                        <div className="related-movie-info">
                          <h4 className="related-movie-title">{relatedMovie.title}</h4>
                          <div className="related-movie-meta">
                            <span className="meta-type">{relatedMovie.type}</span>
                            {relatedMovie.director && (
                              <span className="meta-vj" title={relatedMovie.director}>VJ {relatedMovie.director}</span>
                            )}
                            {relatedMovie.type === 'Series' && relatedMovie.episode_number && (
                              <span className="meta-episode">Ep {relatedMovie.episode_number}</span>
                            )}
                            {relatedMovie.rating && (
                              <span className="meta-rating">
                                <Star size={11} fill="currentColor" />
                                {relatedMovie.rating}
                              </span>
                            )}
                            {relatedMovie.duration && (
                              <span className="meta-duration">
                                <Clock size={11} />
                                {relatedMovie.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-related">
                  <p>No related {movie.type === 'Series' ? 'episodes' : 'movies'} available</p>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default WatchPage;