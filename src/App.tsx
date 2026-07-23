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
import { UniversalSearchModal } from './components/UniversalSearchModal';
import WeaponsDB from './components/WeaponsDB';
import EsportsPipeline from './components/EsportsPipeline';
import SplashAndOnboarding from './components/SplashAndOnboarding';
import HomeDashboardView from './components/HomeDashboardView';
import GenerateWorkspace from './components/GenerateWorkspace';

import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  getGlobalTheme, 
  getDevices, 
  getWeapons, 
  getMarketplaceProducts, 
  getCommunityPosts, 
  getUserProfile, 
  updateUserProfile,
  addDevice,
  addCommunityPost,
  editCommunityPost,
  deleteCommunityPost,
  addMarketplaceProduct,
  editMarketplaceProduct,
  deleteMarketplaceProduct,
  findUserByEmailOrUsername,
  findUidByEmail,
  initializeSettings
} from './lib/dbService';

export default function App() {
  // Navigation State
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem('ghostfire_onboarded') !== 'true');
  const [activeTab, setActiveTab] = useState<'Home' | 'Generate' | 'HUD' | 'DeviceDB' | 'Weapons' | 'Community' | 'Marketplace' | 'Premium' | 'Profile' | 'Auth' | 'About' | 'Help' | 'Contact' | 'Privacy' | 'Terms' | 'AdminWorkspace' | 'Pipeline'>('Home');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isHighVisibility, setIsHighVisibility] = useState(false);

  // Global Cmd+K / Ctrl+K listener for Universal Search Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      // Gracefully initialize settings documents if missing (PART 7)
      await initializeSettings();

      const theme = await getGlobalTheme();
      if (theme && theme.themePrimary) {
        setGlobalTheme(theme);
      }

      const devs = await getDevices();
      setDevicesList(devs);

      const weps = await getWeapons();
      setWeaponsList(weps);

      const prods = await getMarketplaceProducts();
      setProductsList(prods);

      const posts = await getCommunityPosts();
      setPostsList(posts);
    } catch (err) {
      console.error('Error fetching initial data from Firestore:', err);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Check local session state on mount & synchronize with Firebase auth
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem('ghostfire_user', JSON.stringify(profile));
            if (profile.themePrimary && profile.themeSecondary) {
              setGlobalTheme({
                themePrimary: profile.themePrimary,
                themeSecondary: profile.themeSecondary
              });
            }
          }
        } catch (e) {
          console.error('Error syncing authenticated user profile:', e);
        }
      } else {
        // Fallback to local storage if offline or not logged in yet
        const savedUser = localStorage.getItem('ghostfire_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            setCurrentUser(parsed);
          } catch (e) {}
        }
      }
    });

    // Dynamic event listener for automated profile state synchronization
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setCurrentUser(customEvent.detail);
        localStorage.setItem('ghostfire_user', JSON.stringify(customEvent.detail));
        if (customEvent.detail.themePrimary) {
          setGlobalTheme({
            themePrimary: customEvent.detail.themePrimary,
            themeSecondary: customEvent.detail.themeSecondary
          });
        }
      }
    };
    window.addEventListener('user-profile-updated', handleProfileUpdate);

    // Parse share parameter to view custom public configurations
    const params = new URLSearchParams(window.location.search);
    const shareUser = params.get('share');
    if (shareUser) {
      setLoadingSharedProfile(true);
      
      const lookupAndLoadProfile = async () => {
        try {
          // Find user by username or email in Firestore
          const matchedUser = await findUserByEmailOrUsername(shareUser);
          if (!matchedUser) {
            throw new Error('Tactical profile not found.');
          }

          if (!matchedUser.isProfilePublic) {
            throw new Error('This configuration profile is set to private by the owner.');
          }

          setSharedProfileData(matchedUser);
        } catch (err: any) {
          setSharedProfileError(err.message || 'Failed to load public profile.');
        } finally {
          setLoadingSharedProfile(false);
        }
      };

      lookupAndLoadProfile();
    }

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
      unsubscribeAuth();
    };
  }, []);

  // Modular feature flag for advertisements - set to true to enable, false to disable
  const ENABLE_ADS = false;

  // Trigger Sponsor Ad Popup on tab transitions for non-administrators
  useEffect(() => {
    if (!ENABLE_ADS) return;
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
  }, [activeTab, currentUser, ENABLE_ADS]);

  // Periodic automatic Sponsor Ad Popup for unregistered guests (immediately and then dynamically after closing)
  useEffect(() => {
    if (!ENABLE_ADS) return;
    if (currentUser) return; // Only for unregistered guest users

    // Load first ad upon entering (with a 2s delay to let the site load and be visible)
    const initialAdTimer = setTimeout(() => {
      setShowPopupAd(true);
    }, 2000);

    return () => {
      clearTimeout(initialAdTimer);
    };
  }, [currentUser, ENABLE_ADS]);

  // Dynamic ad pop-up recurrence cycle: 90 seconds of uninterrupted usage, then ad re-appears
  useEffect(() => {
    if (!ENABLE_ADS) return;
    if (currentUser) return;
    if (!showPopupAd) {
      const adRecurrenceTimer = setTimeout(() => {
        setShowPopupAd(true);
      }, 90000); // 90 seconds (1.5 minutes) of clean, ad-free app usage
      return () => clearTimeout(adRecurrenceTimer);
    }
  }, [showPopupAd, currentUser, ENABLE_ADS]);

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
      const added = await addDevice(newDevice);
      if (added) {
        setDevicesList(prev => [added, ...prev]);
        return true;
      }
    } catch (err) {}
    return false;
  };

  // Add Announcement Post API trigger
  const handleAddPost = async (newPost: Partial<CommunityPost>): Promise<boolean> => {
    try {
      const added = await addCommunityPost(newPost);
      if (added) {
        setPostsList(prev => [added, ...prev]);
        return true;
      }
    } catch (err) {}
    return false;
  };

  // Edit Announcement Post API trigger
  const handleEditPost = async (postId: string, updatedPost: Partial<CommunityPost>): Promise<boolean> => {
    try {
      const updated = await editCommunityPost(postId, updatedPost);
      if (updated) {
        setPostsList(prev => prev.map(p => p.id === postId ? updated : p));
        return true;
      }
    } catch (err) {}
    return false;
  };

  // Delete Announcement Post API trigger
  const handleDeletePost = async (postId: string): Promise<boolean> => {
    try {
      const success = await deleteCommunityPost(postId);
      if (success) {
        setPostsList(prev => prev.filter(p => p.id !== postId));
        return true;
      }
    } catch (err) {}
    return false;
  };

  // Add Product to Marketplace trigger
  const handleAddProduct = async (newProduct: Partial<MarketplaceProduct>): Promise<boolean> => {
    try {
      const added = await addMarketplaceProduct(newProduct);
      if (added) {
        setProductsList(prev => [...prev, added]);
        return true;
      }
    } catch (err) {}
    return false;
  };

  // Edit Product in Marketplace trigger
  const handleEditProduct = async (productId: string, updatedProduct: Partial<MarketplaceProduct>): Promise<boolean> => {
    try {
      const updated = await editMarketplaceProduct(productId, updatedProduct);
      if (updated) {
        setProductsList(prev => prev.map(p => p.id === productId ? updated : p));
        return true;
      }
    } catch (err) {}
    return false;
  };

  // Delete Product from Marketplace trigger
  const handleDeleteProduct = async (productId: string): Promise<boolean> => {
    try {
      const success = await deleteMarketplaceProduct(productId);
      if (success) {
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
      let uid = auth.currentUser?.uid;
      if (!uid && currentUser.email) {
        // Query uid from email
        const fetchedUid = await findUidByEmail(currentUser.email);
        if (fetchedUid) uid = fetchedUid;
      }
      if (!uid) return;

      const isBookmarked = type === 'preset'
        ? currentUser.bookmarkedPresets?.includes(id)
        : currentUser.bookmarkedProducts?.includes(id);

      const field = type === 'preset' ? 'bookmarkedPresets' : 'bookmarkedProducts';
      const currentList = currentUser[field] || [];
      const updatedList = isBookmarked
        ? currentList.filter(x => x !== id)
        : [...currentList, id];

      const updated = await updateUserProfile(uid, {
        [field]: updatedList
      });

      if (updated) {
        setCurrentUser(updated);
        localStorage.setItem('ghostfire_user', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Error toggling bookmark:', e);
    }
  };

  const isAdmin = currentUser?.role === 'Administrator' || currentUser?.role === 'Staff' || currentUser?.email === 'ghostfirehub@gmail.com' || currentUser?.email === 'ghostfire@ghost.com';

  const getActiveTheme = () => {
    if (currentUser?.selectedTheme === 'Midnight Neon Blue') {
      return { themePrimary: '#06b6d4', themeSecondary: '#3b82f6' };
    }
    if (currentUser?.selectedTheme === 'Premium Black Gold') {
      return { themePrimary: '#D4AF37', themeSecondary: '#F5E6A9' };
    }
    if (currentUser?.selectedTheme === 'Default') {
      return globalTheme;
    }
    if (currentUser?.themePrimary && currentUser?.themeSecondary) {
      return { themePrimary: currentUser.themePrimary, themeSecondary: currentUser.themeSecondary };
    }
    return globalTheme;
  };

  const activeTheme = getActiveTheme();

  if (showOnboarding) {
    return <SplashAndOnboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col selection:bg-orange-500/30 selection:text-orange-200 ${isHighVisibility ? 'high-visibility' : ''}`}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --theme-primary: ${activeTheme.themePrimary};
          --theme-secondary: ${activeTheme.themeSecondary};
          
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

        ${globalTheme.themePrimary.toLowerCase() === '#d4af37' ? `
          /* PREMIUM BLACK & GOLD THEME OVERRIDES */
          body, .bg-slate-950, .min-h-screen {
            background-color: #050505 !important;
            color: #FFFFFF !important;
          }
          .bg-slate-900, .bg-slate-900\\/60, .bg-slate-900\\/50, .bg-slate-900\\/95 {
            background-color: #121212 !important;
          }
          .bg-slate-850, .bg-slate-950\\/40, .bg-slate-950\\/60, .bg-slate-900\\/80, .bg-slate-900\\/40, .bg-slate-950\\/20 {
            background-color: #181818 !important;
          }
          
          /* Cards & Panels Premium Borders */
          .border-slate-900, .border-slate-850, .border-slate-800, .border-slate-900\\/80, .border-slate-800\\/40, .border-slate-850\\/80 {
            border-color: rgba(212, 175, 55, 0.18) !important;
          }
          .rounded-2xl.border, .rounded-xl.border, .bg-slate-900, .bg-slate-850 {
            border-color: rgba(212, 175, 55, 0.18) !important;
          }
          
          /* Elegant Gold Glow on primary actions and buttons */
          .bg-orange-500, .bg-orange-600, .bg-amber-500, .bg-orange-500-gradient {
            box-shadow: 0 0 12px rgba(212, 175, 55, 0.35) !important;
            border: 1px solid rgba(255, 215, 0, 0.45) !important;
            background: linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #FFD700 100%) !important;
            color: #050505 !important;
            font-weight: 900 !important;
          }
          .bg-orange-500:hover, .bg-orange-600:hover, .bg-amber-500:hover {
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.6) !important;
            border: 1px solid rgba(255, 215, 0, 0.7) !important;
            filter: brightness(1.1) !important;
          }
          
          /* Progress bars with animated gold gradients */
          .h-full.bg-gradient-to-r {
            background: linear-gradient(90deg, #B8860B 0%, #D4AF37 50%, #FFD700 100%) !important;
            background-size: 200% auto !important;
            animation: goldWave 3s linear infinite !important;
          }
          @keyframes goldWave {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          /* Success, Warning, Error Overrides */
          .text-emerald-500, .text-green-500, .text-emerald-400 { color: #37D67A !important; }
          .text-yellow-500, .text-amber-500, .text-yellow-400 { color: #F4B400 !important; }
          .text-red-500, .text-red-400 { color: #EA4335 !important; }
          .bg-emerald-500 { background-color: #37D67A !important; }
          .bg-yellow-500 { background-color: #F4B400 !important; }
          .bg-red-500 { background-color: #EA4335 !important; }

          /* Metallic gold badges automatic display */
          .metallic-gold-badge, .border-amber-500\\/20.text-amber-500, .bg-amber-500\\/10 {
            background: linear-gradient(135deg, #FFF8DC 0%, #D4AF37 50%, #B8860B 100%) !important;
            color: #050505 !important;
            border: 1px solid #FFD700 !important;
            box-shadow: 0 0 8px rgba(212, 175, 55, 0.5) !important;
            font-weight: 900 !important;
          }
        ` : ''}
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

          {/* Global search trigger (Header) */}
          <div className="relative hidden lg:block max-w-xs w-full">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center justify-between w-full bg-slate-950 border border-slate-850 hover:border-orange-500/50 rounded-xl px-3 py-1.5 text-[11px] text-slate-400 font-medium transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-slate-500 group-hover:text-orange-400 transition-colors" />
                <span>Search products, devices, guns...</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[9px] font-mono font-bold text-slate-500 rounded">⌘K</kbd>
            </button>
          </div>

          {/* Core App Navigation Buttons (Desktop only) */}
          <nav className="hidden md:flex flex-wrap gap-1 bg-slate-950 border border-slate-850 p-1 rounded-2xl text-[11px] font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('Home')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'Home' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('Generate')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'Generate' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Generate</span>
            </button>

            <button
              onClick={() => setActiveTab('Marketplace')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'Marketplace' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Marketplace</span>
            </button>

            <button
              onClick={() => setActiveTab('Community')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'Community' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Community</span>
            </button>

            <button
              onClick={() => {
                if (currentUser) {
                  setActiveTab('Profile');
                } else {
                  setAuthMode('login');
                  setActiveTab('Auth');
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'Profile' || activeTab === 'Auth' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('Premium')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'Premium' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-amber-500 hover:text-amber-400'}`}
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>Premium</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('AdminWorkspace')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'AdminWorkspace' ? 'bg-red-600/20 border border-red-500/30 text-red-400 font-extrabold shadow' : 'text-red-400 hover:text-red-300'}`}
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
                    <Gamepad2 className="w-4 h-4" />
                    <span>Home Control Room</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('Generate'); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase tracking-wider ${activeTab === 'Generate' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Generate Workspace</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('Marketplace'); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase tracking-wider ${activeTab === 'Marketplace' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Marketplace</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('Community'); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase tracking-wider ${activeTab === 'Community' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Community Drop</span>
                  </button>

                  {currentUser && (
                    <button
                      onClick={() => { setActiveTab('Profile'); setIsMobileMenuOpen(false); }}
                      className={`px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase tracking-wider ${activeTab === 'Profile' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
                    >
                      <User className="w-4 h-4" />
                      <span>My Config Profile</span>
                    </button>
                  )}

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
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 pb-24 md:pb-6">
        
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
            {/* 1. HOME DASHBOARD OVERVIEW */}
            {activeTab === 'Home' && (
              <div className="animate-fadeIn">
                <HomeDashboardView
                  user={currentUser}
                  onUpdateUser={(updated) => {
                    setCurrentUser(updated);
                    localStorage.setItem('ghostfire_user', JSON.stringify(updated));
                  }}
                  posts={postsList}
                  setActiveTab={setActiveTab}
                  isAdmin={isAdmin}
                  onNavigateToAuth={() => {
                    setAuthMode('login');
                    setActiveTab('Auth');
                  }}
                />
              </div>
            )}

            {/* 2. CENTRALIZED GENERATOR WORKSPACE */}
            {activeTab === 'Generate' && (
              <div className="animate-fadeIn">
                <GenerateWorkspace
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
                  isAdmin={isAdmin}
                  handleAddDevice={handleAddDevice}
                  useDeviceSpecs={handleUseDeviceSpecsInEngine}
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

      {/* Floating 5-Tab Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-40">
        <div className="bg-slate-950/80 border border-slate-850/60 backdrop-blur-xl rounded-2xl p-1.5 flex justify-around items-center shadow-2xl shadow-cyan-500/5 relative overflow-hidden">
          
          {['Home', 'Generate', 'Marketplace', 'Community', 'Profile'].map((tab) => {
            const isTabActive = activeTab === tab || (tab === 'Profile' && activeTab === 'Auth');
            
            // Choose icon
            let IconComponent = Gamepad2;
            if (tab === 'Generate') IconComponent = Sliders;
            if (tab === 'Marketplace') IconComponent = ShoppingBag;
            if (tab === 'Community') IconComponent = Users;
            if (tab === 'Profile') IconComponent = User;

            return (
              <button
                key={tab}
                onClick={() => {
                  if (tab === 'Profile' && !currentUser) {
                    setAuthMode('login');
                    setActiveTab('Auth');
                  } else {
                    setActiveTab(tab as any);
                  }
                }}
                className="relative py-2.5 px-3 flex flex-col items-center justify-center gap-1 cursor-pointer focus:outline-none flex-1 rounded-xl transition-all"
              >
                {isTabActive && (
                  <motion.div
                    layoutId="active-mobile-tab-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <IconComponent className={`w-4.5 h-4.5 transition-all ${isTabActive ? 'text-cyan-400 scale-110' : 'text-slate-500'}`} />
                <span className={`text-[8px] font-mono font-black uppercase tracking-wider ${isTabActive ? 'text-cyan-400 font-extrabold' : 'text-slate-500'}`}>
                  {tab}
                </span>
              </button>
            );
          })}

        </div>
      </div>

      {/* Universal Search Modal */}
      <UniversalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectResult={(category, item) => {
          if (category === 'marketplace') setActiveTab('Marketplace');
          else if (category === 'devices') setActiveTab('DeviceDB');
          else if (category === 'weapons') setActiveTab('Weapons');
          else if (category === 'posts') setActiveTab('Community');
          else if (category === 'presets') setActiveTab('Generate');
        }}
      />

    </div>
  );
}
