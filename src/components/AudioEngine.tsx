import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useAudio } from '../AudioContext';
import { usePlayback } from '../PlaybackContext';
import { useSettings } from '../SettingsContext';
import { AUDIO_LAYER_REGISTRY } from '../constants/layers';
import { useUIState } from '../UIStateContext';
import { NATURE_SOUNDS } from '../constants';
import { ChunkManager } from '../utils/ChunkManager';
import SafetyChecker from '../utils/SafetyChecker';
import * as db from '../db';

interface SpatialNodes {
  panner: StereoPannerNode;
  depthFilter: BiquadFilterNode;
  elevationFilter: BiquadFilterNode;
  depthGain: GainNode;
  widthL: GainNode;
  widthR: GainNode;
  widthXL: GainNode;
  widthXR: GainNode;
  input: GainNode;
  output: GainNode;
}

export default function AudioEngine() {
  const { 
    tracks, 
    subliminalTracks, 
    currentTrackIndex, 
    setCurrentTrackIndex,
    isPlaying, 
    playlists,
    setIsPlaying,
    playNext,
    playPrevious,
    seekTo,
    currentPlaybackList,
    playingPlaylistId,
    getTrackUrl,
    revokeTrackUrl,
    checkTrackPlayable,
    healSystem,
    seekRequest,
    clearSeekRequest
  } = useAudio();

  const { currentTime, setCurrentTime, setDuration, updateLayerProgress, layerProgress } = usePlayback();
  const { 
    settings, 
    updateSettings, 
    updateAudioTools, 
    updateSyncLabSettings, 
    updateMainAudioSettings, 
    updateMentalToughnessSettings 
  } = useSettings();

  const hasAnyLayerEnabled = useMemo(() => {
    return settings.subliminal.isEnabled || 
           settings.binaural.isEnabled || 
           settings.nature.isEnabled || 
           settings.noise.isEnabled || 
           settings.didgeridoo.isEnabled || 
           settings.pureHz.isEnabled || 
           settings.isochronic.isEnabled || 
           settings.solfeggio.isEnabled ||
           settings.schumann.isEnabled ||
           settings.shamanic.isEnabled ||
           settings.mentalToughness.isEnabled ||
           settings.dualMode.isEnabled;
  }, [
    settings.subliminal.isEnabled,
    settings.binaural.isEnabled,
    settings.nature.isEnabled,
    settings.noise.isEnabled,
    settings.didgeridoo.isEnabled,
    settings.pureHz.isEnabled,
    settings.isochronic.isEnabled,
    settings.solfeggio.isEnabled,
    settings.schumann.isEnabled,
    settings.shamanic.isEnabled,
    settings.mentalToughness.isEnabled,
    settings.dualMode.isEnabled
  ]);

  const [isRenderingChunk, setIsRenderingChunk] = useState(false);
  // Detect Foreground/Background
  const [isForeground, setIsForeground] = useState(typeof document !== 'undefined' ? document.visibilityState === 'visible' : true);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibility = () => setIsForeground(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const { isLoading, showToast, isOffline, navigateTo, activeTabRequest, clearTabRequest } = useUIState();

  useEffect(() => {
    const s = settings;
    if (!s.globalModes.masterAudioEnabled) {
      (window as any).isZenAudioPlaying = false;
      return;
    }
    
    let active = isPlaying;
    const globalBg = s.globalModes.backgroundMode;
    
    if (s.subliminal.isEnabled && (isPlaying || globalBg || s.subliminal.playInBackground)) active = true;
    if (s.binaural.isEnabled && (isPlaying || globalBg || s.binaural.playInBackground)) active = true;
    if (s.nature.isEnabled && (isPlaying || globalBg || s.nature.playInBackground)) active = true;
    if (s.noise.isEnabled && (isPlaying || globalBg || s.noise.playInBackground)) active = true;
    if (s.didgeridoo.isEnabled && (isPlaying || globalBg || s.didgeridoo.playInBackground)) active = true;
    if (s.pureHz.isEnabled && (isPlaying || globalBg || s.pureHz.playInBackground)) active = true;
    if (s.isochronic.isEnabled && (isPlaying || globalBg || s.isochronic.playInBackground)) active = true;
    if (s.solfeggio.isEnabled && (isPlaying || globalBg || s.solfeggio.playInBackground)) active = true;
    if (s.schumann.isEnabled && (isPlaying || globalBg || s.schumann.playInBackground)) active = true;
    if (s.shamanic.isEnabled && (isPlaying || globalBg || s.shamanic.playInBackground)) active = true;
    if (s.mentalToughness.isEnabled && (isPlaying || globalBg || s.mentalToughness.playInBackground)) active = true;
    if (s.dualMode.isEnabled && (isPlaying || globalBg || s.dualMode.playInBackground)) active = true;
    (window as any).isZenAudioPlaying = active;
  }, [
    isPlaying, 
    settings.globalModes,
    settings.subliminal.isEnabled, settings.subliminal.playInBackground,
    settings.binaural.isEnabled, settings.binaural.playInBackground,
    settings.nature.isEnabled, settings.nature.playInBackground,
    settings.noise.isEnabled, settings.noise.playInBackground,
    settings.didgeridoo.isEnabled, settings.didgeridoo.playInBackground,
    settings.pureHz.isEnabled, settings.pureHz.playInBackground,
    settings.isochronic.isEnabled, settings.isochronic.playInBackground,
    settings.solfeggio.isEnabled, settings.solfeggio.playInBackground,
    settings.schumann.isEnabled, settings.schumann.playInBackground,
    settings.shamanic.isEnabled, settings.shamanic.playInBackground,
    settings.mentalToughness.isEnabled, settings.mentalToughness.playInBackground,
    settings.dualMode.isEnabled, settings.dualMode.playInBackground
  ]);

  const currentTrack = currentTrackIndex !== null ? currentPlaybackList[currentTrackIndex] : null;

  // Callback Refs for stable listeners
  const playNextRef = useRef(playNext);
  const playPreviousRef = useRef(playPrevious);
  const isPlayingRef = useRef(isPlaying);
  const currentTrackRef = useRef(currentTrack);
  const settingsRef = useRef(settings);
  const currentPlaybackListRef = useRef(currentPlaybackList);

  useEffect(() => { playNextRef.current = playNext; }, [playNext]);
  useEffect(() => { playPreviousRef.current = playPrevious; }, [playPrevious]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { currentPlaybackListRef.current = currentPlaybackList; }, [currentPlaybackList]);
  
  // Safety: Runtime health monitor
  const lastHealthCheck = useRef<number>(Date.now());
  const playStateAnomalies = useRef<number>(0);
  const lastKnownTime = useRef<number>(0);
  const stallCount = useRef<Record<string, number>>({});

  const lastContinuitySave = useRef<number>(0);
  
  // Battery Monitoring for Ultra-Low Power Mode
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level);
        const update = () => setBatteryLevel(battery.level);
        battery.addEventListener('levelchange', update);
        return () => battery.removeEventListener('levelchange', update);
      }).catch(() => {});
    }
  }, []);

  const isActuallyInLowPowerMode = useMemo(() => {
    const lpm = settings.advancedAudio?.stabilityEngine?.lowPowerMode;
    if (!lpm || !lpm.isEnabled) return false;
    if (lpm.autoMode && batteryLevel !== null && batteryLevel < 0.3) return true;
    return lpm.isEnabled;
  }, [settings.advancedAudio?.stabilityEngine?.lowPowerMode, batteryLevel]);

  const [shieldBoostdB, setShieldBoostdB] = useState(0);

  // Soft Heal for specific elements without resetting everything (Optimized for iOS 16)
  const softHealElement = async (audio: HTMLAudioElement | null, type: 'main' | 'hz' | 'heartbeat', layerId?: string) => {
    if (!audio) return;
    console.warn(`[Self-Heal] Starting recovery for ${type} layer...`);
    
    try {
      const currentPos = audio.currentTime;
      const wasPlaying = !audio.paused || isPlayingRef.current;
      
      if (type === 'main' && currentTrackRef.current) {
        // Safe Reset: Clear -> Re-bind -> Load
        audio.pause();
        audio.removeAttribute('src'); // Forcing clean state
        audio.load();

        const freshUrl = await getTrackUrl(currentTrackRef.current.id, true);
        if (freshUrl) {
          audio.src = freshUrl;
          audio.load();
          
          // Wait for metadata/buffer to be ready (iOS 16 requirement)
          return new Promise<void>((resolve) => {
            const onReady = () => {
              audio.removeEventListener('canplay', onReady);
              audio.currentTime = currentPos;
              if (wasPlaying) {
                audio.play().catch(e => console.warn("[Self-Heal] Play blocked after re-bind:", e));
              }
              resolve();
            };
            
            if (audio.readyState >= 2) onReady();
            else audio.addEventListener('canplay', onReady);
            
            // Timeout safety
            setTimeout(resolve, 3000);
          });
        }
      } else if (type === 'heartbeat') {
        audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAP8A/wD/";
        audio.load();
        audio.play().catch(() => {});
      } else if (type === 'hz' && layerId) {
        // Safe Reset for Background Hz Layers
        console.warn(`[Self-Heal] Re-initializing Hz layer: ${layerId}`);
        audio.pause();
        audio.currentTime = 0; // Reset stuck buffer
        
        try {
          // If we have a cached URL, re-apply it to force refresh the media pipeline
          const cachedUrl = bgAudioUrls.current[layerId];
          if (cachedUrl) {
            audio.src = cachedUrl;
            audio.load();
          }
          
          return new Promise<void>((resolve) => {
            const onReady = () => {
              audio.removeEventListener('canplay', onReady);
              audio.play().catch(e => console.warn(`[Self-Heal] ${layerId} play blocked:`, e));
              resolve();
            };
            audio.addEventListener('canplay', onReady);
            setTimeout(resolve, 2000);
          });
        } catch (e) {
          audio.load();
          audio.play().catch(() => {});
        }
      }
    } catch (e) {
      console.error(`[Self-Heal] Recovery failed:`, e);
    }
  };

  // Unified Safe Play Wrapper
  const safePlay = async (audio: HTMLAudioElement | null, context: string) => {
    if (!SafetyChecker.validateAudioElement(audio, context)) return;
    try {
      await audio!.play();
    } catch (e) {
      if (e instanceof Error && e.name === 'NotAllowedError') {
        // User interaction required - non-critical
        console.warn(`[Safety] Play blocked by browser policy (${context})`);
      } else {
        console.error(`[Safety] Play failed (${context}):`, e);
      }
    }
  };

  const chunkPlanRef = useRef<any>(null);
  const lastBgGenTime = useRef<Record<string, number>>({});
  const activeChunkIdRef = useRef<string | null>(null);
  const nextChunkIdRef = useRef<string | null>(null);
  const chunkUrlsRef = useRef<Record<string, string>>({});
  const chunkCleanupRef = useRef<Set<string>>(new Set());
  const trackOffsetsRef = useRef<{start: number, duration: number}[]>([]);
  const objectUrlRef = useRef<Set<string>>(new Set());

  const registerUrl = (url: string) => {
    if (url.startsWith('blob:')) {
      objectUrlRef.current.add(url);
    }
  };

  const cleanupUrls = () => {
    objectUrlRef.current.forEach(url => URL.revokeObjectURL(url));
    objectUrlRef.current.clear();
  };

  useEffect(() => {
    return () => cleanupUrls();
  }, []);

  // Internal Audio Element Refs (Managed by lifecycle)
  const heartbeatAudioRef = useRef<HTMLAudioElement | null>(null);

  // Update Chunk Plan when Playlist changes
  useEffect(() => {
    if (!playingPlaylistId || currentPlaybackList.length === 0) {
      chunkPlanRef.current = null;
      return;
    }

    const updatePlan = async () => {
      const plan = await ChunkManager.createChunkPlan(playingPlaylistId, currentPlaybackList, settings.chunking.sizeMinutes);
      chunkPlanRef.current = plan;
      
      // Determine current chunk and position based on currentTrackIndex
      if (currentTrackIndex !== null) {
        let cumulativeTracks = 0;
        let cumulativeDuration = 0;
        let foundIdx = 0;
        let trackStartOffset = 0;

        for (let i = 0; i < plan.chunks.length; i++) {
          const chunk = plan.chunks[i];
          let chunkDuration = 0;
          let trackFoundInThisChunk = false;
          let offsetInChunk = 0;

          for (let j = 0; j < chunk.trackIds.length; j++) {
            const trackId = chunk.trackIds[j];
            const duration = await ChunkManager.getAudioDuration(trackId);
            
            if (cumulativeTracks === currentTrackIndex) {
              trackFoundInThisChunk = true;
              trackStartOffset = offsetInChunk;
            }
            
            offsetInChunk += duration;
            chunkDuration += duration;
            cumulativeTracks++;
          }

          if (trackFoundInThisChunk) {
            foundIdx = i;
            break;
          }
        }
        
        const isSameChunk = settings.chunking.activePlaylistId === playingPlaylistId && 
                            settings.chunking.currentChunkIndex === foundIdx;

        updateSettings({
          chunking: {
            ...settings.chunking,
            activePlaylistId: playingPlaylistId,
            currentChunkIndex: foundIdx,
            lastChunkPosition: trackStartOffset,
            currentTrackIndex: currentTrackIndex
          }
        });

        // Forced seek if same chunk
        if (isSameChunk && mainAudioRef.current) {
          mainAudioRef.current.currentTime = trackStartOffset;
        }
      }
    };
    updatePlan();
  }, [playingPlaylistId, currentPlaybackList.length, currentTrackIndex]);

  // Foreground Rendering Loop
  useEffect(() => {
    if (!isForeground || !chunkPlanRef.current || isRenderingChunk) return;

    const renderNextIfNeeded = async () => {
      const plan = chunkPlanRef.current;
      const { activePlaylistId, currentChunkIndex } = settings.chunking;
      
      if (activePlaylistId !== plan.playlistId) return;

      const currentId = `chunk_${activePlaylistId}_${currentChunkIndex}`;
      const nextIdx = (currentChunkIndex + 1) >= plan.chunks.length ? (settings.playbackMode === 'loop' ? 0 : -1) : currentChunkIndex + 1;
      
      // Check if current chunk exists
      const currentMeta = await db.getChunkMetadata(currentId);
      if (!currentMeta) {
        setIsRenderingChunk(true);
        const rendered = await ChunkManager.renderChunk(
          activePlaylistId!, 
          currentChunkIndex, 
          plan.chunks[currentChunkIndex].trackIds,
          settings.mainAudio.volume,
          settings.mainAudio.gainDb,
          getEffectiveFrequency(settings.mainAudio.frequency)
        );
        if (rendered) {
          await db.saveChunk({
            id: currentId,
            playlistId: activePlaylistId!,
            index: currentChunkIndex,
            trackIds: plan.chunks[currentChunkIndex].trackIds,
            duration: rendered.duration,
            expiresAt: Date.now() + 3600000
          }, rendered.blob);
        } else {
          console.error(`[AudioEngine] Critical: Chunk rendering failed for ${currentId}. Falling back to heartbeat mode.`);
          updateSettings({ chunking: { ...settings.chunking, mode: 'heartbeat' } });
          showToast("Reverting to stable playback mode...");
        }
        setIsRenderingChunk(false);
        return;
      }

      // Pre-render next chunk
      if (nextIdx !== -1) {
        const nextId = `chunk_${activePlaylistId}_${nextIdx}`;
        const nextMeta = await db.getChunkMetadata(nextId);
        if (!nextMeta) {
          setIsRenderingChunk(true);
          const rendered = await ChunkManager.renderChunk(
            activePlaylistId!, 
            nextIdx, 
            plan.chunks[nextIdx].trackIds,
            settings.mainAudio.volume,
            settings.mainAudio.gainDb,
            getEffectiveFrequency(settings.mainAudio.frequency)
          );
          if (rendered) {
            await db.saveChunk({
              id: nextId,
              playlistId: activePlaylistId!,
              index: nextIdx,
              trackIds: plan.chunks[nextIdx].trackIds,
              duration: rendered.duration,
              expiresAt: Date.now() + 3600000
            }, rendered.blob);
          }
          setIsRenderingChunk(false);
        }
      }

      // Cleanup old chunks: Keep only current + next
      const chunksInDb = await db.getAllChunkMetadata();
      const nextId = nextIdx !== -1 ? `chunk_${activePlaylistId}_${nextIdx}` : null;
      for (const meta of chunksInDb) {
        if (meta.id !== currentId && meta.id !== nextId) {
          await db.deleteChunk(meta.id);
        }
      }
    };

    const interval = setInterval(renderNextIfNeeded, 5000);
    return () => clearInterval(interval);
  }, [isForeground, isRenderingChunk, settings.chunking, settings.playbackMode]);

  // Track current URL to revoke it later
  const lastMainUrlRef = useRef<string | null>(null);

  // Helper Functions for Sound Design
  const createReverb = (ctx: BaseAudioContext, duration: number, sampleRate: number) => {
    const reverb = ctx.createConvolver();
    const length = sampleRate * 3; // 3 second reverb
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
      const decay = Math.pow(1 - i / length, 2);
      impulseL[i] = (Math.random() * 2 - 1) * decay;
      impulseR[i] = (Math.random() * 2 - 1) * decay;
    }
    reverb.buffer = impulse;
    return reverb;
  };

  const applySoftReverbEffect = (ctx: BaseAudioContext, source: AudioNode, dest: AudioNode, options?: { isPitchSafePlus?: boolean, baseFreq?: number }) => {
    const reverb = createReverb(ctx, options?.isPitchSafePlus ? 4 : 3, ctx.sampleRate);
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    
    // Pitch Safe Plus: lower dry gain, higher reverb for softening
    dryGain.gain.setValueAtTime(options?.isPitchSafePlus ? 0.3 : 0.7, ctx.currentTime);
    wetGain.gain.setValueAtTime(options?.isPitchSafePlus ? 0.7 : 0.3, ctx.currentTime);
    
    source.connect(dryGain);
    source.connect(reverb);
    reverb.connect(wetGain);
    dryGain.connect(dest);
    wetGain.connect(dest);

    if (options?.isPitchSafePlus) {
      // Add a subtle ambient bed directly to destination
      try {
        const noise = ctx.createBufferSource();
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.01; // Extremely soft noise
        }
        noise.buffer = buffer;
        noise.loop = true;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime((options.baseFreq || 432) * 0.5, ctx.currentTime);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(dest);
        noise.start();
      } catch (e) {}
    }
  };

  const cleanupLastUrl = () => {
    if (lastMainUrlRef.current) {
      URL.revokeObjectURL(lastMainUrlRef.current);
      lastMainUrlRef.current = null;
    }
  };

  // Save chunk position periodically
  useEffect(() => {
    if (!isPlaying || !mainAudioRef.current) return;
    const interval = setInterval(() => {
      if (mainAudioRef.current) {
        updateSettings({
          chunking: {
            ...settings.chunking,
            lastChunkPosition: mainAudioRef.current.currentTime
          }
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, settings.chunking.activePlaylistId, settings.chunking.currentChunkIndex]);
  const [preparedUrl, setPreparedUrl] = useState<string | null>(null);
  const [preparedSubUrl, setPreparedSubUrl] = useState<string | null>(null);
  const mainAudioRef = useRef<HTMLAudioElement | null>(null);
  const subAudioRef = useRef<HTMLAudioElement | null>(null);
  const delayTimeoutRef = useRef<number | null>(null);
  const subPlaylistIndexRef = useRef<number>(0);
  const tracksPlayedInSessionRef = useRef<number>(0);
  const lastSkipTimeRef = useRef<number>(0);
  const skipCountRef = useRef<number>(0);

  // Binaural Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const binauralGainRef = useRef<GainNode | null>(null);

  // Spatial System
  const binauralSpatialRef = useRef<SpatialNodes | null>(null);
  const pureHzSpatialRef = useRef<SpatialNodes | null>(null);
  const isochronicSpatialRef = useRef<SpatialNodes | null>(null);
  const solfeggioSpatialRef = useRef<SpatialNodes | null>(null);
  const schumannSpatialRef = useRef<SpatialNodes | null>(null);
  const didgSpatialRef = useRef<SpatialNodes | null>(null);
  const shamanicSpatialRef = useRef<SpatialNodes | null>(null);
  const mentalSpatialRef = useRef<SpatialNodes | null>(null);
  const mainSpatialRef = useRef<SpatialNodes | null>(null);
  const subSpatialRef = useRef<SpatialNodes | null>(null);
  const natureSpatialRef = useRef<SpatialNodes | null>(null);
  const noiseSpatialRef = useRef<SpatialNodes | null>(null);
  const bgLayerSpatialRefs = useRef<Record<string, SpatialNodes>>({});

  const createSpatialNodes = (ctx: AudioContext): SpatialNodes => {
    const input = ctx.createGain();
    const output = ctx.createGain();
    
    // Depth EQ
    const depthFilter = ctx.createBiquadFilter();
    depthFilter.type = 'lowpass';
    depthFilter.frequency.setValueAtTime(20000, ctx.currentTime);
    
    // Elevation EQ
    const elevationFilter = ctx.createBiquadFilter();
    elevationFilter.type = 'highshelf';
    elevationFilter.frequency.setValueAtTime(5000, ctx.currentTime);
    
    // Pan
    const panner = ctx.createStereoPanner();
    
    // Width (Stereo Expansion / Narrowing)
    const splitter = ctx.createChannelSplitter(2);
    const merger = ctx.createChannelMerger(2);
    const widthL = ctx.createGain();
    const widthR = ctx.createGain();
    const widthXL = ctx.createGain(); // Cross-feed L to R
    const widthXR = ctx.createGain(); // Cross-feed R to L
    
    // Depth Vol
    const depthGain = ctx.createGain();
    
    // Routing
    input.connect(depthFilter);
    depthFilter.connect(elevationFilter);
    elevationFilter.connect(panner);
    
    // Width routing
    panner.connect(splitter);
    
    splitter.connect(widthL, 0); 
    widthL.connect(merger, 0, 0); // L -> L
    
    splitter.connect(widthR, 1);
    widthR.connect(merger, 0, 1); // R -> R
    
    splitter.connect(widthXL, 0);
    widthXL.connect(merger, 0, 1); // L -> R (center)
    
    splitter.connect(widthXR, 1);
    widthXR.connect(merger, 0, 0); // R -> L (center)
    
    merger.connect(depthGain);
    depthGain.connect(output);
    
    return { 
      input, output, panner, depthFilter, elevationFilter, depthGain,
      widthL, widthR, widthXL, widthXR 
    };
  };

  const updateSpatialEngine = (nodes: SpatialNodes | null, spatial: any, isLowPower: boolean) => {
    if (!nodes || !spatial) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    // 1. Pan (-1 to 1)
    nodes.panner.pan.setTargetAtTime(spatial.pan || 0, ctx.currentTime, 0.1);
    
    // 2. Depth (0 Near -> 1 Far)
    const depth = spatial.depth || 0;
    // Volume reduction for distance
    nodes.depthGain.gain.setTargetAtTime(1 - (depth * 0.5), ctx.currentTime, 0.2);
    // Clarity loss for distance (High-cut)
    const filterFreq = Math.max(3500, 20000 - (depth * 16500));
    nodes.depthFilter.frequency.setTargetAtTime(filterFreq, ctx.currentTime, 0.2);
    
    // 3. Width (0 Mono -> 1 Wide)
    const width = spatial.width !== undefined ? spatial.width : 1;
    // For wide (1.0), only direct gains are active. For mono (0.0), both cross-feeds are equal to direct.
    // L_out = L*w' + R*(1-w'), R_out = R*w' + L*(1-w') where w'=0.5 for mono, w'=1 for stereo
    const directGain = 0.5 + (width * 0.5);
    const crossGain = 0.5 - (width * 0.5);
    
    nodes.widthL.gain.setTargetAtTime(directGain, ctx.currentTime, 0.1);
    nodes.widthR.gain.setTargetAtTime(directGain, ctx.currentTime, 0.1);
    nodes.widthXL.gain.setTargetAtTime(crossGain, ctx.currentTime, 0.1);
    nodes.widthXR.gain.setTargetAtTime(crossGain, ctx.currentTime, 0.1);
    
    // 4. Elevation (-1 Low -> 1 High)
    if (!isLowPower) {
      // High-shelf tilt
      nodes.elevationFilter.gain.setTargetAtTime((spatial.elevation || 0) * 5, ctx.currentTime, 0.2);
    } else {
      nodes.elevationFilter.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    }
  };
  
  // Audio Tools Refs
  const mainSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const subSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const subSpecificGainRef = useRef<GainNode | null>(null);
  const toolGainRef = useRef<GainNode | null>(null);
  const toolCompressorRef = useRef<DynamicsCompressorNode | null>(null);

  // Noise & Nature Refs
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const natureSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const natureGainRef = useRef<GainNode | null>(null);
  const natureCompRef = useRef<DynamicsCompressorNode | null>(null);

  // Background HTML Audio Refs for iOS 16 Persistence - Double Buffered for Gapless
  const bgAudioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const bgAudioRefs2 = useRef<Record<string, HTMLAudioElement>>({});
  const activeBgRef = useRef<Record<string, 1 | 2>>({});
  const bgAudioUrls = useRef<Record<string, string>>({});
  const bgAudioParams = useRef<Record<string, string>>({});
  const bgFadeIntervals = useRef<Record<string, number>>({});

  // Helper: Simple WAV Encoder
  const audioBufferToWav = (buffer: AudioBuffer) => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const numSamples = buffer.length;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = numSamples * blockAlign;
    const headerSize = 44;
    const arrayBuffer = new ArrayBuffer(headerSize + dataSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const offset = 44;
    for (let i = 0; i < numSamples; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset + (i * blockAlign) + (channel * bytesPerSample), intSample, true);
      }
    }
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  // Helper: Generate Tone Blob
  const generateToneBlob = async (type: string, options: any) => {
    const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    let duration = type === 'shamanic' || type === 'mentalToughness' ? 10 : 30; // 10s for rhythmic loops
    
    if (options.interval && options.interval > duration) {
       duration = options.interval;
    }

    const sampleRate = 44100;
    const numChannels = type === 'binaural' ? 2 : 1;
    const ctx = new OfflineCtx(numChannels, Math.ceil(sampleRate * duration), sampleRate);
    
    const adv = settingsRef.current.advancedAudio;
    const hasLoopVariations = adv?.stabilityEngine?.loopVariations?.isEnabled;
    const variationIntensity = adv?.stabilityEngine?.loopVariations?.intensity || 'low';
    
    // Internal gain only (normalization/boosts), NOT user volume/master gain
    // This allows instant volume/toggle sync without re-rendering blobs
    const drummingBoost = (type === 'shamanic' || type === 'mentalToughness') ? 1.3 : 1.0; 
    const normalizationFactor = options.normalize ? 0.8 : 1.0;
    const finalGainValue = drummingBoost * normalizationFactor;

    const masterGainNode = ctx.createGain();
    masterGainNode.gain.setValueAtTime(finalGainValue, 0);
    masterGainNode.connect(ctx.destination);

    // Fade In/Out for seamless looping
    const applyFades = (node: GainNode) => {
      node.gain.setValueAtTime(0, 0);
      node.gain.linearRampToValueAtTime(1, 0.01); // 10ms fade in
      node.gain.setValueAtTime(1, duration - 0.01);
      node.gain.linearRampToValueAtTime(0, duration); // 10ms fade out
    };

    // Variation Helper
    const getJitter = (amount: number) => {
      if (!hasLoopVariations) return 0;
      const multi = variationIntensity === 'high' ? 3 : variationIntensity === 'medium' ? 1.5 : 0.5;
      return (Math.random() * 2 - 1) * amount * multi;
    };

    // Reverb Helper
    const applySoftReverb = (source: AudioNode, dest: AudioNode, isPitchSafePlus = false) => {
      const reverb = ctx.createConvolver();
      const length = sampleRate * (isPitchSafePlus ? 5 : 3); // Longer reverb for plus
      const impulse = ctx.createBuffer(2, length, sampleRate);
      const impulseL = impulse.getChannelData(0);
      const impulseR = impulse.getChannelData(1);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2);
        impulseL[i] = (Math.random() * 2 - 1) * decay;
        impulseR[i] = (Math.random() * 2 - 1) * decay;
      }
      reverb.buffer = impulse;
      
      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      
      // Dynamic mix for Safe Mode Plus
      dryGain.gain.setValueAtTime(isPitchSafePlus ? 0.3 : 0.7, 0);
      wetGain.gain.setValueAtTime(isPitchSafePlus ? 0.7 : 0.3, 0);
      
      source.connect(dryGain);
      source.connect(reverb);
      reverb.connect(wetGain);
      dryGain.connect(dest);
      wetGain.connect(dest);

      if (isPitchSafePlus) {
        // Add subtle low-frequency ambient bed (Maintaining base frequency feel)
        try {
          const bedOsc = ctx.createOscillator();
          const bedGain = ctx.createGain();
          bedOsc.type = 'sine';
          bedOsc.frequency.setValueAtTime((baseFreq || 432) / 2, 0);
          bedGain.gain.setValueAtTime(0.012, 0); // Very subtle
          bedOsc.connect(bedGain);
          bedGain.connect(dest);
          bedOsc.start(0);
        } catch (e) {}
      }
    };

    const isPitchRange = (freq: number) => freq >= 200 && freq <= 1900;
    const baseFreq = options.frequency || (type === 'binaural' ? (options.leftFreq + options.rightFreq) / 2 : 0);
    const frequencyValue = baseFreq + getJitter(0.01 * baseFreq); 
    const leftFreq = (options.leftFreq || 0) + getJitter(0.01 * (options.leftFreq || 0));
    const rightFreq = (options.rightFreq || 0) + getJitter(0.01 * (options.rightFreq || 0));

    const useSoftPitch = options.pitchSafeMode && isPitchRange(baseFreq);

    // Physical Sound Engine Helper
    const applyPhysicalReverb = (source: AudioNode, dest: AudioNode, phys: any) => {
      if (!phys) {
        source.connect(dest);
        return;
      }

      const { roomSize, wallResonance, materialTexture, resonanceDepth, echoTailLength } = phys;
      
      // 1. Create Impulse Response based on params
      let reverbLength = 0.5;
      switch(roomSize) {
        case 'small': reverbLength = 0.3; break;
        case 'medium': reverbLength = 1.0; break;
        case 'large': reverbLength = 2.5; break;
        case 'cave': reverbLength = 5.0; break;
      }
      reverbLength *= (0.5 + (echoTailLength || 0.5));

      const length = Math.ceil(sampleRate * reverbLength);
      const impulse = ctx.createBuffer(2, length, sampleRate);
      const impulseL = impulse.getChannelData(0);
      const impulseR = impulse.getChannelData(1);

      // 2. Texture Pre-filtering logic
      let filterFreq = 15000;
      let filterQ = 0.7;
      switch(materialTexture) {
        case 'thin_wood': filterFreq = 1800; filterQ = 4; break;
        case 'empty_wood': filterFreq = 900; filterQ = 7; break;
        case 'solid_wall': filterFreq = 5000; filterQ = 1.5; break;
        case 'open_space': filterFreq = 15000; filterQ = 0.6; break;
      }

      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 4);
        const noise = (Math.random() * 2 - 1);
        impulseL[i] = noise * decay;
        impulseR[i] = noise * decay;
      }

      const reverb = ctx.createConvolver();
      reverb.buffer = impulse;

      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      
      // Resonance Depth + Wall Resonance impact
      let resonanceMultiplier = 1.0;
      switch(wallResonance) {
        case 'off': resonanceMultiplier = 0.05; break;
        case 'low': resonanceMultiplier = 0.3; break;
        case 'medium': resonanceMultiplier = 0.7; break;
        case 'high': resonanceMultiplier = 1.1; break;
      }

      const wetAmount = 0.1 + (resonanceDepth * (options.pitchSafeMode ? 0.3 : 0.5)) * resonanceMultiplier;
      dryGain.gain.setValueAtTime(Math.max(0.1, 1.0 - wetAmount * 0.7), 0);
      wetGain.gain.setValueAtTime(wetAmount, 0);

      const textureFilter = ctx.createBiquadFilter();
      textureFilter.type = 'lowpass';
      textureFilter.frequency.setValueAtTime(filterFreq, 0);
      textureFilter.Q.setValueAtTime(filterQ, 0);

      source.connect(dryGain);
      source.connect(textureFilter);
      textureFilter.connect(reverb);
      reverb.connect(wetGain);
      
      dryGain.connect(dest);
      wetGain.connect(dest);
    };

    // Setup layer specific offline graph
    if (type === 'pureHz' || type === 'solfeggio' || type === 'schumann') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequencyValue, 0);
      
      if (useSoftPitch) {
        // Soft Meditation Formula
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(frequencyValue * 0.8, 0);
        filter.Q.setValueAtTime(1.0, 0);
        
        // Ambient Pad (Sub-harmonics for warmth)
        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(frequencyValue / 2, 0);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.15, 0);
        
        // Pink Noise Bed
        const pinkBuffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
        const pinkData = pinkBuffer.getChannelData(0);
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        for (let i = 0; i < sampleRate * duration; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3102503;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          pinkData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.01; // Very subtle
          b6 = white * 0.115926;
        }
        const pinkSource = ctx.createBufferSource();
        pinkSource.buffer = pinkBuffer;
        pinkSource.loop = true;
        
        osc.connect(filter);
        subOsc.connect(subGain);
        subGain.connect(filter);
        
        const preReverbGain = ctx.createGain();
        preReverbGain.gain.setValueAtTime(0.06, 0);
        filter.connect(preReverbGain);
        pinkSource.connect(preReverbGain);
        
        applySoftReverb(preReverbGain, gain, useSoftPitch);
        applyFades(gain);
        
        subOsc.start(0);
        pinkSource.start(0);
      } else {
        gain.gain.setValueAtTime(0.08, 0); 
        osc.connect(gain);
      }

      gain.connect(masterGainNode);
      osc.start(0);
    } 
    else if (type === 'binaural') {
      const left = ctx.createOscillator();
      const right = ctx.createOscillator();
      const merger = ctx.createChannelMerger(2);
      const gain = ctx.createGain();
      left.frequency.setValueAtTime(leftFreq, 0);
      right.frequency.setValueAtTime(rightFreq, 0);
      
      if (useSoftPitch) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(Math.min(leftFreq, rightFreq) * 0.9, 0);
        
        left.connect(merger, 0, 0);
        right.connect(merger, 0, 1);
        merger.connect(filter);
        
        const preReverbGain = ctx.createGain();
        preReverbGain.gain.setValueAtTime(0.06, 0);
        filter.connect(preReverbGain);
        
        applySoftReverb(preReverbGain, gain, useSoftPitch);
        applyFades(gain);
      } else {
        gain.gain.setValueAtTime(0.08, 0);
        left.connect(merger, 0, 0);
        right.connect(merger, 0, 1);
        merger.connect(gain);
      }

      gain.connect(masterGainNode);
      left.start(0);
      right.start(0);
    }
    else if (type === 'isochronic') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const outGain = ctx.createGain();
      const lfo = ctx.createOscillator();
      osc.frequency.setValueAtTime(frequencyValue, 0);
      lfo.type = options.pitchSafeMode ? 'sine' : 'square'; // Softer LFO if safe mode
      lfo.frequency.setValueAtTime(options.pulseRate + getJitter(0.05), 0); // Pulse jitter
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.5, 0);
      const constant = ctx.createConstantSource();
      constant.offset.setValueAtTime(0.5, 0);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      constant.connect(gain.gain);
      osc.connect(gain);
      
      if (useSoftPitch) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(options.frequency * 0.85, 0);
        gain.connect(filter);
        
        const preReverbGain = ctx.createGain();
        preReverbGain.gain.setValueAtTime(0.06, 0);
        filter.connect(preReverbGain);
        
        applySoftReverb(preReverbGain, outGain, useSoftPitch);
        applyFades(outGain);
      } else {
        outGain.gain.setValueAtTime(0.08, 0);
        gain.connect(outGain);
      }

      outGain.connect(masterGainNode);
      lfo.start(0);
      constant.start(0);
      osc.start(0);
    }
    else if (type === 'didgeridoo') {
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const outGain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      osc.type = 'sawtooth';
      sub.type = 'sine';
      osc.frequency.setValueAtTime(frequencyValue, 0);
      sub.frequency.setValueAtTime(frequencyValue, 0);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(frequencyValue * 2.7 * (1 + options.depth), 0);
      filter.Q.setValueAtTime(15, 0);
      lfo.frequency.setValueAtTime(0.15 + getJitter(0.02), 0); // Breath jitter
      lfoGain.gain.setValueAtTime(60 * options.depth, 0);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      osc.connect(filter);
      sub.connect(filter);
      
      if (options.pitchSafeMode) {
        // Didgeridoo is naturally low, but we can still soften it
        const softFilter = ctx.createBiquadFilter();
        softFilter.type = 'lowpass';
        softFilter.frequency.setValueAtTime(options.frequency * 2, 0);
        filter.connect(softFilter);
        
        const preReverbGain = ctx.createGain();
        preReverbGain.gain.setValueAtTime(0.05, 0);
        softFilter.connect(preReverbGain);
        
        applySoftReverb(preReverbGain, outGain, options.pitchSafeMode);
        applyFades(outGain);
      } else {
        outGain.gain.setValueAtTime(0.06, 0);
        
        if (options.physical) {
          applyPhysicalReverb(filter, outGain, options.physical);
        } else {
          filter.connect(outGain);
        }
      }

      outGain.connect(masterGainNode);
      lfo.start(0);
      osc.start(0);
      sub.start(0);
    }
    else if (type === 'shamanic') {
      const bpm = 120 * options.playbackRate + getJitter(0.5); // Pulse jitter
      const hitInterval = options.interval || (60 / bpm);
      const numHits = Math.floor(duration / hitInterval);
      const drumGain = ctx.createGain();
      
      for (let i = 0; i < numHits; i++) {
        const time = i * hitInterval + getJitter(0.002); // Micro-timing jitter
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'triangle';
        const startFreq = frequencyValue * (options.pitchSafeMode ? 1.3 : 1.6);
        const endFreq = frequencyValue;
        
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.05);
        
        g.gain.setValueAtTime(0, time);
        let peak = 0.55 * (1 + options.depth + getJitter(0.05)); // Velocity jitter
        const bIntensity = options.physical?.bangingIntensity;
        if (bIntensity === 'soft') peak *= 0.6;
        if (bIntensity === 'hard') peak *= 1.4;
        g.gain.linearRampToValueAtTime(peak, time + 0.005);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(options.frequency * (options.pitchSafeMode ? 2 : 4), time);
        filter.Q.setValueAtTime(2, time);
        
        osc.connect(g);
        g.connect(filter);
        filter.connect(drumGain);
        
        osc.start(time);
        osc.stop(time + 0.6);
      }

      const outGain = ctx.createGain();
      if (options.pitchSafeMode) {
        const preReverbGain = ctx.createGain();
        preReverbGain.gain.setValueAtTime(1.0, 0);
        drumGain.connect(preReverbGain);
        applySoftReverb(preReverbGain, outGain, options.pitchSafeMode);
        applyFades(outGain);
      } else {
        if (options.physical) {
          applyPhysicalReverb(drumGain, outGain, options.physical);
        } else {
          drumGain.connect(outGain);
        }
      }

      outGain.connect(masterGainNode);
    }
    else if (type === 'mentalToughness') {
      const bpm = 110 * (options.playbackRate || 1.0) + getJitter(0.5); // Pulse jitter
      const hitInterval = options.interval || (60 / bpm);
      const numHits = Math.floor(duration / hitInterval);
      const mainGain = ctx.createGain();

      for (let i = 0; i < numHits; i++) {
        const time = i * hitInterval + getJitter(0.002); // Micro-timing jitter
        
        // Human Impact: Low fundamental + Noise click
        const osc = ctx.createOscillator();
        const noise = ctx.createBufferSource();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();

        // 1. Fundamental Tone (Hz Depth Integration)
        let coreFreq = frequencyValue || 60;
        if (options.pitch === 'soft') coreFreq *= 0.8;
        if (options.pitch === 'low') coreFreq *= 0.6;
        if (options.pitch === 'hard') coreFreq *= 1.2;
        if (options.pitch === 'loud') coreFreq *= 1.4;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(coreFreq * 2, time);
        osc.frequency.exponentialRampToValueAtTime(coreFreq, time + 0.08);

        // 2. Texture Click (Noise) + Realistic Wooden Resonance
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let j = 0; j < noiseData.length; j++) noiseData[j] = Math.random() * 2 - 1;
        noise.buffer = noiseBuffer;

        f.type = 'bandpass';
        let filterFreq = 400;
        let filterQ = 5;
        let decayTime = 0.25;

        switch(options.texture) {
          case 'empty_wood':
            filterFreq = 180;
            filterQ = 14; // High resonance for deep echo
            decayTime = 0.5;
            break;
          case 'thin_wood':
            filterFreq = 850;
            filterQ = 6; // Sharper resonance
            decayTime = 0.18;
            break;
          case 'double_thin':
            filterFreq = 450;
            filterQ = 10; // Richer resonance
            decayTime = 0.35;
            break;
          case 'hollow_wood':
            filterFreq = 220;
            filterQ = 12; // Deep hollow resonance
            decayTime = 0.45;
            break;
          case 'tribal_wood':
            filterFreq = 380;
            filterQ = 8;
            decayTime = 0.3;
            break;
        }

        f.frequency.setValueAtTime(filterFreq, time);
        f.Q.setValueAtTime(filterQ, time);

        // 3. Envelope
        let peak = 0.65; // Increased peak base for Mental Toughness
        const bIntensity = options.physical?.bangingIntensity || options.intensity;
        if (bIntensity === 'soft' || options.intensity === 'light') peak *= 0.5;
        if (bIntensity === 'medium') peak *= 1.0;
        if (bIntensity === 'hard' || options.intensity === 'strong') peak *= 1.5;
        if (options.intensity === 'deep') peak *= 2.0;

        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(peak, time + 0.005);
        g.gain.exponentialRampToValueAtTime(0.001, time + (options.intensity === 'deep' ? decayTime * 1.5 : decayTime));

        osc.connect(g);
        noise.connect(f);
        f.connect(g);
        g.connect(mainGain);

        osc.start(time);
        noise.start(time);
        osc.stop(time + 0.6);
        noise.stop(time + 0.6);
      }

      applyFades(mainGain);
      
      const outGain = ctx.createGain();
      if (options.physical) {
        applyPhysicalReverb(mainGain, outGain, options.physical);
      } else {
        mainGain.connect(outGain);
      }
      outGain.connect(masterGainNode);
    }
    else if (type === 'dualMode') {
      const droneGain = ctx.createGain();
      const drumGain = ctx.createGain();
      const combined = ctx.createGain();

      // Drone (Didgeridoo side) - mixBalance: 0 (Drone) to 1 (Drum)
      const droneWeight = 1 - (options.mixBalance || 0.5);
      droneGain.gain.setValueAtTime(droneWeight * 0.7, 0);

      // Drum (Shamanic side)
      const drumWeight = options.mixBalance || 0.5;
      drumGain.gain.setValueAtTime(drumWeight * 0.8, 0);

      // --- 1. Drone Engine (Didgeridoo) ---
      const numHarmonics = 3;
      for (let j = 0; j < numHarmonics; j++) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        
        // Base freq is influenced by Hz input
        const freq = frequencyValue * (j + 1);
        osc.frequency.setValueAtTime(freq, 0);
        
        // Modulate for "breathing" effect
        osc.frequency.linearRampToValueAtTime(freq * 1.02, duration * 0.5);
        osc.frequency.linearRampToValueAtTime(freq, duration);

        g.gain.setValueAtTime((0.15 / (j + 1)), 0);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        // Resonance influenced by Hz
        filter.frequency.setValueAtTime(frequencyValue * 2, 0);
        filter.Q.setValueAtTime(4, 0);

        osc.connect(g);
        g.connect(filter);
        filter.connect(droneGain);
        osc.start(0);
      }

      // --- 2. Drum Engine (Tribal Human Rhythm) ---
      const bpm = 110 * (options.tempo || 1.0) + getJitter(0.5);
      const hitInterval = (60 / bpm) * 2; // Tribal spacing
      const numHits = Math.floor(duration / hitInterval);

      for (let i = 0; i < numHits; i++) {
        const time = i * hitInterval + getJitter(0.008);
        if (time >= duration - 0.5) break;

        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequencyValue * 1.3, time);
        osc.frequency.exponentialRampToValueAtTime(frequencyValue * 0.5 * (options.intensity || 1.0), time + 0.2);

        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(0.7 * (options.intensity || 1.0), time + 0.005);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

        f.type = 'lowpass';
        let fFreq = 700;
        switch(options.texture) {
          case 'wood': fFreq = 1000; break;
          case 'hollow': fFreq = 400; break;
          case 'cave': fFreq = 1800; break; 
        }
        f.frequency.setValueAtTime(fFreq, time);
        f.Q.setValueAtTime(6, time);

        osc.connect(g);
        g.connect(f);
        f.connect(drumGain);
        osc.start(time);
        osc.stop(time + 0.5);
      }

      droneGain.connect(combined);
      drumGain.connect(combined);

      const outGain = ctx.createGain();
      if (options.pitchSafeMode) {
        const preReverb = ctx.createGain();
        combined.connect(preReverb);
        applySoftReverb(preReverb, outGain, true);
      } else if (options.physical) {
        applyPhysicalReverb(combined, outGain, options.physical);
      } else {
        combined.connect(outGain);
      }
      
      applyFades(outGain);
      outGain.connect(masterGainNode);
    }
    else if (type === 'noise') {
      const isNone = options.noiseType === 'none';
      const bufferSize = sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const output = buffer.getChannelData(0);
      
      if (options.noiseType === 'white') {
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      } else if (options.noiseType === 'pink') {
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3102503;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11;
          b6 = white * 0.115926;
        }
      } else if (options.noiseType === 'brown') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          const out = (lastOut + (0.02 * white)) / 1.02;
          lastOut = out;
          output[i] = out * 3.5;
        }
      } 
      // if none, buffer stays silent

      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      
      // Setup Frequency Layer (Audible Hz Tone)
      const toneGain = ctx.createGain();
      const toneOsc = ctx.createOscillator();
      toneOsc.type = 'sine';
      toneOsc.frequency.setValueAtTime(options.frequency || 432, 0);
      toneGain.gain.setValueAtTime(isNone ? 0.25 : 0.08, 0); // Louder if Hz only
      
      // Apply frequency shaping filter to noise as well
      const filter = ctx.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.setValueAtTime(options.frequency || 432, 0);
      filter.Q.setValueAtTime(2.0, 0); 
      filter.gain.setValueAtTime(isNone ? 0 : 12, 0); // No resonance if no noise
      
      const baseGain = options.noiseType === 'white' ? 0.06 : 0.1;
      gain.gain.setValueAtTime(isNone ? 0 : baseGain, 0); 
      
      source.buffer = buffer;
      source.loop = true;
      
      if (options.pitchSafeMode) {
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.02, 0);
        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime((options.frequency || 432) / 2, 0);
        subOsc.connect(subGain);
        subGain.connect(masterGainNode);
        subOsc.start(0);
      }
      
      source.connect(filter);
      filter.connect(gain);
      gain.connect(masterGainNode);
      
      toneOsc.connect(toneGain);
      toneGain.connect(masterGainNode);
      
      source.start(0);
      toneOsc.start(0);
    }
    else if (type === 'nature') {
      try {
        const isNone = !options.url;
        let audioBuffer: AudioBuffer | null = null;

        if (!isNone) {
          const response = await fetch(options.url);
          const arrayBuffer = await response.arrayBuffer();
          audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        }
        
        const source = ctx.createBufferSource();
        if (audioBuffer) {
          source.buffer = audioBuffer;
          source.loop = true;
        } else {
          // Silent empty buffer for consistent routing
          source.buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
        }
        
        // Setup Frequency Layer (Modulated Resonance)
        const toneOsc = ctx.createOscillator();
        const toneGain = ctx.createGain();
        toneOsc.type = 'sine';
        toneOsc.frequency.setValueAtTime(options.frequency || 432, 0);
        toneGain.gain.setValueAtTime(isNone ? 0.2 : 0.05, 0); // Louder if Hz only
        
        // Apply tonal shaping filter to nature sounds
        const filter = ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.setValueAtTime(options.frequency || 432, 0);
        filter.Q.setValueAtTime(1.5, 0); 
        filter.gain.setValueAtTime(isNone ? 0 : 10, 0); // No coloring if no sound
        
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(isNone ? 0 : 0.65, 0); 
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGainNode);
        
        toneOsc.connect(toneGain);
        toneGain.connect(masterGainNode);
        
        if (options.pitchSafeMode) {
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime((options.frequency || 432) / 4, 0);
          subGain.gain.setValueAtTime(0.015, 0);
          subOsc.connect(subGain);
          subGain.connect(masterGainNode);
          subOsc.start(0);
        }
        
        source.start(0);
        toneOsc.start(0);
      } catch (e) {
        console.error("Nature generation error:", e);
      }
    }

    const renderedBuffer = await ctx.startRendering();
    return audioBufferToWav(renderedBuffer);
  };

  // Per-layer Compressor Refs for Normalization
  const subCompRef = useRef<DynamicsCompressorNode | null>(null);
  const binCompRef = useRef<DynamicsCompressorNode | null>(null);
  const noiseCompRef = useRef<DynamicsCompressorNode | null>(null);
  const didgCompRef = useRef<DynamicsCompressorNode | null>(null);
  const pureHzCompRef = useRef<DynamicsCompressorNode | null>(null);

  const getSafetyMultiplier = () => {
    let activeCount = 0;
    if (isPlaying) activeCount++;
    if (settings.subliminal.isEnabled && (isPlaying || settings.subliminal.playInBackground)) activeCount++;
    if (settings.binaural.isEnabled && (isPlaying || settings.binaural.playInBackground)) activeCount++;
    if (settings.nature.isEnabled && (isPlaying || settings.nature.playInBackground)) activeCount++;
    if (settings.noise.isEnabled && (isPlaying || settings.noise.playInBackground)) activeCount++;
    if (settings.didgeridoo.isEnabled && (isPlaying || settings.didgeridoo.playInBackground)) activeCount++;
    if (settings.pureHz.isEnabled && (isPlaying || settings.pureHz.playInBackground)) activeCount++;
    if (settings.isochronic.isEnabled && (isPlaying || settings.isochronic.playInBackground)) activeCount++;
    if (settings.solfeggio.isEnabled && (isPlaying || settings.solfeggio.playInBackground)) activeCount++;
    if (settings.schumann.isEnabled && (isPlaying || settings.schumann.playInBackground)) activeCount++;
    if (settings.shamanic.isEnabled && (isPlaying || settings.shamanic.playInBackground)) activeCount++;
    if (settings.mentalToughness.isEnabled && (isPlaying || settings.mentalToughness.playInBackground)) activeCount++;
    
    if (activeCount <= 2) return 1.0;
    if (activeCount <= 4) return 0.75;
    if (activeCount <= 7) return 0.55;
    return 0.4; // Safety for 8-11 layers
  };

  const safetyMultiplier = useMemo(getSafetyMultiplier, [
    isPlaying, 
    settings.subliminal.isEnabled, settings.subliminal.playInBackground,
    settings.binaural.isEnabled, settings.binaural.playInBackground,
    settings.nature.isEnabled, settings.nature.playInBackground,
    settings.noise.isEnabled, settings.noise.playInBackground,
    settings.didgeridoo.isEnabled, settings.didgeridoo.playInBackground,
    settings.pureHz.isEnabled, settings.pureHz.playInBackground,
    settings.isochronic.isEnabled, settings.isochronic.playInBackground,
    settings.solfeggio.isEnabled, settings.solfeggio.playInBackground,
    settings.schumann.isEnabled, settings.schumann.playInBackground,
    settings.shamanic.isEnabled, settings.shamanic.playInBackground,
    settings.mentalToughness.isEnabled, settings.mentalToughness.playInBackground
  ]);

  // Master Gain & Limiter for Stable Parallel Mixing
  const masterGainRef = useRef<GainNode | null>(null);
  const masterLimiterRef = useRef<DynamicsCompressorNode | null>(null);

  // Didgeridoo Refs
  const didgOscRef = useRef<OscillatorNode | null>(null);
  const didgSubOscRef = useRef<OscillatorNode | null>(null);
  const didgFilterRef = useRef<BiquadFilterNode | null>(null);
  const didgGainRef = useRef<GainNode | null>(null);
  const didgLfoRef = useRef<OscillatorNode | null>(null);
  const shamanicSettingsRef = useRef(settings.shamanic);

  useEffect(() => {
    shamanicSettingsRef.current = settings.shamanic;
  }, [settings.shamanic]);

  // Shamanic Drumming Refs
  const shamanicGainRef = useRef<GainNode | null>(null);
  const shamanicIntervalRef = useRef<number | null>(null);

  // Pure Hz Refs
  const pureHzOscRef = useRef<OscillatorNode | null>(null);
  const pureHzGainRef = useRef<GainNode | null>(null);

  // Isochronic Refs
  const isoOscRef = useRef<OscillatorNode | null>(null);
  const isoGainRef = useRef<GainNode | null>(null);
  const isoLfoRef = useRef<OscillatorNode | null>(null);
  const isoLfoGainRef = useRef<GainNode | null>(null);
  const isoCompRef = useRef<DynamicsCompressorNode | null>(null);

  // Solfeggio Refs
  const solOscRef = useRef<OscillatorNode | null>(null);
  const solGainRef = useRef<GainNode | null>(null);
  const solCompRef = useRef<DynamicsCompressorNode | null>(null);

  const schumannOscRef = useRef<OscillatorNode | null>(null);
  const schumannGainRef = useRef<GainNode | null>(null);
  const schumannCompRef = useRef<DynamicsCompressorNode | null>(null);

  // Mental Toughness Refs
  const mentalToughnessGainRef = useRef<GainNode | null>(null);
  const mentalToughnessIntervalRef = useRef<number | null>(null);
  const mentalToughnessSettingsRef = useRef(settings.mentalToughness);

  useEffect(() => {
    mentalToughnessSettingsRef.current = settings.mentalToughness;
  }, [settings.mentalToughness]);

  // iOS Background Audio & Media Session Setup
  useEffect(() => {
    // Helper to ensure AudioContext is ready on any media session action
    const withResume = (fn: () => void) => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      fn();
    };

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => withResume(() => {
        setIsPlaying(true);
        if (mainAudioRef.current && mainAudioRef.current.paused) {
          mainAudioRef.current.play().catch(() => {});
        }
      }));
      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
        if (mainAudioRef.current) mainAudioRef.current.pause();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => withResume(() => playNext()));
      navigator.mediaSession.setActionHandler('previoustrack', () => withResume(() => playPrevious()));
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) seekTo(details.seekTime);
        if (details.fastSeek && mainAudioRef.current) {
          mainAudioRef.current.currentTime = details.seekTime || 0;
        }
      });
      
      // iOS 16 fallback seek handlers
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        if (mainAudioRef.current) seekTo(Math.max(0, mainAudioRef.current.currentTime - offset));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10;
        if (mainAudioRef.current) seekTo(Math.min(mainAudioRef.current.duration, mainAudioRef.current.currentTime + offset));
      });
    }

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('seekto', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      }
    };
  }, [playNext, playPrevious, setIsPlaying, seekTo]);

  // Playlist Memory Tracker - Isolated from global UI updates
  useEffect(() => {
    if (!playingPlaylistId || isLoading || currentTrackIndex === null || !isPlaying) return;
    
    const playlist = playlists.find(p => p.id === playingPlaylistId);
    if (!playlist) return;

    const currentTrackId = playlist.trackIds[currentTrackIndex];
    if (!currentTrackId) return;

    // Use a timeout to throttle updates to once every 5 seconds
    const timer = setTimeout(() => {
      updateSettings({
        playlistMemory: {
          ...settings.playlistMemory,
          [playingPlaylistId]: {
            trackId: currentTrackId,
            position: currentTime,
            timestamp: Date.now()
          }
        }
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [playingPlaylistId, currentTrackIndex, Math.floor(currentTime / 5), isPlaying, isLoading, updateSettings, settings.playlistMemory, playlists]);

  // Sync Media Session Metadata & Playback State
  useEffect(() => {
    if ('mediaSession' in navigator) {
      // Sync Playback State for iPhone Lock Screen Widget
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      if (currentTrackIndex !== null && tracks[currentTrackIndex]) {
        const track = tracks[currentTrackIndex];
        const artworkUrl = track.artwork || `https://picsum.photos/seed/${track.id}/512/512`;
        
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.name,
          artist: track.artist || 'Subliminal Artist',
          album: 'Zen Journey',
          artwork: [
            { src: artworkUrl, sizes: '96x96', type: 'image/png' },
            { src: artworkUrl, sizes: '128x128', type: 'image/png' },
            { src: artworkUrl, sizes: '192x192', type: 'image/png' },
            { src: artworkUrl, sizes: '256x256', type: 'image/png' },
            { src: artworkUrl, sizes: '384x384', type: 'image/png' },
            { src: artworkUrl, sizes: '512x512', type: 'image/png' },
          ]
        });

        // Initialize Position State
        if (mainAudioRef.current && (navigator.mediaSession as any).setPositionState) {
          try {
            (navigator.mediaSession as any).setPositionState({
              duration: mainAudioRef.current.duration || 0,
              playbackRate: settings.playbackRate || 1,
              position: mainAudioRef.current.currentTime || 0,
            });
          } catch (e) {}
        }
      } else {
        // Find active Hz layer to show in metadata if no track is playing
        const activeLayer = Object.entries(settings).find(([key, val]: [string, any]) => 
          val?.isEnabled && val?.playInBackground && ['pureHz', 'binaural', 'isochronic', 'solfeggio', 'schumann', 'didgeridoo', 'shamanic', 'noise', 'nature', 'mentalToughness'].includes(key)
        );

        if (activeLayer) {
          const [id, s] = activeLayer;
          let title = id.charAt(0).toUpperCase() + id.slice(1);
          if (id === 'pureHz') title = 'Pure Hz';
          if (id === 'solfeggio') title = 'Solfeggio';
          if (id === 'schumann') title = 'Schumann Resonance';
          
          let subtitle = 'Active Ambient Layer';
          
          if (id === 'pureHz') subtitle = `${s.frequency}Hz Pure Tone`;
          else if (id === 'solfeggio') subtitle = `${s.frequency}Hz Solfeggio`;
          else if (id === 'schumann') subtitle = `${s.frequency}Hz Resonance`;
          else if (id === 'binaural') subtitle = `Binaural: ${s.leftFreq}Hz / ${s.rightFreq}Hz`;
          else if (id === 'isochronic') subtitle = `Isochronic: ${s.pulseRate}Hz Pulse`;
          
          const ambientArtwork = `https://picsum.photos/seed/meditation/512/512`;
          
          navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: subtitle,
            album: 'Silent Journey',
            artwork: [
              { src: ambientArtwork, sizes: '512x512', type: 'image/png' }
            ]
          });
        } else {
          // Clear metadata if nothing is active
          navigator.mediaSession.metadata = null;
        }
      }
    }
  }, [currentTrackIndex, tracks, settings, isPlaying]);

  // 1. Reconnect Layer Priority System
  // Helper: Get effective frequency considering Sync Lab
  const getEffectiveFrequency = useCallback((freq: number) => {
    if (settings.globalModes.syncLabEnabled && settings.syncLab.linkMode) {
      return settings.syncLab.masterHz;
    }
    return freq;
  }, [settings.globalModes.syncLabEnabled, settings.syncLab.linkMode, settings.syncLab.masterHz]);

  // Helper: Get effective pitch safe mode
  const getEffectivePitchMode = useCallback((mode: boolean) => {
    return mode || settings.globalModes.pitchSafeMode;
  }, [settings.globalModes.pitchSafeMode]);

  const getPriorityMultiplier = (layerId: string) => {
    if (!settings?.advancedAudio?.calmControl?.layerPriority?.isEnabled) return 1.0;
    const strength = settings.advancedAudio.calmControl.layerPriority.balanceStrength;
    
    // Logic: 
    // main -> highest
    // hz-based -> medium
    // soundscapes -> lower
    
    const hzLayers = ['pureHz', 'binaural', 'isochronic', 'solfeggio', 'schumann'];
    const mtLayers = ['mentalToughness', 'shamanic', 'didgeridoo', 'nature', 'noise'];

    if (layerId === 'main') return 1.0 + (0.2 * strength);
    if (hzLayers.includes(layerId)) return 1.0;
    if (mtLayers.includes(layerId)) return 1.0 - (0.3 * strength);
    return 1.0 - (0.1 * strength);
  };

  // 2. Reconnect Harsh Softening (Safe Guard)
  const masterHarshFilterRef = useRef<BiquadFilterNode | null>(null);
  useEffect(() => {
    if (audioCtxRef.current && masterGainRef.current && settings?.advancedAudio?.calmControl?.safeListening) {
      const ctx = audioCtxRef.current;
      const isEnabled = settings.advancedAudio.calmControl.safeListening.isEnabled;
      const softening = settings.advancedAudio.calmControl.safeListening.harshSoftening;

      if (isEnabled && softening > 0) {
        if (!masterHarshFilterRef.current) {
          const filter = ctx.createBiquadFilter();
          filter.type = 'peaking';
          filter.frequency.setValueAtTime(4000, ctx.currentTime);
          filter.Q.setValueAtTime(1.0, ctx.currentTime);
          
          // Inject into master chain carefully
          masterHarshFilterRef.current = filter;
          // Note: we'll handle the connection in setupAudioTools to avoid multiple disconnects
        }
      } 
      if (masterHarshFilterRef.current) {
        const gain = isEnabled ? -15 * softening : 0;
        masterHarshFilterRef.current.gain.setTargetAtTime(gain, ctx.currentTime, 0.2);
      }
    }
  }, [settings.advancedAudio.calmControl.safeListening]);

  // 1. Unified Volume Calculation & Reconnections
  useEffect(() => {
    const masterGainMultiplier = settings.audioTools.gainDb !== 0 ? Math.pow(10, settings.audioTools.gainDb / 20) : 1.0;
    const masterVolumeMultiplier = (settings.audioTools as any).masterVolume ?? 1.0;
    const masterAudioMultiplier = settings.globalModes.masterAudioEnabled ? 1.0 : 0.0;
    const safeListeningCap = settings.advancedAudio?.calmControl?.safeListening?.isEnabled ? settings.advancedAudio.calmControl.safeListening.maxVolumeCap : 1.0;
    const autoScaleMultiplier = (settings.hzAutoScaling && !isPlaying) ? 0.25 : 1.0;

    // Background Layers - Instant Sync logic
    const layers = ['pureHz', 'binaural', 'isochronic', 'solfeggio', 'schumann', 'didgeridoo', 'shamanic', 'noise', 'mentalToughness', 'nature'];
    layers.forEach(id => {
      const el1 = bgAudioRefs.current[id];
      const el2 = bgAudioRefs2.current[id];
      const s = (settings as any)[id];
      if (!s) return;

      const layerGain = Math.pow(10, (s.gainDb || 0) / 20);
      const prioMultiplier = getPriorityMultiplier(id);
      
      // Calculate final target volume
      // Layers like nature/noise use s.volume, others have it applied to element now
      const baseVol = s.volume !== undefined ? s.volume : 1.0; 
      const volume = baseVol * layerGain * masterGainMultiplier * masterVolumeMultiplier * safetyMultiplier * masterAudioMultiplier * safeListeningCap * prioMultiplier * autoScaleMultiplier;
      const finalVol = Math.min(1.0, Math.max(0.0, volume));

      if (el1) el1.volume = finalVol;
      if (el2) el2.volume = finalVol;
    });

    // Subliminal Track
    if (subAudioRef.current) {
      const s = settings.subliminal;
      const layerGain = Math.pow(10, (s.gainDb || 0) / 20);
      const prioSub = getPriorityMultiplier('subliminal');
      const volume = s.volume * layerGain * masterGainMultiplier * masterVolumeMultiplier * safetyMultiplier * masterAudioMultiplier * safeListeningCap * prioSub * autoScaleMultiplier;
      const finalSubVol = Math.min(1.0, Math.max(0.0, volume));
      subAudioRef.current.volume = finalSubVol;
      
      if (subSpecificGainRef.current && audioCtxRef.current) {
         subSpecificGainRef.current.gain.setTargetAtTime(finalSubVol, audioCtxRef.current.currentTime, 0.1);
      }
    }

    // Main Playlist Track
    if (mainAudioRef.current) {
      const layerGain = Math.pow(10, (settings.mainAudio.gainDb || 0) / 20);
      const prioMain = getPriorityMultiplier('main');
      const shieldMultiplier = shieldBoostdB > 0 ? Math.pow(10, shieldBoostdB / 20) : 1.0;
      const volume = settings.mainAudio.volume * layerGain * masterGainMultiplier * masterVolumeMultiplier * safetyMultiplier * masterAudioMultiplier * safeListeningCap * prioMain * shieldMultiplier;
      const finalMainVol = Math.min(1.0, Math.max(0.0, volume));
      mainAudioRef.current.volume = finalMainVol;
      
      // Sync Web Audio side
      if (mainGainRef.current && audioCtxRef.current) {
         mainGainRef.current.gain.setTargetAtTime(settings.mainAudio.volume * masterVolumeMultiplier * masterAudioMultiplier * shieldMultiplier, audioCtxRef.current.currentTime, 0.1);
      }
    }
  }, [settings.audioTools.gainDb, settings.audioTools.masterVolume, settings.mainAudio.volume, settings.mainAudio.gainDb, settings.globalModes, settings.subliminal, settings.advancedAudio.calmControl.layerPriority, safetyMultiplier, settings.syncLab, isPlaying, settings.hzAutoScaling]);

  // Consolidate Audio Elements Lifecycle & iOS Unlock
  useEffect(() => {
    // 1. Initialize elements
    const mainAudio = new Audio();
    const subAudio = new Audio();
    const heartbeatAudio = new Audio();
    
    // Core iOS 16 Stability: One stable player per layer, kept in DOM to prevent suspension.
    // iPhone 8 / iOS 16: Attaching to body is critical for background audio persistence.
    [mainAudio, subAudio, heartbeatAudio].forEach((a, i) => {
      (a as any).playsInline = true;
      (a as any).webkitPlaysInline = true;
      a.preload = 'auto';
      a.style.display = 'none';
      a.id = `layer-audio-core-${i}`; // Unique ID for stability tracking
      document.body.appendChild(a);
    });

    // Heartbeat setup - Silent looping audio to keep session active on iOS 16
    // This trick prevents iOS from suspending the Web Audio context or the app process.
    heartbeatAudio.loop = true;
    heartbeatAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAP8A/wD/"; // Tiny silent WAV
    heartbeatAudio.volume = 0.01; // Maintain a tiny bit of volume for iOS active engine
    
    // 2. Audio State & Metadata Listeners (Stable Context via Refs)
    // Avoid re-attaching listeners unless absolutely necessary
    const onPlaying = () => {
      // Keep session active on Safari
      if (heartbeatAudio.paused) heartbeatAudio.play().catch(() => {});
    };
    
    mainAudio.addEventListener('playing', onPlaying);
    subAudio.addEventListener('playing', onPlaying);

    mainAudioRef.current = mainAudio;
    subAudioRef.current = subAudio;
    heartbeatAudioRef.current = heartbeatAudio;

    let lastPositionUpdate = 0;
    const onTimeUpdate = () => {
      const now = Date.now();
      if (mainAudio.duration) {
        setCurrentTime(mainAudio.currentTime);
      }
      
      // Throttle Media Session position updates for iPhone 8 / iOS 16 stability
      if ('mediaSession' in navigator && (navigator.mediaSession as any).setPositionState && isPlayingRef.current && (now - lastPositionUpdate > 1000)) {
        try {
          (navigator.mediaSession as any).setPositionState({
            duration: mainAudio.duration || 0,
            playbackRate: mainAudio.playbackRate || 1,
            position: mainAudio.currentTime || 0,
          });
          lastPositionUpdate = now;
        } catch (e) {}
      }
    };
    
    const onLoadedMetadata = () => {
      setDuration(mainAudio.duration);
    };

    const onError = async () => {
      const error = mainAudio.error;
      console.warn("[AudioEngine] Main audio error:", error?.code, error?.message);
      if (!isPlayingRef.current) return;
      
      // Recovery logic for revoked Blob URLs on iOS 16
      if (error?.code === 4 || error?.code === 3) {
         const track = currentTrackRef.current;
         if (track) {
           const freshUrl = await getTrackUrl(track.id, true);
           if (freshUrl && mainAudioRef.current) {
             mainAudioRef.current.src = freshUrl;
             mainAudioRef.current.load();
             mainAudioRef.current.play().catch(() => {});
           }
         }
      }
    };

    const onEnded = () => {
      if (settingsRef.current.chunking.mode === 'merge') return; 
      
      const shouldLoopAll = settingsRef.current.playbackMode === 'loop' || settingsRef.current.alwaysLoopMain;
      const smartLoop = settingsRef.current.advancedAudio.stabilityEngine.loopVariations;
      
      // Smart Loop timing variation (0-500ms jitter)
      const delay = (smartLoop.isEnabled) ? Math.random() * 500 : 0;
      
      const proceed = () => {
        if (shouldLoopAll) {
          const isLastTrack = currentTrackIndex === (currentPlaybackListRef.current?.length || 0) - 1;
          
          if (isLastTrack || (currentPlaybackListRef.current?.length || 0) <= 1) {
            if ((currentPlaybackListRef.current?.length || 0) > 1) {
              playNextRef.current(true);
            } else {
              mainAudio.currentTime = 0;
              mainAudio.play().catch(() => {});
            }
          } else {
            playNextRef.current(true);
          }
        } else {
          playNextRef.current(true);
        }
      };

      if (delay > 0) {
        setTimeout(proceed, delay);
      } else {
        proceed();
      }
    };

    mainAudio.addEventListener('timeupdate', onTimeUpdate);
    mainAudio.addEventListener('loadedmetadata', onLoadedMetadata);
    mainAudio.addEventListener('ended', onEnded);
    mainAudio.addEventListener('error', onError);

    // 3. iOS Safari Audio Unlock Helper
    const initCtx = () => {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      return audioCtxRef.current;
    };

    const unlockAudio = () => {
      console.log("[AudioEngine] First tap unlock triggered - Instant Activation");
      const ctx = initCtx();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      
      // Root Fix: Un-mute and start all elements instantly on first touch to bypass Safari restrictions.
      // iOS 16 requires a play() call during a user gesture to "enable" the audio channel for that element.
      const allAudios: HTMLAudioElement[] = [];
      if (mainAudioRef.current) allAudios.push(mainAudioRef.current);
      if (subAudioRef.current) allAudios.push(subAudioRef.current);
      if (heartbeatAudioRef.current) allAudios.push(heartbeatAudioRef.current);
      
      // Also unlock any dynamically created background layers
      Object.values(bgAudioRefs.current).forEach(a => allAudios.push(a));
      Object.values(bgAudioRefs2.current).forEach(a => allAudios.push(a));

      allAudios.forEach(a => {
        a.muted = false;
        
        // Heartbeat is special - it stays playing forever to keep the process alive
        if (a === heartbeatAudioRef.current) {
          a.play().catch(() => {});
          return;
        }

        if (isPlayingRef.current) {
          a.play().catch((e) => console.warn("[AudioEngine] Unlock play failed:", e));
        } else {
          // Warm up the hardware buffer for all players so they can start instantly later in background
          const p = a.play();
          if (p && p.then) {
            p.then(() => { 
              // Only pause if we aren't supposed to be playing yet
              if (!isPlayingRef.current) a.pause(); 
            }).catch(() => {});
          }
        }
      });

      // Remove listeners to prevent redundant unlocks
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsForeground(isVisible);
      if (isVisible) {
        if (audioCtxRef.current) audioCtxRef.current.resume().catch(() => {});
        runHealthCheck();
      }
    };

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('zen-audio-unlock', unlockAudio);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', runHealthCheck);
    window.addEventListener('pagehide', () => {
       // iOS 16 optimization: Save session state silently
       if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
         // Prevent freeze on hide
       }
    });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('zen-audio-unlock', unlockAudio);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', runHealthCheck);
      
      mainAudio.removeEventListener('timeupdate', onTimeUpdate);
      mainAudio.removeEventListener('loadedmetadata', onLoadedMetadata);
      mainAudio.removeEventListener('ended', onEnded);
      mainAudio.removeEventListener('error', onError);
      mainAudio.removeEventListener('playing', onPlaying);
      subAudio.removeEventListener('playing', onPlaying);

      [mainAudio, subAudio, heartbeatAudio].forEach(a => {
        a.pause();
        a.src = '';
        if (a.parentNode) a.parentNode.removeChild(a);
      });

      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      
      mainAudioRef.current = null;
      subAudioRef.current = null;
      heartbeatAudioRef.current = null;
    };
  }, []); // Run ONCE and keep alive

  // Determine if we actually need Web Audio active
  const needsWebAudio = useMemo(() => {
    return hasAnyLayerEnabled && (isPlaying || settings.globalModes.backgroundMode || settings.safeIdle?.isEnabled);
  }, [hasAnyLayerEnabled, isPlaying, settings.globalModes.backgroundMode, settings.safeIdle?.isEnabled]);

  // Unified Audio Intelligence Manager
  const lastIntelligenceRunRef = useRef<number>(0);
  const intelligenceStateRef = useRef({
    isLowPower: false,
    cpuLoadEstimate: 0,
    consecutiveErrors: 0,
    lastStableState: null as any,
    activeConflicts: [] as string[]
  });

  // Limits & Protection Layer
  const clampValue = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  // Emergency Session Restore
  useEffect(() => {
    const restore = () => {
      const saved = localStorage.getItem('subliminal_emergency_save');
      if (saved) {
        try {
          const { time, pos } = JSON.parse(saved);
          const age = Date.now() - time;
          // Only restore if it was less than 10 minutes ago (avoid confusing the user)
          if (age < 600000 && !isPlaying && mainAudioRef.current) {
            console.log('[Stability] Emergency Restore: Resuming last position', pos);
            mainAudioRef.current.currentTime = pos;
            localStorage.removeItem('subliminal_emergency_save');
          }
        } catch (e) {
          localStorage.removeItem('subliminal_emergency_save');
        }
      }
    };
    // Wait for engine stability
    const timer = setTimeout(restore, 2000);
    return () => clearTimeout(timer);
  }, []); // Only on mount

  const runAudioIntelligence = useCallback((ctx: AudioContext, settings: any) => {
    const now = Date.now();
    // Throttle for iPhone 8 stability (approx 2-3 Hz)
    if (now - lastIntelligenceRunRef.current < 450) return;
    const delta = now - lastIntelligenceRunRef.current;
    lastIntelligenceRunRef.current = now;

    try {
      const adv = settings.advancedAudio;
      const mainAudio = mainAudioRef.current;
      const isLowPower = isActuallyInLowPowerMode;

      // --- 1. Conflict Resolver & Priority Control ---
      if (adv.calmControl.safeListening.isEnabled) {
        const cap = adv.calmControl.safeListening.maxVolumeCap;
        if (settings.mainAudio.volume > cap && mainGainRef.current) {
          mainGainRef.current.gain.setTargetAtTime(cap, ctx.currentTime, 0.2);
        }
      }

      // --- 2. Self-Healing & Emergency Layer (Hardened) ---
      if (isPlayingRef.current && mainAudio && mainAudio.src) {
        const currentPos = mainAudio.currentTime;
        const isFrozen = (currentPos === lastKnownTime.current && !mainAudio.paused && !mainAudio.ended && !mainAudio.seeking && currentPos !== 0);
        const isUnexpectedlyPaused = (mainAudio.paused && !mainAudio.ended && mainAudio.readyState >= 2 && !mainAudio.seeking);

        if (isUnexpectedlyPaused || isFrozen) {
          if (adv.stabilityEngine.emergencyRecovery.isEnabled) {
            console.warn(`[Intelligence] Auto-Repair: Fixing main audio (Frozen: ${isFrozen})`);
            
            // Ambient Interrupt Shield logic
            if (isUnexpectedlyPaused && adv.stabilityEngine.interruptShield?.isEnabled) {
               const shield = adv.stabilityEngine.interruptShield;
               const boostAmt = shield.sensitivity === 'high' ? 6 : shield.sensitivity === 'med' ? 4 : 2;
               setShieldBoostdB(boostAmt);
               setTimeout(() => setShieldBoostdB(0), 10000);
            }

            mainAudio.play().catch(() => {});
            if (isFrozen) {
              playStateAnomalies.current++;
              if (playStateAnomalies.current > 6) softHealElement(mainAudio, 'main');
            }
          }
        } else {
          lastKnownTime.current = currentPos;
          playStateAnomalies.current = 0;
        }

        // Volume Integrity check
        if (adv.selfHeal?.isEnabled && adv.selfHeal?.volume) {
          if (Math.abs(mainAudio.volume - settings.mainAudio.volume) > 0.05) {
            mainAudio.volume = settings.mainAudio.volume;
          }
        }
      }

      // --- 3. Heartbeat & Ambient Guard ---
      if (heartbeatAudioRef.current && (settings.globalModes.masterAudioEnabled || settings.safeIdle?.isEnabled)) {
        if (heartbeatAudioRef.current.paused) heartbeatAudioRef.current.play().catch(() => {});
        heartbeatAudioRef.current.volume = settings.safeIdle?.volume || 0.01;
      }

      // --- 4. Subliminal & Background Layer Stability ---
      Object.entries(bgAudioRefs.current).forEach(([id, el]) => {
        const s = (settings as any)[id];
        if (s?.isEnabled && (isPlayingRef.current || s?.playInBackground) && el.paused && el.readyState >= 2) {
          el.play().catch(() => {});
        }
      });

      // --- 5. Time-Based Automation (Sub-Loop) ---
      const timeAutomation = adv?.calmControl?.timeAutomation;
      if (timeAutomation?.isEnabled && isPlayingRef.current && mainAudio) {
        const step = timeAutomation.steps.find(s => 
          (s.time > lastKnownTime.current - 0.7 && s.time <= mainAudio.currentTime)
        );
        if (step) {
          if (step.type === 'mainVolume' || step.type === 'volume') updateMainAudioSettings({ volume: step.value });
          else if (step.type === 'masterHz') updateSyncLabSettings({ masterHz: step.value });
        }
      }

      // --- 6. Memory Continuity & Continuity Save ---
      if (adv.stabilityEngine.sessionContinuity.isEnabled && now - lastContinuitySave.current > 15000) {
        lastContinuitySave.current = now;
        // Logic for heatmap tracking could also be here
      }

      intelligenceStateRef.current.consecutiveErrors = 0;
    } catch (err) {
      intelligenceStateRef.current.consecutiveErrors++;
      if (intelligenceStateRef.current.consecutiveErrors > 15) {
        ctx.suspend().then(() => ctx.resume()).catch(() => {});
        intelligenceStateRef.current.consecutiveErrors = 0;
      }
    }
  }, [isActuallyInLowPowerMode, updateMainAudioSettings, updateSyncLabSettings]);
  
  const runHealthCheck = useCallback(() => {
    if (audioCtxRef.current) {
        runAudioIntelligence(audioCtxRef.current, settingsRef.current);
    }
  }, [runAudioIntelligence]);

  // Main Logic Loop (Consolidated Intelligence & Health)
  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'closed') return;

    const interval = setInterval(() => {
      const currentCtx = audioCtxRef.current;
      if (!currentCtx) return;

      // 1. Run Intelligence Features (Throttled inside) 
      runAudioIntelligence(currentCtx, settingsRef.current);

      // 2. iOS 16 Background & Visibility Health
      if (isPlaying) {
        // Ensure context is running if we need Web Audio layers
        if (needsWebAudio && currentCtx.state === 'suspended') {
          currentCtx.resume().catch(() => {});
        }

        // Detect unexpected pauses (Silence Recovery)
        if (mainAudioRef.current) {
          const audio = mainAudioRef.current;
          if (audio.paused && !audio.ended && audio.readyState >= 2 && !audio.seeking) {
            console.log('[Stability] Emergency Recovery: Resuming main audio');
            audio.play().catch(() => {});
          }
        }
      } else {
        // Suspend context when completely idle for power saving
        if (currentCtx.state === 'running' && !needsWebAudio) {
          currentCtx.suspend().catch(() => {});
        }
      }

      // 3. Frequency Drift Protection
      // (Would check oscillator refs and reset if drifting, but standard Web Audio and our refs are stable enough)

    }, 450); // 450ms steady pulse for iPhone 8 CPU safety

    const handleVisibility = () => {
      setIsForeground(document.visibilityState === 'visible');
      if (document.visibilityState === 'visible' && isPlaying) {
        console.log('[Stability] Foreground Restore: Checking playback sync');
        // Quick burst recovery
        if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      }
    };

    const handleHalt = () => {
      // Emergency save before crash/unload
      if (settingsRef.current.advancedAudio.stabilityEngine.sessionContinuity.isEnabled) {
        localStorage.setItem('subliminal_emergency_save', JSON.stringify({
          time: Date.now(),
          pos: mainAudioRef.current?.currentTime || 0
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handleHalt);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handleHalt);
    };
  }, [runAudioIntelligence, isPlaying, needsWebAudio]);

  const createNoiseBuffer = (type: 'white' | 'pink' | 'brown') => {
    if (!audioCtxRef.current) return null;
    const ctx = audioCtxRef.current;
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      let b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3102503;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // (roughly) apply gain
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        const out = (lastOut + (0.02 * white)) / 1.02;
        lastOut = out;
        output[i] = out * 3.5; // (roughly) apply gain
      }
    }
    return buffer;
  };

  // Helper: Sync Background Layer with Buffer Mode Support
  const syncBgLayer = async (layerId: string, isLayerPlaying: boolean, type: string, params: any, volume: number, gainDb: number) => {
    const s = settings.layers[layerId] || (settings as any)[layerId];
    const mode = s?.bufferMode || 'single'; // Default to single for iPhone 8
    const isUrlType = type === 'url';
    const bakedGainValue = (volume || 1.0) * Math.pow(10, (gainDb || 0) / 20);
    const masterGainMultiplier = (settings.audioTools.gainDb !== undefined) ? Math.pow(10, settings.audioTools.gainDb / 20) : 1.0;
    const targetVolume = isUrlType ? Math.min(1, Math.max(0, bakedGainValue * masterGainMultiplier * safetyMultiplier)) : 1.0;

    if (isLayerPlaying) {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current!;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      if (!bgLayerSpatialRefs.current[layerId]) {
        bgLayerSpatialRefs.current[layerId] = createSpatialNodes(ctx);
        // Connect to master or destination
        const dest = masterGainRef.current || ctx.destination;
        bgLayerSpatialRefs.current[layerId].output.connect(dest);
      }
      
      updateSpatialEngine(bgLayerSpatialRefs.current[layerId], s?.spatial, isActuallyInLowPowerMode);

      if (!bgAudioRefs.current[layerId]) {
        const createEl = (idSuffix: string) => {
          const el = new Audio();
          el.id = `bg-audio-${layerId}-${idSuffix}`;
          (el as any).playsInline = true;
          (el as any).webkitPlaysInline = true;
          el.style.display = 'none';
          document.body.appendChild(el);
          return el;
        };

        bgAudioRefs.current[layerId] = createEl('1');
        // bgAudioRefs2 only created if specifically in double mode
        if (mode === 'double') {
           bgAudioRefs2.current[layerId] = createEl('2');
        }
        activeBgRef.current[layerId] = 1;

        // Shared Logic for buffers
        const els = [bgAudioRefs.current[layerId]];
        if (bgAudioRefs2.current[layerId]) els.push(bgAudioRefs2.current[layerId]);

        els.forEach((el, idx) => {
          const isPrimary = idx === 0;
          
          try {
            const source = ctx.createMediaElementSource(el);
            source.connect(bgLayerSpatialRefs.current[layerId].input);
          } catch (e) {
            // Source already connected or other error
          }
          
          el.addEventListener('timeupdate', () => {
            const currentActiveIdx = activeBgRef.current[layerId];
            const myIdx = isPrimary ? 1 : 2;
            
            if (currentActiveIdx === myIdx) {
              const now = Date.now();
              const lastUpdate = (el as any).lastProgressTime || 0;
              const throttleMs = document.visibilityState === 'visible' ? 500 : 5000;
              
              if (now - lastUpdate > throttleMs) {
                updateLayerProgress(layerId, {
                  currentTime: el.currentTime,
                  duration: el.duration || 30
                });
                (el as any).lastProgressTime = now;
              }

              // Double Buffering Gapless Logic
              if (mode === 'double' && bgAudioRefs2.current[layerId] && el.duration > 0 && el.currentTime > el.duration - 0.5) {
                const otherIdx = myIdx === 1 ? 2 : 1;
                const otherEl = otherIdx === 1 ? bgAudioRefs.current[layerId] : bgAudioRefs2.current[layerId];
                
                if (otherEl.paused) {
                  // Re-calculate target volume...
                  const currentS = settings.layers[layerId] || (settings as any)[layerId];
                  const currentVol = currentS?.volume || 0;
                  const currentGain = currentS?.gainDb || 0;
                  const currentBakedGain = currentVol * Math.pow(10, currentGain / 20);
                  const currentMasterGain = Math.pow(10, settings.audioTools.gainDb / 20);
                  const currentTargetVol = isUrlType ? Math.min(1, Math.max(0, currentBakedGain * currentMasterGain * safetyMultiplier)) : 1.0;

                  otherEl.currentTime = 0;
                  otherEl.play().catch(() => {});
                  activeBgRef.current[layerId] = otherIdx;
                  
                  // Crossfade...
                  const fadeOutEl = el;
                  const fadeInEl = otherEl;
                  let fadeStep = 0;
                  const steps = 10;
                  
                  if (bgFadeIntervals.current[layerId]) {
                    clearInterval(bgFadeIntervals.current[layerId]);
                  }
                  
                  const fadeInterval = window.setInterval(() => {
                    fadeStep++;
                    fadeInEl.volume = (fadeStep / steps) * currentTargetVol;
                    fadeOutEl.volume = (1 - (fadeStep / steps)) * currentTargetVol;
                    if (fadeStep >= steps) {
                      clearInterval(fadeInterval);
                      delete bgFadeIntervals.current[layerId];
                      fadeOutEl.pause();
                      fadeOutEl.currentTime = 0;
                    }
                  }, 40);
                  bgFadeIntervals.current[layerId] = fadeInterval;
                }
              }
            }
          });

          el.addEventListener('ended', () => {
            if (mode === 'single') {
              el.currentTime = 0;
              el.play().catch(() => {});
            } else if (bgAudioRefs2.current[layerId]) {
              const myIdx = isPrimary ? 1 : 2;
              const otherIdx = myIdx === 1 ? 2 : 1;
              const otherEl = otherIdx === 1 ? bgAudioRefs.current[layerId] : bgAudioRefs2.current[layerId];
              if (activeBgRef.current[layerId] === myIdx) {
                otherEl.currentTime = 0;
                otherEl.play().catch(() => {});
                activeBgRef.current[layerId] = otherIdx;
              }
            }
          });
        });
      }

      const el1 = bgAudioRefs.current[layerId];
      const el2 = bgAudioRefs2.current[layerId];
      const activeIdx = activeBgRef.current[layerId];
      const currentEl = activeIdx === 1 ? el1 : (el2 || el1);

      // Update Loop Mode
      el1.loop = mode === 'single';
      if (el2) el2.loop = mode === 'single';

      const masterGainDb = settings.audioTools.gainDb;
      const extendedParams = { 
        ...params, 
        masterGainDb,
        safetyMultiplier
      };
      
      let url = isUrlType ? params.url : null;
      
      // Calculate ParamKey for generation/swapping
      // We EXCLUDE volume/gain here to allow instant volume updates without re-generating blobs
      let paramKey = isUrlType 
        ? JSON.stringify({ url, mode })
        : JSON.stringify({ ...params, type, mode });

      if (bgAudioParams.current[layerId] !== paramKey) {
        const now = Date.now();
        const lastGen = lastBgGenTime.current[layerId] || 0;
        
        // Only throttle generation, not URL swaps (unless URL changed)
        if (!isUrlType && (now - lastGen < 350)) return;
        
        lastBgGenTime.current[layerId] = now;
        
        if (!isUrlType) {
          if (bgAudioUrls.current[layerId]) URL.revokeObjectURL(bgAudioUrls.current[layerId]);
          const blob = await generateToneBlob(type, extendedParams);
          url = URL.createObjectURL(blob);
          registerUrl(url);
          bgAudioUrls.current[layerId] = url;
        }

        const oldParamKey = bgAudioParams.current[layerId];
        bgAudioParams.current[layerId] = paramKey;

        // If we were already playing, we do a crossfade to the other buffer
        const s = settings.layers[layerId] || (settings as any)[layerId];
        if (oldParamKey && (isPlaying || s?.playInBackground)) {
          const otherIdx = activeIdx === 1 ? 2 : 1;
          const otherEl = otherIdx === 1 ? el1 : el2;
          const currentEl = activeIdx === 1 ? el1 : el2;

          otherEl.src = url;
          otherEl.load();
          otherEl.volume = 0;
          
          otherEl.play().then(() => {
            console.log(`[AudioEngine] Parameter change crossfade for ${layerId} to ${otherIdx}`);
            activeBgRef.current[layerId] = otherIdx;
            
            let fadeStep = 0;
            const steps = 15; // Slightly longer for smoother Hz transitions
            
            if (bgFadeIntervals.current[layerId]) {
              clearInterval(bgFadeIntervals.current[layerId]);
            }
            
            const fadeInterval = window.setInterval(() => {
              fadeStep++;
              otherEl.volume = (fadeStep / steps) * targetVolume;
              currentEl.volume = (1 - (fadeStep / steps)) * targetVolume;
              
              if (fadeStep >= steps) {
                clearInterval(fadeInterval);
                delete bgFadeIntervals.current[layerId];
                currentEl.pause();
                currentEl.currentTime = 0;
                // Optional: sync currentEl's src too for next cycle, but usually we just swap buffers
                currentEl.src = url;
                currentEl.load();
              }
            }, 30);
            bgFadeIntervals.current[layerId] = fadeInterval;
          }).catch(err => {
            console.error("[AudioEngine] Crossfade play failed:", err);
            // Fallback: hard swap
            el1.src = url; el1.load();
            el2.src = url; el2.load();
            const currentLayerSettings = settings.layers[layerId] || (settings as any)[layerId];
            if (isPlaying || currentLayerSettings?.playInBackground) currentEl.play();
          });
        } else {
          // Initial load or not playing
          [el1, el2].forEach(a => {
            a.pause();
            a.src = url;
            a.load();
          });
          const currentLayerSettings = settings.layers[layerId] || (settings as any)[layerId];
          if (isPlaying || currentLayerSettings?.playInBackground) {
            currentEl.play().catch(() => {});
          }
        }
      }

      currentEl.volume = targetVolume;
      const currentLayerSettings = settings.layers[layerId] || (settings as any)[layerId];
      if (currentEl.paused && (isPlaying || currentLayerSettings?.playInBackground)) {
        currentEl.play().catch(() => {});
      }
    } else {
      const el1 = bgAudioRefs.current[layerId];
      const el2 = bgAudioRefs2.current[layerId];
      if (bgFadeIntervals.current[layerId]) {
        clearInterval(bgFadeIntervals.current[layerId]);
        delete bgFadeIntervals.current[layerId];
      }
      
      // Bind pause/play directly to paused state
      // Avoid clearing src immediately to allow responsive resume
      if (el1) el1.pause();
      if (el2) el2.pause();
      
      // Cleanup URLs only after a delay to ensure no dead references on quick toggle
      setTimeout(() => {
        const currentS = (settingsRef.current as any)[layerId];
        if (!isPlayingRef.current && !currentS?.playInBackground) {
          if (el1 && el1.paused) { el1.src = ''; el1.load(); }
          if (el2 && el2.paused) { el2.src = ''; el2.load(); }
          if (bgAudioUrls.current[layerId]) {
            URL.revokeObjectURL(bgAudioUrls.current[layerId]);
            delete bgAudioUrls.current[layerId];
          }
          delete bgAudioParams.current[layerId];
        }
      }, 5000);

      updateLayerProgress(layerId, { currentTime: 0, duration: 0 });
    }
  };

  const setupNoise = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      
      setupAudioTools(); // Ensure master routing is ready

      if (!noiseGainRef.current) {
        const gain = ctx.createGain();
        const comp = ctx.createDynamicsCompressor();
        
        comp.threshold.setValueAtTime(-24, ctx.currentTime);
        comp.ratio.setValueAtTime(12, ctx.currentTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        
        const noiseSpatialNodes = createSpatialNodes(ctx);
        updateSpatialEngine(noiseSpatialNodes, settings.noise.spatial, isActuallyInLowPowerMode);
        comp.connect(noiseSpatialNodes.input);
        noiseSpatialNodes.output.connect(gain);
        noiseSpatialRef.current = noiseSpatialNodes;
        
        // Connect to Master Gain instead of direct destination
        if (masterGainRef.current) {
          gain.connect(masterGainRef.current);
        } else {
          gain.connect(ctx.destination);
        }
        
        noiseGainRef.current = gain;
        noiseCompRef.current = comp;
      }
    } catch (err) {
      console.error("Failed to setup noise context:", err);
    }
  };

  const setupBinaural = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      setupAudioTools(); // Ensure master routing is ready

      if (!leftOscRef.current || !rightOscRef.current) {
        // Create Nodes
        const leftOsc = ctx.createOscillator();
        const rightOsc = ctx.createOscillator();
        const merger = ctx.createChannelMerger(2);
        const gainNode = ctx.createGain();
        const comp = ctx.createDynamicsCompressor();

        comp.threshold.setValueAtTime(-24, ctx.currentTime);
        comp.ratio.setValueAtTime(12, ctx.currentTime);

        leftOsc.type = 'sine';
        rightOsc.type = 'sine';

        // Initial frequencies
        leftOsc.frequency.setValueAtTime(settings.binaural.leftFreq, ctx.currentTime);
        rightOsc.frequency.setValueAtTime(settings.binaural.rightFreq, ctx.currentTime);

        const isPitchRange = (freq: number) => freq >= 200 && freq <= 1900;
        const useSoftPitch = settings.binaural.pitchSafeMode && isPitchRange((settings.binaural.leftFreq + settings.binaural.rightFreq) / 2);

        // Route: Left -> Channel 0, Right -> Channel 1 (Explicit Stereo)
        leftOsc.connect(merger, 0, 0);
        rightOsc.connect(merger, 0, 1);

        if (useSoftPitch) {
           const filter = ctx.createBiquadFilter();
           filter.type = 'lowpass';
           filter.frequency.setValueAtTime(Math.min(settings.binaural.leftFreq, settings.binaural.rightFreq) * 0.9, ctx.currentTime);
           merger.connect(filter);
           
           const preReverbGain = ctx.createGain();
           preReverbGain.gain.setValueAtTime(1.0, ctx.currentTime);
           filter.connect(preReverbGain);
           
           applySoftReverbEffect(ctx, preReverbGain, comp);
        } else {
           merger.connect(comp);
        }
        
        const binauralSpatialNodes = createSpatialNodes(ctx);
        updateSpatialEngine(binauralSpatialNodes, settings.binaural.spatial, isActuallyInLowPowerMode);
        comp.connect(binauralSpatialNodes.input);
        binauralSpatialNodes.output.connect(gainNode);
        binauralSpatialRef.current = binauralSpatialNodes;

        // Connect to Master Gain instead of direct destination
        if (masterGainRef.current) {
          gainNode.connect(masterGainRef.current);
        } else {
          gainNode.connect(ctx.destination);
        }

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        leftOsc.start();
        rightOsc.start();

        leftOscRef.current = leftOsc;
        rightOscRef.current = rightOsc;
        binauralGainRef.current = gainNode;
        binCompRef.current = comp;
      }
    } catch (err) {
      console.error("Binaural setup failed:", err);
    }
  };

  const setupDidgeridoo = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;

      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      setupAudioTools();

      if (!didgOscRef.current) {
        const osc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const gain = ctx.createGain();
        const comp = ctx.createDynamicsCompressor();

        comp.threshold.setValueAtTime(-24, ctx.currentTime);
        comp.ratio.setValueAtTime(12, ctx.currentTime);

        // Deep drone fundamental
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(settings.didgeridoo.frequency, ctx.currentTime);

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(settings.didgeridoo.frequency, ctx.currentTime);

        // Vocalizing filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180 * (1 + settings.didgeridoo.depth), ctx.currentTime);
        filter.Q.setValueAtTime(15, ctx.currentTime);

        // Slow modulation for "breath"
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
        lfoGain.gain.setValueAtTime(60 * settings.didgeridoo.depth, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        osc.connect(filter);
        subOsc.connect(filter);

        if (settings.didgeridoo.pitchSafeMode) {
          const softFilter = ctx.createBiquadFilter();
          softFilter.type = 'lowpass';
          softFilter.frequency.setValueAtTime(settings.didgeridoo.frequency * 2, ctx.currentTime);
          filter.connect(softFilter);
          
          const preReverbGain = ctx.createGain();
          preReverbGain.gain.setValueAtTime(1.0, ctx.currentTime);
          softFilter.connect(preReverbGain);
          
          applySoftReverbEffect(ctx, preReverbGain, comp);
        } else {
          filter.connect(comp);
        }

        const didgSpatialNodes = createSpatialNodes(ctx);
        updateSpatialEngine(didgSpatialNodes, settings.didgeridoo.spatial, isActuallyInLowPowerMode);
        comp.connect(didgSpatialNodes.input);
        didgSpatialNodes.output.connect(gain);
        didgSpatialRef.current = didgSpatialNodes;
        
        // Connect to Master Gain
        if (masterGainRef.current) {
          gain.connect(masterGainRef.current);
        } else {
          gain.connect(ctx.destination);
        }

        gain.gain.setValueAtTime(0, ctx.currentTime);

        osc.start();
        subOsc.start();
        lfo.start();

        didgOscRef.current = osc;
        didgSubOscRef.current = subOsc;
        didgFilterRef.current = filter;
        didgGainRef.current = gain;
        didgLfoRef.current = lfo;
      }
    } catch (err) {
      console.error("Didgeridoo setup failed:", err);
    }
  };

  // Heartbeat & Self-Healing for iOS 16 / iPhone 8 stability
  useEffect(() => {
    if (!settings.appIntelligence.isEnabled || !settings.appIntelligence.iosStabilityMode) return;

    const interval = setInterval(() => {
      // 1. Detect & Fix Main Audio Suspension
      if (isPlayingRef.current && mainAudioRef.current) {
        if (mainAudioRef.current.paused && mainAudioRef.current.readyState >= 2) {
          console.warn('[Self-Heal] Main audio detected as PAUSED while playing. Restarting...');
          mainAudioRef.current.play().catch(() => {
            // If play fails, attempt a soft heal re-bind
            softHealElement(mainAudioRef.current, 'main');
          });
        }
      }

      // 2. Detect & Fix Silent Background Layers
      Object.entries(bgAudioRefs.current).forEach(([layerId, el]) => {
        const layerSettings = (settingsRef.current as any)[layerId];
        const shouldBePlaying = isPlayingRef.current || (layerSettings && layerSettings.playInBackground);
        
        if (el && el.paused && shouldBePlaying && el.readyState >= 2) {
          console.warn(`[Self-Heal] Layer ${layerId} stalled. Recovering...`);
          el.play().catch(() => softHealElement(el, 'hz', layerId));
        }
      });

      // 3. Heartbeat Tone (L3 Stability)
      if (heartbeatAudioRef.current && isPlayingRef.current) {
        if (heartbeatAudioRef.current.paused) {
           heartbeatAudioRef.current.play().catch(() => {});
        }
      }
    }, 8000); // 8s heartbeat is enough to prevent suspension without draining battery

    return () => clearInterval(interval);
  }, [settings.appIntelligence.isEnabled, settings.appIntelligence.iosStabilityMode]);

  // Wake Lock Ref
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const handleWakeLock = async () => {
      if ('wakeLock' in navigator) {
        if (settings.displayAlwaysOn && isPlaying) {
          try {
            if (!wakeLockRef.current) {
              wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
              console.warn('[System] Screen Wake Lock ACQUIRED');
              
              wakeLockRef.current.addEventListener('release', () => {
                console.warn('[System] Screen Wake Lock RELEASED');
                wakeLockRef.current = null;
              });
            }
          } catch (err) {
            console.error('[System] Wake Lock Error:', err);
          }
        } else if (wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
      }
    };

    handleWakeLock();
    
    // Re-acquire on visibility change if needed
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleWakeLock();
      }
    };
    
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {});
    };
  }, [settings.displayAlwaysOn, isPlaying]);

  // Handle Seek Request
  useEffect(() => {
    if (seekRequest !== null && mainAudioRef.current) {
      if (settings.chunking.mode === 'merge' && chunkPlanRef.current) {
        const plan = chunkPlanRef.current;
        const chunk = plan.chunks[settings.chunking.currentChunkIndex];
        
        let offset = 0;
        // Find offset of the current track within the chunk
        // This is a bit complex because we need to know WHICH track the user is seeking on
        // But usually seekTo is called on the CURRENTLY displayed track.
        // So we can use currentTrackIndex to find the current track's offset in the chunk.
        
        let tracksBeforeChunk = 0;
        for (let i = 0; i < settings.chunking.currentChunkIndex; i++) {
          tracksBeforeChunk += plan.chunks[i].trackIds.length;
        }
        const indexInChunk = currentTrackIndex! - tracksBeforeChunk;
        
        const calcOffset = async () => {
          let trackOffset = 0;
          for (let i = 0; i < indexInChunk; i++) {
            trackOffset += await ChunkManager.getAudioDuration(chunk.trackIds[i]);
          }
          console.log(`[AudioEngine] Seeking in merged chunk. Track offset: ${trackOffset}, Seek val: ${seekRequest}`);
          mainAudioRef.current!.currentTime = trackOffset + seekRequest;
          clearSeekRequest();
        };
        calcOffset();
      } else {
        mainAudioRef.current.currentTime = seekRequest;
        clearSeekRequest();
      }
    }
  }, [seekRequest, settings.chunking]);

  // Resolve Main URL
  useEffect(() => {
    if (currentTrack && !currentTrack.isMissing) {
      getTrackUrl(currentTrack.id).then(url => {
        setPreparedUrl(url);
      });
    } else {
      setPreparedUrl(null);
    }
  }, [currentTrack?.id, getTrackUrl]);

  // Unified sourcing: Check both lists for the subliminal track
  const subTrack = useMemo(() => {
    // If playlist mode is on, we derive track from the selected playlist and our internal index
    if (settings.subliminal.isPlaylistMode && settings.subliminal.sourcePlaylistId) {
      const playlist = playlists.find(p => p.id === settings.subliminal.sourcePlaylistId);
      if (playlist && playlist.trackIds.length > 0) {
        // Ensure index is within bounds
        const trackId = playlist.trackIds[subPlaylistIndexRef.current % playlist.trackIds.length];
        return (tracks.find(t => t.id === trackId) || (subliminalTracks || []).find((t: any) => t.id === trackId));
      }
    }
    
    return (subliminalTracks || []).find((t: any) => t.id === settings.subliminal.selectedTrackId) || 
           tracks.find(t => t.id === settings.subliminal.selectedTrackId);
  }, [subliminalTracks, tracks, settings.subliminal.selectedTrackId, settings.subliminal.isPlaylistMode, settings.subliminal.sourcePlaylistId, playlists]);

  // Resolve Sub URL
  useEffect(() => {
    if (subTrack && !subTrack.isMissing) {
      getTrackUrl(subTrack.id).then(url => {
        setPreparedSubUrl(url);
      });
    } else {
      setPreparedSubUrl(null);
    }
  }, [subTrack?.id, getTrackUrl]);

  // Reset Subliminal Index on mode/playlist change
  useEffect(() => {
    subPlaylistIndexRef.current = 0;
  }, [settings.subliminal.sourcePlaylistId, settings.subliminal.isPlaylistMode]);


  // Handle Subliminal Source Sync
  useEffect(() => {
    if (subAudioRef.current && subTrack && preparedSubUrl) {
      if (subAudioRef.current.src !== preparedSubUrl) {
        subAudioRef.current.src = preparedSubUrl;
        subAudioRef.current.load();
      }
    }
  }, [subTrack, preparedSubUrl]);

  const setupAudioTools = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;

      // 1. Setup Master Routing (The Final Gate)
      if (!masterGainRef.current) {
        masterGainRef.current = ctx.createGain();
        masterLimiterRef.current = ctx.createDynamicsCompressor();
        
        // Safety Limiter to prevent clipping across all layers
        const limiter = masterLimiterRef.current;
        limiter.threshold.setValueAtTime(-1.0, ctx.currentTime);
        limiter.knee.setValueAtTime(0, ctx.currentTime);
        limiter.ratio.setValueAtTime(20, ctx.currentTime);
        limiter.attack.setValueAtTime(0.001, ctx.currentTime);
        limiter.release.setValueAtTime(0.1, ctx.currentTime);
        
        masterGainRef.current.connect(limiter);
        limiter.connect(ctx.destination);
        
        // Default master gain is 1.0 (individual layers have their own gains)
        masterGainRef.current.gain.setValueAtTime(1.0, ctx.currentTime);
      }
      
      // 2. Setup Tool Routing (Playlist & Subliminal)
      if (!toolGainRef.current) {
        toolGainRef.current = ctx.createGain();
        toolCompressorRef.current = ctx.createDynamicsCompressor();
        
        const comp = toolCompressorRef.current;
        comp.threshold.setValueAtTime(settings.audioTools.normalizeTargetDb !== null ? settings.audioTools.normalizeTargetDb : 0, ctx.currentTime);
        comp.knee.setValueAtTime(0, ctx.currentTime);
        comp.ratio.setValueAtTime(20, ctx.currentTime);
        comp.attack.setValueAtTime(0.003, ctx.currentTime);
        comp.release.setValueAtTime(0.25, ctx.currentTime);
        
        toolGainRef.current.connect(comp);
        // Connect tool chain to master gain
        comp.connect(masterGainRef.current);
      }
      
      if (mainAudioRef.current && !mainSourceRef.current && !settings.audioTools.playInBackground) {
        mainSourceRef.current = ctx.createMediaElementSource(mainAudioRef.current);
        if (!mainGainRef.current) {
          mainGainRef.current = ctx.createGain();
        }
        mainSourceRef.current.connect(mainGainRef.current);
        
        if (!mainSpatialRef.current) {
          mainSpatialRef.current = createSpatialNodes(ctx);
        }
        updateSpatialEngine(mainSpatialRef.current, settings.mainAudio.spatial, isActuallyInLowPowerMode);
        mainGainRef.current.connect(mainSpatialRef.current.input);
        mainSpatialRef.current.output.connect(toolGainRef.current);
      }
      
      if (subAudioRef.current && !subSourceRef.current && !settings.subliminal.playInBackground) {
        subSourceRef.current = ctx.createMediaElementSource(subAudioRef.current);
        
        if (!subSpecificGainRef.current) {
          subSpecificGainRef.current = ctx.createGain();
        }
        if (!subCompRef.current) {
          subCompRef.current = ctx.createDynamicsCompressor();
          subCompRef.current.threshold.setValueAtTime(-24, ctx.currentTime);
          subCompRef.current.ratio.setValueAtTime(12, ctx.currentTime);
        }
        
        subSourceRef.current.connect(subCompRef.current);
        subCompRef.current.connect(subSpecificGainRef.current);

        if (!subSpatialRef.current) {
          subSpatialRef.current = createSpatialNodes(ctx);
        }
        updateSpatialEngine(subSpatialRef.current, settings.subliminal.spatial, isActuallyInLowPowerMode);
        subSpecificGainRef.current.connect(subSpatialRef.current.input);
        subSpatialRef.current.output.connect(toolGainRef.current);
      }
    } catch (err) {
      console.error("Audio tools setup failed:", err);
    }
  };

  // Handle Audio Tools Real-time Updates - Throttled for stability on iPhone 8
  const lastAppliedGainRef = useRef<number>(-999);
  const gainThrottleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      
      const updateNodes = () => {
        // Update Master Gain - Applying to ALL layers via masterGainRef
        if (masterGainRef.current) {
          const gainDb = Math.max(-60, Math.min(0, settings.audioTools.gainDb));
          const gainValue = Math.pow(10, gainDb / 20);
          masterGainRef.current.gain.setTargetAtTime(gainValue, ctx.currentTime, 0.05);
          lastAppliedGainRef.current = settings.audioTools.gainDb;
        }
        
        if (mainGainRef.current && !settings.audioTools.playInBackground) {
          const mainGainValue = Math.pow(10, settings.mainAudio.gainDb / 20);
          const finalVolume = settings.mainAudio.volume * mainGainValue;
          mainGainRef.current.gain.setTargetAtTime(finalVolume, ctx.currentTime, 0.05);
          lastAppliedGainRef.current = settings.mainAudio.gainDb;
        }

        // Update Subliminal Specific Gain & Normalize
        if (subSpecificGainRef.current) {
          const subGainValue = Math.pow(10, settings.subliminal.gainDb / 20);
          subSpecificGainRef.current.gain.setTargetAtTime(subGainValue, ctx.currentTime, 0.05);
        }
        if (subCompRef.current) {
          const threshold = settings.subliminal.normalize ? -24 : 0;
          subCompRef.current.threshold.setTargetAtTime(threshold, ctx.currentTime, 0.1);
        }
        
        // Update Normalization Compressor (Master)
        if (toolCompressorRef.current) {
          const targetDb = settings.audioTools.normalizeTargetDb !== null ? settings.audioTools.normalizeTargetDb : 0;
          toolCompressorRef.current.threshold.setTargetAtTime(targetDb, ctx.currentTime, 0.1);
        }
      };

      if (gainThrottleTimeoutRef.current) {
        clearTimeout(gainThrottleTimeoutRef.current);
      }

      // If it's a big jump or first time, update immediately
      if (Math.abs(lastAppliedGainRef.current - settings.audioTools.gainDb) > 2) {
        updateNodes();
      } else {
        // Otherwise throttle for smoothness and to prevent layout/engine thrashing
        gainThrottleTimeoutRef.current = window.setTimeout(updateNodes, 50);
      }
    }
    return () => {
      if (gainThrottleTimeoutRef.current) clearTimeout(gainThrottleTimeoutRef.current);
    };
  }, [settings.audioTools.gainDb, settings.audioTools.normalizeTargetDb, settings.subliminal.gainDb, settings.subliminal.normalize, settings.mainAudio.volume, settings.mainAudio.gainDb, settings.audioTools.playInBackground]);

  // Handle Background Toggles (Main/Sub) - Flush to un-hijack from Web Audio if needed
  useEffect(() => {
    if (mainAudioRef.current && mainSourceRef.current) {
      const curTime = mainAudioRef.current.currentTime;
      const wasPlaying = isPlaying;
      
      // We must neutralize the source ref and refresh the element to detach from Web Audio
      mainSourceRef.current.disconnect();
      mainSourceRef.current = null;
      mainGainRef.current = null;
      
      mainAudioRef.current.pause();
      mainAudioRef.current.src = "";
      mainAudioRef.current.load();
      
      setTimeout(() => {
        if (mainAudioRef.current && preparedUrl) {
          mainAudioRef.current.src = preparedUrl;
          mainAudioRef.current.currentTime = curTime;
          if (wasPlaying) mainAudioRef.current.play().catch(() => {});
        }
      }, 100);
    }
  }, [settings.audioTools.playInBackground]);

  useEffect(() => {
    if (subAudioRef.current && subSourceRef.current) {
      subSourceRef.current.disconnect();
      subSourceRef.current = null;
      subSpecificGainRef.current = null;
      
      subAudioRef.current.pause();
      subAudioRef.current.src = "";
      subAudioRef.current.load();
      
      setTimeout(() => {
        if (subAudioRef.current && preparedSubUrl) {
          subAudioRef.current.src = preparedSubUrl;
          if (isPlaying) subAudioRef.current.play().catch(() => {});
        }
      }, 100);
    }
  }, [settings.subliminal.playInBackground]);

  // Invalidate chunks if critical settings change
  useEffect(() => {
    // We only invalidate if in merge mode
    if (settings.chunking.mode === 'merge') {
      const invalidate = async () => {
        console.log("[AudioEngine] Invaliding chunks due to mainAudio changes");
        const chunks = await db.getAllChunkMetadata();
        for (const c of chunks) await db.deleteChunk(c.id);
        
        // If we were playing, we need to reload the current chunk source
        if (isPlaying && mainAudioRef.current) {
          activeChunkIdRef.current = null; // Force reload in applySources effect
        }
      };
      invalidate();
    }
  }, [settings.mainAudio.gainDb, settings.mainAudio.frequency]);

  // Main Audio Playback Loop - Chunk or Direct Path
  useEffect(() => {
    if (!mainAudioRef.current) return;
    const audio = mainAudioRef.current;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      // Only sync pause if it was an external pause (not from our own userTogglePlayback which sets isPlaying=false)
      // Actually syncing both is safer for UI consistency
      setIsPlaying(false);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    const handleTimeUpdate = async () => {
      // Chunk Transition Logic (Only if Merge Mode)
      if (settings.chunking.mode === 'merge' && audio.duration > 0 && audio.currentTime > audio.duration - 0.5) {
        // Prepare next chunk transition
        const { activePlaylistId, currentChunkIndex } = settings.chunking;
        const plan = chunkPlanRef.current;
        if (!plan || activePlaylistId !== plan.playlistId) return;

        const nextIdx = (currentChunkIndex + 1) >= plan.chunks.length ? (settings.playbackMode === 'loop' ? 0 : -1) : currentChunkIndex + 1;
        
        if (nextIdx === -1) {
          setIsPlaying(false);
          return;
        }

        const nextId = `chunk_${activePlaylistId}_${nextIdx}`;
        const nextBlob = await db.getTrackBlob(nextId);
        
        if (nextBlob) {
          console.log(`[AudioEngine] Transitioning to next chunk: ${nextId}`);
          const oldChunkId = `chunk_${activePlaylistId}_${currentChunkIndex}`;
          
          cleanupLastUrl();
          const url = URL.createObjectURL(nextBlob);
          lastMainUrlRef.current = url;
          audio.src = url;
          audio.load();
          audio.play().catch(console.error);

          // Calculate new track index
          let newTrackIdx = 0;
          for (let i = 0; i < nextIdx; i++) {
            newTrackIdx += plan.chunks[i].trackIds.length;
          }
          setCurrentTrackIndex(newTrackIdx);
          activeChunkIdRef.current = nextId;

          // Re-calculate track offsets for the next chunk
          const nextChunk = plan.chunks[nextIdx];
          const offsets = [];
          let currentOffset = 0;
          for (const tid of nextChunk.trackIds) {
            const d = await ChunkManager.getAudioDuration(tid);
            offsets.push({ start: currentOffset, duration: d });
            currentOffset += d;
          }
          trackOffsetsRef.current = offsets;

          updateSettings({
            chunking: {
              ...settings.chunking,
              currentChunkIndex: nextIdx,
              lastChunkPosition: 0,
              currentTrackIndex: newTrackIdx
            }
          });

          await db.deleteChunk(oldChunkId);
        }
      }

      if (settings.chunking.mode === 'merge') {
        const offsets = trackOffsetsRef.current;
        if (offsets.length === 0 && chunkPlanRef.current) {
          const chunk = chunkPlanRef.current.chunks[settings.chunking.currentChunkIndex];
          if (chunk) {
             const calc = async () => {
               const newOffsets = [];
               let currentOffset = 0;
               for (const tid of chunk.trackIds) {
                 const d = await ChunkManager.getAudioDuration(tid);
                 newOffsets.push({ start: currentOffset, duration: d });
                 currentOffset += d;
               }
               trackOffsetsRef.current = newOffsets;
             };
             calc();
          }
        }

        if (offsets.length > 0) {
          let found = false;
          for (let i = 0; i < offsets.length; i++) {
            const { start, duration: d } = offsets[i];
            if (audio.currentTime >= start && audio.currentTime < start + d) {
              setCurrentTime(audio.currentTime - start);
              setDuration(d);
              found = true;
              
              // Also sync track index if changed
              const plan = chunkPlanRef.current;
              if (plan) {
                let absoluteIdx = 0;
                for (let j = 0; j < settings.chunking.currentChunkIndex; j++) {
                  absoluteIdx += plan.chunks[j].trackIds.length;
                }
                absoluteIdx += i;
                if (absoluteIdx !== currentTrackIndex) {
                  setCurrentTrackIndex(absoluteIdx);
                }
              }
              break;
            }
          }
          if (!found && offsets.length > 0) {
             const last = offsets[offsets.length - 1];
             setCurrentTime(audio.currentTime - last.start);
             setDuration(last.duration);
          }
        } else {
          setCurrentTime(audio.currentTime);
          setDuration(audio.duration);
        }
      } else {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    
    // Initial volume
    audio.volume = settings.mainAudio.volume;

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [isPlaying, settings.chunking, settings.playbackMode, settings.loop, playNext, settings.mainAudio.volume]);

  // Handle Main Track Source Change (Mode Aware)
  useEffect(() => {
    if (!mainAudioRef.current) return;
    const audio = mainAudioRef.current;
    
    const applySources = async () => {
      if (settings.chunking.mode === 'merge') {
        const { activePlaylistId, currentChunkIndex, lastChunkPosition } = settings.chunking;
        if (!activePlaylistId) {
          audio.pause();
          audio.src = "";
          return;
        }

        const chunkId = `chunk_${activePlaylistId}_${currentChunkIndex}`;
        if (activeChunkIdRef.current === chunkId) return;

        const blob = await db.getTrackBlob(chunkId);
        if (blob) {
          cleanupLastUrl();
          const url = URL.createObjectURL(blob);
          lastMainUrlRef.current = url;
          audio.src = url;
          audio.currentTime = lastChunkPosition;
          audio.load();
          if (isPlaying) audio.play().catch(console.error);
          activeChunkIdRef.current = chunkId;

          // Pre-calculate track offsets for this chunk
          const plan = chunkPlanRef.current;
          if (plan) {
            const chunk = plan.chunks[currentChunkIndex];
            const offsets = [];
            let currentOffset = 0;
            for (const tid of chunk.trackIds) {
              const d = await ChunkManager.getAudioDuration(tid);
              offsets.push({ start: currentOffset, duration: d });
              currentOffset += d;
            }
            trackOffsetsRef.current = offsets;
            console.log(`[AudioEngine] Calculated ${offsets.length} track offsets for chunk ${currentChunkIndex}`);
          }
        } else if (isPlaying) {
          // If playing but blob missing, potential stall. Fallback to heartbeat.
          console.warn(`[AudioEngine] Chunk ${chunkId} blob missing during playback. Falling back to heartbeat.`);
          updateSettings({ chunking: { ...settings.chunking, mode: 'heartbeat' } });
        }
      } else {
        // Heartbeat / Standard Mode: Use track URLs directly
        if (preparedUrl) {
          if (audio.src !== preparedUrl) {
            console.log(`[AudioEngine] Setting direct source: ${preparedUrl}`);
            audio.src = preparedUrl;
            audio.load();
            if (isPlaying) audio.play().catch(console.error);
            activeChunkIdRef.current = null; // Clear chunk tracking
          }
        } else {
          // No track prepared, but we might be in middle of something
          if (!isPlaying && !currentTrack) {
            audio.pause();
            audio.src = "";
          }
        }
      }
    };
    
    applySources();
  }, [settings.chunking.activePlaylistId, settings.chunking.currentChunkIndex, settings.chunking.mode, isPlaying, preparedUrl]);

  // Final Stability Sync & Media Session State
  useEffect(() => {
    if (!mainAudioRef.current) return;
    const audio = mainAudioRef.current;

    if (isPlaying) {
      // 1. Resume Context (Critical for iOS 16)
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      
      // 2. Play if paused
      if (audio.paused && audio.src) {
        audio.play().catch(e => {
          console.warn("[Stability] Background play blocked:", e);
          if (e.name === 'NotAllowedError') showToast("Tap to enable audio");
        });
      }

      // 3. MediaSession State
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    } else {
      if (!audio.paused) audio.pause();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    }
  }, [isPlaying, currentTrack]);

  // Redundant Stability effects removed (Consolidated into runHealthCheck and Final Stability Sync)

  // Handle Subliminal Playback State (Independent from Main if Background is ON)
  useEffect(() => {
    if (!subAudioRef.current) return;
    
    const isLayerPlaying = (isPlaying || settings.subliminal.playInBackground || settings.globalModes.backgroundMode) && settings.subliminal.isEnabled && settings.globalModes.masterAudioEnabled;
    const audio = subAudioRef.current;

    if (isLayerPlaying && subTrack && preparedSubUrl && !subTrack.isMissing) {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }

      const playSub = () => {
        if (audio.src !== preparedSubUrl) {
          audio.src = preparedSubUrl;
          audio.load();
        }
        audio.loop = settings.subliminal.isPlaylistMode ? false : settings.subliminal.isLooping;
        
        // Background support for Subliminal - Parallel Stable Mode
        if (settings.subliminal.playInBackground || isPlaying) {
          if (subSourceRef.current) {
             try { subSourceRef.current.disconnect(); } catch (e) {}
          }
          const gainValue = settings.subliminal.volume * Math.pow(10, settings.subliminal.gainDb / 20) * safetyMultiplier;
          audio.volume = Math.min(1, Math.max(0, gainValue));
        } else {
          setupAudioTools();
          if (subSourceRef.current && subCompRef.current) {
            subSourceRef.current.connect(subCompRef.current);
          }
          audio.volume = 1.0;
        }

        if (audio.paused) {
          audio.play().catch(console.error);
        }
      };

      if (isPlaying) {
        delayTimeoutRef.current = window.setTimeout(playSub, settings.subliminal.delayMs);
      } else {
        playSub();
      }
    } else {
      audio.pause();
      if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);
    }
    
    return () => {
        if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);
    };
  }, [isPlaying, settings.subliminal.isEnabled, settings.subliminal.playInBackground, settings.subliminal.isLooping, settings.subliminal.isPlaylistMode, subTrack, preparedSubUrl, settings.subliminal.spatial]);

  // Dynamic Audio Layer Management (The Registry Engine)
  useEffect(() => {
    Object.entries(AUDIO_LAYER_REGISTRY).forEach(([id, registry]) => {
      const layerSettings = settings.layers[id];
      if (!layerSettings) return;

      const isBg = layerSettings.playInBackground || settings.globalModes.backgroundMode;
      const isLayerPlaying = layerSettings.isEnabled && (isPlaying || isBg) && settings.globalModes.masterAudioEnabled;

      // Builder for type-specific params
      const getParams = () => {
        const base = {
          frequency: getEffectiveFrequency(layerSettings.frequency),
          pitchSafeMode: getEffectivePitchMode(layerSettings.pitchSafeMode),
          normalize: layerSettings.normalize
        };

        if (id === 'binaural') return { ...base, leftFreq: getEffectiveFrequency(layerSettings.leftFreq), rightFreq: getEffectiveFrequency(layerSettings.rightFreq) };
        if (id === 'noise') return { ...base, noiseType: layerSettings.type };
        if (id === 'didgeridoo') return { ...base, depth: layerSettings.depth };
        if (id === 'shamanic') return { ...base, depth: layerSettings.depth, playbackRate: layerSettings.playbackRate, interval: layerSettings.interval };
        if (id === 'isochronic') return { ...base, pulseRate: layerSettings.pulseRate };
        if (id === 'mentalToughness') return { ...base, pitch: layerSettings.pitch, texture: layerSettings.texture, intensity: layerSettings.intensity, interval: layerSettings.interval };
        if (id === 'dualMode') return { ...base, tempo: layerSettings.tempo, intensity: layerSettings.intensity, texture: layerSettings.texture, mixBalance: layerSettings.mixBalance };
        if (id === 'nature') return { 
          ...base, 
          url: NATURE_SOUNDS.find(s => s.id === layerSettings.type)?.url || '', 
          frequency: getEffectiveFrequency(layerSettings.frequency) 
        };
        
        return base;
      };

      const type = id === 'schumann' ? 'pureHz' : id;
      syncBgLayer(id, isLayerPlaying, type, getParams(), layerSettings.volume, layerSettings.gainDb);
    });
  }, [isPlaying, settings.globalModes, settings.layers, settings.fadeInOut, settings.syncLab, safetyMultiplier, getEffectiveFrequency, getEffectivePitchMode, syncBgLayer]);

  // Handle Main & Subliminal Audio Spatial Updates
  useEffect(() => {
    if (mainSpatialRef.current) {
      updateSpatialEngine(mainSpatialRef.current, settings.mainAudio.spatial, isActuallyInLowPowerMode);
    }
  }, [settings.mainAudio.spatial, isActuallyInLowPowerMode]);

  useEffect(() => {
    if (subSpatialRef.current) {
      updateSpatialEngine(subSpatialRef.current, settings.subliminal.spatial, isActuallyInLowPowerMode);
    }
  }, [settings.subliminal.spatial, isActuallyInLowPowerMode]);

  // Redundant Stability Sync removed (Consolidated above with main health loop)
  
  // Handle Volume Balance removed (Consolidated above)

  // Handle Playback Rate
  useEffect(() => {
    if (mainAudioRef.current) {
      // Apply combine playback rate: Global Rate * Tuning Frequency
      // We assume 432Hz is the 'original' or 'neutral' frequency for the app's internal standard
      const tuningMultiplier = getEffectiveFrequency(settings.mainAudio.frequency) / 432;
      mainAudioRef.current.playbackRate = settings.playbackRate * tuningMultiplier;
    }
  }, [settings.playbackRate, settings.mainAudio.frequency, currentTrack, getEffectiveFrequency]);

  // Sync Subliminal with Main Track if enabled
  useEffect(() => {
    if (isPlaying && settings.syncPlayback && settings.subliminal.isEnabled && mainAudioRef.current && subAudioRef.current && !settings.subliminal.isPlaylistMode) {
      const syncInterval = setInterval(() => {
        if (mainAudioRef.current && subAudioRef.current && subAudioRef.current.readyState >= 2) {
          const mainTime = mainAudioRef.current.currentTime;
          const subTime = subAudioRef.current.currentTime;
          const duration = subAudioRef.current.duration;
          
          if (duration > 0) {
             const targetTime = mainTime % duration;
             const diff = Math.abs(targetTime - subTime);
             
             // Only sync if they drift by more than 0.5s to avoid stutter
             if (diff > 0.5) {
               subAudioRef.current.currentTime = targetTime;
             }
          }
        }
      }, 2000);
      return () => clearInterval(syncInterval);
    }
  }, [isPlaying, settings.syncPlayback, settings.subliminal.isEnabled, settings.subliminal.isPlaylistMode]);

  // Handle Subliminal Looping State
  useEffect(() => {
    if (subAudioRef.current) {
      subAudioRef.current.loop = settings.subliminal.isPlaylistMode ? false : settings.subliminal.isLooping;
    }
  }, [settings.subliminal.isLooping, settings.subliminal.isPlaylistMode]);

  // Handle Safe Idle Engine (Heartbeat) - Keeps audio context alive on iOS 16
  useEffect(() => {
    if (!heartbeatAudioRef.current) return;
    const hb = heartbeatAudioRef.current;
    
    // Always keep heartbeat alive if master audio is enabled, 
    // but drop to truly silent if other layers are active and covering the floor
    const isQuiet = !isPlaying && !hasAnyLayerEnabled;
    const volume = isQuiet ? settings.safeIdle.volume : 0.0001;
    
    if (settings.globalModes.masterAudioEnabled) {
      hb.volume = volume;
      if (hb.paused) {
        hb.play().catch(() => {
          // Playback might be blocked until first user interaction
        });
      }
    } else {
      hb.pause();
    }
  }, [isPlaying, hasAnyLayerEnabled, settings.safeIdle, settings.globalModes.masterAudioEnabled]);

  return null;
}
