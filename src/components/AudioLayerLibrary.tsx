import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../SettingsContext';
import { useAudio } from '../AudioContext';
import { 
  LayerAccordion, 
  HzSettingsPanel, 
  SpatialLayerDepthEngineUI, 
  PhysicalSoundEngineUI,
  HzSelector
} from './LayerUI';
import { NATURE_SOUNDS } from '../constants';
import { AUDIO_LAYER_REGISTRY } from '../constants/layers';
import { 
  Volume2, Activity, Mountain, Radio, Drum, Wind, 
  Music as MusicIcon, Zap, Sliders, Ear, Shield, 
  ChevronDown, ChevronRight, Layers, Waves, Earth,
  Cpu, Box, Settings2, Sparkles, Brain
} from 'lucide-react';
import { HzProfiles } from './HzProfiles';

const NestedSection = ({ 
  id, 
  icon: Icon, 
  label, 
  subtitle, 
  isOpen, 
  onToggle, 
  children 
}: { 
  id: string, 
  icon: any, 
  label: string, 
  subtitle: string, 
  isOpen: boolean, 
  onToggle: () => void, 
  children: React.ReactNode 
}) => (
  <div className={`transition-all duration-300 ${isOpen ? 'bg-secondary-system-background/20 -mx-4 px-4 py-2 border-y border-apple-border/10' : ''}`}>
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-system-label text-white scale-110 shadow-sm' : 'bg-apple-border/20 text-system-tertiary-label'}`}>
          <Icon size={14} />
        </div>
        <div className="flex flex-col items-start">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isOpen ? 'text-system-label' : 'text-system-secondary-label'}`}>{label}</span>
          <span className="text-[7px] font-bold text-system-tertiary-label uppercase">{subtitle}</span>
        </div>
      </div>
      <ChevronRight size={16} className={`text-system-tertiary-label transition-transform duration-300 ${isOpen ? 'rotate-90 text-system-label' : ''}`} />
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden pb-4"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export const AudioLayerLibrary = ({ onClose }: { onClose?: () => void }) => {
  const { 
    settings, 
    updateLayer,
    updateSubliminalSettings,
    updateMainAudioSettings
  } = useSettings();

  const [expandedLayerId, setExpandedLayerId] = useState<string | null>(() => {
    return localStorage.getItem('last_expanded_layer_id');
  });

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('expanded_audio_groups');
    return saved ? JSON.parse(saved) : { main: true, frequency: true, soundscape: true, special: true };
  });

  // Track which nested section is open PER layer for performance and clarity
  const [openNestedSection, setOpenNestedSection] = useState<Record<string, string | null>>({});

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleLayer = (id: string) => {
    const next = expandedLayerId === id ? null : id;
    setExpandedLayerId(next);
    if (next) localStorage.setItem('last_expanded_layer_id', next);
  };

  const toggleNested = (layerId: string, sectionId: string) => {
    setOpenNestedSection(prev => ({
      ...prev,
      [layerId]: prev[layerId] === sectionId ? null : sectionId
    }));
  };

  const renderLayerInHybridLayout = (layerId: string) => {
    const registry = AUDIO_LAYER_REGISTRY[layerId];
    const lSettings = settings.layers[layerId];
    if (!registry || !lSettings) return null;

    const Icon = registry.icon === 'Waves' ? Waves : 
                 registry.icon === 'Mountain' ? Mountain : 
                 registry.icon === 'Radio' ? Radio : 
                 registry.icon === 'Zap' ? Zap : 
                 registry.icon === 'Activity' ? Activity : 
                 registry.icon === 'Music' ? MusicIcon : 
                 registry.icon === 'Earth' ? Earth : 
                 registry.icon === 'Wind' ? Wind : 
                 registry.icon === 'Drum' ? Drum : 
                 registry.icon === 'Shield' ? Shield : 
                 registry.icon === 'Layers' ? Layers : 
                 registry.icon === 'Ear' ? Ear : Sliders;

    const colorClass = registry.color.replace('text-', '');
    const currentNested = openNestedSection[layerId];

    return (
      <LayerAccordion 
        key={layerId} id={layerId} icon={Icon} label={registry.name} 
        isEnabled={lSettings.isEnabled} 
        onToggle={(v: boolean) => updateLayer(layerId, { isEnabled: v })}
        isExpanded={expandedLayerId === layerId}
        onAccordionToggle={() => toggleLayer(layerId)}
        vol={lSettings.volume}
        setVol={(v: number) => updateLayer(layerId, { volume: v })}
        gainDb={lSettings.gainDb}
        setGainDb={(v: number) => updateLayer(layerId, { gainDb: v })}
        playInBackground={lSettings.playInBackground}
        setPlayInBackground={(v: boolean) => updateLayer(layerId, { playInBackground: v })}
        pitchSafeMode={lSettings.pitchSafeMode}
        setPitchSafeMode={(v: boolean) => updateLayer(layerId, { pitchSafeMode: v })}
        bufferMode={lSettings.bufferMode}
        setBufferMode={(v: 'single' | 'double') => updateLayer(layerId, { bufferMode: v })}
        color={registry.color}
        subtitle={`${Math.round(lSettings.frequency || 0)}Hz Signal`}
      >
        <div className="flex flex-col pt-4">
          {/* Nested IQ Flow */}
          <div className="space-y-1">
            {/* 1. Hz Controls IQ */}
            <NestedSection 
              id="hz" icon={Activity} label="Frequency Controls" 
              subtitle="Precision Hertz Tuning" 
              isOpen={currentNested === 'hz'} 
              onToggle={() => toggleNested(layerId, 'hz')}
            >
              <div className="pt-2 px-1">
                 {layerId === 'binaural' ? (
                   <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <p className="text-[8px] font-black text-system-tertiary-label uppercase tracking-widest pl-1">Left Field Hz</p>
                        <HzSelector value={lSettings.leftFreq || lSettings.frequency} onChange={(v) => updateLayer(layerId, { leftFreq: v })} color={colorClass} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[8px] font-black text-system-tertiary-label uppercase tracking-widest pl-1">Right Field Hz</p>
                        <HzSelector value={lSettings.rightFreq || lSettings.frequency} onChange={(v) => updateLayer(layerId, { rightFreq: v })} color={colorClass} />
                      </div>
                   </div>
                 ) : (
                   <HzSelector value={lSettings.frequency} onChange={(v) => updateLayer(layerId, { frequency: v })} color={colorClass} />
                 )}
              </div>
            </NestedSection>

            {/* 2. Spatial Engine IQ */}
            <NestedSection 
              id="spatial" icon={Box} label="Spatial Depth Engine" 
              subtitle="Stereo Positioning & EQ Depth" 
              isOpen={currentNested === 'spatial'} 
              onToggle={() => toggleNested(layerId, 'spatial')}
            >
              <SpatialLayerDepthEngineUI spatial={lSettings.spatial} onChange={(v) => updateLayer(layerId, { spatial: v })} color={colorClass} />
            </NestedSection>

            {/* 3. Audio Intelligence IQ */}
            <NestedSection 
              id="iq" icon={Brain} label="Intelligence IQ" 
              subtitle="AI Physics & Resonanace" 
              isOpen={currentNested === 'iq'} 
              onToggle={() => toggleNested(layerId, 'iq')}
            >
              <div className="space-y-6 pt-2 px-1">
                {layerId === 'nature' && (
                  <div className="grid grid-cols-2 gap-2">
                    {NATURE_SOUNDS.map(sound => (
                      <button 
                        key={sound.id}
                        onClick={() => updateLayer(layerId, { type: sound.id })}
                        className={`py-2.5 px-2 rounded-xl text-[9px] font-bold uppercase transition-all border ${lSettings.type === sound.id ? 'bg-system-green text-white border-system-green shadow-sm' : 'bg-apple-border/10 border-apple-border/50 text-system-secondary-label'}`}
                      >
                        {sound.name}
                      </button>
                    ))}
                  </div>
                )}

                {layerId === 'noise' && (
                  <div className="grid grid-cols-4 gap-2">
                    {(['white', 'pink', 'brown', 'none'] as const).map(t => (
                      <button 
                        key={t}
                        onClick={() => updateLayer(layerId, { type: t })}
                        className={`py-2.5 rounded-xl text-[9px] font-bold uppercase transition-all border ${lSettings.type === t ? 'bg-system-gray text-white border-system-gray' : 'bg-apple-border/10 border-apple-border/50 text-system-secondary-label'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}

                {/* Special Controls */}
                {layerId === 'shamanic' && (
                  <div className="space-y-4">
                    <p className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest pl-1">Hit Interval (Seconds)</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[10, 20, 30, 40, 50].map(val => (
                        <button key={val} onClick={() => updateLayer(layerId, { interval: val })} className={`py-2 rounded-xl text-[9px] font-bold ${lSettings.interval === val ? 'bg-system-red text-white' : 'bg-apple-border/20'}`}>{val}s</button>
                      ))}
                    </div>
                  </div>
                )}

                {(registry.group === 'special' || layerId === 'noise' || layerId === 'nature' || layerId === 'isochronic') && (
                  <PhysicalSoundEngineUI 
                    phys={lSettings.physical} 
                    onChange={(v) => updateLayer(layerId, { physical: v })} 
                    color={colorClass}
                  />
                )}
              </div>
            </NestedSection>

            {/* 4. Advanced / Sync IQ */}
            <NestedSection 
              id="sync" icon={Sparkles} label="Synchronization IQ" 
              subtitle="Phase Locking & Presets" 
              isOpen={currentNested === 'sync'} 
              onToggle={() => toggleNested(layerId, 'sync')}
            >
              <div className="pt-2 grid grid-cols-2 gap-3 px-1">
                 <button className="py-4 bg-system-blue/5 border border-system-blue/10 rounded-2xl flex flex-col items-center gap-1 group active:scale-95 transition-all">
                    <Zap size={14} className="text-system-blue group-hover:animate-pulse" />
                    <span className="text-[8px] font-black text-system-blue uppercase tracking-widest">Phase Lock</span>
                 </button>
                 <button className="py-4 bg-system-purple/5 border border-system-purple/10 rounded-2xl flex flex-col items-center gap-1 group active:scale-95 transition-all">
                    <Shield size={14} className="text-system-purple" />
                    <span className="text-[8px] font-black text-system-purple uppercase tracking-widest">Safe Gain</span>
                 </button>
              </div>
            </NestedSection>
          </div>
        </div>
      </LayerAccordion>
    );
  };

  return (
    <div className="flex flex-col h-full bg-system-background">
      {/* Immersive Header */}
      <div className="px-5 py-6 border-b border-apple-border flex justify-between items-center sticky top-0 bg-system-background/90 backdrop-blur-2xl z-30">
        <div>
           <h2 className="text-xl font-bold serif-title text-system-label">Audio Lab</h2>
           <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-system-green animate-pulse" />
              <span className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest leading-none">Intelligence Active</span>
           </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-apple-border/20 flex items-center justify-center active:scale-90 transition-all">
           <ChevronRight size={20} className="text-system-label" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-12 scrollbar-hide pb-32">
        {/* Playback & Core */}
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <h3 className="text-[10px] font-black text-system-tertiary-label uppercase tracking-[0.3em]">Foundation</h3>
              <div className="h-px flex-1 bg-apple-border/10" />
           </div>
           
           <div className="space-y-4">
              <LayerAccordion 
                id="main_audio" icon={Sliders} label="Main Audio Control" 
                isEnabled={true} 
                onToggle={() => {}} 
                isExpanded={expandedLayerId === 'main_audio'}
                onAccordionToggle={() => toggleLayer('main_audio')}
                vol={settings.mainAudio.volume} setVol={(v: number) => updateMainAudioSettings({ volume: v })}
                gainDb={settings.mainAudio.gainDb} setGainDb={(v: number) => updateMainAudioSettings({ gainDb: v })}
                color="text-system-blue" hideToggle
              >
                <div className="pt-4">
                  <p className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest mb-4 pl-1">Frequency Control</p>
                  <HzSelector value={settings.mainAudio.frequency} onChange={(v) => updateMainAudioSettings({ frequency: v })} color="system-blue" />
                </div>
              </LayerAccordion>

              <LayerAccordion 
                id="subliminal" icon={Volume2} label="Subliminal Layer" 
                isEnabled={settings.subliminal.isEnabled} onToggle={(v: boolean) => updateSubliminalSettings({ isEnabled: v })} 
                isExpanded={expandedLayerId === 'subliminal'}
                onAccordionToggle={() => toggleLayer('subliminal')}
                vol={settings.subliminal.volume} setVol={(v: number) => updateSubliminalSettings({ volume: v })}
                gainDb={settings.subliminal.gainDb} setGainDb={(v: number) => updateSubliminalSettings({ gainDb: v })}
                playInBackground={settings.subliminal.playInBackground}
                setPlayInBackground={(v: boolean) => updateSubliminalSettings({ playInBackground: v })}
                color="text-system-indigo"
              >
                <SpatialLayerDepthEngineUI spatial={settings.subliminal.spatial} onChange={(v) => updateSubliminalSettings({ spatial: v })} color="system-indigo" />
              </LayerAccordion>
           </div>
           
           <div className="mt-8 pt-6 border-t border-apple-border/20">
              <p className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest mb-6 pl-1">Global Synchronization</p>
              <HzProfiles />
           </div>
        </div>

        {/* Dynamic Groups from Registry */}
        {[
          { id: 'frequency', label: 'Harmonic Frequencies', icon: Activity, registryIds: ['binaural', 'pureHz', 'isochronic', 'solfeggio', 'schumann'] },
          { id: 'soundscape', label: 'Ethereal Environments', icon: Mountain, registryIds: ['nature', 'noise', 'didgeridoo'] },
          { id: 'special', label: 'Precision Instruments', icon: Drum, registryIds: ['shamanic', 'mentalToughness', 'dualMode'] }
        ].map(grp => (
          <div key={grp.id} className="space-y-6">
            <div className="flex items-center gap-3">
              <h3 className="text-[10px] font-black text-system-tertiary-label uppercase tracking-[0.3em]">{grp.label}</h3>
              <div className="h-px flex-1 bg-apple-border/10" />
            </div>
            
            <div className="flex flex-col">
              {grp.registryIds.map(id => renderLayerInHybridLayout(id))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
