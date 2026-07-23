import { firebaseApi } from '../lib/firebaseApi';
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Star, 
  MessageSquare, 
  Send, 
  Check, 
  AlertCircle, 
  Package, 
  Info, 
  X,
  UserCheck,
  ShieldCheck,
  Crown,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';
import { UserProfile, MarketplaceProduct } from '../types';

interface VendorDashboardProps {
  currentUser: UserProfile | null;
  userEmail: string;
  onUpdateUser: (user: any) => void;
  onRefreshMarketplace?: () => void;
}

interface ReviewItem {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
}

export default function VendorDashboard({ 
  currentUser, 
  userEmail, 
  onUpdateUser,
  onRefreshMarketplace 
}: VendorDashboardProps) {
  
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales' | 'reviews'>('inventory');

  // New/Edit listing modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MarketplaceProduct | null>(null);
  
  // Listing form fields
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<'Accounts' | 'Coaching' | 'Skins' | 'HUD Layouts' | 'Config Files'>('Config Files');
  const [prodPrice, setProdPrice] = useState('4.99');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('📦');
  const [prodTelegram, setProdTelegram] = useState('');
  const [prodIsGiveaway, setProdIsGiveaway] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatusTarget, setSubmitStatusTarget] = useState<'Draft' | 'Submitted'>('Submitted');
  const [submittingState, setSubmittingState] = useState('');
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [evidenceProdId, setEvidenceProdId] = useState<string | null>(null);
  const [evidenceUrlText, setEvidenceUrlText] = useState<string>('');

  // Review reply state
  const [replyInputMap, setReplyInputMap] = useState<{[key: string]: string}>({});

  // Mock Customer Reviews
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      productName: 'GhostCore™ Sensitivity File (VIP)',
      customerName: 'FF_Pro_Sniper',
      rating: 5,
      comment: 'This VIP file is insane. Literally doubled my headshot percentage in clash squad! No lag and very easy to configure.',
      date: '2026-06-28',
      reply: 'Thanks buddy! Glad it helped you push Grandmaster.'
    },
    {
      id: 'rev-2',
      productName: 'Grandmaster Ranked Account (Rare Skins)',
      customerName: 'Aka_Omega',
      rating: 4,
      comment: 'Account came as described on Telegram. Transaction was fast and secure with Middleman/Escrow support.',
      date: '2026-06-29'
    },
    {
      id: 'rev-3',
      productName: 'GhostCore™ Sensitivity File (VIP)',
      customerName: 'FreeFire_King',
      rating: 5,
      comment: 'Excellent seller. Very polite and guided me on Telegram on how to install. Highly recommend!',
      date: '2026-06-30'
    }
  ]);

  // Mock Sales Ledger
  const salesHistory = [
    { date: 'June 26', sales: 120, commission: 24, commissionSaved: 12 },
    { date: 'June 27', sales: 180, commission: 36, commissionSaved: 18 },
    { date: 'June 28', sales: 240, commission: 48, commissionSaved: 24 },
    { date: 'June 29', sales: 150, commission: 30, commissionSaved: 15 },
    { date: 'June 30', sales: 320, commission: 64, commissionSaved: 32 },
    { date: 'July 01', sales: 410, commission: 82, commissionSaved: 41 },
    { date: 'July 02', sales: 290, commission: 58, commissionSaved: 29 },
  ];

  // Fetch Vendor listings
  const fetchVendorListings = async () => {
    setLoading(true);
    try {
      const res = await firebaseApi.request('marketplace');
      if (res.ok) {
        const data: MarketplaceProduct[] = await res.json();
        // Filter products owned by this vendor OR if admin show everything assigned to a vendor
        const cleanEmail = userEmail.toLowerCase().trim();
        const vendorListings = data.filter(p => p.vendorEmail?.toLowerCase().trim() === cleanEmail);
        setProducts(vendorListings);
      }
    } catch (err) {
      console.error('Failed to load vendor listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchVendorListings();
    }
  }, [userEmail]);

  // Open modal for new item
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory('Config Files');
    setProdPrice('4.99');
    setProdDesc('');
    setProdImage('⚙️');
    setProdTelegram(currentUser?.telegramHandle || '');
    setProdIsGiveaway(false);
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (p: MarketplaceProduct) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdPrice(p.price.toString());
    setProdDesc(p.description);
    setProdImage(p.image);
    setProdTelegram(p.telegramLink || '');
    setProdIsGiveaway(!!p.isGiveaway);
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  // Submit listing Form
  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodDesc.trim()) {
      setFormError('Product Name and Description are required!');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setFormSuccess('');

    // Determine initial lifecycle step based on Draft vs Submitted choice
    const startStatus = submitStatusTarget;
    let finalStatus: any = startStatus;
    let aiNotes = "Saved as Draft. Listing is private and not indexable.";
    let evidenceNeeded = false;

    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    let riskScore = 15;
    let aiReviewLogs: string[] = ['AI Compliance Engine initialized.'];

    if (startStatus === 'Submitted') {
      setSubmittingState('GhostFire Core AI compliance scan in progress...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const lowerName = prodName.toLowerCase();
      const lowerDesc = prodDesc.toLowerCase();

      // Policy Rule 1: Cheat / Hack detection
      if (lowerName.includes('hack') || lowerDesc.includes('hack') || 
          lowerName.includes('cheat') || lowerDesc.includes('cheat') || 
          lowerName.includes('aimbot') || lowerDesc.includes('aimbot')) {
        finalStatus = 'Rejected';
        riskLevel = 'High';
        riskScore = 95;
        aiNotes = 'Automatic AI Security Reject: Unauthorized third-party injection or hack signatures (hack, cheat, aimbot) detected in metadata. Under security protocols, utility exploits are permanently blacklisted.';
        aiReviewLogs.push('FLAG: Blacklisted keyword detected in product metadata.');
        aiReviewLogs.push('DECISION: Automatic Rejection.');
      } 
      // Policy Rule 2: High-value Escrow Verification
      else if (parseFloat(prodPrice) > 100) {
        finalStatus = 'Needs Evidence';
        riskLevel = 'Medium';
        riskScore = 60;
        evidenceNeeded = true;
        aiNotes = 'Automatic AI Compliance Alert: Premium listing ($100+) detected. Under financial security terms, listings valued over $100 require official merchant evidence to verify ownership before public indexing.';
        aiReviewLogs.push('ALERT: High-value listing ($100+) requires merchant ownership evidence.');
        aiReviewLogs.push('STATUS: Escalated to Needs Evidence.');
      } 
      // Policy Rule 3: Pass AI review -> Pending Admin confirmation
      else {
        finalStatus = 'Pending Admin';
        riskLevel = 'Low';
        riskScore = 10;
        aiNotes = 'Automatic AI Review Passed: Textual metadata conforms to marketplace format regulations. Forwarding to Super Admin verification queue for final catalog indexing.';
        aiReviewLogs.push('SCAN: Metadata, price, and category passed baseline safety check.');
        aiReviewLogs.push('QUEUE: Transferred to Super Admin review queue.');
      }
      
      setSubmittingState('Synchronizing with marketplace ledgers...');
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    const payload = {
      name: prodName,
      category: prodCategory,
      price: prodIsGiveaway ? 0 : parseFloat(prodPrice) || 0,
      description: prodDesc,
      image: prodImage || '📦',
      telegramLink: prodTelegram,
      isGiveaway: prodIsGiveaway,
      vendorId: currentUser?.uid || userEmail,
      vendorEmail: userEmail,
      hidden: false,
      status: finalStatus,
      riskLevel,
      riskScore,
      aiReviewNotes: aiNotes,
      aiReviewLogs,
      evidenceRequested: evidenceNeeded,
      createdAt: new Date().toISOString()
    };

    try {
      let res;
      if (editingProduct) {
        // Edit existing listing
        res = await firebaseApi.request(`marketplace/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Add new listing
        res = await firebaseApi.request('marketplace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setFormSuccess(
          finalStatus === 'Draft' 
            ? 'Listing saved as private draft!' 
            : finalStatus === 'Rejected'
            ? 'Compliance Scan Failed! Listing saved as Rejected.'
            : finalStatus === 'Needs Evidence'
            ? 'Compliance Alert! Listing requires verification evidence.'
            : 'Listing submitted! Forwarded to Super Admin queue.'
        );
        setTimeout(() => {
          setIsModalOpen(false);
          fetchVendorListings();
          if (onRefreshMarketplace) onRefreshMarketplace();
        }, 1500);
      } else {
        const errData = await res.json();
        setFormError(errData.error || 'Failed to persist listing details.');
      }
    } catch (err) {
      setFormError('Network error occurred.');
    } finally {
      setSubmitting(false);
      setSubmittingState('');
    }
  };

  // Toggle Hidden Status
  const handleToggleHide = async (p: MarketplaceProduct) => {
    try {
      const res = await firebaseApi.request(`marketplace/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: !p.hidden })
      });
      if (res.ok) {
        fetchVendorListings();
        if (onRefreshMarketplace) onRefreshMarketplace();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      const res = await firebaseApi.request(`marketplace/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchVendorListings();
        if (onRefreshMarketplace) onRefreshMarketplace();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit compliance evidence
  const handleSubmitEvidence = async (p: MarketplaceProduct, url: string) => {
    if (!url.trim()) return;
    try {
      const payload = {
        status: 'Submitted',
        evidenceUrl: url,
        evidenceRequested: false,
        aiReviewNotes: 'Evidence Submitted: Vendor uploaded verification asset link. Status promoted to Submitted. Forwarding to Super Admin manually.'
      };
      const res = await firebaseApi.request(`marketplace/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEvidenceProdId(null);
        setEvidenceUrlText('');
        fetchVendorListings();
        if (onRefreshMarketplace) onRefreshMarketplace();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit review reply
  const handleReplyToReview = (reviewId: string) => {
    const text = replyInputMap[reviewId]?.trim();
    if (!text) return;

    setReviews(prev => prev.map(rev => {
      if (rev.id === reviewId) {
        return { ...rev, reply: text };
      }
      return rev;
    }));

    setReplyInputMap(prev => ({ ...prev, [reviewId]: '' }));
  };

  // Calculate stats
  const activeListingsCount = products.filter(p => !p.hidden).length;
  const totalSalesVolume = salesHistory.reduce((sum, h) => sum + h.sales, 0);
  // Standard commission is 10%, vendors get 20% discount (commission level)
  const totalCommissionRealized = salesHistory.reduce((sum, h) => sum + h.commission, 0);
  const totalVendorBenefit = salesHistory.reduce((sum, h) => sum + h.commissionSaved, 0);

  // Reputation metrics
  const approvedCount = products.filter(p => p.status === 'Approved' || p.status === 'Published' || !p.status).length;
  const rejectedCount = products.filter(p => p.status === 'Rejected').length;
  const needsEvidenceCount = products.filter(p => p.status === 'Needs Evidence').length;
  const totalProductsCount = products.length;
  
  // Custom reputation formulas
  const trustScore = totalProductsCount > 0 
    ? Math.max(10, Math.min(100, Math.round(((totalProductsCount - rejectedCount * 1.5) / totalProductsCount) * 100)))
    : 100;
    
  let reputationLevel: 'Basic' | 'Silver' | 'Gold' | 'Diamond' = 'Basic';
  if (trustScore >= 95 && approvedCount >= 5) {
    reputationLevel = 'Diamond';
  } else if (trustScore >= 85 && approvedCount >= 3) {
    reputationLevel = 'Gold';
  } else if (trustScore >= 70 && approvedCount >= 1) {
    reputationLevel = 'Silver';
  }

  // Guard access
  const isAuthorized = currentUser?.isVendor || currentUser?.role === 'Vendor' || currentUser?.role === 'Administrator' || currentUser?.role === 'Staff';

  if (!isAuthorized) {
    return (
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-8 max-w-xl mx-auto text-center space-y-4 my-10">
        <ShieldCheck className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-sm font-black text-white uppercase tracking-widest">Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Merchant Management Terminal is reserved for authorized GhostCore Vendors and Staff members only. Please activate your license or apply for review via the Vendor Hub in our Marketplace catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-2">
      {/* HEADER BANNER */}
      <div className="relative bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-850 rounded-3xl p-6 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-600/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-400 font-mono font-bold shrink-0">
              <Briefcase className="w-7 h-7 text-orange-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black uppercase text-white tracking-widest">
                  Vendor Merchant Dashboard
                </h1>
                <span className="text-[8px] font-bold font-mono bg-orange-500/15 border border-orange-500/20 px-2 py-0.5 rounded text-orange-400 uppercase tracking-widest animate-pulse">
                  ✓ Verified Merchant
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                Terminal connected: {currentUser?.username || userEmail} ({currentUser?.vendorKey || 'GP-ACTIVE-VEND'})
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:brightness-110 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-orange-600/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950 shrink-0" /> Publish Listing
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* STAT 1 */}
        <div className="bg-slate-900/60 border border-slate-850/60 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">Sales Volume</span>
            <div className="text-xl font-black font-mono text-white">${totalSalesVolume.toFixed(2)}</div>
            <p className="text-[8px] text-emerald-400 font-mono">+12.4% vs last week</p>
          </div>
          <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-indigo-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* STAT 2 */}
        <div className="bg-slate-900/60 border border-slate-850/60 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">Vendor Share (80%)</span>
            <div className="text-xl font-black font-mono text-emerald-400">${(totalSalesVolume - totalCommissionRealized).toFixed(2)}</div>
            <p className="text-[8px] text-slate-500 font-mono">Deducted escrow payouts</p>
          </div>
          <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* STAT 3 */}
        <div className="bg-slate-900/60 border border-slate-850/60 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">20% Discount Benefit</span>
            <div className="text-xl font-black font-mono text-orange-400">${totalVendorBenefit.toFixed(2)}</div>
            <p className="text-[8px] text-orange-400 font-mono">Saved with vendorKey license</p>
          </div>
          <div className="p-3 bg-orange-500/5 rounded-xl border border-orange-500/10 text-orange-400">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        {/* STAT 4 */}
        <div className="bg-slate-900/60 border border-slate-850/60 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">Active Listings</span>
            <div className="text-xl font-black font-mono text-white">{activeListingsCount} <span className="text-slate-600 text-xs">/ {products.length}</span></div>
            <p className="text-[8px] text-slate-500 font-mono">Listed on global directory</p>
          </div>
          <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10 text-purple-400">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* MERCHANT INTEGRITY & TRUST SCORE CARD */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-850/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Merchant Reputation Suite</h3>
              <p className="text-[9px] text-slate-500 font-mono">Real-time performance audit & integrity metrics</p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-lg text-slate-300 font-mono">
            TRUST INDEX: <span className="font-bold text-emerald-400">{Math.round(trustScore)}%</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-950 border border-slate-850/40 rounded-xl space-y-1">
            <div className="text-[8px] text-slate-500 uppercase font-mono font-bold">Verification Grade</div>
            <div className="text-xs font-black text-orange-400 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-orange-400" /> {reputationLevel} Class
            </div>
            <p className="text-[8px] text-slate-600">Dynamic scaling on successful trades</p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-850/40 rounded-xl space-y-1">
            <div className="text-[8px] text-slate-500 uppercase font-mono font-bold">Approved Public</div>
            <div className="text-xs font-black text-emerald-400 font-mono">{approvedCount} <span className="text-slate-600 font-normal text-[10px]">items</span></div>
            <p className="text-[8px] text-slate-600">Indexed on GhostCore global store</p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-850/40 rounded-xl space-y-1">
            <div className="text-[8px] text-slate-500 uppercase font-mono font-bold">Policy Flagged</div>
            <div className="text-xs font-black text-red-400 font-mono">{rejectedCount} <span className="text-slate-600 font-normal text-[10px]">items</span></div>
            <p className="text-[8px] text-slate-600">Suspended or rejected publications</p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-850/40 rounded-xl space-y-1">
            <div className="text-[8px] text-slate-500 uppercase font-mono font-bold">Audit Evidence Needed</div>
            <div className="text-xs font-black text-amber-400 font-mono">{needsEvidenceCount} <span className="text-slate-600 font-normal text-[10px]">pending</span></div>
            <p className="text-[8px] text-slate-600">Require platform compliance proof</p>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex border-b border-slate-850">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'inventory' 
              ? 'border-orange-500 text-orange-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          My Listings ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'sales' 
              ? 'border-orange-500 text-orange-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Commission & Ledger
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'reviews' 
              ? 'border-orange-500 text-orange-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Customer Feedback
        </button>
      </div>

      {/* MAIN VIEW CONTENTS */}
      <div className="space-y-6">
        
        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono animate-pulse">
                Synchronizing with digital marketplace database...
              </div>
            ) : products.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <Package className="w-10 h-10 text-slate-700 mx-auto" />
                <div className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  You haven't listed any sensitivities, customized HUD presets, or rare accounts yet. Click <span className="text-orange-400 font-bold">"Publish Listing"</span> above to publish your first product!
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(p => (
                  <div 
                    key={p.id}
                    className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all hover:border-slate-750 ${
                      p.hidden ? 'opacity-60 border-slate-900 bg-slate-950/40' : 'border-slate-850'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        {/* Image / Avatar mockup */}
                        <div className="w-12 h-12 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-2xl shrink-0 select-none">
                          {p.image || '⚙️'}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-extrabold text-white uppercase tracking-tight line-clamp-1">{p.name}</h4>
                            {p.isGiveaway && (
                              <span className="text-[7px] font-bold font-mono bg-purple-500/15 text-purple-400 px-1 py-0.5 rounded uppercase">GIVEAWAY</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[8px] bg-slate-950 border border-slate-850 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                              {p.category}
                            </span>
                            {/* Dynamic status badges */}
                            {(() => {
                              switch (p.status) {
                                case 'Draft':
                                  return <span className="text-[7px] font-bold font-mono bg-slate-950 text-slate-500 border border-slate-850 px-1.5 py-0.5 rounded uppercase">DRAFT</span>;
                                case 'Submitted':
                                  return <span className="text-[7px] font-bold font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase">SUBMITTED</span>;
                                case 'AI Review':
                                  return <span className="text-[7px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase animate-pulse">AI REVIEW</span>;
                                case 'Pending Admin':
                                  return <span className="text-[7px] font-bold font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded uppercase">PENDING ADMIN</span>;
                                case 'Approved':
                                case 'Published':
                                  return <span className="text-[7px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">APPROVED</span>;
                                case 'Rejected':
                                  return <span className="text-[7px] font-bold font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded uppercase">REJECTED</span>;
                                case 'Needs Evidence':
                                  return <span className="text-[7px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase">NEEDS PROOF</span>;
                                default:
                                  return <span className="text-[7px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">APPROVED</span>;
                              }
                            })()}
                          </div>
                          <p className="text-[10.5px] text-slate-400 line-clamp-2 leading-relaxed font-sans mt-1">
                            {p.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {p.isGiveaway ? (
                          <div className="text-[10px] font-black text-purple-400 font-mono">FREE</div>
                        ) : (
                          <div className="text-xs font-black text-white font-mono">${p.price.toFixed(2)}</div>
                        )}
                        <div className="text-[8px] text-slate-500 font-mono mt-0.5">Rating: {p.rating} ★</div>
                      </div>
                    </div>

                    {/* AI REVIEW REPORT TOGGLE */}
                    {p.aiReviewNotes && (
                      <div className="space-y-1 pt-1">
                        <button
                          type="button"
                          onClick={() => setExpandedNotesId(expandedNotesId === p.id ? null : p.id)}
                          className="text-[9px] font-bold text-orange-400/80 hover:text-orange-400 uppercase tracking-wider font-mono flex items-center gap-1 cursor-pointer"
                        >
                          {expandedNotesId === p.id ? '▼ Hide AI Audit Log' : '▶ View AI Audit Log'}
                        </button>
                        
                        {expandedNotesId === p.id && (
                          <div className="p-3 bg-slate-950 border border-slate-850/60 rounded-xl text-[10px] text-slate-300 font-sans leading-relaxed space-y-1">
                            <div className="font-bold text-slate-400 font-mono uppercase tracking-wider text-[8px]">Feedback Report:</div>
                            <p className="text-slate-400">{p.aiReviewNotes}</p>
                            {p.evidenceUrl && (
                              <div className="text-[8px] text-slate-500 font-mono mt-1">
                                <span className="text-emerald-400">✓</span> Proof uploaded: <a href={p.evidenceUrl} target="_blank" rel="noreferrer" className="text-orange-400 underline">{p.evidenceUrl}</a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* PROOF SUBMISSION INTERFACE */}
                    {p.status === 'Needs Evidence' && (
                      <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2 mt-1">
                        <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1 font-mono">
                          <ShieldAlert className="w-3.5 h-3.5" /> Verification Required
                        </div>
                        <p className="text-[9px] text-slate-400 leading-relaxed">
                          Please provide a proof link (YouTube configuration video, screenshot folders, or merchant accounts proof) to satisfy AI compliance terms.
                        </p>
                        
                        {evidenceProdId === p.id ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={evidenceUrlText}
                              onChange={(e) => setEvidenceUrlText(e.target.value)}
                              placeholder="e.g. https://youtube.com/watch?v=..."
                              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-orange-500"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setEvidenceProdId(null)}
                                className="px-2 py-1 bg-slate-900 border border-slate-850 text-slate-400 text-[9px] font-bold uppercase rounded-md cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSubmitEvidence(p, evidenceUrlText)}
                                className="px-2 py-1 bg-gradient-to-r from-orange-600 to-amber-500 text-slate-950 text-[9px] font-black uppercase rounded-md cursor-pointer"
                              >
                                Submit Proof Link
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEvidenceProdId(p.id);
                              setEvidenceUrlText('');
                            }}
                            className="w-full py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                          >
                            Provide Proof URL
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-850/60 mt-1">
                      {/* Telegram indicator */}
                      <span className="text-[9px] text-slate-500 font-mono leading-none">
                        Inquiries: <span className="text-slate-300 font-bold">{p.telegramLink || 'DM via Admin'}</span>
                      </span>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleHide(p)}
                          title={p.hidden ? "Unhide Item" : "Hide Item"}
                          className="p-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                        >
                          {p.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          title="Edit Listing"
                          className="p-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          title="Delete Listing"
                          className="p-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 rounded-lg text-red-400 hover:text-red-300 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SALES TAB */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEDGER & SALES CHART */}
              <div className="lg:col-span-8 bg-slate-900/60 border border-slate-850 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-black uppercase text-white tracking-wider">Merchant Sales Performance</h3>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">Live reporting index on escrow payments</p>
                  </div>
                  <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded uppercase font-mono">
                    Updated live
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: 12, fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'sans-serif' }} />
                      <Line type="monotone" dataKey="sales" name="Sales Vol ($)" stroke="#e11d48" strokeWidth={2.5} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="commission" name="Fee (10%)" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="commissionSaved" name="Discount Benefit" stroke="#f97316" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* COMMISSION RULES */}
              <div className="lg:col-span-4 bg-slate-900/60 border border-slate-850 rounded-3xl p-5 flex flex-col justify-between gap-4">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-600/15 border border-orange-500/20 text-orange-400 rounded-lg">
                      <Percent className="w-4 h-4 text-orange-500 shrink-0" />
                    </div>
                    <h3 className="text-xs font-black uppercase text-white tracking-wider">Discount & Escrow Index</h3>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    All standard trades inside the GhostCore marketplace operate under a <span className="font-bold text-slate-200">10% standard escrow commission</span> model. This guarantees safe delivery and refund mechanics for buyers.
                  </p>

                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
                      <span>Standard Marketplace Fee</span>
                      <span className="font-mono text-white">10% per transaction</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-orange-400 border-t border-slate-850/60 pt-2">
                      <span>Vendor 20% Store Discount</span>
                      <span className="font-mono">Unlocks on Active Listings</span>
                    </div>
                  </div>

                  <div className="space-y-1 bg-orange-950/10 border border-orange-500/10 p-2.5 rounded-xl flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-[9.5px] text-slate-400 leading-normal">
                      With your active <span className="font-bold text-orange-400">vendorKey</span>, you have the exclusive privilege of listing items directly to our catalog and receiving direct customer contacts without manual admin mediation.
                    </p>
                  </div>
                </div>

                <div className="text-[9px] text-slate-500 font-mono uppercase text-center border-t border-slate-850/40 pt-2 leading-none">
                  GhostCore Merchant License v2.4
                </div>
              </div>
            </div>

            {/* TRANSACTIONS TABLE */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-850 flex justify-between items-center">
                <span className="text-xs font-black uppercase text-white tracking-widest">Escrow Sales ledger</span>
                <span className="text-[8px] font-mono text-slate-500 uppercase">showing recent transactions</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px] text-slate-300">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-850 text-slate-500 uppercase text-[9px] font-mono font-black tracking-wider">
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">Item Details</th>
                      <th className="p-3">Client Email</th>
                      <th className="p-3">Value</th>
                      <th className="p-3">Payout Share (80%)</th>
                      <th className="p-3">Commission (10%)</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/40">
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono font-bold text-orange-400">TXN-0105</td>
                      <td className="p-3 font-bold text-white">GhostCore™ Sensitivity File (VIP)</td>
                      <td className="p-3 font-mono">omega_sniper@gmail.com</td>
                      <td className="p-3 font-mono text-white">$4.99</td>
                      <td className="p-3 font-mono text-emerald-400">$3.99</td>
                      <td className="p-3 font-mono text-slate-500">$0.50</td>
                      <td className="p-3"><span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase">COMPLETED</span></td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono font-bold text-orange-400">TXN-0104</td>
                      <td className="p-3 font-bold text-white">Grandmaster Ranked Account</td>
                      <td className="p-3 font-mono">ff_king_v@hotmail.com</td>
                      <td className="p-3 font-mono text-white">$120.00</td>
                      <td className="p-3 font-mono text-emerald-400">$96.00</td>
                      <td className="p-3 font-mono text-slate-500">$12.00</td>
                      <td className="p-3"><span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase">COMPLETED</span></td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono font-bold text-orange-400">TXN-0103</td>
                      <td className="p-3 font-bold text-white">Custom 4-Finger HUD Layout</td>
                      <td className="p-3 font-mono">z_alex_ff@gmail.com</td>
                      <td className="p-3 font-mono text-white">$3.50</td>
                      <td className="p-3 font-mono text-emerald-400">$2.80</td>
                      <td className="p-3 font-mono text-slate-500">$0.35</td>
                      <td className="p-3"><span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase">COMPLETED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-orange-950/10 border border-orange-500/15 p-4 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-white tracking-wider">Customer Feedback Regulations</h4>
                <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                  As a registered platform vendor, you have the right to show feedback from customer profiles transparently. To comply with community regulations, <span className="font-bold text-orange-400">vendors cannot offend anyone</span>. Ensure all replies to negative or positive reviews remain professional, encouraging, and toxic-free.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map(rev => (
                <div key={rev.id} className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="text-[9px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded font-mono uppercase text-slate-500 font-semibold">
                        {rev.productName}
                      </span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-black text-white">{rev.customerName}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-700'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">{rev.date}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    "{rev.comment}"
                  </p>

                  {/* Vendor reply box */}
                  {rev.reply ? (
                    <div className="p-3 bg-slate-950 border-l-2 border-orange-500 rounded-xl space-y-1 ml-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-orange-400">Merchant Reply</span>
                        <Check className="w-3 h-3 text-orange-500" />
                      </div>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed">
                        {rev.reply}
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2 ml-4">
                      <input
                        type="text"
                        value={replyInputMap[rev.id] || ''}
                        onChange={(e) => setReplyInputMap(prev => ({ ...prev, [rev.id]: e.target.value }))}
                        placeholder="Write a polite response to this feedback (Rule: Do not offend)..."
                        className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-orange-500 flex-1"
                      />
                      <button
                        onClick={() => handleReplyToReview(rev.id)}
                        className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3 text-slate-950 shrink-0 fill-current" /> Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PUBLISH / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
            
            {/* Close */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 bg-slate-950 border border-slate-850 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Package className="w-4.5 h-4.5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-white tracking-widest">
                  {editingProduct ? 'Edit Market Listing' : 'Publish New Listing'}
                </h3>
                <p className="text-[8px] text-slate-500 font-mono uppercase mt-0.5">
                  {editingProduct ? 'Update listing attributes' : 'List a custom product on Free Fire store'}
                </p>
              </div>
            </div>

            {formError && (
              <div className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitListing} className="space-y-4">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Product Name</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Omega Sensi Mod (V8.2)"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="Config Files">Config Files</option>
                    <option value="HUD Layouts">HUD Layouts</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Skins">Skins</option>
                    <option value="Coaching">Coaching</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={prodIsGiveaway}
                    value={prodIsGiveaway ? '0' : prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-orange-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Emoji Image picker & Telegram handle */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Icon Emoji</label>
                  <input
                    type="text"
                    required
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    placeholder="e.g. ⚙️, 🎮, 🛡️"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-orange-500 text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Telegram Link Handle</label>
                  <input
                    type="text"
                    required
                    value={prodTelegram}
                    onChange={(e) => setProdTelegram(e.target.value)}
                    placeholder="e.g. @ghostfire_mods"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Giveaway Toggle */}
              <label className="flex items-center gap-2 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={prodIsGiveaway}
                  onChange={(e) => {
                    setProdIsGiveaway(e.target.checked);
                    if (e.target.checked) setProdPrice('0');
                  }}
                  className="rounded text-orange-500 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                />
                <span className="text-[10px] text-slate-300 font-semibold select-none">This is a Free Giveaway Item</span>
              </label>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Product Description</label>
                <textarea
                  rows={3}
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Describe your layout specs, dpi sensitivity settings, or account skin details..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              {/* Submitting progress HUD */}
              {submitting && submittingState && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl space-y-1 animate-pulse">
                  <div className="text-[9px] font-bold text-orange-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block animate-ping"></span>
                    GhostCore AI Hub
                  </div>
                  <p className="text-[10px] text-slate-300 font-sans leading-relaxed">{submittingState}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-3 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                
                <div className="flex gap-2 flex-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    onClick={() => setSubmitStatusTarget('Draft')}
                    className="flex-1 py-2 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    onClick={() => setSubmitStatusTarget('Submitted')}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:brightness-110 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    {editingProduct ? 'Submit Edit' : 'Submit Review'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
