// src/app/components/VideoPlayer/CustomVideoPlayer.tsx
// Custom HTML5 video player — desktop: overlay controls, mobile: controls below video
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipForward, SkipBack, Settings, PictureInPicture, Loader2,
} from 'lucide-react';
import { ApiService } from '../../services/ApiService';
import { PreferencesService } from '../../services/PreferencesService';
import { VideoProgressModel } from '../../models/VideoProgressModel';

interface CustomVideoPlayerProps {
  url: string;
  movieId?: number;
  autoPlay?: boolean;
  startPosition?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onEnded?: () => void;
  poster?: string;
  relatedMovies?: Array<{ id: number; title: string; image: string }>;
}

interface VideoState {
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  buffering: boolean;
  loaded: number;
  playbackRate: number;
  isFullscreen: boolean;
  showControls: boolean;
  ready: boolean;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

/* ── Detect mobile (<768px) ── */
const useIsMobile = () => {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const h = (e: MediaQueryListEvent) => setM(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return m;
};

/* ── Format time ── */
const fmtTime = (s: number): string => {
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);
  if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  url, movieId, autoPlay = true, startPosition, onNext, onPrevious, onEnded, poster,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSaveTimeRef = useRef(0);
  const lastSavedPosRef = useRef(0);
  const isSavingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const loopActiveRef = useRef(false);
  const isMobile = useIsMobile();

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const savedPrefs = PreferencesService.getPreferences();
  const deviceInfo = VideoProgressModel.getDeviceInfo();

  const [state, setState] = useState<VideoState>({
    playing: false, currentTime: 0, duration: 0, volume: 1, muted: false,
    buffering: true, loaded: 0, playbackRate: savedPrefs.playbackRate,
    isFullscreen: false, showControls: true, ready: false,
  });
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // ── Progress save (v1 API, 5s, atomic lock) ──
  const saveProgress = useCallback(async (ct: number, dur: number, force = false) => {
    if (!movieId || dur <= 0 || ct <= 0 || isSavingRef.current) return;
    const now = Date.now();
    if (!force && (now - lastSaveTimeRef.current < 5000 || Math.abs(ct - lastSavedPosRef.current) < 5)) return;
    isSavingRef.current = true;
    try {
      await ApiService.saveVideoProgress({
        movie_id: movieId, progress: Math.floor(ct), duration: Math.floor(dur),
        device: deviceInfo.device, platform: deviceInfo.platform, browser: deviceInfo.browser,
      });
      lastSaveTimeRef.current = now;
      lastSavedPosRef.current = ct;
    } catch { /* will retry */ }
    finally { isSavingRef.current = false; }
  }, [movieId, deviceInfo]);

  // Read duration early + seek to startPosition if provided
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    if (dur && !isNaN(dur)) setState(prev => ({ ...prev, duration: dur }));
    if (startPosition && startPosition > 0) videoRef.current.currentTime = startPosition;
  }, [startPosition]);

  // ── Controls auto-hide (desktop overlay only) ──
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setState(prev => ({ ...prev, showControls: true }));
    if (state.playing) {
      controlsTimeoutRef.current = setTimeout(() => setState(prev => ({ ...prev, showControls: false })), 3000);
    }
  }, [state.playing]);

  // ── Video event handlers ──
  const handleLoadStart = () => setState(prev => ({ ...prev, buffering: true, ready: false }));

  const handleCanPlay = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    setState(prev => ({ ...prev, buffering: false, ready: true, duration: dur && !isNaN(dur) ? dur : prev.duration }));
    videoRef.current.volume = 1;
    videoRef.current.muted = false;
    if (autoPlay) videoRef.current.play().catch(() => {});
  };

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setState(prev => ({
        ...prev,
        currentTime: videoRef.current!.currentTime,
        duration: videoRef.current!.duration || 0,
      }));
    }
  }, []);

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      setState(prev => ({ ...prev, loaded: videoRef.current!.buffered.end(0) / videoRef.current!.duration }));
    }
  };

  const handleWaiting = () => setState(prev => ({ ...prev, buffering: true }));

  const handlePlaying = () => {
    setState(prev => ({ ...prev, buffering: false, playing: true }));
    isPlayingRef.current = true;
    if (!loopActiveRef.current) startProgressLoop();
    resetControlsTimeout();
  };

  const handlePause = () => {
    setState(prev => ({ ...prev, playing: false }));
    isPlayingRef.current = false;
  };

  // ── Control actions ──
  const togglePlay = () => {
    if (!videoRef.current) return;
    state.playing ? videoRef.current.pause() : videoRef.current.play().catch(() => {});
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setState(prev => ({ ...prev, volume: vol, muted: vol === 0 }));
    if (videoRef.current) { videoRef.current.volume = vol; videoRef.current.muted = vol === 0; }
    PreferencesService.saveVolume(vol);
    PreferencesService.saveMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const m = !state.muted;
    setState(prev => ({ ...prev, muted: m }));
    videoRef.current.muted = m;
    PreferencesService.saveMuted(m);
  };

  const seek = (t: number) => { if (videoRef.current) videoRef.current.currentTime = t; };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * state.duration);
  };

  const handleMobileSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const skipFwd = () => seek(Math.min(state.currentTime + 10, state.duration));
  const skipBwd = () => seek(Math.max(state.currentTime - 10, 0));

  const changeRate = (r: number) => {
    setState(prev => ({ ...prev, playbackRate: r }));
    if (videoRef.current) videoRef.current.playbackRate = r;
    PreferencesService.savePlaybackRate(r);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) containerRef.current.requestFullscreen().catch(() => {});
    else if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      document.pictureInPictureElement ? await document.exitPictureInPicture() : await videoRef.current.requestPictureInPicture();
    } catch { /* unsupported */ }
  };

  // ── Keyboard shortcuts (desktop) ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;
      switch (e.code) {
        case 'Space': case 'KeyK': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': case 'KeyJ': e.preventDefault(); skipBwd(); break;
        case 'ArrowRight': case 'KeyL': e.preventDefault(); skipFwd(); break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            const nv = Math.min(1, state.volume + 0.1);
            videoRef.current.volume = nv; videoRef.current.muted = false;
            setState(p => ({ ...p, volume: nv, muted: false }));
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const nv = Math.max(0, state.volume - 0.1);
            videoRef.current.volume = nv; videoRef.current.muted = nv === 0;
            setState(p => ({ ...p, volume: nv, muted: nv === 0 }));
          }
          break;
        case 'KeyM': e.preventDefault(); toggleMute(); break;
        case 'KeyF': e.preventDefault(); toggleFullscreen(); break;
        case 'KeyP': e.preventDefault(); togglePiP(); break;
        case 'KeyS': e.preventDefault(); setShowSpeedMenu(p => !p); break;
        case 'Digit0': case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4':
        case 'Digit5': case 'Digit6': case 'Digit7': case 'Digit8': case 'Digit9': {
          const n = parseInt(e.code.replace('Digit', ''), 10);
          if (!isNaN(n) && state.duration > 0) { e.preventDefault(); seek((n * 10 / 100) * state.duration); }
          break;
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [state.playbackRate, state.volume, state.muted, state.duration]);

  // ── Init preferences ──
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = state.volume;
      videoRef.current.muted = state.muted;
      videoRef.current.playbackRate = state.playbackRate;
    }
  }, []);

  // Seek to startPosition when it arrives (handles late-loading resume data)
  useEffect(() => {
    if (startPosition != null && startPosition > 0 && videoRef.current && videoRef.current.readyState >= 1) {
      videoRef.current.currentTime = startPosition;
    }
  }, [startPosition]);

  // ── sendBeacon on unload ──
  useEffect(() => {
    const handler = () => {
      if (state.currentTime > 0 && state.duration > 0) {
        try {
          navigator.sendBeacon('/api/video-progress', JSON.stringify({
            movie_model_id: movieId, progress: Math.floor(state.currentTime),
            duration: Math.floor(state.duration), device: deviceInfo.device,
            platform: deviceInfo.platform, browser: deviceInfo.browser,
          }));
        } catch { /* best-effort */ }
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.currentTime, state.duration, movieId, deviceInfo]);

  // ── Recursive save loop (5s) ──
  const startProgressLoop = useCallback(async () => {
    if (loopActiveRef.current) return;
    loopActiveRef.current = true;
    try {
      while (isPlayingRef.current) {
        if (videoRef.current && !videoRef.current.paused && videoRef.current.duration > 0) {
          const ct = videoRef.current.currentTime;
          if (ct > 0) await saveProgress(ct, videoRef.current.duration);
        }
        await sleep(5000);
      }
    } finally { loopActiveRef.current = false; }
  }, [saveProgress]);

  useEffect(() => () => { isPlayingRef.current = false; }, []);

  // ── Fullscreen change ──
  useEffect(() => {
    const h = () => setState(p => ({ ...p, isFullscreen: !!document.fullscreenElement }));
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const pctPlayed = state.duration ? (state.currentTime / state.duration) * 100 : 0;
  const pctLoaded = state.loaded * 100;

  // ═══ Shared sub-components ═══
  const ProgressBar = ({ mobile }: { mobile?: boolean }) => (
    <input
      type="range"
      min={0}
      max={state.duration || 1}
      step={0.1}
      value={state.currentTime}
      onChange={handleMobileSeek}
      className={`w-full rounded-full appearance-none cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E50914]
        ${mobile
          ? 'h-1.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md'
          : 'h-[5px] hover:h-[7px] transition-[height] [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm'
        }`}
      style={{
        background: `linear-gradient(to right, #E50914 ${pctPlayed}%, rgba(255,255,255,${mobile ? '0.2' : '0.15'}) ${pctPlayed}%)`,
      }}
    />
  );

  const PlayPauseBtn = ({ size: sz = 22 }: { size?: number }) => (
    <button onClick={togglePlay} className="p-1.5 text-white hover:text-[#E50914] transition-colors">
      {state.playing ? <Pause size={sz} /> : <Play size={sz} />}
    </button>
  );

  const SkipButtons = ({ size: sz = 16 }: { size?: number }) => (
    <>
      {onPrevious && (
        <button onClick={onPrevious} className="p-1.5 text-white hover:text-[#E50914] transition-colors">
          <SkipBack size={sz} />
        </button>
      )}
      <button onClick={skipBwd} className="p-1.5 text-white/70 hover:text-white transition-colors flex items-center gap-0.5">
        <SkipBack size={sz - 2} /><span className="text-[9px] font-semibold">10</span>
      </button>
      <button onClick={skipFwd} className="p-1.5 text-white/70 hover:text-white transition-colors flex items-center gap-0.5">
        <span className="text-[9px] font-semibold">10</span><SkipForward size={sz - 2} />
      </button>
      {onNext && (
        <button onClick={onNext} className="p-1.5 text-white hover:text-[#E50914] transition-colors">
          <SkipForward size={sz} />
        </button>
      )}
    </>
  );

  const SpeedMenu = () => (
    <div className="relative">
      <button
        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
        className="p-1.5 text-white hover:text-[#E50914] transition-colors flex items-center gap-0.5"
      >
        <Settings size={18} />
        <span className="text-[11px] font-semibold hidden sm:inline">{state.playbackRate}x</span>
      </button>
      {showSpeedMenu && (
        <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-sm border border-white/10 rounded-lg p-1.5 min-w-[70px] z-30">
          {PLAYBACK_RATES.map(r => (
            <button
              key={r}
              onClick={() => changeRate(r)}
              className={`block w-full text-center text-[13px] py-1.5 px-2 rounded transition-colors ${
                r === state.playbackRate ? 'bg-[#E50914] text-white' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              {r}x
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ═══ RENDER ═══
  // Mobile (non-fullscreen): controls render BELOW the video.
  // Desktop or fullscreen: overlay controls with auto-hide.
  const showOverlay = !isMobile || state.isFullscreen;

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${
        state.isFullscreen ? 'fixed inset-0 w-screen h-screen z-[9999] bg-black' : ''
      }`}
      onMouseMove={showOverlay ? resetControlsTimeout : undefined}
      onMouseLeave={showOverlay ? () => { if (state.playing) setState(p => ({ ...p, showControls: false })); } : undefined}
    >
      {/* ── Video element ── */}
      <video
        ref={videoRef}
        src={url}
        poster={poster}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onPause={handlePause}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onEnded}
        preload="metadata"
        onDoubleClick={toggleFullscreen}
        onClick={() => { togglePlay(); resetControlsTimeout(); }}
        className={`w-full bg-black ${
          state.isFullscreen ? 'h-full object-contain' : 'aspect-video object-cover'
        }`}
      />

      {/* ── Loading spinner ── */}
      {state.buffering && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 z-[5]">
          <Loader2 size={40} className="text-[#E50914] animate-spin" />
          <span className="text-white/60 text-[13px]">Loading...</span>
        </div>
      )}

      {/* ───── DESKTOP / FULLSCREEN: Overlay controls ───── */}
      {showOverlay && (
        <div
          className={`absolute inset-0 z-10 flex flex-col justify-end transition-opacity duration-300 ${
            state.showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 25%, transparent 70%, rgba(0,0,0,0.85) 100%)',
          }}
          onClick={togglePlay}
        >
          {/* Center play button (paused + ready) */}
          {!state.playing && state.ready && (
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72px] h-[72px] bg-[#E50914] rounded-full flex items-center justify-center hover:bg-[#b8070f] hover:scale-110 transition-all z-20"
            >
              <Play size={36} fill="white" className="text-white ml-1" />
            </button>
          )}

          {/* Overlay bottom controls */}
          <div className="px-4 pb-4 space-y-2" onClick={(e) => e.stopPropagation()}>
            <ProgressBar />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <PlayPauseBtn size={24} />
                <SkipButtons size={18} />
                {/* Volume */}
                <div className="flex items-center gap-1 ml-1">
                  <button onClick={toggleMute} className="p-1.5 text-white hover:text-[#E50914] transition-colors">
                    {state.muted || state.volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range" min="0" max="1" step="0.1"
                    value={state.muted ? 0 : state.volume}
                    onChange={handleVolumeChange}
                    className="w-[70px] h-1 bg-white/30 rounded cursor-pointer appearance-none
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
                <span className="text-white text-[13px] font-medium tabular-nums ml-2">
                  {fmtTime(state.currentTime)} / {fmtTime(state.duration)}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <SpeedMenu />
                <button onClick={togglePiP} className="p-1.5 text-white hover:text-[#E50914] transition-colors">
                  <PictureInPicture size={18} />
                </button>
                <button onClick={toggleFullscreen} className="p-1.5 text-white hover:text-[#E50914] transition-colors">
                  {state.isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile tap-to-show center play (paused) ── */}
      {isMobile && !state.isFullscreen && !state.playing && state.ready && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#E50914] rounded-full flex items-center justify-center z-20"
        >
          <Play size={28} fill="white" className="text-white ml-0.5" />
        </button>
      )}

      {/* ───── MOBILE (non-fullscreen): Controls BELOW the video ───── */}
      {isMobile && !state.isFullscreen && (
        <div className="bg-[#0e0e0e] px-3 pt-2 pb-3 space-y-2">
          {/* Seek bar (native range input for smooth touch) */}
          <ProgressBar mobile />

          {/* Time display */}
          <div className="flex items-center justify-between text-[11px] text-white/50 tabular-nums -mt-1">
            <span>{fmtTime(state.currentTime)}</span>
            <span>{fmtTime(state.duration)}</span>
          </div>

          {/* Main controls row */}
          <div className="flex items-center justify-between">
            {/* Left: skip controls */}
            <div className="flex items-center gap-1">
              <SkipButtons size={16} />
            </div>

            {/* Center: big play/pause */}
            <PlayPauseBtn size={28} />

            {/* Right: speed, fullscreen */}
            <div className="flex items-center gap-0.5">
              <SpeedMenu />
              <button onClick={toggleFullscreen} className="p-1.5 text-white/70 hover:text-white transition-colors">
                <Maximize size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomVideoPlayer;
