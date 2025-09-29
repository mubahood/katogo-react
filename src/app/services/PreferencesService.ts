// src/app/services/PreferencesService.ts

import { UserPreferences } from '../models/VideoProgressModel';

export class PreferencesService {
  private static readonly STORAGE_KEYS = {
    USER_PREFERENCES: 'ugflix_user_preferences',
    VOLUME_LEVEL: 'ugflix_volume_level',
    PLAYBACK_RATE: 'ugflix_playback_rate',
    AUTOPLAY: 'ugflix_autoplay',
    MUTED: 'ugflix_muted'
  };

  private static readonly DEFAULT_PREFERENCES: UserPreferences = {
    volume: 1.0,
    muted: false,
    playbackRate: 1.0,
    autoplay: true,
    quality: 'auto',
    subtitles: false,
    language: 'en'
  };

  /**
   * Get all user preferences
   */
  static getPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES);
      if (stored) {
        const preferences = JSON.parse(stored);
        return { ...this.DEFAULT_PREFERENCES, ...preferences };
      }
    } catch (error) {
      console.warn('Failed to load preferences from localStorage:', error);
    }
    return { ...this.DEFAULT_PREFERENCES };
  }

  /**
   * Save all user preferences
   */
  static savePreferences(preferences: Partial<UserPreferences>): void {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(this.STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
      
      // Also save individual settings for quick access
      localStorage.setItem(this.STORAGE_KEYS.VOLUME_LEVEL, updated.volume.toString());
      localStorage.setItem(this.STORAGE_KEYS.MUTED, updated.muted.toString());
      localStorage.setItem(this.STORAGE_KEYS.PLAYBACK_RATE, updated.playbackRate.toString());
      localStorage.setItem(this.STORAGE_KEYS.AUTOPLAY, updated.autoplay.toString());
      
      console.log('📱 Preferences saved:', updated);
    } catch (error) {
      console.error('Failed to save preferences to localStorage:', error);
    }
  }

  /**
   * Get saved volume level
   */
  static getVolume(): number {
    try {
      const volume = localStorage.getItem(this.STORAGE_KEYS.VOLUME_LEVEL);
      if (volume !== null) {
        const vol = parseFloat(volume);
        return isNaN(vol) ? this.DEFAULT_PREFERENCES.volume : Math.max(0, Math.min(1, vol));
      }
    } catch (error) {
      console.warn('Failed to load volume from localStorage:', error);
    }
    return this.DEFAULT_PREFERENCES.volume;
  }

  /**
   * Save volume level
   */
  static saveVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.savePreferences({ volume: clampedVolume });
  }

  /**
   * Get muted state
   */
  static getMuted(): boolean {
    try {
      const muted = localStorage.getItem(this.STORAGE_KEYS.MUTED);
      return muted === 'true';
    } catch (error) {
      console.warn('Failed to load muted state from localStorage:', error);
    }
    return this.DEFAULT_PREFERENCES.muted;
  }

  /**
   * Save muted state
   */
  static saveMuted(muted: boolean): void {
    this.savePreferences({ muted });
  }

  /**
   * Get playback rate
   */
  static getPlaybackRate(): number {
    try {
      const rate = localStorage.getItem(this.STORAGE_KEYS.PLAYBACK_RATE);
      if (rate !== null) {
        const playbackRate = parseFloat(rate);
        return isNaN(playbackRate) ? this.DEFAULT_PREFERENCES.playbackRate : playbackRate;
      }
    } catch (error) {
      console.warn('Failed to load playback rate from localStorage:', error);
    }
    return this.DEFAULT_PREFERENCES.playbackRate;
  }

  /**
   * Save playback rate
   */
  static savePlaybackRate(rate: number): void {
    this.savePreferences({ playbackRate: rate });
  }

  /**
   * Get autoplay preference
   */
  static getAutoplay(): boolean {
    try {
      const autoplay = localStorage.getItem(this.STORAGE_KEYS.AUTOPLAY);
      return autoplay !== 'false'; // Default to true unless explicitly disabled
    } catch (error) {
      console.warn('Failed to load autoplay preference from localStorage:', error);
    }
    return this.DEFAULT_PREFERENCES.autoplay;
  }

  /**
   * Save autoplay preference
   */
  static saveAutoplay(autoplay: boolean): void {
    this.savePreferences({ autoplay });
  }

  /**
   * Reset all preferences to defaults
   */
  static resetPreferences(): void {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('🔄 Preferences reset to defaults');
    } catch (error) {
      console.error('Failed to reset preferences:', error);
    }
  }

  /**
   * Export preferences for backup
   */
  static exportPreferences(): string {
    return JSON.stringify(this.getPreferences(), null, 2);
  }

  /**
   * Import preferences from backup
   */
  static importPreferences(preferencesJson: string): boolean {
    try {
      const preferences = JSON.parse(preferencesJson);
      this.savePreferences(preferences);
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }
}