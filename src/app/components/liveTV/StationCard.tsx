// src/app/components/liveTV/StationCard.tsx (LIVE-03)
import React from 'react';
import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';
import type { Station } from '../../services/v2/StreamingV2Service';

export type { Station };

interface StationCardProps {
  station: Station;
}

const StationCard: React.FC<StationCardProps> = ({ station }) => {
  return (
    <div className="group relative flex flex-col items-center rounded-xl overflow-hidden bg-[var(--ugflix-bg-secondary,#161616)] border border-[var(--ugflix-border,#1e1e1e)] hover:border-[var(--color-brand-red,#E50914)] transition-all duration-200 p-4 text-center cursor-pointer hover:shadow-[0_4px_16px_rgba(229,9,20,0.15)]">
      {/* LIVE badge */}
      <span className="absolute top-2 right-2 bg-[var(--color-brand-red,#E50914)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide animate-pulse">
        LIVE
      </span>

      {/* Logo */}
      <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--ugflix-bg-primary,#0d0d0d)] flex items-center justify-center mb-3">
        {station.logo_url ? (
          <img
            src={station.logo_url}
            alt={station.name}
            loading="lazy"
            className="w-full h-full object-contain"
          />
        ) : (
          <Radio size={28} className="text-[var(--ugflix-text-muted,#888)]" />
        )}
      </div>

      <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">{station.name}</h3>
      {station.description && (
        <p className="text-[11px] text-[var(--ugflix-text-muted,#888)] line-clamp-2 mb-3">{station.description}</p>
      )}

      <Link
        to={`/live/${station.id}`}
        className="mt-auto inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[var(--color-brand-red,#E50914)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <Radio size={12} /> Tune In
      </Link>
    </div>
  );
};

export default StationCard;
