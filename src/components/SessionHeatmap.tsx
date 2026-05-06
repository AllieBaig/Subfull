import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useSettings } from '../SettingsContext';

export const SessionHeatmap = () => {
  const { settings } = useSettings();
  const history = settings.advancedAudio.stabilityEngine.heatmapInsights.history;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Generate some mock data if empty for visual demo, but normally would use real stats
  const hasData = Object.keys(history).length > 0;
  
  const heatmapData = useMemo(() => {
    const data: Record<string, number> = {};
    if (!hasData) {
      // Mock for display if no history
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 24; j++) {
           if (Math.random() > 0.7) data[`${i}-${j}`] = Math.random();
        }
      }
    } else {
      // Scale real data (simplified for this view)
      Object.entries(history).forEach(([date, stats]) => {
        const d = new Date(date);
        const day = d.getDay();
        const hour = d.getHours();
        data[`${day}-${hour}`] = (data[`${day}-${hour}`] || 0) + (stats.duration / 3600);
      });
    }
    return data;
  }, [history, hasData]);

  const maxVal = Math.max(...Object.values(heatmapData), 1);

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-system-secondary-label">Listening Intensity</span>
        <div className="flex gap-1.5 items-center">
          <div className="w-2 h-2 rounded-sm bg-system-purple/10" />
          <div className="w-2 h-2 rounded-sm bg-system-purple/40" />
          <div className="w-2 h-2 rounded-sm bg-system-purple/70" />
          <div className="w-2 h-2 rounded-sm bg-system-purple" />
        </div>
      </div>

      <div className="bg-system-background border border-apple-border/30 rounded-xl p-3 overflow-x-auto no-scrollbar shadow-inner shadow-black/5">
        <div className="min-w-[400px]">
          <div className="flex mb-2">
            <div className="w-8" />
            {hours.filter(h => h % 3 === 0).map(h => (
              <div key={h} className="flex-1 text-[8px] font-bold text-center text-system-tertiary-label uppercase">
                {h === 0 ? '12am' : h < 12 ? h + 'am' : h === 12 ? '12pm' : (h - 12) + 'pm'}
              </div>
            ))}
          </div>

          {days.map((day, dIdx) => (
            <div key={day} className="flex gap-1 mb-1 items-center">
              <div className="w-8 text-[9px] font-black text-system-secondary-label uppercase tracking-tighter">{day}</div>
              {hours.map(h => {
                const val = heatmapData[`${dIdx}-${h}`] || 0;
                const opacity = val === 0 ? 0.05 : 0.1 + (val / maxVal) * 0.9;
                return (
                  <motion.div
                    key={h}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex-1 aspect-square rounded-[2px] bg-system-purple"
                    style={{ 
                      opacity,
                      boxShadow: val > 0 ? '0 0 4px var(--system-purple)' : 'none'
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {!hasData && (
        <div className="flex items-center gap-2 bg-secondary-system-background/50 rounded-lg p-2 border border-apple-border/30">
          <div className="w-1.5 h-1.5 rounded-full bg-system-blue animate-pulse" />
          <p className="text-[9px] font-medium text-system-tertiary-label italic">Visualization mode active. Tracking started today.</p>
        </div>
      )}
    </div>
  );
};
