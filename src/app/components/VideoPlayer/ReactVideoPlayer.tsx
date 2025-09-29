import React, { useState, useRef, useEffect } from 'react';
import './ReactVideoPlayer.css';

interface ReactVideoPlayerProps {
  url: string;
  poster?: string;
  title?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  autoPlay?: boolean;
}

interface VideoState {
  playing: boolean;
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
  duration: number;
  volume: number;
  muted: boolean;
  buffering: boolean;
  seeking: boolean;
  fullscreen: boolean;
}

export const ReactVideoPlayer: React.FC<ReactVideoPlayerProps> = ({
  url,
  poster,
  title,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  autoPlay = true
}) => {
  const playerRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<VideoState>({
    playing: false,
    played: 0,
    playedSeconds: 0,
    loaded: 0,
    loadedSeconds: 0,
    duration: 0,
    volume: 0.8,
    muted: false,
    buffering: false,
    seeking: false,
    fullscreen: false
  });

  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [ready, setReady] = useState(false);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    const timeout = setTimeout(() => {
      if (state.playing && !state.seeking) {
        setShowControls(false);
      }
    }, 3000);

    setControlsTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [showControls, state.playing, state.seeking]);

  // Mouse movement shows controls
  const handleMouseMove = () => {
    if (!showControls) {
      setShowControls(true);
    }
  };

  // Video event handlers
  const handleReady = () => {
    console.log('🎬 Video ready for playback');
    setReady(true);
    if (autoPlay) {
      setState(prev => ({ ...prev, playing: true }));
    }
  };

  const handleStart = () => {
    console.log('▶️ Video playback started');
    setState(prev => ({ ...prev, playing: true }));
  };

  const handlePlay = () => {
    setState(prev => ({ ...prev, playing: true }));
  };

  const handlePause = () => {
    setState(prev => ({ ...prev, playing: false }));
  };

  const handleProgress = (progress: any) => {
    if (!state.seeking) {
      setState(prev => ({
        ...prev,
        played: progress.played,
        playedSeconds: progress.playedSeconds,
        loaded: progress.loaded,
        loadedSeconds: progress.loadedSeconds
      }));
    }
  };

  const handleDuration = (duration: number) => {
    console.log('📹 Video duration:', duration);
    setState(prev => ({ ...prev, duration }));
  };

  const handleError = (error: any) => {
    console.error('❌ Video playback error:', error);
    setState(prev => ({ ...prev, buffering: false }));
    setReady(true); // Stop loading spinner on error
  };

  // Control handlers
  const togglePlay = () => {
    setState(prev => ({ ...prev, playing: !prev.playing }));
  };

  const toggleMute = () => {
    setState(prev => ({ ...prev, muted: !prev.muted }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setState(prev => ({ ...prev, volume, muted: volume === 0 }));
  };

  const handleSeekMouseDown = () => {
    setState(prev => ({ ...prev, seeking: true }));
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const played = parseFloat(e.target.value);
    setState(prev => ({ ...prev, played }));
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    const played = parseFloat((e.target as HTMLInputElement).value);
    setState(prev => ({ ...prev, seeking: false }));
    if (playerRef.current && playerRef.current.duration) {
      playerRef.current.currentTime = played * playerRef.current.duration;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setState(prev => ({ ...prev, fullscreen: true }));
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setState(prev => ({ ...prev, fullscreen: false }));
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`react-video-player ${state.fullscreen ? 'fullscreen' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => state.playing && setShowControls(false)}
    >
      {/* Loading overlay */}
      {!ready && (
        <div className="video-loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading video...</p>
        </div>
      )}

      {/* React Player */}
      <video
        ref={playerRef}
        src={url}
        poster={poster}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        onLoadedData={handleReady}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={(e) => {
          const video = e.target as HTMLVideoElement;
          if (!state.seeking && video.duration) {
            const played = video.currentTime / video.duration;
            setState(prev => ({
              ...prev,
              played,
              playedSeconds: video.currentTime,
              duration: video.duration
            }));
          }
        }}
        onVolumeChange={(e) => {
          const video = e.target as HTMLVideoElement;
          setState(prev => ({
            ...prev,
            volume: video.volume,
            muted: video.muted
          }));
        }}
        onError={handleError}
        autoPlay={autoPlay}
        muted={state.muted}
      />

      {/* Video Controls Overlay */}
      <div className={`video-controls-overlay ${showControls ? 'visible' : 'hidden'}`}>
        {/* Top Controls */}
        <div className="video-controls-top">
          <div className="video-title">
            <h3>{title || 'Now Playing'}</h3>
          </div>
          <div className="video-actions-top">
            <button 
              className="control-btn"
              onClick={toggleFullscreen}
              title="Toggle fullscreen"
            >
              {state.fullscreen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Center Controls */}
        <div className="video-controls-center">
          {hasPrevious && (
            <button 
              className="control-btn control-btn-large"
              onClick={onPrevious}
              title="Previous episode"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
          )}

          <button 
            className="control-btn control-btn-large control-btn-play"
            onClick={togglePlay}
            title={state.playing ? 'Pause' : 'Play'}
          >
            {state.playing ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="m7 4 10 8L7 20V4z"/>
              </svg>
            )}
          </button>

          {hasNext && (
            <button 
              className="control-btn control-btn-large"
              onClick={onNext}
              title="Next episode"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="video-controls-bottom">
          {/* Progress Bar */}
          <div className="progress-container">
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={state.played}
              onChange={handleSeekChange}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              className="progress-bar"
            />
            <div 
              className="progress-buffer" 
              style={{ width: `${state.loaded * 100}%` }}
            />
            <div 
              className="progress-played" 
              style={{ width: `${state.played * 100}%` }}
            />
          </div>

          {/* Control Bar */}
          <div className="control-bar">
            <div className="control-group-left">
              <button 
                className="control-btn"
                onClick={togglePlay}
              >
                {state.playing ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="m7 4 10 8L7 20V4z"/>
                  </svg>
                )}
              </button>

              <button 
                className="control-btn"
                onClick={toggleMute}
              >
                {state.muted || state.volume === 0 ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : state.volume < 0.5 ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={state.volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />

              <div className="time-display">
                {formatTime(state.playedSeconds)} / {formatTime(state.duration)}
              </div>
            </div>

            <div className="control-group-right">
              <button 
                className="control-btn"
                onClick={toggleFullscreen}
              >
                {state.fullscreen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};