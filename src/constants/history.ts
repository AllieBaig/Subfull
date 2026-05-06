import { VersionEntry } from '../types';

export const APP_HISTORY: VersionEntry[] = [
  {
    version: '2.4.4',
    date: '2026-05-06',
    changes: {
      added: [
        'Hybrid Ultra-Safe Service Worker: Unified sw.js with internal iOS Safe Mode detection',
        'Strict Audio Bypass: Guaranteed direct network fetch for all media requests (bypasses SW)',
        'Platform-Aware Caching: iOS uses minimal shell caching; others use full stale-while-revalidate',
        'PWA Standalone Support: Enhanced manifest and registration for reliable home screen launch'
      ],
      improved: [
        'Service Worker Stability: Prevented blank screens and crash loops on iPhone 8/iOS 16',
        'Cache Versioning: Safe versioned purging of old caches during activation'
      ],
      fixed: [
        'Potential audio interruption issues caused by Service Worker interception on Safari'
      ]
    }
  },
  {
    version: '2.4.3',
    date: '2026-05-06',
    changes: {
      added: [
        'Hybrid Audio Layers UI: Restored old immersive full-page layout with nested intelligence',
        'Timestamped Exports: Filenames and JSON payloads now include ISO/Local timestamps',
        'Nested IQ Sections: Hz, Spatial, Physics, and Sync controls now collapsible-by-default',
        'Immersive Vertical Flow: Edge-to-edge volume and gain sliders for iPhone 8 precision'
      ],
      improved: [
        'UI Performance: Lightweight DOM patching for smooth transitions on iOS 16',
        'Feature Stability: Guaranteed retention of Background Mode and Pitch Safe states',
        'Clutter Reduction: Replaced boxed cards with soft dividers and paper backgrounds'
      ],
      fixed: [
        'Binding loss issues during major UI structural transitions',
        'History export naming conflicts via unique date/time strings'
      ]
    }
  },
  {
    version: '2.4.2',
    date: '2024-06-03',
    changes: {
      added: [
        'Dual Mode Layer: 13th Independent Engine – Didgeridoo + Shamanic Drumming',
        'Procedural Synthesis: Unified soundscape with continuous drone and rhythmic hits',
        'Mix Balance Control: Dynamic cross-fading between Didgeridoo and Drum engines',
        'Resonance Textures: Wood, Hollow, and Cave acoustic modeling',
        'Tempo & Intensity: Independent control of drumming pace and impact strength'
      ],
      improved: [
        'Frequency Resonance: Hz input now shapes both drone pitch and drum harmonic resonance',
        'Seamless Looping: Double-buffered HTML5 <audio> engine for gapless background play',
        'iOS 16 Reliability: High-stability background playback for iPhone 8 devices'
      ]
    }
  },
  {
    version: '2.4.1',
    date: '2024-06-02',
    changes: {
      added: [
        'Pitch Safe Mode Plus: Soft filter + low gain + fade + ambient bed (Synthetic)',
        'App Intelligence: Full suite of self-heal toggles (Build, Config, Path, Routing, iOS)',
        'Battery Monitor: Integrated battery level tracking for Low Power Mode auto-switching'
      ],
      improved: [
        'iOS 16 Heartbeat: 8s interval silent recovery loop to prevent background suspension',
        'Master Volume Slider: Real-time output control added to Audio Tools panel',
        'UI Safety: Optimized modal and input behavior for iPhone 8 / iOS 16'
      ],
      fixed: [
        'Binaural & Didgeridoo Pitch Safe logic inconsistencies',
        'Main audio suspension in deep background on iOS 16',
        'Missing imports for App Intelligence specific icons'
      ]
    }
  },
  {
    version: '2.4.0',
    date: '2024-06-01',
    changes: {
      added: [
        'Master Volume Control: Unified gain stage for real-time output adjustment',
        'Pitch Safe Mode Plus: Dynamic softening of harsh frequencies (200-1900 Hz)',
        'Ambient Bed Integration: Softer tones and ambient loops for safe listening',
        'Live Hz Status: Active frequency display for Mental Toughness training',
        'Deep App Intelligence: Self-heal toggles for build, path, and runtime safety'
      ],
      improved: [
        'Volume Accuracy: gain = layer × master × dBGain (precise logarithmic scale)',
        'iOS 16 Background Stability: Enhanced heartbeat and layer restart logic',
        'Version History Persistence: Append-only logs with export timestamps'
      ],
      fixed: [
        'Main audio volume resets on older iPhone 8 devices',
        'Silent layer suspension during long background sessions',
        'Hz profile sync gaps between settings and playback panels'
      ]
    }
  },
  {
    version: '2.3.3',
    date: '2024-05-31',
    changes: {
      added: [
        'App Intelligence Engine: Centralized self-healing system for core app stability',
        'Stability Group (Settings): Configurable toggles for background repair engines',
        'Runtime Crash Shield: Proactive monitoring to prevent fatal UI regressions',
        'Build Fix & Path Resolvers: Automated integrity checks for assets and imports',
        'iOS 16 Stability Mode: Tiered optimization for iPhone 8 and legacy processors'
      ],
      improved: [
        'Settings UI Layout: Minimalist, nested collapsible groups for advanced control',
        'Self-Healing Logic: Silent, event-driven background checks without UI blocking',
        'Service Worker Safe Mode: Enhanced network resilience for flaky connections'
      ],
      fixed: [
        'Occasional blank screen during rapid background-to-foreground switching',
        'Settings state merge issues during first-launch on specific iOS versions',
        'Memory leak in long-running sessions triggered by heavy visual processing'
      ]
    }
  },
  {
    version: '2.3.2',
    date: '2024-05-30',
    changes: {
      added: [
        'Hz Profile Management: comprehensive management for user-defined frequency presets',
        'JSON Import/Export: seamless migration of Hz profiles across devices',
        'Global Modes Broadcast: real-time system-wide sync for mode updates and profile switches',
        'Enhanced Toast System: dynamic contextual feedback for all Hz profile operations'
      ],
      improved: [
        'Playback & Control Integration: Hz profiles now available in all critical playback panels',
        'Decimals Support in Hz Inputs: manual tuning now supports fractional frequencies',
        'iPhone 8 Stability: optimized sync loops to prevent UI lag during state transitions'
      ],
      fixed: [
        'Hz profiles working only in Main Settings; now fully accessible in Now Playing and Panels',
        'Sync issues between System Modes and Global App State',
        'Numeric pattern bug preventing decimal entry in manual Hz tuning'
      ]
    }
  },
  {
    version: '2.3.1',
    date: '2024-05-29',
    changes: {
      added: [
        'Harden Service Worker (Level 3): Absolute zero-interception for audio streams',
        'Explicit Native Forwarding: Service Worker now forces direct fetch for all media',
        'Stable Audio Persistence: Fixed-element architecture for iPhone 8 / iOS 16',
        'Aggressive "Touch-to-Unlock" Engine: Instant multi-layer activation on first tap',
        'Dedicated Background Heartbeat: Advanced silent cycle to prevent process sleep'
      ],
      improved: [
        'Seamless Gapless Logic: Double-buffered transitions for all background layers',
        'Live Parameter Injection: Volume and dB changes apply without audio restarts',
        'iOS 16 Stability Hierarchy: Enhanced visibility-aware health management',
        'Optimized needsWebAudio Logic: Improved background resilience on old devices'
      ],
      fixed: [
        'Service Worker interception causing range-request failures on Safari',
        'Missing runHealthCheck references in main initialization effect',
        'Hz layers occasional dropout during background-to-foreground transitions'
      ]
    }
  },
  {
    version: '2.3.0',
    date: '2024-05-28',
    changes: {
      added: [
        'Hardened Audio Intelligence System: Unified management for 12+ stability features',
        'Emergency Session Restore: Auto-recovery of playback position after unexpected interruptions',
        'Self-Healing Health Layer: Continuous state monitoring and silent background repair',
        'Ambient Interrupt Shield: Protection against iOS background suspension and silent hijacking',
        'Advanced Spatial Layer Depth Engine: Nested controls for all 12 audio layers',
        '3D Positioning Simulation: Realistic Pan, Depth, Width, and Elevation processing'
      ],
      improved: [
        'Priority-Based Conflict Resolver: Smart arbitration between Safe Listening and Level Automation',
        'iPhone 8 Performance Guard: Adaptive CPU load throttling and power-safe logic',
        'Throttled Intelligence Loop: 450ms steady-state pulse for maximum battery efficiency',
        'Lightweight Audio Architecture: Optimized for iPhone 8 and iOS 16 background safety'
      ],
      fixed: [
        'Main audio "Silent Freeze" on iOS 16 resume',
        'Value drift and harsh spikes via global parameter clamping',
        'Background suspension issues on long sessions'
      ]
    }
  },
  {
    version: '2.2.0',
    date: '2024-05-27',
    changes: {
      added: [
        'Ultra-Low Power Mode: Throttled engine & auto-activation (<30% battery)',
        'Ambient Interrupt Shield: Smart volume compensation for environmental noise',
        'Battery-aware stability throttling for iPhone 8 / iOS 16'
      ],
      improved: [
        'Adaptive Stability Engine: Enhanced health interval management',
        'Safety Guard: Capped volume boost for interrupt protection'
      ],
      fixed: [
        'Audio stalling during heavy background CPU load on older devices',
        'Immediate playback recovery after sudden environment interruptions'
      ]
    }
  },
  {
    version: '2.1.0',
    date: '2024-05-26',
    changes: {
      added: [
        'Self Heal Audio Intelligence System (iOS 16 Optimized)',
        'Full Audio State Snapshots: Export/Restore Vols, Hz, & Layers',
        'Persistent volume state recovery engine',
        'Background "Silent Recovery" for interrupted iOS sessions'
      ],
      improved: [
        'Stability Engine: Real-time volume integrity monitoring',
        'Emergency Recovery: Faster detection of frozen playback',
        'Import/Export: Expanded support for full system snapshots'
      ],
      fixed: [
        'Audio volume resets after application closure or background suspension',
        'Background audio cracking during main playback on iPhone 8',
        'Silent stalls during long-duration background sessions'
      ]
    }
  },
  {
    version: '2.0.0',
    date: '2024-05-25',
    changes: {
      added: [
        'Selectable Time Intervals (10s-50s) for Shamanic & Mental Toughness layers',
        'Nested Hz Frequency UI: Collapsible settings panel for all audio layers',
        'Triple Hz Input Modes: Integrated Slider, iOS Picker, and Manual Keypad',
        'Enhanced Mental Toughness title with live Hz frequency display'
      ],
      improved: [
        'Dynamic interval timing: Instant application without audio restart',
        'UI de-cluttering: Compact layer cards with expandable tuning controls',
        'Input Mode persistence: Remembers preferred Hz adjustment method',
        'Clamped Hz safety: All inputs strictly bound to 1-1900 Hz range'
      ],
      fixed: [
        'Layout thrashing on iPhone 8 during high-frequency Hz adjustments',
        'Background timer stability for rhythmic audio pulse spacing',
        'Numeric keypad dismissal behavior on iOS 16'
      ]
    }
  },
  {
    version: '1.9.6',
    date: '2024-05-24',
    changes: {
      added: [
        'Semantic Color System: Standardized text and background tokens',
        'System-Wide Contrast Audit: Verified accessibility in all themes',
        'Theme-Aware Interactive States: New system-pressed state'
      ],
      improved: [
        'Refined Soft Dark & Light themes for iOS 16 aesthetics',
        'Elimination of hardcoded HEX/RGB colors in UI surfaces',
        'Consistent Apple-native label hierarchy (Primary, Secondary, Tertiary)'
      ],
      fixed: [
        'Color inconsistency in complex audio layer UI',
        'Low-contrast text issues in specific themed states',
        'Background color leakage in scrollable area transitions'
      ]
    }
  },
  {
    version: '1.9.5',
    date: '2024-05-24',
    changes: {
      added: [
        'Structural Context Audit: Verified all 5+ context provider chains',
        'Global Hook Safety Guard (App.tsx Hierarchy Fix)',
        'Reference integrity check for ChunkManager & AudioEngine'
      ],
      improved: [
        'Provider Nesting: PlaybackProvider now correctly wraps AudioProvider',
        'Circular Dependency Elimination in high-frequency state updates',
        'Memory-safe rendering lifecycle for background audio components'
      ],
      fixed: [
        'usePlayback hook error when accessed from AudioProvider',
        'Redundant state re-renders in AppContent lifecycle',
        'Potential crash on startup due to improper provider initialization order'
      ]
    }
  },
  {
    version: '1.9.4',
    date: '2024-05-24',
    changes: {
      added: [
        'Build-time environment safety guards for main entry point',
        'Headless SSR compatibility for PWA assets',
        'Vercel & Netlify optimized SPA deployment configuration'
      ],
      improved: [
        'Robust browser API guarding (window, document, navigator) during build/analysis',
        'Module resolution stability across case-sensitive file systems',
        'Deployment-ready PWA manifest and service worker output'
      ],
      fixed: [
        'Vite syntax errors during production bundling on Linux environments',
        'Top-level execution bugs in non-browser Node.js sessions',
        'Unresolved module path warnings for dynamic imports'
      ]
    }
  },
  {
    version: '1.9.3',
    date: '2024-05-24',
    changes: {
      added: [
        'Hybrid PWA System with dynamic platform detection',
        'iOS Safe Mode: Stability-first minimal Service Worker',
        'Full PWA Mode: Comprehensive caching for Android/Desktop',
        'Multi-Worker architecture (sw-core-minimal.js vs sw-full-pwa.js)'
      ],
      improved: [
        'Intelligent Service Worker selection based on iOS heuristics',
        'Deployment compatibility: Reliable routing on Vercel, Netlify, and GitHub Pages',
        'Strict split between stability-critical iOS and performance-first platforms'
      ],
      fixed: [
        'Safari PWA standalone white-screens on iPhone 8 / iOS 16',
        'Navigation response delays in network-constrained environments',
        'Service Worker lifecycle conflicts on multiple platform-specific reloads'
      ]
    }
  },
  {
    version: '1.9.2',
    date: '2024-05-24',
    changes: {
      added: [
        'Minimal Core Service Worker (sw-core-minimal.js)',
        'Explicit Native Audio Bypass Level 2 (Absolute isolation)',
        'Lightweight "Shell-Only" caching strategy'
      ],
      improved: [
        'Zero-interference for iOS Native Audio Engine',
        'Safari PWA standalone startup duration',
        'Service Worker memory footprint on iPhone 8'
      ],
      fixed: [
        'Intermittent audio dropouts caused by cache interception',
        'iOS 16 background process termination loops',
        'Service Worker "Heal Cache" redundant cycles'
      ]
    }
  },
  {
    version: '1.9.1',
    date: '2024-05-24',
    changes: {
      added: [
        'Advanced iOS 16 Heartbeat (Silent Looping WAV)',
        'Root-level Audio Element Persistence (Attached to DOM)',
        'iOS 16 Gapless Buffer Mode (Double-Buffering for Layers)'
      ],
      improved: [
        'Total Service Worker Audio Bypass (Zero-Interference for Safari)',
        'Aggressive "First Tap" Unlock for all audio layers',
        'Safari PWA background stability improvements'
      ],
      fixed: [
        'Audio freeze/stop on screen lock (iPhone 8 / iOS 16)',
        'Web Audio suspension in background',
        'Audio engine restarts on volume/dB change'
      ]
    }
  },
  {
    version: '1.9.0',
    date: '2024-05-24',
    changes: {
      added: [
        'Enhanced SPA Routing Support (Relative Pathing)',
        'Service Worker "Safe Mode" Navigation Fallback',
        'Multi-Host compatibility (GitHub Pages, Vercel, Netlify)'
      ],
      improved: [
        'Instant offline boot via reliable index.html cache injection',
        'Safari PWA standalone stability on legacy iOS versions',
        'Stale-While-Revalidate asset caching for ultra-fast load'
      ],
      fixed: [
        'Blank screen on Safari PWA startup',
        'Navigation failures in nested GitHub Pages subfolders',
        'Redundant Cloudflare-specific routing overhead removed'
      ]
    }
  },
  {
    version: '1.8.9',
    date: '2024-05-24',
    changes: {
      added: [
        'Advanced Navigation Safety for iOS Safari PWA stability',
        'Cache-First SPA boot strategy for instant offline startup',
        'Versioned cache management (v19) with automatic purge'
      ],
      improved: [
        'Audio bypass logic: SW now completely ignores audio streams',
        'Navigation robustness: Guaranteed index.html return',
        'Service Worker reliability on network-constrained devices'
      ],
      fixed: [
        'Safari "offline error" screens of death in PWA mode',
        'Redirected response caching bugs that caused blank screens',
        'Blocking recovery UI screens removed in favor of silent self-healing'
      ]
    }
  },
  {
    version: '1.8.8',
    date: '2024-05-24',
    changes: {
      added: [
        'Dedicated PlaybackContext for decoupled state isolation',
        'High-frequency UI subscription model (subscribeToUpdates)',
        'GPU-optimized targeted DOM updates for playback time'
      ],
      improved: [
        'Massive reduction in global app re-renders during playback',
        'UI stability for modals and inputs on iPhone 8 / iOS 16',
        'Throttled time updates (300ms) for enhanced performance',
        'Strict separation of Concerns: UIState vs PlaybackState'
      ],
      fixed: [
        'Panel closure and input reset bugs during track progress',
        'CPU overhead from redundant state updates in AudioContext'
      ]
    }
  },
  {
    version: '1.8.7',
    date: '2024-05-24',
    changes: {
      added: [
        '“Always Loop Main Audio” toggle for continuous playback',
        'Master Reference Level (Hz Auto-Scaling) system',
        'Audio Control & Safety optimization panel'
      ],
      improved: [
        'Hz layer balance when main audio is paused/stopped',
        'Gapless loop reliability for single tracks',
        'Audio safety clamping to prevent volume spikes'
      ],
      fixed: [
        'Standalone Hz loudness spikes during main audio transitions'
      ]
    }
  },
  {
    version: '1.8.6',
    date: '2024-05-24',
    changes: {
      added: [
        '“None” option for Nature Ambience and Noise Colors',
        'Pure Hz-Only mode for ambient layers (high-clarity frequency focus)'
      ],
      improved: [
        'Hz frequency audibility when base ambient layer is disabled',
        'Audio engine efficiency for standalone Hz playback',
        'UI feedback for Hz-Only active states'
      ],
      fixed: [
        'Dependency on ambient loops for frequency layer activation'
      ]
    }
  },
  {
    version: '1.8.5',
    date: '2024-05-24',
    changes: {
      added: [
        '3-Minute stable chunk size for Merge Playlist (iPhone 8 optimization)',
        'Automatic stability fallback for legacy devices'
      ],
      improved: [
        'Merge Engine reliability on iOS 16',
        'Memory-optimized audio buffer rendering for sequential chunks',
        'Chunk rendering retry logic for corrupted buffers'
      ],
      fixed: [
        'Merged playback stalls on iPhone 8 / iOS 16',
        'Gapless transition failures during high-memory periods'
      ]
    }
  },
  {
    version: '1.8.4',
    date: '2024-05-24',
    changes: {
      added: [
        'High-stability numeric entry for Hz values',
        'iOS 16 Keyboard focus locking for iPhone 8'
      ],
      improved: [
        'Uncontrolled input architecture for frequency editing',
        'Component lifecycle optimization in Hz Profiles'
      ],
      fixed: [
        'Numeric keypad dropping after first digit on iOS',
        'Unwanted re-renders during text entry'
      ]
    }
  },
  {
    version: '1.8.3',
    date: '2024-05-24',
    changes: {
      added: [
        'Apple-style mini status indicator (Online/Offline)',
        'Network state tooltip on status dot interaction'
      ],
      improved: [
        'GPU-optimized opacity transitions for iPhone 8',
        'Zero layout-shift network monitoring'
      ]
    }
  },
  {
    version: '1.8.2',
    date: '2024-05-24',
    changes: {
      added: [
        'Safe Idle (iOS Heartbeat) stabilizer for background idle',
        'Time-Based Automation Steps editor (Volume/Hz triggers)',
        'AI Node placement rules reconnection',
        'Adaptive Depth Node logic binding'
      ],
      improved: [
        'Audio Engine stability on iOS 16 (iPhone 8 legacy fix)',
        'Intelligence Dashboard state persistence',
        'Service Worker fetch rules exclusion for blobs'
      ],
      fixed: [
        'Orphan feature logic for Time Automation',
        'Heartbeat volume control disconnect',
        'Auto-Organizer UI rule visual feedback'
      ]
    }
  },
  {
    version: '1.8.1',
    date: '2026-05-03',
    changes: {
      added: [
        'Universal Heatmap Tracking for all 12 Parallel Layers',
        'Advanced Recovery Logic for Background Hz Layers (iOS 16)',
        'Enhanced Feature Intelligence Predictor in Auto Organizer'
      ],
      improved: [
        'Improved self-heal timing for frozen audio states on iPhone 8',
        'Optimized parallel audio mix stabilization with safety clipping'
      ]
    }
  },
  {
    version: '1.8.0',
    date: '2026-05-03',
    changes: {
      added: [
        'Advanced Self-Heal Engine for Main Audio (iOS 16 Optimized)',
        'Reactive Stall Detection and Auto-Recovery for iPhone 8',
        'Hardware Buffer Unlocking on first user interaction'
      ],
      improved: [
        'Enhanced background persistence during app suspension',
        'Refined readyState validation for stable track transitions',
        'Optimized Heartbeat logic to prevent iOS audio process sleep'
      ]
    }
  },
  {
    version: '1.7.0',
    date: '2026-05-03',
    changes: {
      added: [
        'Version History Import & Export system',
        'JSON and TXT export support for update logs',
        'Safe merge logic for history imports (Append-only)',
        'Import/Export status tracking with timestamps'
      ],
      improved: [
        'Organized Version History UI with nested tools',
        'Lightweight file parsing for iPhone 8 stability'
      ]
    }
  },
  {
    version: '1.6.0',
    date: '2026-05-03',
    changes: {
      added: [
        'Spatial Layer Depth Engine for 3D positioning',
        'Invisible Session Continuity (State Sync persistence)',
        'Session Heatmap Insights and usage visualization'
      ],
      improved: [
        'Stability Engine integration with Continuity logic',
        'Lightweight tracking for older iOS devices'
      ]
    }
  },
  {
    version: '1.5.0',
    date: '2026-05-03',
    changes: {
      added: [
        'Auto Feature Organizer for intelligent UI scaling',
        'Feature Intelligence placement logic and decision log',
        'Usage Intelligence Dashboard for Audio Intelligence',
        'Feature usage tracking and analytics dashboard',
        'Safe Idle Engine for iOS stability',
        'Automatic audio engine heartbeat when layers are off',
        'Stability Engine emergency recovery protocols'
      ],
      improved: [
        'Advanced Audio Intelligence sorting and filtering',
        'iPhone 8 + iOS 16 UI stability during state transitions',
        'Hz input precision and keyboard behavior'
      ],
      fixed: [
        'UI crash/blank screen when all audio layers are deactivated',
        'Engine collapse on state zero'
      ]
    }
  },
  {
    version: '1.4.0',
    date: '2026-04-22',
    changes: {
      added: [
        'Playback & Control hidden layer in Player',
        'Intelligent Sleep Timer with live countdown',
        'Display Always ON (Wake Lock) support',
        'Dedicated Playback settings section'
      ],
      improved: [
        'Organized settings hierarchy',
        'Adaptive Loop Mode toggles (Single/Playlist)',
        'Screen wake management for uninterrupted sessions'
      ]
    }
  },
  {
    version: '1.3.1',
    date: '2026-04-22',
    changes: {
      added: [
        'Full Apple Native Semantic Color System implementation',
        'Adaptive UI backgrounds (SystemBackground & SecondarySystemBackground)',
        'Refined Soft Dark variants with higher contrast'
      ],
      improved: [
        'Text visibility and accessibility across all themes',
        'Multi-select import stability for large file batches',
        'Icon and control visibility in MiniPlayer & TabBar'
      ],
      fixed: [
        'Color inconsistency in playback controls during theme switch'
      ]
    }
  },
  {
    version: '1.3.0',
    date: '2026-04-22',
    changes: {
      added: [
        'Adaptive Theme System (Light, Dark, System)',
        'Soft Dark Mode styles (Soft Purple & Soft Blue)',
        'Appearance management section in settings'
      ],
      improved: [
        'Color consistency across all UI components',
        'Smooth theme transitions'
      ]
    }
  },
  {
    version: '1.2.0',
    date: '2026-04-22',
    changes: {
      added: [
        'Dynamic App Version History system',
        'Automatic version incrementing logic',
        'Expandable update log UI in settings'
      ],
      improved: [
        'System initialization sequence for PWA stability',
        'Metadata persistence across updates'
      ]
    }
  },
  {
    version: '1.1.0',
    date: '2026-04-21',
    changes: {
      added: [
        'Offline-first PWA conversion',
        'IndexedDB persistent storage for absolute offline reliability',
        'Service Worker with Cache-First strategy',
        'Standalone mode support'
      ],
      improved: [
        'Fast load from cache',
        'Offline Mode UI indicator (floating pill)',
        'Import flow stabilization'
      ]
    }
  },
  {
    version: '1.0.5',
    date: '2026-04-21',
    changes: {
      added: [
        'Smart Grouping by minutes/numbers',
        'Group-level multi-selection in library',
        'Selection count indicator'
      ],
      fixed: [
        'Race condition in multi-file imports',
        'Playlist scroll behavior overlap issue'
      ]
    }
  }
];

export const CURRENT_VERSION = APP_HISTORY[0].version;
