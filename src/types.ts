export interface Track {
  id: string;
  name: string;
  url: string;
  artist?: string;
  artwork?: string;
  createdAt: number;
  lastPlayedAt?: number;
  isMissing?: boolean;
  duration?: number;
}

export interface SpatialSettings {
  pan: number; // -1 to 1
  depth: number; // 0 (near) to 1 (far)
  width: number; // 0 (mono) to 1 (wide)
  elevation: number; // -1 (low) to 1 (high)
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

export type SortOption = 'date' | 'alphabetical' | 'recent';
export type GroupOption = 'none' | 'day' | 'week' | 'month' | 'alphabetical' | 'minutes' | 'numbers';
export type AnimationStyle = 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'random' | 'off';
export type HzInputMode = 'slider' | 'picker' | 'manual';
export type BufferMode = 'single' | 'double';
export type UIMode = 'mini' | 'pro';

export interface SubliminalSettings {
  isEnabled: boolean;
  selectedTrackId: string | null;
  volume: number; // 0 to 0.3
  isLooping: boolean;
  delayMs: number;
  isPlaylistMode: boolean;
  sourcePlaylistId: string | null;
  gainDb: number;
  normalize: boolean;
  playInBackground: boolean;
  spatial: SpatialSettings;
}

export interface BinauralSettings {
  isEnabled: boolean;
  leftFreq: number;
  rightFreq: number;
  volume: number;
  gainDb: number;
  normalize: boolean;
  playInBackground: boolean;
  pitchSafeMode: boolean;
  bufferMode: BufferMode;
  spatial: SpatialSettings;
}

export interface NatureSettings {
  isEnabled: boolean;
  type: 'rain' | 'ocean' | 'forest' | 'wind' | 'fire' | 'stream' | 'none';
  volume: number;
  gainDb: number;
  frequency: number;
  pitchSafeMode: boolean;
  normalize: boolean;
  playInBackground: boolean;
  bufferMode: BufferMode;
  spatial: SpatialSettings;
}

export interface NoiseSettings {
  isEnabled: boolean;
  type: 'white' | 'pink' | 'brown' | 'none';
  volume: number;
  gainDb: number;
  frequency: number;
  pitchSafeMode: boolean;
  normalize: boolean;
  playInBackground: boolean;
  bufferMode: BufferMode;
  spatial: SpatialSettings;
}

export interface PhysicalSoundSettings {
  roomSize: 'small' | 'medium' | 'large' | 'cave';
  wallResonance: 'off' | 'low' | 'medium' | 'high';
  materialTexture: 'thin_wood' | 'empty_wood' | 'solid_wall' | 'open_space';
  resonanceDepth: number; // 0 to 1
  echoTailLength: number; // 0 to 1
  bangingIntensity?: 'soft' | 'medium' | 'hard'; // For Mental Toughness + Drumming
}

export interface DidgeridooSettings {
  isEnabled: boolean;
  volume: number;
  gainDb: number;
  playbackRate: number;
  frequency: number;
  depth: number;
  isLooping: boolean;
  normalize: boolean;
  playInBackground: boolean;
  pitchSafeMode: boolean;
  bufferMode: BufferMode;
  physical?: PhysicalSoundSettings;
  spatial: SpatialSettings;
}

export interface PureHzSettings {
  isEnabled: boolean;
  frequency: number;
  volume: number;
  isLooping: boolean;
  gainDb: number;
  normalize: boolean;
  playInBackground: boolean;
  pitchSafeMode: boolean;
  bufferMode: BufferMode;
  spatial: SpatialSettings;
}

export interface IsochronicSettings {
  isEnabled: boolean;
  frequency: number;
  pulseRate: number;
  volume: number;
  gainDb: number;
  normalize: boolean;
  playInBackground: boolean;
  pitchSafeMode: boolean;
  bufferMode: BufferMode;
  spatial: SpatialSettings;
}

export interface SolfeggioSettings {
  isEnabled: boolean;
  frequency: number;
  volume: number;
  gainDb: number;
  normalize: boolean;
  playInBackground: boolean;
  pitchSafeMode: boolean;
  bufferMode: BufferMode;
  spatial: SpatialSettings;
}

export interface SchumannSettings {
  isEnabled: boolean;
  frequency: number;
  volume: number;
  gainDb: number;
  normalize: boolean;
  playInBackground: boolean;
  pitchSafeMode: boolean;
  bufferMode: BufferMode;
  spatial: SpatialSettings;
}

export interface AudioTools {
  gainDb: number;
  normalizeTargetDb: number | null;
  playInBackground: boolean;
  masterVolume: number; // Main Audio Volume Fix
}

export interface PlaylistMemory {
  trackId: string;
  position: number;
  timestamp: number;
}

export interface VersionEntry {
  version: string;
  date: string;
  changes: {
    added?: string[];
    improved?: string[];
    fixed?: string[];
  };
}

export type Theme = 'light' | 'dark';
export type DarkModeStyle = 'soft-purple' | 'soft-blue';

export interface ShamanicSettings {
  isEnabled: boolean;
  volume: number;
  gainDb: number;
  frequency: number; // Pitch/Tone of drum
  depth: number; // Resonance/Intensity
  playbackRate: number; // Tempo/Speed
  interval: number; // Hit spacing in seconds: 10, 20, 30, 40, 50
  isLooping: boolean;
  normalize: boolean;
  playInBackground: boolean;
  pitchSafeMode: boolean;
  bufferMode: BufferMode;
  physical?: PhysicalSoundSettings;
  spatial: SpatialSettings;
}

export interface MentalToughnessSettings {
  isEnabled: boolean;
  volume: number;
  gainDb: number;
  pitch: 'soft' | 'hard' | 'loud' | 'low';
  texture: 'empty_wood' | 'thin_wood' | 'double_thin' | 'hollow_wood' | 'tribal_wood';
  intensity: 'light' | 'medium' | 'strong' | 'deep';
  playbackRate: number; // Tempo/Speed
  frequency: number; // Hz Depth
  interval: number; // Hit spacing in seconds: 10, 20, 30, 40, 50
  isLooping: boolean;
  normalize: boolean;
  playInBackground: boolean;
  pitchSafeMode: boolean;
  bufferMode: BufferMode;
  physical?: PhysicalSoundSettings;
  spatial: SpatialSettings;
}

export interface DualModeSettings {
  isEnabled: boolean;
  volume: number;
  gainDb: number;
  tempo: number; // 0.1 to 2.0
  intensity: number; // 0.1 to 2.0
  texture: 'wood' | 'hollow' | 'cave';
  mixBalance: number; // 0 (Drone) to 1 (Drum)
  frequency: number; // Hz Base
  isLooping: boolean;
  normalize: boolean;
  playInBackground: boolean;
  pitchSafeMode: boolean;
  bufferMode: BufferMode;
  physical?: PhysicalSoundSettings;
  spatial: SpatialSettings;
}

export interface SyncLabSettings {
  linkMode: boolean;
  masterHz: number;
}

export interface SelfHealSettings {
  isEnabled: boolean;
  mainAudio: boolean;
  volume: boolean;
  background: boolean;
}

export interface AppIntelligenceSettings {
  isEnabled: boolean;
  buildFixEngine: boolean;
  configStabilizer: boolean;
  pathResolver: boolean;
  routingGuard: boolean;
  swSafeMode: boolean;
  runtimeCrashShield: boolean;
  reactRulesEnforcer: boolean;
  assetRepair: boolean;
  iosStabilityMode: boolean;
  validationEngine: boolean;
}

export interface AdvancedAudioIntelligence {
  calmControl: {
    isEnabled: boolean;
    silenceRecovery: {
      isEnabled: boolean;
      sensitivity: 'low' | 'medium' | 'high';
      retryDelayMs: number;
    };
    layerPriority: {
      isEnabled: boolean;
      order: string[];
      balanceStrength: number;
    };
    timeAutomation: {
      isEnabled: boolean;
      steps: { time: number; type: string; value: any }[];
      smoothTransitions: boolean;
    };
    safeListening: {
      isEnabled: boolean;
      maxVolumeCap: number;
      harshSoftening: number;
    };
  };
  stabilityEngine: {
    isEnabled: boolean;
    sessionMemory: {
      isEnabled: boolean;
      autoRestore: boolean;
    };
    loopVariations: {
      isEnabled: boolean;
      intensity: 'low' | 'medium' | 'high';
    };
    driftProtection: {
      isEnabled: boolean;
      mode: 'strict' | 'soft';
    };
    emergencyRecovery: {
      isEnabled: boolean;
      speed: 'fast' | 'safe';
    };
    spatialEngine: {
      isEnabled: boolean;
      layers: Record<string, SpatialSettings>;
    };
    sessionContinuity: {
      isEnabled: boolean;
      lastSavedAt: number | null;
    };
    heatmapInsights: {
      isEnabled: boolean;
      history: Record<string, { duration: number; usage: string[] }>;
    };
    lowPowerMode: {
      isEnabled: boolean;
      autoMode: boolean;
    };
    interruptShield: {
      isEnabled: boolean;
      sensitivity: 'low' | 'med' | 'high';
    };
  };
  selfHeal: SelfHealSettings;
}

export interface HzProfileValues {
  binauralLeft: number;
  binauralRight: number;
  pureHz: number;
  isochronic: number;
  solfeggio: number;
  schumann: number;
  nature: number;
  noise: number;
  didgeridoo: number;
  shamanic: number;
  mentalToughness: number;
  dualMode: number;
  masterHz: number;
  mainAudio?: number;
  layers?: Record<string, number>;
}

export interface HzProfile {
  id: string;
  name: string;
  values: HzProfileValues;
  createdAt: number;
  updatedAt: number;
  isDefault?: boolean;
}

export interface SafeIdleSettings {
  isEnabled: boolean;
  volume: number; // Near zero
}

export interface FeatureUsageStats {
  id: string;
  name: string;
  group: 1 | 2;
  usageCount: {
    day: number;
    week: number;
    month: number;
    total: number;
  };
  lastUsedAt: number | null;
}

export interface IntelligenceUsageStats {
  features: Record<string, FeatureUsageStats>;
}

export interface PlacementDecision {
  featureId: string;
  featureName: string;
  featureType: 'audio' | 'ui' | 'playback' | 'sync' | 'analytics';
  targetGroup: string;
  reason: string;
  timestamp: number;
}

export interface AutoOrganizerSettings {
  isEnabled: boolean;
  decisions: PlacementDecision[];
  customGroups: Record<string, string[]>; // groupId -> featureIds
}

export interface MainAudioSettings {
  volume: number;
  gainDb: number;
  frequency: number;
  isEnabled: boolean; // For consistency
  spatial: SpatialSettings;
}

export interface LayerRegistryEntry {
  id: string;
  name: string;
  group: 'core' | 'ambient' | 'hz' | 'special';
  icon: string;
  color: string;
  defaultHz: number;
  description: string;
  version: string;
}

export type AudioLayerRegistry = Record<string, LayerRegistryEntry>;

export interface AppSettings {
  version: string;
  versionTimestamp: string;
  // Registry-driven dynamic layers state
  layers: Record<string, any>; 
  subliminal: SubliminalSettings;
  binaural: BinauralSettings;
  nature: NatureSettings;
  noise: NoiseSettings;
  didgeridoo: DidgeridooSettings;
  shamanic: ShamanicSettings;
  mentalToughness: MentalToughnessSettings;
  dualMode: DualModeSettings;
  pureHz: PureHzSettings;
  isochronic: IsochronicSettings;
  solfeggio: SolfeggioSettings;
  schumann: SchumannSettings;
  safeIdle: SafeIdleSettings;
  syncLab: SyncLabSettings;
  audioTools: AudioTools;
  mainAudio: MainAudioSettings;
  playbackRate: number;
  fadeInOut: boolean;
  syncPlayback: boolean;
  advancedAudio: AdvancedAudioIntelligence;
  appIntelligence: AppIntelligenceSettings;
  intelligenceStats: IntelligenceUsageStats;
  autoOrganizer: AutoOrganizerSettings;
  historyOperations: {
    lastExportAt: number | null;
    lastImportAt: number | null;
  };
  library: {
    sort: SortOption;
    group: GroupOption;
    groupByMinutes: boolean;
  };
  appearance: {
    theme: Theme;
    followSystem: boolean;
    darkModeStyle: DarkModeStyle;
    uiMode: UIMode;
  };
  hiddenLayersPosition: 'top' | 'bottom';
  loop: 'none' | 'one' | 'all';
  shuffle: boolean;
  playlistMemory: Record<string, PlaylistMemory>;
  menuPosition: 'top' | 'bottom';
  bigTouchMode: boolean;
  animationStyle: AnimationStyle;
  hzInputMode: HzInputMode;
  subliminalExpanded: boolean;
  showArtwork: boolean;
  alwaysHideArtworkByDefault: boolean;
  backButtonPosition: 'top' | 'bottom';
  libraryControlsPosition: 'top' | 'bottom';
  displayAlwaysOn: boolean;
  playbackMode: 'once' | 'loop';
  chunking: {
    activePlaylistId: string | null;
    currentChunkIndex: number;
    lastChunkPosition: number;
    currentTrackIndex: number | null;
    mode: 'heartbeat' | 'merge';
    sizeMinutes: number;
  };
  visibility: {
    audioLayers: boolean;
    appControl: boolean;
    navigation: {
      library: boolean;
      search: boolean;
      player: boolean;
      mode: boolean;
    };
  };
  globalModes: {
    pitchSafeMode: boolean;
    backgroundMode: boolean;
    masterAudioEnabled: boolean;
    syncLabEnabled: boolean;
  };
  defaultHzProfileId?: string | null;
  sleepTimer: {
    isEnabled: boolean;
    minutes: number;
    remainingSeconds: number | null;
  };
  alwaysLoopMain: boolean;
  hzAutoScaling: boolean;
  sessionState: {
    isPlaying: boolean;
    lastActiveAt: number;
  };
  versionHistory: VersionEntry[];
}
