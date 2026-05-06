import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, ShieldCheck, Clock, Activity, Settings2, Sliders, Volume2, Shield, 
  ChevronRight, Brain, RotateCcw, Waves, Lock, LifeBuoy, BarChart3,
  Box, History, Map, Maximize, Move, Layers, Battery, Eye, Cpu, Settings, Terminal
} from 'lucide-react';
import { useSettings } from '../SettingsContext';
import { Section } from './SettingsUI';
import { UsageIntelligenceDashboard } from './UsageIntelligenceDashboard';
import { SessionHeatmap } from './SessionHeatmap';

export const AdvancedAudioIntelligence = () => {
  const { settings, updateAdvancedAudioSettings, updateAppIntelligence, trackFeatureUsage } = useSettings();
  const [expandedGroup, setExpandedGroup] = useState<'calm' | 'stability' | 'stats' | 'self-heal' | 'app-intel' | null>('calm');
  const [selectedSpatialLayer, setSelectedSpatialLayer] = useState<string>('subliminal');

  if (!settings.advancedAudio) return null;

  const { advancedAudio } = settings;

  const ControlLabel = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center mb-1.5 px-0.5">
      <span className="text-[10px] font-bold text-system-secondary-label uppercase tracking-widest">{label}</span>
      <span className="text-[10px] font-black text-system-blue">{value}</span>
    </div>
  );

  const GroupHeader = ({ id, title, icon: Icon, color, isEnabled, onToggle, hideToggle }: { 
    id: 'calm' | 'stability' | 'stats', 
    title: string, 
    icon: any, 
    color: string,
    isEnabled?: boolean,
    onToggle?: (v: boolean) => void,
    hideToggle?: boolean
  }) => (
    <div className={`p-4 rounded-2xl border transition-all ${expandedGroup === id ? 'bg-system-background border-apple-border/50 shadow-sm' : 'bg-secondary-system-background/30 border-transparent hover:bg-secondary-system-background/50 text-system-secondary-label'}`}>
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setExpandedGroup(expandedGroup === id ? null : id)}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <div className={`p-2 rounded-xl ${expandedGroup === id ? color : 'bg-system-tertiary-label/10 text-system-secondary-label'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${expandedGroup === id ? 'text-system-label' : 'text-system-secondary-label'}`}>{title}</h3>
            <p className="text-[10px] text-system-tertiary-label font-medium">Click to expand {id === 'stats' ? 'dashboard' : 'settings'}</p>
          </div>
          <ChevronRight className={`w-4 h-4 text-system-tertiary-label transition-transform ml-auto ${expandedGroup === id ? 'rotate-90' : ''}`} />
        </button>
        {!hideToggle && onToggle && (
          <div className="ml-4 pl-4 border-l border-apple-border/20">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggle(!isEnabled);
              }}
              className={`w-10 h-5 rounded-full relative transition-colors ${isEnabled ? (id === 'calm' ? 'bg-system-blue' : 'bg-system-purple') : 'bg-system-tertiary-label/30'}`}
            >
              <div className={`absolute top-0.5 left-0.5 bg-system-background w-4 h-4 rounded-full transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {expandedGroup === id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {id === 'stats' ? (
              <UsageIntelligenceDashboard />
            ) : (
              <div className="pt-6 space-y-4">
                {id === 'calm' ? (
                <div className="space-y-3">
                  {/* Silence Recovery */}
                  <Section
                    id="silence-recovery"
                    title="Smart Silence Recovery"
                    icon={Zap}
                    color="bg-system-orange/10 text-system-orange"
                    isEnabled={advancedAudio.calmControl.silenceRecovery.isEnabled}
                    onToggle={(val: boolean) => {
                      updateAdvancedAudioSettings({ 
                        calmControl: { ...advancedAudio.calmControl, silenceRecovery: { ...advancedAudio.calmControl.silenceRecovery, isEnabled: val } } 
                      });
                      if (val) trackFeatureUsage('silenceRecovery');
                    }}
                  >
                    <div className="space-y-4 pt-1">
                      <div>
                        <ControlLabel label="Sensitivity" value={advancedAudio.calmControl.silenceRecovery.sensitivity.toUpperCase()} />
                        <div className="grid grid-cols-3 gap-2">
                          {['low', 'medium', 'high'].map((s) => (
                            <button
                              key={s}
                              onClick={() => updateAdvancedAudioSettings({ 
                                calmControl: { ...advancedAudio.calmControl, silenceRecovery: { ...advancedAudio.calmControl.silenceRecovery, sensitivity: s as any } } 
                              })}
                              className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                                advancedAudio.calmControl.silenceRecovery.sensitivity === s 
                                ? 'bg-system-blue text-system-background border-system-blue shadow-sm' 
                                : 'bg-secondary-system-background/50 text-system-secondary-label border-apple-border/50 hover:bg-secondary-system-background'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Section>

                  {/* Layer Priority */}
                  <Section
                    id="layer-priority"
                    title="Layer Priority System"
                    icon={Activity}
                    color="bg-system-blue/10 text-system-blue"
                    isEnabled={advancedAudio.calmControl.layerPriority.isEnabled}
                    onToggle={(val: boolean) => {
                      updateAdvancedAudioSettings({ 
                        calmControl: { ...advancedAudio.calmControl, layerPriority: { ...advancedAudio.calmControl.layerPriority, isEnabled: val } } 
                      });
                      if (val) trackFeatureUsage('layerPriority');
                    }}
                  >
                    <div className="pt-2">
                      <ControlLabel label="Balance Strength" value={`${Math.round(advancedAudio.calmControl.layerPriority.balanceStrength * 100)}%`} />
                      <input 
                        type="range" min="0" max="1" step="0.1"
                        value={advancedAudio.calmControl.layerPriority.balanceStrength}
                        onChange={(e) => updateAdvancedAudioSettings({ 
                          calmControl: { ...advancedAudio.calmControl, layerPriority: { ...advancedAudio.calmControl.layerPriority, balanceStrength: parseFloat(e.target.value) } } 
                        })}
                        className="w-full accent-system-blue h-1.5 bg-system-tertiary-label/20 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </Section>

                  {/* Time Automation */}
                  <Section
                    id="time-automation"
                    title="Time-Based Automation"
                    icon={Clock}
                    color="bg-system-purple/10 text-system-purple"
                    isEnabled={advancedAudio.calmControl.timeAutomation.isEnabled}
                    onToggle={(val: boolean) => {
                      updateAdvancedAudioSettings({ 
                        calmControl: { ...advancedAudio.calmControl, timeAutomation: { ...advancedAudio.calmControl.timeAutomation, isEnabled: val } } 
                      });
                      if (val) trackFeatureUsage('timeAutomation');
                    }}
                  >
                    <div className="flex flex-col gap-4 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-system-secondary-label uppercase tracking-widest">Smooth Transitions</span>
                        <button 
                          onClick={() => updateAdvancedAudioSettings({ 
                            calmControl: { ...advancedAudio.calmControl, timeAutomation: { ...advancedAudio.calmControl.timeAutomation, smoothTransitions: !advancedAudio.calmControl.timeAutomation.smoothTransitions } } 
                          })}
                          className={`w-8 h-4 rounded-full relative transition-colors ${advancedAudio.calmControl.timeAutomation.smoothTransitions ? 'bg-system-blue' : 'bg-system-tertiary-label/30'}`}
                        >
                          <div className={`absolute top-0.5 left-0.5 bg-system-background w-3 h-3 rounded-full transition-transform ${advancedAudio.calmControl.timeAutomation.smoothTransitions ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[9px] font-black uppercase text-system-secondary-label leading-tight">Automation Steps</span>
                          <span className="text-[8px] font-bold text-system-tertiary-label">{advancedAudio.calmControl.timeAutomation.steps.length} Defined</span>
                        </div>
                        
                        <div className="bg-secondary-system-background/50 rounded-xl p-3 border border-apple-border/30">
                          {advancedAudio.calmControl.timeAutomation.steps.length === 0 ? (
                            <div className="text-center py-2">
                               <p className="text-[9px] text-system-tertiary-label italic font-medium">No automation steps defined.</p>
                               <button 
                                 onClick={() => {
                                   const newSteps = [...advancedAudio.calmControl.timeAutomation.steps, { time: 300, type: 'volume', value: 0.5 }];
                                   updateAdvancedAudioSettings({
                                      calmControl: { ...advancedAudio.calmControl, timeAutomation: { ...advancedAudio.calmControl.timeAutomation, steps: newSteps } }
                                   });
                                 }}
                                 className="mt-2 text-[9px] font-black text-system-blue uppercase"
                               >
                                 + Add Initial Step
                               </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                               {advancedAudio.calmControl.timeAutomation.steps.map((step, idx) => (
                                 <div key={idx} className="flex items-center justify-between text-[10px] bg-system-background p-2 rounded-lg border border-apple-border/20 shadow-sm">
                                    <div className="flex items-center gap-2">
                                       <span className="font-black text-system-blue">{Math.floor(step.time / 60)}m</span>
                                       <span className="text-system-label font-bold uppercase tracking-tighter">{step.type}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <span className="font-black">{(step.value * 100).toFixed(0)}%</span>
                                       <button 
                                         onClick={() => {
                                           const newSteps = advancedAudio.calmControl.timeAutomation.steps.filter((_, i) => i !== idx);
                                           updateAdvancedAudioSettings({
                                              calmControl: { ...advancedAudio.calmControl, timeAutomation: { ...advancedAudio.calmControl.timeAutomation, steps: newSteps } }
                                           });
                                         }}
                                         className="text-system-red font-black uppercase text-[8px]"
                                       >
                                         DEL
                                       </button>
                                    </div>
                                 </div>
                               ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Section>

                  {/* Safe Listening */}
                  <Section
                    id="safe-listening"
                    title="Safe Listening Guard"
                    icon={ShieldCheck}
                    color="bg-system-green/10 text-system-green"
                    isEnabled={advancedAudio.calmControl.safeListening.isEnabled}
                    onToggle={(val: boolean) => {
                      updateAdvancedAudioSettings({ 
                        calmControl: { ...advancedAudio.calmControl, safeListening: { ...advancedAudio.calmControl.safeListening, isEnabled: val } } 
                      });
                      if (val) trackFeatureUsage('safeListening');
                    }}
                  >
                    <div className="space-y-4 pt-1">
                      <div>
                        <ControlLabel label="Max Volume Cap" value={`${Math.round(advancedAudio.calmControl.safeListening.maxVolumeCap * 100)}%`} />
                        <input 
                          type="range" min="0.5" max="1" step="0.05"
                          value={advancedAudio.calmControl.safeListening.maxVolumeCap}
                          onChange={(e) => updateAdvancedAudioSettings({ 
                            calmControl: { ...advancedAudio.calmControl, safeListening: { ...advancedAudio.calmControl.safeListening, maxVolumeCap: parseFloat(e.target.value) } } 
                          })}
                          className="w-full accent-system-green h-1.5 bg-system-tertiary-label/20 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </Section>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Session Memory */}
                  <Section
                    id="session-memory"
                    title="Session Memory Restore"
                    icon={RotateCcw}
                    color="bg-system-blue/10 text-system-blue"
                    isEnabled={advancedAudio.stabilityEngine.sessionMemory.isEnabled}
                    onToggle={(val: boolean) => {
                      updateAdvancedAudioSettings({ 
                        stabilityEngine: { ...advancedAudio.stabilityEngine, sessionMemory: { ...advancedAudio.stabilityEngine.sessionMemory, isEnabled: val } } 
                      });
                      if (val) trackFeatureUsage('sessionMemory');
                    }}
                  >
                    <div className="flex items-center justify-between pt-2">
                       <span className="text-[10px] font-bold text-system-secondary-label uppercase tracking-widest">Auto-Restore on Launch</span>
                       <button 
                        onClick={() => updateAdvancedAudioSettings({ 
                          stabilityEngine: { ...advancedAudio.stabilityEngine, sessionMemory: { ...advancedAudio.stabilityEngine.sessionMemory, autoRestore: !advancedAudio.stabilityEngine.sessionMemory.autoRestore } } 
                        })}
                        className={`w-8 h-4 rounded-full relative transition-colors ${advancedAudio.stabilityEngine.sessionMemory.autoRestore ? 'bg-system-blue' : 'bg-system-tertiary-label/30'}`}
                      >
                        <div className={`absolute top-0.5 left-0.5 bg-system-background w-3 h-3 rounded-full transition-transform ${advancedAudio.stabilityEngine.sessionMemory.autoRestore ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </Section>

                  {/* Smart Loop Variations */}
                  <Section
                    id="loop-variations"
                    title="Smart Loop Variations"
                    icon={Waves}
                    color="bg-system-blue/10 text-system-blue"
                    isEnabled={advancedAudio.stabilityEngine.loopVariations.isEnabled}
                    onToggle={(val: boolean) => {
                      updateAdvancedAudioSettings({ 
                        stabilityEngine: { ...advancedAudio.stabilityEngine, loopVariations: { ...advancedAudio.stabilityEngine.loopVariations, isEnabled: val } } 
                      });
                      if (val) trackFeatureUsage('loopVariations');
                    }}
                  >
                    <div className="space-y-2 pt-1">
                      <ControlLabel label="Variation Intensity" value={advancedAudio.stabilityEngine.loopVariations.intensity.toUpperCase()} />
                      <div className="grid grid-cols-3 gap-2">
                        {['low', 'medium', 'high'].map((s) => (
                          <button
                            key={s}
                            onClick={() => updateAdvancedAudioSettings({ 
                              stabilityEngine: { ...advancedAudio.stabilityEngine, loopVariations: { ...advancedAudio.stabilityEngine.loopVariations, intensity: s as any } } 
                            })}
                            className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                              advancedAudio.stabilityEngine.loopVariations.intensity === s 
                              ? 'bg-system-blue text-system-background border-system-blue shadow-sm' 
                              : 'bg-secondary-system-background/50 text-system-secondary-label border-apple-border/50'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Section>

                  {/* Frequency Drift Protection */}
                  <Section
                    id="drift-protection"
                    title="Frequency Drift Protection"
                    icon={Lock}
                    color="bg-system-red/10 text-system-red"
                    isEnabled={advancedAudio.stabilityEngine.driftProtection.isEnabled}
                    onToggle={(val: boolean) => {
                      updateAdvancedAudioSettings({ 
                        stabilityEngine: { ...advancedAudio.stabilityEngine, driftProtection: { ...advancedAudio.stabilityEngine.driftProtection, isEnabled: val } } 
                      });
                      if (val) trackFeatureUsage('driftProtection');
                    }}
                  >
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {['strict', 'soft'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => updateAdvancedAudioSettings({ 
                            stabilityEngine: { ...advancedAudio.stabilityEngine, driftProtection: { ...advancedAudio.stabilityEngine.driftProtection, mode: mode as any } } 
                          })}
                          className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                            advancedAudio.stabilityEngine.driftProtection.mode === mode 
                            ? 'bg-system-red text-system-background border-system-red' 
                            : 'bg-secondary-system-background/50 text-system-secondary-label border-apple-border/50'
                          }`}
                        >
                          {mode} LOCK
                        </button>
                      ))}
                    </div>
                  </Section>

                  {/* Emergency Recovery */}
                  <Section
                    id="emergency-recovery"
                    title="Emergency Audio Recovery"
                    icon={LifeBuoy}
                    color="bg-system-orange/10 text-system-orange"
                    isEnabled={advancedAudio.stabilityEngine.emergencyRecovery.isEnabled}
                    onToggle={(val: boolean) => {
                      updateAdvancedAudioSettings({ 
                        stabilityEngine: { ...advancedAudio.stabilityEngine, emergencyRecovery: { ...advancedAudio.stabilityEngine.emergencyRecovery, isEnabled: val } } 
                      });
                      if (val) trackFeatureUsage('emergencyRecovery');
                    }}
                  >
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {['fast', 'safe'].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => updateAdvancedAudioSettings({ 
                            stabilityEngine: { ...advancedAudio.stabilityEngine, emergencyRecovery: { ...advancedAudio.stabilityEngine.emergencyRecovery, speed: speed as any } } 
                          })}
                          className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                            advancedAudio.stabilityEngine.emergencyRecovery.speed === speed 
                            ? 'bg-system-orange text-system-background border-system-orange' 
                            : 'bg-secondary-system-background/50 text-system-secondary-label border-apple-border/50'
                          }`}
                        >
                          {speed} Recovery
                        </button>
                      ))}
                    </div>
                  </Section>

                  {/* Safe Idle (Heartbeat) */}
                  <Section
                    id="safe-idle"
                    title="Safe Idle (iOS Heartbeat)"
                    icon={Activity}
                    color="bg-system-blue/10 text-system-blue"
                    isEnabled={settings.safeIdle.isEnabled}
                    onToggle={(val: boolean) => {
                      const { updateSafeIdleSettings } = useSettings(); // Use helper or direct call? Since we are inside component...
                      // Wait, useSettings is already called at top of AdvancedAudioIntelligence
                      updateSafeIdleSettings({ isEnabled: val });
                    }}
                  >
                    <div className="space-y-4 pt-1">
                      <div>
                        <ControlLabel label="Inaudible Volume" value={(settings.safeIdle.volume * 100).toFixed(3) + '%'} />
                        <input 
                          type="range" min="0.0001" max="0.005" step="0.0001"
                          value={settings.safeIdle.volume}
                          onChange={(e) => {
                            const { updateSafeIdleSettings } = useSettings();
                            updateSafeIdleSettings({ volume: parseFloat(e.target.value) });
                          }}
                          className="w-full accent-system-blue h-1.5 bg-system-tertiary-label/20 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-[9px] text-system-secondary-label mt-2 italic leading-relaxed">
                          Keeps the iOS audio session active with a silent heartbeat. Prevents the app from sleeping during idle periods.
                        </p>
                      </div>
                    </div>
                  </Section>

                  {/* Spatial Layer Depth Engine */}
                  <Section
                    id="spatial-engine"
                    title="Spatial Layer Depth Engine"
                    icon={Box}
                    color="bg-system-blue/10 text-system-blue"
                    isEnabled={advancedAudio.stabilityEngine.spatialEngine.isEnabled}
                    onToggle={(val: boolean) => {
                      updateAdvancedAudioSettings({ 
                        stabilityEngine: { ...advancedAudio.stabilityEngine, spatialEngine: { ...advancedAudio.stabilityEngine.spatialEngine, isEnabled: val } } 
                      });
                      if (val) trackFeatureUsage('spatialEngine');
                    }}
                  >
                    <div className="space-y-4 pt-2">
                      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {['subliminal', 'binaural', 'nature', 'noise'].map(layer => (
                          <button
                            key={layer}
                            onClick={() => setSelectedSpatialLayer(layer)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border ${selectedSpatialLayer === layer ? 'bg-system-blue text-system-background border-system-blue shadow-sm' : 'bg-system-background border-apple-border/50 text-system-secondary-label'}`}
                          >
                            {layer}
                          </button>
                        ))}
                      </div>

                      <div className="bg-secondary-system-background/50 rounded-xl p-3 border border-apple-border/30 space-y-4">
                        <div>
                          <ControlLabel label="Pan (L ↔ R)" value={advancedAudio.stabilityEngine.spatialEngine.layers[selectedSpatialLayer]?.pan.toFixed(2) || '0.00'} />
                          <input 
                            type="range" min="-1" max="1" step="0.1"
                            value={advancedAudio.stabilityEngine.spatialEngine.layers[selectedSpatialLayer]?.pan || 0}
                            onChange={(e) => {
                              const layers = { ...advancedAudio.stabilityEngine.spatialEngine.layers };
                              layers[selectedSpatialLayer] = { ...layers[selectedSpatialLayer], pan: parseFloat(e.target.value) };
                              updateAdvancedAudioSettings({ 
                                stabilityEngine: { ...advancedAudio.stabilityEngine, spatialEngine: { ...advancedAudio.stabilityEngine.spatialEngine, layers } } 
                              });
                            }}
                            className="w-full accent-system-blue h-1 bg-system-tertiary-label/20 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <ControlLabel label="Depth (Near ↔ Far)" value={advancedAudio.stabilityEngine.spatialEngine.layers[selectedSpatialLayer]?.depth.toFixed(2) || '0.50'} />
                          <input 
                            type="range" min="0" max="1" step="0.1"
                            value={advancedAudio.stabilityEngine.spatialEngine.layers[selectedSpatialLayer]?.depth || 0.5}
                            onChange={(e) => {
                              const layers = { ...advancedAudio.stabilityEngine.spatialEngine.layers };
                              layers[selectedSpatialLayer] = { ...layers[selectedSpatialLayer], depth: parseFloat(e.target.value) };
                              updateAdvancedAudioSettings({ 
                                stabilityEngine: { ...advancedAudio.stabilityEngine, spatialEngine: { ...advancedAudio.stabilityEngine.spatialEngine, layers } } 
                              });
                            }}
                            className="w-full accent-system-blue h-1 bg-system-tertiary-label/20 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <ControlLabel label="Width (Narrow ↔ Wide)" value={advancedAudio.stabilityEngine.spatialEngine.layers[selectedSpatialLayer]?.width.toFixed(2) || '0.50'} />
                          <input 
                            type="range" min="0" max="1" step="0.1"
                            value={advancedAudio.stabilityEngine.spatialEngine.layers[selectedSpatialLayer]?.width || 0.5}
                            onChange={(e) => {
                              const layers = { ...advancedAudio.stabilityEngine.spatialEngine.layers };
                              layers[selectedSpatialLayer] = { ...layers[selectedSpatialLayer], width: parseFloat(e.target.value) };
                              updateAdvancedAudioSettings({ 
                                stabilityEngine: { ...advancedAudio.stabilityEngine, spatialEngine: { ...advancedAudio.stabilityEngine.spatialEngine, layers } } 
                              });
                            }}
                            className="w-full accent-system-blue h-1 bg-system-tertiary-label/20 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </Section>

                  {/* Invisible Session Continuity */}
                  <Section
                    id="session-continuity"
                    title="Invisible Session Continuity"
                    icon={History}
                    color="bg-system-green/10 text-system-green"
                    isEnabled={advancedAudio.stabilityEngine.sessionContinuity.isEnabled}
                    onToggle={(val: boolean) => {
                      updateAdvancedAudioSettings({ 
                        stabilityEngine: { ...advancedAudio.stabilityEngine, sessionContinuity: { ...advancedAudio.stabilityEngine.sessionContinuity, isEnabled: val } } 
                      });
                      if (val) trackFeatureUsage('sessionContinuity');
                    }}
                  >
                    <div className="flex flex-col gap-3 py-2">
                       <div className="flex items-center justify-between p-3 bg-system-green/5 rounded-xl border border-system-green/10">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-system-green animate-pulse" />
                            <span className="text-[10px] font-bold text-system-label italic">System Monitoring</span>
                          </div>
                          <span className="text-[9px] font-black text-system-green uppercase">Live State Sync</span>
                       </div>
                       <p className="text-[10px] font-medium text-system-secondary-label leading-relaxed px-1">
                         Continuity Engine is active. Full session state (Layers, Hz, Vol, position) is auto-saved to stable storage every 5 seconds.
                       </p>
                    </div>
                  </Section>

                  {/* Session Heatmap Insights */}
                  <Section
                    id="heatmap-insights"
                    title="Session Heatmap Insights"
                    icon={Map}
                    color="bg-system-purple/10 text-system-purple"
                    isEnabled={advancedAudio.stabilityEngine.heatmapInsights.isEnabled}
                    onToggle={(val: boolean) => {
                      updateAdvancedAudioSettings({ 
                        stabilityEngine: { ...advancedAudio.stabilityEngine, heatmapInsights: { ...advancedAudio.stabilityEngine.heatmapInsights, isEnabled: val } } 
                      });
                      if (val) trackFeatureUsage('heatmapInsights');
                    }}
                  >
                    <SessionHeatmap />
                  </Section>

                  {/* Ultra-Low Power Mode */}
                  <Section
                    id="low-power-mode"
                    title="Ultra-Low Power Mode"
                    icon={Battery}
                    color="bg-system-green/10 text-system-green"
                    isEnabled={advancedAudio.stabilityEngine.lowPowerMode.isEnabled}
                    onToggle={(val: boolean) => {
                      updateAdvancedAudioSettings({ 
                        stabilityEngine: { ...advancedAudio.stabilityEngine, lowPowerMode: { ...advancedAudio.stabilityEngine.lowPowerMode, isEnabled: val } } 
                      });
                      if (val) trackFeatureUsage('lowPowerMode');
                    }}
                  >
                    <div className="space-y-4 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-system-secondary-label uppercase tracking-widest">Auto Mode (&lt; 30% Batt)</span>
                        <button 
                          onClick={() => updateAdvancedAudioSettings({ 
                            stabilityEngine: { ...advancedAudio.stabilityEngine, lowPowerMode: { ...advancedAudio.stabilityEngine.lowPowerMode, autoMode: !advancedAudio.stabilityEngine.lowPowerMode.autoMode } } 
                          })}
                          className={`w-8 h-4 rounded-full relative transition-colors ${advancedAudio.stabilityEngine.lowPowerMode.autoMode ? 'bg-system-green' : 'bg-system-tertiary-label/30'}`}
                        >
                          <div className={`absolute top-0.5 left-0.5 bg-system-background w-3 h-3 rounded-full transition-transform ${advancedAudio.stabilityEngine.lowPowerMode.autoMode ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <p className="text-[9px] text-system-secondary-label italic leading-relaxed">
                        Throttles audio engine updates and simplifies Spatial Engine to save battery and CPU on long sessions.
                      </p>
                    </div>
                  </Section>

                  {/* Ambient Interrupt Shield */}
                  <Section
                    id="interrupt-shield"
                    title="Ambient Interrupt Shield"
                    icon={ShieldCheck}
                    color="bg-system-blue/10 text-system-blue"
                    isEnabled={advancedAudio.stabilityEngine.interruptShield.isEnabled}
                    onToggle={(val: boolean) => {
                      updateAdvancedAudioSettings({ 
                        stabilityEngine: { ...advancedAudio.stabilityEngine, interruptShield: { ...advancedAudio.stabilityEngine.interruptShield, isEnabled: val } } 
                      });
                      if (val) trackFeatureUsage('interruptShield');
                    }}
                  >
                    <div className="space-y-4 pt-1">
                      <div>
                        <ControlLabel label="Shield Sensitivity" value={advancedAudio.stabilityEngine.interruptShield.sensitivity.toUpperCase()} />
                        <div className="grid grid-cols-3 gap-2">
                          {['low', 'med', 'high'].map((s) => (
                            <button
                              key={s}
                              onClick={() => updateAdvancedAudioSettings({ 
                                stabilityEngine: { ...advancedAudio.stabilityEngine, interruptShield: { ...advancedAudio.stabilityEngine.interruptShield, sensitivity: s as any } } 
                              })}
                              className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                                advancedAudio.stabilityEngine.interruptShield.sensitivity === s 
                                ? 'bg-system-blue text-system-background border-system-blue shadow-sm' 
                                : 'bg-secondary-system-background/50 text-system-secondary-label border-apple-border/50'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[9px] text-system-secondary-label italic leading-relaxed">
                        Detects sudden environmental noise and compensates with a precise, safety-guarded volume lift.
                      </p>
                    </div>
                  </Section>
                </div>
              )}
            </div>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="space-y-4">
      <GroupHeader 
        id="calm"
        title="Calm Control Core"
        icon={Brain}
        color="bg-system-blue/10 text-system-blue"
        isEnabled={advancedAudio.calmControl.isEnabled}
        onToggle={(val) => updateAdvancedAudioSettings({ calmControl: { ...advancedAudio.calmControl, isEnabled: val } })}
      />
      <GroupHeader 
        id="stability"
        title="Adaptive Stability Engine"
        icon={Shield}
        color="bg-system-purple/10 text-system-purple"
        isEnabled={advancedAudio.stabilityEngine.isEnabled}
        onToggle={(val) => updateAdvancedAudioSettings({ stabilityEngine: { ...advancedAudio.stabilityEngine, isEnabled: val } })}
      />
      
      {/* App Intelligence Group */}
      <div className={`p-4 rounded-2xl border transition-all ${expandedGroup === 'app-intel' ? 'bg-system-background border-apple-border/50 shadow-sm' : 'bg-secondary-system-background/30 border-transparent hover:bg-secondary-system-background/50 text-system-secondary-label'}`}>
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setExpandedGroup(expandedGroup === 'app-intel' ? null : 'app-intel')}
            className="flex items-center gap-3 flex-1 text-left"
          >
            <div className={`p-2 rounded-xl ${expandedGroup === 'app-intel' ? 'bg-system-blue/10 text-system-blue' : 'bg-system-tertiary-label/10 text-system-secondary-label'}`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${expandedGroup === 'app-intel' ? 'text-system-label' : 'text-system-secondary-label'}`}>App Intelligence</h3>
              <p className="text-[10px] text-system-tertiary-label font-medium">Deep System Healing & Stabilizer</p>
            </div>
            <ChevronRight className={`w-4 h-4 text-system-tertiary-label transition-transform ml-auto ${expandedGroup === 'app-intel' ? 'rotate-90' : ''}`} />
          </button>
          <div className="ml-4 pl-4 border-l border-apple-border/20">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                updateAppIntelligence({ isEnabled: !settings.appIntelligence.isEnabled });
                if (!settings.appIntelligence.isEnabled) trackFeatureUsage('appIntelligence');
              }}
              className={`w-10 h-5 rounded-full relative transition-colors ${settings.appIntelligence.isEnabled ? 'bg-system-blue' : 'bg-system-tertiary-label/30'}`}
            >
              <div className={`absolute top-0.5 left-0.5 bg-system-background w-4 h-4 rounded-full transition-transform ${settings.appIntelligence.isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expandedGroup === 'app-intel' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <Section
                    id="intel-build"
                    title="Build Fix Engine"
                    icon={Box}
                    color="bg-system-blue/10 text-system-blue"
                    isEnabled={settings.appIntelligence.buildFixEngine}
                    onToggle={(val: boolean) => updateAppIntelligence({ buildFixEngine: val })}
                  >
                    <p className="text-[9px] text-system-secondary-label font-medium px-1">Auto-resolves dependency conflicts.</p>
                  </Section>

                  <Section
                    id="intel-config"
                    title="Config Stabilizer"
                    icon={Settings}
                    color="bg-system-purple/10 text-system-purple"
                    isEnabled={settings.appIntelligence.configStabilizer}
                    onToggle={(val: boolean) => updateAppIntelligence({ configStabilizer: val })}
                  >
                    <p className="text-[9px] text-system-secondary-label font-medium px-1">Maintains environment integrity.</p>
                  </Section>

                  <Section
                    id="intel-path"
                    title="Path Resolver"
                    icon={Terminal}
                    color="bg-system-orange/10 text-system-orange"
                    isEnabled={settings.appIntelligence.pathResolver}
                    onToggle={(val: boolean) => updateAppIntelligence({ pathResolver: val })}
                  >
                    <p className="text-[9px] text-system-secondary-label font-medium px-1">Heals broken file imports.</p>
                  </Section>

                  <Section
                    id="intel-crash"
                    title="Runtime Crash Shield"
                    icon={ShieldCheck}
                    color="bg-system-red/10 text-system-red"
                    isEnabled={settings.appIntelligence.runtimeCrashShield}
                    onToggle={(val: boolean) => updateAppIntelligence({ runtimeCrashShield: val })}
                  >
                    <p className="text-[9px] text-system-secondary-label font-medium px-1">Prevents fatal UI exceptions.</p>
                  </Section>

                  <Section
                    id="intel-ios"
                    title="iOS Stability Mode (L3)"
                    icon={Zap}
                    color="bg-system-yellow/10 text-system-yellow"
                    isEnabled={settings.appIntelligence.iosStabilityMode}
                    onToggle={(val: boolean) => updateAppIntelligence({ iosStabilityMode: val })}
                  >
                    <p className="text-[9px] text-system-secondary-label font-black px-1 uppercase text-system-red">Critical for iPhone 8</p>
                  </Section>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Self Heal System */}
      <div className={`p-4 rounded-2xl border transition-all ${expandedGroup === 'self-heal' ? 'bg-system-background border-apple-border/50 shadow-sm' : 'bg-secondary-system-background/30 border-transparent hover:bg-secondary-system-background/50 text-system-secondary-label'}`}>
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setExpandedGroup(expandedGroup === 'self-heal' ? null : 'self-heal')}
            className="flex items-center gap-3 flex-1 text-left"
          >
            <div className={`p-2 rounded-xl ${expandedGroup === 'self-heal' ? 'bg-system-red/10 text-system-red' : 'bg-system-tertiary-label/10 text-system-secondary-label'}`}>
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${expandedGroup === 'self-heal' ? 'text-system-label' : 'text-system-secondary-label'}`}>Self Heal System</h3>
              <p className="text-[10px] text-system-tertiary-label font-medium">Automated Audio Recovery (iOS 16 Optimized)</p>
            </div>
            <ChevronRight className={`w-4 h-4 text-system-tertiary-label transition-transform ml-auto ${expandedGroup === 'self-heal' ? 'rotate-90' : ''}`} />
          </button>
          <div className="ml-4 pl-4 border-l border-apple-border/20">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                updateAdvancedAudioSettings({ selfHeal: { ...advancedAudio.selfHeal, isEnabled: !advancedAudio.selfHeal.isEnabled } });
                if (!advancedAudio.selfHeal.isEnabled) trackFeatureUsage('selfHeal');
              }}
              className={`w-10 h-5 rounded-full relative transition-colors ${advancedAudio.selfHeal.isEnabled ? 'bg-system-red' : 'bg-system-tertiary-label/30'}`}
            >
              <div className={`absolute top-0.5 left-0.5 bg-system-background w-4 h-4 rounded-full transition-transform ${advancedAudio.selfHeal.isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expandedGroup === 'self-heal' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 space-y-3">
                <Section
                  id="self-heal-main"
                  title="Self Heal Main Audio"
                  icon={ShieldCheck}
                  color="bg-system-red/10 text-system-red"
                  isEnabled={advancedAudio.selfHeal.mainAudio}
                  onToggle={(val: boolean) => updateAdvancedAudioSettings({ selfHeal: { ...advancedAudio.selfHeal, mainAudio: val } })}
                >
                  <p className="text-[10px] text-system-secondary-label italic leading-relaxed pt-1">
                    Detects broken playback state and restarts audio safely via silent recovery. Prevents frozen or dead audio.
                  </p>
                </Section>

                <Section
                  id="self-heal-volume"
                  title="Self Heal Main Volume"
                  icon={Volume2}
                  color="bg-system-blue/10 text-system-blue"
                  isEnabled={advancedAudio.selfHeal.volume}
                  onToggle={(val: boolean) => updateAdvancedAudioSettings({ selfHeal: { ...advancedAudio.selfHeal, volume: val } })}
                >
                  <p className="text-[10px] text-system-secondary-label italic leading-relaxed pt-1">
                    Detects volume mismatch or unexpected resets. Automatically restores the last valid volume state.
                  </p>
                </Section>

                <Section
                  id="self-heal-background"
                  title="Self Heal Background Playback"
                  icon={History}
                  color="bg-system-purple/10 text-system-purple"
                  isEnabled={advancedAudio.selfHeal.background}
                  onToggle={(val: boolean) => updateAdvancedAudioSettings({ selfHeal: { ...advancedAudio.selfHeal, background: val } })}
                >
                  <p className="text-[10px] text-system-secondary-label italic leading-relaxed pt-1">
                    Detects iOS background suspension and silently reconnects the playback loop to ensure continuous performance.
                  </p>
                </Section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GroupHeader 
        id="stats"
        title="Usage Intelligence Dashboard"
        icon={BarChart3}
        color="bg-system-orange/10 text-system-orange"
        hideToggle
      />
    </div>
  );
};
