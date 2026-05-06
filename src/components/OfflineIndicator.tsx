import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="fixed top-6 right-6 z-[2000] flex flex-col items-end gap-2 pointer-events-none">
      <div 
        className="pointer-events-auto cursor-help p-2 -m-2"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <div 
          className={`w-[7px] h-[7px] rounded-full transition-colors duration-500 shadow-sm ${
            isOnline ? 'bg-[#34C759]' : 'bg-[#FF3B30]'
          }`}
          style={{
            boxShadow: isOnline 
              ? '0 0 8px rgba(52, 199, 89, 0.4)' 
              : '0 0 8px rgba(255, 59, 48, 0.4)'
          }}
        />
      </div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            className="bg-system-gray-6/90 backdrop-blur-xl border border-white/10 px-2 py-1 rounded-lg shadow-xl"
          >
            <span className="text-[8px] font-black uppercase tracking-widest text-system-label whitespace-nowrap">
              {isOnline ? 'Network Online' : 'Offline Mode'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
