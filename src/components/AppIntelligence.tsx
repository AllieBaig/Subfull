import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Settings, 
  Terminal, 
  RefreshCw, 
  Wrench, 
  Lock, 
  Zap, 
  FileCheck, 
  HardDrive, 
  Cpu,
  ChevronDown,
  Activity,
  Box
} from 'lucide-react';
import { useSettings } from '../SettingsContext';
import { AppIntelligenceSettings } from '../types';

export const AppIntelligence: React.FC = () => {
  const { settings, updateAppIntelligence } = useSettings();
  const { appIntelligence } = settings;
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleIntelligence = (key: keyof AppIntelligenceSettings) => {
    if (key === 'isEnabled') {
      updateAppIntelligence({ isEnabled: !appIntelligence.isEnabled });
    } else {
      updateAppIntelligence({ [key]: !appIntelligence[key] });
    }
  };

  const ToggleItem = ({ 
    id, 
    label, 
    desc, 
    icon: Icon, 
    enabled 
  }: { 
    id: keyof AppIntelligenceSettings, 
    label: string, 
    desc: string, 
    icon: any, 
    enabled: boolean 
  }) => (
    <div className="flex items-center justify-between py-3 px-1 group/item border-b border-apple-border/30 last:border-0">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`p-1.5 rounded-lg ${enabled ? 'bg-system-blue/10 text-system-blue' : 'bg-system-fill text-system-tertiary-label'} transition-colors`}>
          <Icon size={14} />
        </div>
        <div className="min-w-0">
          <h5 className="text-[11px] font-black tracking-tight text-system-label truncate uppercase">{label}</h5>
          <p className="text-[9px] text-system-secondary-label font-bold leading-tight line-clamp-1">{desc}</p>
        </div>
      </div>
      <button 
        onClick={() => toggleIntelligence(id)}
        className={`flex-shrink-0 w-8 h-4.5 rounded-full relative transition-colors ${enabled ? 'bg-system-blue' : 'bg-system-tertiary-label'}`}
      >
        <motion.div 
          className="absolute top-0.5 left-0.5 bg-system-background w-3.5 h-3.5 rounded-full shadow-sm" 
          animate={{ x: enabled ? 14 : 0 }} 
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Main Switch */}
      <div className="bg-apple-card border border-apple-border rounded-2xl p-4 flex items-center justify-between paper-emboss shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${appIntelligence.isEnabled ? 'bg-system-blue text-system-background shadow-blue' : 'bg-system-fill text-system-tertiary-label'} transition-all`}>
            <Cpu size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-system-label">App Intelligence</h4>
            <p className="text-[10px] text-system-secondary-label font-bold">Auto-Healing & System Guard</p>
          </div>
        </div>
        <button 
          onClick={() => toggleIntelligence('isEnabled')}
          className={`flex-shrink-0 w-10 h-6 rounded-full relative transition-colors ${appIntelligence.isEnabled ? 'bg-system-blue shadow-lg shadow-system-blue/20' : 'bg-system-fill'}`}
        >
          <motion.div 
            className="absolute top-1 left-1 bg-system-background w-4 h-4 rounded-full shadow-sm" 
            animate={{ x: appIntelligence.isEnabled ? 16 : 0 }} 
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {appIntelligence.isEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -5 }}
            className="flex flex-col gap-3"
          >
            {/* Core Engines */}
            <div className="bg-apple-card rounded-2xl border border-apple-border overflow-hidden">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'engines' ? null : 'engines')}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary-system-background transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-system-blue" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-system-label">Core Stability Engines</span>
                </div>
                <motion.div animate={{ rotate: expandedSection === 'engines' ? 180 : 0 }}>
                  <ChevronDown size={14} className="text-system-tertiary-label" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {expandedSection === 'engines' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-apple-border/30 bg-secondary-system-background/20"
                  >
                    <div className="p-3 pt-1 flex flex-col">
                      <ToggleItem 
                        id="buildFixEngine" 
                        label="Build Fix Engine" 
                        desc="Auto-resolves package & build dependency conflicts" 
                        icon={Box} 
                        enabled={appIntelligence.buildFixEngine} 
                      />
                      <ToggleItem 
                        id="configStabilizer" 
                        label="Config Stabilizer" 
                        desc="Maintains valid Vite & environment configurations" 
                        icon={Settings} 
                        enabled={appIntelligence.configStabilizer} 
                      />
                      <ToggleItem 
                        id="pathResolver" 
                        label="Path Resolver" 
                        desc="Heals broken imports & case-sensitive path issues" 
                        icon={Terminal} 
                        enabled={appIntelligence.pathResolver} 
                      />
                      <ToggleItem 
                        id="validationEngine" 
                        label="Final Validation" 
                        desc="Deep system scan for hidden runtime regressions" 
                        icon={FileCheck} 
                        enabled={appIntelligence.validationEngine} 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Runtime Guards */}
            <div className="bg-apple-card rounded-2xl border border-apple-border overflow-hidden">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'guards' ? null : 'guards')}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary-system-background transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-system-green" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-system-label">Runtime Crash Guards</span>
                </div>
                <motion.div animate={{ rotate: expandedSection === 'guards' ? 180 : 0 }}>
                  <ChevronDown size={14} className="text-system-tertiary-label" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {expandedSection === 'guards' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-apple-border/30 bg-secondary-system-background/20"
                  >
                    <div className="p-3 pt-1 flex flex-col">
                      <ToggleItem 
                        id="runtimeCrashShield" 
                        label="Crash Shield" 
                        desc="Prevents blank screens & fatal react exceptions" 
                        icon={Lock} 
                        enabled={appIntelligence.runtimeCrashShield} 
                      />
                      <ToggleItem 
                        id="reactRulesEnforcer" 
                        label="React Rules" 
                        desc="Fixes hook misuse & unstable state propagation" 
                        icon={RefreshCw} 
                        enabled={appIntelligence.reactRulesEnforcer} 
                      />
                      <ToggleItem 
                        id="routingGuard" 
                        label="Routing Guard" 
                        desc="Ensures stable SPA navigation & index fallbacks" 
                        icon={Zap} 
                        enabled={appIntelligence.routingGuard} 
                      />
                      <ToggleItem 
                        id="assetRepair" 
                        label="Asset Repair" 
                        desc="Auto-downloads missing fonts, icons & styles" 
                        icon={HardDrive} 
                        enabled={appIntelligence.assetRepair} 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Specialized Modes */}
            <div className="bg-apple-card rounded-2xl border border-apple-border overflow-hidden">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'modes' ? null : 'modes')}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary-system-background transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-system-orange" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-system-label">Performance & Compatibility</span>
                </div>
                <motion.div animate={{ rotate: expandedSection === 'modes' ? 180 : 0 }}>
                  <ChevronDown size={14} className="text-system-tertiary-label" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {expandedSection === 'modes' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-apple-border/30 bg-secondary-system-background/20"
                  >
                    <div className="p-3 pt-1 flex flex-col">
                      <ToggleItem 
                        id="iosStabilityMode" 
                        label="iOS Stability (L3)" 
                        desc="Hyper-optimized mode for iPhone 8 + iOS 16" 
                        icon={Activity} 
                        enabled={appIntelligence.iosStabilityMode} 
                      />
                      <ToggleItem 
                        id="swSafeMode" 
                        label="Service Worker Safe" 
                        desc="Bypasses SW logic if network instability detected" 
                        icon={Wrench} 
                        enabled={appIntelligence.swSafeMode} 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
