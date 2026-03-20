import React, { useEffect, useState } from 'react';

const DISMISS_KEY = 'katogo_offline_banner_dismissed';

const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.sessionStorage.getItem(DISMISS_KEY) === '1';
  });

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false);
      window.sessionStorage.removeItem(DISMISS_KEY);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
      window.sessionStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    window.sessionStorage.setItem(DISMISS_KEY, '1');
  };

  if (!isOffline || dismissed) {
    return null;
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center gap-3 px-3 py-2"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1080,
        background: '#f59e0b',
        color: '#111827',
        borderBottom: '1px solid rgba(17, 24, 39, 0.15)',
      }}
      role="status"
      aria-live="polite"
    >
      <span style={{ fontWeight: 600 }}>You are offline.</span>
      <span>Some features may not be available.</span>
      <button
        type="button"
        onClick={handleDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          fontWeight: 700,
          cursor: 'pointer',
          padding: 0,
        }}
        aria-label="Dismiss offline banner"
      >
        Dismiss
      </button>
    </div>
  );
};

export default OfflineBanner;