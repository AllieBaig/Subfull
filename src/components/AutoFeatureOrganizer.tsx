import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderTree, History, Settings2, ShieldCheck, Zap, 
  ChevronRight, Brain, Lightbulb, Info, CheckCircle2,
  AlertCircle, ArrowRightLeft, LayoutGrid, Cpu, Music,
  Activity, Sliders, Timer
} from 'lucide-react';
import { useSettings } from '../SettingsContext';

const GROUPS = [
  'Main Audio',
  'Frequency',
  'Soundscape',
  'Sync Lab',
  'Playback & Control',
  'Audio Intelligence'
];

export const AutoFeatureOrganizer = () => {
  const { settings, updateAutoOrganizerSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'status' | 'history'>('status');

  const decisions = settings.autoOrganizer.decisions;

  const getGroupIcon = (group: string) => {
    switch(group) {
      case 'Main Audio': return Music;
      case 'Frequency': return Activity;
      case 'Soundscape': return Zap;
      case 'Sync Lab': return Sliders;
      case 'Playback & Control': return Timer;
      case 'Audio Intelligence': return Cpu;
      default: return FolderTree;
    }
  };

  const getRecentDecisions = useMemo(() => {
    return [...decisions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [decisions]);

  return (
    <div className="flex flex-col gap-6 mt-4 pb-4">
      {/* status/history tabs */}
      <div className="flex bg-secondary-system-background p-1 rounded-xl border border-apple-border/30">
        <button 
          onClick={() => setActiveTab('status')}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'status' ? 'bg-system-background text-system-blue shadow-sm' : 'text-system-secondary-label'}`}
        >
          Status
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'history' ? 'bg-system-background text-system-blue shadow-sm' : 'text-system-secondary-label'}`}
        >
          History
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'status' ? (
          <motion.div 
            key="status"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col gap-5"
          >
            {/* Intelligence Card */}
            <div className="bg-system-blue/5 border border-system-blue/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-system-blue/20 flex items-center justify-center text-system-blue shadow-inner">
                  <Brain size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-system-blue uppercase tracking-wider">Placement Intelligence</h4>
                  <p className="text-[9px] text-system-secondary-label font-bold uppercase tracking-tight">System is monitoring for new features</p>
                </div>
                <div className="ml-auto">
                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-system-green/10 border border-system-green/20 rounded-full">
                     <div className="w-1.5 h-1.5 rounded-full bg-system-green animate-pulse" />
                     <span className="text-[8px] font-black text-system-green uppercase">Active</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white/50 border border-apple-border/30 rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-system-tertiary-label uppercase">Efficiency</span>
                  <span className="text-sm font-black text-system-label">98.4%</span>
                </div>
                <div className="bg-white/50 border border-apple-border/30 rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-system-tertiary-label uppercase">Struct. Integrity</span>
                  <span className="text-sm font-black text-system-label">Optimal</span>
                </div>
              </div>
            </div>

            {/* Current Active Structure */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <LayoutGrid size={14} className="text-system-secondary-label" />
                <span className="text-[10px] font-black uppercase tracking-widest text-system-secondary-label">Mapped Groups</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {GROUPS.map(group => {
                  const Icon = getGroupIcon(group);
                  return (
                    <div key={group} className="bg-system-background border border-apple-border/50 rounded-xl p-3 flex items-center justify-between group transition-all hover:border-system-blue/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary-system-background flex items-center justify-center text-system-secondary-label group-hover:text-system-blue transition-colors">
                          <Icon size={16} />
                        </div>
                        <span className="text-[11px] font-bold text-system-label">{group}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                           <span className="text-[9px] font-black text-system-blue uppercase">Stable</span>
                           <span className="text-[8px] font-bold text-system-tertiary-label uppercase tracking-tighter">Structure</span>
                        </div>
                        <ChevronRight size={14} className="text-system-tertiary-label" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

             {/* Feature Belonging Preview */}
            <div className="bg-secondary-system-background/50 border border-dashed border-apple-border rounded-2xl p-4 flex flex-col gap-3">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Lightbulb size={14} className="text-system-orange" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-system-secondary-label">Placement Predictor</span>
                 </div>
                 <div className="flex items-center gap-1 px-2 py-0.5 bg-system-blue/10 rounded-full">
                    <span className="text-[8px] font-black text-system-blue uppercase tracking-tighter">AI Node Active</span>
                 </div>
               </div>
               
               <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between bg-white border border-apple-border/50 rounded-xl p-3 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-system-label">Adaptive Depth Node</span>
                      <span className="text-[9px] font-medium text-system-tertiary-label">Current: Unassigned</span>
                    </div>
                    <ArrowRightLeft size={16} className="text-system-blue" />
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-black text-system-blue">Soundscape</span>
                      <span className="text-[9px] font-bold text-system-tertiary-label uppercase">Target</span>
                    </div>
                  </div>
                  
                  {/* Logic Rules List */}
                  {Object.entries(settings.autoOrganizer.customGroups).length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-[8px] font-black text-system-tertiary-label uppercase px-1 mb-1">Active User Rules</p>
                      {Object.entries(settings.autoOrganizer.customGroups).map(([group, featureIds]) => (
                        <div key={group} className="flex flex-wrap gap-1 p-2 bg-white/40 rounded-lg border border-apple-border/20">
                           <span className="text-[9px] font-black text-system-blue uppercase w-full mb-1">{group}</span>
                           {featureIds.map(f => (
                             <span key={f} className="px-2 py-0.5 bg-white border border-apple-border/40 rounded text-[8px] font-bold text-system-secondary-label flex items-center gap-1">
                               {f}
                               <button 
                                 onClick={() => {
                                   const newGroups = { ...settings.autoOrganizer.customGroups };
                                   newGroups[group] = newGroups[group].filter(id => id !== f);
                                   if (newGroups[group].length === 0) delete newGroups[group];
                                   updateAutoOrganizerSettings({ customGroups: newGroups });
                                 }}
                                 className="text-system-red"
                               >
                                 ×
                               </button>
                             </span>
                           ))}
                        </div>
                      ))}
                    </div>
                  )}
               </div>

               <button 
                 onClick={() => {
                   // Mock adding a rule for demonstration of reconnected logic
                   const featureId = 'adaptive-depth-node';
                   const targetGroup = 'Soundscape';
                   const currentGroups = settings.autoOrganizer.customGroups[targetGroup] || [];
                   if (!currentGroups.includes(featureId)) {
                     updateAutoOrganizerSettings({
                       customGroups: {
                         ...settings.autoOrganizer.customGroups,
                         [targetGroup]: [...currentGroups, featureId]
                       }
                     });
                   }
                 }}
                 className="w-full py-2 bg-system-blue text-system-background rounded-xl text-[9px] font-black uppercase shadow-lg shadow-system-blue/20 hover:opacity-90 active:scale-95 transition-all"
               >
                 Apply AI Recommendation
               </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-4"
          >
             <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <History size={14} className="text-system-secondary-label" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-system-secondary-label">Placement Log</span>
                </div>
                <span className="text-[9px] font-bold text-system-tertiary-label">{decisions.length} Decisions</span>
             </div>

             <div className="space-y-3">
               {decisions.map((decision, idx) => (
                 <div key={idx} className="bg-system-background border border-apple-border/50 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-system-green" />
                        <span className="text-xs font-bold text-system-label">{decision.featureName}</span>
                      </div>
                      <span className="text-[9px] font-bold text-system-tertiary-label uppercase">{new Date(decision.timestamp).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-secondary-system-background rounded-xl p-2 px-3 border border-apple-border/30">
                       <span className="text-[9px] font-black text-system-secondary-label uppercase">Placed In:</span>
                       <span className="px-2 py-0.5 bg-system-blue/10 text-system-blue rounded-full text-[9px] font-bold">{decision.targetGroup}</span>
                    </div>

                    <div className="flex items-start gap-2 pt-1 border-t border-apple-border/20 mt-1">
                       <Info size={12} className="text-system-tertiary-label mt-0.5 flex-shrink-0" />
                       <p className="text-[10px] font-medium text-system-secondary-label italic leading-relaxed">
                         "{decision.reason}"
                       </p>
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button className="flex-1 py-1.5 bg-secondary-system-background hover:bg-apple-border/20 rounded-lg text-[9px] font-black uppercase text-system-secondary-label transition-colors">
                        Override
                      </button>
                      <button className="flex-1 py-1.5 bg-secondary-system-background hover:bg-apple-border/20 rounded-lg text-[9px] font-black uppercase text-system-secondary-label transition-colors">
                        Lock Structure
                      </button>
                    </div>
                 </div>
               ))}
             </div>

             <div className="py-8 flex flex-col items-center justify-center gap-3">
               <div className="w-10 h-10 rounded-full bg-secondary-system-background flex items-center justify-center text-system-tertiary-label border border-apple-border">
                  <ShieldCheck size={20} />
               </div>
               <p className="text-[11px] font-bold text-system-tertiary-label uppercase tracking-widest">Decision Vault Secured</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
