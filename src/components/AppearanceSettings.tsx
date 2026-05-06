import React from 'react';
import { useSettings } from '../SettingsContext';
import { Group, Section } from './SettingsUI';
import { Palette, Sun, Moon, Monitor, Layout, Zap, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface AppearanceSettingsProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const AppearanceSettings = ({ isExpanded = false, onToggle = () => {} }: AppearanceSettingsProps) => {
  const { settings, updateSettings, updateAppearanceSettings, updateVisibilitySettings } = useSettings();

  return (
    <Group 
      title="Appearance" 
      icon={Palette} 
      color="bg-system-red/10 text-system-red"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="flex flex-col gap-3">
        <Section
          id="uimode"
          title="Interface Mode"
          subtitle="Pro vs Mini"
          icon={Layout}
          color="bg-system-blue/10 text-system-blue"
        >
           <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => updateAppearanceSettings({ uiMode: 'mini' })}
                  className={`flex flex-col items-center justify-center gap-1 py-4 rounded-2xl border transition-all ${settings.appearance.uiMode === 'mini' ? 'bg-system-blue border-system-blue text-white shadow-lg shadow-system-blue/20' : 'bg-secondary-system-background border-apple-border text-system-secondary-label'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-tight">Mini UI</span>
                  <span className="text-[8px] font-bold opacity-70 uppercase tracking-tighter italic">Slim Mode</span>
                </button>
                <button 
                  onClick={() => updateAppearanceSettings({ uiMode: 'pro' })}
                  className={`flex flex-col items-center justify-center gap-1 py-4 rounded-2xl border transition-all ${settings.appearance.uiMode === 'pro' ? 'bg-system-blue border-system-blue text-white shadow-lg shadow-system-blue/20' : 'bg-secondary-system-background border-apple-border text-system-secondary-label'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-tight">Pro UI</span>
                  <span className="text-[8px] font-bold opacity-70 uppercase tracking-tighter italic">Full Mode</span>
                </button>
              </div>
              <p className="text-[9px] text-system-secondary-label font-bold uppercase tracking-widest mt-1 text-center">Optimized for iPhone 8 & Mini displays</p>
            </div>
        </Section>

        <Section
          id="theme"
          title="Theme & Style"
          subtitle="Appearance"
          icon={Layout}
          color="bg-system-red/10 text-system-red"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-system-label">Follow System</p>
                  <p className="text-[9px] text-system-secondary-label font-bold uppercase tracking-widest mt-0.5">Sync with device theme</p>
                </div>
                <button 
                  onClick={() => updateAppearanceSettings({ followSystem: !settings.appearance.followSystem })}
                  className={`w-8 h-5 rounded-full relative transition-colors ${settings.appearance.followSystem ? 'bg-system-red' : 'bg-system-tertiary-label'}`}
                >
                  <motion.div className="absolute top-1 left-1 bg-tertiary-system-background w-3 h-3 rounded-full" animate={{ x: settings.appearance.followSystem ? 12 : 0 }} />
                </button>
              </div>

              {!settings.appearance.followSystem && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button 
                    onClick={() => updateAppearanceSettings({ theme: 'light' })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${settings.appearance.theme === 'light' ? 'bg-system-red border-system-red text-white' : 'bg-system-background border-apple-border text-system-secondary-label'}`}
                  >
                    <Sun size={14} />
                    <span className="text-[10px] font-black uppercase">Light</span>
                  </button>
                  <button 
                    onClick={() => updateAppearanceSettings({ theme: 'dark' })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${settings.appearance.theme === 'dark' ? 'bg-system-red border-system-red text-white' : 'bg-system-background border-apple-border text-system-secondary-label'}`}
                  >
                    <Moon size={14} />
                    <span className="text-[10px] font-black uppercase">Dark</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-system-secondary-label">Dark Mode Style</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => updateAppearanceSettings({ darkModeStyle: 'soft-purple' })}
                  className={`py-3 rounded-xl border transition-all ${settings.appearance.darkModeStyle === 'soft-purple' ? 'bg-system-red border-system-red text-white' : 'bg-system-background border-apple-border text-system-secondary-label'}`}
                >
                  <span className="text-[10px] font-black uppercase">Soft Purple</span>
                </button>
                <button 
                  onClick={() => updateAppearanceSettings({ darkModeStyle: 'soft-blue' })}
                  className={`py-3 rounded-xl border transition-all ${settings.appearance.darkModeStyle === 'soft-blue' ? 'bg-system-red border-system-red text-white' : 'bg-system-background border-apple-border text-system-secondary-label'}`}
                >
                  <span className="text-[10px] font-black uppercase">Soft Blue</span>
                </button>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="visuals"
          title="Visual Features"
          subtitle="Interface & Motion"
          icon={Zap}
          color="bg-system-orange/10 text-system-orange"
        >
          <div className="flex flex-col gap-6">
            {/* Animation Style */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-system-secondary-label">Animation Style</label>
              <select
                value={settings.animationStyle}
                onChange={(e) => updateSettings({ animationStyle: e.target.value as any })}
                className="w-full bg-system-background border border-apple-border rounded-xl text-xs font-semibold px-4 py-3 outline-none"
              >
                <option value="slide-up">Slide Up (Default)</option>
                <option value="slide-down">Slide Down</option>
                <option value="slide-left">Slide Left</option>
                <option value="slide-right">Slide Right</option>
                <option value="fade">Fade</option>
                <option value="random">Random</option>
              </select>
            </div>

            {/* Navigation Layout */}
            <div className="flex flex-col gap-4 pt-4 border-t border-apple-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-system-label">Back Button Position</p>
                  <p className="text-[9px] text-system-secondary-label font-bold uppercase mt-0.5">{settings.backButtonPosition === 'top' ? 'Screen Top' : 'Bottom Menu'}</p>
                </div>
                <div className="flex bg-secondary-system-background p-1 rounded-xl border border-apple-border h-8">
                  <button 
                    onClick={() => updateSettings({ backButtonPosition: 'top' })}
                    className={`px-3 h-full rounded-lg text-[9px] font-black uppercase transition-all ${settings.backButtonPosition === 'top' ? 'bg-system-background text-system-orange shadow-sm' : 'text-system-secondary-label'}`}
                  >
                    Top
                  </button>
                  <button 
                    onClick={() => updateSettings({ backButtonPosition: 'bottom' })}
                    className={`px-3 h-full rounded-lg text-[9px] font-black uppercase transition-all ${settings.backButtonPosition === 'bottom' ? 'bg-system-background text-system-orange shadow-sm' : 'text-system-secondary-label'}`}
                  >
                    Bottom
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-system-label">Navigation Bar Position</p>
                  <p className="text-[9px] text-system-secondary-label font-bold uppercase mt-0.5">{settings.menuPosition === 'top' ? 'Screen Top' : 'Screen Bottom'}</p>
                </div>
                <div className="flex bg-secondary-system-background p-1 rounded-xl border border-apple-border h-8">
                  <button 
                    onClick={() => updateSettings({ menuPosition: 'top' })}
                    className={`px-3 h-full rounded-lg text-[9px] font-black uppercase transition-all ${settings.menuPosition === 'top' ? 'bg-system-background text-system-orange shadow-sm' : 'text-system-secondary-label'}`}
                  >
                    Top
                  </button>
                  <button 
                    onClick={() => updateSettings({ menuPosition: 'bottom' })}
                    className={`px-3 h-full rounded-lg text-[9px] font-black uppercase transition-all ${settings.menuPosition === 'bottom' ? 'bg-system-background text-system-orange shadow-sm' : 'text-system-secondary-label'}`}
                  >
                    Bottom
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-system-label">Library Controls Position</p>
                  <p className="text-[9px] text-system-secondary-label font-bold uppercase mt-0.5">{settings.libraryControlsPosition === 'top' ? 'Screen Top' : 'Above Menu'}</p>
                </div>
                <div className="flex bg-secondary-system-background p-1 rounded-xl border border-apple-border h-8">
                  <button 
                    onClick={() => updateSettings({ libraryControlsPosition: 'top' })}
                    className={`px-3 h-full rounded-lg text-[9px] font-black uppercase transition-all ${settings.libraryControlsPosition === 'top' ? 'bg-system-background text-system-orange shadow-sm' : 'text-system-secondary-label'}`}
                  >
                    Top
                  </button>
                  <button 
                    onClick={() => updateSettings({ libraryControlsPosition: 'bottom' })}
                    className={`px-3 h-full rounded-lg text-[9px] font-black uppercase transition-all ${settings.libraryControlsPosition === 'bottom' ? 'bg-system-background text-system-orange shadow-sm' : 'text-system-secondary-label'}`}
                  >
                    Bottom
                  </button>
                </div>
              </div>
            </div>

            {/* Visibility Toggles */}
            <div className="flex flex-col gap-4 pt-4 border-t border-apple-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-system-label">Hide Artwork Default</p>
                </div>
                <button 
                  onClick={() => updateSettings({ showArtwork: !settings.showArtwork })}
                  className={`w-8 h-5 rounded-full relative transition-colors ${!settings.showArtwork ? 'bg-system-orange' : 'bg-system-tertiary-label'}`}
                >
                  <motion.div className="absolute top-1 left-1 bg-tertiary-system-background w-3 h-3 rounded-full" animate={{ x: !settings.showArtwork ? 12 : 0 }} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-system-label">Big Touch Buttons</p>
                </div>
                <button 
                  onClick={() => updateSettings({ bigTouchMode: !settings.bigTouchMode })}
                  className={`w-8 h-5 rounded-full relative transition-colors ${settings.bigTouchMode ? 'bg-system-orange' : 'bg-system-tertiary-label'}`}
                >
                  <motion.div className="absolute top-1 left-1 bg-tertiary-system-background w-3 h-3 rounded-full" animate={{ x: settings.bigTouchMode ? 12 : 0 }} />
                </button>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="uivisibility"
          title="UI Controls & Visibility"
          subtitle="Navigation & Layout"
          icon={Monitor}
          color="bg-system-blue/10 text-system-blue"
        >
          <div className="flex flex-col gap-6">
             <div className="flex flex-col gap-3">
               <label className="text-[10px] font-bold uppercase tracking-wider text-system-secondary-label">Bottom Menu Toggles</label>
               <div className="space-y-4 pt-2">
                 {[
                   { id: 'library', label: 'Library' },
                   { id: 'search', label: 'Search' },
                   { id: 'player', label: 'Now Playing' },
                   { id: 'mode', label: 'Mode' },
                 ].map(item => (
                   <div key={item.id} className="flex items-center justify-between">
                     <p className="text-xs font-semibold text-system-label">{item.label}</p>
                     <button 
                       onClick={() => {
                         const current = settings.visibility.navigation[item.id as keyof typeof settings.visibility.navigation] !== false;
                         updateVisibilitySettings({ 
                           navigation: { 
                             ...settings.visibility.navigation, 
                             [item.id]: !current 
                           } 
                         });
                       }}
                       className={`w-8 h-5 rounded-full relative transition-colors ${settings.visibility.navigation[item.id as keyof typeof settings.visibility.navigation] !== false ? 'bg-system-blue' : 'bg-system-tertiary-label/30'}`}
                     >
                       <motion.div className="absolute top-1 left-1 bg-tertiary-system-background w-3 h-3 rounded-full shadow-sm" animate={{ x: settings.visibility.navigation[item.id as keyof typeof settings.visibility.navigation] !== false ? 12 : 0 }} />
                     </button>
                   </div>
                 ))}
                 <div className="flex items-center justify-between opacity-50">
                   <p className="text-xs font-semibold text-system-label">Settings (Required)</p>
                   <div className="w-8 h-5 rounded-full bg-system-blue relative">
                     <div className="absolute top-1 left-[13px] bg-tertiary-system-background w-3 h-3 rounded-full" />
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </Section>
      </div>
    </Group>
  );
};
