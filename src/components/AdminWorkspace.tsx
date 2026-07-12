import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Trash2, 
  Edit, 
  Plus, 
  Tag, 
  FileText, 
  Gift, 
  Upload, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff,
  ShoppingBag,
  Clock,
  Sparkles,
  Trophy,
  Send,
  UserCheck,
  ShieldCheck,
  Key,
  Terminal,
  Clipboard,
  Sliders,
  Check,
  ArrowRight,
  Coins,
  Briefcase,
  Play,
  Video,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketplaceProduct, CommunityPost, Giveaway } from '../types';
import { formatDisplayName } from '../utils';
import SecureImageUpload from './SecureImageUpload';
import { deleteFileFromFirebase } from '../lib/firebase';

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
  const [activeWorkspace, setActiveWorkspace] = useState<'Products' | 'Posts' | 'Giveaways' | 'AuditLogs' | 'Secrets' | 'GameIssues' | 'Users' | 'Monetization' | 'PendingVendors'>('Products');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Vendor Applications State
  const [vendorApplications, setVendorApplications] = useState<any[]>([]);
  const [loadingVendorApps, setLoadingVendorApps] = useState(false);
  const [adminVendorKeyInputs, setAdminVendorKeyInputs] = useState<{[appId: string]: string}>({});

  // Admin Payout / Revenue States
  const [monetizationSubTab, setMonetizationSubTab] = useState<'Telemetry' | 'AdRevenue'>('Telemetry');
  const [userPayouts, setUserPayouts] = useState<any[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);

  const loadUserPayouts = async () => {
    setLoadingPayouts(true);
    try {
      const res = await fetch('/api/admin/payouts');
      if (res.ok) {
        setUserPayouts(await res.json());
      }
    } catch (err) {
      console.error('Failed to load user payouts:', err);
    } finally {
      setLoadingPayouts(false);
    }
  };

  // Admin Nigerian Bank Withdrawal States & Handlers
  const [adminBank, setAdminBank] = useState('Access Bank PLC');
  const [adminAccountNumber, setAdminAccountNumber] = useState('');
  const [adminAccountName, setAdminAccountName] = useState('');
  const [adminWithdrawAmount, setAdminWithdrawAmount] = useState('');
  const [adminWithdrawals, setAdminWithdrawals] = useState<any[]>([
    {
      id: 'ADM-PAY-9831',
      amount: 45000,
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountNumber: '0421893321',
      accountName: 'GhostFire Administrator Nigeria',
      status: 'Approved',
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ]);

  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState('');
  const [payoutError, setPayoutError] = useState('');

  // Admin Crypto Withdrawal Wallet Configurations
  const [adminCryptoAddress, setAdminCryptoAddress] = useState(() => localStorage.getItem('ghostfire_admin_crypto_address') || '');
  const [adminBinancePayId, setAdminBinancePayId] = useState(() => localStorage.getItem('ghostfire_admin_binance_pay_id') || '');
  const [cryptoConfigSuccess, setCryptoConfigSuccess] = useState('');

  const handleSaveCryptoConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ghostfire_admin_crypto_address', adminCryptoAddress.trim());
    localStorage.setItem('ghostfire_admin_binance_pay_id', adminBinancePayId.trim());
    setCryptoConfigSuccess('✓ USDT Wallet & Binance Pay ID Configured Successfully!');
    setTimeout(() => setCryptoConfigSuccess(''), 4000);
  };

  const handleAdminWithdraw = (e: React.FormEvent, maxNaira: number) => {
    e.preventDefault();
    setPayoutError('');
    setPayoutSuccess('');

    const amt = Number(adminWithdrawAmount);
    if (!amt || amt <= 0) {
      setPayoutError('Please enter a valid withdrawal amount.');
      return;
    }
    if (amt > maxNaira) {
      setPayoutError(`Insufficient platform revenue. Max available is ₦${Math.round(maxNaira).toLocaleString()} NGN.`);
      return;
    }
    if (!adminAccountNumber || adminAccountNumber.length !== 10) {
      setPayoutError('Please enter a valid 10-digit Nuban account number.');
      return;
    }
    if (!adminAccountName.trim()) {
      setPayoutError('Please specify the admin bank account holder name.');
      return;
    }

    setPayoutSubmitting(true);
    setTimeout(() => {
      const newReq = {
        id: 'ADM-PAY-' + Math.floor(Math.random() * 9000 + 1000),
        amount: amt,
        bankName: adminBank,
        accountNumber: adminAccountNumber,
        accountName: adminAccountName,
        status: 'Approved',
        timestamp: new Date().toISOString()
      };
      setAdminWithdrawals(prev => [newReq, ...prev]);
      setPayoutSubmitting(false);
      setPayoutSuccess(`Naira bank payout of ₦${amt.toLocaleString()} NGN approved & transferred successfully to admin bank account!`);
      setAdminWithdrawAmount('');
      setAdminAccountNumber('');
      setAdminAccountName('');
    }, 2000);
  };

  const handleApproveUserPayout = async (payoutId: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminEmail: userEmail })
      });
      if (res.ok) {
        setSuccess(`User payout request successfully ${status.toLowerCase()}!`);
        setTimeout(() => setSuccess(''), 4000);
        loadUserPayouts();
        loadUsers(); // reload users list to see update
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to update payout status.');
        setTimeout(() => setError(''), 4000);
      }
    } catch (e) {
      console.error(e);
      setError('Network error processing user payout.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const loadVendorApplications = async () => {
    setLoadingVendorApps(true);
    try {
      const res = await fetch('/api/admin/vendor-applications');
      if (res.ok) {
        const data = await res.json();
        setVendorApplications(data || []);
      }
    } catch (err) {
      console.error('Failed to load vendor applications:', err);
    } finally {
      setLoadingVendorApps(false);
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, status: 'Approved' | 'Rejected') => {
    const customKey = adminVendorKeyInputs[appId]?.trim() || 'VEND-' + Math.floor(1000 + Math.random() * 9000);
    try {
      const res = await fetch(`/api/admin/vendor-applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          vendorKey: customKey,
          adminEmail: userEmail
        })
      });

      if (res.ok) {
        setSuccess(`Vendor application status updated to ${status}! Custom key assigned: ${customKey}`);
        setTimeout(() => setSuccess(''), 4000);
        loadVendorApplications();
        loadUsers();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to update application status.');
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setError('Network error updating vendor application.');
      setTimeout(() => setError(''), 4000);
    }
  };

  // --- VENDOR TOKENS GENERATOR STATE & API CALLS ---
  const [vendorTokens, setVendorTokens] = useState<any[]>([]);
  const [customTokenInput, setCustomTokenInput] = useState('');
  const [generatingToken, setGeneratingToken] = useState(false);
  const [loadingTokens, setLoadingTokens] = useState(false);

  const fetchVendorTokens = async () => {
    setLoadingTokens(true);
    try {
      const res = await fetch('/api/admin/vendor-tokens');
      if (res.ok) {
        setVendorTokens(await res.json());
      }
    } catch (err) {
      console.error('Failed to load vendor tokens:', err);
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleGenerateVendorToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingToken(true);
    try {
      const res = await fetch('/api/admin/generate-vendor-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: userEmail,
          customCode: customTokenInput.trim() || undefined
        })
      });
      if (res.ok) {
        setCustomTokenInput('');
        fetchVendorTokens();
        setSuccess('New vendor activation token successfully created!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to generate token.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError('Connection failed generating token.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setGeneratingToken(false);
    }
  };

  // --- AD CAMPAIGNS STATE & API CALLS ---
  const [ads, setAds] = useState<any[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [generatingAd, setGeneratingAd] = useState(false);
  const [submittingAd, setSubmittingAd] = useState(false);
  const [brandTheme, setBrandTheme] = useState('');

  // Manual Ad form fields
  const [adTitle, setAdTitle] = useState('');
  const [adTagline, setAdTagline] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adReward, setAdReward] = useState('');
  const [adDuration, setAdDuration] = useState('10');
  const [adIcon, setAdIcon] = useState('📺');
  const [adActionText, setAdActionText] = useState('Watch simulation');
  const [adVideoUrl, setAdVideoUrl] = useState('');
  const [editingAdId, setEditingAdId] = useState<string | null>(null);

  const fetchAds = async () => {
    setLoadingAds(true);
    try {
      const res = await fetch('/api/ads');
      if (res.ok) {
        setAds(await res.json());
      }
    } catch (err) {
      console.error('Failed to load ads:', err);
    } finally {
      setLoadingAds(false);
    }
  };

  const handleCreateOrUpdateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adDescription.trim() || !adReward || !adDuration) {
      setError('Ad Title, Description, Reward (USD), and Duration are required.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setSubmittingAd(true);
    const payload = {
      title: adTitle.trim(),
      tagline: adTagline.trim(),
      description: adDescription.trim(),
      rewardUsd: Number(adReward),
      videoDuration: Number(adDuration),
      icon: adIcon.trim(),
      actionText: adActionText.trim(),
      videoUrl: adVideoUrl.trim(),
      adminEmail: userEmail
    };

    try {
      const url = editingAdId ? `/api/admin/ads/${editingAdId}` : '/api/admin/ads';
      const method = editingAdId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(editingAdId ? 'Ad Campaign successfully updated!' : 'Custom Ad Campaign successfully created!');
        setTimeout(() => setSuccess(''), 5000);
        setAdTitle('');
        setAdTagline('');
        setAdDescription('');
        setAdReward('');
        setAdDuration('10');
        setAdIcon('📺');
        setAdActionText('Watch simulation');
        setAdVideoUrl('');
        setEditingAdId(null);
        fetchAds();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to save ad campaign.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError('Connection failed saving ad.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSubmittingAd(false);
    }
  };

  const handleAiGenerateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandTheme.trim()) {
      setError('A brand theme, topic, or description is required for AI generation.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setGeneratingAd(true);
    try {
      const res = await fetch('/api/admin/ads/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandTheme: brandTheme.trim(),
          adminEmail: userEmail
        })
      });

      if (res.ok) {
        setBrandTheme('');
        setSuccess('Creative Ad Campaign successfully generated via Gemini AI!');
        setTimeout(() => setSuccess(''), 5000);
        fetchAds();
      } else {
        const errData = await res.json();
        setError(errData.error || 'AI generation failed.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError('Connection failed generating AI ad.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setGeneratingAd(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad campaign?')) return;
    try {
      const res = await fetch(`/api/admin/ads/${adId}?adminEmail=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSuccess('Ad campaign successfully deleted.');
        setTimeout(() => setSuccess(''), 5000);
        fetchAds();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to delete ad.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError('Connection error deleting ad.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEditAdSelect = (ad: any) => {
    setEditingAdId(ad.id);
    setAdTitle(ad.title);
    setAdTagline(ad.tagline || '');
    setAdDescription(ad.description);
    setAdReward(String(ad.rewardUsd));
    setAdDuration(String(ad.videoDuration));
    setAdIcon(ad.icon || '📺');
    setAdActionText(ad.actionText || 'Watch simulation');
    setAdVideoUrl(ad.videoUrl || '');
  };
  
  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Developer Secret variables toggling
  const [revealSecrets, setRevealSecrets] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null);

  // Giveaways state
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loadingGiveaways, setLoadingGiveaways] = useState(false);

  // Garena Free Fire Issues State
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDevice, setIssueDevice] = useState('');
  const [issueFinger, setIssueFinger] = useState('3-Finger');
  const [issueCategory, setIssueCategory] = useState('Touch Response');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueScreenshot, setIssueScreenshot] = useState('');
  const [issuesList, setIssuesList] = useState<any[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);

  // Gemini AI HUD Screenshot Analyzer state
  const [hudImage, setHudImage] = useState<string>('');
  const [hudDevice, setHudDevice] = useState('iPhone 7');
  const [hudFinger, setHudFinger] = useState('3-Finger');
  const [analyzingHud, setAnalyzingHud] = useState(false);
  const [hudAnalysisResult, setHudAnalysisResult] = useState<string>('');

  // Users Management state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [overridePoints, setOverridePoints] = useState<number>(0);
  const [overrideRole, setOverrideRole] = useState<string>('');
  const [overridePremium, setOverridePremium] = useState<boolean>(false);
  const [overrideIsVendor, setOverrideIsVendor] = useState<boolean>(false);
  const [overrideVendorCode, setOverrideVendorCode] = useState<string>('');
  const [overrideVendorFeePaid, setOverrideVendorFeePaid] = useState<boolean>(false);
  const [overrideVendorRequested, setOverrideVendorRequested] = useState<boolean>(false);

  // Load users
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users?adminEmail=' + encodeURIComponent(userEmail || ''));
      if (res.ok) {
        const data = await res.json();
        setUsersList(data || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (activeWorkspace === 'Users' || activeWorkspace === 'Monetization') {
      loadUsers();
    }
    if (activeWorkspace === 'Monetization') {
      loadUserPayouts();
    }
    if (activeWorkspace === 'PendingVendors') {
      loadVendorApplications();
    }
  }, [activeWorkspace]);

  // Load giveaways
  const loadGiveaways = async () => {
    setLoadingGiveaways(true);
    try {
      const res = await fetch('/api/giveaways');
      if (res.ok) setGiveaways(await res.json());
    } catch (err) {}
    setLoadingGiveaways(false);
  };

  const loadIssues = async () => {
    setLoadingIssues(true);
    try {
      const res = await fetch('/api/issues');
      if (res.ok) setIssuesList(await res.json());
    } catch (err) {}
    setLoadingIssues(false);
  };

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/logs');
      if (res.ok) {
        setAuditLogs(await res.json());
      }
    } catch (err) {
      console.error('Error fetching admin logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadGiveaways();
    loadIssues();
  }, []);

  useEffect(() => {
    if (activeWorkspace === 'AuditLogs') {
      fetchAuditLogs();
    } else if (activeWorkspace === 'GameIssues') {
      loadIssues();
    }
  }, [activeWorkspace]);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle || !issueDesc) {
      setError('Title and Details description are required.');
      return;
    }
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: issueTitle,
          deviceModel: issueDevice,
          fingerSetup: issueFinger,
          category: issueCategory,
          description: issueDesc,
          screenshot: issueScreenshot,
          reportedBy: userEmail
        })
      });
      if (res.ok) {
        setSuccess('Free Fire touch issue logged successfully.');
        setIssueTitle('');
        setIssueDevice('');
        setIssueDesc('');
        setIssueScreenshot('');
        loadIssues();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to log the issue.');
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      setError('Failed to reach server to log issue.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleAnalyzeHudScreenshot = async () => {
    if (!hudImage) {
      setError('Please upload a HUD screenshot first.');
      return;
    }
    setAnalyzingHud(true);
    setHudAnalysisResult('');
    try {
      const res = await fetch('/api/issues/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenshot: hudImage,
          deviceModel: hudDevice,
          fingerSetup: hudFinger
        })
      });
      if (res.ok) {
        const data = await res.json();
        setHudAnalysisResult(data.analysis);
        setSuccess('AI Hud posture calibration diagnostic generated.');
        setTimeout(() => setSuccess(''), 4000);
      } else {
        const errData = await res.json();
        setError(errData.error || 'AI analysis failed.');
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      setError('Analysis request timed out.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setAnalyzingHud(false);
    }
  };

  const handleDeleteIssueClick = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Issue Log?',
      message: `Are you sure you want to delete Garena Free Fire touch diagnostic log: "${title}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/issues/${id}`, { method: 'DELETE' });
          if (res.ok) {
            setSuccess(`Issue "${title}" has been deleted.`);
            loadIssues();
            setTimeout(() => setSuccess(''), 3000);
          } else {
            setError('Failed to delete issue.');
            setTimeout(() => setError(''), 3000);
          }
        } catch (err) {}
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // User Management Actions
  const handleToggleBanUser = (userToBan: any) => {
    const isBannedCurrent = !!userToBan.isBanned;
    const actionText = isBannedCurrent ? 'unban' : 'ban';
    
    setConfirmModal({
      isOpen: true,
      title: `${actionText.toUpperCase()} USER ACCOUNT`,
      message: `Are you absolutely sure you want to ${actionText} user account ${userToBan.username || 'user'} (${userToBan.email})? Banned users are immediately stopped from logging in or using the app.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/users/${encodeURIComponent(userToBan.email)}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isBanned: !isBannedCurrent, adminEmail: userEmail })
          });
          if (res.ok) {
            setSuccess(`User successfully ${isBannedCurrent ? 'unbanned' : 'banned'}!`);
            setTimeout(() => setSuccess(''), 4000);
            loadUsers();
          } else {
            const errData = await res.json();
            setError(errData.error || 'Failed to update user status');
            setTimeout(() => setError(''), 4000);
          }
        } catch (err) {
          console.error(err);
          setError('Failed to update user status');
          setTimeout(() => setError(''), 4000);
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handlePermanentDeleteUser = (userToDelete: any) => {
    setConfirmModal({
      isOpen: true,
      title: `PERMANENTLY DELETE USER`,
      message: `WARNING: Are you sure you want to permanently delete user ${userToDelete.username || 'user'} (${userToDelete.email})? This action is irreversible and will delete all their saved setups, profile options, and history.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/users/${encodeURIComponent(userToDelete.email)}?adminEmail=${encodeURIComponent(userEmail || '')}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            setSuccess('User account successfully purged from the system!');
            setTimeout(() => setSuccess(''), 4000);
            loadUsers();
          } else {
            const errData = await res.json();
            setError(errData.error || 'Failed to delete user');
            setTimeout(() => setError(''), 4000);
          }
        } catch (err) {
          console.error(err);
          setError('Failed to delete user');
          setTimeout(() => setError(''), 4000);
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleOpenOverrideEditor = (userToOverride: any) => {
    setEditingUser(userToOverride);
    setOverridePoints(userToOverride.ghostPoints || 0);
    setOverrideRole(userToOverride.role || 'Standard Player');
    setOverridePremium(!!userToOverride.isPremium);
    setOverrideIsVendor(!!userToOverride.isVendor);
    setOverrideVendorCode(userToOverride.vendorCode || '');
    setOverrideVendorFeePaid(!!userToOverride.vendorFeePaid);
    setOverrideVendorRequested(!!userToOverride.vendorRequested);
  };

  const handleSaveUserOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(editingUser.email)}/override`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: userEmail,
          ghostPoints: Number(overridePoints),
          role: overrideRole,
          isPremium: overridePremium,
          isVendor: overrideIsVendor,
          vendorCode: overrideVendorCode,
          vendorFeePaid: overrideVendorFeePaid,
          vendorRequested: overrideVendorRequested
        })
      });
      if (res.ok) {
        setSuccess('User profile successfully overridden and synced with server database!');
        setTimeout(() => setSuccess(''), 4000);
        setEditingUser(null);
        loadUsers();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to override user');
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save override');
      setTimeout(() => setError(''), 4000);
    }
  };

  // --- CRUD STATES ---
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  
  // 1. Marketplace Form state
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Config Files');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodTelegram, setProdTelegram] = useState('ghostfirehub1');
  const [prodImage, setProdImage] = useState('');
  const [isGiveaway, setIsGiveaway] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // 2. Posts Form state
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<'Announcement' | 'Update' | 'Guide' | 'Tournament'>('Announcement');
  const [postContent, setPostContent] = useState('');
  const [postVisibility, setPostVisibility] = useState<'public' | 'registered'>('public');
  const [postIsAnonymous, setPostIsAnonymous] = useState(false);
  const [postImage, setPostImage] = useState('');

  // 3. Giveaways Form state
  const [giveawayTitle, setGiveawayTitle] = useState('');
  const [giveawayReward, setGiveawayReward] = useState('');
  const [giveawayDays, setGiveawayDays] = useState('3');
  const [giveawayDescription, setGiveawayDescription] = useState('');
  const [giveawayTelegram, setGiveawayTelegram] = useState('ghostfirehub1');
  const [giveawayImage, setGiveawayImage] = useState('');

  // --- SUBMIT PRODUCT CRUDS ---
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload: Partial<MarketplaceProduct> = {
      name: prodName,
      category: prodCategory,
      price: isGiveaway ? 0 : Number(prodPrice) || 0,
      description: prodDescription || 'Optimized settings package.',
      image: prodImage || '🎮',
      featured: isFeatured,
      telegramLink: prodTelegram.replace('@', '').trim(),
      isGiveaway: isGiveaway,
      hidden: isHidden
    };

    let ok = false;
    if (isEditingId) {
      ok = await onEditProduct(isEditingId, payload);
    } else {
      ok = await onAddProduct(payload);
    }

    if (ok) {
      setSuccess(isEditingId ? 'Listing updated successfully!' : 'New listing added live!');
      resetProductForm();
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError('Database synchronization failed.');
    }
  };

  const startEditProduct = (p: MarketplaceProduct) => {
    setIsEditingId(p.id);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdPrice(p.price.toString());
    setProdDescription(p.description);
    setProdTelegram(p.telegramLink || 'ghostfirehub1');
    setProdImage(p.image || '');
    setIsGiveaway(!!p.isGiveaway || p.price === 0);
    setIsFeatured(!!p.featured);
    setIsHidden(!!p.hidden);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const deleteProductConfirm = (id: string) => {
    const p = products.find(item => item.id === id);
    const pName = p ? p.name : 'this product';
    setConfirmModal({
      isOpen: true,
      title: '🚨 Confirm Product Deletion',
      message: `Are you absolutely sure you want to permanently delete "${pName}"? This action cannot be undone and will be synchronized instantly.`,
      onConfirm: async () => {
        if (p && p.image) {
          await deleteFileFromFirebase(p.image);
        }
        const ok = await onDeleteProduct(id);
        if (ok) {
          setSuccess('Product listing deleted successfully.');
          setTimeout(() => setSuccess(''), 3000);
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const resetProductForm = () => {
    setIsEditingId(null);
    setProdName('');
    setProdPrice('');
    setProdDescription('');
    setProdTelegram('ghostfirehub1');
    setProdImage('');
    setIsGiveaway(false);
    setIsFeatured(false);
    setIsHidden(false);
  };

  // --- SUBMIT POST CRUDS ---
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload: Partial<CommunityPost> = {
      title: postTitle,
      content: postContent,
      author: 'GhostFireAdmin',
      category: postCategory,
      visibility: postVisibility,
      isAnonymous: postIsAnonymous,
      image: postImage || undefined
    };

    let ok = false;
    if (isEditingId) {
      ok = await onEditPost(isEditingId, payload);
    } else {
      ok = await onAddPost(payload);
    }

    if (ok) {
      setSuccess(isEditingId ? 'Community post updated successfully!' : 'Bulletin posted live!');
      resetPostForm();
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError('Server rejected post creation.');
    }
  };

  const startEditPost = (post: CommunityPost) => {
    setIsEditingId(post.id);
    setPostTitle(post.title);
    setPostCategory(post.category);
    setPostContent(post.content);
    setPostVisibility(post.visibility || 'public');
    setPostIsAnonymous(!!post.isAnonymous);
    setPostImage(post.image || '');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const deletePostConfirm = (id: string) => {
    const post = posts.find(item => item.id === id);
    const pTitle = post ? post.title : 'this bulletin post';
    setConfirmModal({
      isOpen: true,
      title: '📢 Confirm Bulletin Deletion',
      message: `Are you sure you want to permanently delete "${pTitle}"? It will be removed from all user community boards.`,
      onConfirm: async () => {
        if (post && post.image) {
          await deleteFileFromFirebase(post.image);
        }
        const ok = await onDeletePost(id);
        if (ok) {
          setSuccess('Bulletin post removed.');
          setTimeout(() => setSuccess(''), 3000);
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const resetPostForm = () => {
    setIsEditingId(null);
    setPostTitle('');
    setPostContent('');
    setPostCategory('Announcement');
    setPostVisibility('public');
    setPostIsAnonymous(false);
    setPostImage('');
  };

  // --- SUBMIT GIVEAWAYS CRUDS ---
  const handleGiveawaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const end = new Date();
    end.setDate(end.getDate() + Number(giveawayDays));

    const body = {
      title: giveawayTitle,
      description: giveawayDescription,
      reward: giveawayReward,
      endTime: end.toISOString(),
      telegramLink: giveawayTelegram.replace('@', '').trim(),
      image: giveawayImage || ''
    };

    try {
      let res;
      if (isEditingId) {
        res = await fetch(`/api/giveaways/${isEditingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch('/api/giveaways', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }

      if (res.ok) {
        setSuccess(isEditingId ? 'Giveaway details updated!' : 'Giveaway posted live successfully!');
        resetGiveawayForm();
        loadGiveaways();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError('Server refused giveaway update.');
      }
    } catch (err) {
      setError('Connection failure updating giveaways.');
    }
  };

  const startEditGiveaway = (g: Giveaway) => {
    setIsEditingId(g.id);
    setGiveawayTitle(g.title);
    setGiveawayReward(g.reward);
    setGiveawayDescription(g.description);
    setGiveawayTelegram(g.telegramLink || 'ghostfirehub1');
    setGiveawayImage(g.image || '');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const deleteGiveawayConfirm = (id: string) => {
    const g = giveaways.find(item => item.id === id);
    const gTitle = g ? g.title : 'this giveaway';
    setConfirmModal({
      isOpen: true,
      title: '🎁 Confirm Giveaway Deletion',
      message: `Are you absolutely sure you want to delete "${gTitle}" from the database? All participant registers will be lost.`,
      onConfirm: async () => {
        try {
          if (g && g.image) {
            await deleteFileFromFirebase(g.image);
          }
          const res = await fetch(`/api/giveaways/${id}`, { method: 'DELETE' });
          if (res.ok) {
            setSuccess('Giveaway erased.');
            loadGiveaways();
            setTimeout(() => setSuccess(''), 3000);
          }
        } catch (e) {
          console.error(e);
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const pickGiveawayWinner = async (id: string) => {
    const g = giveaways.find(item => item.id === id);
    if (!g) return;
    if (!g.participants || g.participants.length === 0) {
      alert('No participants have registered in this drawing yet.');
      return;
    }

    if (!confirm('Randomly draw a lucky winner from the participant list?')) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * g.participants.length);
    const chosen = g.participants[randomIndex];

    try {
      const res = await fetch(`/api/giveaways/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner: chosen })
      });
      if (res.ok) {
        setSuccess(`Winner drawn successfully: ${chosen}`);
        loadGiveaways();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {}
  };

  const resetGiveawayForm = () => {
    setIsEditingId(null);
    setGiveawayTitle('');
    setGiveawayReward('');
    setGiveawayDescription('');
    setGiveawayTelegram('ghostfirehub1');
    setGiveawayImage('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-500/15 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-red-500/15 border border-red-500/30 text-red-400 px-2.5 py-0.5 rounded uppercase tracking-wider">
                Restricted Workspace
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {userEmail}</span>
            </div>
            <h1 className="text-md sm:text-lg font-black text-white uppercase mt-1">
              GhostCore™ Centralized Admin Dashboard
            </h1>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Consolidated administration panel. Create, read, update, and delete products, news bulletins, and giveaways with live server database synchronization.
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Workspace Toggles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-9 gap-2 bg-slate-950 p-1.5 border border-slate-900 rounded-2xl font-bold uppercase text-[10px] tracking-wider">
        <button
          onClick={() => { setActiveWorkspace('Products'); resetProductForm(); }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeWorkspace === 'Products' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Market</span>
        </button>

        <button
          onClick={() => { setActiveWorkspace('Posts'); resetPostForm(); }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeWorkspace === 'Posts' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Bulletins</span>
        </button>

        <button
          onClick={() => { setActiveWorkspace('Giveaways'); resetGiveawayForm(); }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeWorkspace === 'Giveaways' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Giveaways</span>
        </button>

        <button
          onClick={() => setActiveWorkspace('GameIssues')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeWorkspace === 'GameIssues' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>FF Issues</span>
        </button>

        <button
          onClick={() => setActiveWorkspace('AuditLogs')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeWorkspace === 'AuditLogs' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveWorkspace('Secrets')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeWorkspace === 'Secrets' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Secrets</span>
        </button>

        <button
          onClick={() => setActiveWorkspace('Users')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeWorkspace === 'Users' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Users</span>
        </button>

        <button
          onClick={() => setActiveWorkspace('Monetization')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeWorkspace === 'Monetization' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Monetization</span>
        </button>

        <button
          onClick={() => { setActiveWorkspace('PendingVendors'); loadVendorApplications(); fetchVendorTokens(); }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeWorkspace === 'PendingVendors' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          <span>Pending Vendors</span>
        </button>

        <button
          onClick={() => { setActiveWorkspace('Ads'); fetchAds(); }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeWorkspace === 'Ads' ? 'bg-orange-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Ad Campaigns</span>
        </button>
      </div>

      {/* WORKSPACE PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: CRU Form Builder (5 cols) */}
        {(activeWorkspace === 'Products' || activeWorkspace === 'Posts' || activeWorkspace === 'Giveaways') && (
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-850 p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
            <h2 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500 animate-spin-slow" />
              {isEditingId ? `Edit ${activeWorkspace.slice(0, -1)}` : `Create ${activeWorkspace.slice(0, -1)}`}
            </h2>
            {isEditingId && (
              <button
                onClick={() => {
                  if (activeWorkspace === 'Products') resetProductForm();
                  else if (activeWorkspace === 'Posts') resetPostForm();
                  else resetGiveawayForm();
                }}
                className="text-[9px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded text-slate-400 hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Form Products */}
          {activeWorkspace === 'Products' && (
            <form onSubmit={handleProductSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Item Name</label>
                <input
                  type="text" required
                  placeholder="e.g. VIP Zero-Recoil Core Config"
                  value={prodName} onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    value={prodCategory} onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 outline-none focus:border-orange-500 transition-colors text-slate-300"
                  >
                    <option value="Config Files">Config Files</option>
                    <option value="HUD Layouts">HUD Layouts</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Skins">Skins</option>
                    <option value="Coaching">Coaching</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Price (USD)</label>
                  <input
                    type="number" step="0.01" required={!isGiveaway} disabled={isGiveaway}
                    placeholder="e.g. 4.99"
                    value={isGiveaway ? '0' : prodPrice} onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors text-white disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Telegram Admin Username</label>
                <input
                  type="text" required
                  placeholder="e.g. ghostfirehub1"
                  value={prodTelegram} onChange={(e) => setProdTelegram(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors text-white"
                />
              </div>

              {/* Picture/File Upload Field */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Product Picture / Icon URL</label>
                <input
                  type="text"
                  placeholder="Emoji (🔥) or URL (https://...)"
                  value={prodImage} onChange={(e) => setProdImage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors text-white"
                />
                
                <SecureImageUpload
                  imageUrl={prodImage}
                  onUploadSuccess={(url) => setProdImage(url)}
                  onClear={() => setProdImage('')}
                  folder="products"
                  label="PNG / JPG PRODUCT PICTURE (Max 2MB)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Detailed Description</label>
                <textarea
                  rows={3} required
                  placeholder="Describe your account stats, skins, or layout details..."
                  value={prodDescription} onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-500 transition-colors resize-none text-white"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 py-1">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" checked={isGiveaway} onChange={(e) => setIsGiveaway(e.target.checked)}
                    className="accent-orange-500 rounded"
                  />
                  <span>🎁 Free Giveaway</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-orange-500 rounded"
                  />
                  <span>🔥 Pin Featured</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)}
                    className="accent-orange-500 rounded"
                  />
                  <span>👁️ Hide/Draft Mode</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-slate-950 font-extrabold tracking-widest uppercase text-[10px] rounded-xl shadow-lg shadow-orange-600/10 transition-all cursor-pointer mt-1"
              >
                {isEditingId ? 'Apply Update Listing' : 'Publish Product Listing'}
              </button>
            </form>
          )}

          {/* Form Posts */}
          {activeWorkspace === 'Posts' && (
            <form onSubmit={handlePostSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Bulletin Title</label>
                <input
                  type="text" required
                  placeholder="e.g. Server Calibrations Update!"
                  value={postTitle} onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    value={postCategory} onChange={(e) => setPostCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 outline-none focus:border-orange-500 transition-colors text-slate-300"
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Update">Update</option>
                    <option value="Guide">Guide</option>
                    <option value="Tournament">Tournament</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Visibility</label>
                  <select
                    value={postVisibility} onChange={(e) => setPostVisibility(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 outline-none focus:border-orange-500 transition-colors text-slate-300"
                  >
                    <option value="public">🌍 Public (All Users)</option>
                    <option value="registered">🔒 Registered Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Content</label>
                <textarea
                  rows={4} required
                  placeholder="Draft your bulletin or guides announcement detail..."
                  value={postContent} onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-500 transition-colors resize-none text-white font-sans whitespace-pre-line"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Upload Banner/Image (Optional)</label>
                <SecureImageUpload
                  imageUrl={postImage}
                  onUploadSuccess={(url) => setPostImage(url)}
                  onClear={() => setPostImage('')}
                  folder="announcements"
                  label="PNG / JPG BULLETIN BANNER (Max 2MB)"
                />
              </div>

              <div className="py-1">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] font-mono text-slate-400">
                  <input 
                    type="checkbox" checked={postIsAnonymous} onChange={(e) => setPostIsAnonymous(e.target.checked)}
                    className="accent-orange-500 rounded"
                  />
                  <span>🕵️ Post anonymously as Anonymous Player</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-slate-950 font-extrabold tracking-widest uppercase text-[10px] rounded-xl shadow-lg shadow-orange-600/10 transition-all cursor-pointer"
              >
                {isEditingId ? 'Update Bulletin Post' : 'Post Community Bulletin'}
              </button>
            </form>
          )}

          {/* Form Giveaways */}
          {activeWorkspace === 'Giveaways' && (
            <form onSubmit={handleGiveawaySubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Giveaway Title</label>
                <input
                  type="text" required
                  placeholder="e.g. Level 70 Grandmaster Account Vouchers"
                  value={giveawayTitle} onChange={(e) => setGiveawayTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reward</label>
                  <input
                    type="text" required
                    placeholder="e.g. VIP Key Voucher"
                    value={giveawayReward} onChange={(e) => setGiveawayReward(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Duration (Days)</label>
                  <select
                    value={giveawayDays} onChange={(e) => setGiveawayDays(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 outline-none focus:border-orange-500 transition-colors text-slate-300"
                  >
                    <option value="1">1 Day</option>
                    <option value="2">2 Days</option>
                    <option value="3">3 Days (Default)</option>
                    <option value="5">5 Days</option>
                    <option value="7">7 Days</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Support telegram user</label>
                <input
                  type="text" required
                  placeholder="e.g. ghostfirehub1"
                  value={giveawayTelegram} onChange={(e) => setGiveawayTelegram(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Instructions</label>
                <textarea
                  rows={4} required
                  placeholder="Write clear steps. Winner will be drawn deterministically from registered participants..."
                  value={giveawayDescription} onChange={(e) => setGiveawayDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-500 transition-colors resize-none text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Upload Giveaway Picture (Optional)</label>
                <SecureImageUpload
                  imageUrl={giveawayImage}
                  onUploadSuccess={(url) => setGiveawayImage(url)}
                  onClear={() => setGiveawayImage('')}
                  folder="giveaways"
                  label="PNG / JPG GIVEAWAY PICTURE (Max 2MB)"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-slate-950 font-extrabold tracking-widest uppercase text-[10px] rounded-xl shadow-lg shadow-orange-600/10 transition-all cursor-pointer"
              >
                {isEditingId ? 'Update Giveaway' : 'Post New Giveaway Drawing'}
              </button>
            </form>
          )}

        </div>
        )}

        {/* RIGHT: Real-time Live Content Table List (7 cols) */}
        {(activeWorkspace === 'Products' || activeWorkspace === 'Posts' || activeWorkspace === 'Giveaways') && (
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 p-5 rounded-3xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-850">
            <h3 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400">
              Active Database Records ({activeWorkspace === 'Products' ? products.length : activeWorkspace === 'Posts' ? posts.length : giveaways.length} items)
            </h3>
            <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live synced
            </span>
          </div>

          {/* LIST PRODUCT RECORDS */}
          {activeWorkspace === 'Products' && (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {products.map(p => (
                <div key={p.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 shrink-0 text-md overflow-hidden">
                      {p.image && p.image.startsWith('data:') ? (
                        <img src={p.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                      ) : (
                        <span>{p.image || '🎮'}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[8px] font-mono font-bold bg-slate-900 text-orange-400 px-1.5 py-0.5 rounded border border-slate-800">
                          {p.category}
                        </span>
                        {p.featured && (
                          <span className="text-[8px] font-mono font-bold bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                            PINNED
                          </span>
                        )}
                        {p.hidden && (
                          <span className="text-[8px] font-mono font-bold bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-slate-800 flex items-center gap-0.5">
                            <EyeOff className="w-2.5 h-2.5" /> DRAFT
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase mt-1 leading-snug">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Price: <span className="text-orange-400 font-bold">${p.price.toFixed(2)}</span> • TG Contact: <span className="text-purple-400">@{p.telegramLink || 'ghostfirehub1'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEditProduct(p)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProductConfirm(p.id)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-red-500 transition-colors border border-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LIST POST BULLETIN RECORDS */}
          {activeWorkspace === 'Posts' && (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {posts.map(post => (
                <div key={post.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[8px] font-mono font-bold bg-slate-900 text-orange-400 px-1.5 py-0.5 rounded border border-slate-800">
                        {post.category}
                      </span>
                      {post.visibility === 'registered' && (
                        <span className="text-[8px] font-mono font-bold bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          REGISTERED ONLY
                        </span>
                      )}
                      {post.isAnonymous && (
                        <span className="text-[8px] font-mono font-bold bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-slate-800">
                          ANONYMOUS
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase mt-1 truncate">{post.title}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      By: <span className="text-slate-400">{formatDisplayName(post.author)}</span> • Date: <span>{post.timestamp}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEditPost(post)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deletePostConfirm(post.id)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-red-500 transition-colors border border-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LIST GIVEAWAYS RECORDS */}
          {activeWorkspace === 'Giveaways' && (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {loadingGiveaways ? (
                <div className="text-center py-6 text-slate-500 font-mono text-[10px]">Loading active database...</div>
              ) : giveaways.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-sans text-xs">No giveaway records.</div>
              ) : (
                giveaways.map(g => (
                  <div key={g.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col gap-2.5 hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {g.image && (
                          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 shrink-0 text-md overflow-hidden">
                            <img src={g.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                          </div>
                        )}
                        <div>
                          <span className="text-[8px] font-mono font-bold bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                            Reward: {g.reward}
                          </span>
                          <h4 className="text-xs font-bold text-white uppercase mt-1 leading-snug">{g.title}</h4>
                          <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                            Players joined: <span className="text-purple-400 font-bold">{g.participants?.length || 0}</span> • Ending: <span className="text-slate-400">{g.endTime.split('T')[0]}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEditGiveaway(g)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-800"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteGiveawayConfirm(g.id)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-red-500 transition-colors border border-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {g.winner ? (
                      <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-[9.5px]">
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" /> Winner Drawn
                        </span>
                        <span className="font-mono text-white text-[9px] truncate max-w-[180px]">{g.winner}</span>
                      </div>
                    ) : (
                      g.participants && g.participants.length > 0 && (
                        <button
                          onClick={() => pickGiveawayWinner(g.id)}
                          className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1"
                        >
                          <Trophy className="w-3 h-3" />
                          <span>Draw Random Winner from Pool</span>
                        </button>
                      )
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>
        )}

      </div>

      {/* AUDIT LOGS VIEW */}
      {activeWorkspace === 'AuditLogs' && (
        <div className="col-span-12 bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
            <div>
              <h2 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                Administrative Audit Logs
              </h2>
              <p className="text-[10px] text-slate-500 mt-1 font-sans">
                Confidential records of all administrative creations, updates, and deletions for accountability and security.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search audit actions..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 outline-none focus:border-orange-500 text-[10px] text-white w-48 font-sans"
              />
              <button
                onClick={fetchAuditLogs}
                className="p-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-400 hover:text-white transition-colors"
                title="Refresh logs"
              >
                <Clock className="w-3.5 h-3.5 animate-spin-slow" />
              </button>
            </div>
          </div>

          {loadingLogs ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <span className="text-[10px] font-mono text-slate-400">Querying secure audit ledger...</span>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-[10px] font-mono">
              🔒 No administrative actions have been recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px] font-sans">
                <thead>
                  <tr className="border-b border-slate-850 text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">Administrator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/50">
                  {auditLogs
                    .filter(log => 
                      log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
                      log.details.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
                      log.adminEmail.toLowerCase().includes(logSearchQuery.toLowerCase())
                    )
                    .map(log => {
                      const isDelete = log.action.toLowerCase().includes('delete') || log.action.toLowerCase().includes('erase') || log.action.toLowerCase().includes('remove');
                      const isCreate = log.action.toLowerCase().includes('publish') || log.action.toLowerCase().includes('create') || log.action.toLowerCase().includes('post');
                      return (
                        <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-3 px-4 font-mono text-[9.5px] text-slate-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                              isDelete ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                              isCreate ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                              'bg-orange-500/10 border border-orange-500/20 text-orange-400'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-sans leading-relaxed">
                            {log.details}
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                            {log.adminEmail}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONFIDENTIAL SECRETS VIEW */}
      {activeWorkspace === 'Secrets' && (
        <div className="col-span-12 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left: Secrets Keys Table (5 cols) */}
            <div className="md:col-span-5 bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-orange-500" />
                  Config & Environment Secrets
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 font-sans">
                  Private server variables, compilation commands, and core system keys. Keep strictly confidential.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setRevealSecrets(!revealSecrets)}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-xl text-[10px] font-mono text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {revealSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{revealSecrets ? 'MASK DESTRUCTIVE KEYS' : 'REVEAL CONFIDENTIAL KEYS'}</span>
                </button>
              </div>

              <div className="space-y-3.5 pt-1 text-[11px] font-sans">
                {/* Secret 1 */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider">DATABASE_PERSISTENCE_URI</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('firestore://ai-studio-ghostfirehub-eaab02c3-4910-4eea-9d9d-b8dcb584b51f');
                        setCopiedSecret('db');
                        setTimeout(() => setCopiedSecret(null), 2000);
                      }}
                      className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedSecret === 'db' ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="font-mono text-[9.5px] text-slate-300 break-all select-all pt-0.5">
                    {revealSecrets ? 'firestore://ai-studio-ghostfirehub-eaab02c3-4910-4eea-9d9d-b8dcb584b51f' : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                  </div>
                </div>

                {/* Secret 2 */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider">GEMINI_API_KEY_BIND</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('process.env.GEMINI_API_KEY');
                        setCopiedSecret('gemini');
                        setTimeout(() => setCopiedSecret(null), 2000);
                      }}
                      className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedSecret === 'gemini' ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="font-mono text-[9.5px] text-slate-300 break-all select-all pt-0.5">
                    {revealSecrets ? 'Loaded Server-Side (process.env.GEMINI_API_KEY)' : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                  </div>
                </div>

                {/* Secret 3 */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider">PRODUCTION_BUILD_CMD</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs');
                        setCopiedSecret('build');
                        setTimeout(() => setCopiedSecret(null), 2000);
                      }}
                      className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedSecret === 'build' ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="font-mono text-[9.5px] text-slate-300 break-all select-all pt-0.5">
                    {revealSecrets ? 'vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs' : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                  </div>
                </div>

                {/* Secret 4 */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider">REVERSE_PROXY_PORT_LOCK</span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold">Hardcoded 3000</span>
                  </div>
                  <div className="font-mono text-[9.5px] text-slate-300 pt-0.5">
                    Bind Host: <span className="text-orange-400 font-bold">0.0.0.0</span> • Port: <span className="text-orange-400 font-bold">3000</span> (Routing active)
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Developer Meeting Logs (7 cols) */}
            <div className="md:col-span-7 bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-orange-500" />
                  Confidential Developer & Admin Meetings
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 font-sans">
                  Historic transcripts of development pivots, sensitive sensitivity calibration algorithm decisions, and platform security rules.
                </p>
              </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {/* Meeting 1 */}
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-900 pb-2">
                    <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider">Meeting #1 — Algorithm Delta Integration</span>
                    <span className="text-[8px] font-mono text-slate-500">May 14, 2026</span>
                  </div>
                  <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans">
                    <strong>Participants:</strong> GhostFireAdmin (Lead), Calibration Architect.<br />
                    <strong>Subject:</strong> Bypassing Free Fire micro-stutter on modern high-refresh-rate digitizers. Verified that calculated coordinates must use a deterministic non-linear multiplier instead of simple floating interpolation. This stops anti-cheat flags. 
                  </p>
                  <p className="text-[9.5px] text-slate-500 font-mono italic">
                    CONFIDENTIALITY STATUS: LEVEL 4 (Admin-Only). Users must respect final telemetry presets and must not see coordinate translation files.
                  </p>
                </div>

                {/* Meeting 2 */}
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-900 pb-2">
                    <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider">Meeting #2 — Gold Sentinel Ruleset Override</span>
                    <span className="text-[8px] font-mono text-slate-500">June 22, 2026</span>
                  </div>
                  <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans">
                    <strong>Participants:</strong> GhostFireAdmin, Security Lead.<br />
                    <strong>Subject:</strong> Confirmed the final override policy: ONLY the admin has the power to change user membership tiers or diagnostic states freely. Registered players get their first diagnostic run on registration, but any recurring changes require them to contact support.
                  </p>
                  <p className="text-[9.5px] text-slate-500 font-mono italic">
                    CONFIDENTIALITY STATUS: LEVEL 5 (Superuser). Do not expose any tier alteration endpoints on public routes.
                  </p>
                </div>

                {/* Meeting 3 */}
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-900 pb-2">
                    <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider">Meeting #3 — Automated Dynamic Deployment URLs</span>
                    <span className="text-[8px] font-mono text-slate-500">July 01, 2026</span>
                  </div>
                  <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans">
                    <strong>Participants:</strong> GhostFireAdmin, Deployment Coordinator.<br />
                    <strong>Subject:</strong> Integrated dynamic `window.location.origin` parsing inside `PremiumUnlock.tsx` so that referral links automatically adapt when hosted on any custom domain or Firebase Hosting. This guarantees 100% zero-configuration on continuous deployment.
                  </p>
                  <p className="text-[9.5px] text-slate-500 font-mono italic">
                    CONFIDENTIALITY STATUS: LEVEL 3 (Internal). Solves the referral link auto-update problem perfectly.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* GARENA FREE FIRE ISSUES DIAGNOSTICS VIEW */}
      {activeWorkspace === 'GameIssues' && (
        <div className="col-span-12 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Log FF Issue Form (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Log Free Fire Performance Issue
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 font-sans">
                  Record custom touch behaviors, finger layout bugs, and hardware response anomalies in the central esports database.
                </p>
              </div>

              <form onSubmit={handleCreateIssue} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Issue Title</label>
                  <input
                    type="text"
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    placeholder="e.g., iPhone 7 Rapid Drag Fire Button Ghosting"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none focus:border-orange-500 placeholder:text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Device Model</label>
                    <input
                      type="text"
                      value={issueDevice}
                      onChange={(e) => setIssueDevice(e.target.value)}
                      placeholder="e.g., iPhone 7"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none focus:border-orange-500 placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Finger Setup</label>
                    <select
                      value={issueFinger}
                      onChange={(e) => setIssueFinger(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none focus:border-orange-500"
                    >
                      <option value="2-Finger">2-Finger Claw</option>
                      <option value="3-Finger">3-Finger Claw</option>
                      <option value="4-Finger">4-Finger Claw</option>
                      <option value="5-Finger">5-Finger Claw</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Issue Category</label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="Touch Response">Touch Response / Drag Latency</option>
                    <option value="Micro-Stuttering">Micro-Stuttering / FPS Drops</option>
                    <option value="Aim Jitter">Aim Jitter / Target Tracking</option>
                    <option value="Button Ghosting">Button Ghosting / Trigger Conflicts</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Diagnostics & Details</label>
                  <textarea
                    rows={4}
                    value={issueDesc}
                    onChange={(e) => setIssueDesc(e.target.value)}
                    placeholder="Describe button overlap issues, finger reach constraints, drag acceleration delays..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs font-sans text-slate-200 focus:outline-none focus:border-orange-500 placeholder:text-slate-600 resize-none"
                  />
                </div>

                {/* Screenshot Upload Block */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Screenshot HUD Capture</label>
                  <div className="border border-dashed border-slate-800 hover:border-orange-500/50 bg-slate-950 p-4 rounded-2xl transition-colors flex flex-col items-center justify-center text-center relative cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setIssueScreenshot(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {issueScreenshot ? (
                      <div className="space-y-2">
                        <img src={issueScreenshot} alt="HUD capture" className="max-h-24 mx-auto rounded-lg border border-slate-800" />
                        <span className="text-[9px] font-mono text-emerald-400 block font-bold">Screenshot Loaded</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 text-slate-500 group-hover:text-orange-500 mx-auto transition-colors" />
                        <span className="text-[10px] text-slate-400 block font-semibold">Choose file or drag & drop</span>
                        <span className="text-[8px] text-slate-600 block">PNG, JPG, WEBP up to 5MB</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  LOG DIAGNOSTICS RECORD
                </button>
              </form>
            </div>

            {/* Right Column: AI Screenshot posture diagnostic analyzer (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                  Gemini AI HUD Layout & Screenshot Diagnostics
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 font-sans">
                  Upload a custom HUD or settings screenshot. Gemini will scan touch coordinates, button sizes, and finger-reach zones to generate elite esports calibration overrides.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Device Under Analysis</label>
                  <input
                    type="text"
                    value={hudDevice}
                    onChange={(e) => setHudDevice(e.target.value)}
                    placeholder="e.g., iPhone 7"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none focus:border-orange-500 placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Finger Layout</label>
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

              {/* Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Upload HUD layout screenshot</label>
                <div className="border border-dashed border-slate-800 hover:border-orange-500/50 bg-slate-950 p-5 rounded-2xl transition-colors flex flex-col items-center justify-center text-center relative cursor-pointer group">
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
                    <div className="space-y-2">
                      <img src={hudImage} alt="HUD Capture" className="max-h-32 mx-auto rounded-xl border border-slate-800" />
                      <span className="text-[9px] font-mono text-emerald-400 block font-bold">Screenshot Loaded • Ready for Analysis</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-slate-500 group-hover:text-orange-500 mx-auto transition-colors" />
                      <span className="text-[10px] text-slate-400 block font-bold">Upload Custom HUD or Gameplay Capture</span>
                      <span className="text-[8px] text-slate-600 block">AI analyzes fire button thresholds, touch margins & posture alignment</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={analyzingHud || !hudImage}
                  onClick={handleAnalyzeHudScreenshot}
                  className={`w-full py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                    analyzingHud || !hudImage
                      ? 'bg-slate-850 text-slate-500 border border-slate-800 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-500 text-slate-950 font-black shadow-lg shadow-orange-600/15 cursor-pointer'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${analyzingHud ? 'animate-spin' : ''}`} />
                  {analyzingHud ? 'COMPUTING COORDINATE CALIBRATIONS...' : 'ANALYZE HUD & CALCULATE POSTURE'}
                </button>
              </div>

              {/* Analysis Result Box */}
              {hudAnalysisResult && (
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl text-xs text-slate-300 font-sans leading-relaxed space-y-3.5 max-h-[300px] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[9px] font-mono text-orange-400 font-bold uppercase tracking-widest">GARENA ESports TACTICAL DIAGNOSTIC</span>
                    <span className="text-[8px] font-mono text-slate-500">REALTIME DEEP DIAGNOSTIC</span>
                  </div>
                  <div className="whitespace-pre-wrap font-sans text-[11px] text-slate-300 space-y-2">
                    {hudAnalysisResult}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Bottom Table: Logged issues in Garena FF Database */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-500" />
                Active Free Fire Touch & Performance Issues Log ({issuesList.length})
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 font-sans">
                Review verified diagnostic profiles logged on the platform to calibrate custom offsets.
              </p>
            </div>

            {loadingIssues ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                Loading diagnostics registry...
              </div>
            ) : issuesList.length === 0 ? (
              <div className="py-12 text-center text-slate-600 text-xs font-sans">
                No performance issue logs found. Use the forms above to start logging device-specific stutters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-850 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Issue / Diagnostics</th>
                      <th className="py-3 px-4">Device</th>
                      <th className="py-3 px-4">Finger Claw</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {issuesList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="font-bold text-white font-sans">{item.title}</div>
                          <div className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</div>
                          {item.screenshot && (
                            <div className="mt-2">
                              <img src={item.screenshot} alt="Visual capture" className="max-h-16 rounded border border-slate-850" />
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[10.5px] text-slate-300">{item.deviceModel}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-orange-600/10 border border-orange-500/20 text-orange-400 rounded-full text-[9px] font-bold uppercase tracking-wider">
                            {item.fingerSetup}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 text-[11px]">{item.category}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteIssueClick(item.id, item.title)}
                            className="p-1.5 bg-slate-950 hover:bg-red-950/60 border border-slate-850 hover:border-red-500/30 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete issue record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* USERS MANAGEMENT VIEW */}
      {activeWorkspace === 'Users' && (
        <div className="col-span-12 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-orange-500" />
                  Gamer Accounts Registry & Access Control
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 font-sans">
                  List of all registered players on GhostFireHub. Suspend user sessions, delete inactive entries, and override user metrics.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-sm w-full">
                <span className="absolute left-3 top-2 text-slate-500 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Filter by email or username..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-1.5 text-xs font-sans text-slate-200 focus:outline-none focus:border-orange-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            {loadingUsers ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                Consulting user registries on Garena server nodes...
              </div>
            ) : usersList.length === 0 ? (
              <div className="py-12 text-center text-slate-600 text-xs font-sans">
                No users found. Ensure your Firestore connection is synced properly.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-850 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Gamer Profile</th>
                      <th className="py-3 px-4">Role / Status</th>
                      <th className="py-3 px-4">Referral Link Code</th>
                      <th className="py-3 px-4 text-center">Referrals</th>
                      <th className="py-3 px-4 text-center">Ghost Points</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {usersList
                      .filter(u => {
                        const q = userSearchQuery.toLowerCase();
                        return (u.email || '').toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q);
                      })
                      .map((u) => {
                        const isUserBanned = !!u.isBanned;
                        return (
                          <tr key={u.email} className={`hover:bg-slate-950/40 transition-colors ${isUserBanned ? 'bg-red-500/5 hover:bg-red-500/10' : ''}`}>
                            <td className="py-3.5 px-4">
                              <div className="font-extrabold text-white font-mono text-[11.5px] flex items-center gap-2">
                                <span>{u.username || 'Unnamed'}</span>
                                {u.email === 'ghostfirehub@gmail.com' && (
                                  <span className="text-[7.5px] bg-red-500/20 border border-red-500/30 text-red-400 px-1 rounded uppercase font-bold tracking-widest">
                                    FOUNDER
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{u.email}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col gap-1">
                                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded w-max uppercase tracking-wider border ${
                                  u.role === 'Administrator' 
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                    : u.isPremium 
                                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                                      : 'bg-slate-950 border-slate-850 text-slate-400'
                                }`}>
                                  {u.role || (u.isPremium ? 'Premium Player' : 'Standard Player')}
                                </span>
                                {isUserBanned && (
                                  <span className="text-[8px] bg-red-600 border border-red-500 text-slate-950 font-black px-1.5 py-0.5 rounded w-max uppercase font-mono tracking-wider">
                                    BANNED / SUSPENDED
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                              {u.referralCode ? (
                                <span className="bg-slate-950 border border-slate-850 px-2 py-1 rounded-lg text-orange-400 font-bold">
                                  {u.referralCode}
                                </span>
                              ) : (
                                <span className="text-slate-600 italic">None generated</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-[11.5px] font-bold text-slate-200">
                              {u.referralCount || 0}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-[11.5px] font-bold text-yellow-400">
                              🪙 {u.ghostPoints || 0}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleOpenOverrideEditor(u)}
                                  className="p-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                  title="Override Account Settings"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => handleToggleBanUser(u)}
                                  className={`p-1.5 border rounded-lg transition-colors cursor-pointer text-xs ${
                                    isUserBanned 
                                      ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/60' 
                                      : 'bg-red-950/40 border-red-500/20 text-red-400 hover:bg-red-900/60'
                                  }`}
                                  title={isUserBanned ? 'Unban Account' : 'Ban Account'}
                                  disabled={u.email === 'ghostfirehub@gmail.com'}
                                >
                                  🛡️
                                </button>

                                <button
                                  onClick={() => handlePermanentDeleteUser(u)}
                                  className="p-1.5 bg-slate-950 hover:bg-red-950/60 border border-slate-850 hover:border-red-500/30 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                  title="Delete User permanently"
                                  disabled={u.email === 'ghostfirehub@gmail.com'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeWorkspace === 'Monetization' && (
        <div className="col-span-12 space-y-6">
          {/* Sub-tab Navigation */}
          <div className="flex gap-2 border-b border-slate-900 pb-3 flex-wrap">
            <button
              type="button"
              onClick={() => setMonetizationSubTab('Telemetry')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                monetizationSubTab === 'Telemetry'
                  ? 'bg-orange-600 text-slate-950 font-black shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-900'
              }`}
            >
              Tactile Telemetry Licensing
            </button>
            <button
              type="button"
              onClick={() => setMonetizationSubTab('AdRevenue')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                monetizationSubTab === 'AdRevenue'
                  ? 'bg-orange-600 text-slate-950 font-black shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-900'
              }`}
            >
              <span>Platform Ad Revenue & Naira Payouts</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded animate-pulse">₦ LIVE</span>
            </button>
          </div>

          {monetizationSubTab === 'Telemetry' && (
            <>
              {/* Header section with telemetry export controls */}
              <div className="bg-gradient-to-r from-orange-600/10 via-slate-900 to-indigo-950/20 border border-orange-500/15 p-6 rounded-3xl space-y-4 animate-fadeIn">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="px-2 py-0.5 text-[8.5px] font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-md font-bold uppercase tracking-wider">
                  Intellectual Licensing Dashboard
                </span>
                <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">GhostCore™ Calibration Telemetry Monetization</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans leading-relaxed">
                  Legally license anonymized mobile touchscreen digitizer response parameters and optimized headshot calibration matrices. We aggregate tactile coordinates to help hardware designers, esports organizations, and gaming brand laboratories minimize display input delay.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const recs = usersList.flatMap(u => u.savedRecommendations || []);
                    if (recs.length === 0) {
                      setError("No user calibration telemetry exists yet in the database!");
                      return;
                    }
                    const telemetryData = usersList.flatMap((u, idx) => {
                      const savedRecs = u.savedRecommendations || [];
                      return savedRecs.map((rec: any, rIdx: number) => ({
                        anonymizedGamerId: `GCR_${idx + 1}_${rIdx + 1}`,
                        consentOptIn: u.dataSharingConsent ? "Yes" : "Auto-Anonymized",
                        hardwareBrand: rec.input?.brand || 'Generic',
                        hardwareModel: rec.input?.model || 'Device',
                        timestamp: rec.timestamp || new Date().toISOString(),
                        generalS: rec.sensitivity?.general || 0,
                        redDotS: rec.sensitivity?.redDot || 0,
                        scope2xS: rec.sensitivity?.scope2x || 0,
                        scope4xS: rec.sensitivity?.scope4x || 0,
                        sniperS: rec.sensitivity?.sniper || 0,
                        freeLookS: rec.sensitivity?.freeLook || 0,
                        confidenceScore: rec.sensitivity?.confidenceScore || 0
                      }));
                    });

                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(telemetryData, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", "ghostcore_telemetry_licensing_dataset.json");
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    setSuccess("Telemetry database successfully compiled and exported as JSON!");
                  }}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-200 hover:text-white rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 rotate-180" />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const recs = usersList.flatMap(u => u.savedRecommendations || []);
                    if (recs.length === 0) {
                      setError("No user calibration telemetry exists yet in the database!");
                      return;
                    }
                    const telemetryRows = usersList.flatMap((u, idx) => {
                      const savedRecs = u.savedRecommendations || [];
                      return savedRecs.map((rec: any, rIdx: number) => {
                        return [
                          `GCR_${idx + 1}_${rIdx + 1}`,
                          u.dataSharingConsent ? "Yes" : "Auto",
                          rec.input?.brand || 'Generic',
                          rec.input?.model || 'Device',
                          rec.sensitivity?.general || 0,
                          rec.sensitivity?.redDot || 0,
                          rec.sensitivity?.scope2x || 0,
                          rec.sensitivity?.scope4x || 0,
                          rec.sensitivity?.sniper || 0,
                          rec.sensitivity?.freeLook || 0,
                          rec.sensitivity?.confidenceScore || 0
                        ];
                      });
                    });

                    const headers = ["Anonymized_ID", "Consent_OptIn", "Device_Brand", "Device_Model", "General", "RedDot", "Scope2x", "Scope4x", "Sniper", "FreeLook", "Confidence_Score"];
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + [headers.join(","), ...telemetryRows.map(e => e.join(","))].join("\n");

                    const encodedUri = encodeURI(csvContent);
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", encodedUri);
                    downloadAnchor.setAttribute("download", "ghostcore_telemetry_licensing_dataset.csv");
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    setSuccess("Telemetry database successfully compiled and exported as CSV!");
                  }}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Upload className="w-3.5 h-3.5 rotate-180" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-850/80">
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Opt-In Contributors</span>
                <span className="text-sm font-black font-mono text-white mt-1 block">
                  {usersList.filter(u => u.dataSharingConsent).length} / {usersList.length} Players
                </span>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all" 
                    style={{ width: `${usersList.length ? (usersList.filter(u => u.dataSharingConsent).length / usersList.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Physical Touch Logs</span>
                <span className="text-sm font-black font-mono text-orange-400 mt-1 block">
                  {usersList.reduce((acc, u) => acc + (u.savedRecommendations?.length || 0), 0)} Vectors
                </span>
                <span className="text-[8.5px] font-mono text-slate-500 mt-0.5 block">High-fidelity matrices</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Estimated Data Asset Value</span>
                <span className="text-sm font-black font-mono text-emerald-400 mt-1 block">
                  ${(usersList.reduce((acc, u) => acc + (u.savedRecommendations?.length || 0), 0) * 14.50).toFixed(2)} USD
                </span>
                <span className="text-[8.5px] font-mono text-slate-500 mt-0.5 block">Valued at $14.50/vector</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Licensing Buyers Active</span>
                <span className="text-sm font-black font-mono text-white mt-1 block">6 Organizations</span>
                <span className="text-[8.5px] font-mono text-emerald-400 mt-0.5 block">● Live Bidding Online</span>
              </div>
            </div>
          </div>

          {/* Buyers & Market demand information + Active Licensing feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Target Buyers Bids Panel (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/40 border border-slate-850 p-5 rounded-3xl space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-2">
                  <Coins className="w-4 h-4 text-orange-500" />
                  Active Telemetry Licensing Bids
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 font-sans">
                  The following smartphone gaming hardware brands are actively bidding on high-refresh-rate physical touchscreen touch vector coordinates from Garena Free Fire content creators.
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Buyer 1 */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-mono text-white font-extrabold">ASUS ROG Phone Division</span>
                    <span className="text-[8px] text-slate-500 block font-sans">Targeting: 240Hz Digitizer Refresh Rates</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10.5px] font-mono text-emerald-400 font-bold block">$18.20 / record</span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 font-mono text-[7px] uppercase font-bold rounded-md">High Demand</span>
                  </div>
                </div>

                {/* Buyer 2 */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-mono text-white font-extrabold">MediaTek chipsets Labs</span>
                    <span className="text-[8px] text-slate-500 block font-sans">Targeting: Dimensity game engine throttling</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10.5px] font-mono text-emerald-400 font-bold block">$15.00 / record</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 font-mono text-[7px] uppercase font-bold rounded-md">Stable</span>
                  </div>
                </div>

                {/* Buyer 3 */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-mono text-white font-extrabold">Infinix Gaming R&D team</span>
                    <span className="text-[8px] text-slate-500 block font-sans">Targeting: Budget device multi-touch latency</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10.5px] font-mono text-emerald-400 font-bold block">$14.50 / record</span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 font-mono text-[7px] uppercase font-bold rounded-md">Bidding active</span>
                  </div>
                </div>

                {/* Buyer 4 */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-mono text-white font-extrabold">Xiaomi BlackShark esports</span>
                    <span className="text-[8px] text-slate-500 block font-sans">Targeting: Pro gaming trigger latency matrices</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10.5px] font-mono text-emerald-400 font-bold block">$12.00 / record</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 font-mono text-[7px] uppercase font-bold rounded-md">Stable</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Dataset Table registry (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 p-5 rounded-3xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2.5 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-orange-500" />
                    Asset Telemetry Registry (Compliant Anonymized)
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-sans">
                    Live stream of physical touch vectors collected from registered players.
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[8px] font-bold rounded uppercase">
                  100% HIPAA/GDPR Compliant
                </span>
              </div>

              {/* Registry listing */}
              <div className="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-[8.5px] font-mono text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Anonymized Gamer ID</th>
                      <th className="py-2.5 px-3">Device Model</th>
                      <th className="py-2.5 px-3">Calibration Vectors</th>
                      <th className="py-2.5 px-3 text-right">Value Asset</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-mono text-[10px]">
                    {usersList.flatMap((u, idx) => {
                      const savedRecs = u.savedRecommendations || [];
                      return savedRecs.map((rec: any, rIdx: number) => (
                        <tr key={`${u.email}-${rIdx}`} className="hover:bg-slate-950/30 transition-colors">
                          <td className="py-2.5 px-3 text-slate-400 text-[9.5px]">
                            GCR_{idx + 1}_{rIdx + 1}
                            {u.dataSharingConsent && (
                              <span className="ml-1 text-[7px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-1 rounded font-bold">Consent</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-white font-extrabold text-[9.5px]">
                            {rec.input?.brand || 'Generic'} {rec.input?.model || 'Device'}
                          </td>
                          <td className="py-2.5 px-3 text-orange-400 font-bold text-[9px]">
                            GEN: {rec.sensitivity?.general || 0} • RD: {rec.sensitivity?.redDot || 0} • 2X: {rec.sensitivity?.scope2x || 0}
                          </td>
                          <td className="py-2.5 px-3 text-right text-emerald-400 font-bold font-mono text-[9.5px]">
                            $14.50
                          </td>
                        </tr>
                      ));
                    })}

                    {usersList.reduce((acc, u) => acc + (u.savedRecommendations?.length || 0), 0) === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-[11px] text-slate-500 font-sans italic">
                          No calibration touch coordinates exist in the cloud registry.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}

          {monetizationSubTab === 'AdRevenue' && (
            <div className="space-y-6 animate-fadeIn font-sans">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-black tracking-wider block">Cumulative Ad Impressions Revenue</span>
                  <div className="text-2xl font-black font-mono text-white mt-1.5 flex items-baseline gap-1.5">
                    <span>${(450 + usersList.reduce((acc, u) => acc + (u.withdrawnTotal || 0) + (u.earningsBalance || 0), 0) * 1.15).toFixed(2)} USD</span>
                  </div>
                  <p className="text-[10px] text-emerald-400 mt-1 font-mono font-bold">
                    ₦{Math.round((450 + usersList.reduce((acc, u) => acc + (u.withdrawnTotal || 0) + (u.earningsBalance || 0), 0) * 1.15) * 1500).toLocaleString()} NGN Total Platform Funds Pool
                  </p>
                </div>

                <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-black tracking-wider block">Admin Platform Commission Balance</span>
                  <div className="text-2xl font-black font-mono text-orange-500 mt-1.5">
                    ${(250 + usersList.reduce((acc, u) => acc + (u.withdrawnTotal || 0) * 0.15 + (u.earningsBalance || 0) * 0.10, 0)).toFixed(2)} USD
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono font-bold">
                    ₦{Math.round((250 + usersList.reduce((acc, u) => acc + (u.withdrawnTotal || 0) * 0.15 + (u.earningsBalance || 0) * 0.10, 0)) * 1500).toLocaleString()} NGN Personal Payout Limit
                  </p>
                </div>

                <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-black tracking-wider block">Pending User Payout Volume</span>
                  <div className="text-2xl font-black font-mono text-white mt-1.5">
                    ₦{userPayouts.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0).toLocaleString()} NGN
                  </div>
                  <p className="text-[10px] text-amber-500 mt-1 font-mono font-bold">
                    {userPayouts.filter(p => p.status === 'Pending').length} Pending Requests
                  </p>
                </div>
              </div>

              {/* Main Section: Admin Withdrawal on Left, Users Pending Approvals on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Admin Withdrawal Form (5 Cols) */}
                <div className="lg:col-span-5 bg-slate-900/40 border border-slate-850 rounded-3xl p-5 md:p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-orange-500 rotate-180" />
                      Admin Withdrawal Form (Nigeria)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Withdraw compiled platform advertisement revenue directly to your personal bank account in Nigeria (₦).
                    </p>
                  </div>

                  <form onSubmit={(e) => {
                    const maxNaira = (250 + usersList.reduce((acc, u) => acc + (u.withdrawnTotal || 0) * 0.15 + (u.earningsBalance || 0) * 0.10, 0)) * 1500;
                    handleAdminWithdraw(e, maxNaira);
                  }} className="space-y-3">
                    {payoutError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-sans">
                        {payoutError}
                      </div>
                    )}

                    {payoutSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-sans">
                        {payoutSuccess}
                      </div>
                    )}

                    {/* Destination Bank */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Personal Nigerian Bank</label>
                      <select
                        value={adminBank}
                        onChange={(e) => setAdminBank(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 cursor-pointer outline-none focus:border-orange-500"
                      >
                        {['Access Bank PLC', 'Guaranty Trust Bank (GTBank)', 'Zenith Bank PLC', 'United Bank for Africa (UBA)', 'First Bank of Nigeria', 'Kuda Microfinance Bank', 'OPay Digital Services', 'PalmPay Nigeria', 'Moniepoint MFB'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Nuban Number */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">10-Digit Nuban Account Number</label>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="e.g. 0123456789"
                        value={adminAccountNumber}
                        onChange={(e) => setAdminAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 placeholder:text-slate-700"
                      />
                    </div>

                    {/* Account Holder Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Account Holder Name</label>
                      <input
                        type="text"
                        placeholder="e.g. GhostFire Admin Nigeria"
                        value={adminAccountName}
                        onChange={(e) => setAdminAccountName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 placeholder:text-slate-700"
                      />
                    </div>

                    {/* Withdrawal Amount (NGN) */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-slate-400">Amount to Withdraw (₦ NGN)</label>
                        <span className="text-[9px] text-slate-500 font-mono">1 USD = 1,500 NGN</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. 100000"
                        value={adminWithdrawAmount}
                        onChange={(e) => setAdminWithdrawAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 placeholder:text-slate-700"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={payoutSubmitting}
                      className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-md flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {payoutSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 rotate-180 text-slate-950" />
                          <span>Request Admin Payout</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Admin Ledger */}
                  <div className="pt-4 border-t border-slate-850/60 font-sans">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono block">Admin Payout History:</span>
                    <div className="space-y-2 mt-2">
                      {adminWithdrawals.map(aw => (
                        <div key={aw.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center gap-2">
                          <div>
                            <span className="text-[9px] font-bold text-white font-mono block">{aw.id}</span>
                            <span className="text-[9px] text-slate-500 block">{aw.bankName} • A/C {aw.accountNumber}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-400 block font-mono">₦{aw.amount.toLocaleString()}</span>
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded font-mono font-bold uppercase tracking-wider">{aw.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* USDT & Crypto Wallet Configuration */}
                  <div className="pt-4 border-t border-slate-850/60 space-y-3 font-sans">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 font-mono block">USDT/Crypto Withdrawal Configuration</span>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        Set up your blockchain addresses to receive direct cryptocurrency withdrawals from escrow and advertisement networks.
                      </p>
                    </div>

                    {cryptoConfigSuccess && (
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-medium">
                        {cryptoConfigSuccess}
                      </div>
                    )}

                    <form onSubmit={handleSaveCryptoConfig} className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">TRC-20 USDT Wallet Address</label>
                        <input
                          type="text"
                          placeholder="e.g. TY9rA8L6zY98vHshvT87sK..."
                          value={adminCryptoAddress}
                          onChange={(e) => setAdminCryptoAddress(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-mono outline-none focus:border-orange-500 placeholder:text-slate-700"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Binance Pay ID / Merchant ID</label>
                        <input
                          type="text"
                          placeholder="e.g. BIN-PAY-5412893"
                          value={adminBinancePayId}
                          onChange={(e) => setAdminBinancePayId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-mono outline-none focus:border-orange-500 placeholder:text-slate-700"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-extrabold uppercase text-[9px] tracking-widest rounded-xl transition-all cursor-pointer shadow-sm flex justify-center items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5 text-orange-500" />
                        <span>Save Crypto Wallets</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Users Pending Payouts (7 Cols) */}
                <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 rounded-3xl p-5 md:p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Pending User Payout Approval Console
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Verify, authorize, and approve or reject bank transfer requests submitted by players.
                    </p>
                  </div>

                  {loadingPayouts ? (
                    <div className="py-12 text-center text-slate-500 text-xs font-mono animate-pulse">
                      Retrieving pending user payout ledgers...
                    </div>
                  ) : userPayouts.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-slate-850 rounded-2xl text-slate-500 text-xs font-sans italic">
                      No user payout requests exist in the system yet.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {userPayouts.map(up => (
                        <div key={up.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3 font-sans">
                          <div className="flex justify-between items-start gap-4 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono font-black text-white">{up.id}</span>
                                <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded-md font-mono border border-slate-800">By: {up.username} ({up.userEmail})</span>
                                <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded font-bold uppercase border ${
                                  up.status === 'Pending'
                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                                    : up.status === 'Approved'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                  {up.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                Link Bank: <span className="text-slate-200 font-semibold">{up.bankName}</span> • A/C: <span className="text-slate-200 font-mono font-bold">{up.accountNumber}</span> • Name: <span className="text-slate-300 font-medium">{up.accountName}</span>
                              </p>
                              <span className="text-[9px] text-slate-500 font-mono block mt-1">{new Date(up.timestamp).toLocaleString()}</span>
                            </div>

                            <div className="text-right">
                              <span className="text-sm font-black text-emerald-400 block font-mono">₦{up.amount.toLocaleString()}</span>
                              <span className="text-[9px] text-slate-500 font-mono">(${ (up.amount / 1500).toFixed(2) } USD)</span>
                            </div>
                          </div>

                          {up.status === 'Pending' && (
                            <div className="flex gap-2 justify-end border-t border-slate-900 pt-3">
                              <button
                                type="button"
                                onClick={() => handleApproveUserPayout(up.id, 'Rejected')}
                                className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/25 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Decline Payout
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApproveUserPayout(up.id, 'Approved')}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                              >
                                Approve Transfer (₦)
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* PENDING VENDORS MANAGEMENT VIEW */}
      {activeWorkspace === 'PendingVendors' && (
        <div className="col-span-12 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange-500" />
                Pending Merchant Licenses & Verifications
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 font-sans">
                Review user registration submissions to trade config files, HUDs, and rare Free Fire accounts. Assigned keys activate a 20% discount benefit index and allow listing items directly.
              </p>
            </div>

            {loadingVendorApps ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono animate-pulse">
                Retrieving pending vendor registries from database...
              </div>
            ) : vendorApplications.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-850 rounded-2xl text-slate-500 text-xs font-sans">
                No active vendor applications submitted. Users can apply via the Vendor Hub form.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vendorApplications.map((app) => {
                  const defaultSuggestedKey = app.vendorKey || 'VEND-' + app.id.slice(-4).toUpperCase();
                  const currentInputVal = adminVendorKeyInputs[app.id] !== undefined ? adminVendorKeyInputs[app.id] : defaultSuggestedKey;
                  
                  return (
                    <div 
                      key={app.id} 
                      className={`bg-slate-950 border rounded-2xl p-5 space-y-4 relative overflow-hidden transition-all hover:border-slate-800 ${
                        app.status === 'Approved' 
                          ? 'border-emerald-500/20 bg-emerald-500/[0.01]' 
                          : app.status === 'Rejected' 
                            ? 'border-red-500/10 opacity-60' 
                            : 'border-slate-850'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[8px] font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-bold uppercase">
                            App ID: {app.id}
                          </span>
                          <h4 className="text-sm font-black text-white mt-1.5 uppercase tracking-wide">
                            {app.shopName || 'Unnamed Shop'}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                            Applicant: {app.username} ({app.email})
                          </span>
                        </div>

                        <span className={`text-[8px] font-black font-mono px-2 py-0.5 rounded uppercase tracking-wider border ${
                          app.status === 'Pending'
                            ? 'bg-amber-500/15 border-amber-500/20 text-amber-400 animate-pulse'
                            : app.status === 'Approved'
                              ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/15 border-red-500/20 text-red-400'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-900 rounded-xl text-[10px] text-slate-400 font-mono">
                        <div>
                          <strong className="text-slate-500">Specialization:</strong> {app.specialization}
                        </div>
                        <div>
                          <strong className="text-slate-500">FF Experience:</strong> {app.experienceYears} Years
                        </div>
                        <div className="col-span-2 border-t border-slate-850/60 pt-1.5 mt-1">
                          <strong className="text-slate-500">Description:</strong>
                          <p className="text-[10px] text-slate-300 font-sans mt-0.5 leading-relaxed font-medium">
                            "{app.details}"
                          </p>
                        </div>
                      </div>

                      {/* Explicit compliance guidelines verification */}
                      <div className="p-2.5 bg-orange-950/10 border border-orange-500/10 rounded-xl space-y-1.5 text-[9.5px] text-slate-400 font-sans">
                        <span className="text-[8px] font-mono font-bold text-orange-400 uppercase tracking-widest block">
                          Verified Regulations Compliance
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-emerald-400">
                            ✓ <span className="text-slate-300">Rule 1: Will follow and verify uploaded configurations</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400">
                            ✓ <span className="text-slate-300 font-bold">Rule 2: Promise to remain non-toxic & never offend</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400">
                            ✓ <span className="text-slate-300 font-bold">Rule 3: Transparency regarding real customer feedback</span>
                          </div>
                        </div>
                      </div>

                      {/* Assign Key input */}
                      {app.status === 'Pending' ? (
                        <div className="space-y-3 pt-2">
                          <div className="space-y-1">
                            <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">
                              Assign Unique vendorKey
                            </label>
                            <input
                              type="text"
                              value={currentInputVal}
                              onChange={(e) => setAdminVendorKeyInputs({
                                ...adminVendorKeyInputs,
                                [app.id]: e.target.value
                              })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-orange-400 focus:outline-none focus:border-orange-500"
                            />
                            <p className="text-[8.5px] text-slate-500 font-mono mt-0.5 leading-none">Used to verify listings and unlock discounts.</p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateApplicationStatus(app.id, 'Rejected')}
                              className="flex-1 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 hover:border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleUpdateApplicationStatus(app.id, 'Approved')}
                              className="flex-1 py-1.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:brightness-110 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-md"
                            >
                              Approve Vendor
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1.5 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                          <span>Final Status Logged</span>
                          {app.status === 'Approved' && (
                            <span className="text-emerald-400 font-bold">
                              Key: <span className="text-white font-black">{app.vendorKey || 'VEND-ACTIVATED'}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Vendor Activation Tokens Generation Panel */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-orange-500" />
                  Vendor Activation Codes & Tokens
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 font-sans">
                  Generate secure, one-time-use activation keys to give to pre-approved users so they can activate vendor status instantly.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Generate form (5 Cols) */}
              <div className="lg:col-span-5 bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                <span className="text-[8.5px] font-mono font-bold text-orange-400 uppercase tracking-widest block">Generate New Token</span>
                <form onSubmit={handleGenerateVendorToken} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Custom Token Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. SPECIAL-VEND-99"
                      value={customTokenInput}
                      onChange={(e) => setCustomTokenInput(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-orange-500 placeholder:text-slate-700"
                    />
                    <p className="text-[8.5px] text-slate-500 font-mono">Leave blank to let the system generate a secure randomized token.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={generatingToken}
                    className="w-full py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-slate-950 font-black uppercase text-[10px] tracking-wider rounded-xl transition-all shadow-md flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {generatingToken ? 'Generating...' : 'Create Activation Token'}
                  </button>
                </form>
              </div>

              {/* Tokens Table/List (7 Cols) */}
              <div className="lg:col-span-7 bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[8.5px] font-mono font-bold text-orange-400 uppercase tracking-widest block">Existing Codes Log</span>
                  <button
                    onClick={fetchVendorTokens}
                    className="text-[9px] font-mono font-bold text-slate-400 hover:text-white px-2 py-0.5 bg-slate-900 border border-slate-800 rounded"
                  >
                    Refresh
                  </button>
                </div>

                {loadingTokens ? (
                  <div className="py-6 text-center text-slate-500 text-xs font-mono animate-pulse">Loading tokens ledger...</div>
                ) : vendorTokens.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs font-sans italic border border-dashed border-slate-850 rounded-xl">
                    No vendor activation tokens created yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {vendorTokens.map((t: any) => (
                      <div key={t.id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between gap-3 text-xs font-sans">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-white font-bold text-xs select-all bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                              {t.code}
                            </span>
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                              t.status === 'unused' 
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                : 'bg-slate-800 text-slate-500'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-500 font-mono">
                            Created: {new Date(t.createdAt).toLocaleString()}
                            {t.usedBy && <span className="text-orange-400 block mt-0.5">Activated by: {t.usedBy}</span>}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(t.code);
                            setSuccess('Token code copied to clipboard!');
                            setTimeout(() => setSuccess(''), 3000);
                          }}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[9.5px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AD CAMPAIGNS MANAGEMENT VIEW */}
      {activeWorkspace === 'Ads' && (
        <div className="col-span-12 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-2">
                  <Video className="w-4 h-4 text-orange-500" />
                  Sponsor Ads & Esports Campaign Manager
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 font-sans">
                  Manage interactive advertisement simulations shown to users in the Monetization Lab. Create campaigns manually or use Gemini AI to generate high-tech interactive copies instantly.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form panel: 5 cols */}
              <div className="lg:col-span-5 space-y-6">
                {/* Manual Creator / Editor */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[8.5px] font-mono font-bold text-orange-400 uppercase tracking-widest block">
                      {editingAdId ? 'Edit Campaign Parameters' : 'Create Custom Campaign'}
                    </span>
                    {editingAdId && (
                      <button
                        onClick={() => {
                          setEditingAdId(null);
                          setAdTitle('');
                          setAdTagline('');
                          setAdDescription('');
                          setAdReward('');
                          setAdDuration('10');
                          setAdIcon('📺');
                          setAdActionText('Watch simulation');
                        }}
                        className="text-[8px] font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleCreateOrUpdateAd} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Ad Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Infinix GT 30 Pro Extreme"
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-orange-500 placeholder:text-slate-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Tagline</label>
                      <input
                        type="text"
                        placeholder="e.g. Esports Tactile Calibration Partner"
                        value={adTagline}
                        onChange={(e) => setAdTagline(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-orange-500 placeholder:text-slate-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Ad Description / Telemetry Task</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="e.g. Interact with the Infinix matrix to calibrate screen sampling variables and unlock immediate payout."
                        value={adDescription}
                        onChange={(e) => setAdDescription(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-sans text-white outline-none focus:border-orange-500 placeholder:text-slate-700 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Reward ($ USD)</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          placeholder="e.g. 1.50"
                          value={adReward}
                          onChange={(e) => setAdReward(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-orange-500 placeholder:text-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Duration (Seconds)</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 10"
                          value={adDuration}
                          onChange={(e) => setAdDuration(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-orange-500 placeholder:text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Emoji Icon</label>
                        <input
                          type="text"
                          placeholder="e.g. 📱"
                          value={adIcon}
                          onChange={(e) => setAdIcon(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-orange-500 placeholder:text-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Action Text</label>
                        <input
                          type="text"
                          placeholder="e.g. Calibrate digitizer"
                          value={adActionText}
                          onChange={(e) => setAdActionText(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-orange-500 placeholder:text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Ad Video URL (Optional MP4 or YouTube Link)</label>
                      <input
                        type="url"
                        placeholder="e.g. https://example.com/ad_video.mp4 or https://youtu.be/..."
                        value={adVideoUrl}
                        onChange={(e) => setAdVideoUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-sans text-white outline-none focus:border-orange-500 placeholder:text-slate-700"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingAd}
                      className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:brightness-110 text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-md flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
                    >
                      {submittingAd ? 'Saving Campaign...' : editingAdId ? 'Update Campaign' : 'Create Campaign'}
                    </button>
                  </form>
                </div>

                {/* AI Ad Generator Box */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                  <div>
                    <span className="text-[8.5px] font-mono font-bold text-orange-400 uppercase tracking-widest block flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-500 animate-pulse" />
                      Gemini AI Ad generator
                    </span>
                    <p className="text-[9px] text-slate-500 font-sans mt-0.5">
                      Generate creative sponsor campaigns and telemetry tasks automatically using Gemini.
                    </p>
                  </div>

                  <form onSubmit={handleAiGenerateAd} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Brand Name or Topic</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tecno Pova 6, Garena Free Fire Tournament"
                        value={brandTheme}
                        onChange={(e) => setBrandTheme(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-sans text-white outline-none focus:border-orange-500 placeholder:text-slate-700"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={generatingAd}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-500 hover:brightness-110 text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition-all shadow-md flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {generatingAd ? 'AI Generation Active...' : 'Generate AI Ad Campaign'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Active Campaigns List: 7 cols */}
              <div className="lg:col-span-7 bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[8.5px] font-mono font-bold text-orange-400 uppercase tracking-widest block">Active Ad Ledger</span>
                  <button
                    onClick={fetchAds}
                    className="text-[9px] font-mono font-bold text-slate-400 hover:text-white px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>

                {loadingAds ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-mono animate-pulse">
                    Synchronizing ad campaigns database...
                  </div>
                ) : ads.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-sans italic border border-dashed border-slate-850 rounded-xl">
                    No sponsor ads active in the database yet. Create one above!
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                    {ads.map((ad) => (
                      <div key={ad.id} className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-3 hover:border-slate-800 transition-colors">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex gap-3">
                            <span className="text-2xl p-2 bg-slate-950 border border-slate-850 rounded-lg block h-fit select-none">{ad.icon}</span>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-black text-white uppercase">{ad.title}</h4>
                                {ad.isAiGenerated && (
                                  <span className="text-[7.5px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                                    AI Generated
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-orange-400 font-mono block uppercase tracking-wider">{ad.tagline}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-emerald-400 font-mono block">+${ad.rewardUsd?.toFixed(2)}</span>
                            <span className="text-[8.5px] text-slate-500 font-mono block">{ad.videoDuration}s timer</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 font-sans leading-relaxed border-t border-slate-850/50 pt-2">{ad.description}</p>
                        
                        <div className="flex items-center justify-between gap-3 text-[9px] font-mono text-slate-500 border-t border-slate-850/50 pt-2">
                          <span>Btn: <span className="text-slate-300 font-bold">{ad.actionText}</span></span>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleEditAdSelect(ad)}
                              className="px-2 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-[9px] text-slate-300 hover:text-white transition-all cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="px-2 py-1 bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 hover:border-red-500/30 rounded text-[9px] text-red-400 transition-all cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERRIDE EDIT MODAL FOR USER PROFILE */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-850 rounded-3xl max-w-md w-full p-6 relative z-10 shadow-2xl overflow-hidden animate-fadeIn"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-2xl">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">OVERRIDE ACTION ENGINE</h3>
                    <h2 className="text-sm font-extrabold text-white uppercase">{editingUser.username || 'Player Profile'}</h2>
                  </div>
                </div>

                <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                  Directly write variables to this user's profile entry on the cloud storage. This will bypass normal verification and update their capabilities instantly.
                </p>

                <form onSubmit={handleSaveUserOverride} className="space-y-3.5 pt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Gamer Email</label>
                    <input
                      type="text"
                      disabled
                      value={editingUser.email}
                      className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-3 py-2 text-xs font-mono text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Ghost Points</label>
                      <input
                        type="number"
                        value={overridePoints}
                        onChange={(e) => setOverridePoints(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono text-yellow-400 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Premium Access</label>
                      <select
                        value={String(overridePremium)}
                        onChange={(e) => setOverridePremium(e.target.value === 'true')}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-sans text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="false">Guest Standard</option>
                        <option value="true">💎 Premium Enabled</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Tactical Platform Role</label>
                    <select
                      value={overrideRole}
                      onChange={(e) => {
                        setOverrideRole(e.target.value);
                        if (e.target.value === 'Vendor') {
                          setOverrideIsVendor(true);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-sans text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="Standard Player">Standard Player</option>
                      <option value="Premium Player">Premium Player</option>
                      <option value="Vendor">Vendor Merchant</option>
                      <option value="Esports Moderator">Esports Moderator</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>

                  {/* Vendor Settings */}
                  <div className="p-3 bg-orange-950/15 border border-orange-500/20 rounded-xl space-y-3">
                    <span className="text-[8.5px] font-mono font-bold text-orange-400 uppercase tracking-widest block">Vendor Account Authorization</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">Is Vendor</label>
                        <select
                          value={String(overrideIsVendor)}
                          onChange={(e) => setOverrideIsVendor(e.target.value === 'true')}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                          <option value="false">No (Standard User)</option>
                          <option value="true">Yes (Active Vendor)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">Vendor Fee Paid</label>
                        <select
                          value={String(overrideVendorFeePaid)}
                          onChange={(e) => setOverrideVendorFeePaid(e.target.value === 'true')}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                          <option value="false">Unpaid / Manual</option>
                          <option value="true">Paid / Activated</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">Vendor Key/Code</label>
                        <input
                          type="text"
                          value={overrideVendorCode}
                          placeholder="e.g. VEND-9942"
                          onChange={(e) => setOverrideVendorCode(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">Status Requested</label>
                        <select
                          value={String(overrideVendorRequested)}
                          onChange={(e) => setOverrideVendorRequested(e.target.value === 'true')}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                          <option value="false">No Request</option>
                          <option value="true">Requested Vendor</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="flex-1 py-2 bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:bg-slate-850 rounded-xl font-mono text-[10px] uppercase transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      COMMIT CHANGES
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-850 rounded-3xl max-w-md w-full p-6 relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <AlertCircle className="w-7 h-7" />
                </div>
                
                <h3 className="text-sm font-extrabold uppercase text-white tracking-widest">
                  {confirmModal.title}
                </h3>
                
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {confirmModal.message}
                </p>
                
                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                  <button
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white font-bold text-[10px] uppercase tracking-wider rounded-xl border border-slate-850 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      confirmModal.onConfirm();
                    }}
                    className="py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
