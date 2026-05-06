import { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from 'react';

interface LayerProgress {
  currentTime: number;
  duration: number;
}

interface PlaybackState {
  currentTime: number;
  duration: number;
  progress: number;
  isPlaying: boolean;
  currentTrackIndex: number | null;
  playingPlaylistId: string | null;
  layerProgress: Record<string, LayerProgress>;
}

interface PlaybackContextType extends PlaybackState {
  // Actions
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentTrackIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setPlayingPlaylistId: React.Dispatch<React.SetStateAction<string | null>>;
  
  // High-frequency subscription
  subscribeToUpdates: (callback: (state: { 
    currentTime: number; 
    duration: number; 
    progress: number;
    layerProgress: Record<string, LayerProgress>;
  }) => void) => () => void;
  
  updateLayerProgress: (layerId: string, progress: LayerProgress) => void;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  // Reactive state for things that don't update many times per second
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [playingPlaylistId, setPlayingPlaylistId] = useState<string | null>(null);
  const [duration, setDurationState] = useState(0);
  const [currentTimeStable, setCurrentTimeStable] = useState(0); 
  const [layerProgressStable, setLayerProgressStable] = useState<Record<string, LayerProgress>>({});

  // Non-reactive refs for high-frequency data
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const layerProgressRef = useRef<Record<string, LayerProgress>>({});
  const listenersRef = useRef<Set<(state: { 
    currentTime: number; 
    duration: number; 
    progress: number;
    layerProgress: Record<string, LayerProgress>;
  }) => void>>(new Set());

  // Notify listeners
  const notifyListeners = useCallback(() => {
    const progress = durationRef.current > 0 ? (currentTimeRef.current / durationRef.current) * 100 : 0;
    const state = { 
      currentTime: currentTimeRef.current, 
      duration: durationRef.current, 
      progress,
      layerProgress: { ...layerProgressRef.current }
    };
    
    listenersRef.current.forEach(callback => callback(state));
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    currentTimeRef.current = time;
    if (Math.abs(time - currentTimeStable) > 5) {
      setCurrentTimeStable(time);
    }
    notifyListeners();
  }, [currentTimeStable, notifyListeners]);

  const setDuration = useCallback((d: number) => {
    durationRef.current = d;
    setDurationState(d);
    notifyListeners();
  }, [notifyListeners]);

  const subscribeToUpdates = useCallback((callback: (state: { 
    currentTime: number; 
    duration: number; 
    progress: number;
    layerProgress: Record<string, LayerProgress>;
  }) => void) => {
    listenersRef.current.add(callback);
    const progress = durationRef.current > 0 ? (currentTimeRef.current / durationRef.current) * 100 : 0;
    callback({ 
      currentTime: currentTimeRef.current, 
      duration: durationRef.current, 
      progress,
      layerProgress: { ...layerProgressRef.current }
    });
    
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);

  const updateLayerProgress = useCallback((layerId: string, progress: LayerProgress) => {
    layerProgressRef.current[layerId] = progress;
    
    // Periodically sync stable state for rare reactive needs
    const prev = layerProgressStable[layerId];
    if (!prev || Math.abs(prev.currentTime - progress.currentTime) > 10) {
      setLayerProgressStable(prev => ({ ...prev, [layerId]: progress }));
    }
    
    notifyListeners();
  }, [layerProgressStable, notifyListeners]);

  const progressStable = duration > 0 ? (currentTimeStable / duration) * 100 : 0;

  return (
    <PlaybackContext.Provider value={{
      currentTime: currentTimeStable,
      duration,
      progress: progressStable,
      isPlaying,
      currentTrackIndex,
      playingPlaylistId,
      layerProgress: layerProgressStable,
      setCurrentTime,
      setDuration,
      setIsPlaying,
      setCurrentTrackIndex,
      setPlayingPlaylistId,
      subscribeToUpdates,
      updateLayerProgress
    }}>
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context = useContext(PlaybackContext);
  if (context === undefined) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
}

export function usePlaybackProgress() {
  const { subscribeToUpdates } = usePlayback();
  const [data, setData] = useState({ 
    currentTime: 0, 
    duration: 0, 
    progress: 0,
    layerProgress: {} as Record<string, LayerProgress>
  });

  useEffect(() => {
    let lastUpdate = 0;
    return subscribeToUpdates((state) => {
      const now = Date.now();
      if (now - lastUpdate > 300) { // 300ms throttle
        setData(state);
        lastUpdate = now;
      }
    });
  }, [subscribeToUpdates]);

  return data;
}
