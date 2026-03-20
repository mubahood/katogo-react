// src/app/pages/Movies/SeriesDetailPage.tsx
// Series detail page — shows series info + episodes list from /api/v2/series/{id}/episodes

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";
import MoviesV2Service, { MovieV2 } from "../../services/v2/MoviesV2Service";
import SeriesV2Service from "../../services/v2/SeriesV2Service";
import AccountApiService from "../../services/AccountApiService";

interface EpisodeGroup {
  season: string;
  episodes: MovieV2[];
}

const SeriesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [series, setSeries] = useState<MovieV2 | null>(null);
  const [episodes, setEpisodes] = useState<MovieV2[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (!id) return;
    const seriesId = parseInt(id, 10);

    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        // Fetch series detail and episodes in parallel
        const [seriesData, episodesData] = await Promise.all([
          MoviesV2Service.getMovie(seriesId),
          SeriesV2Service.getEpisodes(seriesId),
        ]);
        setSeries(seriesData);
        setEpisodes(episodesData);
      } catch (err: any) {
        setError(err?.message || "Failed to load series.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  // Group episodes by season number
  const grouped: EpisodeGroup[] = React.useMemo(() => {
    const map: Record<string, MovieV2[]> = {};
    episodes.forEach((ep) => {
      const season = ep.season_number || "1";
      if (!map[season]) map[season] = [];
      map[season].push(ep);
    });
    return Object.entries(map)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([season, eps]) => ({ season, episodes: eps }));
  }, [episodes]);

  const handleWatchlistToggle = async () => {
    if (!series) return;
    try {
      await AccountApiService.toggleMovieWishlist(series.id);
      setInWatchlist((prev) => !prev);
    } catch {
      // silently fail
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div style={{ padding: "2rem" }}>
        <Alert variant="danger">{error || "Series not found."}</Alert>
        <Link to="/series" className="btn btn-outline-light btn-sm">← Back to Series</Link>
      </div>
    );
  }

  // Navigate to WatchPage for an episode
  const watchEpisode = (ep: MovieV2) => navigate(`/watch/${ep.id}`);

  const backdropUrl = series.poster_url || series.image_url || series.thumbnail_url;

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff" }}>

      {/* Hero Section */}
      <div style={{
        position: "relative", height: "420px",
        backgroundImage: `url(${backdropUrl})`,
        backgroundSize: "cover", backgroundPosition: "center top",
      }}>
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(20,20,20,0.2) 0%, rgba(20,20,20,0.6) 60%, #141414 100%)",
        }} />

        {/* Back button */}
        <Link to="/series" style={{
          position: "absolute", top: "1.5rem", left: "1.5rem",
          color: "rgba(255,255,255,0.85)", textDecoration: "none",
          background: "rgba(0,0,0,0.4)", padding: "0.4rem 1rem",
          borderRadius: "20px", fontSize: "0.9rem", backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}>
          ← Series
        </Link>

        {/* Hero content */}
        <div style={{ position: "absolute", bottom: "2rem", left: "2rem", right: "2rem", maxWidth: "700px" }}>
          {/* Badges */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
            <span style={{ background: "#E50914", color: "#fff", padding: "2px 10px", borderRadius: "4px", fontSize: "0.78rem", fontWeight: 700 }}>
              SERIES
            </span>
            {series.year && (
              <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", padding: "2px 10px", borderRadius: "4px", fontSize: "0.78rem" }}>
                {series.year}
              </span>
            )}
            {series.genre && (
              <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", padding: "2px 10px", borderRadius: "4px", fontSize: "0.78rem" }}>
                {series.genre.split(",")[0].trim()}
              </span>
            )}
            {series.language && (
              <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", padding: "2px 10px", borderRadius: "4px", fontSize: "0.78rem" }}>
                {series.language}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
            {series.series_title || series.title}
          </h1>

          {series.description && (
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1rem",
              overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as any }}>
              {series.description}
            </p>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {episodes.length > 0 && (
              <button
                onClick={() => watchEpisode(episodes[0])}
                style={{
                  background: "#E50914", border: "none", color: "#fff",
                  padding: "0.65rem 1.5rem", borderRadius: "6px",
                  fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "0.4rem",
                }}
              >
                ▶ Play Episode 1
              </button>
            )}
            <button
              onClick={handleWatchlistToggle}
              style={{
                background: inWatchlist ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.4)", color: "#fff",
                padding: "0.65rem 1.25rem", borderRadius: "6px",
                fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "0.4rem",
              }}
            >
              {inWatchlist ? "✓ In Watchlist" : "+ Watchlist"}
            </button>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div style={{ padding: "1.5rem 2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
            Episodes <span style={{ color: "#aaa", fontSize: "1rem", fontWeight: 400 }}>({episodes.length})</span>
          </h2>
        </div>

        {episodes.length === 0 && (
          <p style={{ color: "rgba(255,255,255,0.5)" }}>No episodes found for this series.</p>
        )}

        {grouped.map(({ season, episodes: eps }) => (
          <div key={season} style={{ marginBottom: "2rem" }}>
            {grouped.length > 1 && (
              <h3 style={{ fontSize: "1.1rem", color: "#aaa", fontWeight: 600, marginBottom: "1rem" }}>
                Season {season}
              </h3>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {eps.map((ep, idx) => (
                <EpisodeRow key={ep.id} episode={ep} index={idx} onPlay={() => watchEpisode(ep)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface EpisodeRowProps {
  episode: MovieV2;
  index: number;
  onPlay: () => void;
}

const EpisodeRow: React.FC<EpisodeRowProps> = ({ episode, index, onPlay }) => {
  const [imgError, setImgError] = useState(false);
  const thumb = !imgError ? (episode.thumbnail_url || episode.image_url) : null;

  return (
    <div
      onClick={onPlay}
      style={{
        display: "flex", gap: "1rem", alignItems: "center",
        padding: "0.75rem", borderRadius: "8px", cursor: "pointer",
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
    >
      {/* Episode number */}
      <div style={{ color: "#aaa", fontSize: "1.1rem", fontWeight: 700, minWidth: "2rem", textAlign: "center" }}>
        {episode.episode_number || index + 1}
      </div>

      {/* Thumbnail */}
      <div style={{
        width: "120px", height: "68px", borderRadius: "6px", overflow: "hidden",
        background: "#2a2a2a", flexShrink: 0, position: "relative",
      }}>
        {thumb ? (
          <img src={thumb} alt={episode.title} onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "1.5rem" }}>▶</span>
          </div>
        )}
      </div>

      {/* Episode info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.25rem",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {episode.episode_title || episode.title}
        </div>
        {episode.description && (
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", lineHeight: 1.4,
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>
            {episode.description}
          </div>
        )}
      </div>

      {/* Duration */}
      {episode.duration && (
        <div style={{ color: "#aaa", fontSize: "0.85rem", flexShrink: 0, marginLeft: "0.5rem" }}>
          {episode.duration}m
        </div>
      )}
    </div>
  );
};

export default SeriesDetailPage;
