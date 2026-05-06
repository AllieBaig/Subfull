import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  Trash2, 
  Play, 
  Star, 
  Search, 
  Plus, 
  History, 
  Copy, 
  ChevronRight,
  Filter,
  Check,
  AlertCircle,
  Zap,
  Clock,
  Download,
  Upload,
  FileJson
} from 'lucide-react';
import { useSettings } from '../SettingsContext';
import { AUDIO_LAYER_REGISTRY } from '../constants/layers';
import { Layers, Shield, Activity, Waves } from 'lucide-react';
import { HzProfile, HzProfileValues, AppSettings } from '../types';
import { format } from 'date-fns';
import { NumericKeypadInput } from './NumericKeypadInput';

const LayerInput = ({ label, value, onUpdate }: { label: string, value: number, onUpdate: (v: number) => void }) => (
  <div className="flex items-center justify-between py-2 group/row">
    <span className="text-[10px] font-bold text-system-secondary-label uppercase tracking-wider group-hover/row:text-system-purple transition-colors">{label}</span>
    <div className="flex items-center gap-2">
      <NumericKeypadInput 
        value={value} 
        onCommit={onUpdate}
        min={1}
        max={1900}
        className="w-16 h-8 bg-secondary-system-background border border-apple-border rounded-lg text-[11px] font-black text-center focus:ring-1 focus:ring-system-purple outline-none transition-all"
      />
      <span className="text-[8px] font-black text-system-tertiary-label uppercase">Hz</span>
    </div>
  </div>
);

export const HzProfiles: React.FC<{ nested?: boolean }> = ({ nested = false }) => {
  const { 
    hzProfiles, 
    saveHzProfile, 
    deleteHzProfile, 
    updateHzProfile, 
    applyHzProfile,
    refreshHzProfiles,
    settings 
  } = useSettings();

  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<HzProfileValues | null>(null);

  const filteredProfiles = useMemo(() => {
    return hzProfiles
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return b.updatedAt - a.updatedAt;
      });
  }, [hzProfiles, search, sortBy]);

  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('Applied Successfully');

  const handleApply = async (profile: HzProfile) => {
    setIsApplying(profile.id);
    applyHzProfile(profile);
    
    // Artificial delay for feedback
    setTimeout(() => {
      setIsApplying(null);
      setToastMsg('Applied Successfully');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }, 600);
  };

  const handleExport = () => {
    const data = {
      profiles: hzProfiles,
      version: '2.3.1',
      exportedAt: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hz-profiles-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.profiles || !Array.isArray(data.profiles)) {
        throw new Error('Invalid schema');
      }

      let importedCount = 0;
      for (const p of data.profiles) {
        if (p.name && p.values) {
          await saveHzProfile(p.name, p.values);
          importedCount++;
        }
      }

      setToastMsg(`Imported ${importedCount} profiles`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      await refreshHzProfiles();
    } catch (err) {
      console.error('Import failed', err);
      setToastMsg('Import Failed: Invalid JSON');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
    setIsImporting(false);
  };

  const handleToggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setEditingValues(null);
    } else {
      const profile = hzProfiles.find(p => p.id === id);
      if (profile) {
        setExpandedId(id);
        setEditingValues({ ...profile.values });
      }
    }
  };

  const handleUpdateValue = (key: keyof HzProfileValues, value: number) => {
    if (!editingValues) return;
    const clamped = Math.max(1, Math.min(1900, value));
    setEditingValues({ ...editingValues, [key]: clamped });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingValues) return;
    await updateHzProfile(id, { values: editingValues });
    setExpandedId(null);
    setEditingValues(null);
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setProfileName('');
    
    const layerFreqs: Record<string, number> = {};
    Object.keys(AUDIO_LAYER_REGISTRY).forEach(id => {
      const layerNode = settings.layers[id];
      const legacyNode = settings[id as keyof AppSettings] as any;
      layerFreqs[id] = layerNode?.frequency || legacyNode?.frequency || 110;
    });

    setEditingValues({
      binauralLeft: settings.layers.binaural?.leftFreq || settings.binaural.leftFreq,
      binauralRight: settings.layers.binaural?.rightFreq || settings.binaural.rightFreq,
      pureHz: settings.layers.pureHz?.frequency || settings.pureHz.frequency,
      isochronic: settings.layers.isochronic?.frequency || settings.isochronic.frequency,
      solfeggio: settings.layers.solfeggio?.frequency || settings.solfeggio.frequency,
      schumann: settings.layers.schumann?.frequency || settings.schumann.frequency,
      nature: settings.layers.nature?.frequency || settings.nature.frequency,
      noise: settings.layers.noise?.frequency || settings.noise.frequency,
      didgeridoo: settings.layers.didgeridoo?.frequency || settings.didgeridoo.frequency,
      shamanic: settings.layers.shamanic?.frequency || settings.shamanic.frequency,
      mentalToughness: settings.layers.mentalToughness?.frequency || settings.mentalToughness.frequency,
      dualMode: settings.layers.dualMode?.frequency || settings.dualMode.frequency,
      masterHz: settings.syncLab.masterHz,
      layers: layerFreqs
    });
  };

  const handleFinalCreate = async () => {
    if (!profileName.trim() || !editingValues) return;
    await saveHzProfile(profileName.trim(), editingValues);
    setIsCreating(false);
    setEditingValues(null);
  };

  return (
    <div className="space-y-4 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute -top-6 left-1/2 -translate-x-1/2 z-[110] px-4 py-1.5 ${toastMsg.includes('Failed') ? 'bg-system-red' : 'bg-system-green'} text-system-background text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2 paper-emboss whitespace-nowrap pointer-events-none`}
          >
            {toastMsg.includes('Failed') ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Search */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-system-label flex items-center gap-2">
              <History className="w-4 h-4 text-system-purple" />
              Hz Profiles
            </h3>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setIsExporting(!isExporting)}
                className="p-1.5 hover:bg-system-fill rounded-lg text-system-tertiary-label transition-colors"
                title="Export Profiles"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsImporting(!isImporting)}
                className="p-1.5 hover:bg-system-fill rounded-lg text-system-tertiary-label transition-colors"
                title="Import Profiles"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <button
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-system-purple to-system-blue hover:opacity-90 text-system-background rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 paper-emboss"
          >
            <Plus className="w-3.5 h-3.5" />
            Create
          </button>
        </div>

        {/* Import/Export Panel */}
        <AnimatePresence>
          {(isExporting || isImporting) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-secondary-system-background/50 border border-apple-border rounded-2xl p-4 overflow-hidden"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-system-purple/10 rounded-xl">
                    <FileJson className="w-4 h-4 text-system-purple" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-system-label">
                      {isExporting ? 'Export Data' : 'Import Data'}
                    </h4>
                    <p className="text-[9px] text-system-secondary-label font-bold">
                      {isExporting ? 'Download all your Hz profiles as a JSON file.' : 'Restore Hz profiles from a previous backup.'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isExporting ? (
                    <button
                      onClick={handleExport}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-system-label text-system-background rounded-xl text-[10px] font-black uppercase tracking-widest paper-emboss"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download JSON
                    </button>
                  ) : (
                    <div className="flex-1 relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <button className="w-full flex items-center justify-center gap-2 py-2 bg-system-purple text-system-background rounded-xl text-[10px] font-black uppercase tracking-widest paper-emboss">
                        <Upload className="w-3.5 h-3.5" />
                        Select JSON File
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => { setIsExporting(false); setIsImporting(false); }}
                    className="px-4 bg-tertiary-system-background border border-separator text-system-secondary-label rounded-xl text-[10px] font-black uppercase tracking-widest paper-emboss"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-system-tertiary-label" />
            <input
              type="text"
              placeholder="Search Hz setups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-9 pr-4 bg-secondary-system-background border border-apple-border rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-system-purple/20 focus:border-system-purple transition-all paper-emboss"
            />
          </div>
          <button
            onClick={() => setSortBy(sortBy === 'recent' ? 'name' : 'recent')}
            className="px-3 h-11 bg-secondary-system-background border border-apple-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-system-secondary-label flex items-center gap-2 hover:bg-system-fill transition-all paper-emboss"
          >
            <Filter className="w-3.5 h-3.5" />
            {sortBy === 'recent' ? 'Recent' : 'Name'}
          </button>
        </div>
      </div>

      {/* Create Mode Modal Overlay */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-tertiary-system-background rounded-[2.5rem] shadow-2xl overflow-hidden paper-emboss"
            >
              <div className="p-6 border-b border-separator flex items-center justify-between bg-secondary-system-background/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-system-purple/10 rounded-xl">
                    <Save className="w-4 h-4 text-system-purple" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-system-label">New Profile</span>
                </div>
                <button onClick={() => setIsCreating(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-system-fill text-system-tertiary-label transition-colors">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-system-tertiary-label">Profile Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. Deep Meditation"
                    className="w-full px-4 py-3 bg-secondary-system-background border border-apple-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-system-purple/20"
                  />
                </div>

                {/* Layer Groups - Dynamic Registry Integrated */}
                <div className="space-y-6">
                  {/* Global Control */}
                  <div>
                    <h5 className="text-[10px] font-black text-system-blue uppercase tracking-[0.2em] mb-3 pb-1 border-b border-system-blue/20">Global Synchronization</h5>
                    <div className="grid gap-1">
                      <LayerInput label="Master Sync Hz" value={editingValues?.masterHz || 110} onUpdate={(v) => handleUpdateValue('masterHz', v)} />
                      <LayerInput label="Main Audio Tune" value={editingValues?.mainAudio || 110} onUpdate={(v) => handleUpdateValue('mainAudio', v)} />
                    </div>
                  </div>

                  {/* Registry Derived Groups */}
                  {[
                    { id: 'hz', label: 'Frequency Controls', color: 'system-purple' },
                    { id: 'ambient', label: 'Atmospheric Layers', color: 'system-orange' },
                    { id: 'special', label: 'Precision Layers', color: 'system-red' }
                  ].map(grp => (
                    <div key={grp.id}>
                      <h5 className={`text-[10px] font-black text-${grp.color} uppercase tracking-[0.2em] mb-3 pb-1 border-b border-${grp.color}/20`}>
                        {grp.label}
                      </h5>
                      <div className="grid gap-1">
                        {Object.values(AUDIO_LAYER_REGISTRY)
                          .filter(l => l.group === grp.id)
                          .map(layer => {
                            if (layer.id === 'binaural') {
                              return (
                                <React.Fragment key={layer.id}>
                                  <LayerInput label="Binaural Left" value={editingValues?.binauralLeft || 110} onUpdate={(v) => handleUpdateValue('binauralLeft', v)} />
                                  <LayerInput label="Binaural Right" value={editingValues?.binauralRight || 110} onUpdate={(v) => handleUpdateValue('binauralRight', v)} />
                                </React.Fragment>
                              );
                            }
                            
                            const valKey = layer.id as keyof HzProfileValues;
                            return (
                              <LayerInput 
                                key={layer.id}
                                label={layer.name} 
                                value={(editingValues as any)?.[valKey] || (editingValues?.layers?.[layer.id]) || 110} 
                                onUpdate={(v) => {
                                  if (editingValues) {
                                    const nextLayers = { ...(editingValues.layers || {}), [layer.id]: v };
                                    setEditingValues({ ...editingValues, [valKey]: v, layers: nextLayers } as any);
                                  }
                                }} 
                              />
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-secondary-system-background border-t border-separator">
                <button
                  onClick={handleFinalCreate}
                  disabled={!profileName.trim()}
                  className="w-full py-4 bg-system-purple hover:opacity-90 disabled:opacity-50 text-system-background rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 paper-emboss"
                >
                  Save Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profiles List */}
      <div className="space-y-3">
        {filteredProfiles.length === 0 ? (
          <div className="py-12 text-center bg-secondary-system-background/50 border-2 border-dashed border-separator rounded-[2.5rem] paper-emboss">
            <div className="w-16 h-16 bg-tertiary-system-background rounded-full border border-separator flex items-center justify-center mx-auto mb-4 shadow-sm">
              <History className="w-8 h-8 text-system-tertiary-label" />
            </div>
            <p className="text-sm text-system-label font-bold">No Hz Profiles Yet</p>
            <p className="text-xs text-system-secondary-label px-8 mt-1">Create your first custom Hz preset by tapping "Create Profile" above.</p>
          </div>
        ) : (
          filteredProfiles.map((profile) => {
            const isExpanded = expandedId === profile.id;
            const isActive = settings.defaultHzProfileId === profile.id;

            return (
              <motion.div
                layout
                key={profile.id}
                className={`group relative bg-tertiary-system-background border rounded-[2rem] transition-all hover:bg-secondary-system-background overflow-hidden paper-emboss ${
                  isActive ? 'border-system-purple/30 ring-2 ring-system-purple/10' : 'border-apple-border'
                }`}
              >
                {/* Main Card View */}
                <div 
                  className="p-5 cursor-pointer flex items-center justify-between gap-4"
                  onClick={() => handleToggleExpand(profile.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-system-green animate-pulse' : 'bg-system-tertiary-label'}`} />
                      <h4 className={`text-[13px] font-black truncate transition-colors ${isActive ? 'text-system-purple' : 'text-system-label'}`}>
                        {profile.name}
                      </h4>
                      {profile.isDefault && (
                        <div className="px-1.5 py-0.5 bg-system-orange/10 text-system-orange border border-system-orange/20 rounded-md text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Star className="w-2.5 h-2.5 fill-system-orange" />
                          Default
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold text-system-tertiary-label flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(profile.updatedAt, 'MMM d')}
                      </span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-system-fill rounded-full">
                        <div className="w-1 h-1 rounded-full bg-system-purple/60" />
                        <span className="text-[9px] font-black text-system-secondary-label uppercase">
                          {profile.values.masterHz}Hz Master
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleApply(profile); }}
                      disabled={isApplying === profile.id}
                      className={`p-3 rounded-2xl transition-all shadow-md active:scale-95 paper-emboss flex items-center justify-center min-w-[40px] ${
                        isApplying === profile.id 
                          ? 'bg-system-green text-system-background' 
                          : 'bg-system-purple hover:opacity-90 text-system-background'
                      }`}
                      title="Apply Profile"
                    >
                      {isApplying === profile.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
                    <div className="p-2 text-system-tertiary-label">
                      <ChevronRight size={18} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90 text-system-purple' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded Editor View */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-separator bg-secondary-system-background/50"
                    >
                      <div className="p-6 space-y-8">
                        {/* Layer Groups */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-system-purple uppercase tracking-[0.2em] pb-2 border-b border-system-purple/20 flex items-center gap-2">
                              <Zap className="w-3.5 h-3.5" />
                              Frequency
                            </h5>
                            <div className="space-y-1 bg-tertiary-system-background p-4 rounded-3xl border border-separator shadow-sm">
                              <LayerInput label="Master Hz" value={editingValues?.masterHz || 1} onUpdate={(v) => handleUpdateValue('masterHz', v)} />
                              <LayerInput label="Binaural Left" value={editingValues?.binauralLeft || 1} onUpdate={(v) => handleUpdateValue('binauralLeft', v)} />
                              <LayerInput label="Binaural Right" value={editingValues?.binauralRight || 1} onUpdate={(v) => handleUpdateValue('binauralRight', v)} />
                              <LayerInput label="Pure Hz" value={editingValues?.pureHz || 1} onUpdate={(v) => handleUpdateValue('pureHz', v)} />
                              <LayerInput label="Isochronic" value={editingValues?.isochronic || 1} onUpdate={(v) => handleUpdateValue('isochronic', v)} />
                              <LayerInput label="Solfeggio" value={editingValues?.solfeggio || 1} onUpdate={(v) => handleUpdateValue('solfeggio', v)} />
                              <LayerInput label="Schumann" value={editingValues?.schumann || 1} onUpdate={(v) => handleUpdateValue('schumann', v)} />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-system-blue uppercase tracking-[0.2em] pb-2 border-b border-system-blue/20 flex items-center gap-2">
                              <Filter className="w-3.5 h-3.5" />
                              Soundscape
                            </h5>
                            <div className="space-y-1 bg-tertiary-system-background p-4 rounded-3xl border border-separator shadow-sm">
                              <LayerInput label="Nature" value={editingValues?.nature || 1} onUpdate={(v) => handleUpdateValue('nature', v)} />
                              <LayerInput label="Noise" value={editingValues?.noise || 1} onUpdate={(v) => handleUpdateValue('noise', v)} />
                              <LayerInput label="Didgeridoo" value={editingValues?.didgeridoo || 1} onUpdate={(v) => handleUpdateValue('didgeridoo', v)} />
                              <LayerInput label="Shamanic" value={editingValues?.shamanic || 1} onUpdate={(v) => handleUpdateValue('shamanic', v)} />
                              <LayerInput label="Mental Toughness" value={editingValues?.mentalToughness || 1} onUpdate={(v) => handleUpdateValue('mentalToughness', v)} />
                              <LayerInput label="Dual Mode" value={editingValues?.dualMode || 1} onUpdate={(v) => handleUpdateValue('dualMode', v)} />
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-separator">
                          <button
                            onClick={() => handleSaveEdit(profile.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-system-label text-system-background rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg paper-emboss"
                          >
                            <Check className="w-4 h-4" />
                            Update Changes
                          </button>
                          
                          <div className="grid grid-cols-4 gap-2 w-full md:w-auto">
                            <button
                              onClick={() => updateHzProfile(profile.id, { isDefault: !profile.isDefault })}
                              className={`p-3 rounded-2xl border transition-all paper-emboss ${profile.isDefault ? 'bg-system-orange/10 border-system-orange/30 text-system-orange' : 'bg-tertiary-system-background border-separator text-system-tertiary-label hover:bg-system-fill'}`}
                              title="Set Default"
                            >
                              <Star className={`w-4 h-4 ${profile.isDefault ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => saveHzProfile(`${profile.name} (Copy)`, profile.values)}
                              className="p-3 bg-tertiary-system-background border border-separator text-system-secondary-label hover:text-system-label hover:bg-system-fill rounded-2xl transition-all paper-emboss"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteHzProfile(profile.id)}
                              className="p-3 bg-system-red/10 border border-system-red/20 text-system-red hover:opacity-80 rounded-2xl transition-all paper-emboss"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setExpandedId(null)}
                              className="p-3 bg-tertiary-system-background border border-separator text-system-tertiary-label hover:bg-system-fill rounded-2xl transition-all paper-emboss"
                              title="Close"
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Info Card */}
      <div className="p-4 bg-system-purple/10 border border-system-purple/20 rounded-3xl flex items-start gap-4 shadow-sm paper-emboss">
        <div className="p-2 bg-tertiary-system-background rounded-xl shadow-xs">
          <AlertCircle className="w-4 h-4 text-system-purple" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-system-label uppercase tracking-widest">Hz Memory Sync</p>
          <p className="text-[10px] text-system-secondary-label font-bold leading-relaxed opacity-80">
            Profiles store a snapshot of ALL frequency values across the system. 
            Applying a profile instantly recalibrates all active audio layers without interruption.
          </p>
        </div>
      </div>
    </div>
  );
};
