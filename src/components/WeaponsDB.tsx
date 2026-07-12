import React, { useState } from 'react';
import { 
  Flame, 
  Search, 
  Crosshair, 
  Settings, 
  Trash2, 
  Edit, 
  Plus, 
  Zap, 
  Check, 
  AlertCircle,
  Heart,
  Award,
  Sliders,
  Target,
  Copy,
  RotateCcw
} from 'lucide-react';
import { Weapon } from '../types';

interface WeaponsDBProps {
  weapons: Weapon[];
  isAdmin: boolean;
  userEmail?: string;
  onSelectWeapon?: (weaponName: string) => void;
  onRefreshWeapons?: () => void;
}

interface GunOwner {
  name: string;
  country: string;
  famousWeapon: string;
  signatureStyle: string;
  baseSensRequirement: number;
  description: string;
  avatar: string;
}

const FF_GUN_OWNERS: GunOwner[] = [
  { 
    name: 'Nobru', 
    country: 'Brazil', 
    famousWeapon: 'M1014 Shotgun / MP40 SMG', 
    signatureStyle: 'High Velocity Close-Range Jump Flicks', 
    baseSensRequirement: 94, 
    description: 'Legendary World Champion and owner of elite esports rosters. Prefers explosive target snapping with short-range triggers.',
    avatar: '🦁'
  },
  { 
    name: 'RUOK FF', 
    country: 'Thailand', 
    famousWeapon: 'Desert Eagle / Woodpecker Marksman', 
    signatureStyle: 'Surgical One-Tap Headshots & Fast Gloo Walls', 
    baseSensRequirement: 99, 
    description: 'The global community standard for pixel-perfect tappers. Requires ultimate screen responsiveness and extreme DPI coefficients.',
    avatar: '🐅'
  },
  { 
    name: 'Vincenzo', 
    country: 'Middle East', 
    famousWeapon: 'M1887 Double-Barrel / M1014 Shotgun', 
    signatureStyle: 'Custom 1vs4 Room Matches & Rapid Swap Trickshots', 
    baseSensRequirement: 96, 
    description: 'Master of Custom Room Matches. Famed for instant weapon switching, fluid 360-degree drag swipes, and high altitude drag-ups.',
    avatar: '🦅'
  },
  { 
    name: 'Raistar', 
    country: 'India', 
    famousWeapon: 'MP40 SMG / Desert Eagle', 
    signatureStyle: 'Superfluid Movement & CS Headshot Snapping', 
    baseSensRequirement: 97, 
    description: 'Renowned for lightning-fast movement mechanics and immediate crosshair recovery in intense Clash Squad ranked rounds.',
    avatar: '⚡'
  },
  { 
    name: 'BNL', 
    country: 'Middle East', 
    famousWeapon: 'M1887 Shotgun / XM8 Rifle', 
    signatureStyle: 'Aggressive Custom Room Entry & Double Vector Rush', 
    baseSensRequirement: 95, 
    description: 'Relentless rusher who commands Custom Room matches. Known for full screen drag-ups and instant close-quarters eliminations.',
    avatar: '💀'
  },
  { 
    name: 'Ajjubhai (Total Gaming)', 
    country: 'India', 
    famousWeapon: 'AWM Sniper / M4A1 AR', 
    signatureStyle: 'Long-Range Scope Tracking & Smart Choke holds', 
    baseSensRequirement: 89, 
    description: 'India\'s most-subscribed Free Fire personality. Excels at stable predictive tracking and steady long-range scoped headshots.',
    avatar: '🐺'
  },
  { 
    name: 'LOUD Bak', 
    country: 'Brazil', 
    famousWeapon: 'Desert Eagle / USP Pistol Rounds', 
    signatureStyle: 'Clash Squad Pistol Round Master & Recall Resets', 
    baseSensRequirement: 92, 
    description: 'Tactical coordinator and Garena master. Famous for resetting finger recoil vectors to maintain clean vertical head alignment.',
    avatar: '🦊'
  },
  { 
    name: 'Thurzin', 
    country: 'Brazil', 
    famousWeapon: 'M1887 Shotgun / Desert Eagle', 
    signatureStyle: 'Clash Squad Hybrid Sniper-Rusher Combo', 
    baseSensRequirement: 96, 
    description: 'Young esports prodigy. Fuses ultra-speedy touch calibrations with immediate crosshair recovery to command tournaments.',
    avatar: '👑'
  }
];

export default function WeaponsDB({
  weapons,
  isAdmin,
  userEmail,
  onSelectWeapon,
  onRefreshWeapons
}: WeaponsDBProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Rifle' | 'SMG' | 'Shotgun' | 'Sniper' | 'Pistol'>('All');
  
  // --- Garena Free Fire Gun Owners states ---
  const [selectedOwners, setSelectedOwners] = useState<string[]>(['Vincenzo', 'RUOK FF']);
  const [activeCalibrateOwner, setActiveCalibrateOwner] = useState<string>('Vincenzo');
  const [sensBoost, setSensBoost] = useState<number>(15);
  const [matchType, setMatchType] = useState<'Custom Room' | 'Clash Squad (CS) Headshot'>('Custom Room');
  const [copiedSens, setCopiedSens] = useState(false);

  // Admin weapon edit/add states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWeapon, setEditingWeapon] = useState<Weapon | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Rifle' as Weapon['category'],
    image: '💥',
    baseDamage: 50,
    rateOfFire: 50,
    range: 50
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const categories: ('All' | Weapon['category'])[] = ['All', 'Rifle', 'SMG', 'Shotgun', 'Sniper', 'Pistol'];

  // Toggle owner selected (the ones they use most)
  const handleToggleOwner = (name: string) => {
    setSelectedOwners(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  // Handle Form Inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'baseDamage' || name === 'rateOfFire' || name === 'range' ? Number(value) : value
    }));
  };

  const handleOpenEdit = (w: Weapon) => {
    setEditingWeapon(w);
    setFormData({
      name: w.name,
      category: w.category,
      image: w.image || '💥',
      baseDamage: w.baseDamage,
      rateOfFire: w.rateOfFire,
      range: w.range
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingWeapon(null);
    setFormData({
      name: '',
      category: 'Rifle',
      image: '💥',
      baseDamage: 50,
      rateOfFire: 50,
      range: 50
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Weapon name is required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = editingWeapon ? `/api/weapons/${editingWeapon.id}` : '/api/weapons';
      const method = editingWeapon ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adminEmail: userEmail
        })
      });

      if (res.ok) {
        setSuccess(editingWeapon ? 'Weapon stats updated successfully!' : 'Weapon added to database!');
        setTimeout(() => {
          handleCloseForm();
          if (onRefreshWeapons) onRefreshWeapons();
        }, 1500);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to save weapon stats.');
      }
    } catch (err) {
      setError('Network communication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWeapon = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this weapon from the database?')) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/weapons/${id}?adminEmail=${encodeURIComponent(userEmail || '')}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccess('Weapon successfully deleted.');
        if (onRefreshWeapons) onRefreshWeapons();
        setTimeout(() => setSuccess(''), 2000);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to delete weapon.');
      }
    } catch (err) {
      setError('Failed to contact server.');
    }
  };

  const handleAdminSync = async () => {
    if (!window.confirm('Sync with Garena live database & enrich stats using Gemini AI?')) {
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/weapons/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: userEmail })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Successfully synced ${data.count} Garena weapons! Enriched ${data.enriched} items using Gemini.`);
        if (onRefreshWeapons) onRefreshWeapons();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to trigger weapon sync.');
      }
    } catch (err) {
      setError('Connection to sync endpoint failed.');
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredWeapons = weapons.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          w.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || w.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1">
      {/* Weapons DB Header Block */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/a/a3/Garena_Free_fire_logo.png" 
              alt="Garena Free Fire Logo" 
              className="w-12 h-12 object-contain rounded-2xl border border-slate-800 bg-slate-900 p-1 shrink-0 shadow-lg shadow-orange-500/10"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=120&auto=format&fit=crop&q=60';
              }}
            />
            <div>
              <div className="flex items-center gap-2 text-orange-500 font-mono text-[10px] uppercase font-black tracking-widest mb-1.5">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500/10" />
                Garena Free Fire Weapons Repository
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                Official Weapons Stats & Categories
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Analyze real-time baseline weapon data. Calibrated directly to combat performance margins to inform the target tracking engines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={handleAdminSync}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-600/10 hover:shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Syncing...' : '🔄 Garena Live Sync'}
                </button>
                <button
                  onClick={() => {
                    handleCloseForm();
                    setShowAddForm(prev => !prev);
                  }}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  {showAddForm ? 'Close Form' : '➕ Add Weapon'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Garena FF Legendary Gun Owners & Custom Sensitivity Lab */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2 text-red-500 font-mono text-[10px] uppercase font-black tracking-widest">
            <Award className="w-4 h-4 text-red-500" />
            Legendary Garena Free Fire Owners & Masters Registry
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-white">
            Pro Player Configs & Room Match Calibrations
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Choose legendary Free Fire creators and esports athletes. Highlight <span className="text-red-400 font-bold">the ones you use/follow most</span>, select one as your baseline model, then <span className="text-orange-400 font-semibold">raise the sensitivity booster</span> to calculate high-velocity headshot configurations.
          </p>
        </div>

        {/* List of Legendary Gun Owners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {FF_GUN_OWNERS.map(owner => {
            const isFavorite = selectedOwners.includes(owner.name);
            const isActive = activeCalibrateOwner === owner.name;

            return (
              <div
                key={owner.name}
                onClick={() => setActiveCalibrateOwner(owner.name)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${isActive ? 'bg-slate-900 border-orange-500/60 shadow-lg shadow-orange-500/5' : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-900'}`}
              >
                {/* Header card with name & favorite toggle */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl select-none">{owner.avatar}</span>
                    <div>
                      <h4 className="font-black text-sm text-white leading-none">{owner.name}</h4>
                      <span className="text-[9px] text-slate-500 font-mono">{owner.country}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleOwner(owner.name);
                    }}
                    className={`p-1.5 rounded-lg border transition-all ${isFavorite ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                    title={isFavorite ? "Starred (Used most)" : "Star this owner"}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Body details */}
                <div className="space-y-1">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Famous Setup:</div>
                  <div className="text-[10px] text-orange-400 font-bold">{owner.famousWeapon}</div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{owner.description}</p>
                </div>

                {/* Footer action */}
                <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-[9px] font-mono">
                  <span className="text-slate-500 uppercase">{owner.signatureStyle.split(' ')[0]} mode</span>
                  <span className={`font-black uppercase tracking-widest ${isActive ? 'text-orange-500' : 'text-slate-600'}`}>
                    {isActive ? '● CALIBRATING' : 'SELECT'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Calibration Console */}
        {activeCalibrateOwner && (
          (() => {
            const activeOwner = FF_GUN_OWNERS.find(o => o.name === activeCalibrateOwner) || FF_GUN_OWNERS[0];
            const boostFactor = 1 + (sensBoost / 100);

            // Calculation formulas tailored for Room Matches & Clash Squad Headshots
            const calculatedGeneral = Math.min(200, Math.round(activeOwner.baseSensRequirement * boostFactor + (matchType === 'Clash Squad (CS) Headshot' ? 6 : 0)));
            const calculatedRedDot = Math.min(200, Math.round((activeOwner.baseSensRequirement + 5) * boostFactor + (matchType === 'Clash Squad (CS) Headshot' ? 10 : 4)));
            const calculatedScope2x = Math.min(200, Math.round((activeOwner.baseSensRequirement - 4) * boostFactor + 3));
            const calculatedScope4x = Math.min(200, Math.round((activeOwner.baseSensRequirement - 8) * boostFactor + 2));
            const calculatedSniper = Math.min(200, Math.round((activeOwner.baseSensRequirement - 32) * (boostFactor * 0.95)));
            const calculatedFreeLook = Math.min(200, Math.round((activeOwner.baseSensRequirement - 10) * boostFactor + 5));

            const sensitivityQuality = sensBoost < 12 
              ? 'Standard High Accuracy Aim' 
              : sensBoost < 22 
              ? 'Elite Speed Lock-On' 
              : sensBoost < 35 
              ? 'Custom Room pure red shots' 
              : 'Quantum Auto-Flick Autolock';

            const handleCopyToClipboard = () => {
              const textToCopy = `GhostFireHub Pro Headshot Calibration Configuration:
----------------------------------------------
Active Signature Model: ${activeOwner.name}
Match Type Focus: ${matchType}
Raise Sensitivity Booster: +${sensBoost}%
Target Aim Quality: ${sensitivityQuality}

Recommended Sensitivity Parameters:
- General: ${calculatedGeneral}
- Red Dot: ${calculatedRedDot}
- 2X Scope: ${calculatedScope2x}
- 4X Scope: ${calculatedScope4x}
- Sniper Scope: ${calculatedSniper}
- Free Look: ${calculatedFreeLook}
----------------------------------------------
Legit gaming calibrations by GhostFireHub esports.`;

              navigator.clipboard.writeText(textToCopy);
              setCopiedSens(true);
              setTimeout(() => setCopiedSens(false), 2000);
            };

            return (
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative animate-fadeIn">
                
                {/* Left side: Booster sliders and match mode */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-xl">
                      <Sliders className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-200">Sens Calibration Booster</h4>
                      <span className="text-[10px] text-slate-500">Fine-tune the headshot drag coefficients</span>
                    </div>
                  </div>

                  {/* Match Type Select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Match Target Environment</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMatchType('Custom Room')}
                        className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${matchType === 'Custom Room' ? 'bg-orange-600 text-slate-950 font-black' : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200'}`}
                      >
                        Room matches
                      </button>
                      <button
                        type="button"
                        onClick={() => setMatchType('Clash Squad (CS) Headshot')}
                        className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${matchType === 'Clash Squad (CS) Headshot' ? 'bg-orange-600 text-slate-950 font-black' : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200'}`}
                      >
                        CS round, headshot
                      </button>
                    </div>
                  </div>

                  {/* Raise sensitivity booster slider */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Raise Sensitivity Booster</label>
                      <span className="text-xs font-mono font-black text-orange-500">+{sensBoost}% Boost</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={sensBoost}
                      onChange={(e) => setSensBoost(Number(e.target.value))}
                      className="w-full accent-orange-500"
                    />
                    <div className="flex justify-between text-[8px] text-slate-500 font-mono uppercase">
                      <span>Standard DPI</span>
                      <span>High DPI</span>
                      <span>Esports Extreme</span>
                    </div>
                  </div>

                  {/* Calibration Summary */}
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-500 uppercase">Aim Quality:</span>
                      <span className="font-bold text-red-400 uppercase">{sensitivityQuality}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-500 uppercase">Base Owner Model:</span>
                      <span className="font-bold text-slate-300">{activeOwner.name} ({activeOwner.country})</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Real-time sensitivity output */}
                <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950 border border-slate-850 rounded-2xl p-4.5 md:p-5 relative overflow-hidden">
                  
                  {/* Grid of Sensitivity output sliders */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-[10px] font-black uppercase text-orange-500 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-orange-500" />
                        Live Sensitivity Output
                      </span>
                      <span className="text-[9px] bg-red-600/10 text-red-400 px-2 py-0.5 rounded font-black uppercase tracking-wider font-mono">
                        {matchType === 'Custom Room' ? 'ROOM SPECIAL' : 'CS ROUNDS READY'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 pt-1">
                      
                      {/* General */}
                      <div className="space-y-1 bg-slate-900/60 p-2.5 border border-slate-900 rounded-xl">
                        <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
                          <span>GENERAL</span>
                          <span className="text-xs font-black text-orange-500">{calculatedGeneral}</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(calculatedGeneral / 200) * 100}%` }} />
                        </div>
                      </div>

                      {/* Red Dot */}
                      <div className="space-y-1 bg-slate-900/60 p-2.5 border border-slate-900 rounded-xl">
                        <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
                          <span>RED DOT</span>
                          <span className="text-xs font-black text-orange-500">{calculatedRedDot}</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${(calculatedRedDot / 200) * 100}%` }} />
                        </div>
                      </div>

                      {/* 2X Scope */}
                      <div className="space-y-1 bg-slate-900/60 p-2.5 border border-slate-900 rounded-xl">
                        <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
                          <span>2X SCOPE</span>
                          <span className="text-xs font-black text-orange-500">{calculatedScope2x}</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(calculatedScope2x / 200) * 100}%` }} />
                        </div>
                      </div>

                      {/* 4X Scope */}
                      <div className="space-y-1 bg-slate-900/60 p-2.5 border border-slate-900 rounded-xl">
                        <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
                          <span>4X SCOPE</span>
                          <span className="text-xs font-black text-orange-500">{calculatedScope4x}</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(calculatedScope4x / 200) * 100}%` }} />
                        </div>
                      </div>

                      {/* Sniper */}
                      <div className="space-y-1 bg-slate-900/60 p-2.5 border border-slate-900 rounded-xl">
                        <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
                          <span>SNIPER SCOPE</span>
                          <span className="text-xs font-black text-orange-500">{calculatedSniper}</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(calculatedSniper / 200) * 100}%` }} />
                        </div>
                      </div>

                      {/* Free Look */}
                      <div className="space-y-1 bg-slate-900/60 p-2.5 border border-slate-900 rounded-xl">
                        <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
                          <span>FREE LOOK</span>
                          <span className="text-xs font-black text-orange-500">{calculatedFreeLook}</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(calculatedFreeLook / 200) * 100}%` }} />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Actions to copy or save */}
                  <div className="pt-4 mt-4 border-t border-slate-900/80 flex flex-col sm:flex-row gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleCopyToClipboard}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedSens ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Config Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Headshot Config</span>
                        </>
                      )}
                    </button>

                    {onSelectWeapon && (
                      <button
                        type="button"
                        onClick={() => {
                          if (activeOwner.famousWeapon) {
                            onSelectWeapon(activeOwner.famousWeapon);
                          }
                        }}
                        className="px-5 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-orange-600/10 cursor-pointer"
                      >
                        Apply Setup to Calibrator
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })()
        )}
      </div>

      {/* Admin Add/Edit Form */}
      {showAddForm && isAdmin && (
        <form onSubmit={handleSubmit} className="bg-slate-950/90 border border-slate-900 rounded-3xl p-6 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-3 border-b border-slate-900">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">
              {editingWeapon ? `✏️ Edit Stats for: ${editingWeapon.name}` : '➕ Add New Weapon Record'}
            </h3>
            <button
              type="button"
              onClick={handleCloseForm}
              className="text-slate-500 hover:text-slate-300 text-xs font-mono"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/20 p-3 rounded-xl text-xs text-red-400">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-400">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weapon Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., AK47, AC80, GROZA"
                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weapon Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
              >
                <option value="Rifle">Rifle (Long-Range/Assault)</option>
                <option value="SMG">SMG (Close-Range Rapid Spray)</option>
                <option value="Shotgun">Shotgun (Extreme Close Burst)</option>
                <option value="Sniper">Sniper (Heavy Scope Precise)</option>
                <option value="Pistol">Pistol (Handgun / Deagle)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visual Icon (Emoji or Image URL)</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="💥, 🔫 or https://example.com/gun.png"
                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors text-center font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Damage</label>
                <span className="text-xs font-mono font-black text-orange-500">{formData.baseDamage}</span>
              </div>
              <input
                type="range"
                name="baseDamage"
                min="10"
                max="100"
                value={formData.baseDamage}
                onChange={handleInputChange}
                className="w-full accent-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rate of Fire</label>
                <span className="text-xs font-mono font-black text-orange-500">{formData.rateOfFire}</span>
              </div>
              <input
                type="range"
                name="rateOfFire"
                min="10"
                max="100"
                value={formData.rateOfFire}
                onChange={handleInputChange}
                className="w-full accent-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Combat Range</label>
                <span className="text-xs font-mono font-black text-orange-500">{formData.range}</span>
              </div>
              <input
                type="range"
                name="range"
                min="5"
                max="100"
                value={formData.range}
                onChange={handleInputChange}
                className="w-full accent-orange-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
            >
              {loading ? 'Saving to Database...' : editingWeapon ? 'Update Weapon Records' : 'Add Weapon'}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-950/60 p-4 border border-slate-900 rounded-2xl">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 justify-center md:justify-start w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${activeCategory === cat ? 'bg-orange-600 text-slate-950 font-black shadow-lg shadow-orange-600/10' : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-850'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-600" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search weapons or categories..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Weapons Cards Grid */}
      {filteredWeapons.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWeapons.map(weapon => (
            <div 
              key={weapon.id}
              className="bg-slate-950 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-800 transition-all hover:translate-y-[-2px] relative group"
            >
              {/* Category tag */}
              <div className="flex justify-between items-start mb-4">
                <span className="px-2.5 py-1 bg-slate-900 border border-slate-850 text-slate-400 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider">
                  {weapon.category}
                </span>

                {/* Admin Management Actions */}
                {isAdmin && (
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(weapon)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-blue-400 rounded-lg transition-all cursor-pointer"
                      title="Edit Weapon Stats"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteWeapon(weapon.id)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-red-950 text-red-400 rounded-lg transition-all cursor-pointer"
                      title="Delete Weapon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Weapon Display Details */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-slate-900 border border-slate-850 rounded-2xl flex items-center justify-center text-3xl select-none group-hover:scale-110 transition-transform overflow-hidden">
                  {weapon.image && (weapon.image.startsWith('http') || weapon.image.startsWith('/')) ? (
                    <img 
                      src={weapon.image} 
                      alt={weapon.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=120&auto=format&fit=crop&q=60';
                      }}
                    />
                  ) : (
                    <span>{weapon.image || '🔫'}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-base uppercase tracking-tight text-white">{weapon.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">ID: {weapon.id}</p>
                </div>
              </div>

              {/* Weapon combat statistics progress bars */}
              <div className="space-y-3.5 pb-4 border-b border-slate-900/60">
                {/* Damage */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    <span>Base Damage</span>
                    <span className="font-extrabold text-orange-500">{weapon.baseDamage}</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${weapon.baseDamage}%` }}
                    />
                  </div>
                </div>

                {/* Rate of fire */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    <span>Rate Of Fire</span>
                    <span className="font-extrabold text-orange-500">{weapon.rateOfFire}</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                      style={{ width: `${weapon.rateOfFire}%` }}
                    />
                  </div>
                </div>

                {/* Range */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    <span>Range Accuracy</span>
                    <span className="font-extrabold text-orange-500">{weapon.range}</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-500"
                      style={{ width: `${weapon.range}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick links & interactions */}
              <div className="pt-4 flex items-center justify-between">
                <span className="text-[9px] text-slate-500 italic font-mono uppercase">
                  {weapon.category === 'Rifle' && '🎯 Tapping / Mid-Range'}
                  {weapon.category === 'SMG' && '⚡ High mobility spray'}
                  {weapon.category === 'Shotgun' && '🌋 Close range explosive'}
                  {weapon.category === 'Sniper' && '🔭 Heavy long-range locks'}
                  {weapon.category === 'Pistol' && '🦅 Tactical one-tapper'}
                </span>
                
                {onSelectWeapon && (
                  <button
                    onClick={() => onSelectWeapon(weapon.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-orange-600/10 hover:text-orange-400 border border-slate-850 hover:border-orange-500/30 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Calibrate</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-slate-300 text-sm font-bold uppercase tracking-wider">No Weapons Match Search</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search criteria.</p>
        </div>
      )}
    </div>
  );
}
