import * as db from '../db';
import { Track } from '../types';

const MAX_CHUNK_DURATION = 3 * 60; // 3 minutes - Safe for iPhone 8 RAM
const SAMPLE_RATE = 44100;

export interface ChunkPlan {
  playlistId: string;
  chunks: {
    index: number;
    trackIds: string[];
    startOffsetInFirstTrack: number; // For partial tracks if we ever need them
  }[];
}

export class ChunkManager {
  static async createChunkPlan(playlistId: string, tracks: Track[], maxDurationMinutes: number = 3): Promise<ChunkPlan> {
    // Safety: iPhone 8 heuristic - fallback to 3 mins if higher is requested but possibly unstable
    let targetMaxMinutes = maxDurationMinutes;
    const isLegacyDevice = typeof window !== 'undefined' && 
                          (/iPhone/i.test(navigator.userAgent) && window.screen.height < 700); // iPhone 8/SE heuristic
    
    if (isLegacyDevice && targetMaxMinutes > 3) {
      console.warn("[ChunkManager] Legacy device detected. Capping chunk duration at 3 minutes for stability.");
      targetMaxMinutes = 3;
    }

    const maxDurationSeconds = targetMaxMinutes * 60;
    const plan: ChunkPlan = { playlistId, chunks: [] };
    let currentChunkTracks: string[] = [];
    let currentChunkDuration = 0;
    let chunkIndex = 0;

    for (const track of tracks) {
      let duration = track.duration || 0;
      if (duration === 0) {
        duration = await this.getAudioDuration(track.id);
      }
      
      if (duration <= 0) {
        console.warn(`[ChunkManager] Skipping track ${track.id} due to zero duration.`);
        continue;
      }
      
      // If a single track is longer than maxDuration, it gets its own chunk
      if (currentChunkDuration + duration > maxDurationSeconds && currentChunkTracks.length > 0) {
        plan.chunks.push({
          index: chunkIndex++,
          trackIds: [...currentChunkTracks],
          startOffsetInFirstTrack: 0
        });
        currentChunkTracks = [track.id];
        currentChunkDuration = duration;
      } else {
        currentChunkTracks.push(track.id);
        currentChunkDuration += duration;
      }
    }

    if (currentChunkTracks.length > 0) {
      plan.chunks.push({
        index: chunkIndex++,
        trackIds: currentChunkTracks,
        startOffsetInFirstTrack: 0
      });
    }

    return plan;
  }

  private static durationCache: Record<string, number> = {};

  public static async getAudioDuration(trackId: string): Promise<number> {
    if (this.durationCache[trackId]) return this.durationCache[trackId];
    
    const blob = await db.getTrackBlob(trackId);
    if (!blob) return 0;

    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(blob);
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        this.durationCache[trackId] = audio.duration;
        resolve(audio.duration);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(0);
      };
      audio.src = url;
    });
  }

  static async renderChunk(playlistId: string, chunkIndex: number, trackIds: string[], volume: number = 1.0, gainDb: number = 0, frequency: number = 432, retryCount = 0): Promise<{ blob: Blob; duration: number } | null> {
    try {
      const chunkId = `chunk_${playlistId}_${chunkIndex}`;
      console.log(`[ChunkManager] Rendering ${chunkId} (Memory-Optimized)... Attempt: ${retryCount + 1}`);

      let totalDuration = 0;
      const trackDurations: number[] = [];
      const playbackRate = frequency / 432;

      // Pass 1: Get total duration without keeping full buffers
      for (const tid of trackIds) {
        const d = await this.getAudioDuration(tid);
        if (d > 0) {
          trackDurations.push(d);
          // Duration in the chunk is original duration / playbackRate
          totalDuration += d / playbackRate;
        }
      }

      if (totalDuration === 0 || trackDurations.length === 0) {
        console.warn(`[ChunkManager] Chunk ${chunkId} has 0 duration or no valid tracks. Skipping.`);
        return null;
      }

      const OfflineCtx = typeof window !== 'undefined' ? (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext) : null;
      if (!OfflineCtx) throw new Error("OfflineAudioContext not supported");
      
      // Safety: Heuristic for iOS memory pressure. 
      // If duration is very long (> 25 mins), it might fail on iPhone 8.
      if (totalDuration > 1500) { 
        console.warn(`[ChunkManager] Chunk ${chunkId} duration (${totalDuration}s) exceeds stability recommendation for low-memory devices.`);
      }

      const offlineCtx = new OfflineCtx(2, Math.ceil(totalDuration * SAMPLE_RATE), SAMPLE_RATE);
      const mainGain = offlineCtx.createGain();
      const dbMultiplier = Math.pow(10, gainDb / 20);
      mainGain.gain.setValueAtTime(volume * dbMultiplier, 0);
      mainGain.connect(offlineCtx.destination);

      const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null;
      const tempCtx = AudioCtx ? new AudioCtx() : null;

      // Pass 2: Decode and schedule one by one
      let offset = 0;
      for (let i = 0; i < trackIds.length; i++) {
        const tid = trackIds[i];
        const blob = await db.getTrackBlob(tid);
        if (!blob) continue;
        
        try {
          const arrayBuffer = await blob.arrayBuffer();
          if (tempCtx) {
            const buffer = await tempCtx.decodeAudioData(arrayBuffer);
            const source = offlineCtx.createBufferSource();
            source.buffer = buffer;
            source.playbackRate.value = playbackRate;
            source.connect(mainGain);
            source.start(offset);
            offset += buffer.duration / playbackRate;
          }
        } catch (decodeErr) {
          console.error(`[ChunkManager] Failed to decode track ${tid} during chunking:`, decodeErr);
          // We continue to avoid failing the whole chunk if just one track is corrupted
        }
      }

      const renderedBuffer = await offlineCtx.startRendering();
      if (tempCtx) await tempCtx.close();

      const blob = this.audioBufferToWav(renderedBuffer);
      
      // Validation: Ensure blob is not empty and has a reasonable size
      if (blob.size < 1000) {
        throw new Error("Rendered blob is suspiciously small (corrupted)");
      }

      return { blob, duration: totalDuration };
    } catch (err) {
      console.error("[ChunkManager] Render failed:", err);
      if (retryCount < 1) {
        console.log("[ChunkManager] Retrying render...");
        return this.renderChunk(playlistId, chunkIndex, trackIds, volume, gainDb, frequency, retryCount + 1);
      }
      return null;
    }
  }

  private static audioBufferToWav(buffer: AudioBuffer): Blob {
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
  }
}
