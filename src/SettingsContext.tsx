import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { AppSettings, HzProfile, HzProfileValues } from './types';
import * as db from './db';
import { APP_HISTORY } from './constants/history';
import { v4 as uuidv4 } from 'uuid';
import { AUDIO_LAYER_REGISTRY } from './constants/layers';

const CURRENT_VERSION = '2.4.3';

const DEFAULT_SPATIAL: AppSettings['subliminal']['spatial'] = {
  pan: 0,
  depth: 0.1,
  width: 0.5,
  elevation: 0
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateSubliminalSettings: (newSettings: Partial<AppSettings['subliminal']>) => void;
  updateBinauralSettings: (newSettings: Partial<AppSettings['binaural']>) => void;
  updateNatureSettings: (newSettings: Partial<AppSettings['nature']>) => void;
  updateNoiseSettings: (newSettings: Partial<AppSettings['noise']>) => void;
  updateDidgeridooSettings: (newSettings: Partial<AppSettings['didgeridoo']>) => void;
  updateShamanicSettings: (newSettings: Partial<AppSettings['shamanic']>) => void;
  updatePureHzSettings: (newSettings: Partial<AppSettings['pureHz']>) => void;
  updateIsochronicSettings: (newSettings: Partial<AppSettings['isochronic']>) => void;
  updateSolfeggioSettings: (newSettings: Partial<AppSettings['solfeggio']>) => void;
  updateSchumannSettings: (newSettings: Partial<AppSettings['schumann']>) => void;
  updateMainAudioSettings: (newSettings: Partial<AppSettings['mainAudio']>) => void;
  updateMentalToughnessSettings: (newSettings: Partial<AppSettings['mentalToughness']>) => void;
  updateDualModeSettings: (newSettings: Partial<AppSettings['dualMode']>) => void;
  updateSyncLabSettings: (newSettings: Partial<AppSettings['syncLab']>) => void;
  updateLibrarySettings: (newSettings: Partial<AppSettings['library']>) => void;
  updateAppearanceSettings: (newSettings: Partial<AppSettings['appearance']>) => void;
  updateVisibilitySettings: (newSettings: Partial<AppSettings['visibility']>) => void;
  updateGlobalModes: (newModes: Partial<AppSettings['globalModes']>) => void;
  updateAdvancedAudioSettings: (newSettings: Partial<AppSettings['advancedAudio']>) => void;
  updateAutoOrganizerSettings: (newSettings: Partial<AppSettings['autoOrganizer']>) => void;
  updateHistoryOperations: (newOps: Partial<AppSettings['historyOperations']>) => void;
  trackFeatureUsage: (featureId: string) => void;
  updateAudioTools: (newSettings: Partial<AppSettings['audioTools']>) => void;
  updateAppIntelligence: (newSettings: Partial<AppSettings['appIntelligence']>) => void;
  updateLayer: (id: string, updates: any) => void;
  updateSleepTimer: (newSettings: Partial<AppSettings['sleepTimer']>) => void;
  updateSessionState: (newSettings: Partial<AppSettings['sessionState']>) => void;
  updateSafeIdleSettings: (newSettings: Partial<AppSettings['safeIdle']>) => void;
  resetUISettings: () => void;
  hzProfiles: HzProfile[];
  refreshHzProfiles: () => Promise<void>;
  saveHzProfile: (name: string, values?: HzProfileValues, isDefault?: boolean) => Promise<void>;
  deleteHzProfile: (id: string) => Promise<void>;
  updateHzProfile: (id: string, updates: Partial<HzProfile>) => Promise<void>;
  applyHzProfile: (profile: HzProfile) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  version: CURRENT_VERSION,
  versionTimestamp: new Date().toISOString(),
  layers: {}, // Initialized dynamically
  subliminal: {
    isEnabled: true,
    selectedTrackId: null,
    volume: 0.1,
    isLooping: true,
    delayMs: 0,
    isPlaylistMode: false,
    sourcePlaylistId: null,
    gainDb: 0,
    normalize: false,
    playInBackground: false,
    spatial: DEFAULT_SPATIAL,
  },
  binaural: {
    isEnabled: false,
    leftFreq: 200,
    rightFreq: 210,
    volume: 0.05,
    gainDb: 0,
    normalize: false,
    playInBackground: false,
    pitchSafeMode: false,
    bufferMode: 'single',
    spatial: DEFAULT_SPATIAL,
  },
  nature: {
    isEnabled: false,
    type: 'rain',
    volume: 0.5,
    gainDb: 0,
    frequency: 432,
    pitchSafeMode: false,
    normalize: false,
    playInBackground: false,
    bufferMode: 'single',
    spatial: DEFAULT_SPATIAL,
  },
  noise: {
    isEnabled: false,
    type: 'white',
    volume: 0.2,
    gainDb: 0,
    frequency: 432,
    pitchSafeMode: false,
    normalize: false,
    playInBackground: false,
    bufferMode: 'single',
    spatial: DEFAULT_SPATIAL,
  },
  didgeridoo: {
    isEnabled: false,
    volume: 0.3,
    gainDb: -6,
    playbackRate: 1.0,
    frequency: 65,
    depth: 0.5,
    isLooping: true,
    normalize: false,
    playInBackground: false,
    pitchSafeMode: false,
    bufferMode: 'single',
    physical: {
      roomSize: 'medium',
      wallResonance: 'medium',
      materialTexture: 'solid_wall',
      resonanceDepth: 0.3,
      echoTailLength: 0.2
    },
    spatial: DEFAULT_SPATIAL,
  },
  shamanic: {
    isEnabled: false,
    volume: 0.4,
    gainDb: -6,
    playbackRate: 1.0,
    interval: 10,
    frequency: 70, // Warm low drum tone
    depth: 0.4,
    isLooping: true,
    normalize: false,
    playInBackground: false,
    pitchSafeMode: false,
    bufferMode: 'single',
    physical: {
      roomSize: 'medium',
      wallResonance: 'low',
      materialTexture: 'empty_wood',
      resonanceDepth: 0.4,
      echoTailLength: 0.3,
      bangingIntensity: 'medium'
    },
    spatial: DEFAULT_SPATIAL,
  },
  mentalToughness: {
    isEnabled: false,
    volume: 0.3,
    gainDb: -6,
    pitch: 'hard',
    texture: 'empty_wood',
    intensity: 'medium',
    playbackRate: 1.0,
    frequency: 60,
    interval: 10,
    isLooping: true,
    normalize: false,
    playInBackground: false,
    pitchSafeMode: false,
    bufferMode: 'single',
    physical: {
      roomSize: 'large',
      wallResonance: 'medium',
      materialTexture: 'solid_wall',
      resonanceDepth: 0.5,
      echoTailLength: 0.4,
      bangingIntensity: 'medium'
    },
    spatial: DEFAULT_SPATIAL,
  },
  dualMode: {
    isEnabled: false,
    volume: 0.4,
    gainDb: -6,
    tempo: 1.0,
    intensity: 1.0,
    texture: 'wood',
    mixBalance: 0.5,
    frequency: 68,
    isLooping: true,
    normalize: false,
    playInBackground: false,
    pitchSafeMode: false,
    bufferMode: 'single',
    physical: {
      roomSize: 'medium',
      wallResonance: 'medium',
      materialTexture: 'empty_wood',
      resonanceDepth: 0.4,
      echoTailLength: 0.3
    },
    spatial: DEFAULT_SPATIAL,
  },
  pureHz: {
    isEnabled: false,
    frequency: 432,
    volume: 0.05,
    isLooping: true,
    gainDb: 0,
    normalize: false,
    playInBackground: false,
    pitchSafeMode: false,
    bufferMode: 'single',
    spatial: DEFAULT_SPATIAL,
  },
  isochronic: {
    isEnabled: false,
    frequency: 432,
    pulseRate: 7.83,
    volume: 0.1,
    gainDb: -6,
    normalize: false,
    playInBackground: false,
    pitchSafeMode: false,
    bufferMode: 'single',
    spatial: DEFAULT_SPATIAL,
  },
  solfeggio: {
    isEnabled: false,
    frequency: 528,
    volume: 0.1,
    gainDb: -6,
    normalize: false,
    playInBackground: false,
    pitchSafeMode: false,
    bufferMode: 'single',
    spatial: DEFAULT_SPATIAL,
  },
  schumann: {
    isEnabled: false,
    frequency: 7.83,
    volume: 0.1,
    gainDb: -6,
    normalize: false,
    playInBackground: false,
    pitchSafeMode: false,
    bufferMode: 'single',
    spatial: DEFAULT_SPATIAL,
  },
  safeIdle: {
    isEnabled: true,
    volume: 0.001,
  },
  syncLab: {
    linkMode: false,
    masterHz: 432,
  },
  audioTools: {
    gainDb: 0,
    normalizeTargetDb: null,
    playInBackground: false,
    masterVolume: 1.0,
  },
  mainAudio: {
    volume: 1.0,
    gainDb: 0,
    frequency: 432,
    isEnabled: true,
    spatial: DEFAULT_SPATIAL,
  },
  playbackRate: 1.0,
  fadeInOut: true,
  syncPlayback: true,
  advancedAudio: {
    calmControl: {
      isEnabled: true,
      silenceRecovery: {
        isEnabled: false,
        sensitivity: 'medium',
        retryDelayMs: 2500,
      },
      layerPriority: {
        isEnabled: false,
        order: ['subliminal', 'pureHz', 'nature'],
        balanceStrength: 0.5,
      },
      timeAutomation: {
        isEnabled: false,
        steps: [],
        smoothTransitions: true,
      },
      safeListening: {
        isEnabled: false,
        maxVolumeCap: 0.85,
        harshSoftening: 0.3,
      }
    },
    stabilityEngine: {
      isEnabled: true,
      sessionMemory: {
        isEnabled: true,
        autoRestore: false,
      },
      loopVariations: {
        isEnabled: false,
        intensity: 'medium',
      },
      driftProtection: {
        isEnabled: false,
        mode: 'soft',
      },
      emergencyRecovery: {
        isEnabled: true,
        speed: 'safe',
      },
      spatialEngine: {
        isEnabled: false,
        layers: {
          'subliminal': { pan: 0, depth: 0.5, width: 0.5, elevation: 0 },
          'binaural': { pan: 0, depth: 0.5, width: 0.5, elevation: 0 },
          'nature': { pan: 0, depth: 0.5, width: 0.5, elevation: 0 },
          'noise': { pan: 0, depth: 0.5, width: 0.5, elevation: 0 },
        }
      },
      sessionContinuity: {
        isEnabled: true,
        lastSavedAt: null,
      },
      heatmapInsights: {
        isEnabled: true,
        history: {}
      },
      lowPowerMode: {
        isEnabled: false,
        autoMode: true,
      },
      interruptShield: {
        isEnabled: true,
        sensitivity: 'med',
      }
    },
    selfHeal: {
      isEnabled: true,
      mainAudio: true,
      volume: true,
      background: true,
    }
  },
  appIntelligence: {
    isEnabled: false,
    buildFixEngine: false,
    configStabilizer: false,
    pathResolver: false,
    routingGuard: false,
    swSafeMode: false,
    runtimeCrashShield: false,
    reactRulesEnforcer: false,
    assetRepair: false,
    iosStabilityMode: false,
    validationEngine: false,
  },
  intelligenceStats: {
    features: {
      'silenceRecovery': { id: 'silenceRecovery', name: 'Smart Silence Recovery', group: 1, usageCount: { day: 0, week: 0, month: 0, total: 0 }, lastUsedAt: null },
      'layerPriority': { id: 'layerPriority', name: 'Layer Priority System', group: 1, usageCount: { day: 0, week: 0, month: 0, total: 0 }, lastUsedAt: null },
      'timeAutomation': { id: 'timeAutomation', name: 'Time-Based Automation', group: 1, usageCount: { day: 0, week: 0, month: 0, total: 0 }, lastUsedAt: null },
      'safeListening': { id: 'safeListening', name: 'Safe Listening Guard', group: 1, usageCount: { day: 0, week: 0, month: 0, total: 0 }, lastUsedAt: null },
      'sessionMemory': { id: 'sessionMemory', name: 'Session Memory Restore', group: 2, usageCount: { day: 0, week: 0, month: 0, total: 0 }, lastUsedAt: null },
      'loopVariations': { id: 'loopVariations', name: 'Smart Loop Variations', group: 2, usageCount: { day: 0, week: 0, month: 0, total: 0 }, lastUsedAt: null },
      'driftProtection': { id: 'driftProtection', name: 'Frequency Drift Protection', group: 2, usageCount: { day: 0, week: 0, month: 0, total: 0 }, lastUsedAt: null },
      'emergencyRecovery': { id: 'emergencyRecovery', name: 'Emergency Audio Recovery Mode', group: 2, usageCount: { day: 0, week: 0, month: 0, total: 0 }, lastUsedAt: null },
      'spatialEngine': { id: 'spatialEngine', name: 'Spatial Layer Depth Engine', group: 2, usageCount: { day: 0, week: 0, month: 0, total: 0 }, lastUsedAt: null },
      'sessionContinuity': { id: 'sessionContinuity', name: 'Invisible Session Continuity', group: 2, usageCount: { day: 0, week: 0, month: 0, total: 0 }, lastUsedAt: null },
      'heatmapInsights': { id: 'heatmapInsights', name: 'Session Heatmap Insights', group: 2, usageCount: { day: 0, week: 0, month: 0, total: 0 }, lastUsedAt: null },
      'selfHeal': { id: 'selfHeal', name: 'Automated Self-Heal Intelligence', group: 2, usageCount: { day: 0, week: 0, month: 0, total: 0 }, lastUsedAt: null },
    }
  },
  autoOrganizer: {
    isEnabled: true,
    decisions: [
      {
        featureId: 'silenceRecovery',
        featureName: 'Smart Silence Recovery',
        featureType: 'audio',
        targetGroup: 'Audio Intelligence',
        reason: 'Matches Intelligence core logic',
        timestamp: Date.now()
      },
      {
        featureId: 'usageDashboard',
        featureName: 'Usage Intelligence Dashboard',
        featureType: 'analytics',
        targetGroup: 'Audio Intelligence',
        reason: 'Analytics specific enhancement',
        timestamp: Date.now()
      }
    ],
    customGroups: {}
  },
  historyOperations: {
    lastExportAt: null,
    lastImportAt: null,
  },
  library: {
    sort: 'recent',
    group: 'alphabetical',
    groupByMinutes: false,
  },
  appearance: {
    theme: 'light',
    followSystem: true,
    darkModeStyle: 'soft-purple',
    uiMode: typeof window !== 'undefined' && window.innerWidth < 400 ? 'mini' : 'pro',
  },
  hiddenLayersPosition: 'bottom',
  loop: 'none',
  shuffle: false,
  playlistMemory: {},
  menuPosition: 'bottom',
  bigTouchMode: false,
  animationStyle: 'slide-up',
  hzInputMode: 'slider',
  subliminalExpanded: false,
  showArtwork: false,
  alwaysHideArtworkByDefault: true,
  backButtonPosition: 'bottom',
  libraryControlsPosition: 'bottom',
  displayAlwaysOn: false,
  playbackMode: 'once',
  chunking: {
    activePlaylistId: null,
    currentChunkIndex: 0,
    lastChunkPosition: 0,
    currentTrackIndex: null,
    mode: 'heartbeat',
    sizeMinutes: 3
  },
  visibility: {
    audioLayers: true,
    appControl: true,
    navigation: {
      library: true,
      search: true,
      player: true,
      mode: true
    }
  },
  globalModes: {
    pitchSafeMode: false,
    backgroundMode: false,
    masterAudioEnabled: true,
    syncLabEnabled: true
  },
  defaultHzProfileId: null,
  sleepTimer: {
    isEnabled: false,
    minutes: 30,
    remainingSeconds: null
  },
  alwaysLoopMain: false,
  hzAutoScaling: true,
  sessionState: {
    isPlaying: false,
    lastActiveAt: Date.now(),
  },
  versionHistory: APP_HISTORY
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hzProfiles, setHzProfiles] = useState<HzProfile[]>([]);

  // Load from Storage (Priority: localStorage for speed, IndexedDB for reliability)
  useEffect(() => {
    async function load() {
      // Load Hz Profiles from IDB
      const profiles = await db.getHzProfiles();
      setHzProfiles(profiles);

      // Try localStorage first
      const local = localStorage.getItem('subliminal_settings_v3');
      let currentSettings = { ...DEFAULT_SETTINGS };
      
      if (local) {
        try {
          const parsed = JSON.parse(local);
          // Deep-ish merge to ensure defaults for new fields are preserved
          currentSettings = { 
            ...DEFAULT_SETTINGS, 
            ...parsed,
            advancedAudio: {
               ...DEFAULT_SETTINGS.advancedAudio,
               ...(parsed.advancedAudio || {}),
               calmControl: { ...DEFAULT_SETTINGS.advancedAudio.calmControl, ...(parsed.advancedAudio?.calmControl || {}) },
               stabilityEngine: { ...DEFAULT_SETTINGS.advancedAudio.stabilityEngine, ...(parsed.advancedAudio?.stabilityEngine || {}) },
               selfHeal: { ...DEFAULT_SETTINGS.advancedAudio.selfHeal, ...(parsed.advancedAudio?.selfHeal || {}) }
            },
            appIntelligence: { ...DEFAULT_SETTINGS.appIntelligence, ...(parsed.appIntelligence || {}) },
            versionHistory: APP_HISTORY 
          };
        } catch (e) {
          console.warn('[Settings] LocalStorage corruption, falling back to IDB');
        }
      }

      // Check IDB as source of truth/backup
      const saved = await db.getSettings();
      if (saved) {
        currentSettings = { 
          ...DEFAULT_SETTINGS, 
          ...saved,
          advancedAudio: {
             ...DEFAULT_SETTINGS.advancedAudio,
             ...saved.advancedAudio,
             calmControl: { ...DEFAULT_SETTINGS.advancedAudio.calmControl, ...saved.advancedAudio.calmControl },
             stabilityEngine: { ...DEFAULT_SETTINGS.advancedAudio.stabilityEngine, ...saved.advancedAudio.stabilityEngine },
             selfHeal: { ...DEFAULT_SETTINGS.advancedAudio.selfHeal, ...saved.advancedAudio.selfHeal }
          },
          appIntelligence: { ...DEFAULT_SETTINGS.appIntelligence, ...saved.appIntelligence },
          versionHistory: APP_HISTORY 
        };
      }

      // --- Layer Registry Reconciliation & Migration ---
      const layers = { ...(currentSettings.layers || {}) };
      let migrated = false;

      Object.entries(AUDIO_LAYER_REGISTRY).forEach(([id, registryEntry]) => {
        if (!layers[id]) {
          // Check for legacy field migration
          const legacyField = (currentSettings as any)[id];
          if (legacyField && typeof legacyField === 'object') {
            layers[id] = { ...legacyField, version: registryEntry.version };
            migrated = true;
          } else {
            // New layer or missing defaults
            layers[id] = {
              isEnabled: false,
              volume: 0.3,
              gainDb: -12,
              frequency: registryEntry.defaultHz,
              version: registryEntry.version,
              playInBackground: false,
              normalize: false,
              pitchSafeMode: false,
              bufferMode: 'single',
              spatial: DEFAULT_SPATIAL
            };
          }
        } else {
          // Layer exists, check for version change / migration
          if (layers[id].version !== registryEntry.version) {
            layers[id].version = registryEntry.version;
            // Future migration logic can go here
          }
        }
      });

      currentSettings.layers = layers;
      if (migrated) {
        localStorage.setItem('subliminal_settings_v3', JSON.stringify(currentSettings));
        db.saveSettings(currentSettings);
      }
      // ------------------------------------------------

      // Apply default profile if exists on app start
      if (currentSettings.defaultHzProfileId) {
        const defaultProfile = profiles.find(p => p.id === currentSettings.defaultHzProfileId);
        if (defaultProfile) {
          const { values } = defaultProfile;
          currentSettings = {
            ...currentSettings,
            binaural: { ...currentSettings.binaural, leftFreq: values.binauralLeft, rightFreq: values.binauralRight },
            pureHz: { ...currentSettings.pureHz, frequency: values.pureHz },
            isochronic: { ...currentSettings.isochronic, frequency: values.isochronic },
            solfeggio: { ...currentSettings.solfeggio, frequency: values.solfeggio },
            schumann: { ...currentSettings.schumann, frequency: values.schumann },
            nature: { ...currentSettings.nature, frequency: values.nature },
            noise: { ...currentSettings.noise, frequency: values.noise },
            didgeridoo: { ...currentSettings.didgeridoo, frequency: values.didgeridoo },
            shamanic: { ...currentSettings.shamanic, frequency: values.shamanic },
            mentalToughness: { ...currentSettings.mentalToughness, frequency: values.mentalToughness },
            dualMode: { ...currentSettings.dualMode, frequency: values.dualMode },
            syncLab: { ...currentSettings.syncLab, masterHz: values.masterHz }
          };
        }
      }

      setSettings(currentSettings);
    }
    load();
  }, []);

  // Save to Storage
  useEffect(() => {
    // Aggressive dual storage to prevent data loss on iPhone 8
    localStorage.setItem('subliminal_settings_v3', JSON.stringify(settings));
    db.saveSettings(settings);
  }, [settings]);

  // Theme support
  useEffect(() => {
    const applyTheme = () => {
      const { theme, followSystem, darkModeStyle } = settings.appearance;
      let targetTheme = theme;

      if (followSystem) {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        targetTheme = isDark ? 'dark' : 'light';
      }

      if (targetTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', darkModeStyle);
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    };

    applyTheme();

    if (settings.appearance.followSystem) {
      const matcher = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      matcher.addEventListener('change', listener);
      return () => matcher.removeEventListener('change', listener);
    }
  }, [settings.appearance]);

  const refreshHzProfiles = useCallback(async () => {
    const profiles = await db.getHzProfiles();
    setHzProfiles(profiles);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      // Broadcast settings update
      window.dispatchEvent(new CustomEvent('settings:update', { detail: updated }));
      return updated;
    });
  }, []);

  const saveHzProfile = useCallback(async (name: string, values?: HzProfileValues, isDefault: boolean = false) => {
    // Clamp values 1-1900 Hz helper
    const clamp = (v: number) => Math.min(1900, Math.max(1, v));

    const currentValues: HzProfileValues = values ? {
      binauralLeft: clamp(values.binauralLeft),
      binauralRight: clamp(values.binauralRight),
      pureHz: clamp(values.pureHz),
      isochronic: clamp(values.isochronic),
      solfeggio: clamp(values.solfeggio),
      schumann: clamp(values.schumann),
      nature: clamp(values.nature),
      noise: clamp(values.noise),
      didgeridoo: clamp(values.didgeridoo),
      shamanic: clamp(values.shamanic),
      mentalToughness: clamp(values.mentalToughness),
      dualMode: clamp(values.dualMode),
      masterHz: clamp(values.masterHz)
    } : {
      binauralLeft: clamp(settings.binaural.leftFreq),
      binauralRight: clamp(settings.binaural.rightFreq),
      pureHz: clamp(settings.pureHz.frequency),
      isochronic: clamp(settings.isochronic.frequency),
      solfeggio: clamp(settings.solfeggio.frequency),
      schumann: clamp(settings.schumann.frequency),
      nature: clamp(settings.nature.frequency),
      noise: clamp(settings.noise.frequency),
      didgeridoo: clamp(settings.didgeridoo.frequency),
      shamanic: clamp(settings.shamanic.frequency),
      mentalToughness: clamp(settings.mentalToughness.frequency),
      dualMode: clamp(settings.dualMode.frequency),
      masterHz: clamp(settings.syncLab.masterHz),
      mainAudio: clamp(settings.mainAudio.frequency)
    };

    const newProfile: HzProfile = {
      id: uuidv4(),
      name,
      values: currentValues,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDefault
    };

    await db.saveHzProfile(newProfile);
    if (isDefault) {
      updateSettings({ defaultHzProfileId: newProfile.id });
    }
    await refreshHzProfiles();
  }, [settings, refreshHzProfiles, updateSettings]);

  const deleteHzProfile = useCallback(async (id: string) => {
    await db.deleteHzProfile(id);
    if (settings.defaultHzProfileId === id) {
      updateSettings({ defaultHzProfileId: null });
    }
    await refreshHzProfiles();
  }, [settings.defaultHzProfileId, refreshHzProfiles, updateSettings]);

  const updateHzProfile = useCallback(async (id: string, updates: Partial<HzProfile>) => {
    const existing = hzProfiles.find(p => p.id === id);
    if (!existing) return;

    const updated = { ...existing, ...updates, updatedAt: Date.now() };
    await db.saveHzProfile(updated);

    if (updates.isDefault) {
      updateSettings({ defaultHzProfileId: id });
    } else if (updates.isDefault === false && settings.defaultHzProfileId === id) {
      updateSettings({ defaultHzProfileId: null });
    }

    await refreshHzProfiles();
  }, [hzProfiles, settings.defaultHzProfileId, refreshHzProfiles, updateSettings]);

  const applyHzProfile = useCallback((profile: HzProfile) => {
    const { values } = profile;
    
    // Clamp values 1-1900 Hz helper
    const clamp = (v: number) => Math.min(1900, Math.max(1, v));

    setSettings(prev => {
      const newLayers = { ...prev.layers };
      
      // Update legacy fields
      const updatedLegacy = {
        ...prev,
        defaultHzProfileId: profile.id,
        binaural: { 
          ...prev.binaural, 
          leftFreq: clamp(values.binauralLeft), 
          rightFreq: clamp(values.binauralRight) 
        },
        pureHz: { ...prev.pureHz, frequency: clamp(values.pureHz) },
        isochronic: { ...prev.isochronic, frequency: clamp(values.isochronic) },
        solfeggio: { ...prev.solfeggio, frequency: clamp(values.solfeggio) },
        schumann: { ...prev.schumann, frequency: clamp(values.schumann) },
        nature: { ...prev.nature, frequency: clamp(values.nature) },
        noise: { ...prev.noise, frequency: clamp(values.noise) },
        didgeridoo: { ...prev.didgeridoo, frequency: clamp(values.didgeridoo) },
        shamanic: { ...prev.shamanic, frequency: clamp(values.shamanic) },
        mentalToughness: { ...prev.mentalToughness, frequency: clamp(values.mentalToughness) },
        dualMode: { ...prev.dualMode, frequency: clamp(values.dualMode) },
        syncLab: { ...prev.syncLab, masterHz: clamp(values.masterHz) },
        mainAudio: { ...prev.mainAudio, frequency: values.mainAudio ? clamp(values.mainAudio) : prev.mainAudio.frequency }
      };

      // Sync layers Record (The new Authority)
      if (values.layers) {
        Object.keys(values.layers).forEach(id => {
          if (newLayers[id]) {
            newLayers[id] = { ...newLayers[id], frequency: clamp(values.layers![id]) };
          }
        });
      }

      // Ensure special cases in layers record are also updated from legacy fields if they didn't exist in values.layers
      if (newLayers.binaural) {
        newLayers.binaural = {
          ...newLayers.binaural,
          leftFreq: clamp(values.binauralLeft),
          rightFreq: clamp(values.binauralRight)
        };
      }
      
      // Map other core frequencies to layers record
      const registryIds = Object.keys(AUDIO_LAYER_REGISTRY);
      registryIds.forEach(id => {
        if (id === 'binaural') return;
        const valKey = id === 'didgeridoo' ? 'didgeridoo' : id === 'shamanic' ? 'shamanic' : id;
        const freq = (values as any)[valKey];
        if (freq !== undefined && newLayers[id]) {
          newLayers[id] = { ...newLayers[id], frequency: clamp(freq) };
        }
      });

      return {
        ...updatedLegacy,
        layers: newLayers
      };
    });

    // Broadcast HZ update
    window.dispatchEvent(new CustomEvent('hz:update', { 
      detail: { 
        profileId: profile.id, 
        values: values,
        timestamp: Date.now()
      } 
    }));
    
    console.log(`[SettingsContext] Applied Hz Profile: ${profile.name}`);
  }, []);

  const updateSubliminalSettings = useCallback((newSub: Partial<AppSettings['subliminal']>) => {
    setSettings(prev => ({ ...prev, subliminal: { ...prev.subliminal, ...newSub } }));
  }, []);

  const updateBinauralSettings = useCallback((newBin: Partial<AppSettings['binaural']>) => {
    setSettings(prev => ({ ...prev, binaural: { ...prev.binaural, ...newBin } }));
  }, []);

  const updateNatureSettings = useCallback((newNat: Partial<AppSettings['nature']>) => {
    setSettings(prev => ({ ...prev, nature: { ...prev.nature, ...newNat } }));
  }, []);

  const updateNoiseSettings = useCallback((newNoi: Partial<AppSettings['noise']>) => {
    setSettings(prev => ({ ...prev, noise: { ...prev.noise, ...newNoi } }));
  }, []);

  const updateDidgeridooSettings = useCallback((newDid: Partial<AppSettings['didgeridoo']>) => {
    setSettings(prev => ({ ...prev, didgeridoo: { ...prev.didgeridoo, ...newDid } }));
  }, []);
  
  const updateShamanicSettings = useCallback((newSha: Partial<AppSettings['shamanic']>) => {
    setSettings(prev => ({ ...prev, shamanic: { ...prev.shamanic, ...newSha } }));
  }, []);

  const updatePureHzSettings = useCallback((newHz: Partial<AppSettings['pureHz']>) => {
    setSettings(prev => ({ ...prev, pureHz: { ...prev.pureHz, ...newHz } }));
  }, []);

  const updateIsochronicSettings = useCallback((newIso: Partial<AppSettings['isochronic']>) => {
    setSettings(prev => ({ ...prev, isochronic: { ...prev.isochronic, ...newIso } }));
  }, []);

  const updateSolfeggioSettings = useCallback((newSol: Partial<AppSettings['solfeggio']>) => {
    setSettings(prev => ({ ...prev, solfeggio: { ...prev.solfeggio, ...newSol } }));
  }, []);

  const updateSchumannSettings = useCallback((newSch: Partial<AppSettings['schumann']>) => {
    setSettings(prev => ({ ...prev, schumann: { ...prev.schumann, ...newSch } }));
  }, []);

  const updateMainAudioSettings = useCallback((newMain: Partial<AppSettings['mainAudio']>) => {
    setSettings(prev => ({ ...prev, mainAudio: { ...prev.mainAudio, ...newMain } }));
  }, []);

  const updateMentalToughnessSettings = useCallback((newMT: Partial<AppSettings['mentalToughness']>) => {
    setSettings(prev => ({ ...prev, mentalToughness: { ...prev.mentalToughness, ...newMT } }));
  }, []);
  
  const updateDualModeSettings = useCallback((newDual: Partial<AppSettings['dualMode']>) => {
    setSettings(prev => ({ ...prev, dualMode: { ...prev.dualMode, ...newDual } }));
  }, []);
  
  const updateSyncLabSettings = useCallback((newSync: Partial<AppSettings['syncLab']>) => {
    setSettings(prev => ({ ...prev, syncLab: { ...prev.syncLab, ...newSync } }));
  }, []);

  const updateLibrarySettings = useCallback((newLib: Partial<AppSettings['library']>) => {
    setSettings(prev => ({ ...prev, library: { ...prev.library, ...newLib } }));
  }, []);

  const updateAppearanceSettings = useCallback((newApp: Partial<AppSettings['appearance']>) => {
    setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, ...newApp } }));
  }, []);

  const updateVisibilitySettings = useCallback((newVisibility: Partial<AppSettings['visibility']>) => {
    setSettings(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        ...newVisibility,
        navigation: {
          ...prev.visibility.navigation,
          ...(newVisibility.navigation || {})
        }
      }
    }));
  }, []);

  const updateGlobalModes = useCallback((newModes: Partial<AppSettings['globalModes']>) => {
    setSettings(prev => {
      const updated = { ...prev, globalModes: { ...prev.globalModes, ...newModes } };
      // Broadcast modes update
      window.dispatchEvent(new CustomEvent('modes:update', { detail: updated.globalModes }));
      return updated;
    });
  }, []);

  const updateAdvancedAudioSettings = useCallback((newAdv: Partial<AppSettings['advancedAudio']>) => {
    setSettings(prev => ({
      ...prev,
      advancedAudio: {
        ...prev.advancedAudio,
        ...newAdv,
      }
    }));
  }, []);

  const updateAutoOrganizerSettings = useCallback((newSettings: Partial<AppSettings['autoOrganizer']>) => {
    setSettings(prev => ({ ...prev, autoOrganizer: { ...prev.autoOrganizer, ...newSettings } }));
  }, []);

  const updateHistoryOperations = useCallback((newOps: Partial<AppSettings['historyOperations']>) => {
    setSettings(prev => ({ ...prev, historyOperations: { ...prev.historyOperations, ...newOps } }));
  }, []);

  const trackFeatureUsage = useCallback((featureId: string) => {
    setSettings(prev => {
      const stats = { ...prev.intelligenceStats };
      if (!stats.features[featureId]) return prev;

      const feature = { ...stats.features[featureId] };
      feature.usageCount = {
        day: feature.usageCount.day + 1,
        week: feature.usageCount.week + 1,
        month: feature.usageCount.month + 1,
        total: feature.usageCount.total + 1,
      };
      feature.lastUsedAt = Date.now();

      return {
        ...prev,
        intelligenceStats: {
          ...stats,
          features: {
            ...stats.features,
            [featureId]: feature
          }
        }
      };
    });
  }, []);

  const updateAudioTools = useCallback((newTools: Partial<AppSettings['audioTools']>) => {
    setSettings(prev => ({ ...prev, audioTools: { ...prev.audioTools, ...newTools } }));
  }, []);

  const updateAppIntelligence = useCallback((newAI: Partial<AppSettings['appIntelligence']>) => {
    setSettings(prev => ({ ...prev, appIntelligence: { ...prev.appIntelligence, ...newAI } }));
  }, []);

  const updateLayer = useCallback((id: string, updates: any) => {
    setSettings(prev => {
      const currentLayer = prev.layers[id] || {};
      const newLayers = {
        ...prev.layers,
        [id]: { ...currentLayer, ...updates }
      };
      
      const newSettings = { ...prev, layers: newLayers };
      
      // Update legacy field if it exists for backward compatibility
      if ((prev as any)[id] !== undefined) {
         (newSettings as any)[id] = { ...(prev as any)[id], ...updates };
      }
      
      return newSettings;
    });
  }, []);

  const updateSleepTimer = useCallback((newSleep: Partial<AppSettings['sleepTimer']>) => {
    setSettings(prev => ({ ...prev, sleepTimer: { ...prev.sleepTimer, ...newSleep } }));
  }, []);

  const updateSessionState = useCallback((newSession: Partial<AppSettings['sessionState']>) => {
    setSettings(prev => ({ ...prev, sessionState: { ...prev.sessionState, ...newSession } }));
  }, []);

  const updateSafeIdleSettings = useCallback((newSafeIdle: Partial<AppSettings['safeIdle']>) => {
    setSettings(prev => ({ ...prev, safeIdle: { ...prev.safeIdle, ...newSafeIdle } }));
  }, []);

  const resetUISettings = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        uiMode: window.innerWidth < 400 ? 'mini' : 'pro'
      },
      hiddenLayersPosition: 'bottom',
      menuPosition: 'bottom',
      bigTouchMode: false,
      animationStyle: 'slide-up',
      hzInputMode: 'slider',
    }));
  }, []);

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      updateSubliminalSettings,
      updateBinauralSettings,
      updateNatureSettings,
      updateNoiseSettings,
      updateDidgeridooSettings,
      updateShamanicSettings,
      updatePureHzSettings,
      updateIsochronicSettings,
      updateSolfeggioSettings,
      updateSchumannSettings,
      updateMainAudioSettings,
      updateMentalToughnessSettings,
      updateDualModeSettings,
      updateSyncLabSettings,
      updateLibrarySettings,
      updateAppearanceSettings,
      updateVisibilitySettings,
      updateGlobalModes,
      updateAdvancedAudioSettings,
      updateAutoOrganizerSettings,
      updateHistoryOperations,
      trackFeatureUsage,
      updateAudioTools,
      updateAppIntelligence,
      updateLayer,
      updateSleepTimer,
      updateSessionState,
      updateSafeIdleSettings,
      resetUISettings,
      hzProfiles,
      refreshHzProfiles,
      saveHzProfile,
      deleteHzProfile,
      updateHzProfile,
      applyHzProfile
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
