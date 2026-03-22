/**
 * PWA install hook — reactive version.
 * Captures the beforeinstallprompt event and provides a React hook
 * so components re-render when the prompt becomes available.
 */
import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/* ── iOS / standalone detection helpers ──────────────────────────────── */
export function isIos(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod/.test(window.navigator.userAgent) && !(window as any).MSStream;
}

export function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/* ── Module-level state shared across all hook consumers ──────────────── */
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let isInstalled = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

// Capture the event as early as possible (module-level)
if (typeof window !== 'undefined') {
  if (isInStandaloneMode()) {
    isInstalled = true;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    isInstalled = true;
    deferredPrompt = null;
    notify();
  });
}

/* ── Register the service worker (call once from main.tsx) ────────────── */
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        console.log('✅ SW registered, scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('⚠️ SW registration failed:', err);
      });
  });
}

/* ── React hook — triggers re-render when install state changes ───────── */
export function usePwaInstall() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate((n) => n + 1);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const canInstall = !isInstalled && deferredPrompt !== null;
  const installed = isInstalled;

  const install = useCallback(async (): Promise<boolean> => {
    if (isInstalled) return true;
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      notify();
      return outcome === 'accepted';
    } catch {
      return false;
    }
  }, []);

  return { canInstall, installed, isInstalled: installed, install };
}

/* ── Legacy exports (kept for any other consumers) ────────────────────── */
export async function triggerPwaInstall() {
  if (isInstalled) return 'accepted' as const;
  if (!deferredPrompt) return 'unavailable' as const;
  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') { deferredPrompt = null; notify(); }
    return outcome;
  } catch { return 'unavailable' as const; }
}
export function canInstallPwa() { return !isInstalled && deferredPrompt !== null; }
export function isPwaInstalled() { return isInstalled; }
