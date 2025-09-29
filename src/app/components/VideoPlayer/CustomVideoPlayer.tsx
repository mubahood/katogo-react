// src/app/components/VideoPlayer/CustomVideoPlayer.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipForward, 
  SkipBack, 
  Settings,
  PictureInPicture,
  Loader2,
  RotateCcw
} from 'lucide-react';
// Styles moved inline below for better encapsulation and consistency
import { ApiService } from '../../services/ApiService';
import { PreferencesService } from '../../services/PreferencesService';
import { VideoProgressModel } from '../../models/VideoProgressModel';

interface CustomVideoPlayerProps {
  url: string;
  movieId?: number;
  autoPlay?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  poster?: string;
  relatedMovies?: Array<{ id: number; title: string; image: string }>; // optional UI enhancement
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

interface ProgressState {
  canResume: boolean;
  resumePosition: number;
  showResumeModal: boolean;
  lastSavedProgress: number;
  progressSaveInterval: number;
  isSaving: boolean;
  lastSaveTime: number;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  url,
  movieId,
  autoPlay = true,
  onNext,
  onPrevious,
  poster,
  relatedMovies = []
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const progressSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastProgressSaveTimeRef = useRef<number>(0);
  const lastSavedProgressRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const isPlayingRef = useRef<boolean>(false);
  const loopActiveRef = useRef<boolean>(false);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Load saved preferences
  const savedPreferences = PreferencesService.getPreferences();
  const deviceInfo = VideoProgressModel.getDeviceInfo();
  
  const [state, setState] = useState<VideoState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: savedPreferences.volume,
    muted: savedPreferences.muted,
    buffering: true,
    loaded: 0,
    playbackRate: savedPreferences.playbackRate,
    isFullscreen: false,
    showControls: true,
    ready: false
  });

  const [progressState, setProgressState] = useState<ProgressState>({
    canResume: false,
    resumePosition: 0,
    showResumeModal: false,
    lastSavedProgress: 0,
    progressSaveInterval: 5, // Save progress every 5 seconds (Flutter pattern)
    isSaving: false,
    lastSaveTime: 0
  });

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showTooltip, setShowTooltip] = useState<{ text: string; show: boolean }>({ text: '', show: false });
  const [volumeIndicator, setVolumeIndicator] = useState<{ show: boolean; value: number }>({ show: false, value: 0 });

  // BULLETPROOF progress saving with proper debouncing - NO concurrent requests
  const saveProgress = useCallback(async (currentTime: number, duration: number, forceImmediate = false) => {
    if (!movieId || duration <= 0 || currentTime <= 0) {
      return;
    }

    const now = Date.now();

    // � IMMEDIATE REJECTION: If ANY save is in progress, block completely
    if (isSavingRef.current) {
      console.log('🚫 Save blocked - request already in progress');
      return;
    }

    // ⏰ TIMING CHECK: Only save if forceImmediate OR (5s passed AND significant progress change)
    if (!forceImmediate) {
      const timeSinceLastSave = now - lastProgressSaveTimeRef.current;
      const progressDiff = Math.abs(currentTime - lastSavedProgressRef.current);

      // Wait at least 5 seconds between saves AND require 5+ seconds of progress change
      if (timeSinceLastSave < 5000 || progressDiff < 5) {
        return;
      }
    }

    // 🔐 ATOMIC LOCK: Set saving flag BEFORE any async operations
    isSavingRef.current = true;

    try {
      const progressData = {
        movie_id: movieId,
        progress: Math.floor(currentTime),
        duration: Math.floor(duration),
        device: deviceInfo.device,
        platform: deviceInfo.platform,
        browser: deviceInfo.browser
      };

      console.log('📡 Sending progress save request...');
      await ApiService.saveVideoProgress(progressData);

      // ✅ SUCCESS: Update tracking state
      lastProgressSaveTimeRef.current = now;
      lastSavedProgressRef.current = currentTime;
      setProgressState(prev => ({
        ...prev,
        lastSavedProgress: currentTime,
        lastSaveTime: now
      }));

      console.log('✅ Progress saved successfully:', {
        position: VideoProgressModel.formatTime(currentTime),
        percentage: Math.round((currentTime / duration) * 100)
      });

    } catch (error) {
      console.error('❌ Failed to save progress:', error);
      // Don't update lastProgressSaveRef on failure to allow retry
    } finally {
      // 🔓 UNLOCK: Always clear the flag
      isSavingRef.current = false;
    }
  }, [movieId, deviceInfo]);

  const loadSavedProgress = useCallback(async () => {
    if (!movieId) return;
    
    try {
      const progress = await ApiService.getVideoProgress(movieId);
      if (progress && VideoProgressModel.canResume(progress.progress, progress.duration)) {
        // Auto-resume without showing modal
        if (videoRef.current) {
          videoRef.current.currentTime = progress.progress;
          console.log('🔄 Auto-resumed from:', {
            position: VideoProgressModel.formatTime(progress.progress),
            percentage: VideoProgressModel.calculatePercentage(progress.progress, progress.duration)
          });
        }
        setProgressState(prev => ({
          ...prev,
          canResume: false,
          resumePosition: 0,
          showResumeModal: false
        }));
      }
    } catch (error) {
      console.warn('Failed to load saved progress:', error);
    }
  }, [movieId]);

  const resumeFromSavedPosition = () => {
    if (videoRef.current && progressState.canResume) {
      videoRef.current.currentTime = progressState.resumePosition;
      setProgressState(prev => ({ ...prev, showResumeModal: false }));
      console.log('📺 Resumed from:', VideoProgressModel.formatTime(progressState.resumePosition));
    }
  };

  const startFromBeginning = () => {
    setProgressState(prev => ({ ...prev, showResumeModal: false }));
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Format time helper
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Hide controls after timeout
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setState(prev => ({ ...prev, showControls: true }));
    
    if (state.playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, showControls: false }));
      }, 3000);
    }
  }, [state.playing]);

  // Video event handlers
  const handleLoadStart = () => {
    setState(prev => ({ ...prev, buffering: true, ready: false }));
  };

  const handleCanPlay = () => {
    setState(prev => ({ ...prev, buffering: false, ready: true }));
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 0;
      
      // Just update state, NO progress saving here
      setState(prev => ({
        ...prev,
        currentTime,
        duration
      }));
    }
  }, []);

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const loaded = videoRef.current.buffered.end(0) / videoRef.current.duration;
      setState(prev => ({ ...prev, loaded }));
    }
  };

  const handleWaiting = () => {
    setState(prev => ({ ...prev, buffering: true }));
  };

  const handlePlaying = () => {
    setState(prev => ({ ...prev, buffering: false, playing: true }));
    isPlayingRef.current = true;
    // Start recursive save loop if not already running
    if (!loopActiveRef.current) {
      startProgressLoop();
    }
    resetControlsTimeout();
  };

  const handlePause = () => {
    setState(prev => ({ ...prev, playing: false }));
    // Signal the loop to stop on the next check
    isPlayingRef.current = false;
  };

  // Control handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (state.playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    const muted = volume === 0;
    
    setState(prev => ({ ...prev, volume, muted }));
    
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
    }
    
    // Save volume preference
    PreferencesService.saveVolume(volume);
    PreferencesService.saveMuted(muted);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !state.muted;
      setState(prev => ({ ...prev, muted: newMuted }));
      videoRef.current.muted = newMuted;
      
      // Save muted preference
      PreferencesService.saveMuted(newMuted);
    }
  };

  const seek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * state.duration;
    seek(newTime);
  };

  const skipForward = () => {
    seek(Math.min(state.currentTime + 10, state.duration));
  };

  const skipBackward = () => {
    seek(Math.max(state.currentTime - 10, 0));
  };

  const changePlaybackRate = (rate: number) => {
    setState(prev => ({ ...prev, playbackRate: rate }));
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    
    // Save playback rate preference
    PreferencesService.savePlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }
  };

  const togglePictureInPicture = async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (error) {
        console.error('PiP error:', error);
      }
    }
  };

  // Keyboard shortcuts (expanded)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target === document.body) {
        switch (e.code) {
          // Playback toggles
          case 'Space':
          case 'KeyK':
            e.preventDefault();
            togglePlay();
            break;
          // Seek controls
          case 'ArrowLeft':
          case 'KeyJ':
            e.preventDefault();
            skipBackward();
            break;
          case 'ArrowRight':
          case 'KeyL':
            e.preventDefault();
            skipForward();
            break;
          // Volume controls
          case 'ArrowUp':
            e.preventDefault();
            if (videoRef.current) {
              const nv = Math.min(1, (videoRef.current.muted ? 0 : state.volume) + 0.1);
              videoRef.current.muted = false;
              setState(prev => ({ ...prev, volume: nv, muted: false }));
              videoRef.current.volume = nv;
              PreferencesService.saveVolume(nv);
              PreferencesService.saveMuted(false);
              // Show volume indicator
              setVolumeIndicator({ show: true, value: Math.round(nv * 100) });
              setTimeout(() => setVolumeIndicator(prev => ({ ...prev, show: false })), 1500);
            }
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (videoRef.current) {
              const nv = Math.max(0, (videoRef.current.muted ? 0 : state.volume) - 0.1);
              const muted = nv === 0;
              setState(prev => ({ ...prev, volume: nv, muted }));
              videoRef.current.volume = nv;
              videoRef.current.muted = muted;
              PreferencesService.saveVolume(nv);
              PreferencesService.saveMuted(muted);
              // Show volume indicator
              setVolumeIndicator({ show: true, value: Math.round(nv * 100) });
              setTimeout(() => setVolumeIndicator(prev => ({ ...prev, show: false })), 1500);
            }
            break;
          case 'KeyM':
            e.preventDefault();
            toggleMute();
            break;
          case 'KeyF':
            e.preventDefault();
            toggleFullscreen();
            break;
          case 'KeyP':
            e.preventDefault();
            togglePictureInPicture();
            break;
          case 'Comma': // < seek backward 10s
            e.preventDefault();
            skipBackward();
            break;
          case 'Period': // > seek forward 10s
            e.preventDefault();
            skipForward();
            break;
          case 'KeyS':
            e.preventDefault();
            setShowSpeedMenu(prev => !prev);
            break;
          case 'Slash': // ? help (without shift)
            e.preventDefault();
            setShowHelp(prev => !prev);
            break;
          // Number keys 0-9 seek to percentage
          case 'Digit0': case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4':
          case 'Digit5': case 'Digit6': case 'Digit7': case 'Digit8': case 'Digit9': {
            const n = parseInt(e.code.replace('Digit', ''), 10);
            if (!isNaN(n) && videoRef.current && state.duration > 0) {
              e.preventDefault();
              const pct = n === 0 ? 0 : n * 10;
              seek((pct / 100) * state.duration);
            }
            break;
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.playbackRate, state.volume, state.muted]);

  // Initialize with saved preferences
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = state.volume;
      videoRef.current.muted = state.muted;
      videoRef.current.playbackRate = state.playbackRate;
      
      console.log('🎵 Restored volume:', state.volume);
      console.log('🔇 Restored muted:', state.muted);
      console.log('⚡ Restored playback rate:', state.playbackRate);
    }
  }, [state.volume, state.muted, state.playbackRate]);

  // Load saved progress when component mounts
  useEffect(() => {
    loadSavedProgress();
  }, [loadSavedProgress]);

  // Page lifecycle management (do not pause on visibility change)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save progress before page unload
      if (state.currentTime > 0 && state.duration > 0) {
        // Use navigator.sendBeacon for reliable save on page unload
        const progressData = {
          movie_model_id: movieId,
          progress: Math.floor(state.currentTime),
          duration: Math.floor(state.duration),
          device: deviceInfo.device,
          platform: deviceInfo.platform,
          browser: deviceInfo.browser
        };
        
        try {
          // Try synchronous save for page unload
          navigator.sendBeacon('/api/video-progress', JSON.stringify(progressData));
        } catch (error) {
          console.warn('Failed to save progress on unload:', error);
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.playing, state.currentTime, state.duration, movieId, deviceInfo, saveProgress]);

  // Recursive self-scheduling progress save loop
  const startProgressLoop = useCallback(async () => {
    if (loopActiveRef.current) return;
    loopActiveRef.current = true;
    try {
      while (isPlayingRef.current) {
        if (videoRef.current && !videoRef.current.paused && videoRef.current.duration > 0) {
          const currentTime = videoRef.current.currentTime;
          const duration = videoRef.current.duration;
          if (currentTime > 0) {
            await saveProgress(currentTime, duration);
          }
        }
        // Wait 5 seconds before next attempt
        await sleep(5000);
      }
    } finally {
      loopActiveRef.current = false;
    }
  }, [saveProgress]);

  // Cleanup on unmount: ensure loop stops
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
    };
  }, []);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Mouse movement handler
  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  // Progress percentage
  const progressPercent = state.duration ? (state.currentTime / state.duration) * 100 : 0;
  const loadedPercent = state.loaded * 100;

  return (
    <>
    <div 
      ref={containerRef}
      className={`custom-video-player ${state.isFullscreen ? 'fullscreen' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setState(prev => ({ ...prev, showControls: false }))}
    >
      {/* Inline styles for the player */}
      <style>
        {`
        :root {
          --bg: #0b0b0b;
          --fg: #eaeaea;
          --muted: #9aa1a9;
          --accent: #e50914;
          --accent-2: #ffffff;
          --overlay: rgba(0,0,0,0.6);
          --overlay-2: rgba(0,0,0,0.35);
          --control-bg: rgba(20,20,20,0.85);
          --control-hover: #1f1f1f;
        }
        .custom-video-player {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: #000;
          border-radius: 0;
          overflow: hidden;
          box-shadow: none;
          color: var(--fg);
          user-select: none;
        }
        .custom-video-player.fullscreen { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 9999; aspect-ratio: unset; }
        .video-element { width: 100%; height: 100%; object-fit: cover; background: #000; }
        .loading-overlay { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; background: rgba(0,0,0,0.8); color:#fff; z-index:5; }
        .loading-spinner { animation: spin 1s linear infinite; color: var(--accent); }
        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

        .controls-overlay { position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.8) 100%); display:flex; flex-direction:column; justify-content:space-between; padding:1rem; transition: opacity .3s ease; z-index:10; }
        .controls-overlay.show { opacity:1; }
        .controls-overlay.hide { opacity:0; }
        .controls-overlay:hover { opacity:1; }
        .center-play-button { position:absolute; top:50%; left:50%; transform: translate(-50%, -50%); width:80px; height:80px; background: var(--accent); border-radius: 50%; display:flex; align-items:center; justify-content:center; cursor:pointer; transition: all .3s ease; z-index:15; }
        .center-play-button:hover { background:#b8070f; transform: translate(-50%,-50%) scale(1.1); }

        .progress-container { margin-top:auto; margin-bottom:1rem; }
        .progress-bar { position:relative; width:100%; height:6px; background: rgba(255,255,255,0.3); border-radius:3px; cursor:pointer; transition: height .2s ease; }
        .progress-bar:hover { height:8px; }
        .progress-loaded { position:absolute; top:0; left:0; height:100%; background: rgba(255,255,255,0.5); border-radius:3px; transition: width .3s ease; }
        .progress-played { position:absolute; top:0; left:0; height:100%; background: var(--accent); border-radius:3px; transition: width .1s ease; }
        .progress-handle { position:absolute; top:50%; width:14px; height:14px; background: var(--accent); border:2px solid white; border-radius:50%; transform: translateY(-50%); opacity:0; transition: all .2s ease; }
        .progress-bar:hover .progress-handle { opacity:1; }

        .bottom-controls { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
        .controls-left, .controls-right { display:flex; align-items:center; gap:.75rem; }
        .control-btn { background:none; border:none; color:#fff; cursor:pointer; padding:.5rem; display:flex; align-items:center; gap:.25rem; transition: all .2s ease; }
        .control-btn:hover { background: rgba(255,255,255,0.2); color: var(--accent); }
        .control-btn:active { transform: scale(0.95); }
        .skip-text { font-size:10px; font-weight:600; }
        .volume-control { display:flex; align-items:center; gap:.5rem; }
        .volume-slider { width:80px; height:4px; background: rgba(255,255,255,0.3); border-radius:2px; outline:none; cursor:pointer; -webkit-appearance:none; }
        .time-display { color:#fff; font-size:14px; font-weight:500; min-width:100px; text-align:center; }

        .speed-control { position:relative; }
        .speed-text { font-size:12px; font-weight:600; margin-left:.25rem; }
        .speed-menu { position:absolute; bottom:100%; right:0; background: rgba(0,0,0,0.9); border-radius:8px; padding:.5rem; margin-bottom:.5rem; min-width:80px; backdrop-filter: blur(10px); border:1px solid rgba(255,255,255,0.1); }
        .speed-option { display:block; width:100%; background:none; border:none; color:#fff; padding:.5rem; cursor:pointer; border-radius:4px; text-align:center; font-size:14px; transition: all .2s ease; }
        .speed-option:hover { background: rgba(255,255,255,0.1); }
        .speed-option.active { background: var(--accent); color:#fff; }



        .help-overlay { position:absolute; top:12px; right:12px; background: rgba(20,20,20,0.9); border:1px solid #222; color:#eaeaea; padding:12px; width: 300px; pointer-events:auto; z-index:25; }
        .help-overlay h4 { margin:0 0 8px 0; }
        .help-grid { display:grid; grid-template-columns: auto 1fr; gap:6px 10px; font-size:12px; color:#9aa1a9; }

        .related-wrap { background:#0e0e0e; border-top:1px solid #151515; }
        .related-title { padding:12px 16px; color:#eaeaea; font-weight:600; font-size:18px; }
        .related-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:12px; padding:8px 16px 16px; }
        .related-card { position:relative; height:280px; background:#1a1a1a; border:1px solid #222; overflow:hidden; cursor:pointer; transition: all .3s ease; }
        .related-card:hover { transform: translateY(-4px); border-color: var(--accent); box-shadow: 0 8px 32px rgba(229,9,20,0.3); }
        .related-card .bg { position:absolute; inset:0; background-size:cover; background-position:center; filter: brightness(0.8); transition: all .3s ease; }
        .related-card:hover .bg { filter: brightness(1.1) saturate(1.2); transform: scale(1.05); }
        .related-card .overlay { position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.8)); }
        .related-card .title { position:absolute; left:12px; right:12px; bottom:12px; color:#fff; font-weight:700; font-size:15px; text-shadow: 0 2px 8px rgba(0,0,0,0.8); line-height:1.3; }
        .related-card .play-icon { position:absolute; top:50%; left:50%; transform: translate(-50%,-50%); opacity:0; transition: all .3s ease; background: rgba(229,9,20,0.9); border-radius:50%; width:50px; height:50px; display:flex; align-items:center; justify-content:center; }
        .related-card:hover .play-icon { opacity:1; transform: translate(-50%,-50%) scale(1.1); }
        
        .volume-indicator { position:absolute; top:50%; left:50%; transform: translate(-50%,-50%); background: rgba(0,0,0,0.8); color:#fff; padding:12px 20px; border-radius:8px; font-weight:600; font-size:18px; z-index:30; transition: all .3s ease; backdrop-filter: blur(10px); }
        .volume-indicator.hide { opacity:0; transform: translate(-50%,-50%) scale(0.8); }
        .volume-indicator.show { opacity:1; transform: translate(-50%,-50%) scale(1); }
        
        .tooltip { position:absolute; background: rgba(0,0,0,0.9); color:#fff; padding:6px 10px; font-size:12px; border-radius:4px; white-space:nowrap; z-index:25; pointer-events:none; transition: all .2s ease; }
        .tooltip.hide { opacity:0; transform: translateY(4px); }
        .tooltip.show { opacity:1; transform: translateY(0); }
        
        .buffer-indicator { position:absolute; top:0; left:0; height:2px; background: var(--accent); z-index:12; transition: width .3s ease; }
        .mini-timeline { position:absolute; bottom:80px; left:50%; transform: translateX(-50%); background: rgba(0,0,0,0.9); padding:8px; border-radius:4px; font-size:12px; color:#fff; opacity:0; transition: all .2s ease; pointer-events:none; }
        .progress-bar:hover + .mini-timeline { opacity:1; }
        `}
      </style>


      <video
        ref={videoRef}
        src={url}
        poster={poster}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onPause={handlePause}
        className="video-element"
        preload="metadata"
        onDoubleClick={toggleFullscreen}
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {state.buffering && (
        <div className="loading-overlay">
          <Loader2 className="loading-spinner" size={48} />
          <span>Loading...</span>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`controls-overlay ${state.showControls ? 'show' : 'hide'}`}>
        {/* Center Play Button */}
        {!state.playing && state.ready && (
          <div className="center-play-button" onClick={togglePlay}>
            <Play size={64} fill="white" />
          </div>
        )}

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar" onClick={handleProgressClick}>
            <div className="progress-loaded" style={{ width: `${loadedPercent}%` }} />
            <div className="progress-played" style={{ width: `${progressPercent}%` }} />
            <div 
              className="progress-handle" 
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="bottom-controls">
          <div className="controls-left">
            <button className="control-btn" onClick={togglePlay}>
              {state.playing ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            {onPrevious && (
              <button className="control-btn" onClick={onPrevious}>
                <SkipBack size={20} />
              </button>
            )}
            
            <button className="control-btn" onClick={skipBackward}>
              <SkipBack size={16} />
              <span className="skip-text">10</span>
            </button>
            
            <button className="control-btn" onClick={skipForward}>
              <span className="skip-text">10</span>
              <SkipForward size={16} />
            </button>
            
            {onNext && (
              <button className="control-btn" onClick={onNext}>
                <SkipForward size={20} />
              </button>
            )}

            <div className="volume-control">
              <button className="control-btn" onClick={toggleMute}>
                {state.muted || state.volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={state.muted ? 0 : state.volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>

            <div className="time-display">
              {formatTime(state.currentTime)} / {formatTime(state.duration)}
            </div>
          </div>

          <div className="controls-right">
            <div className="speed-control">
              <button 
                className="control-btn"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              >
                <Settings size={20} />
                <span className="speed-text">{state.playbackRate}x</span>
              </button>
              
              {showSpeedMenu && (
                <div className="speed-menu">
                  {PLAYBACK_RATES.map(rate => (
                    <button
                      key={rate}
                      className={`speed-option ${rate === state.playbackRate ? 'active' : ''}`}
                      onClick={() => changePlaybackRate(rate)}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="control-btn" onClick={togglePictureInPicture}>
              <PictureInPicture size={20} />
            </button>

            <button className="control-btn" onClick={toggleFullscreen}>
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
      {/* Volume indicator */}
      {volumeIndicator.show && (
        <div className={`volume-indicator ${volumeIndicator.show ? 'show' : 'hide'}`}>
          🔊 {volumeIndicator.value}%
        </div>
      )}

      {/* Help overlay */}
      {showHelp && (
        <div className="help-overlay">
          <h4>⌨️ Keyboard shortcuts</h4>
          <div className="help-grid">
            <span>Space / K</span><span>Play/Pause</span>
            <span>J / Left</span><span>Back 10s</span>
            <span>L / Right</span><span>Forward 10s</span>
            <span>&lt; / &gt;</span><span>Seek ±10s</span>
            <span>Up / Down</span><span>Volume +/-</span>
            <span>M</span><span>Mute/Unmute</span>
            <span>F</span><span>Fullscreen</span>
            <span>P</span><span>Picture-in-Picture</span>
            <span>S</span><span>Speed menu</span>
            <span>0-9</span><span>Seek to %</span>
            <span>?</span><span>Toggle help</span>
          </div>
        </div>
      )}
    </div>
    {/* Related movies section */}
    {relatedMovies.length > 0 && (
      <div className="related-wrap">
        <div className="related-title">Related</div>
        <div className="related-grid">
          {relatedMovies.map((m) => (
            <div 
              key={m.id} 
              className="related-card"
              onClick={() => console.log('Navigate to movie:', m.id)}
            >
              <div className="bg" style={{ backgroundImage: `url(${m.image})` }} />
              <div className="overlay" />
              <div className="play-icon">
                <Play size={20} fill="white" />
              </div>
              <div className="title">{m.title}</div>
            </div>
          ))}
        </div>
      </div>
    )}
    </>
  );
};