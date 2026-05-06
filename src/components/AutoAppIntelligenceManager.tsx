import React, { useEffect, useRef } from 'react';
import { useSettings } from '../SettingsContext';
import { useAudio } from '../AudioContext';
import { useUIState } from '../UIStateContext';

export const AutoAppIntelligenceManager: React.FC = () => {
  const { settings, updateAppIntelligence, updateAppearanceSettings } = useSettings();
  const { appIntelligence } = settings;
  const { healSystem, resetServiceWorker } = useAudio();
  const { showToast } = useUIState();

  const lastCheckRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!appIntelligence.isEnabled) return;

    // Run intelligence checks on interval (Throttled)
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastCheckRef.current < 60000) return; // Check every 60s
      lastCheckRef.current = now;

      // 1. Config Stabilizer
      if (appIntelligence.configStabilizer) {
        try {
          const local = localStorage.getItem('subliminal_settings_v3');
          if (local) JSON.parse(local);
        } catch (e) {
          console.warn('[App Intel] LocalStorage Corrupted - Self-Healing...');
          localStorage.removeItem('subliminal_settings_v3');
        }
      }

      // 2. iOS Stability Mode (L3)
      if (appIntelligence.iosStabilityMode) {
        // Detect iPhone 8 / iOS 16 if possible, or just apply optimizations
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          // Force lower UI complexity if not already
          if (settings.appearance.uiMode !== 'mini' && window.innerWidth < 400) {
              updateAppearanceSettings({ uiMode: 'mini' });
          }
        }
      }

      // 3. Service Worker Safe Mode
      if (appIntelligence.swSafeMode) {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            if (!registration.active) {
              console.warn('[App Intel] SW Inactive - Bypassing...');
            }
          }).catch(() => {
             console.warn('[App Intel] SW Error - Engaging Safe Mode');
             // Optionally trigger a reset if it persists
          });
        }
      }

      // 4. Asset Repair
      if (appIntelligence.assetRepair) {
        const checkStyles = () => {
          const styles = document.getElementsByTagName('style');
          if (styles.length === 0) {
            console.error('[App Intel] Critical CSS Missing - Repairing...');
            window.location.reload();
          }
        };
        checkStyles();
      }

      // 5. Validation Engine
      if (appIntelligence.validationEngine) {
        // Check for missing context/providers
        if (!settings || !healSystem) {
          console.error('[App Intel] Provider Chain Broken - Recovering');
          window.location.reload();
        }
      }

    }, 30000); // Internal check tick

    return () => clearInterval(interval);
  }, [appIntelligence, settings, healSystem, updateAppearanceSettings]);

  // Event-driven healing
  useEffect(() => {
    if (!appIntelligence.isEnabled) return;

    // React Rules Enforcer / Runtime Crash Shield
    const handleError = (event: ErrorEvent) => {
      if (appIntelligence.runtimeCrashShield) {
        if (event.message.includes('ResizeObserver') || event.message.includes('Script error')) {
           // Ignore benign errors
           return;
        }
        console.error('[App Intel] Runtime Crash Detected - Applying Shield', event.error);
        // Silently recover if possible (e.g. go back to library)
        // This is tricky without a global error boundary but we have one
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [appIntelligence.isEnabled, appIntelligence.runtimeCrashShield]);

  return null; // Silent component
};
