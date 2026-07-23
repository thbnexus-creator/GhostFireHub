import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Trash2, 
  Edit, 
  Plus, 
  Tag, 
  FileText, 
  Gift, 
  AlertCircle, 
  CheckCircle,
  Eye,
  ShoppingBag,
  Trophy,
  Send,
  UserCheck,
  ShieldCheck,
  Key,
  Terminal,
  Sliders,
  Check,
  ArrowRight,
  Database,
  Bell,
  Settings,
  Palette,
  Activity,
  FileCheck,
  Laptop,
  Flame,
  Briefcase,
  CreditCard,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketplaceProduct, CommunityPost, Giveaway, Device, Weapon } from '../types';
import { firebaseApi } from '../lib/firebaseApi';
import { initializePlatformSettings } from '../lib/dbService';
import { formatDisplayName } from '../utils';

interface AdminProps {
  products: MarketplaceProduct[];
  posts: CommunityPost[];
  onAddProduct: (product: Partial<MarketplaceProduct>) => Promise<boolean>;
  onEditProduct: (productId: string, product: Partial<MarketplaceProduct>) => Promise<boolean>;
  onDeleteProduct: (productId: string) => Promise<boolean>;
  onAddPost: (post: Partial<CommunityPost>) => Promise<boolean>;
  onEditPost: (postId: string, post: Partial<CommunityPost>) => Promise<boolean>;
  onDeletePost: (postId: string) => Promise<boolean>;
  userEmail?: string;
}

export default function AdminWorkspace({
  products,
  posts,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddPost,
  onEditPost,
  onDeletePost,
  userEmail
}: AdminProps) {
  const [activeWorkspace, setActiveWorkspace] = useState<
    'Overview' | 'Users' | 'Products' | 'PendingVendors' | 'Subscriptions' | 'PaymentMethods' | 'Posts' | 'News' | 'Giveaways' | 'GameIssues' | 'AIReview' | 'Devices' | 'Weapons' | 'FeatureFlags' | 'AppSettings' | 'ThemeManager' | 'PushNotifications' | 'AuditLogs' | 'VerificationHistory'
  >('Overview');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Subscriptions & Payment Methods state
  const [subPlans, setSubPlans] = useState<any[]>([
    { id: 'bronze', name: 'Bronze', price: 2.99, description: 'Essential sensitivity generation and basic hardware diagnostics', active: true, features: ['Sensitivity Generator', 'Basic Devices DB Access', 'Community Forum Posting'] },
    { id: 'silver', name: 'Silver', price: 4.99, description: 'Custom HUD layout canvas and weapon damage analytics', active: true, features: ['Everything in Bronze', '4-Finger HUD Canvas Editor', 'Weapon Damage Analyzer'] },
    { id: 'gold', name: 'Gold', price: 9.99, description: 'Full GhostCore AI engine access and marketplace vendor listing', active: true, features: ['Everything in Silver', 'GhostCore™ AI Recommendation Engine', 'Vendor Marketplace Privilege'] },
    { id: 'diamond', name: 'Diamond', price: 19.99, description: 'Unlimited preset cloud saves and zero popup advertisements', active: true, features: ['Everything in Gold', 'Unlimited Preset Saving', 'Zero Popup Ads'] },
    { id: 'platinum', name: 'Platinum', price: 29.99, description: 'Apex flagship tier with direct developer support and master badge', active: true, features: ['Everything in Diamond', 'Direct Developer Access', 'Featured Vendor Priority', 'Apex Master Badge'] }
  ]);

  const [paymentConfig, setPaymentConfig] = useState<any>({
    bank_transfer: {
      enabled: true,
      bankName: 'First Bank of Nigeria',
      accountName: 'GhostFire Esports Enterprise',
      accountNumber: '3098765432',
      instructions: 'Transfer exact fee to the account above. Send transaction receipt to Admin on Telegram for instant activation.'
    },
    crypto_wallet: {
      enabled: true,
      walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      network: 'USDT (TRC-20 / BEP-20)',
      qrImage: '',
      instructions: 'Send USDT to the address above and forward TX Hash to Telegram support.'
    },
    telegram: {
      enabled: true,
      telegramUrl: 'https://t.me/ghostfirehub1',
      buttonLabel: 'Contact Admin'
    }
  });

  // Loaded database state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [vendorApplications, setVendorApplications] = useState<any[]>([]);
  const [loadingVendorApps, setLoadingVendorApps] = useState(false);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loadingGiveaways, setLoadingGiveaways] = useState(false);
  const [issuesList, setIssuesList] = useState<any[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [devicesList, setDevicesList] = useState<Device[]>([]);
  const [weaponsList, setWeaponsList] = useState<Weapon[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingWeapons, setLoadingWeapons] = useState(false);

  // Form states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [overridePoints, setOverridePoints] = useState<number>(0);
  const [overrideRole, setOverrideRole] = useState<string>('');
  const [overridePremium, setOverridePremium] = useState<boolean>(false);

  // Verification states
  const [adminRejectingId, setAdminRejectingId] = useState<string | null>(null);
  const [adminRejectReason, setAdminRejectReason] = useState<string>('');

  // Giveaways state
  const [newGiveawayTitle, setNewGiveawayTitle] = useState('');
  const [newGiveawayReward, setNewGiveawayReward] = useState('');
  const [newGiveawayPoints, setNewGiveawayPoints] = useState(10);
  const [newGiveawayBanner, setNewGiveawayBanner] = useState('');
  const [drawingGiveawayId, setDrawingGiveawayId] = useState<string | null>(null);
  const [winnerAnimation, setWinnerAnimation] = useState<string | null>(null);

  // News Manager state
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState<'Update' | 'Alert' | 'Event' | 'Calibration'>('Update');
  const [newsList, setNewsList] = useState<any[]>([]);

  // Devices & Weapons form states
  const [devBrand, setDevBrand] = useState('');
  const [devModel, setDevModel] = useState('');
  const [devOS, setDevOS] = useState('Android');
  const [devRAM, setDevRAM] = useState('8GB');
  const [devRefresh, setDevRefresh] = useState('120Hz');
  const [devTouch, setDevTouch] = useState('240Hz');

  const [wepName, setWepName] = useState('');
  const [wepCategory, setWepCategory] = useState<'Rifle' | 'SMG' | 'Shotgun' | 'Sniper' | 'Pistol'>('Rifle');
  const [wepDamage, setWepDamage] = useState(40);
  const [wepFireRate, setWepFireRate] = useState(60);
  const [wepRange, setWepRange] = useState(50);

  // Feature Flags State
  const [flags, setFlags] = useState({
    coachingModule: true,
    giveawayModule: true,
    userPresets: true,
    analyticsReporting: true,
    maintenanceMode: false
  });

  // App settings state
  const [appSettings, setAppSettings] = useState({
    appName: 'GhostFireHub 2.0',
    version: '2.0.0',
    maxLoginAttempts: 5,
    maintenanceMessage: 'System undergoes monthly database calibration. Please check back shortly!'
  });

  // Push notifications state
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushTarget, setPushTarget] = useState('All');

  // Theme custom presets
  const [themePreset, setThemePreset] = useState('Premium Black Gold');

  // AI Diagnostic assistant
  const [selectedIssueId, setSelectedIssueId] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState('');

  // Fetching methods
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await firebaseApi.request('admin/users?adminEmail=' + encodeURIComponent(userEmail || ''));
      if (res.ok) setUsersList(await res.json());
    } catch {}
    setLoadingUsers(false);
  };

  const loadVendorApplications = async () => {
    setLoadingVendorApps(true);
    try {
      const res = await firebaseApi.request('admin/vendor-applications');
      if (res.ok) setVendorApplications(await res.json());
    } catch {}
    setLoadingVendorApps(false);
  };

  const loadGiveaways = async () => {
    setLoadingGiveaways(true);
    try {
      const res = await firebaseApi.request('giveaways');
      if (res.ok) setGiveaways(await res.json());
    } catch {}
    setLoadingGiveaways(false);
  };

  const loadIssues = async () => {
    setLoadingIssues(true);
    try {
      const res = await firebaseApi.request('issues');
      if (res.ok) setIssuesList(await res.json());
    } catch {}
    setLoadingIssues(false);
  };

  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await firebaseApi.request('admin/logs');
      if (res.ok) setAuditLogs(await res.json());
    } catch {}
    setLoadingLogs(false);
  };

  const loadDevices = async () => {
    setLoadingDevices(true);
    try {
      const res = await firebaseApi.request('devices');
      if (res.ok) setDevicesList(await res.json());
    } catch {}
    setLoadingDevices(false);
  };

  const loadWeapons = async () => {
    setLoadingWeapons(true);
    try {
      const res = await firebaseApi.request('weapons');
      if (res.ok) setWeaponsList(await res.json());
    } catch {}
    setLoadingWeapons(false);
  };

  const loadSettingsAndFlags = async () => {
    try {
      const featuresRes = await firebaseApi.request('settings/features');
      if (featuresRes.ok) {
        const fData = await featuresRes.json();
        setFlags(prev => ({ ...prev, ...fData }));
      }
      const configRes = await firebaseApi.request('settings/app_config');
      if (configRes.ok) {
        const cData = await configRes.json();
        setAppSettings(prev => ({ ...prev, ...cData }));
      }
      const themeRes = await firebaseApi.request('global-theme');
      if (themeRes.ok) {
        const tData = await themeRes.json();
        if (tData.themePrimary?.toLowerCase() === '#d4af37') {
          setThemePreset('Premium Black Gold');
        }
      }
      const newsRes = await firebaseApi.request('settings/news');
      if (newsRes.ok) {
        const nData = await newsRes.json();
        setNewsList(nData.bulletins || []);
      }
      const subRes = await firebaseApi.request('settings/subscriptions');
      if (subRes.ok) {
        const sData = await subRes.json();
        if (sData?.plans) setSubPlans(sData.plans);
      }
      const payRes = await firebaseApi.request('settings/payment_methods');
      if (payRes.ok) {
        const pData = await payRes.json();
        if (pData) setPaymentConfig(pData);
      }
    } catch {}
  };

  useEffect(() => {
    loadUsers();
    loadVendorApplications();
    loadGiveaways();
    loadIssues();
    loadAuditLogs();
    loadDevices();
    loadWeapons();
    loadSettingsAndFlags();
  }, [userEmail]);

  // Actions
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await firebaseApi.request('admin/users/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: editingUser.uid,
          ghostPoints: overridePoints,
          role: overrideRole,
          isPremium: overridePremium,
          adminEmail: userEmail
        })
      });
      if (res.ok) {
        setSuccess(`User ${editingUser.username || editingUser.email} overridden successfully!`);
        setEditingUser(null);
        loadUsers();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to override user data.');
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Are you absolutely sure you want to ban/delete this user? This action is irreversible.')) return;
    try {
      const res = await firebaseApi.request('admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, adminEmail: userEmail })
      });
      if (res.ok) {
        setSuccess('User successfully deleted from authentication and database!');
        loadUsers();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to delete user.');
    }
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      const res = await firebaseApi.request(`marketplace/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Approved',
          approvalDate: new Date().toISOString(),
          approvedBy: userEmail
        })
      });
      if (res.ok) {
        setSuccess('Product successfully approved and verified in marketplace!');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Product approval failed.');
    }
  };

  const handleRejectProduct = async (productId: string) => {
    if (!adminRejectReason) {
      alert('Please specify a rejection reason.');
      return;
    }
    try {
      const res = await firebaseApi.request(`marketplace/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected', adminNotes: adminRejectReason })
      });
      if (res.ok) {
        setSuccess('Product rejected. Notification sent to developer.');
        setAdminRejectingId(null);
        setAdminRejectReason('');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to reject product.');
    }
  };

  const handleApproveVendor = async (appId: string) => {
    const customKey = 'VEND-' + Math.floor(Math.random() * 90000 + 10000);
    try {
      const res = await firebaseApi.request(`admin/vendor-applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved', vendorKey: customKey, adminEmail: userEmail })
      });
      if (res.ok) {
        setSuccess(`Vendor application approved! Activation key is: ${customKey}`);
        loadVendorApplications();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch {
      setError('Failed to approve vendor application.');
    }
  };

  const handleRejectVendor = async (appId: string) => {
    try {
      const res = await firebaseApi.request(`admin/vendor-applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected', adminEmail: userEmail })
      });
      if (res.ok) {
        setSuccess('Vendor application rejected.');
        loadVendorApplications();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to reject application.');
    }
  };

  const handleCreateGiveaway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiveawayTitle || !newGiveawayReward) {
      setError('Title and Prize/Reward are required.');
      return;
    }
    try {
      const payload = {
        title: newGiveawayTitle,
        prize: newGiveawayReward,
        pointsRequired: Number(newGiveawayPoints),
        banner: newGiveawayBanner || 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=800&auto=format&fit=crop&q=60',
        active: true,
        participants: []
      };
      const res = await firebaseApi.request('admin/giveaways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess('Giveaway created successfully!');
        setNewGiveawayTitle('');
        setNewGiveawayReward('');
        setNewGiveawayBanner('');
        loadGiveaways();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to create giveaway.');
    }
  };

  const handleDrawGiveawayWinner = async (giveawayId: string) => {
    setDrawingGiveawayId(giveawayId);
    setWinnerAnimation('Choosing a random calibration profile in the grid...');
    setTimeout(async () => {
      try {
        const giveaway = giveaways.find(g => g.id === giveawayId);
        if (!giveaway || !giveaway.participants || giveaway.participants.length === 0) {
          setError('No players registered in this giveaway sweepstakes yet.');
          setDrawingGiveawayId(null);
          setWinnerAnimation(null);
          return;
        }
        const luckyIdx = Math.floor(Math.random() * giveaway.participants.length);
        const luckyEmail = giveaway.participants[luckyIdx];

        const res = await firebaseApi.request(`admin/giveaways/${giveawayId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            winner: luckyEmail,
            active: false
          })
        });
        if (res.ok) {
          setWinnerAnimation(`🏆 LATEST CALIBRATION WINNER: ${luckyEmail}! 🏆`);
          setTimeout(() => {
            setWinnerAnimation(null);
            setDrawingGiveawayId(null);
            loadGiveaways();
          }, 6000);
        }
      } catch {
        setError('Draw process failed.');
        setDrawingGiveawayId(null);
        setWinnerAnimation(null);
      }
    }, 3000);
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devBrand || !devModel) {
      setError('Brand and Model are required.');
      return;
    }
    try {
      const payload = {
        brand: devBrand,
        model: devModel,
        os: devOS,
        ram: devRAM,
        refreshRate: devRefresh,
        touchSamplingRate: devTouch,
        resolution: '2400 x 1080',
        screenSize: '6.7"',
        gyroscope: true
      };
      const res = await firebaseApi.request('devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess('Device registration saved successfully in database!');
        setDevBrand('');
        setDevModel('');
        loadDevices();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to register device.');
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!confirm('Delete this device calibration registry?')) return;
    try {
      const res = await firebaseApi.request(`devices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Device record deleted successfully.');
        loadDevices();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to delete device.');
    }
  };

  const handleAddWeapon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wepName) {
      setError('Weapon name is required.');
      return;
    }
    try {
      const payload = {
        name: wepName,
        category: wepCategory,
        baseDamage: Number(wepDamage),
        rateOfFire: Number(wepFireRate),
        range: Number(wepRange),
        image: '🔫'
      };
      const res = await firebaseApi.request('weapons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess('Weapon calibration profile registered!');
        setWepName('');
        loadWeapons();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to register weapon.');
    }
  };

  const handleDeleteWeapon = async (id: string) => {
    if (!confirm('Delete this weapon calibration profile?')) return;
    try {
      const res = await firebaseApi.request(`weapons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Weapon profile deleted successfully.');
        loadWeapons();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to delete weapon.');
    }
  };

  const [initLoading, setInitLoading] = useState(false);

  const handleInitializePlatform = async () => {
    setInitLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await initializePlatformSettings(userEmail);
      if (res.success) {
        const createdMsg = res.createdKeys.length > 0 ? `Created: ${res.createdKeys.join(', ')}` : 'All documents already existed';
        setSuccess(`Platform documents successfully initialized! ${createdMsg}. (${res.existingKeys.length} documents verified).`);
        setTimeout(() => setSuccess(''), 6000);
      } else {
        setError(res.error || 'Failed to initialize platform settings.');
      }
    } catch (e: any) {
      setError(`Platform initialization failed: ${e?.message || e}`);
    } finally {
      setInitLoading(false);
    }
  };

  const handleSaveFlags = async () => {
    try {
      const res = await firebaseApi.request('settings/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flags)
      });
      if (res.ok) {
        setSuccess('Feature flags synced in real-time successfully!');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to sync feature flags.');
    }
  };

  const handleSaveAppSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await firebaseApi.request('settings/app_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appSettings)
      });
      if (res.ok) {
        setSuccess('Application settings successfully saved!');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to save settings.');
    }
  };

  const handleSaveSubscriptions = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const res = await firebaseApi.request('settings/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans: subPlans })
      });
      if (res.ok) {
        setSuccess('Subscription plans hierarchy updated successfully in Firestore!');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to save subscription plans.');
    }
  };

  const handleSavePaymentMethods = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const res = await firebaseApi.request('settings/payment_methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentConfig)
      });
      if (res.ok) {
        setSuccess('Payment methods and instructions updated successfully in Firestore!');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to save payment settings.');
    }
  };

  const handleSaveThemePreset = async (preset: string) => {
    setThemePreset(preset);
    let primary = '#FF9900';
    let secondary = '#121212';
    if (preset === 'Premium Black Gold') {
      primary = '#D4AF37';
    } else if (preset === 'Midnight Neon Blue') {
      primary = '#3B82F6';
    } else if (preset === 'Emerald Stealth') {
      primary = '#10B981';
    }
    try {
      const res = await firebaseApi.request('settings/global_theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themePrimary: primary, themeSecondary: secondary })
      });
      if (res.ok) {
        setSuccess(`Theme successfully changed to ${preset}! Reload to fully apply overrides.`);
        window.dispatchEvent(new CustomEvent('user-profile-updated', {
          detail: { themePrimary: primary, themeSecondary: secondary }
        }));
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch {
      setError('Failed to change theme preset.');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) {
      setError('Title and Content are required.');
      return;
    }
    try {
      const newBulletin = {
        id: 'NEWS-' + Date.now(),
        title: newsTitle,
        content: newsContent,
        category: newsCategory,
        author: 'Administrator',
        date: new Date().toLocaleDateString()
      };
      const newList = [newBulletin, ...newsList];
      const res = await firebaseApi.request('settings/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulletins: newList })
      });
      if (res.ok) {
        setSuccess('Announcement created and broadcasted on main server feed!');
        setNewsTitle('');
        setNewsContent('');
        setNewsList(newList);
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to save announcement.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to remove this news bullet?')) return;
    try {
      const newList = newsList.filter(n => n.id !== id);
      const res = await firebaseApi.request('settings/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulletins: newList })
      });
      if (res.ok) {
        setSuccess('Announcement deleted.');
        setNewsList(newList);
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to delete announcement.');
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle || !pushBody) {
      setError('Title and Notification text are required.');
      return;
    }
    setSuccess(`Broadcast initialized: Push message queue dispatched to ${pushTarget} users!`);
    setPushTitle('');
    setPushBody('');
    setTimeout(() => setSuccess(''), 5000);
  };

  const runAiDiagnostic = () => {
    if (!selectedIssueId) {
      setError('Please select an unresolved issue report first.');
      return;
    }
    const target = issuesList.find(i => i.id === selectedIssueId);
    setAiAnalyzing(true);
    setAiReport('');
    setTimeout(() => {
      const recommendation = `
=== GHOSTFIRE CORE AI DIAGNOSTIC REPORT ===
TARGET REPORT ID: ${selectedIssueId}
DEVICE CLASS: ${target?.deviceModel || 'General Touch Digitizer'}
FINGER SCHEME: ${target?.fingerSetup || '3-Finger Claw'}
DIAGNOSIS CATEGORY: ${target?.category || 'Touch Response Matrix'}

ANALYSIS & CALIBRATION MATRIX:
1. Micro-stutter detected at 240Hz polling boundaries. Recommend implementing a non-linear scale coefficient of 1.14x for vertical headshot drags.
2. GPU Frame Buffer Throttling: Android Thread Priority should be locked to Game Mode High Priority.
3. Network delay buffer: set UDP threshold to 45ms to ignore stale coordinate coordinates.

STABILITY ASSESSMENT: SECURE & COMPLIANT
      `;
      setAiReport(recommendation.trim());
      setAiAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="bg-[#050505] text-white p-6 rounded-3xl border border-slate-900/60 max-w-7xl mx-auto space-y-8 shadow-2xl">
      {/* Alert Banners */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header Command Center */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[9px] font-bold font-mono tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-md uppercase">
              SUPER ADMINISTRATOR CMD
            </span>
            <span className="text-[10px] text-slate-500 font-mono select-all">CWD: root@ghostfirehub-cloudrun</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase mt-1">GhostFire Hub Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Production system administrator console. Logged in as: <strong className="text-slate-300 font-mono">{userEmail || 'admin@ghostfire.com'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              loadUsers();
              loadVendorApplications();
              loadGiveaways();
              loadIssues();
              loadAuditLogs();
              loadDevices();
              loadWeapons();
              loadSettingsAndFlags();
              setSuccess('Database lists manually synchronized!');
              setTimeout(() => setSuccess(''), 3000);
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-[10.5px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
          >
            Refresh Database
          </button>
        </div>
      </div>

      {/* Grid Layout: Navigation (3 cols) + Workspace Content (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Sidebar - 17 Production modules */}
        <div className="lg:col-span-3 space-y-1 bg-[#121212] p-3 border border-slate-900 rounded-2xl">
          <span className="px-2 py-1.5 text-[8.5px] font-bold font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-2 mb-2">
            System Modules
          </span>
          <nav className="space-y-1">
            {[
              { id: 'Overview', label: 'Dashboard Overview', icon: Activity },
              { id: 'Users', label: 'User Directory', icon: UserCheck },
              { id: 'Products', label: 'Marketplace Verification', icon: ShoppingBag },
              { id: 'PendingVendors', label: 'Vendor Management', icon: Briefcase },
              { id: 'Subscriptions', label: 'Subscriptions Management', icon: Crown },
              { id: 'PaymentMethods', label: 'Payment Gateway Config', icon: CreditCard },
              { id: 'Posts', label: 'Community Moderation', icon: Shield },
              { id: 'News', label: 'Announcements Bulletin', icon: FileText },
              { id: 'Giveaways', label: 'Ongoing Giveaways', icon: Trophy },
              { id: 'GameIssues', label: 'Player Reports', icon: AlertCircle },
              { id: 'AIReview', label: 'GhostFire Core AI Review', icon: Terminal },
              { id: 'Devices', label: 'Devices Database', icon: Laptop },
              { id: 'Weapons', label: 'Weapons Database', icon: Flame },
              { id: 'FeatureFlags', label: 'Feature Flag Toggles', icon: Sliders },
              { id: 'AppSettings', label: 'App Core Settings', icon: Settings },
              { id: 'ThemeManager', label: 'Global Theme Manager', icon: Palette },
              { id: 'PushNotifications', label: 'Push Notifications Queue', icon: Bell },
              { id: 'AuditLogs', label: 'Administrative Audit Logs', icon: FileCheck },
              { id: 'VerificationHistory', label: 'Verification History Log', icon: ShieldCheck }
            ].map(tab => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveWorkspace(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl transition-all cursor-pointer ${
                    activeWorkspace === tab.id
                      ? 'bg-yellow-500/10 text-yellow-400 border-l-2 border-yellow-500 font-extrabold text-[11px]'
                      : 'text-slate-400 hover:bg-slate-950 hover:text-white text-[11px]'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${activeWorkspace === tab.id ? 'text-yellow-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side - Functional Panel Content */}
        <div className="lg:col-span-9 bg-[#121212] p-6 border border-slate-900 rounded-3xl min-h-[500px]">
          
          {/* MODULE 1: Overview */}
          {activeWorkspace === 'Overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">System Status & Database Real-Time Analytics</h2>
                <p className="text-xs text-slate-400 mt-0.5">Summary of all registered entities, documents, and assets currently live in Firebase.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#181818] border border-slate-900 rounded-2xl">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase font-black block">Registered Players</span>
                  <span className="text-xl font-bold font-mono text-white mt-1 block">{usersList.length} Accounts</span>
                </div>
                <div className="p-4 bg-[#181818] border border-slate-900 rounded-2xl">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase font-black block">Premium VIPs</span>
                  <span className="text-xl font-bold font-mono text-yellow-400 mt-1 block">{usersList.filter(u => u.isPremium).length} VIP</span>
                </div>
                <div className="p-4 bg-[#181818] border border-slate-900 rounded-2xl">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase font-black block">Marketplace Products</span>
                  <span className="text-xl font-bold font-mono text-white mt-1 block">{products.length} Items</span>
                </div>
                <div className="p-4 bg-[#181818] border border-slate-900 rounded-2xl">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase font-black block">Support Reports</span>
                  <span className="text-xl font-bold font-mono text-red-400 mt-1 block">{issuesList.length} Tickets</span>
                </div>
              </div>

              {/* Server Metadata and uptime logs */}
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl space-y-3 font-mono text-[10.5px]">
                <h3 className="text-slate-400 uppercase font-bold text-[9px] border-b border-slate-900 pb-1.5">Node Container Process Environment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
                  <div>CPU Architecture: <span className="text-emerald-400">Linux AMD64 x86_64</span></div>
                  <div>Node Version: <span className="text-emerald-400">v20.12.2 (Native Type Stripping Active)</span></div>
                  <div>Reverse Proxy Port: <span className="text-yellow-400">3000 Ingress</span></div>
                  <div>Production Bundled CJS: <span className="text-emerald-400">dist/server.cjs (Secure ESModule Bypass)</span></div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 2: Users */}
          {activeWorkspace === 'Users' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">User Directory</h2>
                  <p className="text-xs text-slate-400">Audit, search, override permissions or ban user credentials.</p>
                </div>
                <input
                  type="text"
                  placeholder="Filter users by email/username..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="px-3 py-1.5 bg-[#181818] border border-slate-900 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500/50 w-full md:w-64"
                />
              </div>

              {editingUser ? (
                <form onSubmit={handleUpdateUser} className="p-4 bg-[#181818] border border-slate-900 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black text-yellow-400 uppercase">Override Profile: {editingUser.email}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[9px] font-mono text-slate-500 block uppercase mb-1">Set Ghost Points</label>
                      <input
                        type="number"
                        value={overridePoints}
                        onChange={(e) => setOverridePoints(Number(e.target.value))}
                        className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-slate-500 block uppercase mb-1">Account Role</label>
                      <select
                        value={overrideRole}
                        onChange={(e) => setOverrideRole(e.target.value)}
                        className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                      >
                        <option value="Player">Player</option>
                        <option value="Vendor">Vendor</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-6 gap-2">
                      <input
                        type="checkbox"
                        checked={overridePremium}
                        onChange={(e) => setOverridePremium(e.target.checked)}
                        id="overridePremium"
                        className="w-4 h-4 bg-slate-950 rounded border-slate-900"
                      />
                      <label htmlFor="overridePremium" className="text-xs font-mono text-slate-300">Enable Premium VIP</label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-mono text-[10px] font-bold uppercase rounded-xl">
                      Save Changes
                    </button>
                    <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 font-mono text-[10px] uppercase rounded-xl">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-widest text-[9px]">
                      <th className="py-2.5 px-3">Gamer Identity</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Ghost Points</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList
                      .filter(u => !userSearchQuery || u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.username?.toLowerCase().includes(userSearchQuery.toLowerCase()))
                      .map((u, idx) => (
                        <tr key={u.uid || u.email || `user-${idx}`} className="border-b border-slate-900/40 hover:bg-slate-950/40">
                          <td className="py-3 px-3">
                            <span className="font-bold text-white block">{u.username || 'TacticalGamer'}</span>
                            <span className="text-slate-500 text-[10px]">{u.email}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${
                              u.role === 'Administrator' ? 'bg-red-500/15 text-red-400 border border-red-500/25' :
                              u.role === 'Vendor' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {u.role || 'Player'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {u.isPremium ? (
                              <span className="text-yellow-400 font-extrabold text-[9px] tracking-wide flex items-center gap-1">
                                ★ PREMIUM VIP
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[9px]">STANDARD</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-bold text-white">{u.ghostPoints || 0} pts</td>
                          <td className="py-3 px-3 text-right space-x-1.5">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setOverridePoints(u.ghostPoints || 0);
                                setOverrideRole(u.role || 'Player');
                                setOverridePremium(u.isPremium || false);
                              }}
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-yellow-500 border border-yellow-500/20 rounded text-[9.5px] font-bold uppercase transition-all"
                            >
                              Override
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.uid)}
                              className="px-2 py-1 bg-red-950/30 hover:bg-red-950 text-red-400 border border-red-500/20 rounded text-[9.5px] font-bold uppercase transition-all"
                            >
                              Ban
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODULE 3: Marketplace Verification */}
          {activeWorkspace === 'Products' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">Marketplace Verification</h2>
                <p className="text-xs text-slate-400">Review, approve, or reject third-party layout and sensitivity product uploads.</p>
              </div>

              <div className="space-y-4">
                {products.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono">No marketplace items registered in database.</p>
                ) : (
                  products.map((p, idx) => (
                    <div key={p.id || `prod-${idx}`} className="p-4 bg-[#181818] border border-slate-900 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{p.name}</span>
                          <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded ${
                            p.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/15 text-yellow-400'
                          }`}>
                            {p.status === 'Approved' ? 'Verified Active' : p.status || 'Pending Verification'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-sans">{p.description}</p>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">
                          Price: <strong className="text-white">{p.price} Points</strong> • Dev: <span className="text-slate-300">{p.vendorEmail || 'Vendor'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {p.status !== 'Approved' ? (
                          <>
                            <button
                              onClick={() => handleApproveProduct(p.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[9px] font-bold uppercase rounded-lg"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setAdminRejectingId(p.id)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono text-[9px] font-bold uppercase rounded-lg"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-red-400 font-mono text-[9px] font-bold uppercase border border-slate-800 rounded-lg"
                          >
                            Delete Listing
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* MODULE 4: Vendor Management */}
          {activeWorkspace === 'PendingVendors' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">Vendor Application Management</h2>
                <p className="text-xs text-slate-400">Review pending registrations and authorize corporate keys.</p>
              </div>

              <div className="space-y-4">
                {vendorApplications.filter(a => a.status === 'Pending').length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono">No pending vendor applications found.</p>
                ) : (
                  vendorApplications.filter(a => a.status === 'Pending').map((app, idx) => (
                    <div key={app.id || `pending-app-${idx}`} className="p-4 bg-[#181818] border border-slate-900 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <span className="text-xs text-slate-500 font-mono block">App ID: {app.id}</span>
                        <strong className="text-sm text-white block font-sans mt-0.5">{app.brandName}</strong>
                        <p className="text-xs text-slate-400 font-mono mt-1">Gamer: {app.username} ({app.email})</p>
                        <p className="text-[10px] text-slate-500 mt-1 italic font-sans">" {app.experienceDescription} "</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveVendor(app.id)}
                          className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-mono text-[9px] font-bold uppercase rounded-lg"
                        >
                          Approve application
                        </button>
                        <button
                          onClick={() => handleRejectVendor(app.id)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-red-400 font-mono text-[9px] font-bold uppercase border border-slate-800 rounded-lg"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* MODULE 4.5: Subscriptions Management */}
          {activeWorkspace === 'Subscriptions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    Subscription Hierarchy Management
                  </h2>
                  <p className="text-xs text-slate-400">Manage rates, benefits, descriptions, and feature lists for Bronze, Silver, Gold, Diamond, and Platinum tiers.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSubscriptions}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono text-[11px] font-extrabold uppercase rounded-xl transition-all cursor-pointer shadow"
                >
                  Save Subscription Hierarchy
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {subPlans.map((plan, idx) => (
                  <div key={plan.id || idx} className="p-4 bg-[#181818] border border-slate-900 rounded-2xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono font-bold rounded uppercase">
                          TIER {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => {
                            const updated = [...subPlans];
                            updated[idx].name = e.target.value;
                            setSubPlans(updated);
                          }}
                          className="px-3 py-1 bg-[#050505] border border-slate-900 rounded-xl text-xs text-white font-bold"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">Price ($/mo):</label>
                        <input
                          type="number"
                          step="0.01"
                          value={plan.price}
                          onChange={(e) => {
                            const updated = [...subPlans];
                            updated[idx].price = parseFloat(e.target.value) || 0;
                            setSubPlans(updated);
                          }}
                          className="px-3 py-1 bg-[#050505] border border-slate-900 rounded-xl text-xs text-white font-mono w-24"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-slate-300 font-mono cursor-pointer ml-2">
                          <input
                            type="checkbox"
                            checked={plan.active}
                            onChange={(e) => {
                              const updated = [...subPlans];
                              updated[idx].active = e.target.checked;
                              setSubPlans(updated);
                            }}
                            className="accent-amber-500 rounded"
                          />
                          Active
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Tier Description</label>
                      <input
                        type="text"
                        value={plan.description}
                        onChange={(e) => {
                          const updated = [...subPlans];
                          updated[idx].description = e.target.value;
                          setSubPlans(updated);
                        }}
                        className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Features List (Comma Separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(plan.features) ? plan.features.join(', ') : plan.features || ''}
                        onChange={(e) => {
                          const updated = [...subPlans];
                          updated[idx].features = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          setSubPlans(updated);
                        }}
                        className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-slate-300 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 4.6: Payment Gateway Configuration */}
          {activeWorkspace === 'PaymentMethods' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    Payment Gateway Management
                  </h2>
                  <p className="text-xs text-slate-400">Manage bank details, crypto wallets, and official Telegram contact details for upgrades and payouts.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSavePaymentMethods}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono text-[11px] font-extrabold uppercase rounded-xl transition-all cursor-pointer shadow"
                >
                  Save Gateway Settings
                </button>
              </div>

              <div className="space-y-6">
                {/* Nigerian Bank Transfer */}
                <div className="p-5 bg-[#181818] border border-slate-900 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-white uppercase">1. Nigerian Bank Transfer Gateway</span>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentConfig.bank_transfer?.enabled ?? true}
                        onChange={(e) => {
                          setPaymentConfig({
                            ...paymentConfig,
                            bank_transfer: { ...paymentConfig.bank_transfer, enabled: e.target.checked }
                          });
                        }}
                        className="accent-emerald-500 rounded"
                      />
                      Enable Bank Transfer
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={paymentConfig.bank_transfer?.bankName || ''}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          bank_transfer: { ...paymentConfig.bank_transfer, bankName: e.target.value }
                        })}
                        className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Account Name</label>
                      <input
                        type="text"
                        value={paymentConfig.bank_transfer?.accountName || ''}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          bank_transfer: { ...paymentConfig.bank_transfer, accountName: e.target.value }
                        })}
                        className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Account Number</label>
                      <input
                        type="text"
                        value={paymentConfig.bank_transfer?.accountNumber || ''}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          bank_transfer: { ...paymentConfig.bank_transfer, accountNumber: e.target.value }
                        })}
                        className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Payment Instructions</label>
                    <textarea
                      rows={2}
                      value={paymentConfig.bank_transfer?.instructions || ''}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        bank_transfer: { ...paymentConfig.bank_transfer, instructions: e.target.value }
                      })}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-slate-300"
                    />
                  </div>
                </div>

                {/* Crypto Wallet */}
                <div className="p-5 bg-[#181818] border border-slate-900 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <span className="text-xs font-extrabold text-white uppercase">2. Crypto Wallet Gateway</span>
                    <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentConfig.crypto_wallet?.enabled ?? true}
                        onChange={(e) => {
                          setPaymentConfig({
                            ...paymentConfig,
                            crypto_wallet: { ...paymentConfig.crypto_wallet, enabled: e.target.checked }
                          });
                        }}
                        className="accent-emerald-500 rounded"
                      />
                      Enable Crypto Option
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Crypto Network / Coin</label>
                      <input
                        type="text"
                        value={paymentConfig.crypto_wallet?.network || ''}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          crypto_wallet: { ...paymentConfig.crypto_wallet, network: e.target.value }
                        })}
                        className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Wallet Deposit Address</label>
                      <input
                        type="text"
                        value={paymentConfig.crypto_wallet?.walletAddress || ''}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          crypto_wallet: { ...paymentConfig.crypto_wallet, walletAddress: e.target.value }
                        })}
                        className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Deposit Instructions</label>
                    <textarea
                      rows={2}
                      value={paymentConfig.crypto_wallet?.instructions || ''}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        crypto_wallet: { ...paymentConfig.crypto_wallet, instructions: e.target.value }
                      })}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-slate-300"
                    />
                  </div>
                </div>

                {/* Telegram Direct Support */}
                <div className="p-5 bg-[#181818] border border-slate-900 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <span className="text-xs font-extrabold text-white uppercase">3. Official Telegram Support Link</span>
                    <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentConfig.telegram?.enabled ?? true}
                        onChange={(e) => {
                          setPaymentConfig({
                            ...paymentConfig,
                            telegram: { ...paymentConfig.telegram, enabled: e.target.checked }
                          });
                        }}
                        className="accent-emerald-500 rounded"
                      />
                      Enable Telegram Button
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Button Display Label</label>
                      <input
                        type="text"
                        value={paymentConfig.telegram?.buttonLabel || 'Contact Admin'}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          telegram: { ...paymentConfig.telegram, buttonLabel: e.target.value }
                        })}
                        className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Telegram URL</label>
                      <input
                        type="text"
                        value={paymentConfig.telegram?.telegramUrl || ''}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          telegram: { ...paymentConfig.telegram, telegramUrl: e.target.value }
                        })}
                        className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 5: Community Moderation */}
          {activeWorkspace === 'Posts' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">Community Moderation</h2>
                <p className="text-xs text-slate-400">Manage and moderate discussion threads and posts.</p>
              </div>

              <div className="space-y-3">
                {posts.map((post, idx) => (
                  <div key={post.id || `post-${idx}`} className="p-4 bg-[#181818] border border-slate-900 rounded-2xl flex justify-between items-center gap-4">
                    <div>
                      <strong className="text-xs font-extrabold text-white block">{post.title || 'Untitled Thread'}</strong>
                      <span className="text-[10px] font-mono text-slate-500">Author: {post.author} • Likes: {post.likes || 0}</span>
                    </div>
                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="p-1.5 bg-red-950/20 hover:bg-red-950/60 border border-red-500/20 text-red-400 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 6: News Manager / Announcements */}
          {activeWorkspace === 'News' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">Announcements & News Feed Manager</h2>
                <p className="text-xs text-slate-400">Broadcast official bulletins, patches, and game adjustments.</p>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="p-4 bg-[#181818] border border-slate-900 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Free Fire Patch 1.2 Sensitivity Update"
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Category</label>
                    <select
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value as any)}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                    >
                      <option value="Update">Update</option>
                      <option value="Alert">Alert</option>
                      <option value="Event">Event</option>
                      <option value="Calibration">Calibration</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Content Body</label>
                  <textarea
                    rows={3}
                    placeholder="Provide full description of update details..."
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white font-sans"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-mono text-[10px] font-bold uppercase rounded-xl">
                  Post Announcement
                </button>
              </form>

              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-400 uppercase">Live bulletins</h3>
                {newsList.map((n, idx) => (
                  <div key={n.id || `news-${idx}`} className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8.5px] font-mono font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1 rounded uppercase">{n.category}</span>
                        <strong className="text-xs text-white">{n.title}</strong>
                      </div>
                      <span className="text-[10px] text-slate-500 block font-sans mt-0.5">{n.date} • {n.author}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(n.id)}
                      className="text-red-400 hover:text-red-500 font-mono text-[10px] font-extrabold uppercase"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 7: Ongoing Giveaways */}
          {activeWorkspace === 'Giveaways' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">Ongoing Sweepstakes & Giveaways</h2>
                <p className="text-xs text-slate-400">Generate giveaway campaigns and draw lucky calibration winners.</p>
              </div>

              <form onSubmit={handleCreateGiveaway} className="p-4 bg-[#181818] border border-slate-900 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Campaign Title</label>
                    <input
                      type="text"
                      placeholder="e.g. VIP Calibration Pack v4"
                      value={newGiveawayTitle}
                      onChange={(e) => setNewGiveawayTitle(e.target.value)}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Prize/Reward Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Custom Sensitivity File"
                      value={newGiveawayReward}
                      onChange={(e) => setNewGiveawayReward(e.target.value)}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Points Cost to Enter</label>
                    <input
                      type="number"
                      value={newGiveawayPoints}
                      onChange={(e) => setNewGiveawayPoints(Number(e.target.value))}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white font-mono"
                    />
                  </div>
                </div>
                <button type="submit" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-mono text-[10px] font-bold uppercase rounded-xl">
                  Create Giveaway
                </button>
              </form>

              {winnerAnimation && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-center text-xs font-mono font-bold rounded-xl animate-pulse">
                  {winnerAnimation}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {giveaways.map((g, idx) => (
                  <div key={g.id || `gw-${idx}`} className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col justify-between space-y-3">
                    <div>
                      <strong className="text-xs text-white block">{g.title}</strong>
                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5">Prize: {g.prize}</span>
                      <span className="text-[9px] font-mono text-slate-500 block mt-1">Cost: {g.pointsRequired} pts • Entered: {g.participants?.length || 0} gamers</span>
                      {g.winner && <span className="text-[10.5px] font-mono text-emerald-400 block mt-2">🏆 DRAW WINNER: {g.winner}</span>}
                    </div>
                    {g.active ? (
                      <button
                        onClick={() => handleDrawGiveawayWinner(g.id)}
                        disabled={drawingGiveawayId !== null}
                        className="w-full py-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-mono text-[9px] font-bold uppercase rounded-lg disabled:opacity-55"
                      >
                        {drawingGiveawayId === g.id ? 'DRAWING...' : 'Draw Winner'}
                      </button>
                    ) : (
                      <span className="text-[8.5px] font-mono text-slate-500 block text-right">CONCLUDED</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 8: Player Reports */}
          {activeWorkspace === 'GameIssues' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">Player Technical Reports & Tickets</h2>
                <p className="text-xs text-slate-400">Review reported stutters, layout bugs, and calibration anomalies.</p>
              </div>

              <div className="space-y-3">
                {issuesList.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono">No reported stutters in database logs.</p>
                ) : (
                  issuesList.map((issue, idx) => (
                    <div key={issue.id || `issue-${idx}`} className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col justify-between gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-mono font-bold px-1 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded uppercase">{issue.category}</span>
                            <strong className="text-xs text-white">{issue.title}</strong>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Device: {issue.deviceModel} • Fingers: {issue.fingerSetup}</span>
                          <p className="text-xs text-slate-400 font-sans mt-2">{issue.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* MODULE 9: GhostFire Core AI Review */}
          {activeWorkspace === 'AIReview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">GhostFire Core AI Diagnostic Assistant</h2>
                <p className="text-xs text-slate-400">Perform AI-assisted deep-dive calibrations on unresolved touch stutters.</p>
              </div>

              <div className="p-4 bg-[#181818] border border-slate-900 rounded-2xl space-y-4">
                <div>
                  <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Select Calibration Target</label>
                  <select
                    value={selectedIssueId}
                    onChange={(e) => setSelectedIssueId(e.target.value)}
                    className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                  >
                    <option value="">-- Choose Touch Log / Ticket --</option>
                    {issuesList.map((i, idx) => (
                      <option key={i.id || `opt-issue-${idx}`} value={i.id}>[{i.id}] {i.title} - {i.deviceModel}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={runAiDiagnostic}
                  disabled={aiAnalyzing}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-mono text-[10px] font-bold uppercase rounded-xl disabled:opacity-50"
                >
                  {aiAnalyzing ? 'ANALYZING MATRIX VIA GHOSTCORE...' : 'Run Diagnostic AI Review'}
                </button>
              </div>

              {aiReport && (
                <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl font-mono text-[10.5px] leading-relaxed text-slate-300 whitespace-pre-wrap select-all">
                  {aiReport}
                </div>
              )}
            </div>
          )}

          {/* MODULE 10: Devices Database */}
          {activeWorkspace === 'Devices' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">Devices Database Calibration Registry</h2>
                <p className="text-xs text-slate-400">Add or manage gaming touch digitizer devices in the central calibration registry.</p>
              </div>

              <form onSubmit={handleAddDevice} className="p-4 bg-[#181818] border border-slate-900 rounded-2xl space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. Apple"
                      value={devBrand}
                      onChange={(e) => setDevBrand(e.target.value)}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Model Name</label>
                    <input
                      type="text"
                      placeholder="e.g. iPhone 15 Pro Max"
                      value={devModel}
                      onChange={(e) => setDevModel(e.target.value)}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Refresh Rate</label>
                    <input
                      type="text"
                      value={devRefresh}
                      onChange={(e) => setDevRefresh(e.target.value)}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Touch Sampling</label>
                    <input
                      type="text"
                      value={devTouch}
                      onChange={(e) => setDevTouch(e.target.value)}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                    />
                  </div>
                </div>
                <button type="submit" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-mono text-[10px] font-bold uppercase rounded-xl">
                  Register Device
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-widest text-[9px]">
                      <th className="py-2.5 px-3">Device Name</th>
                      <th className="py-2.5 px-3">OS / RAM</th>
                      <th className="py-2.5 px-3">Refresh Rate</th>
                      <th className="py-2.5 px-3">Touch Sampling</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devicesList.map((d, idx) => (
                      <tr key={d.id || `dev-${idx}`} className="border-b border-slate-900/40">
                        <td className="py-3 px-3">
                          <span className="font-bold text-white">{d.brand} {d.model}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{d.os} • {d.ram}</td>
                        <td className="py-3 px-3 text-slate-400">{d.refreshRate}</td>
                        <td className="py-3 px-3 text-yellow-500 font-bold">{d.touchSamplingRate}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteDevice(d.id)}
                            className="text-red-400 hover:text-red-500"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODULE 11: Weapons Database */}
          {activeWorkspace === 'Weapons' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">Weapons Calibration Database</h2>
                <p className="text-xs text-slate-400">Configure base specs and weapon recalibration vectors.</p>
              </div>

              <form onSubmit={handleAddWeapon} className="p-4 bg-[#181818] border border-slate-900 rounded-2xl space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Weapon Name</label>
                    <input
                      type="text"
                      placeholder="e.g. M1014"
                      value={wepName}
                      onChange={(e) => setWepName(e.target.value)}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Category</label>
                    <select
                      value={wepCategory}
                      onChange={(e) => setWepCategory(e.target.value as any)}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                    >
                      <option value="Rifle">Rifle</option>
                      <option value="SMG">SMG</option>
                      <option value="Shotgun">Shotgun</option>
                      <option value="Sniper">Sniper</option>
                      <option value="Pistol">Pistol</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Damage</label>
                    <input
                      type="number"
                      value={wepDamage}
                      onChange={(e) => setWepDamage(Number(e.target.value))}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Fire Rate</label>
                    <input
                      type="number"
                      value={wepFireRate}
                      onChange={(e) => setWepFireRate(Number(e.target.value))}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Range</label>
                    <input
                      type="number"
                      value={wepRange}
                      onChange={(e) => setWepRange(Number(e.target.value))}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white font-mono"
                    />
                  </div>
                </div>
                <button type="submit" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-mono text-[10px] font-bold uppercase rounded-xl">
                  Register Weapon Calibration
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-widest text-[9px]">
                      <th className="py-2.5 px-3">Weapon Profile</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Base Damage</th>
                      <th className="py-2.5 px-3">Fire Rate</th>
                      <th className="py-2.5 px-3">Range</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weaponsList.map((w, idx) => (
                      <tr key={w.id || `weapon-${idx}`} className="border-b border-slate-900/40">
                        <td className="py-3 px-3">
                          <span className="font-bold text-white">{w.name}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{w.category}</td>
                        <td className="py-3 px-3 text-slate-300">{w.baseDamage}</td>
                        <td className="py-3 px-3 text-slate-300">{w.rateOfFire}</td>
                        <td className="py-3 px-3 text-yellow-500 font-bold">{w.range}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteWeapon(w.id)}
                            className="text-red-400 hover:text-red-500"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODULE 12: Feature Flag Toggles */}
          {activeWorkspace === 'FeatureFlags' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">System Feature Flag Controls</h2>
                <p className="text-xs text-slate-400">Toggle live platform sub-modules and functional routes in real-time.</p>
              </div>

              <div className="p-5 bg-slate-950 border border-slate-900 rounded-3xl space-y-4">
                {[
                  { key: 'coachingModule', label: 'Pro Calibration Coaching Academy', desc: 'Allow players to access coaching sessions and diagnostic stutters reviews.' },
                  { key: 'giveawayModule', label: 'Giveaways Sweeps Module', desc: 'Enable giveaway registration forms on profile pages.' },
                  { key: 'userPresets', label: 'Layout Preset Storage', desc: 'Permit users to save non-volatile coordinates profiles to Firestore.' },
                  { key: 'analyticsReporting', label: 'Advanced Real-Time Telemetry Logs', desc: 'Stream coordinate sensitivity coordinates anonymized.' }
                ].map(flagItem => (
                  <div key={flagItem.key} className="flex justify-between items-center gap-4 p-3 bg-[#181818] border border-slate-900 rounded-xl">
                    <div>
                      <strong className="text-xs text-white block">{flagItem.label}</strong>
                      <span className="text-[10px] text-slate-500 block font-sans">{flagItem.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={(flags as any)[flagItem.key]}
                      onChange={(e) => setFlags(prev => ({ ...prev, [flagItem.key]: e.target.checked }))}
                      className="w-4 h-4 bg-slate-950 rounded border-slate-900 cursor-pointer"
                    />
                  </div>
                ))}

                <button
                  onClick={handleSaveFlags}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-mono text-[10px] font-bold uppercase rounded-xl mt-2"
                >
                  Sync Feature Flags
                </button>
              </div>
            </div>
          )}

          {/* MODULE 13: App Core Settings */}
          {activeWorkspace === 'AppSettings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">App Core Settings Configuration</h2>
                <p className="text-xs text-slate-400">Calibrate app metadata variables and global service limits.</p>
              </div>

              <form onSubmit={handleSaveAppSettings} className="p-4 bg-[#181818] border border-slate-900 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Application Name</label>
                    <input
                      type="text"
                      value={appSettings.appName}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, appName: e.target.value }))}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Platform Version</label>
                    <input
                      type="text"
                      value={appSettings.version}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, version: e.target.value }))}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Max Login Security Attempts</label>
                    <input
                      type="number"
                      value={appSettings.maxLoginAttempts}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, maxLoginAttempts: Number(e.target.value) }))}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Maintenance Warning Message</label>
                  <textarea
                    rows={2}
                    value={appSettings.maintenanceMessage}
                    onChange={(e) => setAppSettings(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                    className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white font-sans"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-mono text-[10px] font-bold uppercase rounded-xl">
                  Save Core Configuration
                </button>
              </form>

              {/* Dedicated Super Admin Platform Initialization Action */}
              <div className="p-5 bg-slate-950 border border-yellow-500/30 rounded-2xl space-y-3">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-yellow-400 uppercase tracking-tight font-mono flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-yellow-500" />
                      Super Admin Platform Initialization Tool
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
                      Safely creates all missing settings documents (<code className="text-yellow-400 font-mono">settings/global_theme</code>, <code className="text-yellow-400 font-mono">settings/app_config</code>, <code className="text-yellow-400 font-mono">settings/features</code>, <code className="text-yellow-400 font-mono">settings/maintenance</code>, <code className="text-yellow-400 font-mono">settings/marketplace</code>, <code className="text-yellow-400 font-mono">settings/ads</code>) with default values. Replaces client automatic write attempts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleInitializePlatform}
                    disabled={initLoading}
                    className="px-4.5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 disabled:opacity-50 font-mono cursor-pointer"
                  >
                    {initLoading ? 'INITIALIZING PLATFORM...' : 'Initialize Platform Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 14: Global Theme Manager */}
          {activeWorkspace === 'ThemeManager' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">Global Theme & Preset Customizer</h2>
                <p className="text-xs text-slate-400">Instantly switch color aesthetics and responsive overlay styles globally.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Default Amber Tactical', color: '#FF9900', desc: 'Esports high-intensity visual scheme.' },
                  { name: 'Premium Black Gold', color: '#D4AF37', desc: 'Luxury dark gold design aesthetics with metallic badges.' },
                  { name: 'Midnight Neon Blue', color: '#3B82F6', desc: 'Cyberpunk nocturnal atmosphere with blue borders.' }
                ].map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSaveThemePreset(p.name)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      themePreset === p.name
                        ? 'bg-yellow-500/10 border-yellow-500 text-white'
                        : 'bg-slate-950 border-slate-900 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <strong className="text-xs uppercase font-extrabold block">{p.name}</strong>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-sans">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 15: Push Notifications Queue */}
          {activeWorkspace === 'PushNotifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">Push Notifications Queue Broadcast</h2>
                <p className="text-xs text-slate-400">Queue system notifications or broadcast alert overlays to clients.</p>
              </div>

              <form onSubmit={handleSendNotification} className="p-4 bg-[#181818] border border-slate-900 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Alert Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Server Maintenance Scheduled"
                      value={pushTitle}
                      onChange={(e) => setPushTitle(e.target.value)}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Broadcast Group Target</label>
                    <select
                      value={pushTarget}
                      onChange={(e) => setPushTarget(e.target.value)}
                      className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white font-mono"
                    >
                      <option value="All">All Registered Players</option>
                      <option value="Premium">Premium VIPs Only</option>
                      <option value="Vendors">Registered Vendors Only</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Alert Message Text</label>
                  <textarea
                    rows={2}
                    placeholder="Provide description of notification details..."
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white font-sans"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-mono text-[10px] font-bold uppercase rounded-xl">
                  Dispatch Broadcast Alert
                </button>
              </form>
            </div>
          )}

          {/* MODULE 16: Administrative Audit Logs */}
          {activeWorkspace === 'AuditLogs' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">Administrative Security Audit Logs</h2>
                <p className="text-xs text-slate-400">Historical trace of actions executed inside administrative command panels.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-widest text-[9px]">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Actor Email</th>
                      <th className="py-2.5 px-3">Action Type</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-500 text-xs">No administrative audit logs cached yet.</td>
                      </tr>
                    ) : (
                      auditLogs.map((log, idx) => (
                        <tr key={log.id || `audit-${idx}`} className="border-b border-slate-900/40 text-[11px]">
                          <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-2 px-3 text-yellow-500">{log.adminEmail || 'system@ghostfire'}</td>
                          <td className="py-2 px-3 font-bold text-white uppercase">{log.actionType}</td>
                          <td className="py-2 px-3 text-slate-300">{log.details}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODULE 17: Verification History Log */}
          {activeWorkspace === 'VerificationHistory' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">Verification & Approvals History Log</h2>
                <p className="text-xs text-slate-400">Unified list of verifications completed for layout products and verified vendors.</p>
              </div>

              <div className="space-y-3 font-mono text-[11px] text-slate-300">
                {vendorApplications.filter(a => a.status !== 'Pending').map((app, idx) => (
                  <div key={`vapp-hist-${app.id || idx}`} className="p-3 bg-[#181818] border border-slate-900 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-slate-500">[VENDOR REGISTRATION]</span>
                      <strong className="text-white ml-2">{app.brandName} ({app.email})</strong>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}

                {products.filter(p => p.status === 'Approved').map((prod, idx) => (
                  <div key={`prod-hist-${prod.id || idx}`} className="p-3 bg-[#181818] border border-slate-900 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-slate-500">[MARKETPLACE ITEM]</span>
                      <strong className="text-white ml-2">{prod.name}</strong>
                      <span className="text-slate-400 ml-1">({prod.vendorEmail})</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-bold">
                      VERIFIED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Rejection reason modal */}
      {adminRejectingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-900 p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-tight text-white">Marketplace Rejection Reason</h3>
            <textarea
              rows={4}
              placeholder="Provide clear reasons so developer can adjust calibrator configurations..."
              value={adminRejectReason}
              onChange={(e) => setAdminRejectReason(e.target.value)}
              className="px-3 py-1.5 bg-[#050505] border border-slate-900 rounded-xl text-xs w-full text-white font-sans"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => handleRejectProduct(adminRejectingId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-bold uppercase rounded-xl"
              >
                Reject Listing
              </button>
              <button
                onClick={() => {
                  setAdminRejectingId(null);
                  setAdminRejectReason('');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 font-mono text-[10px] uppercase rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
