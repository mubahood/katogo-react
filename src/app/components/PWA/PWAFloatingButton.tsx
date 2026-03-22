/**
 * PWA Floating Install Button
 * Fixed, always-visible FAB that appears when the app can be installed.
 * - Android/Chrome: triggers native beforeinstallprompt
 * - iOS Safari: shows step-by-step "Add to Home Screen" instructions
 */

import React, { useState } from 'react';
import { Download, X, Share2, PlusSquare, CheckCircle } from 'lucide-react';
import { usePwaInstall, isIos, isInStandaloneMode } from '../../hooks/usePwaInstall';
import './PWAFloatingButton.css';

const PWAFloatingButton: React.FC = () => {
  const { canInstall, installed, install } = usePwaInstall();
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem('pwa-fab-dismissed') === 'true'
  );
  const [showIOS, setShowIOS] = useState(false);
  const [installing, setInstalling] = useState(false);

  const ios = isIos();
  const standalone = isInStandaloneMode();

  // Hide if already installed/standalone
  if (standalone || installed) return null;
  // Hide if dismissed this session
  if (dismissed) return null;
  // Hide on non-iOS if browser prompt not available
  if (!ios && !canInstall) return null;

  const handleInstall = async () => {
    if (ios) {
      setShowIOS(true);
      return;
    }
    setInstalling(true);
    await install();
    setInstalling(false);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem('pwa-fab-dismissed', 'true');
    setDismissed(true);
  };

  return (
    <>
      <div className="pwa-fab-container">
        <button
          className={`pwa-fab-btn${installing ? ' pwa-fab-installing' : ''}`}
          onClick={handleInstall}
          aria-label="Install UgFlix App"
        >
          {/* Pulse rings */}
          <span className="pwa-fab-ring pwa-fab-ring-1" />
          <span className="pwa-fab-ring pwa-fab-ring-2" />

          <span className="pwa-fab-content">
            {ios ? (
              <Share2 size={18} strokeWidth={2.5} />
            ) : installing ? (
              <span className="pwa-fab-spinner" />
            ) : (
              <Download size={18} strokeWidth={2.5} />
            )}
            <span className="pwa-fab-label">Install App</span>
          </span>
        </button>

        <button className="pwa-fab-close" onClick={handleDismiss} aria-label="Dismiss">
          <X size={11} strokeWidth={2.5} />
        </button>
      </div>

      {/* iOS step-by-step instructions bottom sheet */}
      {showIOS && (
        <div className="pwa-ios-overlay" onClick={() => setShowIOS(false)}>
          <div className="pwa-ios-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="pwa-ios-handle" />
            <button className="pwa-ios-close" onClick={() => setShowIOS(false)}>
              <X size={18} />
            </button>

            <div className="pwa-ios-icon">
              <img src="/icons/icon-96x96.png" alt="UgFlix" onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }} />
            </div>

            <h3 className="pwa-ios-title">Install UgFlix</h3>
            <p className="pwa-ios-sub">Add to your Home Screen for the full app experience</p>

            <ol className="pwa-ios-steps">
              <li>
                <span className="pwa-ios-step-num">1</span>
                <div className="pwa-ios-step-body">
                  <Share2 size={20} className="pwa-ios-step-icon" />
                  <span>Tap the <strong>Share</strong> button at the bottom of Safari</span>
                </div>
              </li>
              <li>
                <span className="pwa-ios-step-num">2</span>
                <div className="pwa-ios-step-body">
                  <PlusSquare size={20} className="pwa-ios-step-icon" />
                  <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                </div>
              </li>
              <li>
                <span className="pwa-ios-step-num">3</span>
                <div className="pwa-ios-step-body">
                  <CheckCircle size={20} className="pwa-ios-step-icon" />
                  <span>Tap <strong>Add</strong> to confirm installation</span>
                </div>
              </li>
            </ol>

            {/* Arrow pointing to Safari's share button */}
            <div className="pwa-ios-arrow-row">
              <div className="pwa-ios-arrow-line" />
              <span className="pwa-ios-arrow-label">Share button is here ↓</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAFloatingButton;
