// src/app/components/liveTV/LivePlayer.tsx (LIVE-04)
// HLS-capable live player using hls.js with <video> fallback
import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface LivePlayerProps {
  streamUrl: string;
  stationName?: string;
  posterUrl?: string;
}

const LivePlayer: React.FC<LivePlayerProps> = ({ streamUrl, stationName, posterUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    // HLS stream (.m3u8)
    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          // Autoplay blocked — user needs to interact first
        });
      });
      return () => hls.destroy();
    }

    // Native HLS support (Safari) or direct video URL
    if (video.canPlayType('application/vnd.apple.mpegurl') || !streamUrl.includes('.m3u8')) {
      video.src = streamUrl;
      video.play().catch(() => {});
    }
  }, [streamUrl]);

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        className="w-full aspect-video"
        poster={posterUrl}
        controls
        playsInline
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        aria-label={stationName ? `${stationName} live stream` : 'Live stream'}
      />
      {/* LIVE overlay badge */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <span className="inline-flex items-center gap-1 bg-[var(--color-brand-red,#E50914)] text-white text-xs font-bold px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </span>
      </div>
      {stationName && (
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <span className="text-xs text-white bg-black/60 px-2 py-0.5 rounded">{stationName}</span>
        </div>
      )}
    </div>
  );
};

export default LivePlayer;
