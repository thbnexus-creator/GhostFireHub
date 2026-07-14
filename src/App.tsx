import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Gamepad2, 
  User, 
  LogIn, 
  ShoppingBag, 
  Users, 
  Sliders, 
  Layout, 
  Smartphone, 
  Crown, 
  ShieldAlert, 
  FileText, 
  HelpCircle, 
  Mail, 
  BookOpen, 
  Info,
  ChevronRight,
  Flame,
  UserCheck,
  Menu,
  X,
  Search,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Device, Weapon, MarketplaceProduct, CommunityPost, UserProfile } from './types';
import AuthScreens from './components/AuthScreens';
import RecommendationEngine from './components/RecommendationEngine';
import HUDCanvas from './components/HUDCanvas';
import MarketplaceView from './components/MarketplaceView';
import DeviceDB from './components/DeviceDB';
import CommunitySection from './components/CommunitySection';
import PremiumUnlock from './components/PremiumUnlock';
import DashboardView from './components/DashboardView';
import InfoPages from './components/InfoPages';
import AdminWorkspace from './components/AdminWorkspace';
import SharedProfileView from './components/SharedProfileView';
import WeaponsDB from './components/WeaponsDB';
import SponsorAdPopup from './components/SponsorAdPopup';
import EsportsPipeline from './components/EsportsPipeline';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'Home' | 'HUD' | 'DeviceDB' | 'Weapons' | 'Community' | 'Marketplace' | 'Premium' | 'Profile' | 'Auth' | 'About' | 'Help' | 'Contact' | 'Privacy' | 'Terms' | 'AdminWorkspace' | 'Pipeline'>('Home');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHighVisibility, setIsHighVisibility] = useState(false);

  // Pop-up Ad States
  const [showPopupAd, setShowPopupAd] = useState(false);
  const [tabTransitionCount, setTabTransitionCount] = useState(0);

  // Backend Data States
  const [devicesList, setDevicesList] = useState<Device[]>([]);
  const [weaponsList, setWeaponsList] = useState<Weapon[]>([]);
  const [productsList, setProductsList] = useState<MarketplaceProduct[]>([]);
  const [postsList, setPostsList] = useState<CommunityPost[]>([]);

  // User Auth States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [globalTheme, setGlobalTheme] = useState<{ themePrimary: string; themeSecondary: string }>({ themePrimary: '#f97316', themeSecondary: '#f59e0b' });

  // Shared public profile states
  const [sharedProfileData, setSharedProfileData] = useState<any | null>(null);
  const [sharedProfileError, setSharedProfileError] = useState<string>('');
  const [loadingSharedProfile, setLoadingSharedProfile] = useState<boolean>(false);

  // Selected device back-and-forth buffer between database page and calibration engine
  const [selectedDeviceBuffer, setSelectedDeviceBuffer] = useState<Device | null>(null);

  // Selected weapon back-and-forth buffer between database page and calibration engine
  const [selectedWeaponBuffer, setSelectedWeaponBuffer] = useState<string | null>(null);

  // Load backend data lists
  const loadInitialData = async () => {
    try {
      fetch('/api/global-theme')
        .then(res => res.json())
        .then(data => {
          if (data && data.themePrimary && data.themeSecondary) {
            setGlobalTheme({ themePrimary: data.themePrimary, themeSecondary: data.themeSecondary });
          }
        })
        .catch(() => {});

      const devRes = await fetch('/api/devices');
      if (devRes.ok) setDevicesList(await devRes.json());

      const wepRes = await fetch('/api/weapons');
      if (wepRes.ok) setWeaponsList(await wepRes.json());

      const mktRes = await fetch('/api/marketplace');
      if (mktRes.ok) setProductsList(await mktRes.json());

      const postRes = await fetch('/api/posts');
      if (postRes.ok) setPostsList(await postRes.json());
    } catch (err) {
      console.error('Error fetching initial data from Express backend:', err);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Check local session state on mount
    const savedUser = localStorage.getItem('ghostfire_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        // Sync with backend to get latest points/missions
        fetch(`/api/user/${encodeURIComponent(parsed.email)}`)
          .then(res => {
            if (res.ok) return res.json();
            throw new Error();
          })
          .then(user => {
            setCurrentUser(user);
            localStorage.setItem('ghostfire_user', JSON.stringify(user));
          })
          .catch(() => {});
      } catch (e) {}
    }

    // Dynamic event listener for automated profile state synchronization
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setCurrentUser(customEvent.detail);
        localStorage.setItem('ghostfire_user', JSON.stringify(customEvent.detail));
        if (customEvent.detail.role === 'Administrator' && customEvent.detail.themePrimary) {
          setGlobalTheme({
            themePrimary: customEvent.detail.themePrimary,
            themeSecondary: customEvent.detail.themeSecondary
          });
        }
      }
    };
    window.addEventListener('user-profile-updated', handleProfileUpdate);

    // Parse share parameter
    const params = new URLSearchParams(window.location.search);
    const shareUser = params.get('share');
    if (shareUser) {
      setLoadingSharedProfile(true);
      fetch(`/api/public-profile/${encodeURIComponent(shareUser)}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(res.status === 403 ? 'This configuration profile is set to private by the owner.' : 'Tactical profile not found.');
          }
          return res.json();
        })
        .then(data => {
          setSharedProfileData(data);
        })
        .catch(err => {
          setSharedProfileError(err.message || 'Failed to load public profile.');
        })
        .finally(() => {
          setLoadingSharedProfile(false);
        });
    }

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, []);

  // Trigger Sponsor Ad Popup on tab transitions for non-administrators
  useEffect(() => {
    // Only show ads to non-administrators (members, vendors, and unregistered guests)
    const isAdmin = currentUser?.role === 'Administrator' || currentUser?.email === 'ghostfirehub@gmail.com' || currentUser?.email === 'ghostfire@ghost.com';
    if (isAdmin) return;

    // Skip trigger if they navigate to login screen or auth pages
    if (activeTab === 'Auth') return;

    setTabTransitionCount(prev => {
      const nextCount = prev + 1;
      // Trigger a popup ad on every 3rd tab transition (e.g., DeviceDB, Weapons, Marketplace)
      if (nextCount > 0 && nextCount % 3 === 0) {
        setShowPopupAd(true);
      }
      return nextCount;
    });
  }, [activeTab, currentUser]);

  // Periodic automatic Sponsor Ad Popup for unregistered guests (immediately and then dynamically after closing)
  useEffect(() => {
    if (currentUser) return; // Only for unregistered guest users

    // Load first ad upon entering (with a 2s delay to let the site load and be visible)
    const initialAdTimer = setTimeout(() => {
      setShowPopupAd(true);
    }, 2000);

    return () => {
      clearTimeout(initialAdTimer);
    };
  }, [currentUser]);

  // Dynamic ad pop-up recurrence cycle: 90 seconds of uninterrupted usage, then ad re-appears
  useEffect(() => {
    if (currentUser) return;
    if (!showPopupAd) {
      const adRecurrenceTimer = setTimeout(() => {
        setShowPopupAd(true);
      }, 90000); // 90 seconds (1.5 minutes) of clean, ad-free app usage
      return () => clearTimeout(adRecurrenceTimer);
    }
  }, [showPopupAd, currentUser]);

  // Auth triggers
  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('ghostfire_user', JSON.stringify(user));
    setActiveTab('Profile');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ghostfire_user');
    setActiveTab('Home');
  };

  // Add Device API trigger
  const handleAddDevice = async (newDevice: Partial<Device>): Promise<boolean> => {
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice)
      });
      if (res.ok) {
        const added = await res.json();
        setDevicesList(prev => [added, ...prev]);
        return true;
      }
    } catch (err) {}
    return false;
  };

  // Add Announcement Post API trigger
  const handleAddPost = async (newPost: Partial<CommunityPost>): Promise<boolean> => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      if (res.ok) {
        const addedData = await res.json();
        if (addedData.success && addedData.post) {
          setPostsList(prev => [addedData.post, ...prev]);
          return true;
        }
      }
    } catch (err) {}
    return false;
  };

  // Edit Announcement Post API trigger
  const handleEditPost = async (postId: string, updatedPost: Partial<CommunityPost>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPost)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.post) {
          setPostsList(prev => prev.map(p => p.id === postId ? data.post : p));
          return true;
        }
      }
    } catch (err) {}
    return false;
  };

  // Delete Announcement Post API trigger
  const handleDeletePost = async (postId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setPostsList(prev => prev.filter(p => p.id !== postId));
        return true;
      }
    } catch (err) {}
    return false;
  };

  // Add Product to Marketplace trigger
  const handleAddProduct = async (newProduct: Partial<MarketplaceProduct>): Promise<boolean> => {
    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.product) {
          setProductsList(prev => [...prev, data.product]);
          return true;
        }
      }
    } catch (err) {}
    return false;
  };

  // Edit Product in Marketplace trigger
  const handleEditProduct = async (productId: string, updatedProduct: Partial<MarketplaceProduct>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/marketplace/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.product) {
          setProductsList(prev => prev.map(p => p.id === productId ? data.product : p));
          return true;
        }
      }
    } catch (err) {}
    return false;
  };

  // Delete Product from Marketplace trigger
  const handleDeleteProduct = async (productId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/marketplace/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProductsList(prev => prev.filter(p => p.id !== productId));
        return true;
      }
    } catch (err) {}
    return false;
  };

  // Use specs trigger from Catalog
  const handleUseDeviceSpecsInEngine = (device: Device) => {
    setSelectedDeviceBuffer(device);
    setActiveTab('Home');
  };

  const handleToggleBookmark = async (type: 'preset' | 'product', id: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/user/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, type, id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('ghostfire_user', JSON.stringify(data.user));
        }
      }
    } catch (e) {
      console.error('Error toggling bookmark:', e);
    }
  };

  const isAdmin = currentUser?.role === 'Administrator' || currentUser?.role === 'Staff' || currentUser?.email === 'ghostfirehub@gmail.com' || currentUser?.email === 'ghostfire@ghost.com';

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col selection:bg-orange-500/30 selection:text-orange-200 ${isHighVisibility ? 'high-visibility' : ''}`}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --theme-primary: ${globalTheme.themePrimary};
          --theme-secondary: ${globalTheme.themeSecondary};
          
          --theme-primary-hover: color-mix(in srgb, var(--theme-primary) 85%, black);
          --theme-primary-dark: color-mix(in srgb, var(--theme-primary) 70%, black);
          --theme-primary-light: color-mix(in srgb, var(--theme-primary) 85%, white);
          
          --theme-secondary-hover: color-mix(in srgb, var(--theme-secondary) 85%, black);
        }

        /* Background overrides */
        .bg-orange-500 { background-color: var(--theme-primary) !important; }
        .bg-orange-600 { background-color: var(--theme-primary-hover) !important; }
        .bg-orange-700 { background-color: var(--theme-primary-dark) !important; }
        .hover\\:bg-orange-500:hover { background-color: var(--theme-primary) !important; }
        .hover\\:bg-orange-600:hover { background-color: var(--theme-primary-hover) !important; }
        .hover\\:bg-orange-700:hover { background-color: var(--theme-primary-dark) !important; }

        /* Text overrides */
        .text-orange-400 { color: var(--theme-primary-light) !important; }
        .text-orange-500 { color: var(--theme-primary) !important; }
        .text-orange-600 { color: var(--theme-primary-hover) !important; }
        .hover\\:text-orange-400:hover { color: var(--theme-primary-light) !important; }
        .hover\\:text-orange-500:hover { color: var(--theme-primary) !important; }
        .hover\\:text-orange-300:hover { color: var(--theme-primary-light) !important; }

        /* Border overrides */
        .border-orange-500 { border-color: var(--theme-primary) !important; }
        .border-orange-600 { border-color: var(--theme-primary-hover) !important; }
        .focus\\:border-orange-500:focus { border-color: var(--theme-primary) !important; }
        .hover\\:border-orange-500\\/40:hover { border-color: color-mix(in srgb, var(--theme-primary) 40%, transparent) !important; }

        /* Opacity overlays */
        .bg-orange-500\\/10 { background-color: color-mix(in srgb, var(--theme-primary) 10%, transparent) !important; }
        .bg-orange-600\\/10 { background-color: color-mix(in srgb, var(--theme-primary-hover) 10%, transparent) !important; }
        .border-orange-500\\/20 { border-color: color-mix(in srgb, var(--theme-primary) 20%, transparent) !important; }
        .selection\\:bg-orange-500\\/30::selection { background-color: color-mix(in srgb, var(--theme-primary) 30%, transparent) !important; }
        .bg-orange-600\\/5 { background-color: color-mix(in srgb, var(--theme-primary-hover) 5%, transparent) !important; }
        .shadow-orange-500\\/5 { --tw-shadow-color: color-mix(in srgb, var(--theme-primary) 5%, transparent) !important; }
        .shadow-orange-600\\/15 { --tw-shadow-color: color-mix(in srgb, var(--theme-primary-hover) 15%, transparent) !important; }
        .shadow-orange-500\\/10 { --tw-shadow-color: color-mix(in srgb, var(--theme-primary) 10%, transparent) !important; }

        /* Gradients */
        .from-orange-500 { --tw-gradient-from: var(--theme-primary) !important; --tw-gradient-to: var(--theme-primary) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
        .to-amber-500 { --tw-gradient-to: var(--theme-secondary) !important; }
        .from-orange-600 { --tw-gradient-from: var(--theme-primary-hover) !important; }
        .to-amber-600 { --tw-gradient-to: var(--theme-secondary-hover) !important; }

        /* Secondary overrides */
        .text-amber-500 { color: var(--theme-secondary) !important; }
        .text-amber-400 { color: color-mix(in srgb, var(--theme-secondary) 85%, white) !important; }
        .hover\\:text-amber-400:hover { color: color-mix(in srgb, var(--theme-secondary) 85%, white) !important; }
        .bg-amber-500 { background-color: var(--theme-secondary) !important; }
        .bg-amber-500\\/10 { background-color: color-mix(in srgb, var(--theme-secondary) 10%, transparent) !important; }
        .border-amber-500 { border-color: var(--theme-secondary) !important; }
        .border-amber-500\\/20 { border-color: color-mix(in srgb, var(--theme-secondary) 20%, transparent) !important; }
      ` }} />

      {/* Top Gaming Navigation Header bar */}
      <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 px-4 py-3 lg:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-3">
          
          {/* Logo & Slogan */}
          <button 
            onClick={() => setActiveTab('Home')}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
          >
            <div className="p-2.5 bg-gradient-to-br from-orange-600 via-red-600 to-amber-500 rounded-xl shadow-lg shadow-orange-600/15 group-hover:brightness-110 transition-all">
              <Gamepad2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-sm sm:text-md font-black tracking-wider text-white uppercase flex items-center gap-1.5 leading-none">
                GhostFireHub
              </h1>
              <span className="text-[9px] text-orange-500 font-mono font-black uppercase tracking-widest leading-none mt-0.5 block">
                Powered by GhostCore™
              </span>
            </div>
          </button>

          {/* Global search input (Header) */}
          <div className="relative hidden lg:block max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, posts, devices..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-3 py-1.5 text-[11px] text-slate-200 outline-none focus:border-orange-500 transition-colors placeholder:text-slate-700 font-medium"
            />
            {searchQuery && (
              <div className="absolute top-full mt-2 w-72 left-0 bg-slate-900/95 border border-slate-850 rounded-2xl shadow-2xl p-3 flex flex-col gap-3 backdrop-blur-xl z-50">
                <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Instant Matches</span>
                  <button onClick={() => setSearchQuery('')} className="text-[9px] text-slate-500 hover:text-slate-300 uppercase font-mono">Clear</button>
                </div>
                
                {/* Products category */}
                {productsList.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                  <div>
                    <h4 className="text-[8px] font-black text-orange-500 uppercase tracking-widest mb-1">Marketplace</h4>
                    <div className="space-y-1">
                      {productsList.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 2).map(product => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setActiveTab('Marketplace');
                          }}
                          className="w-full text-left p-1.5 hover:bg-slate-950/40 rounded-lg text-[10px] text-slate-300 hover:text-white transition-colors block truncate"
                        >
                          🛍️ {product.name} — <span className="text-orange-400 font-mono font-bold">${product.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posts category */}
                {postsList.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                  <div>
                    <h4 className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Community Drops</h4>
                    <div className="space-y-1">
                      {postsList.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 2).map(post => (
                        <button
                          key={post.id}
                          onClick={() => {
                            setActiveTab('Community');
                          }}
                          className="w-full text-left p-1.5 hover:bg-slate-950/40 rounded-lg text-[10px] text-slate-300 hover:text-white transition-colors block truncate"
                        >
                          💬 {post.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Devices category */}
                {devicesList.filter(d => d.brand.toLowerCase().includes(searchQuery.toLowerCase()) || d.model.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                  <div>
                    <h4 className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Devices DB</h4>
                    <div className="space-y-1">
                      {devicesList.filter(d => d.brand.toLowerCase().includes(searchQuery.toLowerCase()) || d.model.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 2).map(device => (
                        <button
                          key={device.id}
                          onClick={() => {
                            setActiveTab('DeviceDB');
                          }}
                          className="w-full text-left p-1.5 hover:bg-slate-950/40 rounded-lg text-[10px] text-slate-300 hover:text-white transition-colors block truncate"
                        >
                          📱 {device.brand} {device.model}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Default no matches */}
                {productsList.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
                 postsList.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
                 devicesList.filter(d => d.model.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                   <span className="text-[10px] text-slate-500 italic text-center py-2">No matching items found.</span>
                 )}
              </div>
            )}
          </div>

          {/* Core App Navigation Buttons (Desktop only) */}
          <nav className="hidden md:flex flex-wrap gap-1 bg-slate-950 border border-slate-850 p-1 rounded-2xl text-[11px] font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('Home')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'Home' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>GhostCore™</span>
            </button>

            <button
              onClick={() => setActiveTab('HUD')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'HUD' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>HUD Builder</span>
            </button>

            <button
              onClick={() => setActiveTab('DeviceDB')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'DeviceDB' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Devices</span>
            </button>

            <button
              onClick={() => setActiveTab('Community')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'Community' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Community</span>
            </button>

            <button
              onClick={() => setActiveTab('Marketplace')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'Marketplace' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Marketplace</span>
            </button>

            <button
              onClick={() => setActiveTab('Pipeline')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'Pipeline' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>

            <button
              onClick={() => setActiveTab('Premium')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'Premium' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-amber-500 hover:text-amber-400'}`}
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>Premium</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('AdminWorkspace')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'AdminWorkspace' ? 'bg-red-600/20 border border-red-500/30 text-red-400 font-extrabold shadow' : 'text-red-400 hover:text-red-300'}`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Workspace</span>
              </button>
            )}
          </nav>

          {/* User Status / Login Module (Desktop) & Mobile Hamburger button */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setIsHighVisibility(prev => !prev)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
                title={isHighVisibility ? "Switch to Stealth Mode" : "Switch to High Visibility"}
              >
                <span>{isHighVisibility ? '👁️ Stealth' : '👁️ High Viz'}</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('AdminWorkspace')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-red-950/60 transition-all cursor-pointer ${activeTab === 'AdminWorkspace' ? 'border-red-500' : ''}`}
                  title="Open Administrative Control Center"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span>Admin Ops</span>
                </button>
              )}
              {currentUser ? (
                <button
                  onClick={() => setActiveTab('Profile')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer ${activeTab === 'Profile' ? 'border-orange-500 text-orange-400' : ''}`}
                >
                  <UserCheck className="w-4 h-4 text-orange-500" />
                  <span className="max-w-[80px] truncate">{currentUser.username}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setActiveTab('Auth');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Join Hub</span>
                </button>
              )}
            </div>

            {/* Hamburger trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 bg-slate-950 border border-slate-850 hover:border-orange-500/40 rounded-xl text-slate-400 hover:text-orange-400 transition-all cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Slide-out mobile drawer menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop shadow overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 pointer-events-auto backdrop-blur-sm"
            />
            {/* Drawer layout block */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 180 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-slate-950 border-l border-slate-900 z-50 p-6 flex flex-col justify-between overflow-y-auto shadow-2xl shadow-orange-500/5 text-xs text-white"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                  <span className="text-[10px] text-orange-500 font-mono font-black uppercase tracking-widest">
                    GHOSTCORE™ SYSTEM MENU
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  <button
                    onClick={() => { setActiveTab('Home'); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase tracking-wider ${activeTab === 'Home' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>GhostCore™ Engine</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('HUD'); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase tracking-wider ${activeTab === 'HUD' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
                  >
                    <Layout className="w-4 h-4" />
                    <span>HUD Builder</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('DeviceDB'); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase tracking-wider ${activeTab === 'DeviceDB' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Devices Database</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('Community'); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase tracking-wider ${activeTab === 'Community' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Community Drop</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('Marketplace'); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase tracking-wider ${activeTab === 'Marketplace' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Marketplace</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('Pipeline'); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase tracking-wider ${activeTab === 'Pipeline' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Games Pipeline</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('Premium'); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase tracking-wider ${activeTab === 'Premium' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-amber-500 hover:bg-slate-900/40 hover:text-amber-400'}`}
                  >
                    <Crown className="w-4 h-4 fill-current" />
                    <span>Premium License</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => { setActiveTab('AdminWorkspace'); setIsMobileMenuOpen(false); }}
                      className={`px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase tracking-wider ${activeTab === 'AdminWorkspace' ? 'bg-red-600/20 border border-red-500/30 text-red-400 font-extrabold shadow' : 'text-red-400 hover:bg-slate-900/40 hover:text-red-300'}`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Admin Ops Room</span>
                    </button>
                  )}

                  <button
                    onClick={() => { setIsHighVisibility(prev => !prev); setIsMobileMenuOpen(false); }}
                    className="px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
                  >
                    <span>👁️</span>
                    <span>{isHighVisibility ? 'Switch to Stealth Mode' : 'Switch to High Visibility'}</span>
                  </button>
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-900">
                {currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center font-black text-slate-950 text-sm">
                        {currentUser.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {currentUser.username}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {currentUser.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setActiveTab('Profile'); setIsMobileMenuOpen(false); }}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-center font-semibold text-slate-300 transition-all cursor-pointer"
                    >
                      Profile & Configurations
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setActiveTab('Auth');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-slate-950 font-black uppercase tracking-wider rounded-xl text-center shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Join Hub</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Display on Calibration Workspace Tab */}
      {activeTab === 'Home' && (
        <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-900 py-10 px-4 relative overflow-hidden text-center">
          {/* Abstract vector rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-[9px] px-2.5 py-1 rounded-full uppercase font-bold tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" /> esports sensory simulations
            </span>
            <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
              Smart sensitivity recommendations for every device.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto font-sans">
              Find personalized game setting recommendations tailored to your device, play style, resolution, and tactile setups. Zero hack codes. Just legitimate precision.
            </p>
          </div>
        </section>
      )}

      {/* Main Body Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
        
        {/* SHARED PROFILE SHOWCASE INTERCEPT */}
        {loadingSharedProfile && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-pulse">
            <div className="w-10 h-10 border-4 border-t-orange-500 border-slate-850 rounded-full animate-spin"></div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              Retrieving community configuration profile...
            </p>
          </div>
        )}

        {!loadingSharedProfile && sharedProfileError && (
          <div className="max-w-md mx-auto p-6 bg-slate-950/80 border border-slate-850 rounded-3xl text-center space-y-4 animate-fadeIn">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Access Denied</h3>
              <p className="text-xs text-slate-400">{sharedProfileError}</p>
            </div>
            <button
              onClick={() => {
                setSharedProfileError('');
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer w-full"
            >
              Back to Calibration Center
            </button>
          </div>
        )}

        {!loadingSharedProfile && !sharedProfileError && sharedProfileData && (
          <SharedProfileView
            data={sharedProfileData}
            currentUser={currentUser}
            onClose={() => {
              setSharedProfileData(null);
              window.history.replaceState({}, document.title, window.location.pathname);
            }}
            onCloneSuccess={(updatedUser) => {
              setCurrentUser(updatedUser);
              localStorage.setItem('ghostfire_user', JSON.stringify(updatedUser));
            }}
            onNavigateToAuth={() => {
              setAuthMode('login');
              setActiveTab('Auth');
            }}
          />
        )}

        {/* REGULAR TAB DISPLAYS */}
        {!loadingSharedProfile && !sharedProfileError && !sharedProfileData && (
          <>
            {/* 1. CALIBRATION ENGINE (GHOSTCORE) */}
            {activeTab === 'Home' && (
              <div className="animate-fadeIn">
                <RecommendationEngine 
                  userEmail={currentUser?.email}
                  currentUser={currentUser}
                  onSaveSuccess={() => {}}
                  weaponsList={weaponsList}
                  devicesList={devicesList}
                  selectedDeviceFromDB={selectedDeviceBuffer}
                  clearSelectedDevice={() => setSelectedDeviceBuffer(null)}
                  selectedWeaponFromDB={selectedWeaponBuffer}
                  clearSelectedWeapon={() => setSelectedWeaponBuffer(null)}
                  onToggleBookmark={handleToggleBookmark}
                  bookmarkedPresetIds={currentUser?.bookmarkedPresets || []}
                />
              </div>
            )}

            {/* 2. HUD WORKSPACE */}
            {activeTab === 'HUD' && (
              <div className="animate-fadeIn">
                <HUDCanvas 
                  userEmail={currentUser?.email}
                />
              </div>
            )}

            {/* 3. DEVICE DB */}
            {activeTab === 'DeviceDB' && (
              <div className="animate-fadeIn">
                <DeviceDB 
                  devices={devicesList}
                  onDeviceSelected={handleUseDeviceSpecsInEngine}
                  onAddDevice={handleAddDevice}
                  isAdmin={isAdmin}
                  initialSearchQuery={searchQuery}
                />
              </div>
            )}

            {/* 4. COMMUNITY FEED */}
            {activeTab === 'Community' && (
              <div className="animate-fadeIn">
                <CommunitySection 
                  posts={postsList}
                  onAddPost={handleAddPost}
                  onEditPost={handleEditPost}
                  onDeletePost={handleDeletePost}
                  isAdmin={isAdmin}
                  userEmail={currentUser?.email || ''}
                  initialSearchQuery={searchQuery}
                  onRefreshPosts={loadInitialData}
                />
              </div>
            )}

            {/* 5. MARKETPLACE */}
            {activeTab === 'Marketplace' && (
              <div className="animate-fadeIn">
                <MarketplaceView 
                  products={productsList}
                  userEmail={currentUser?.email}
                  currentUser={currentUser}
                  onAddProduct={handleAddProduct}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  initialSearchQuery={searchQuery}
                  onToggleBookmark={handleToggleBookmark}
                  bookmarkedProductIds={currentUser?.bookmarkedProducts || []}
                  onUpdateUser={setCurrentUser}
                />
              </div>
            )}

            {/* GAMES PIPELINE EXPORTS ROADMAP */}
            {activeTab === 'Pipeline' && (
              <div className="animate-fadeIn">
                <EsportsPipeline 
                  userEmail={currentUser?.email}
                  userName={currentUser?.username}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {/* 6. GHOSTCORE PREMIUM */}
            {activeTab === 'Premium' && (
              <div className="animate-fadeIn">
                <PremiumUnlock 
                  userEmail={currentUser?.email}
                  currentUser={currentUser || undefined}
                  onUpdateUser={setCurrentUser}
                />
              </div>
            )}

            {/* 7. PROFILE & HISTORY */}
            {activeTab === 'Profile' && currentUser && (
              <div className="animate-fadeIn">
                <DashboardView 
                  user={currentUser}
                  onUpdateUser={(updated) => {
                    setCurrentUser(updated);
                    localStorage.setItem('ghostfire_user', JSON.stringify(updated));
                  }}
                  onLogout={handleLogout}
                  weapons={weaponsList}
                  isAdmin={isAdmin}
                  onSelectWeapon={(wName) => {
                    setSelectedWeaponBuffer(wName);
                    setActiveTab('Home');
                  }}
                  onRefreshWeapons={loadInitialData}
                />
              </div>
            )}

            {/* 8. AUTH SCREENS */}
            {activeTab === 'Auth' && (
              <div className="animate-fadeIn flex justify-center py-6">
                <AuthScreens 
                  mode={authMode}
                  onAuthSuccess={handleAuthSuccess}
                  onNavigateToRegister={() => setAuthMode('register')}
                  onNavigateToLogin={() => setAuthMode('login')}
                  onNavigateToForgot={() => setAuthMode('forgot')}
                />
              </div>
            )}

            {/* 10. CENTRALIZED ADMIN WORKSPACE */}
            {activeTab === 'AdminWorkspace' && isAdmin && (
              <div className="animate-fadeIn">
                <AdminWorkspace
                  products={productsList}
                  posts={postsList}
                  onAddProduct={handleAddProduct}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onAddPost={handleAddPost}
                  onEditPost={handleEditPost}
                  onDeletePost={handleDeletePost}
                  userEmail={currentUser?.email}
                />
              </div>
            )}

            {/* 9. INFORMATIONAL STATIC PAGES */}
            {(activeTab === 'About' || activeTab === 'Help' || activeTab === 'Contact' || activeTab === 'Privacy' || activeTab === 'Terms') && (
              <div className="animate-fadeIn">
                <InfoPages page={activeTab as any} />
              </div>
            )}
          </>
        )}

      </main>

      {/* Global Bottom Footer Info */}
      <footer className="border-t border-slate-900 bg-slate-950 p-6 text-slate-500 mt-auto">
        <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 bg-slate-900 border border-slate-850 text-orange-500 rounded-lg">
              <Gamepad2 className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div className="font-bold text-slate-300 text-xs uppercase tracking-wider">GhostFireHub esports calibrations</div>
              <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed max-w-xs">
                Precision tactile sensory diagnostics for competitive shooters. Free of cheating programs.
              </p>
            </div>
          </div>

          {/* Static Footnotes Links */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <button onClick={() => setActiveTab('About')} className="hover:text-white transition-colors cursor-pointer">About Us</button>
            <button onClick={() => setActiveTab('Help')} className="hover:text-white transition-colors cursor-pointer">FAQs Help Center</button>
            <button onClick={() => setActiveTab('Contact')} className="hover:text-white transition-colors cursor-pointer">Contact Support</button>
            <button onClick={() => setActiveTab('Privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => setActiveTab('Terms')} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
          </div>

        </div>

        <div className="max-w-7xl w-full mx-auto border-t border-slate-900/60 mt-5 pt-4 text-center text-[10px] text-slate-600 font-mono">
          © 2026 GhostFireHub. Handcrafted for next-generation mobile shooters. All rights reserved.
        </div>
      </footer>

      {/* Interactive Sponsor Ad Dialog */}
      <AnimatePresence>
        {showPopupAd && (
          <SponsorAdPopup 
            currentUser={currentUser} 
            onAdClose={() => setShowPopupAd(false)} 
            onNavigateToAuth={() => {
              setShowPopupAd(false);
              setActiveTab('Auth');
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
