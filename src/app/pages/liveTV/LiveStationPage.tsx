// src/app/pages/liveTV/LiveStationPage.tsx — LIVE-03
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LivePlayer from '../../components/liveTV/LivePlayer';
import StreamingV2Service from '../../services/v2/StreamingV2Service';
import type { Station } from '../../components/liveTV/StationCard';

const createPlaceholderStation = (id: number): Station => ({
  id,
  name: `Channel ${id}`,
  slug: `channel-${id}`,
  type: 'TV',
  category: 'general',
  logo_url: '',
  language: 'English',
  votes: 0,
  listeners_count: 0,
  is_featured: false,
  sort_order: id,
  country: 'Uganda',
  created_at: new Date(0).toISOString(),
});

const LiveStationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    StreamingV2Service.getStation(Number(id))
      .then((data) => setStation(data))
      .catch(() => {
        // Fallback to placeholder
        setStation(createPlaceholderStation(Number(id)));
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-[var(--ugflix-bg-primary,#0d0d0d)] px-4 sm:px-6 py-8 pb-24">
      <Link
        to="/live"
        className="inline-flex items-center gap-2 text-[var(--ugflix-text-muted,#888)] hover:text-white mb-6 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Back to Live TV
      </Link>

      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="aspect-video rounded-xl bg-[var(--ugflix-bg-secondary,#161616)] animate-pulse" />
        ) : station?.stream_url ? (
          <LivePlayer
            streamUrl={station.stream_url}
            stationName={station.name}
            posterUrl={station.logo_url}
          />
        ) : (
          <div className="aspect-video rounded-xl bg-[var(--ugflix-bg-secondary,#161616)] flex flex-col items-center justify-center">
            <p className="text-[var(--ugflix-text-muted,#888)] text-sm">Stream not available for {station?.name ?? `Channel ${id}`}</p>
          </div>
        )}

        {station && (
          <div className="mt-4">
            <h1 className="text-white text-xl font-bold">{station.name}</h1>
            {station.description && (
              <p className="text-[var(--ugflix-text-muted,#888)] text-sm mt-1">{station.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStationPage;
