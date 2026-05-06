import React from 'react';
import { useSettings } from '../SettingsContext';
import { useAudio } from '../AudioContext';
import { Section } from './SettingsUI';
import { 
  Timer, Repeat, Repeat1, Shuffle, Monitor, Activity, 
  Clock, History 
} from 'lucide-react';
import { motion } from 'motion/react';
import { HzProfiles } from './HzProfiles';
import { NumericKeypadInput } from './NumericKeypadInput';

export const PlaybackSettingsContent = ({ isPanel = false }: { isPanel?: boolean }) => {
  const { settings, updateSettings, updateSleepTimer } = useSettings();
  const { toggleShuffle } = useAudio();

  const isMini = settings.appearance.uiMode === 'mini';

  return (
    <div className={`flex flex-col ${isPanel ? (isMini ? 'gap-3' : 'gap-4') : 'gap-3'}`}>
      {/* 1. Playback Strategy */}
      <Section
        id="playback-strategy"
        title="Playback Strategy"
        subtitle={settings.chunking.mode === 'heartbeat' ? 'Heartbeat Mode' : 'Merge Mode'}
        icon={Activity}
        color="bg-system-red/10 text-system-red"
      >
        <div className="flex flex-col gap-4">
          <div className="bg-secondary-system-background p-1 rounded-2xl flex items-center h-10 border border-apple-border">
            <button 
              onClick={() => updateSettings({ chunking: { ...settings.chunking, mode: 'heartbeat' } })}
              className={`flex-1 h-full rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${settings.chunking.mode === 'heartbeat' ? 'bg-system-background text-system-red shadow-sm' : 'text-system-secondary-label'}`}
            >
              Heartbeat
            </button>
            <button 
              onClick={() => updateSettings({ chunking: { ...settings.chunking, mode: 'merge' } })}
              className={`flex-1 h-full rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${settings.chunking.mode === 'merge' ? 'bg-system-background text-system-red shadow-sm' : 'text-system-secondary-label'}`}
            >
              Merge
            </button>
          </div>

          {settings.chunking.mode === 'heartbeat' ? (
            <p className="text-[10px] text-system-secondary-label leading-relaxed px-1">
              Maintains reliable background playback on iOS. Pure Heartbeat is silent; it supports main audio.
            </p>
          ) : (
            <div className="space-y-3 px-1">
              <p className="text-[10px] text-system-secondary-label leading-relaxed">
                Merges playlist tracks into chunks for seamless transitions.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-system-secondary-label uppercase">Chunk Size</span>
                <select
                  value={settings.chunking.sizeMinutes}
                  onChange={(e) => updateSettings({ chunking: { ...settings.chunking, sizeMinutes: parseInt(e.target.value) } })}
                  className="bg-system-background border border-apple-border rounded-lg text-[10px] font-black px-2 py-1 outline-none"
                >
                  {[3, 5, 10, 15, 20].map(mins => (
                    <option key={mins} value={mins}>
                      {mins} Min {mins === 3 ? '(Recommended / Stable)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* 2. Timing & Speed */}
      <Section
        id="timing-speed"
        title="Time & Speed"
        subtitle={`${settings.playbackRate}x • ${settings.sleepTimer.isEnabled ? 'Timer ON' : 'Rate'}`}
        icon={Timer}
        color="bg-system-purple/10 text-system-purple"
      >
        <div className="flex flex-col gap-6">
          {/* Speed */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-system-secondary-label">Playback Speed</label>
            <div className="grid grid-cols-4 gap-2">
              {[0.8, 1.0, 1.2, 1.5].map(speed => (
                <button
                  key={speed}
                  onClick={() => updateSettings({ playbackRate: speed })}
                  className={`py-2 rounded-xl border text-[10px] font-black transition-all ${settings.playbackRate === speed ? 'bg-system-purple text-white border-system-purple shadow-sm' : 'bg-system-background border-apple-border text-system-secondary-label hover:bg-secondary-system-background/50'}`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Loop Options */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-system-secondary-label">Loop Options</label>
            <div className="grid grid-cols-3 gap-2">
               <button 
                 onClick={() => updateSettings({ loop: settings.loop === 'all' ? 'none' : 'all' })}
                 className={`flex flex-col items-center gap-2 py-3 rounded-2xl border transition-all ${settings.loop === 'all' ? 'bg-system-purple border-system-purple text-white shadow-md' : 'bg-system-background border-apple-border text-system-secondary-label hover:bg-secondary-system-background/50'}`}
               >
                 <Repeat size={16} />
                 <span className="text-[9px] font-black uppercase">All</span>
               </button>
               <button 
                 onClick={() => updateSettings({ loop: settings.loop === 'one' ? 'none' : 'one' })}
                 className={`flex flex-col items-center gap-2 py-3 rounded-2xl border transition-all ${settings.loop === 'one' ? 'bg-system-purple border-system-purple text-white shadow-md' : 'bg-system-background border-apple-border text-system-secondary-label hover:bg-secondary-system-background/50'}`}
               >
                 <Repeat1 size={16} />
                 <span className="text-[9px] font-black uppercase">One</span>
               </button>
               <button 
                 onClick={() => toggleShuffle()}
                 className={`flex flex-col items-center gap-2 py-3 rounded-2xl border transition-all ${settings.shuffle ? 'bg-system-orange border-system-orange text-white shadow-md' : 'bg-system-background border-apple-border text-system-secondary-label hover:bg-secondary-system-background/50'}`}
               >
                 <Shuffle size={16} />
                 <span className="text-[9px] font-black uppercase">Shuffle</span>
               </button>
            </div>
            <div className="flex bg-secondary-system-background rounded-2xl p-1 border border-apple-border mt-1">
              <button 
                onClick={() => updateSettings({ playbackMode: 'once' })}
                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${settings.playbackMode === 'once' ? 'bg-system-background text-system-purple shadow-sm' : 'text-system-secondary-label hover:text-system-purple/70'}`}
              >
                Once
              </button>
              <button 
                onClick={() => updateSettings({ playbackMode: 'loop' })}
                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${settings.playbackMode === 'loop' ? 'bg-system-background text-system-purple shadow-sm' : 'text-system-secondary-label hover:text-system-purple/70'}`}
              >
                Playlist
              </button>
            </div>
          </div>

          {/* Sleep Timer */}
          <div className="flex flex-col gap-4 p-4 bg-secondary-system-background/50 rounded-2xl border border-apple-border paper-emboss">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <Clock size={16} className={settings.sleepTimer.isEnabled ? 'text-system-purple' : 'text-system-secondary-label'} />
                 <span className="text-xs font-bold text-system-label">Sleep Timer</span>
               </div>
               <button 
                 onClick={() => updateSleepTimer({ isEnabled: !settings.sleepTimer.isEnabled, remainingSeconds: !settings.sleepTimer.isEnabled ? settings.sleepTimer.minutes * 60 : null })}
                 className={`w-8 h-4 rounded-full relative transition-colors ${settings.sleepTimer.isEnabled ? 'bg-system-purple' : 'bg-system-tertiary-label'}`}
               >
                 <motion.div className="absolute top-0.5 left-0.5 bg-tertiary-system-background w-3 h-3 rounded-full" animate={{ x: settings.sleepTimer.isEnabled ? 16 : 0 }} />
               </button>
             </div>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <NumericKeypadInput 
                   value={settings.sleepTimer.minutes}
                   onCommit={(v) => updateSleepTimer({ minutes: Math.max(1, v) })}
                   min={1}
                   max={480}
                   className="w-16 h-8 bg-system-background rounded-lg border border-apple-border text-[11px] font-black text-center focus:ring-1 focus:ring-system-purple outline-none"
                 />
                 <span className="text-[9px] font-bold text-system-secondary-label uppercase">Min</span>
               </div>
               {settings.sleepTimer.isEnabled && settings.sleepTimer.remainingSeconds !== null && (
                 <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-system-background border border-apple-border rounded-full shadow-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-system-blue animate-pulse" />
                   <span className="text-[10px] font-black text-system-purple tabular-nums">
                     {Math.floor(settings.sleepTimer.remainingSeconds / 60)}:{(settings.sleepTimer.remainingSeconds % 60).toString().padStart(2, '0')}
                   </span>
                 </div>
               )}
             </div>
          </div>
        </div>
      </Section>

      {/* 3. Audio Control & Safety */}
      <Section
        id="audio-control-safety"
        title="Control & Safety"
        subtitle="Optimization"
        icon={Activity}
        color="bg-system-blue/10 text-system-blue"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 bg-secondary-system-background/50 rounded-2xl border border-apple-border">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-system-label">Always Loop Main</span>
              <span className="text-[9px] text-system-secondary-label">Continuous playback regardless of mode</span>
            </div>
            <button 
              onClick={() => updateSettings({ alwaysLoopMain: !settings.alwaysLoopMain })}
              className={`w-10 h-5 rounded-full relative transition-colors ${settings.alwaysLoopMain ? 'bg-system-blue' : 'bg-system-tertiary-label'}`}
            >
              <motion.div 
                className="absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-sm" 
                animate={{ x: settings.alwaysLoopMain ? 20 : 0 }} 
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary-system-background/50 rounded-2xl border border-apple-border">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-system-label">Hz Auto-Scaling</span>
              <span className="text-[9px] text-system-secondary-label">Balance Hz tiers if Main stops</span>
            </div>
            <button 
              onClick={() => updateSettings({ hzAutoScaling: !settings.hzAutoScaling })}
              className={`w-10 h-5 rounded-full relative transition-colors ${settings.hzAutoScaling ? 'bg-system-blue' : 'bg-system-tertiary-label'}`}
            >
              <motion.div 
                className="absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-sm" 
                animate={{ x: settings.hzAutoScaling ? 20 : 0 }} 
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      </Section>

      {/* 4. Hz Profiles */}
      <Section
        id="hz-profiles-playback"
        title="Hz Profiles"
        subtitle="Manage Presets"
        icon={History}
        color="bg-system-purple/10 text-system-purple"
      >
        <HzProfiles nested />
      </Section>

      {/* 5. Display Settings */}
      <Section
        id="playback-display"
        title="Display Settings"
        subtitle="Always ON"
        icon={Monitor}
        color="bg-system-orange/10 text-system-orange"
        isEnabled={settings.displayAlwaysOn}
        onToggle={(v: boolean) => updateSettings({ displayAlwaysOn: v })}
      >
        <p className="text-[10px] text-system-secondary-label font-bold leading-tight">Prevent screen sleep during deep sessions.</p>
      </Section>
    </div>
  );
};
