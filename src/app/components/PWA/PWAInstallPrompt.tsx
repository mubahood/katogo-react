/**
 * PWA Install Prompt — proactive bottom-sheet popup.
 *
 * - First visit: shows after 2 seconds automatically (no gate)
 * - After dismissal: respects a 3-day cooldown before showing again
 * - iOS: deferred (the FAB handles iOS instructions)
 */

import React, { useState, useEffect } from 'react';
import { X, Download, Zap, Wifi, Bell } from 'lucide-react';
import { usePwaInstall, isIos, isInStandaloneMode } from '../../hooks/usePwaInstall';
import './PWAInstallPrompt.css';

const DISMISSED_KEY = 'pwa-install-dismissed';
const COOLDOWN_DAYS = 3;

const PWAInstallPrompt: React.FC = () => {
  const { canInstall, install, isInstalled } = usePwaInstall();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // iOS handled by FAB; standalone = already installed
    if (isIos() || isInStandaloneMode() || isInstalled || !canInstall) return;

    const dismissedAt = parseInt(localStorage.getItem(DISMISSED_KEY) || '0', 10);
    const daysSince = (Date.now() - dismissedAt) / 86_400_000;
    const isFirstVisit = dismissedAt === 0;
    const cooldownPassed = daysSince >= COOLDOWN_DAYS;

    if (!isFirstVisit && !cooldownPassed) return;

    // First visit → 2 s delay; returning visitor → 4 s delay
    const delay = isFirstVisit ? 2000 : 4000;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [canInstall, isInstalled]);

  const dismiss = () => {
    setLeaving(true);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setTimeout(() => { setVisible(false); setLeaving(false); }, 350);
  };

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) {
      setLeaving(true);
      setTimeout(() => setVisible(false), 350);
    } else {
      dismiss();
    }
  };

  if (!visible || isInstalled || !canInstall) return null;

  return (
    <div className={`pwa-sheet-overlay${leaving ? ' pwa-sheet-leaving' : ''}`} onClick={dismiss}>
      <div className="pwa-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Drag handle */}
        <div className="pwa-sheet-handle" />

        <button className="pwa-sheet-close" onClick={dismiss} aria-label="Close">
          <X size={18} />
        </button>

        {/* App branding */}
        <div className="pwa-sheet-brand">
          <div className="pwa-sheet-appicon">
            <img
              src="/icons/icon-96x96.png"
              alt="UgFlix"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <div>
            <h3 className="pwa-sheet-title">Install UgFlix</h3>
            <p className="pwa-sheet-domain">ugflix.com</p>
          </div>
        </div>

        <p className="pwa-sheet-desc">
          Get the full app experience — faster loading, offline access, and it works just like a native app.
        </p>

        {/* Feature pills */}
        <div className="pwa-sheet-features">
          <span className="pwa-sheet-pill">
            <Zap size={13} /> Instant load
          </span>
          <span className="pwa-sheet-pill">
            <Wifi size={13} /> Works offline
          </span>
          <span className="pwa-sheet-pill">
            <Bell size={13} /> Notifications
          </span>
        </div>

        {/* Actions */}
        <button className="pwa-sheet-install-btn" onClick={handleInstall}>
          <Download size={18} strokeWidth={2.5} />
          <span>Add to Home Screen</span>
        </button>

        <button className="pwa-sheet-dismiss-btn" onClick={dismiss}>
          Not now
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
