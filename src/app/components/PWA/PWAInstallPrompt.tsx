/**
 * PWA Install Prompt Component
 * 
 * Displays a native-looking prompt to install the app as a PWA
 * Shows when the beforeinstallprompt event fires
 */

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import './PWAInstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed prompt before
    const promptDismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = promptDismissed ? parseInt(promptDismissed, 10) : 0;
    const daysSinceDismissal = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Don't show prompt if dismissed within last 7 days
    if (daysSinceDismissal < 7) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show prompt after 5 seconds for testing (change to 30000 for production)
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // 5 seconds for testing
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    // For testing in development - show a test button
    const showTestButton = process.env.NODE_ENV === 'development';
    if (showTestButton) {
      console.log('🎯 PWA Install Prompt Component Loaded');
      console.log('⏱️  Waiting for beforeinstallprompt event...');
      console.log('💡 Note: This event only fires on HTTPS or supported localhost setups');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowPrompt(false);
        setDeferredPrompt(null);
      } else {
        console.log('User dismissed the install prompt');
        handleDismiss();
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // For development testing - add manual trigger
  if (process.env.NODE_ENV === 'development' && !showPrompt && !isInstalled) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: '#B71C1C',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        fontSize: '14px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onClick={() => setShowPrompt(true)}
      title="Click to test PWA install prompt"
      >
        <Download size={18} />
        Test PWA Install
      </div>
    );
  }

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="pwa-install-overlay">
      <div className="pwa-install-prompt">
        <button className="pwa-close-btn" onClick={handleDismiss} aria-label="Close">
          <X size={20} />
        </button>

        <div className="pwa-icon">
          <Smartphone size={48} />
        </div>

        <h3 className="pwa-title">Install UgFlix App</h3>
        <p className="pwa-description">
          Install UgFlix on your device for a faster, app-like experience with offline access and instant updates.
        </p>

        <div className="pwa-features">
          <div className="pwa-feature">
            <span className="pwa-feature-icon">⚡</span>
            <span>Lightning fast</span>
          </div>
          <div className="pwa-feature">
            <span className="pwa-feature-icon">📱</span>
            <span>Works offline</span>
          </div>
          <div className="pwa-feature">
            <span className="pwa-feature-icon">🔔</span>
            <span>Push notifications</span>
          </div>
        </div>

        <div className="pwa-actions">
          <button className="pwa-install-btn" onClick={handleInstallClick}>
            <Download size={20} />
            <span>Install App</span>
          </button>
          <button className="pwa-dismiss-btn" onClick={handleDismiss}>
            Not now
          </button>
        </div>

        <p className="pwa-info">
          Free to install • No extra storage needed • Works like native app
        </p>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
