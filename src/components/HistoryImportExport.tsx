import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Download, Upload, FileJson, FileText, CheckCircle2, AlertCircle, 
  RefreshCcw, ShieldCheck, Info, Database, Save, RotateCcw
} from 'lucide-react';
import { useSettings } from '../SettingsContext';
import { useUIState } from '../UIStateContext';
import { VersionEntry } from '../types';

export const HistoryImportExport = () => {
  const { settings, updateHistoryOperations, updateSettings } = useSettings();
  const { showToast } = useUIState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const snapshotInputRef = useRef<HTMLInputElement>(null);

  const exportHistory = (format: 'json' | 'txt') => {
    try {
      const history = settings.versionHistory;
      const now = new Date();
      const timestampISO = now.toISOString();
      const datePart = timestampISO.split('T')[0];
      const timePart = timestampISO.split('T')[1].slice(0, 5).replace(':', '-');
      const filenameBase = `version_history_${datePart}_${timePart}`;
      
      let content = '';
      let filename = filenameBase;

      if (format === 'json') {
        const exportPayload = {
          version: settings.version,
          timestamp: timestampISO,
          logs: history
        };
        content = JSON.stringify(exportPayload, null, 2);
        filename += '.json';
      } else {
        content = history.map(entry => {
          let text = `Version: ${entry.version}\nDate: ${entry.date}\n`;
          if (entry.changes.added) text += `Added: ${entry.changes.added.join(', ')}\n`;
          if (entry.changes.improved) text += `Improved: ${entry.changes.improved.join(', ')}\n`;
          if (entry.changes.fixed) text += `Fixed: ${entry.changes.fixed.join(', ')}\n`;
          return text;
        }).join('\n---\n\n');
        filename += '.txt';
      }

      const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      updateHistoryOperations({ lastExportAt: Date.now() });
      showToast(`${format.toUpperCase()} History Exported`);
    } catch (error) {
      showToast('Export Failed');
    }
  };

  const exportFullSnapshot = () => {
    try {
      const snapshot = {
        type: 'AUDIO_STATE_SNAPSHOT',
        version: '1.0',
        timestamp: Date.now(),
        data: settings
      };
      
      const content = JSON.stringify(snapshot, null, 2);
      const filename = `audio_snapshot_${new Date().toISOString().split('T')[0]}.json`;
      
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Full State Snapshot Saved');
    } catch (error) {
      showToast('Snapshot Failed');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let importedHistory: VersionEntry[] = [];

      if (file.name.endsWith('.json')) {
        importedHistory = JSON.parse(text);
      } else {
        // Simple text parser (naive)
        const sections = text.split('\n---\n\n');
        importedHistory = sections.map(s => {
          const lines = s.split('\n');
          const entry: any = { changes: {} };
          lines.forEach(line => {
            if (line.startsWith('Version: ')) entry.version = line.replace('Version: ', '').trim();
            if (line.startsWith('Date: ')) entry.date = line.replace('Date: ', '').trim();
            if (line.startsWith('Added: ')) entry.changes.added = line.replace('Added: ', '').split(',').map(x => x.trim());
            if (line.startsWith('Improved: ')) entry.changes.improved = line.replace('Improved: ', '').split(',').map(x => x.trim());
            if (line.startsWith('Fixed: ')) entry.changes.fixed = line.replace('Fixed: ', '').split(',').map(x => x.trim());
          });
          return entry;
        }).filter(e => e.version && e.date);
      }

      if (!Array.isArray(importedHistory) || importedHistory.length === 0) {
        throw new Error('Invalid structure');
      }

      // Merge logic: Append only, avoiding duplicates by version
      const existingVersions = new Set(settings.versionHistory.map(h => h.version));
      const newEntries = importedHistory.filter(h => !existingVersions.has(h.version));

      if (newEntries.length === 0) {
        showToast('No new entries to import');
        return;
      }

      // Keep chronological order (assuming version history is sorted newest first)
      const mergedHistory = [...newEntries, ...settings.versionHistory].sort((a, b) => {
        // Naive version sort or date sort
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      updateSettings({ versionHistory: mergedHistory });
      updateHistoryOperations({ lastImportAt: Date.now() });
      showToast(`Imported ${newEntries.length} new entries`);
    } catch (error) {
      showToast('Import Failed: Invalid File');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSnapshotImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const snapshot = JSON.parse(text);
      
      if (snapshot.type !== 'AUDIO_STATE_SNAPSHOT') {
        throw new Error('Not a valid audio state snapshot');
      }
      
      // Safety check: Preserve version history even on snapshot restore
      const restoredSettings = {
        ...snapshot.data,
        versionHistory: settings.versionHistory // Keep current history
      };
      
      updateSettings(restoredSettings);
      showToast('Full Audio State Restored');
    } catch (error) {
      showToast('Restore Failed: Invalid Snapshot');
    } finally {
      if (snapshotInputRef.current) snapshotInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-8 mt-4">
      {/* Full State Snapshot */}
      <div className="bg-secondary-system-background/50 border border-apple-border/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-system-purple/10 flex items-center justify-center text-system-purple shadow-inner">
            <Database size={20} />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-system-purple uppercase tracking-wider">Audio State Snapshot</h4>
            <p className="text-[9px] text-system-secondary-label font-bold uppercase tracking-tight">Full Backup: Vols, Hz, Layers, Mods</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={exportFullSnapshot}
            className="flex items-center justify-center gap-2 py-3 bg-system-background border border-apple-border rounded-xl hover:bg-system-purple/5 transition-all group"
          >
            <Download size={14} className="text-system-purple" />
            <span className="text-[10px] font-black uppercase text-system-label">Export Full</span>
          </button>
          
          <label className="flex items-center justify-center gap-2 py-3 bg-system-purple/5 border border-dashed border-system-purple/30 rounded-xl hover:bg-system-purple/10 transition-all cursor-pointer group">
            <Upload size={14} className="text-system-purple" />
            <span className="text-[10px] font-black uppercase text-system-purple">Restore State</span>
            <input 
              type="file" 
              ref={snapshotInputRef}
              accept=".json" 
              className="hidden" 
              onChange={handleSnapshotImport} 
            />
          </label>
        </div>
      </div>

      {/* Sync Operations (History) */}
      <div className="bg-secondary-system-background/50 border border-apple-border/30 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-system-blue/10 flex items-center justify-center text-system-blue shadow-inner">
            <RefreshCcw size={20} />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-system-blue uppercase tracking-wider">Version Operations</h4>
            <p className="text-[9px] text-system-secondary-label font-bold uppercase tracking-tight">History backup & metadata sync</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => exportHistory('json')}
                className="w-full flex items-center justify-between p-3 bg-system-background border border-apple-border rounded-xl hover:bg-system-blue/5 group transition-all"
              >
                <div className="flex items-center gap-2">
                  <FileJson size={14} className="text-system-blue" />
                  <span className="text-[10px] font-bold text-system-label">JSON</span>
                </div>
                <Download size={12} className="text-system-tertiary-label group-hover:text-system-blue" />
              </button>
              <button 
                onClick={() => exportHistory('txt')}
                className="w-full flex items-center justify-between p-3 bg-system-background border border-apple-border rounded-xl hover:bg-system-blue/5 group transition-all"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-system-secondary-label" />
                  <span className="text-[10px] font-bold text-system-label">TXT</span>
                </div>
                <Download size={12} className="text-system-tertiary-label group-hover:text-system-blue" />
              </button>
              <span className="text-[8px] font-black uppercase text-center text-system-tertiary-label px-1">Export History</span>
            </div>

           <div className="flex flex-col gap-2">
             <label className="w-full h-full flex flex-col items-center justify-center gap-2 bg-system-blue/5 border border-dashed border-system-blue/30 rounded-xl hover:bg-system-blue/10 transition-colors cursor-pointer p-4 group">
                <Upload size={18} className="text-system-blue group-hover:scale-110 transition-transform" />
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-black text-system-blue uppercase">Import Hist</span>
                   <span className="text-[7px] font-bold text-system-blue/60 uppercase">Append-Only Matrix</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".json,.txt" 
                  className="hidden" 
                  onChange={handleImport} 
                />
             </label>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-secondary-system-background/30 rounded-xl p-3 border border-apple-border/20">
         <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-system-tertiary-label">
            <div className="flex items-center gap-1">
              <CheckCircle2 size={10} className="text-system-green" />
              <span>Status Ledger</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck size={10} className="text-system-blue" />
              <span>Secure Merge</span>
            </div>
         </div>
         <div className="h-px bg-apple-border/10 my-1" />
         <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-system-tertiary-label uppercase">Last Export</span>
              <span className="text-[9px] font-black text-system-label">
                {settings.historyOperations.lastExportAt ? new Date(settings.historyOperations.lastExportAt).toLocaleDateString() : 'Never'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-system-tertiary-label uppercase">Last Import</span>
              <span className="text-[9px] font-black text-system-label">
                {settings.historyOperations.lastImportAt ? new Date(settings.historyOperations.lastImportAt).toLocaleDateString() : 'Never'}
              </span>
            </div>
         </div>
      </div>

      <div className="flex items-start gap-2 px-1">
        <Info size={12} className="text-system-blue mt-0.5" />
        <p className="text-[9px] font-medium text-system-secondary-label italic leading-relaxed">
          Snapshots restore all volumes, Hz values, and layer states. Version History import matches versions to prevent duplicates.
        </p>
      </div>
    </div>
  );
};
