import React, { useState } from 'react';
import { 
  User, 
  Check, 
  Copy, 
  Download, 
  Layout, 
  Smartphone, 
  History, 
  Sparkles, 
  Gamepad2, 
  Award, 
  Activity, 
  ArrowLeft, 
  AlertCircle,
  Share2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { UserProfile, SensitivityProfile, HUDLayout } from '../types';

interface SharedProfileProps {
  data: {
    username: string;
    experience: string;
    favoriteWeapons: string[];
    favoriteDevices: string[];
    history: SensitivityProfile[];
    layouts: HUDLayout[];
  };
  onClose: () => void;
  currentUser: UserProfile | null;
  onCloneSuccess: (updatedUser: UserProfile) => void;
  onNavigateToAuth: () => void;
}

export default function SharedProfileView({ 
  data, 
  onClose, 
  currentUser, 
  onCloneSuccess, 
  onNavigateToAuth 
}: SharedProfileProps) {
  const [activeSubTab, setActiveSubTab] = useState<'Sens' | 'HUDs'>('Sens');
  const [selectedHud, setSelectedHud] = useState<HUDLayout | null>(data.layouts[0] || null);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [cloneStatus, setCloneStatus] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null);

  const handleClone = async (type: 'sensitivity' | 'hud', item: any) => {
    if (!currentUser) {
      onNavigateToAuth();
      return;
    }

    setCloningId(item.id);
    setCloneStatus(null);

    try {
      const res = await fetch('/api/public-profile/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          type,
          data: {
            ...item,
            ownerName: data.username
          }
        })
      });

      const responseData = await res.json();
      if (res.ok) {
        setCloneStatus({ id: item.id, msg: `Successfully cloned ${type === 'sensitivity' ? 'sensitivity config' : 'HUD blueprint'}!`, type: 'success' });
        if (responseData.user) {
          onCloneSuccess(responseData.user);
        }
      } else {
        setCloneStatus({ id: item.id, msg: responseData.error || 'Cloning failed.', type: 'error' });
      }
    } catch (err) {
      setCloneStatus({ id: item.id, msg: 'Network error occurred.', type: 'error' });
    } finally {
      setCloningId(null);
    }
  };

  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-5 sm:p-6 lg:p-8 relative overflow-hidden backdrop-blur-md animate-fadeIn">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header back button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Shared Workspace</span>
        </button>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-950/40 border border-slate-850 px-3 py-1.5 rounded-xl">
          <Share2 className="w-3.5 h-3.5 text-orange-500" />
          <span>Tactical Community Showcase</span>
        </div>
      </div>

      {/* Profile summary card */}
      <div className="p-5 sm:p-6 bg-slate-950/80 border border-slate-850 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center font-black text-slate-950 text-xl shadow-lg">
            {data.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                @{data.username}
              </h2>
              <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>Verified Tactician</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Combat Experience: <span className="text-orange-400 font-bold">{data.experience}</span>
            </p>
          </div>
        </div>

        {/* Favorite stats column */}
        <div className="flex flex-wrap gap-4 text-xs font-mono">
          <div className="px-3 py-2 bg-slate-900/60 border border-slate-850 rounded-xl">
            <span className="text-slate-500 block text-[9px] uppercase">Favorite Devices</span>
            <span className="text-white font-bold block mt-0.5">
              {data.favoriteDevices.length > 0 ? data.favoriteDevices.join(', ') : 'Samsung, Apple'}
            </span>
          </div>

          <div className="px-3 py-2 bg-slate-900/60 border border-slate-850 rounded-xl">
            <span className="text-slate-500 block text-[9px] uppercase">Main Weapons</span>
            <span className="text-white font-bold block mt-0.5">
              {data.favoriteWeapons.length > 0 ? data.favoriteWeapons.slice(0, 2).join(', ') : 'M1887, Desert Eagle'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab select buttons */}
      <div className="flex gap-2.5 border-b border-slate-850 pb-3 mb-6">
        <button
          onClick={() => setActiveSubTab('Sens')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubTab === 'Sens' 
              ? 'bg-orange-500 text-slate-950 shadow-md font-black' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Sensitivities ({data.history.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('HUDs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubTab === 'HUDs' 
              ? 'bg-orange-500 text-slate-950 shadow-md font-black' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>HUD Blueprints ({data.layouts.length})</span>
        </button>
      </div>

      {/* Sub tabs view blocks */}
      {activeSubTab === 'Sens' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-850/60">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Shared Sensitivity Calibration Logs</h3>
            <span className="text-[10px] text-slate-500 font-mono">Expert calibration profiles</span>
          </div>

          {data.history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs italic">
              No sensitivity configurations published yet by this user.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.history.map((hist, i) => (
                <div 
                  key={hist.id || i} 
                  className="p-5 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-slate-800 transition-all"
                >
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] bg-slate-900 border border-slate-800 text-orange-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                          {hist.deviceBrand} {hist.deviceModel}
                        </span>
                        <h4 className="text-xs font-bold text-white uppercase mt-1.5 tracking-wide">
                          Tactical Calibration Blueprint
                        </h4>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {new Date(hist.created_at || '').toLocaleDateString()}
                      </span>
                    </div>

                    {/* Sens values row */}
                    <div className="grid grid-cols-6 gap-1 bg-slate-900/60 p-2.5 rounded-xl text-center font-mono font-bold text-xs">
                      <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850">
                        <div className="text-slate-500 text-[8px] uppercase">GEN</div>
                        <div className="text-white mt-0.5">{hist.general}</div>
                      </div>
                      <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850">
                        <div className="text-slate-500 text-[8px] uppercase">RED</div>
                        <div className="text-white mt-0.5">{hist.redDot}</div>
                      </div>
                      <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850">
                        <div className="text-slate-500 text-[8px] uppercase">2X</div>
                        <div className="text-white mt-0.5">{hist.scope2x}</div>
                      </div>
                      <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850">
                        <div className="text-slate-500 text-[8px] uppercase">4X</div>
                        <div className="text-white mt-0.5">{hist.scope4x}</div>
                      </div>
                      <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850">
                        <div className="text-slate-500 text-[8px] uppercase">SNIP</div>
                        <div className="text-white mt-0.5">{hist.sniper}</div>
                      </div>
                      <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850">
                        <div className="text-slate-500 text-[8px] uppercase">FREE</div>
                        <div className="text-white mt-0.5">{hist.freeLook}</div>
                      </div>
                    </div>

                    {hist.explanation && (
                      <p className="text-[10px] text-slate-400 leading-relaxed italic bg-slate-900/20 p-2.5 rounded-lg border border-slate-850/40">
                        {hist.explanation}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex flex-col gap-2">
                    {/* Status feedback block */}
                    {cloneStatus && cloneStatus.id === hist.id && (
                      <div className={`p-2 rounded-xl text-[10px] flex items-center gap-1.5 font-bold ${
                        cloneStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                      }`}>
                        {cloneStatus.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span>{cloneStatus.msg}</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleClone('sensitivity', hist)}
                      disabled={cloningId !== null}
                      className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-850 disabled:text-slate-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {currentUser ? (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>{cloningId === hist.id ? 'Importing...' : 'Clone to My Profile'}</span>
                        </>
                      ) : (
                        <>
                          <Gamepad2 className="w-3.5 h-3.5" />
                          <span>Join Hub to Clone Preset</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'HUDs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Layout List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-850">
              HUD Blueprints
            </h3>

            {data.layouts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs italic">
                No HUD blueprints saved yet.
              </div>
            ) : (
              <div className="space-y-2">
                {data.layouts.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => setSelectedHud(layout)}
                    className={`w-full p-3.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                      selectedHud?.id === layout.id 
                        ? 'bg-orange-500/10 border-orange-500/40 text-orange-400' 
                        : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold uppercase">{layout.name}</h4>
                      <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                        {layout.buttons.length} Custom controls • {layout.orientation}
                      </span>
                    </div>
                    <Smartphone className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Canvas Live Layout Mockup Preview */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-slate-950/80 border border-slate-850 rounded-2xl p-4 sm:p-5">
            {selectedHud ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                      Interactive Layout Mockup ({selectedHud.name})
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Precision positioning scaled for mobile device dimensions
                    </p>
                  </div>
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono uppercase font-bold">
                    {selectedHud.orientation} View
                  </span>
                </div>

                {/* Simulated landscape phone display overlay */}
                <div className="relative w-full aspect-[16/9] max-w-xl mx-auto bg-slate-950 border-4 border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl flex items-center justify-center p-2">
                  {/* Speaker bezel notch */}
                  <div className="absolute left-1/2 top-1.5 -translate-x-1/2 w-20 h-2 bg-slate-800 rounded-full z-20"></div>
                  
                  {/* Cyber grid backdrop simulation */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:16px_16px] opacity-40"></div>

                  {/* Absolute rendered control nodes */}
                  <div className="relative w-full h-full">
                    {selectedHud.buttons.map((btn) => (
                      <div
                        key={btn.id}
                        style={{
                          left: `${btn.x}%`,
                          top: `${btn.y}%`,
                          width: `${Math.max(26, btn.size * 0.45)}px`,
                          height: `${Math.max(26, btn.size * 0.45)}px`,
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-500/50 bg-orange-500/20 text-orange-400 flex items-center justify-center font-mono text-[7px] font-black shadow-lg shadow-orange-500/10 pointer-events-none"
                      >
                        <span className="truncate max-w-[24px] px-0.5">{btn.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controls and clone button */}
                <div className="pt-2 border-t border-slate-900 flex flex-col gap-3">
                  {cloneStatus && cloneStatus.id === selectedHud.id && (
                    <div className={`p-2 rounded-xl text-[10px] flex items-center gap-1.5 font-bold ${
                      cloneStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                      {cloneStatus.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{cloneStatus.msg}</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleClone('hud', selectedHud)}
                    disabled={cloningId !== null}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-850 disabled:text-slate-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {currentUser ? (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>{cloningId === selectedHud.id ? 'Cloning Blueprint...' : 'Clone HUD Blueprint to My Account'}</span>
                      </>
                    ) : (
                      <>
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span>Join Hub to Clone Blueprint</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 text-xs italic">
                Select a HUD Blueprint to preview.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
