import { firebaseApi } from '../lib/firebaseApi';
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  History, 
  Bell, 
  Layout, 
  Smartphone, 
  Flame, 
  Check, 
  ChevronRight, 
  AlertCircle,
  Clock,
  Shield,
  Trash2,
  Bookmark,
  ShoppingBag,
  Globe,
  Lock,
  Share2,
  Link,
  Send,
  MessageCircle,
  Trophy,
  Sparkles,
  Palette,
  Github,
  Coins
} from 'lucide-react';
import { UserProfile, SensitivityProfile, HUDLayout, Weapon, Device, MarketplaceProduct, THEME_PRESETS } from '../types';
import { formatDisplayName, maskEmail } from '../utils';
import DailyStreakTracker from './DailyStreakTracker';
import VendorApplicationForm from './VendorApplicationForm';
import VendorDashboard from './VendorDashboard';
import WeaponsDB from './WeaponsDB';

interface DashProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
  weapons: Weapon[];
  isAdmin: boolean;
  onSelectWeapon?: (weaponName: string) => void;
  onRefreshWeapons?: () => void;
}

export default function DashboardView({ 
  user, 
  onUpdateUser, 
  onLogout,
  weapons,
  isAdmin,
  onSelectWeapon,
  onRefreshWeapons
}: DashProps) {
  const [activeTab, setActiveTab] = useState<'History' | 'HUDs' | 'Settings' | 'Notifications' | 'Bookmarks' | 'Missions' | 'Weapons'>('History');
  const [sensitivityHistory, setSensitivityHistory] = useState<SensitivityProfile[]>([]);
  const [hudLayouts, setHudLayouts] = useState<HUDLayout[]>([]);
  const [allProducts, setAllProducts] = useState<MarketplaceProduct[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Country prompt overlay states
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [modalCountry, setModalCountry] = useState('Nigeria');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  useEffect(() => {
    // If the logged-in user doesn't have a country, open the country selector modal!
    if (!user.country) {
      setShowCountryModal(true);
    } else {
      setShowCountryModal(false);
    }
  }, [user.country]);

  const handleModalCountrySubmit = async () => {
    setModalSubmitting(true);
    try {
      const res = await firebaseApi.request('auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          country: modalCountry
        })
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateUser(data.user);
        setShowCountryModal(false);
        alert(`Region successfully set to: ${modalCountry}! Welcome to GhostFireHub.`);
      } else {
        alert(data.error || 'Failed to update country');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleClaimReward = async (missionId: string) => {
    try {
      const res = await firebaseApi.request('user/missions/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, missionId })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user) {
          onUpdateUser(data.user);
        }
        // Refresh missions list
        const missRes = await firebaseApi.request(`user/${encodeURIComponent(user.email)}/missions`);
        if (missRes.ok) {
          const missData = await missRes.json();
          if (Array.isArray(missData)) {
            setMissions(missData);
          }
        }
      } else {
        alert(data.error || 'Failed to claim reward');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Profile Edit fields
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [experience, setExperience] = useState<'Beginner' | 'Intermediate' | 'Professional'>(user.experience || 'Intermediate');
  const [brandPreference, setBrandPreference] = useState(user.brandPreference || 'Samsung');
  const [isProfilePublic, setIsProfilePublic] = useState(!!user.isProfilePublic);
  const [linkCopied, setLinkCopied] = useState(false);

  // Theme overrides state
  const [themePrimary, setThemePrimary] = useState(user.themePrimary || '#f97316');
  const [themeSecondary, setThemeSecondary] = useState(user.themeSecondary || '#f59e0b');

  // NIGERIAN_BANKS and Saved Bank details states
  const NIGERIAN_BANKS = [
    'Access Bank PLC',
    'Guaranty Trust Bank (GTBank)',
    'Zenith Bank PLC',
    'United Bank for Africa (UBA)',
    'First Bank of Nigeria',
    'Fidelity Bank PLC',
    'Opay (Digital Bank)',
    'Palmpay (Digital Bank)',
    'Kuda Bank',
    'Moniepoint Microfinance'
  ];
  const [savedBankName, setSavedBankName] = useState(user.savedBankDetails?.bankName || 'Access Bank PLC');
  const [savedAccountNumber, setSavedAccountNumber] = useState(user.savedBankDetails?.accountNumber || '');
  const [savedAccountName, setSavedAccountName] = useState(user.savedBankDetails?.accountName || '');
  const [bankSaveSuccess, setBankSaveSuccess] = useState('');
  const [bankSaveError, setBankSaveError] = useState('');

  // Vendor Activation Code state
  const [vendorActivationCode, setVendorActivationCode] = useState('');
  const [vendorActivationSuccess, setVendorActivationSuccess] = useState('');
  const [vendorActivationError, setVendorActivationError] = useState('');
  const [activatingVendor, setActivatingVendor] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    setUsername(user.username);
    setExperience(user.experience || 'Intermediate');
    setBrandPreference(user.brandPreference || 'Samsung');
    setIsProfilePublic(!!user.isProfilePublic);
    setThemePrimary(user.themePrimary || '#f97316');
    setThemeSecondary(user.themeSecondary || '#f59e0b');

    if (user.savedBankDetails) {
      setSavedBankName(user.savedBankDetails.bankName || 'Access Bank PLC');
      setSavedAccountNumber(user.savedBankDetails.accountNumber || '');
      setSavedAccountName(user.savedBankDetails.accountName || '');
    }
  }, [user]);

  const handleSaveTheme = async (primary: string, secondary: string, themeName?: string) => {
    setSettingsSuccess('');
    setSettingsError('');
    try {
      const selectedTheme = themeName || (THEME_PRESETS.find(p => p.primary.toLowerCase() === primary.toLowerCase() && p.secondary.toLowerCase() === secondary.toLowerCase())?.id || 'Custom');
      const res = await firebaseApi.request('auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          selectedTheme,
          themePrimary: primary,
          themeSecondary: secondary
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsSuccess(`Theme (${selectedTheme}) applied successfully!`);
        onUpdateUser(data.user);
        
        // Dispatch custom event to notify App.tsx
        const event = new CustomEvent('user-profile-updated', { detail: data.user });
        window.dispatchEvent(event);
      } else {
        setSettingsError(data.error || 'Failed to apply theme.');
      }
    } catch (err) {
      setSettingsError('Connection failed.');
    }
  };

  const handleResetTheme = async () => {
    setSettingsSuccess('');
    setSettingsError('');
    try {
      const res = await firebaseApi.request('auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          selectedTheme: 'Default',
          themePrimary: '',
          themeSecondary: ''
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsSuccess('Theme reset to default global theme successfully!');
        setThemePrimary('#f97316');
        setThemeSecondary('#f59e0b');
        onUpdateUser(data.user);
        
        // Dispatch custom event to notify App.tsx
        const event = new CustomEvent('user-profile-updated', { detail: data.user });
        window.dispatchEvent(event);
      } else {
        setSettingsError(data.error || 'Failed to reset theme.');
      }
    } catch (err) {
      setSettingsError('Connection failed.');
    }
  };

  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankSaveSuccess('');
    setBankSaveError('');
    if (!savedAccountNumber || savedAccountNumber.length !== 10 || isNaN(Number(savedAccountNumber))) {
      setBankSaveError('Please enter a valid 10-digit Nuban account number.');
      return;
    }
    if (!savedAccountName.trim()) {
      setBankSaveError('Please specify the account holder name.');
      return;
    }
    try {
      const res = await firebaseApi.request('auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          savedBankDetails: {
            bankName: savedBankName,
            accountNumber: savedAccountNumber,
            accountName: savedAccountName
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateUser(data.user);
        setBankSaveSuccess('Nigerian bank payout details successfully saved and secured!');
        setTimeout(() => setBankSaveSuccess(''), 5000);
      } else {
        const data = await res.json();
        setBankSaveError(data.error || 'Failed to save bank details.');
      }
    } catch (err) {
      setBankSaveError('Network error saving bank details.');
    }
  };

  const handleActivateVendorCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVendorActivationSuccess('');
    setVendorActivationError('');
    if (!vendorActivationCode.trim()) {
      setVendorActivationError('Please enter your vendor activation code.');
      return;
    }
    setActivatingVendor(true);
    try {
      const res = await firebaseApi.request('user/activate-vendor-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          token: vendorActivationCode.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateUser(data.user);
        setVendorActivationSuccess('Congratulations! Your Vendor Store has been activated successfully!');
        setVendorActivationCode('');
        setTimeout(() => setVendorActivationSuccess(''), 5000);
      } else {
        setVendorActivationError(data.error || 'Failed to activate code.');
      }
    } catch (err) {
      setVendorActivationError('Network error activating code.');
    } finally {
      setActivatingVendor(false);
    }
  };

  // Real notifications state
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load saved sensitivity configs
      const sensRes = await firebaseApi.request(`recommend/history/${encodeURIComponent(user.email)}`);
      const sensData = await sensRes.json();
      if (Array.isArray(sensData)) {
        setSensitivityHistory(sensData);
      }

      // Load saved HUD templates
      const hudRes = await firebaseApi.request(`hud/list/${encodeURIComponent(user.email)}`);
      const hudData = await hudRes.json();
      if (Array.isArray(hudData)) {
        setHudLayouts(hudData);
      }

      // Load products for bookmark matching
      const prodRes = await firebaseApi.request('marketplace');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) {
          setAllProducts(prodData);
        }
      }

      // Load notifications
      const notifRes = await firebaseApi.request(`notifications?email=${encodeURIComponent(user.email)}`);
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        if (Array.isArray(notifData)) {
          setNotifications(notifData);
        }
      }

      // Load daily missions
      setMissionsLoading(true);
      const missRes = await firebaseApi.request(`user/${encodeURIComponent(user.email)}/missions`);
      if (missRes.ok) {
        const missData = await missRes.json();
        if (Array.isArray(missData)) {
          setMissions(missData);
        }
      }
      setMissionsLoading(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await firebaseApi.request('notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user.email]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess('');
    setSettingsError('');

    try {
      const res = await firebaseApi.request('auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          username,
          experience,
          brandPreference,
          isProfilePublic
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsSuccess('User profile registered successfully!');
        onUpdateUser(data.user);
      } else {
        setSettingsError(data.error || 'Failed to update user parameters.');
      }
    } catch (err) {
      setSettingsError('Connection failed.');
    }
  };

  const clearHistoryItem = async (timestamp: string) => {
    // Optional history filter delete logic
    setSensitivityHistory(prev => prev.filter(h => h.created_at !== timestamp));
  };

  return (
    <div className="space-y-6">
      
      {/* Country Selection Overlay Modal */}
      {showCountryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border-2 border-orange-500/40 w-full max-w-md rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="text-center space-y-2">
              <span className="text-4xl">🌍</span>
              <h3 className="text-xl font-black uppercase text-white tracking-tight">Select Your Country</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose your country of residence. Nigerian players get high-speed tournament presets in <span className="text-orange-400 font-bold">₦ Naira currency (10k, 20k etc.)</span>, and other locations will be listed in standard USD ($).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Destination Region</label>
              <select
                value={modalCountry}
                onChange={(e) => setModalCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-200 outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="Nigeria">Nigeria (₦ Naira currency)</option>
                <option value="United States">United States ($ USD currency)</option>
                <option value="United Kingdom">United Kingdom ($ USD currency)</option>
                <option value="Brazil">Brazil ($ USD currency)</option>
                <option value="India">India ($ USD currency)</option>
                <option value="Other">Other country ($ USD currency)</option>
              </select>
            </div>

            <button
              onClick={handleModalCountrySubmit}
              disabled={modalSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-orange-600/10 flex justify-center items-center gap-1.5 cursor-pointer"
            >
              {modalSubmitting ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Save & Continue</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Welcome Card banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-stretch justify-between gap-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center font-black text-slate-950 text-xl shadow-lg">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-md sm:text-lg font-black text-white uppercase tracking-tight">
                Welcome back, {formatDisplayName(user.username, user.email)}!
              </h2>
              <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono px-2 py-0.5 rounded font-black uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Member Account: <span className="font-mono text-slate-400">{maskEmail(user.email)}</span> • Experience: <span className="text-orange-400 font-bold">{experience}</span>
            </p>
            {/* Gamified Level-Up Badges System */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {sensitivityHistory.length >= 10 ? (
                <span className="text-[8.5px] bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-slate-950 px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-orange-500/20 animate-pulse border border-orange-400/30">
                  👑 Level 4: Pro Calibrator Status
                </span>
              ) : sensitivityHistory.length >= 6 ? (
                <span className="text-[8.5px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1 border border-indigo-400/20">
                  🎯 Level 3: Elite Specialist
                </span>
              ) : sensitivityHistory.length >= 3 ? (
                <span className="text-[8.5px] bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1 border border-cyan-400/20">
                  ⚙️ Level 2: Expert Tuner
                </span>
              ) : (
                <span className="text-[8.5px] bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
                  🎮 Level 1: Novice Calibrator
                </span>
              )}

              <span className="text-[8.5px] bg-slate-950/80 border border-slate-850 text-slate-500 px-2 py-0.5 rounded font-mono">
                {sensitivityHistory.length}/10 Configs for Next Rank
              </span>
            </div>
          </div>
        </div>

        {/* Rapid Status box */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-850 p-4 rounded-2xl shrink-0">
          <div className="text-center">
            <div className="text-xs font-bold text-slate-400 uppercase font-mono">Sens Hist</div>
            <div className="text-lg font-black font-mono text-orange-400 mt-0.5">{sensitivityHistory.length}</div>
          </div>
          <div className="w-px h-8 bg-slate-850"></div>
          <div className="text-center">
            <div className="text-xs font-bold text-slate-400 uppercase font-mono">HUD Presets</div>
            <div className="text-lg font-black font-mono text-amber-400 mt-0.5">{hudLayouts.length}</div>
          </div>
          <div className="w-px h-8 bg-slate-850"></div>
          <div className="text-center">
            <div className="text-xs font-bold text-slate-400 uppercase font-mono">GhostPoints</div>
            <div className="text-lg font-black font-mono text-emerald-400 mt-0.5 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-current text-emerald-500 animate-pulse" />
              <span>{user.ghostPoints || 0}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-850"></div>
          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-red-600 hover:text-white transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>

      </div>

      {/* Grid view containing main panels and sub sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation panel */}
        <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-3xl p-4 flex flex-col gap-1.5 backdrop-blur-md">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold px-3 pb-2 border-b border-slate-850">
            Control Center
          </span>
          
          <button
            onClick={() => setActiveTab('History')}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left flex items-center justify-between transition-all ${activeTab === 'History' ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}`}
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4" /> Calibration History
            </span>
            <span className={`text-[10px] font-mono font-bold ${activeTab === 'History' ? 'text-slate-900' : 'text-slate-500'}`}>{sensitivityHistory.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('HUDs')}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left flex items-center justify-between transition-all ${activeTab === 'HUDs' ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}`}
          >
            <span className="flex items-center gap-2">
              <Layout className="w-4 h-4" /> HUD Blueprints
            </span>
            <span className={`text-[10px] font-mono font-bold ${activeTab === 'HUDs' ? 'text-slate-900' : 'text-slate-500'}`}>{hudLayouts.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('Notifications')}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left flex items-center justify-between transition-all ${activeTab === 'Notifications' ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}`}
          >
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notifications
            </span>
            <span className={`text-[10px] font-mono font-bold ${activeTab === 'Notifications' ? 'text-slate-900' : 'text-slate-500'}`}>{notifications.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('Bookmarks')}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left flex items-center justify-between transition-all ${activeTab === 'Bookmarks' ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}`}
          >
            <span className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" /> Bookmarks
            </span>
            <span className={`text-[10px] font-mono font-bold ${activeTab === 'Bookmarks' ? 'text-slate-900' : 'text-slate-500'}`}>{(user.bookmarkedPresets?.length || 0) + (user.bookmarkedProducts?.length || 0)}</span>
          </button>

          <button
            onClick={() => setActiveTab('Missions')}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left flex items-center justify-between transition-all ${activeTab === 'Missions' ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}`}
          >
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Daily Missions
            </span>
            <span className={`text-[10px] font-mono font-bold ${activeTab === 'Missions' ? 'text-slate-900' : 'text-emerald-500 font-extrabold'}`}>
              {missions.filter(m => m.progress >= m.target && !m.claimed).length > 0 && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block mr-1.5 animate-ping"></span>
              )}
              {missions.filter(m => m.progress >= m.target && !m.claimed).length} ready
            </span>
          </button>

          {(user.role === 'Vendor' || user.isVendor) ? (
            <button
              onClick={() => setActiveTab('VendorDashboard' as any)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left flex items-center justify-between transition-all ${activeTab === ('VendorDashboard' as any) ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}`}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-orange-400 animate-pulse" /> Merchant Dashboard
              </span>
              <span className="text-[9px] bg-orange-600/20 text-orange-400 px-1.5 py-0.5 rounded font-bold font-mono">ACTIVE</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('VendorApplication' as any)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left flex items-center justify-between transition-all ${activeTab === ('VendorApplication' as any) ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}`}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-400" /> Become a Vendor
              </span>
              <span className="text-[9px] bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded font-bold font-mono">
                {user.vendorRequested ? 'PENDING' : 'APPLY'}
              </span>
            </button>
          )}



          <button
            onClick={() => setActiveTab('Weapons')}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left flex items-center justify-between transition-all ${activeTab === 'Weapons' ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}`}
          >
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4" /> Garena Weapons DB
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('Settings')}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left flex items-center justify-between transition-all ${activeTab === 'Settings' ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}`}
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Profile Parameters
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Referral Link & Code Affiliate Card */}
          <div className="mt-4 p-4.5 bg-slate-950/80 border border-slate-850 rounded-2xl space-y-3">
            <div>
              <span className="text-[8px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Gamer Affiliate Program</span>
              <h4 className="text-[10px] font-black text-white uppercase tracking-tight mt-0.5">Share Code, Earn Points!</h4>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-slate-500 uppercase">My Referral Code</span>
                <span className="text-[8.5px] bg-orange-600/10 border border-orange-500/20 text-orange-400 px-1 rounded font-bold font-mono">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-xs text-white font-extrabold select-all">{user.referralCode || 'GHOST-MEMBER'}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.referralCode || '');
                      alert('Referral Code copied to clipboard!');
                    }}
                    className="px-1.5 py-1 bg-orange-600 hover:bg-orange-500 text-slate-950 font-mono text-[8.5px] font-extrabold uppercase tracking-wider rounded transition-all cursor-pointer"
                  >
                    CODE
                  </button>
                  <button
                    onClick={() => {
                      const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ghostfirehub.com';
                      const link = `${siteUrl}/?ref=${encodeURIComponent(user.referralCode || '')}`;
                      navigator.clipboard.writeText(link);
                      alert('Referral Link copied to clipboard!');
                    }}
                    className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-mono text-[8.5px] font-extrabold uppercase tracking-wider rounded border border-slate-700 transition-all cursor-pointer"
                  >
                    LINK
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-1.5 bg-slate-900/50 border border-slate-850 rounded-lg">
                <div className="text-[8px] text-slate-500 uppercase font-mono">Invites</div>
                <div className="text-xs font-mono font-bold text-white mt-0.5">{user.referralCount || 0}</div>
              </div>
              <div className="p-1.5 bg-slate-900/50 border border-slate-850 rounded-lg">
                <div className="text-[8px] text-slate-500 uppercase font-mono">Bonus</div>
                <div className="text-xs font-mono font-bold text-yellow-400 mt-0.5">🪙 {(user.referralCount || 0) * 50}</div>
              </div>
            </div>

            <p className="text-[9px] text-slate-600 leading-tight font-sans text-center">
              Earn <span className="text-yellow-400 font-bold">+50 Ghost Points</span> for every gamer who registers using your affiliate code!
            </p>
          </div>
        </div>

        {/* Content displays */}
        <div className="lg:col-span-9 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 lg:p-6 backdrop-blur-md min-h-[360px] flex flex-col justify-between">
          
          <div>
            <DailyStreakTracker user={user} onUpdateUser={onUpdateUser} />
            
            {activeTab === 'History' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Calibration History</h3>
                <span className="text-[10px] text-slate-500 font-mono">Autosaved parameters logs</span>
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-500 text-xs animate-pulse">Loading data...</div>
              ) : sensitivityHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No calibration history recorded yet. Run the GhostCore™ recommendation engine to save your first profile!
                </div>
              ) : (
                <div className="space-y-3">
                  {sensitivityHistory.map((hist, i) => (
                    <div 
                      key={i} 
                      className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-800 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-slate-900 border border-slate-800 text-orange-400 px-2 py-0.5 rounded font-mono font-bold">
                            {hist.deviceBrand} {hist.deviceModel}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(hist.created_at || '').toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-mono font-bold text-white mt-3.5 max-w-md">
                          <div className="bg-slate-900 p-1.5 rounded border border-slate-850">
                            <div className="text-slate-500 text-[8px] uppercase">Gen</div>
                            <div>{hist.general}</div>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded border border-slate-850">
                            <div className="text-slate-500 text-[8px] uppercase">Dot</div>
                            <div>{hist.redDot}</div>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded border border-slate-850">
                            <div className="text-slate-500 text-[8px] uppercase">2×</div>
                            <div>{hist.scope2x}</div>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded border border-slate-850">
                            <div className="text-slate-500 text-[8px] uppercase">4×</div>
                            <div>{hist.scope4x}</div>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded border border-slate-850">
                            <div className="text-slate-500 text-[8px] uppercase">Snip</div>
                            <div>{hist.sniper}</div>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded border border-slate-850">
                            <div className="text-slate-500 text-[8px] uppercase">Conf</div>
                            <div className="text-orange-400">{hist.confidenceScore}%</div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => clearHistoryItem(hist.created_at || '')}
                        className="p-2 bg-slate-900 hover:bg-red-950/20 border border-slate-850 text-slate-600 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                        title="Delete Profile Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'HUDs' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">HUD Layout Presets</h3>
                <span className="text-[10px] text-slate-500 font-mono">Saved visual drag mappings</span>
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-500 text-xs animate-pulse">Loading data...</div>
              ) : hudLayouts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No customized HUD layouts saved yet. Open the HUD builder module to compile and record your first claw layout.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hudLayouts.map((hud) => (
                    <div key={hud.id} className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-white text-xs uppercase">{hud.name}</h4>
                        <div className="flex gap-2 text-[10px] text-slate-500 font-mono mt-1">
                          <span>Orientation: {hud.orientation.toUpperCase()}</span>
                          <span>•</span>
                          <span>{hud.buttons.length} Buttons configured</span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-850/40">
                        <span className="text-[10px] bg-slate-900 text-slate-400 px-2.5 py-1 rounded font-semibold uppercase">
                          TACTILE VERIFIED
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">System bulletins &amp; alerts</h3>
                <span className="text-[10px] text-slate-500 font-mono">Last 3 messages</span>
              </div>

              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex gap-3.5 items-start">
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
                      <Bell className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-xs uppercase">{n.title}</h4>
                        <span className="text-[9px] text-slate-500 font-mono">{n.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Bookmarks' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Bookmarked &amp; Saved Items</h3>
                <span className="text-[10px] text-slate-500 font-mono">Sensitivity profiles &amp; marketplace products</span>
              </div>

              {/* Bookmarked presets list */}
              <div>
                <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 fill-current" /> Saved Sensitivity Presets
                </h4>
                {sensitivityHistory.filter(p => user.bookmarkedPresets?.includes(p.id)).length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic p-4 bg-slate-950/20 border border-slate-850/40 rounded-2xl text-center">No saved presets. Bookmark a preset in the GhostCore™ Calibration Engine to view it here!</p>
                ) : (
                  <div className="space-y-3">
                    {sensitivityHistory.filter(p => user.bookmarkedPresets?.includes(p.id)).map(p => (
                      <div key={p.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-orange-400 font-mono font-bold uppercase">{p.deviceBrand} {p.deviceModel}</span>
                            <h5 className="text-[11px] font-bold text-white uppercase tracking-wider mt-0.5">Recommended Config Preset</h5>
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono">{new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="grid grid-cols-6 gap-1 bg-slate-900/60 p-2 rounded-xl text-center font-mono">
                          <div>
                            <div className="text-[8px] text-slate-500 uppercase">GEN</div>
                            <div className="text-xs font-bold text-white">{p.general}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-slate-500 uppercase">RED</div>
                            <div className="text-xs font-bold text-white">{p.redDot}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-slate-500 uppercase">2X</div>
                            <div className="text-xs font-bold text-white">{p.scope2x}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-slate-500 uppercase">4X</div>
                            <div className="text-xs font-bold text-white">{p.scope4x}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-slate-500 uppercase">SNIP</div>
                            <div className="text-xs font-bold text-white">{p.sniper}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-slate-500 uppercase">FREE</div>
                            <div className="text-xs font-bold text-white">{p.freeLook}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bookmarked products list */}
              <div className="pt-2">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 fill-current" /> Saved Marketplace Products
                </h4>
                {allProducts.filter(prod => user.bookmarkedProducts?.includes(prod.id)).length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic p-4 bg-slate-950/20 border border-slate-850/40 rounded-2xl text-center">No saved marketplace products. Bookmark items in the Marketplace to see them here!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allProducts.filter(prod => user.bookmarkedProducts?.includes(prod.id)).map(prod => (
                      <div key={prod.id} className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h5 className="text-xs font-bold text-white truncate">{prod.name}</h5>
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono uppercase font-black">{prod.category}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{prod.description}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                          <span className="text-xs font-black text-orange-400 font-mono">${prod.price}</span>
                          {prod.telegramLink && (
                            <a
                              href={prod.telegramLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[9px] bg-orange-500 hover:bg-orange-600 text-slate-950 font-black uppercase px-2.5 py-1 rounded-lg transition-all"
                            >
                              Details
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Profile parameter configuration</h3>
                <span className="text-[10px] text-slate-500 font-mono">Fine tune user parameters</span>
              </div>

              {settingsSuccess && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              {settingsError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{settingsError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-white">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">Email address (Static)</label>
                  <input
                    type="text"
                    value={maskEmail(email)}
                    disabled
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">Skill Experience</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Professional">Professional Esports Player</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">Hardware Brand Preference</label>
                  <select
                    value={brandPreference}
                    onChange={(e) => setBrandPreference(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="Samsung">Samsung</option>
                    <option value="Apple">Apple</option>
                    <option value="TECNO">TECNO</option>
                    <option value="Infinix">Infinix</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Huawei">Huawei</option>
                    <option value="Oppo">Oppo</option>
                    <option value="Vivo">Vivo</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="sm:col-span-2 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-orange-500 hover:text-orange-400 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all mt-3 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-orange-500" />
                  <span>Update Profile Details</span>
                </button>

              </form>

              {/* Custom Theme Section */}
              <div className="mt-6 pt-5 border-t border-slate-850/80 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-orange-500" />
                    Custom UI Theme Settings
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Personalize your esports dashboard colors. Choose from engineered tactical presets or configure custom hex color codes.
                  </p>
                </div>

                {/* Theme Presets */}
                <div className="bg-slate-950/40 border border-slate-900/80 p-4 rounded-2xl space-y-3">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Engineered Tactical Presets:
                  </span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { name: 'Default Tactical', primary: '#f97316', secondary: '#f59e0b', label: 'Orange / Amber' },
                      { name: 'Premium Black Gold', primary: '#D4AF37', secondary: '#F5E6A9', label: 'Premium Gold' },
                      { name: 'Cyberpunk Neon', primary: '#ec4899', secondary: '#06b6d4', label: 'Hot Pink / Cyan' },
                      { name: 'Emerald Matrix', primary: '#10b981', secondary: '#84cc16', label: 'Green / Lime' },
                      { name: 'Deep Blue Tech', primary: '#3b82f6', secondary: '#a855f7', label: 'Neon Blue / Purple' },
                      { name: 'Toxic Volt', primary: '#84cc16', secondary: '#eab308', label: 'Volt Lime / Yellow' },
                      { name: 'Amethyst Void', primary: '#8b5cf6', secondary: '#ec4899', label: 'Violet / Pink' },
                    ].map((preset) => {
                      const isSelected = themePrimary.toLowerCase() === preset.primary.toLowerCase() && themeSecondary.toLowerCase() === preset.secondary.toLowerCase();
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setThemePrimary(preset.primary);
                            setThemeSecondary(preset.secondary);
                            handleSaveTheme(preset.primary, preset.secondary);
                          }}
                          className={`p-2.5 bg-slate-900 border text-left rounded-xl transition-all hover:bg-slate-850 cursor-pointer ${
                            isSelected 
                              ? 'border-orange-500 bg-orange-950/10' 
                              : 'border-slate-850 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 justify-between">
                            <span className="text-[10px] font-black text-slate-200 block truncate">{preset.name}</span>
                            <div className="flex gap-1 shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: preset.primary }} />
                              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: preset.secondary }} />
                            </div>
                          </div>
                          <span className="text-[8.5px] text-slate-500 font-mono block mt-0.5">{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 p-3.5 bg-slate-950/60 border border-slate-850 rounded-2xl">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">
                      Primary Brand Color
                    </label>
                    <p className="text-[8.5px] text-slate-500 leading-normal">
                      Main dashboard button backgrounds, primary highlight borders, and active status selections.
                    </p>
                    <div className="flex gap-2 items-center mt-2">
                      <div className="relative w-9 h-9 rounded-xl border border-slate-800 overflow-hidden shrink-0">
                        <input
                          type="color"
                          value={themePrimary}
                          onChange={(e) => setThemePrimary(e.target.value)}
                          className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent scale-150"
                        />
                      </div>
                      <input
                        type="text"
                        value={themePrimary}
                        onChange={(e) => {
                          const val = e.target.value;
                          setThemePrimary(val);
                        }}
                        placeholder="#f97316"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3.5 bg-slate-950/60 border border-slate-850 rounded-2xl">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">
                      Secondary Accent Color
                    </label>
                    <p className="text-[8.5px] text-slate-500 leading-normal">
                      Secondary button elements, sub-headers, VIP badges, and premium secondary actions.
                    </p>
                    <div className="flex gap-2 items-center mt-2">
                      <div className="relative w-9 h-9 rounded-xl border border-slate-800 overflow-hidden shrink-0">
                        <input
                          type="color"
                          value={themeSecondary}
                          onChange={(e) => setThemeSecondary(e.target.value)}
                          className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent scale-150"
                        />
                      </div>
                      <input
                        type="text"
                        value={themeSecondary}
                        onChange={(e) => {
                          const val = e.target.value;
                          setThemeSecondary(val);
                        }}
                        placeholder="#f59e0b"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleResetTheme}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Reset to Default Theme
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveTheme(themePrimary, themeSecondary)}
                    className="px-4.5 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Apply Custom Theme
                  </button>
                </div>
              </div>

              {/* Nigerian Bank Details Saving Form */}
              {isAdmin && (
                <div className="mt-6 pt-5 border-t border-slate-850/80 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-orange-500 animate-pulse" />
                      Saved Nigerian Bank Payout Details (₦)
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Securely save and lock your default Nigerian bank account parameters. Your details will be auto-populated during withdrawals to facilitate immediate 12-24h Naira payouts without manual re-typing.
                    </p>
                  </div>

                  <form onSubmit={handleSaveBankDetails} className="bg-slate-950/40 border border-slate-900/80 p-4 rounded-2xl space-y-4">
                    {bankSaveSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded-xl font-mono">
                        ✓ {bankSaveSuccess}
                      </div>
                    )}
                    {bankSaveError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-xl font-mono">
                        ⚠ {bankSaveError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">Select Active Bank</label>
                        <select
                          value={savedBankName}
                          onChange={(e) => setSavedBankName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 font-mono"
                        >
                          {NIGERIAN_BANKS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">NUBAN Account Number</label>
                        <input
                          type="text"
                          maxLength={10}
                          value={savedAccountNumber}
                          onChange={(e) => setSavedAccountNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 0123456789"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">Account Holder Full Name</label>
                        <input
                          type="text"
                          value={savedAccountName}
                          onChange={(e) => setSavedAccountName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-4.5 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save Secure Payout Details
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Vendor Activation Code Section */}
              {!user.isVendor && (
                <div className="mt-6 pt-5 border-t border-slate-850/80 space-y-4 animate-fadeIn">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-orange-500 animate-pulse" />
                      Instant Vendor Store Activation
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Did you purchase a license from the Founder directly via WhatsApp or Telegram? Paste your single-use Vendor Activation Code below to instantly unlock your Merchant listing dashboard.
                    </p>
                  </div>

                  <form onSubmit={handleActivateVendorCode} className="bg-slate-950/40 border border-slate-900/80 p-4 rounded-2xl space-y-4">
                    {vendorActivationSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded-xl font-mono">
                        ✓ {vendorActivationSuccess}
                      </div>
                    )}
                    {vendorActivationError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-xl font-mono">
                        ⚠ {vendorActivationError}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                      <div className="w-full space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">Vendor Activation Code</label>
                        <input
                          type="text"
                          value={vendorActivationCode}
                          onChange={(e) => setVendorActivationCode(e.target.value.toUpperCase())}
                          placeholder="e.g. GHOST-VEND-123456"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-orange-500 font-mono tracking-widest uppercase"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={activatingVendor}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:brightness-110 disabled:opacity-50 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {activatingVendor ? 'Activating...' : 'Activate Store'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Public Profile Sharing */}
              <div className="mt-6 pt-5 border-t border-slate-850/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-orange-500 animate-pulse" />
                      Public Profile Sharing
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Generate a unique link to share your favorite sensitivities & HUDs with the tactical community.
                    </p>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      const newValue = !isProfilePublic;
                      setIsProfilePublic(newValue);
                      
                      // Auto-save to provide a seamless user experience
                      try {
                        const res = await firebaseApi.request('auth/update', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: user.email,
                            isProfilePublic: newValue
                          })
                        });
                        const data = await res.json();
                        if (res.ok) {
                          onUpdateUser(data.user);
                          setSettingsSuccess(newValue ? 'Public profile sharing enabled!' : 'Profile sharing disabled.');
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isProfilePublic ? 'bg-orange-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isProfilePublic ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {isProfilePublic ? (
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono text-[10px] uppercase font-bold">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                      <span>Your public profile sharing is active</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <div className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 font-mono text-[10px] text-slate-300 truncate select-all">
                        {`${window.location.origin}?share=${encodeURIComponent(user.username)}`}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}?share=${encodeURIComponent(user.username)}`);
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 bg-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Link className="w-3.5 h-3.5" />
                        <span>{linkCopied ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>Quick Share:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const text = `Check out my custom GhostCore gaming configurations & HUD layouts! Calibrate yours free:`;
                            const shareUrl = `${window.location.origin}?share=${encodeURIComponent(user.username)}`;
                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + shareUrl)}`, '_blank');
                          }}
                          className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase rounded-lg hover:bg-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer text-[9px]"
                        >
                          <MessageCircle className="w-3 h-3 fill-current" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const text = `Check out my custom GhostCore gaming configurations & HUD layouts!`;
                            const shareUrl = `${window.location.origin}?share=${encodeURIComponent(user.username)}`;
                            window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold uppercase rounded-lg hover:bg-indigo-500/20 transition-all flex items-center gap-1 cursor-pointer text-[9px]"
                        >
                          <Send className="w-3 h-3 fill-current" />
                          <span>Telegram</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950/20 border border-slate-850/40 rounded-2xl flex items-center gap-2.5 text-[10px] text-slate-500">
                    <Lock className="w-4 h-4 text-slate-600 animate-pulse" />
                    <span>Your configuration profile is kept private. Enable sharing above to connect with the community.</span>
                  </div>
                )}
              </div>

              {/* GitHub OAuth Diagnostic and Verification Console */}
              {isAdmin && (
                <div className="mt-6 pt-5 border-t border-slate-850/80 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Github className="w-4 h-4 text-orange-500" />
                      GitHub OAuth & Firebase Integration Setup
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      If GitHub Sign-In or authentication fails, verify your callback configurations using this tactical checklist.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Step 1: Firebase configuration */}
                    <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 bg-orange-500/15 border border-orange-500/30 text-orange-500 rounded-lg text-[10px] font-bold font-mono">01</span>
                        <span className="text-[10px] font-black uppercase text-slate-200 tracking-wider">GitHub OAuth Registration</span>
                      </div>
                      <p className="text-[9.5px] text-slate-400 leading-relaxed">
                        Register your application as an OAuth App in GitHub Developer Settings. Paste your client credentials into the Firebase Console.
                      </p>
                      <div className="space-y-2 pt-1 font-mono text-[9px]">
                        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850/80 flex flex-col gap-1">
                          <span className="text-slate-500 text-[8px] uppercase font-bold">1. GitHub Developer URL</span>
                          <a href="https://github.com/settings/developers" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline truncate">
                            github.com/settings/developers
                          </a>
                        </div>
                        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850/80 flex flex-col gap-1">
                          <span className="text-slate-500 text-[8px] uppercase font-bold">2. Homepage URL</span>
                          <div className="flex justify-between items-center gap-1.5">
                            <span className="text-slate-300 truncate select-all">{window.location.origin}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(window.location.origin);
                                setSettingsSuccess('Homepage URL copied!');
                              }}
                              className="text-orange-500 hover:text-orange-400 uppercase font-bold shrink-0 text-[8px]"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850/80 flex flex-col gap-1">
                          <span className="text-slate-500 text-[8px] uppercase font-bold">3. Authorization Callback URL</span>
                          <div className="flex justify-between items-center gap-1.5">
                            <span className="text-slate-300 truncate select-all">
                              https://gen-lang-client-0929377753.firebaseapp.com/__/auth/handler
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('https://gen-lang-client-0929377753.firebaseapp.com/__/auth/handler');
                                setSettingsSuccess('Callback URL copied!');
                              }}
                              className="text-orange-500 hover:text-orange-400 uppercase font-bold shrink-0 text-[8px]"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Firebase Console and authorized domains */}
                    <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 bg-orange-500/15 border border-orange-500/30 text-orange-500 rounded-lg text-[10px] font-bold font-mono">02</span>
                        <span className="text-[10px] font-black uppercase text-slate-200 tracking-wider">Authorized Domains in Firebase</span>
                      </div>
                      <p className="text-[9.5px] text-slate-400 leading-relaxed">
                        You must add the current applet host URLs to your **Authorized Domains** list in Firebase Console under Authentication &gt; Settings &gt; Authorized Domains.
                      </p>
                      <div className="space-y-1.5 font-mono text-[8.5px] pt-1">
                        <span className="text-slate-500 text-[8px] uppercase font-bold block mb-1">Required Authorized Domains:</span>
                        {[
                          'localhost',
                          'gen-lang-client-0929377753.firebaseapp.com',
                          'ais-dev-xjqofml5ly3pynz5aikcud-98840122376.europe-west2.run.app',
                          'ais-pre-xjqofml5ly3pynz5aikcud-98840122376.europe-west2.run.app'
                        ].map((domain) => (
                          <div key={domain} className="flex justify-between items-center bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-850/80">
                            <span className="text-slate-300 truncate select-all">{domain}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(domain);
                                setSettingsSuccess(`Copied: ${domain}`);
                              }}
                              className="text-[8px] uppercase text-orange-500 hover:text-orange-400 font-bold shrink-0"
                            >
                              Copy
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Common Troubleshooting */}
                  <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl space-y-2">
                    <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Crucial Troubleshooting Parameters:
                    </span>
                    <ul className="text-[9.5px] text-slate-400 space-y-1.5 list-disc pl-4 leading-relaxed">
                      <li>
                        <strong>auth/popup-closed-by-user:</strong> Caused if the GitHub popup is closed before authorizing. Ensure you don't close the window manually.
                      </li>
                      <li>
                        <strong>auth/configuration-not-found:</strong> Ensure you have enabled the <strong>GitHub provider</strong> in the Firebase Auth console and set both Client ID and Client Secret correctly.
                      </li>
                      <li>
                        <strong>Email Access Error:</strong> If GitHub returns an error regarding "no email", ensure your GitHub profile has a public-facing email address, or that you've enabled the option to read the user's primary/verified email inside the GitHub Auth provider configuration in Firebase.
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Missions' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-orange-500" />
                    GhostCore Daily Missions System
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Complete daily activities in the GhostCore engine to acquire GhostPoints (GP) rewards.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-black uppercase">
                    Your Balance: {user.ghostPoints || 0} GP
                  </span>
                </div>
              </div>

              {missionsLoading && missions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs animate-pulse">
                  Querying tactical operations progress from server...
                </div>
              ) : missions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No active operational missions found. Check back later!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {missions.map((m) => {
                    const isCompleted = m.progress >= m.target;
                    const isClaimed = !!m.claimed;
                    const percent = Math.min(100, Math.round((m.progress / m.target) * 100));

                    return (
                      <div 
                        key={m.id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 relative overflow-hidden backdrop-blur-md ${
                          isClaimed 
                            ? 'bg-slate-950/20 border-slate-900/60 opacity-60' 
                            : isCompleted 
                              ? 'bg-emerald-950/10 border-emerald-500/30 shadow-emerald-950/10 shadow-lg' 
                              : 'bg-slate-950/60 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        {/* Sparkle background for claimable items */}
                        {isCompleted && !isClaimed && (
                          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none animate-pulse"></div>
                        )}

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-3">
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              isClaimed 
                                ? 'bg-slate-900 text-slate-500 border border-slate-850' 
                                : isCompleted 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse' 
                                  : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            }`}>
                              {isClaimed ? 'Operation Claimed' : isCompleted ? 'Success State' : 'In Progress'}
                            </span>

                            <div className="flex items-center gap-1 font-mono text-[10px] font-extrabold text-emerald-400">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>+{m.rewardPoints} GP</span>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-white uppercase tracking-tight mt-1.5">{m.title}</h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed">{m.description}</p>
                        </div>

                        <div className="space-y-2 mt-2">
                          {/* Progress Tracker */}
                          <div className="flex justify-between items-center text-[9px] font-mono">
                            <span className="text-slate-500">Operation Status:</span>
                            <span className={isClaimed ? 'text-slate-500' : isCompleted ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                              {m.progress} / {m.target} ({percent}%)
                            </span>
                          </div>

                          {/* Progress bar container */}
                          <div className="w-full bg-slate-950/80 border border-slate-900 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isClaimed 
                                  ? 'bg-slate-700' 
                                  : isCompleted 
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                                    : 'bg-gradient-to-r from-orange-500 to-amber-400'
                              }`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Interactive trigger button */}
                        <div className="pt-2 border-t border-slate-900/60 flex items-center justify-end">
                          {isClaimed ? (
                            <button
                              disabled
                              className="text-[9px] font-mono font-bold uppercase py-1.5 px-3 rounded-lg bg-slate-900/40 text-slate-600 border border-slate-900/80 flex items-center gap-1 cursor-not-allowed"
                            >
                              <Check className="w-3 h-3 text-slate-600" /> Reward Claimed
                            </button>
                          ) : isCompleted ? (
                            <button
                              type="button"
                              onClick={() => handleClaimReward(m.id)}
                              className="text-[9px] font-mono font-black uppercase py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/10 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Trophy className="w-3 h-3 fill-current text-slate-950" /> Claim {m.rewardPoints} GP
                            </button>
                          ) : (
                            <button
                              disabled
                              className="text-[9px] font-mono font-bold uppercase py-1.5 px-3 rounded-lg bg-slate-950 text-slate-500 border border-slate-900 flex items-center gap-1 cursor-not-allowed"
                            >
                              Locked ({m.progress}/{m.target})
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Weapons' && (
            <div className="space-y-6 animate-fadeIn">
              <WeaponsDB 
                weapons={weapons}
                isAdmin={isAdmin}
                userEmail={user.email}
                onSelectWeapon={onSelectWeapon}
                onRefreshWeapons={onRefreshWeapons}
              />
            </div>
          )}

          {activeTab === ('VendorApplication' as any) && (
            <div className="space-y-6 animate-fadeIn">
              <VendorApplicationForm 
                currentUser={user}
                userEmail={user.email}
                onClose={() => setActiveTab('History')}
                onSuccess={(updatedUser) => {
                  onUpdateUser(updatedUser);
                  localStorage.setItem('ghostfire_user', JSON.stringify(updatedUser));
                  setActiveTab('History');
                }}
              />
            </div>
          )}

          {activeTab === ('VendorDashboard' as any) && (user.role === 'Vendor' || user.isVendor) && (
            <div className="space-y-6 animate-fadeIn">
              <VendorDashboard 
                currentUser={user} 
                userEmail={user.email}
                onUpdateUser={(updated) => {
                  onUpdateUser(updated);
                  localStorage.setItem('ghostfire_user', JSON.stringify(updated));
                }}
              />
            </div>
          )}
          </div>

          {/* Secure watermark disclaimer */}
          <div className="mt-8 pt-4 border-t border-slate-850 text-center text-[10px] text-slate-600 flex items-center justify-center gap-2">
            <Shield className="w-3.5 h-3.5 text-slate-700" />
            <span>Secured Session Token. Powered by GhostShield Encryption algorithm v2.4.0.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
