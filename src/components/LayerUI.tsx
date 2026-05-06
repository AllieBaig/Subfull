import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../SettingsContext';
import { usePlayback, usePlaybackProgress } from '../PlaybackContext';
import { FREQUENCY_PRESETS } from '../constants';
import { PickerWheel } from './PickerWheel';
import { NumericKeypadInput } from './NumericKeypadInput';
import { Activity, Sliders, ChevronDown, ChevronRight, Ear, Box, Move, Layers, Maximize } from 'lucide-react';

export const LayerProgress = ({ layerId }: { layerId: string }) => {
  const { layerProgress } = usePlaybackProgress();
  const progress = layerProgress[layerId];
  
  if (!progress || progress.duration === 0) return null;
  
  const percentage = (progress.currentTime / progress.duration) * 100;
  
  return (
    <div className="w-full h-0.5 bg-system-tertiary-label/20 rounded-full overflow-hidden">
      <motion.div 
        className="h-full bg-system-blue"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
      />
    </div>
  );
};

export const HzSelector = ({ value, onChange, color }: { value: number, onChange: (v: number) => void, color: string }) => {
  const { settings, updateSettings } = useSettings();
  const inputMode = settings.hzInputMode || 'slider';

  // Ensure value is clamped 1-1900
  const handleChange = (v: number) => {
    const clamped = Math.min(1900, Math.max(1, v));
    onChange(clamped);
  };

  const colorClass = color === 'purple' || color === 'system-purple' ? 'text-system-purple' : 
                    color === 'blue' || color === 'system-blue' ? 'text-system-blue' : 
                    color === 'green' || color === 'system-green' ? 'text-system-green' : 
                    color === 'amber' || color === 'system-orange' ? 'text-system-orange' : 
                    color === 'rose' || color === 'system-red' ? 'text-system-red' : 
                    color === 'indigo' || color === 'system-blue' ? 'text-system-blue' : 
                    'text-system-orange';

  const bgActiveColorClass = color === 'purple' || color === 'system-purple' ? 'accent-system-purple' : 
                            color === 'blue' || color === 'system-blue' ? 'accent-system-blue' : 
                            color === 'green' || color === 'system-green' ? 'accent-system-green' : 
                            color === 'amber' || color === 'system-orange' ? 'accent-system-orange' : 
                            color === 'rose' || color === 'system-red' ? 'accent-system-red' : 
                            color === 'indigo' || color === 'system-blue' ? 'accent-system-blue' : 
                            'accent-system-orange';

  const renderManual = () => (
    <div className="flex flex-col items-center py-6">
      <div className="paper-card px-10 py-8 flex flex-col items-center gap-2 min-w-[220px] relative animate-in zoom-in-95 duration-300 paper-emboss">
        <div className="flex items-baseline gap-2">
          <NumericKeypadInput 
            value={value}
            onCommit={(v) => handleChange(v)}
            min={1}
            max={1900}
            allowFloat={true}
            className="bg-transparent border-none p-0 text-5xl font-[900] text-center tabular-nums focus:ring-0 outline-none w-32 tracking-tighter serif-title"
            style={{ color: value > 0 ? (color.includes('purple') ? 'var(--system-purple)' : color.includes('blue') ? 'var(--system-blue)' : color.includes('green') ? 'var(--system-green)' : color.includes('orange') || color.includes('amber') ? 'var(--system-orange)' : color.includes('red') || color.includes('rose') ? 'var(--system-red)' : 'var(--system-orange)') : 'currentColor' }}
          />
          <span className="text-xl serif-title opacity-30 text-system-label italic">Hz</span>
        </div>
        <span className="text-[10px] font-black text-system-tertiary-label uppercase tracking-[0.3em] mt-1 opacity-50">Frequency</span>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-tertiary-system-background px-4 py-1.5 rounded-full border border-apple-border text-[9px] font-black uppercase tracking-widest text-system-tertiary-label shadow-sm">
          Manual Tuning
        </div>
      </div>
    </div>
  );

  const renderSlider = () => (
    <div className="space-y-6 pt-2">
      <div className="flex justify-between items-center px-2">
         <div className="flex flex-col">
            <span className={`text-3xl serif-title tabular-nums tracking-tight ${colorClass}`}>{value}</span>
            <span className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest">Selected Frequency</span>
         </div>
         <div className="flex bg-secondary-system-background rounded-full p-1 border border-apple-border paper-emboss">
            <button 
              onClick={() => handleChange(value - 1)} 
              className="w-10 h-8 flex items-center justify-center text-system-label hover:bg-tertiary-system-background active:scale-90 rounded-full transition-all font-black text-lg paper-button"
            >
              -
            </button>
            <div className="w-px h-4 bg-separator my-auto" />
            <button 
              onClick={() => handleChange(value + 1)} 
              className="w-10 h-8 flex items-center justify-center text-system-label hover:bg-tertiary-system-background active:scale-90 rounded-full transition-all font-black text-lg paper-button"
            >
              +
            </button>
         </div>
      </div>
      <div className="relative px-1">
        <input 
          type="range" min={1} max={1900} step={1} value={value}
          onChange={(e) => handleChange(parseInt(e.target.value))}
          className={`w-full h-1.5 bg-apple-border/40 rounded-full appearance-none cursor-pointer ${bgActiveColorClass}`}
        />
      </div>
    </div>
  );

  const renderPicker = () => {
    const pickerItems = FREQUENCY_PRESETS.map(hz => ({
      id: hz,
      label: `${hz} Hz`
    }));

    const currentVal = value;
    const isPreset = FREQUENCY_PRESETS.includes(currentVal);

    return (
      <div className="space-y-6 pt-2">
        {!isPreset && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-system-orange/5 border border-system-orange/10 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-system-orange uppercase tracking-widest">Custom Mode</span>
              <span className="text-[11px] font-bold text-system-orange/80">Frequency is outside presets</span>
            </div>
            <span className="text-sm font-black text-system-orange tabular-nums bg-system-orange/10 px-3 py-1 rounded-full">{currentVal}Hz</span>
          </div>
        )}
        <div className="bg-system-background border border-apple-border rounded-[2rem] overflow-hidden shadow-sm paper-emboss">
          <PickerWheel 
            items={pickerItems}
            selectedValue={isPreset ? currentVal : -1}
            onValueChange={(hz) => handleChange(hz)}
            height={160}
            itemHeight={40}
          />
        </div>
        <div className="flex justify-center">
           <button 
            onClick={() => updateSettings({ hzInputMode: 'manual' })}
            className="px-6 py-2 bg-system-blue/5 border border-system-blue/10 rounded-full text-[9px] font-black text-system-blue uppercase tracking-widest hover:bg-system-blue/10 active:scale-95 transition-all paper-button"
           >
             Set Manual Frequency
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex bg-secondary-system-background p-1.5 rounded-[1.25rem] h-11 border border-apple-border paper-emboss">
        {(['picker', 'slider', 'manual'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => updateSettings({ hzInputMode: mode })}
            className={`flex-1 h-full rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-200 paper-button ${inputMode === mode ? 'bg-tertiary-system-background text-system-blue shadow-md' : 'text-system-secondary-label hover:text-system-label'}`}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {inputMode === 'picker' && renderPicker()}
        {inputMode === 'slider' && renderSlider()}
        {inputMode === 'manual' && renderManual()}
      </div>
    </div>
  );
};

export const HzSettingsPanel = ({ value, onChange, color, label = "Hz Settings" }: { value: number, onChange: (v: number) => void, color: string, label?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="space-y-1">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 px-1 group hover:bg-secondary-system-background/50 rounded-xl transition-all"
      >
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full ${isExpanded ? (color.includes('purple') ? 'bg-system-purple' : color.includes('blue') ? 'bg-system-blue' : color.includes('green') ? 'bg-system-green' : 'bg-system-orange') : 'bg-system-tertiary-label/30'}`} />
          <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${isExpanded ? 'text-system-label' : 'text-system-secondary-label'}`}>{label}</span>
        </div>
        <ChevronDown size={14} className={`text-system-tertiary-label transition-transform duration-300 ${isExpanded ? 'rotate-180 text-system-blue' : ''}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-2 px-1">
              <HzSelector value={value} onChange={onChange} color={color} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const PhysicalSoundEngineUI = ({ phys, onChange, color }: { phys: any, onChange: (v: any) => void, color: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!phys) return null;

  const colorClass = color === 'red' ? 'text-system-red bg-system-red/10' : 
                    color === 'amber' ? 'text-system-orange bg-system-orange/10' : 
                    'text-system-blue bg-system-blue/10';

  const accentClass = color === 'red' ? 'accent-system-red' : 
                     color === 'amber' ? 'accent-system-orange' : 
                     'accent-system-blue';

  const borderClass = color === 'red' ? 'border-system-red/20' : 
                     color === 'amber' ? 'border-system-orange/20' : 
                     'border-system-blue/20';

  const activeBtnClass = color === 'red' ? 'bg-system-red text-system-background border-system-red' : 
                        color === 'amber' ? 'bg-system-orange text-system-background border-system-orange' : 
                        'bg-system-blue text-system-background border-system-blue';

  return (
    <div className="space-y-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 group"
      >
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorClass}`}>
              <Activity size={14} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black text-system-label uppercase tracking-widest">Physical Sound Engine</span>
            <span className="text-[7px] font-bold text-system-tertiary-label uppercase">Simulated Physics & Resilience</span>
          </div>
        </div>
        <ChevronRight size={16} className={`text-system-tertiary-label transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`overflow-hidden space-y-6 pt-2 pb-6 px-4 bg-secondary-system-background rounded-3xl border ${borderClass} paper-emboss`}
          >
            {/* Room Size */}
            <div className="space-y-3 pt-2">
              <p className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest">Room Size</p>
              <div className="grid grid-cols-2 gap-2">
                {['small', 'medium', 'large', 'cave'].map(size => (
                  <button 
                    key={size}
                    onClick={() => onChange({ ...phys, roomSize: size })}
                    className={`py-2 px-1 rounded-xl text-[9px] font-bold uppercase transition-all border paper-button ${phys.roomSize === size ? activeBtnClass : 'bg-tertiary-system-background border-apple-border text-system-secondary-label'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Wall Resonance */}
            <div className="space-y-3">
              <p className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest">Wall Resonance</p>
              <div className="grid grid-cols-4 gap-1.5">
                {['off', 'low', 'medium', 'high'].map(res => (
                  <button 
                    key={res}
                    onClick={() => onChange({ ...phys, wallResonance: res })}
                    className={`py-2 px-1 rounded-xl text-[8px] font-black uppercase transition-all border paper-button ${phys.wallResonance === res ? activeBtnClass : 'bg-tertiary-system-background border-apple-border text-system-secondary-label'}`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* Material Texture */}
            <div className="space-y-3">
              <p className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest">Material Texture</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'thin_wood', label: 'Thin Wood' },
                  { id: 'empty_wood', label: 'Empty Wood' },
                  { id: 'solid_wall', label: 'Solid Wall' },
                  { id: 'open_space', label: 'Open Space' }
                ].map(tex => (
                  <button 
                    key={tex.id}
                    onClick={() => onChange({ ...phys, materialTexture: tex.id })}
                    className={`py-2 px-1 rounded-xl text-[8px] font-bold uppercase transition-all border paper-button ${phys.materialTexture === tex.id ? activeBtnClass : 'bg-tertiary-system-background border-apple-border text-system-secondary-label'}`}
                  >
                    {tex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Banging Intensity */}
            {phys.bangingIntensity && (
               <div className="space-y-3">
                <p className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest">Global Hit Impact</p>
                <div className="grid grid-cols-3 gap-2">
                  {['soft', 'medium', 'hard'].map(i => (
                    <button 
                      key={i}
                      onClick={() => onChange({ ...phys, bangingIntensity: i })}
                      className={`py-2 px-1 rounded-xl text-[9px] font-bold uppercase transition-all border paper-button ${phys.bangingIntensity === i ? activeBtnClass : 'bg-tertiary-system-background border-apple-border text-system-secondary-label'}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resonance Depth Slider */}
            <div className="space-y-4">
              <div className="justify-between items-center flex">
                <span className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest">Resonance Depth</span>
                <span className={`text-[10px] font-black tabular-nums ${color.includes('red') ? 'text-system-red' : color.includes('amber') ? 'text-system-orange' : 'text-system-blue'}`}>{(phys.resonanceDepth * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min={0} max={1} step={0.01} value={phys.resonanceDepth}
                onChange={(e) => onChange({ ...phys, resonanceDepth: parseFloat(e.target.value) })}
                className={`w-full h-1 bg-apple-border rounded-full appearance-none ${accentClass}`}
              />
            </div>

            {/* Echo Tail Slider */}
            <div className="space-y-4">
              <div className="justify-between items-center flex">
                <span className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest">Tail Decay</span>
                <span className={`text-[10px] font-black tabular-nums ${color.includes('red') ? 'text-system-red' : color.includes('amber') ? 'text-system-orange' : 'text-system-blue'}`}>{(phys.echoTailLength * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min={0} max={1} step={0.01} value={phys.echoTailLength}
                onChange={(e) => onChange({ ...phys, echoTailLength: parseFloat(e.target.value) })}
                className={`w-full h-1 bg-apple-border rounded-full appearance-none ${accentClass}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const LayerAccordion = ({ 
  id, icon: Icon, label, isEnabled, onToggle, vol, setVol, 
  gainDb, setGainDb, normalize, setNormalize, 
  playInBackground, setPlayInBackground,
  pitchSafeMode, setPitchSafeMode,
  bufferMode, setBufferMode,
  isExpanded, onAccordionToggle,
  color, subtitle, children, onApplyPreset,
  hideToggle = false
}: any) => {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  const expanded = onAccordionToggle ? isExpanded : internalIsExpanded;
  
  const toggleAccordion = () => {
    if (onAccordionToggle) onAccordionToggle();
    else setInternalIsExpanded(!internalIsExpanded);
  };

  const colorHex = color.includes('blue') ? 'var(--system-blue)' : 
                   color.includes('purple') ? 'var(--system-purple)' : 
                   color.includes('green') ? 'var(--system-green)' : 
                   color.includes('amber') ? 'var(--system-orange)' : 
                   color.includes('rose') ? 'var(--system-red)' : 
                   'var(--system-orange)';

  return (
    <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'bg-secondary-system-background/30 -mx-4 px-4 border-y border-apple-border/20' : 'bg-transparent'}`}>
      {/* Header (Collapsed State) */}
      <div 
        className="flex items-center justify-between py-4 cursor-pointer"
        onClick={toggleAccordion}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-10 h-10 ${isEnabled || hideToggle ? 'bg-system-background shadow-sm' : 'bg-system-background/50'} rounded-xl flex-shrink-0 flex items-center justify-center ${isEnabled || hideToggle ? color : 'text-system-tertiary-label'} transition-all`}>
            <Icon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="text-[13px] font-bold tracking-tight truncate text-system-label">{label}</h5>
            {subtitle && <p className="text-[9px] text-system-secondary-label uppercase font-black tracking-widest truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!hideToggle && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggle(!isEnabled); }}
              className={`flex-shrink-0 w-10 h-6 rounded-full relative transition-colors ${isEnabled ? (color.includes('blue') ? 'bg-system-blue' : color.includes('purple') ? 'bg-system-purple' : color.includes('green') ? 'bg-system-green' : color.includes('amber') ? 'bg-system-orange' : color.includes('rose') ? 'bg-system-red' : 'bg-system-orange') : 'bg-system-tertiary-label'}`}
            >
              <motion.div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full" animate={{ x: isEnabled ? 16 : 0 }} />
            </button>
          )}
          <ChevronDown size={16} className={`text-system-tertiary-label transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {(isEnabled || hideToggle) && <div className="pb-2"><LayerProgress layerId={id} /></div>}
      
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pb-8 space-y-8"
          >
            {/* 1. Title + Live Hz Info Section */}
            <div className="pt-4 border-t border-apple-border/20">
               <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-[10px] font-black text-system-tertiary-label uppercase tracking-[0.2em]">{label} Engine</h4>
                    <p className="text-[8px] font-bold text-system-secondary-label uppercase tracking-widest mt-0.5">Active Signal Processing</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-bold tabular-nums serif-title ${color.includes('blue') ? 'text-system-blue' : color.includes('purple') ? 'text-system-purple' : color.includes('green') ? 'text-system-green' : 'text-system-orange'}`}>
                      {subtitle?.split('Hz')[0]}
                    </span>
                    <span className="text-[9px] font-bold text-system-tertiary-label ml-1">HZ</span>
                  </div>
               </div>
            </div>

            {/* 2. Core Toggles (Inline) */}
            <div className="grid grid-cols-2 gap-4">
               {setPlayInBackground !== undefined && (
                 <div className="flex items-center justify-between p-3 bg-system-background rounded-2xl border border-apple-border/50">
                    <span className="text-[9px] font-black text-system-label uppercase tracking-widest">Background</span>
                    <button 
                      onClick={() => setPlayInBackground(!playInBackground)}
                      className={`w-8 h-5 rounded-full relative transition-colors ${playInBackground ? (color.includes('blue') ? 'bg-system-blue' : 'bg-system-label') : 'bg-system-tertiary-label'}`}
                    >
                      <motion.div className="absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full" animate={{ x: playInBackground ? 12 : 0 }} />
                    </button>
                 </div>
               )}
               {setPitchSafeMode !== undefined && (
                 <div className="flex items-center justify-between p-3 bg-system-background rounded-2xl border border-apple-border/50">
                    <span className="text-[9px] font-black text-system-label uppercase tracking-widest">Pitch Safe</span>
                    <button 
                      onClick={() => setPitchSafeMode(!pitchSafeMode)}
                      className={`w-8 h-5 rounded-full relative transition-colors ${pitchSafeMode ? (color.includes('purple') ? 'bg-system-purple' : 'bg-system-label') : 'bg-system-tertiary-label'}`}
                    >
                      <motion.div className="absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full" animate={{ x: pitchSafeMode ? 12 : 0 }} />
                    </button>
                 </div>
               )}
            </div>

            {/* 3. Loop Buffer - Full Width Segmented */}
            {setBufferMode !== undefined && (
              <div className="space-y-3">
                <p className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest pl-1">Signal Buffer Mode</p>
                <div className="flex bg-apple-border/20 p-1 rounded-full h-10">
                  {['single', 'double'].map((m: any) => (
                    <button
                      key={m}
                      onClick={() => setBufferMode(m)}
                      className={`flex-1 h-full rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${bufferMode === m ? 'bg-white text-system-label shadow-sm' : 'text-system-tertiary-label'}`}
                    >
                      {m === 'single' ? 'Eco' : 'Gapless'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Volume - Full Width */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest">Digital Volume</span>
                <span className="text-[10px] font-bold tabular-nums text-system-label">{Math.round(vol * 100)}%</span>
              </div>
              <input 
                type="range" min={0} max={1} step={0.01} value={vol}
                onChange={(e) => setVol(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-apple-border/40 rounded-full appearance-none accent-system-label"
              />
            </div>

            {/* 5. Gain - Full Width */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest">Master Gain (dB)</span>
                <span className={`text-[10px] font-bold tabular-nums ${gainDb < -30 ? 'text-system-red' : 'text-system-label'}`}>{gainDb} dB</span>
              </div>
              <input 
                type="range" min={-60} max={0} step={1} value={gainDb}
                onChange={(e) => setGainDb(parseInt(e.target.value))}
                className="w-full h-1.5 bg-apple-border/40 rounded-full appearance-none accent-system-blue"
              />
            </div>

            {/* Nested Intelligence Sections (Rendered as Children) */}
            {children && (
              <div className="pt-2">
                {children}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SpatialLayerDepthEngineUI = ({ 
  spatial, 
  onChange, 
  color 
}: { 
  spatial: any, 
  onChange: (s: any) => void, 
  color: string 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const colorClass = color === 'purple' || color === 'system-purple' ? 'text-system-purple' : 
                    color === 'blue' || color === 'system-blue' ? 'text-system-blue' : 
                    color === 'green' || color === 'system-green' ? 'text-system-green' : 
                    color === 'amber' || color === 'system-orange' ? 'text-system-orange' : 
                    color === 'rose' || color === 'system-red' ? 'text-system-red' : 
                    'text-system-blue';

  const accentClass = color === 'purple' || color === 'system-purple' ? 'accent-system-purple' : 
                     color === 'blue' || color === 'system-blue' ? 'accent-system-blue' : 
                     color === 'green' || color === 'system-green' ? 'accent-system-green' : 
                     color === 'amber' || color === 'system-orange' ? 'accent-system-orange' : 
                     color === 'rose' || color === 'system-red' ? 'accent-system-red' : 
                     'accent-system-blue';

  const bgClass = color === 'purple' || color === 'system-purple' ? 'bg-system-purple/10' : 
                 color === 'blue' || color === 'system-blue' ? 'bg-system-blue/10' : 
                 color === 'green' || color === 'system-green' ? 'bg-system-green/10' : 
                 color === 'amber' || color === 'system-orange' ? 'bg-system-orange/10' : 
                 color === 'rose' || color === 'system-red' ? 'bg-system-red/10' : 
                 'bg-system-blue/10';

  const ControlRow = ({ label, icon: Icon, value, min, max, step, onChange: onValChange, displayValue }: any) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Icon size={10} className={colorClass} />
          <span className="text-[9px] font-black text-system-tertiary-label uppercase tracking-widest">{label}</span>
        </div>
        <span className={`text-[10px] font-black tabular-nums ${colorClass}`}>{displayValue || value}</span>
      </div>
      <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValChange(parseFloat(e.target.value))}
        className={`w-full h-1 rounded-full appearance-none bg-system-tertiary-label/20 cursor-pointer ${accentClass}`}
      />
    </div>
  );

  return (
    <div className="mt-4 border-t border-apple-border/30 pt-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full group"
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${bgClass} ${colorClass} group-hover:scale-110 transition-transform`}>
            <Box size={14} />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-black text-system-label uppercase tracking-widest block">Spatial Depth Engine</span>
            <span className="text-[8px] font-bold text-system-tertiary-label uppercase tracking-tight">Stereo Positioning & EQ Depth</span>
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown size={14} className="text-system-tertiary-label" />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-6 grid grid-cols-2 gap-x-6 gap-y-5 px-1 pb-2">
              <ControlRow 
                label="Pan"
                icon={Move}
                value={spatial.pan}
                min={-1}
                max={1}
                step={0.01}
                onChange={(v: number) => onChange({ ...spatial, pan: v })}
                displayValue={spatial.pan === 0 ? 'C' : spatial.pan < 0 ? `${Math.abs(Math.round(spatial.pan * 100))}L` : `${Math.round(spatial.pan * 100)}R`}
              />
              <ControlRow 
                label="Depth"
                icon={Layers}
                value={spatial.depth}
                min={0}
                max={1}
                step={0.01}
                onChange={(v: number) => onChange({ ...spatial, depth: v })}
                displayValue={spatial.depth < 0.3 ? 'NEAR' : spatial.depth > 0.7 ? 'FAR' : 'MID'}
              />
              <ControlRow 
                label="Width"
                icon={Maximize}
                value={spatial.width}
                min={0}
                max={1}
                step={0.01}
                onChange={(v: number) => onChange({ ...spatial, width: v })}
                displayValue={spatial.width < 0.2 ? 'MONO' : (spatial.width > 0.8 ? 'WIDE' : 'STEREO')}
              />
              <ControlRow 
                label="Elevation"
                icon={Ear}
                value={spatial.elevation}
                min={-1}
                max={1}
                step={0.01}
                onChange={(v: number) => onChange({ ...spatial, elevation: v })}
                displayValue={spatial.elevation < -0.3 ? 'LOW' : (spatial.elevation > 0.3 ? 'HIGH' : 'FLAT')}
              />
            </div>
            <p className="text-[8px] text-system-tertiary-label font-medium italic mt-2 px-1 leading-relaxed border-l-2 border-apple-border/50 pl-2">
              Spatial engine simulates 3D space using precise gain shaping and high-fidelity EQ filtering. Optimized for iPhone 8 battery safety.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
