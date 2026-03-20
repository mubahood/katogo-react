// src/app/pages/liveTV/LiveTVPage.tsx — LIVE-02
import React, { useState, useEffect } from 'react';
import { Tv } from 'lucide-react';
import StationCard, { Station } from '../../components/liveTV/StationCard';
import StreamingV2Service from '../../services/v2/StreamingV2Service';

const createPlaceholderStation = (id: number, name: string, description: string): Station => ({
  id,
  name,
  description,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
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

// Placeholder stations while API is being fetched
const PLACEHOLDER_STATIONS: Station[] = [
  createPlaceholderStation(1, 'NBS TV', 'News channel'),
  createPlaceholderStation(2, 'NTV Uganda', 'General entertainment'),
  createPlaceholderStation(3, 'Bukedde TV', 'Luganda content'),
  createPlaceholderStation(4, 'Salt TV', 'Religious programming'),
  createPlaceholderStation(5, 'Urban TV', 'Entertainment'),
  createPlaceholderStation(6, 'Record TV', 'News & sports'),
];

const LiveTVPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>(PLACEHOLDER_STATIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StreamingV2Service.getStations()
      .then((data) => {
          if (data.items && data.items.length > 0) setStations(data.items);
      })
      .catch(() => { /* use placeholder data */ })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--ugflix-bg-primary,#0d0d0d)] px-4 sm:px-6 py-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Tv size={24} className="text-[var(--color-brand-red,#E50914)]" />
        <div>
          <h1 className="text-white text-xl font-bold">Live TV</h1>
          <p className="text-[var(--ugflix-text-muted,#888)] text-xs">Watch live Ugandan &amp; international channels</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-[var(--ugflix-bg-secondary,#161616)] animate-pulse h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {stations.map((station) => (
            <StationCard key={station.id} station={station} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveTVPage;
