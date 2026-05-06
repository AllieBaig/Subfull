import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Clock, TrendingUp, Filter, SortAsc, 
  ChevronDown, Brain, Shield, Info
} from 'lucide-react';
import { useSettings } from '../SettingsContext';

type TimeFilter = 'day' | 'week' | 'month' | 'total';
type SortBy = 'usage' | 'lastUsed' | 'alphabetical';

export const UsageIntelligenceDashboard = () => {
  const { settings } = useSettings();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('day');
  const [sortBy, setSortBy] = useState<SortBy>('usage');
  const [expandedGroups, setExpandedGroups] = useState<number[]>([1, 2]);

  const stats = settings.intelligenceStats.features;
  const featuresList = useMemo(() => Object.values(stats), [stats]);

  const sortedFeatures = useMemo(() => {
    return [...featuresList].sort((a, b) => {
      if (sortBy === 'usage') {
        return b.usageCount[timeFilter] - a.usageCount[timeFilter];
      }
      if (sortBy === 'lastUsed') {
        return (b.lastUsedAt || 0) - (a.lastUsedAt || 0);
      }
      return a.name.localeCompare(b.name);
    });
  }, [featuresList, sortBy, timeFilter]);

  const group1 = sortedFeatures.filter(f => f.group === 1);
  const group2 = sortedFeatures.filter(f => f.group === 2);

  const toggleGroup = (group: number) => {
    setExpandedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const formatLastUsed = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const maxUsage = useMemo(() => {
    const values = featuresList.map(f => f.usageCount[timeFilter]);
    return Math.max(...values, 1);
  }, [featuresList, timeFilter]);

  const FeatureCard = ({ feature }: { feature: typeof featuresList[0] }) => (
    <motion.div 
      layout
      className="bg-system-background border border-apple-border/50 rounded-xl p-3 shadow-sm flex flex-col gap-2"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-system-label">{feature.name}</span>
          <span className="text-[9px] font-medium text-system-tertiary-label uppercase tracking-tighter">
            Last: {formatLastUsed(feature.lastUsedAt)}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-system-blue">{feature.usageCount[timeFilter]}</span>
          <span className="text-[8px] font-bold text-system-tertiary-label uppercase tracking-tighter">Uses</span>
        </div>
      </div>
      
      <div className="h-1 w-full bg-secondary-system-background rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(feature.usageCount[timeFilter] / maxUsage) * 100}%` }}
          className="h-full bg-system-blue/60"
        />
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col gap-6 mt-4 pb-4">
      {/* Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <BarChart3 size={14} className="text-system-secondary-label" />
             <span className="text-xs font-black uppercase tracking-widest text-system-secondary-label">Usage Filters</span>
           </div>
        </div>
        
        <div className="grid grid-cols-4 gap-1 p-1 bg-secondary-system-background rounded-xl border border-apple-border/30">
          {(['day', 'week', 'month', 'total'] as TimeFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${timeFilter === f ? 'bg-system-background text-system-blue shadow-sm' : 'text-system-secondary-label hover:text-system-label'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(['usage', 'lastUsed', 'alphabetical'] as SortBy[]).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase transition-all ${sortBy === s ? 'bg-system-blue border-system-blue text-system-background' : 'bg-system-background border-apple-border/50 text-system-secondary-label'}`}
            >
              Sort: {s === 'lastUsed' ? 'Recently' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Group 1 */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => toggleGroup(1)}
          className="flex items-center justify-between px-1"
        >
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-system-blue" />
            <span className="text-[11px] font-black uppercase tracking-wider text-system-label">Calm Control Core</span>
          </div>
          <ChevronDown size={14} className={`text-system-tertiary-label transition-transform ${expandedGroups.includes(1) ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {expandedGroups.includes(1) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 gap-2 overflow-hidden"
            >
              {group1.map(f => <FeatureCard key={f.id} feature={f} />)}
              {group1.length === 0 && (
                <div className="py-4 text-center text-[10px] text-system-tertiary-label font-bold uppercase italic">No activity recorded</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Group 2 */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => toggleGroup(2)}
          className="flex items-center justify-between px-1"
        >
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-system-purple" />
            <span className="text-[11px] font-black uppercase tracking-wider text-system-label">Adaptive Stability Engine</span>
          </div>
          <ChevronDown size={14} className={`text-system-tertiary-label transition-transform ${expandedGroups.includes(2) ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {expandedGroups.includes(2) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 gap-2 overflow-hidden"
            >
              {group2.map(f => <FeatureCard key={f.id} feature={f} />)}
              {group2.length === 0 && (
                <div className="py-4 text-center text-[10px] text-system-tertiary-label font-bold uppercase italic">No activity recorded</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend / Info */}
      <div className="bg-system-blue/5 border border-system-blue/10 rounded-xl p-3 flex gap-3">
        <Info size={14} className="text-system-blue flex-shrink-0 mt-0.5" />
        <p className="text-[10px] font-medium text-system-secondary-label leading-relaxed">
          Intelligence Stats track feature activations and real-time adjustments. Data is stored locally and used to optimize your listening experience.
        </p>
      </div>
    </div>
  );
};
