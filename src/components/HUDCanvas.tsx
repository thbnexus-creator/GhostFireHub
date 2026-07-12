import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize2, 
  Trash2, 
  Save, 
  RotateCcw, 
  Monitor, 
  Smartphone, 
  ChevronRight, 
  PlusCircle, 
  Copy, 
  Share2, 
  Check, 
  Download,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Gamepad2,
  Wifi,
  Battery,
  Info,
  Upload,
  Sliders,
  Flame
} from 'lucide-react';
import { HUDLayout, HUDButton } from '../types';
import { trackMissionProgress } from '../utils';

interface HUDProps {
  userEmail?: string;
  onLayoutSaved?: () => void;
}

export default function HUDCanvas({ userEmail, onLayoutSaved }: HUDProps) {
  const [layouts, setLayouts] = useState<HUDLayout[]>([]);
  const [activeLayout, setActiveLayout] = useState<HUDLayout | null>(null);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  
  // Current active button being custom edited
  const [selectedButtonId, setSelectedButtonId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Live Preview Overlay toggles & styles
  const [hiddenButtonIds, setHiddenButtonIds] = useState<string[]>([]);
  const [backdropStyle, setBackdropStyle] = useState<'grid' | 'battleground' | 'cyberpunk'>('battleground');
  const [bezelStyle, setBezelStyle] = useState<'gaming' | 'thin' | 'off'>('gaming');
  const [gripOverlay, setGripOverlay] = useState<boolean>(false);

  // Local state container ref for touch dragging
  const canvasRef = useRef<HTMLDivElement>(null);

  // Tab controller for HUD workspace
  const [hudTab, setHudTab] = useState<'designer' | 'diagnostics'>('designer');

  // HUD Screenshot Diagnostics states
  const [hudImage, setHudImage] = useState<string>('');
  const [hudDevice, setHudDevice] = useState('iPhone 15 Pro');
  const [hudFinger, setHudFinger] = useState('3-Finger');
  const [analyzingHud, setAnalyzingHud] = useState(false);
  const [hudAnalysisResult, setHudAnalysisResult] = useState<string>('');
  const [shareToDatabase, setShareToDatabase] = useState(true);

  // Load Saved HUD layouts from backend
  const fetchLayouts = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`/api/hud/list/${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLayouts(data);
        setActiveLayout(data[0]);
        setOrientation(data[0].orientation);
      } else {
        // Fallback default esports layout
        loadDefaultLayout();
      }
    } catch (err) {
      loadDefaultLayout();
    }
  };

  const loadDefaultLayout = () => {
    const defaultHud: HUDLayout = {
      id: 'hud-default',
      name: 'Standard 3-Finger Claw',
      orientation: 'landscape',
      created_at: new Date().toISOString(),
      buttons: [
        { id: 'fire', label: '🔥 Fire', x: 82, y: 68, size: 75 },
        { id: 'aim', label: '👁️ Aim', x: 80, y: 30, size: 65 },
        { id: 'jump', label: '🦘 Jump', x: 92, y: 48, size: 55 },
        { id: 'crouch', label: '🧘 Crouch', x: 92, y: 74, size: 55 },
        { id: 'gloo', label: '🧱 Gloo Wall', x: 15, y: 40, size: 70 },
        { id: 'analog', label: '🕹️ Move', x: 20, y: 72, size: 80 }
      ]
    };
    setLayouts([defaultHud]);
    setActiveLayout(defaultHud);
    setOrientation('landscape');
  };

  useEffect(() => {
    if (userEmail) {
      fetchLayouts();
    } else {
      loadDefaultLayout();
    }
  }, [userEmail]);

  // Adjust button properties
  const updateButtonProperty = (id: string, prop: 'x' | 'y' | 'size', value: number) => {
    if (!activeLayout) return;
    const updatedButtons = activeLayout.buttons.map(btn => {
      if (btn.id === id) {
        // clamp values: x/y within bounds (0-100), size (30-150px)
        const clampMinMax = prop === 'size' ? Math.min(Math.max(value, 30), 150) : Math.min(Math.max(value, 2), 98);
        return { ...btn, [prop]: clampMinMax };
      }
      return btn;
    });

    setActiveLayout({
      ...activeLayout,
      buttons: updatedButtons
    });
  };

  // Drag button triggers
  const handleCanvasClickOrDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !selectedButtonId || !activeLayout) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    // Calculate percentages
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    updateButtonProperty(selectedButtonId, 'x', Math.round(rawX));
    updateButtonProperty(selectedButtonId, 'y', Math.round(rawY));
  };

  const handleAddNewButton = () => {
    if (!activeLayout) return;
    const newId = 'btn-' + Date.now();
    const newBtn: HUDButton = {
      id: newId,
      label: '⚡ Custom',
      x: 50,
      y: 50,
      size: 50
    };
    setActiveLayout({
      ...activeLayout,
      buttons: [...activeLayout.buttons, newBtn]
    });
    setSelectedButtonId(newId);
  };

  const handleDeleteButton = (id: string) => {
    if (!activeLayout) return;
    setActiveLayout({
      ...activeLayout,
      buttons: activeLayout.buttons.filter(b => b.id !== id)
    });
    if (selectedButtonId === id) {
      setSelectedButtonId(null);
    }
  };

  const handleSaveLayout = async () => {
    if (!activeLayout) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!userEmail) {
      // Save locally in layout state only
      setSuccessMsg('HUD layout modified in current sandbox. Sign up to save permanently!');
      return;
    }

    try {
      const res = await fetch('/api/hud/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          layout: {
            ...activeLayout,
            orientation,
            id: activeLayout.id === 'hud-default' ? 'hud-' + Date.now() : activeLayout.id
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Tactile HUD Layout successfully compiled & saved on server!');
        fetchLayouts();
        if (onLayoutSaved) onLayoutSaved();
        if (userEmail) {
          trackMissionProgress(userEmail, 'save_hud');
        }
      } else {
        setErrorMsg(data.error || 'Failed to save layout.');
      }
    } catch (err) {
      setErrorMsg('Network error saving layout.');
    }
  };

  const handleDuplicateLayout = () => {
    if (!activeLayout) return;
    const duplicated: HUDLayout = {
      ...activeLayout,
      id: 'hud-' + Date.now(),
      name: `${activeLayout.name} (Copy)`,
      created_at: new Date().toISOString()
    };
    setLayouts(prev => [...prev, duplicated]);
    setActiveLayout(duplicated);
    setSuccessMsg('Duplicated active workspace. Rename and save your new template.');
  };

  const handleDeleteLayout = async () => {
    if (!activeLayout) return;
    if (activeLayout.id === 'hud-default') {
      loadDefaultLayout();
      return;
    }

    if (!confirm('Are you sure you want to permanently delete this HUD layout?')) {
      return;
    }

    if (userEmail) {
      try {
        await fetch('/api/hud/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, id: activeLayout.id })
        });
      } catch (err) {}
    }

    setLayouts(prev => prev.filter(l => l.id !== activeLayout.id));
    loadDefaultLayout();
    setSuccessMsg('HUD template permanently removed.');
  };

  const handleExportLayout = () => {
    if (!activeLayout) return;
    const exportCode = JSON.stringify(activeLayout.buttons, null, 2);
    navigator.clipboard.writeText(exportCode);
    setCopiedText(true);
    setTimeout(() => setCopiedText(null as any), 2000);
  };

  const handleAnalyzeScreenshot = async () => {
    if (!hudImage) {
      setErrorMsg('Please upload a HUD screenshot or gameplay image first.');
      return;
    }
    setAnalyzingHud(true);
    setHudAnalysisResult('');
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const analyzeRes = await fetch('/api/issues/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenshot: hudImage,
          deviceModel: hudDevice,
          fingerSetup: hudFinger
        })
      });

      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json();
        throw new Error(errData.error || 'Gemini AI service unavailable. Please check your network connection.');
      }

      const analyzeData = await analyzeRes.json();
      setHudAnalysisResult(analyzeData.analysis);
      setSuccessMsg('Tactical AI calibration recommendations generated successfully!');

      if (shareToDatabase) {
        try {
          await fetch('/api/issues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `${hudDevice} Custom HUD AI Calibration Capture`,
              deviceModel: hudDevice,
              fingerSetup: hudFinger,
              category: 'Touch Response',
              description: `Automated AI Diagnostic evaluation for layout. Recommendations generated: "${analyzeData.analysis.substring(0, 150)}..."`,
              screenshot: hudImage,
              reportedBy: userEmail || 'guest@ghostfirehub.com'
            })
          });
        } catch (err) {}
      }

      if (userEmail) {
        trackMissionProgress(userEmail, 'save_hud');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Calibration request failed.');
    } finally {
      setAnalyzingHud(false);
    }
  };

  const selectedButton = activeLayout?.buttons.find(b => b.id === selectedButtonId) || null;

  return (
    <div className="space-y-6">
      
      {/* HUD Tabs switch */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHudTab('designer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${hudTab === 'designer' ? 'bg-orange-600 text-slate-950 font-black shadow-lg shadow-orange-600/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'}`}
          >
            <Sliders className="w-4 h-4" />
            Interactive HUD Designer
          </button>
          <button
            onClick={() => setHudTab('diagnostics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${hudTab === 'diagnostics' ? 'bg-orange-600 text-slate-950 font-black shadow-lg shadow-orange-600/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'}`}
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            AI HUD Screenshot Diagnostics
          </button>
        </div>
        <div className="text-[10px] text-slate-500 font-mono hidden md:block">
          GARENA CALIBRATION STATION • ACTIVE LATENCY: 24MS
        </div>
      </div>

      {hudTab === 'designer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      
      {/* Editor Controls & Settings - LEFT */}
      <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex flex-col gap-5 justify-between">
        
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-md font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Monitor className="w-5 h-5 text-orange-500" />
              HUD Workspace
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Configure custom controls layout</p>
          </div>

          {/* Messages */}
          {successMsg && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Active Layout list select */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Load HUD Preset</label>
            <select
              value={activeLayout?.id || ''}
              onChange={(e) => {
                const found = layouts.find(l => l.id === e.target.value);
                if (found) {
                  setActiveLayout(found);
                  setOrientation(found.orientation);
                }
              }}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors"
            >
              {layouts.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Rename Active Layout */}
          {activeLayout && (
            <div className="space-y-1">
              <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Layout Name</label>
              <input
                type="text"
                value={activeLayout.name}
                onChange={(e) => setActiveLayout({ ...activeLayout, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          )}

          {/* Choose Orientation Toggle */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Device orientation</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setOrientation('landscape');
                  if (activeLayout) setActiveLayout({ ...activeLayout, orientation: 'landscape' });
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${orientation === 'landscape' ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-slate-950 border-slate-850 text-slate-500'}`}
              >
                <Monitor className="w-4 h-4" />
                Landscape
              </button>
              <button
                onClick={() => {
                  setOrientation('portrait');
                  if (activeLayout) setActiveLayout({ ...activeLayout, orientation: 'portrait' });
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${orientation === 'portrait' ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-slate-950 border-slate-850 text-slate-500'}`}
              >
                <Smartphone className="w-4 h-4" />
                Portrait
              </button>
            </div>
          </div>

          {/* Dynamic Button properties manager */}
          <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Interactive Calibrator</span>
              {selectedButtonId && (
                <button
                  onClick={() => handleDeleteButton(selectedButtonId)}
                  className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-0.5"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              )}
            </h3>

            {selectedButton ? (
              <div className="space-y-3.5 text-xs animate-scaleIn">
                <div className="flex justify-between items-center bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-300 font-mono text-[11px]">Selected Button</span>
                  <input
                    type="text"
                    value={selectedButton.label}
                    onChange={(e) => {
                      const updated = activeLayout.buttons.map(b => b.id === selectedButtonId ? { ...b, label: e.target.value } : b);
                      setActiveLayout({ ...activeLayout, buttons: updated });
                    }}
                    className="bg-transparent text-right outline-none font-bold text-orange-400 w-24 border-b border-dashed border-slate-700 focus:border-orange-500"
                  />
                </div>

                {/* X Coordinate */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>X Position (Horizontal)</span>
                    <span className="font-bold text-slate-200">{selectedButton.x}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="98"
                    value={selectedButton.x}
                    onChange={(e) => updateButtonProperty(selectedButtonId!, 'x', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                {/* Y Coordinate */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Y Position (Vertical)</span>
                    <span className="font-bold text-slate-200">{selectedButton.y}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="98"
                    value={selectedButton.y}
                    onChange={(e) => updateButtonProperty(selectedButtonId!, 'y', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                {/* Diameter scale */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Button Diameter</span>
                    <span className="font-bold text-slate-200">{selectedButton.size}px</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="150"
                    value={selectedButton.size}
                    onChange={(e) => updateButtonProperty(selectedButtonId!, 'size', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <p className="text-[10px] text-slate-500 italic mt-1 bg-slate-900/40 p-2 rounded border border-slate-850/60 leading-normal">
                  💡 Tip: Click anywhere directly on the preview layout screen on the right to instantly relocate the selected button there!
                </p>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-600 text-[11px]">
                Click any layout trigger button on the preview grid screen to fine-tune its size, location coordinates and label.
              </div>
            )}
          </div>

          {/* HUD Elements Visibility & Overlays list */}
          <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col gap-3 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-orange-500" />
                HUD Element Overlays
              </span>
              <button
                type="button"
                onClick={() => {
                  if (hiddenButtonIds.length === activeLayout?.buttons.length) {
                    setHiddenButtonIds([]);
                  } else {
                    setHiddenButtonIds(activeLayout?.buttons.map(b => b.id) || []);
                  }
                }}
                className="text-[9px] text-orange-400 hover:text-orange-300 font-mono uppercase font-semibold"
              >
                {hiddenButtonIds.length === activeLayout?.buttons.length ? 'Show All' : 'Hide All'}
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {activeLayout?.buttons.map(btn => {
                const isHidden = hiddenButtonIds.includes(btn.id);
                const isSelected = selectedButtonId === btn.id;
                return (
                  <div 
                    key={btn.id} 
                    className={`flex items-center justify-between p-2 rounded-xl border text-[11px] transition-all ${
                      isSelected 
                        ? 'bg-slate-900/95 border-orange-500/45 text-orange-400' 
                        : 'bg-slate-950/40 border-slate-900 text-slate-400'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedButtonId(btn.id)}
                      className="flex-1 text-left font-bold truncate hover:text-white"
                    >
                      {btn.label}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isHidden) {
                          setHiddenButtonIds(hiddenButtonIds.filter(id => id !== btn.id));
                        } else {
                          setHiddenButtonIds([...hiddenButtonIds, btn.id]);
                        }
                      }}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        isHidden 
                          ? 'text-slate-600 hover:text-slate-400 bg-slate-900/50' 
                          : 'text-orange-400 hover:text-orange-300 bg-orange-500/10'
                      }`}
                      title={isHidden ? 'Show on screen' : 'Hide from screen'}
                    >
                      {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
              {(!activeLayout || activeLayout.buttons.length === 0) && (
                <p className="text-[10px] text-slate-600 italic text-center py-2">No buttons in active layout.</p>
              )}
            </div>
          </div>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-col gap-2 pt-4 border-t border-slate-800/80">
          <button
            onClick={handleAddNewButton}
            className="w-full py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-orange-500" />
            Add Custom Button
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDuplicateLayout}
              className="py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-semibold text-slate-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Clone Current Layout"
            >
              <Copy className="w-3.5 h-3.5" />
              Duplicate
            </button>
            <button
              onClick={handleDeleteLayout}
              className="py-2.5 bg-slate-950 border border-slate-850 hover:border-red-950/40 text-slate-500 hover:text-red-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Delete Current Layout"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>

          <button
            onClick={handleSaveLayout}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-slate-950 font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-orange-500/10 hover:brightness-115 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-1 cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-950" />
            Compile &amp; Save HUD Layout
          </button>

          <button
            onClick={handleExportLayout}
            className="w-full py-2 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-slate-900/40 rounded-xl font-mono flex items-center justify-center gap-1.5 transition-colors border border-transparent hover:border-slate-850"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
            {copiedText ? 'HUD Coordinates Copied!' : 'Export Layout Blueprint'}
          </button>
        </div>

      </div>

      {/* Interactive Drag Screen Area - RIGHT */}
      <div className="lg:col-span-8 flex flex-col bg-slate-950/80 border border-slate-800 rounded-3xl p-5 shadow-2xl overflow-hidden justify-start items-center relative min-h-[500px]">
        
        {/* Live Mockup Controls Toolbar */}
        <div className="w-full flex flex-wrap gap-2.5 items-center justify-between mb-5 bg-slate-900/60 p-3 rounded-2xl border border-slate-850/80 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Background:</span>
            {[
              { id: 'grid', label: 'Tactile Grid', icon: Monitor },
              { id: 'battleground', label: 'Canyon BR', icon: Gamepad2 },
              { id: 'cyberpunk', label: 'Neon Arena', icon: Sparkles },
            ].map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBackdropStyle(b.id as any)}
                className={`py-1.5 px-2.5 text-[10px] uppercase tracking-wider font-black rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                  backdropStyle === b.id 
                    ? 'bg-orange-500/10 border-orange-500 text-orange-400' 
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                }`}
              >
                <b.icon className="w-3.5 h-3.5" />
                {b.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Bezel Frame:</span>
            {[
              { id: 'gaming', label: 'Gamer Frame' },
              { id: 'thin', label: 'Slim Bezel' },
              { id: 'off', label: 'Raw Canvas' },
            ].map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBezelStyle(b.id as any)}
                className={`py-1.5 px-2.5 text-[10px] uppercase tracking-wider font-bold rounded-xl border transition-all cursor-pointer ${
                  bezelStyle === b.id 
                    ? 'bg-orange-500/10 border-orange-500 text-orange-400' 
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setGripOverlay(!gripOverlay)}
              className={`py-1.5 px-3 text-[10px] uppercase tracking-wider font-black rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                gripOverlay 
                  ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-400 shadow-md shadow-indigo-500/5' 
                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              {gripOverlay ? 'Grip Assist: ON' : 'Show Finger Zones'}
            </button>
          </div>
        </div>

        {/* Phone chassis mockup container */}
        <div className={`relative transition-all duration-300 max-w-full ${
          bezelStyle === 'gaming'
            ? 'p-4 bg-slate-900 rounded-[42px] border-4 border-slate-800 shadow-[0_0_50px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/20'
            : bezelStyle === 'thin'
              ? 'p-2 bg-slate-950 rounded-[32px] border-2 border-slate-800 shadow-xl'
              : ''
        }`}>
          {/* Bezel Status elements like speakers/notch/camera */}
          {bezelStyle !== 'off' && (
            <>
              {orientation === 'landscape' ? (
                <>
                  {/* Speaker on left bezel */}
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-slate-950 rounded-full opacity-60 pointer-events-none"></div>
                  {/* Camera on right bezel */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-950 rounded-full opacity-80 pointer-events-none"></div>
                </>
              ) : (
                <>
                  {/* Speaker on top bezel */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-slate-950 rounded-full opacity-60 pointer-events-none"></div>
                  {/* Camera on top bezel */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-950 rounded-full opacity-80 pointer-events-none"></div>
                </>
              )}
            </>
          )}

          {/* Dynamic canvas wrapper based on orientation */}
          <div 
            ref={canvasRef}
            onClick={handleCanvasClickOrDrag}
            className={`relative border border-slate-800/80 rounded-3xl overflow-hidden shadow-inner transition-all duration-300 cursor-crosshair select-none ${orientation === 'landscape' ? 'w-full max-w-2xl h-80' : 'w-64 h-[400px]'}`}
            style={{ 
              backgroundImage: backdropStyle === 'grid' ? 'radial-gradient(#334155 1.2px, transparent 1.2px)' : 'none', 
              backgroundSize: '18px 18px',
              backgroundColor: backdropStyle === 'grid' ? 'rgb(15 23 42 / 0.3)' : 'transparent'
            }}
          >
            {/* 1. Canyon Battleground Mockup Background */}
            {backdropStyle === 'battleground' && (
              <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-orange-950/10 to-amber-950/20 pointer-events-none overflow-hidden animate-fadeIn">
                {/* Visual mountain landscape lines with pure CSS gradients */}
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-transparent opacity-60"></div>
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-emerald-950/25 border-t border-emerald-900/10"></div>
                
                {/* HUD Simulated Status Elements */}
                <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-850 px-2.5 py-1 rounded-xl text-[9px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  <span>🗺️ Bermuda (Ranked Match)</span>
                </div>
                
                <div className="absolute top-3 right-3 bg-slate-950/80 border border-slate-850 px-2.5 py-1 rounded-xl text-[9px] font-mono text-slate-400 flex items-center gap-2">
                  <span className="text-slate-500">PING: 24ms</span>
                  <div className="flex items-center gap-0.5">
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-slate-850 px-4 py-1.5 rounded-full text-[9px] font-mono text-slate-200 flex items-center gap-2 shadow-lg">
                  <span className="font-bold text-orange-400">HP</span>
                  <div className="w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-gradient-to-r from-orange-500 to-amber-400"></div>
                  </div>
                  <span className="font-black text-[10px]">200 / 200</span>
                </div>

                {/* Central Target Reticle Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-60">
                  <div className="w-5 h-5 border-2 border-orange-500/80 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                  </div>
                  <div className="absolute w-0.5 h-3 bg-orange-400 -top-2"></div>
                  <div className="absolute w-0.5 h-3 bg-orange-400 -bottom-2"></div>
                  <div className="absolute h-0.5 w-3 bg-orange-400 -left-2"></div>
                  <div className="absolute h-0.5 w-3 bg-orange-400 -right-2"></div>
                </div>

                {/* Killfeed and Weapon Slot */}
                <div className="absolute top-12 left-3 bg-slate-950/70 border border-slate-900 px-2.5 py-1 rounded-lg text-[8.5px] font-mono text-red-400 flex items-center gap-1.5 shadow-md">
                  <span>☠️</span>
                  <span><strong>GHOSTCORE™</strong> headshotted <strong>Ruok_FF</strong></span>
                </div>

                <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-slate-800 rounded-2xl p-2 text-right shadow-lg">
                  <span className="text-[8px] font-mono text-slate-500 block leading-none mb-0.5">MP40 SPECIAL</span>
                  <span className="text-xs font-black text-orange-400 font-mono">40 <span className="text-[9px] text-slate-500">/ 180</span></span>
                </div>
              </div>
            )}

            {/* 2. Cyberpunk Tech Arena Mockup Background */}
            {backdropStyle === 'cyberpunk' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-purple-950/20 to-slate-950 pointer-events-none overflow-hidden animate-fadeIn">
                {/* High tech neon matrix grids */}
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#8a2be2_1px,transparent_1px),linear-gradient(to_bottom,#8a2be2_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                
                {/* Bouncing laser line scan overlay */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse shadow-[0_0_15px_#8a2be2]"></div>
                
                {/* HUD simulated telemetry indicators */}
                <div className="absolute top-3 left-3 font-mono text-[8.5px] text-purple-400 space-y-0.5 bg-slate-950/70 p-2 border border-purple-900/40 rounded-xl">
                  <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></span> HUD COMPILATION ACTIVE</p>
                  <p className="text-slate-500">ENGINE LATENCY: 8.4MS</p>
                </div>

                <div className="absolute top-3 right-3 font-mono text-[8.5px] text-pink-400 bg-slate-950/70 p-2 border border-pink-900/40 rounded-xl flex items-center gap-1.5">
                  <span className="font-bold">CYBER LINK:</span>
                  <span className="text-slate-200">100% SIGNAL</span>
                </div>

                {/* Fancy Holographic Crosshair reticle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-70">
                  <div className="w-10 h-10 border border-dashed border-purple-500 rounded-full animate-spin"></div>
                  <div className="w-6 h-6 border-2 border-pink-500/40 rounded-full absolute"></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full absolute"></div>
                  <div className="absolute w-5 h-0.5 bg-pink-400/80 -left-6"></div>
                  <div className="absolute w-5 h-0.5 bg-pink-400/80 -right-6"></div>
                </div>

                {/* Status shield readouts */}
                <div className="absolute bottom-3 left-3 bg-purple-950/40 border border-purple-500/30 rounded-xl p-2 text-left font-mono">
                  <span className="text-[7.5px] text-purple-300 block font-bold">TACTICAL HUD CALIBRATION</span>
                  <span className="text-[10px] font-black text-pink-400">99.8% RESPONSE INDEX</span>
                </div>

                <div className="absolute bottom-3 right-3 bg-purple-950/40 border border-purple-500/30 rounded-xl p-2 text-right font-mono">
                  <span className="text-[7.5px] text-purple-300 block font-bold">CROSSHAIR ACCURACY</span>
                  <span className="text-[10px] font-black text-purple-400">GHOSTCORE ENGAGED</span>
                </div>
              </div>
            )}

            {/* Simulated Hand placements Zones */}
            {gripOverlay && (
              <div className="absolute inset-0 pointer-events-none z-10 animate-fadeIn">
                {orientation === 'landscape' ? (
                  <>
                    {/* Left Thumb zone */}
                    <div className="absolute bottom-2 left-2 w-32 h-32 rounded-full border-2 border-dashed border-indigo-500/40 bg-indigo-500/5 flex items-center justify-center shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]">
                      <span className="text-[8px] text-indigo-400 font-mono uppercase font-black tracking-widest text-center leading-normal px-2 bg-slate-950/80 border border-indigo-500/20 rounded-lg">Left Thumb Grip</span>
                    </div>
                    {/* Right Thumb zone */}
                    <div className="absolute bottom-2 right-2 w-36 h-36 rounded-full border-2 border-dashed border-indigo-500/40 bg-indigo-500/5 flex items-center justify-center shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]">
                      <span className="text-[8px] text-indigo-400 font-mono uppercase font-black tracking-widest text-center leading-normal px-2 bg-slate-950/80 border border-indigo-500/20 rounded-lg">Right Thumb Grip</span>
                    </div>
                    {/* Left Index (Claw zone) */}
                    <div className="absolute top-2 left-2 w-28 h-20 rounded-b-3xl border-2 border-dashed border-pink-500/30 bg-pink-500/5 flex items-center justify-center shadow-[inset_0_0_15px_rgba(236,72,153,0.05)]">
                      <span className="text-[7.5px] text-pink-400 font-mono uppercase font-black tracking-widest px-2 bg-slate-950/80 border border-pink-500/20 rounded-lg">3/4 Claw index</span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Bottom Thumbs zone */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-24 rounded-t-full border-2 border-dashed border-indigo-500/40 bg-indigo-500/5 flex items-center justify-center shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]">
                      <span className="text-[8px] text-indigo-400 font-mono uppercase font-black tracking-widest px-2 bg-slate-950/80 border border-indigo-500/20 rounded-lg">Thumbs rest zone</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Interactive Button Items mapping (with hidden status visibility toggle filter) */}
            {activeLayout?.buttons.map((btn) => {
              const isHidden = hiddenButtonIds.includes(btn.id);
              if (isHidden) return null; // Immediately toggle out hidden custom HUD buttons
              const isSelected = selectedButtonId === btn.id;
              return (
                <div
                  key={btn.id}
                  onClick={(e) => {
                    e.stopPropagation(); // prevent resetting coordinate directly on canvas click
                    setSelectedButtonId(btn.id);
                  }}
                  style={{
                    left: `${btn.x}%`,
                    top: `${btn.y}%`,
                    width: `${btn.size}px`,
                    height: `${btn.size}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className={`absolute rounded-full flex items-center justify-center font-bold text-[10px] cursor-pointer shadow-lg transition-all select-none hover:scale-105 duration-150 z-20 ${
                    isSelected 
                      ? 'bg-orange-500 border-2 border-white text-slate-950 ring-4 ring-orange-600/35 font-black scale-105' 
                      : 'bg-slate-950/85 border border-slate-700/80 text-slate-200 hover:border-orange-500/70 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="text-center truncate px-1">
                    <div className="leading-tight truncate max-w-[90%] mx-auto">{btn.label}</div>
                    <div className={`text-[8px] font-mono mt-0.5 leading-none ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>{btn.size}px</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informative helper footer */}
        <div className="mt-4 text-center max-w-sm shrink-0">
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Click any button circle to highlight it, then drag or utilize the sliders on the left to move them into customized tactical positions.
          </p>
        </div>

      </div>

    </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-md">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500 animate-pulse" />
                Upload HUD Screenshot
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload a screen capture of your Garena Free Fire controls setting layout. Gemini will evaluate reach ergonomics, button clusters, and gesture overlap points.
              </p>
            </div>

            {/* Upload Area */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">HUD Layout Image</label>
              <div className="border border-dashed border-slate-800 hover:border-orange-500/50 bg-slate-950 p-6 rounded-2xl transition-all flex flex-col items-center justify-center text-center relative cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setHudImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {hudImage ? (
                  <div className="space-y-3">
                    <img src={hudImage} alt="HUD design preview" className="max-h-36 mx-auto rounded-xl border border-slate-850 animate-fadeIn" />
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block bg-emerald-500/10 border border-emerald-500/20 py-1 px-3 rounded-full max-w-xs mx-auto">
                      ✓ SCREENSHOT READY FOR CALIBRATION
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <Upload className="w-8 h-8 text-slate-600 group-hover:text-orange-500 mx-auto transition-colors" />
                    <span className="text-[11px] text-slate-400 block font-bold">DRAG &amp; DROP SCREENSHOT HERE</span>
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">PNG / JPG up to 5MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Device Model</label>
                <input
                  type="text"
                  value={hudDevice}
                  onChange={(e) => setHudDevice(e.target.value)}
                  placeholder="e.g., iPhone 15 Pro"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none focus:border-orange-500 placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Finger Layout</label>
                <select
                  value={hudFinger}
                  onChange={(e) => setHudFinger(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="2-Finger">2-Finger Claw</option>
                  <option value="3-Finger">3-Finger Claw</option>
                  <option value="4-Finger">4-Finger Claw</option>
                  <option value="5-Finger">5-Finger Claw</option>
                </select>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-2 py-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
              <input
                type="checkbox"
                id="share_to_db"
                checked={shareToDatabase}
                onChange={(e) => setShareToDatabase(e.target.checked)}
                className="w-3.5 h-3.5 accent-orange-500 cursor-pointer"
              />
              <label htmlFor="share_to_db" className="text-[10px] text-slate-400 font-sans cursor-pointer leading-tight">
                Log layout data in the Garena Touch Diagnostics registry to help train our esports models.
              </label>
            </div>

            {/* Trigger Button */}
            <button
              type="button"
              disabled={analyzingHud || !hudImage}
              onClick={handleAnalyzeScreenshot}
              className={`w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                analyzingHud || !hudImage
                  ? 'bg-slate-850 text-slate-500 border border-slate-800 cursor-not-allowed opacity-40'
                  : 'hover:from-orange-500 hover:to-amber-400 cursor-pointer shadow-lg shadow-orange-600/15 active:scale-[0.99]'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${analyzingHud ? 'animate-spin' : ''}`} />
              {analyzingHud ? 'COMPUTING CALIBRATION VULNERABILITIES...' : 'CALIBRATE HUD POSTURE & TWEAKS'}
            </button>
          </div>

          {/* Right Panel: AI Response Output */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-md min-h-[460px] flex flex-col justify-between animate-fadeIn">
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-orange-500" />
                    AI Diagnostics &amp; Calibration Suggested
                  </h3>
                  <p className="text-[11px] text-slate-500">Live esports tactile assessment reports</p>
                </div>
                <span className="px-2.5 py-1 bg-orange-600/10 border border-orange-500/20 text-orange-400 text-[9px] font-mono rounded-full font-black uppercase tracking-wider">
                  Gemini Active
                </span>
              </div>

              {hudAnalysisResult ? (
                <div className="space-y-4">
                  {/* Clean Diagnostic Result rendering */}
                  <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl text-xs text-slate-300 font-sans leading-relaxed space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
                    <div className="whitespace-pre-wrap text-[11.5px] leading-relaxed text-slate-300 font-sans">
                      {hudAnalysisResult}
                    </div>
                  </div>

                  <div className="bg-orange-600/5 border border-orange-500/10 p-3.5 rounded-xl text-[10.5px] text-orange-400 leading-normal flex items-start gap-2.5">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Pro Tip:</span> Based on these recommendations, you can adjust the physical positions of buttons in the <strong className="cursor-pointer underline" onClick={() => setHudTab('designer')}>Interactive Designer</strong> tab, or use the device calibrator on the home page to recompute dynamic sensitivity profiles.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-4">
                  <div className="w-14 h-14 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-center text-slate-600 shadow-inner">
                    <Upload className="w-6 h-6 text-slate-500" />
                  </div>
                  <div className="max-w-md space-y-1">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">NO SCREENSHOT UNDER ANALYSIS</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Select and upload your Free Fire custom HUD gameplay capture on the left. Gemini will scan touch zones, button dimensions, thumb grips, and claw posture to generate custom tactile blueprints.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 w-full max-w-sm pt-2">
                    <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
                      <span className="text-[8px] font-mono text-slate-600 block uppercase font-bold">Ergonomics</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">Claw Reach</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
                      <span className="text-[8px] font-mono text-slate-600 block uppercase font-bold">Ghosting</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">Touch Conflicts</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
                      <span className="text-[8px] font-mono text-slate-600 block uppercase font-bold">Latency</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">Drag Response</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-900 pt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>SYSTEM STATE: CALIBRATOR READY</span>
              <span>SECURE CLOUD SANDBOX</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
