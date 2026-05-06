import { AudioLayerRegistry } from '../types';

export const AUDIO_LAYER_REGISTRY: AudioLayerRegistry = {
  binaural: {
    id: 'binaural',
    name: 'Binaural Beats',
    group: 'hz',
    icon: 'Waves',
    color: 'text-system-blue',
    defaultHz: 110,
    description: 'Precision binaural offset for brainwave entrainment.',
    version: '2.0.0'
  },
  nature: {
    id: 'nature',
    name: 'Nature Ambient',
    group: 'ambient',
    icon: 'Mountain',
    color: 'text-system-green',
    defaultHz: 432,
    description: 'High-fidelity wilderness recordings.',
    version: '1.5.0'
  },
  noise: {
    id: 'noise',
    name: 'Signal Noise',
    group: 'ambient',
    icon: 'Radio',
    color: 'text-system-gray',
    defaultHz: 110,
    description: 'White, Pink, and Brownian masking frequencies.',
    version: '1.2.0'
  },
  pureHz: {
    id: 'pureHz',
    name: 'Pure Frequency',
    group: 'hz',
    icon: 'Zap',
    color: 'text-system-yellow',
    defaultHz: 432,
    description: 'Mathematically perfect sine waves.',
    version: '1.0.0'
  },
  isochronic: {
    id: 'isochronic',
    name: 'Isochronic Tones',
    group: 'hz',
    icon: 'Activity',
    color: 'text-system-purple',
    defaultHz: 432,
    description: 'Pulsed frequencies for deep focus.',
    version: '1.1.0'
  },
  solfeggio: {
    id: 'solfeggio',
    name: 'Solfeggio Frequencies',
    group: 'hz',
    icon: 'Music',
    color: 'text-system-pink',
    defaultHz: 528,
    description: 'Ancient harmonic healing frequencies.',
    version: '1.0.0'
  },
  schumann: {
    id: 'schumann',
    name: 'Schumann Resonance',
    group: 'hz',
    icon: 'Earth',
    color: 'text-system-orange',
    defaultHz: 7.83,
    description: 'Earth’s electromagnetic frequency.',
    version: '1.0.0'
  },
  didgeridoo: {
    id: 'didgeridoo',
    name: 'Didgeridoo Drone',
    group: 'special',
    icon: 'Wind',
    color: 'text-system-orange',
    defaultHz: 68,
    description: 'Low-frequency aboriginal woodwind drone.',
    version: '1.3.0'
  },
  shamanic: {
    id: 'shamanic',
    name: 'Shamanic Drum',
    group: 'special',
    icon: 'Music',
    color: 'text-system-red',
    defaultHz: 110,
    description: 'Rhythmic tribal percussion loops.',
    version: '1.2.0'
  },
  mentalToughness: {
    id: 'mentalToughness',
    name: 'Mental Toughness',
    group: 'special',
    icon: 'Shield',
    color: 'text-system-red',
    defaultHz: 196,
    description: 'High-intensity cognitive conditioning tones.',
    version: '1.4.0'
  },
  dualMode: {
    id: 'dualMode',
    name: 'Dual Mode (Didg + Drum)',
    group: 'special',
    icon: 'Drum',
    color: 'text-system-orange',
    defaultHz: 68,
    description: 'Unified tribal soundscape engine.',
    version: '1.0.0'
  }
};
