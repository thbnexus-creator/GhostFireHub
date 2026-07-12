import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Star, 
  ChevronRight, 
  CheckCircle, 
  Send, 
  Info, 
  Heart,
  Tag,
  Clock,
  History,
  Upload,
  Plus,
  Gift,
  AlertTriangle,
  User,
  Crown,
  Sparkles,
  ShieldAlert,
  Trash2,
  Edit,
  EyeOff,
  Eye,
  Check,
  Bookmark,
  Briefcase
} from 'lucide-react';
import { MarketplaceProduct } from '../types';
import { trackMissionProgress } from '../utils';
import { formatPrice } from '../lib/currency';

interface MarketProps {
  products: MarketplaceProduct[];
  userEmail?: string;
  currentUser?: any;
  onAddProduct: (product: Partial<MarketplaceProduct>) => Promise<boolean>;
  onEditProduct: (productId: string, product: Partial<MarketplaceProduct>) => Promise<boolean>;
  onDeleteProduct: (productId: string) => Promise<boolean>;
  initialSearchQuery?: string;
  onToggleBookmark?: (type: 'preset' | 'product', id: string) => void;
  bookmarkedProductIds?: string[];
  onUpdateUser?: (user: any) => void;
}

export default function MarketplaceView({ 
  products, 
  userEmail, 
  currentUser, 
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  initialSearchQuery,
  onToggleBookmark,
  bookmarkedProductIds = [],
  onUpdateUser
}: MarketProps) {
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    setLoadingProducts(true);
    const timer = setTimeout(() => {
      setLoadingProducts(false);
    }, 600); // Simulated delay for visual compliance skeleton
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, products]);
  
  // Favorites storage
  const [likedProductIds, setLikedProductIds] = useState<string[]>(['p1']);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);

  // Listing Form States
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<'Accounts' | 'Coaching' | 'Skins' | 'HUD Layouts' | 'Config Files'>('Accounts');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodTelegram, setProdTelegram] = useState('ghostfirehub1');
  const [isGiveawayItem, setIsGiveawayItem] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isHiddenListing, setIsHiddenListing] = useState(false);
  
  // Drag & drop file upload state
  const [uploadedImage, setUploadedImage] = useState<string>(''); // base64 representation
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Vendor Hub state hooks
  const [vendorKeyInput, setVendorKeyInput] = useState('');
  const [submittingVendorKey, setSubmittingVendorKey] = useState(false);
  const [vendorError, setVendorError] = useState('');
  const [vendorSuccess, setVendorSuccess] = useState('');

  const handleActivateVendorWithKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      setVendorError("Please sign in or register to activate your Vendor profile.");
      return;
    }
    const enteredKey = vendorKeyInput.trim();
    if (!enteredKey) {
      setVendorError("Please enter a valid activation key.");
      return;
    }

    setSubmittingVendorKey(true);
    setVendorError("");
    setVendorSuccess("");

    try {
      // First, try the proper backend one-time activation endpoint
      const activateRes = await fetch("/api/user/activate-vendor-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          token: enteredKey
        })
      });

      if (activateRes.ok) {
        const data = await activateRes.json();
        if (data.user && onUpdateUser) {
          onUpdateUser(data.user);
          setVendorSuccess(`Vendor Profile Activated successfully using key ${enteredKey}! You are now a Verified platform vendor.`);
          setVendorKeyInput("");
          setSubmittingVendorKey(false);
          return;
        }
      } else {
        const errorData = await activateRes.json().catch(() => ({}));
        if (errorData.error && errorData.error.includes("already activated")) {
          setVendorError("This activation code has already been used. Tokens are strictly one-time use.");
          setSubmittingVendorKey(false);
          return;
        }
      }

      // If backend token check failed or returned an invalid token, check legacy formats as a fallback
      const isAssignedKey = currentUser?.vendorCode && enteredKey.toLowerCase() === currentUser.vendorCode.toLowerCase();
      const isValidFormat = (enteredKey.toUpperCase().startsWith("VEND-") || enteredKey.toUpperCase().startsWith("GHOST-VEND-")) && enteredKey.length >= 7;

      if (!isAssignedKey && !isValidFormat) {
        setVendorError("Invalid Activation Key. To get your personal key, please purchase a license by DMing the Admin.");
        setSubmittingVendorKey(false);
        return;
      }

      // Fallback update for legacy / custom direct keys
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          isVendor: true,
          vendorCode: enteredKey.toUpperCase(),
          vendorFeePaid: true,
          vendorRequested: false
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user && onUpdateUser) {
          onUpdateUser(data.user);
          setVendorSuccess("Vendor Profile Activated successfully! You are now a Verified platform vendor.");
          setVendorKeyInput("");
        } else {
          setVendorError("Failed to synchronize vendor profile with local state.");
        }
      } else {
        setVendorError("Invalid Activation Key. To get your personal key, please purchase a license by DMing the Admin.");
      }
    } catch (err) {
      console.error(err);
      setVendorError("Network error occurred while activating vendor status.");
    } finally {
      setSubmittingVendorKey(false);
    }
  };

  const handleRequestVendorStatus = async () => {
    if (!userEmail) {
      setVendorError("Please sign in or register to submit a vendor request.");
      return;
    }

    setVendorError("");
    setVendorSuccess("");

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          vendorRequested: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user && onUpdateUser) {
          onUpdateUser(data.user);
          setVendorSuccess("Vendor request successfully logged on database! Click the button below to message our owner and purchase your activation code.");
        }
      }
    } catch (err) {
      console.error(err);
      setVendorError("Failed to record request.");
    }
  };

  const categories = ['All', 'Giveaways', 'Accounts', 'Config Files', 'HUD Layouts', 'Coaching', 'Skins'];

  // Order history mock
  const [orders] = useState([
    { id: 'ORD-9842', item: 'GhostCore™ Pro Config File (VIP)', price: 4.99, date: '2026-06-20', status: 'Completed' }
  ]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedProductIds.includes(id)) {
      setLikedProductIds(prev => prev.filter(pId => pId !== id));
    } else {
      setLikedProductIds(prev => [...prev, id]);
    }
  };

  // Drag & Drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG/JPG).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) { // 3MB limit
      setUploadError("Image file size must be less than 3MB.");
      return;
    }

    setUploadError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Submit Listing handler (Handles both Add & Edit depending on state)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName) return;

    setIsSubmittingListing(true);
    setSuccessMessage('');
    
    const formattedTelegram = prodTelegram.replace('@', '').trim();

    const productPayload: Partial<MarketplaceProduct> = {
      name: prodName,
      category: prodCategory,
      price: isGiveawayItem ? 0 : Number(prodPrice) || 0,
      description: prodDescription || 'No description provided.',
      image: uploadedImage || '🎮',
      featured: isFeatured,
      telegramLink: formattedTelegram,
      isGiveaway: isGiveawayItem,
      hidden: isHiddenListing
    };

    let success = false;
    if (editingProductId) {
      success = await onEditProduct(editingProductId, productPayload);
    } else {
      success = await onAddProduct(productPayload);
    }

    setIsSubmittingListing(false);

    if (success) {
      setSuccessMessage(editingProductId ? 'Listing edited successfully and database synchronized!' : 'Successfully uploaded account listing and synced with server database.');
      
      // Reset Form & state
      setProdName('');
      setProdPrice('');
      setProdDescription('');
      setUploadedImage('');
      setIsGiveawayItem(false);
      setIsFeatured(false);
      setIsHiddenListing(false);
      setEditingProductId(null);

      // Auto close after brief delay
      setTimeout(() => {
        setShowUploadForm(false);
        setSuccessMessage('');
      }, 2000);
    } else {
      setUploadError('Failed to publish product listing. Please check connectivity.');
    }
  };

  const handleStartEdit = (prod: MarketplaceProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdPrice(prod.price.toString());
    setProdDescription(prod.description);
    setProdTelegram(prod.telegramLink || 'ghostfirehub1');
    setIsGiveawayItem(prod.isGiveaway || prod.price === 0);
    setIsFeatured(prod.featured || false);
    setIsHiddenListing(prod.hidden || false);
    setUploadedImage(prod.image || '');
    setShowUploadForm(true);
  };

  const handleCancelForm = () => {
    setProdName('');
    setProdPrice('');
    setProdDescription('');
    setUploadedImage('');
    setIsGiveawayItem(false);
    setIsFeatured(false);
    setIsHiddenListing(false);
    setEditingProductId(null);
    setShowUploadForm(false);
  };

  const handleDeleteClick = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you absolutely sure you want to permanently delete this listing? This operation cannot be undone.')) {
      await onDeleteProduct(productId);
      if (selectedProduct?.id === productId) {
        setSelectedProduct(null);
      }
    }
  };

  const isPlatformAdmin = userEmail === 'ghostfirehub@gmail.com' || currentUser?.role === 'Administrator' || currentUser?.role === 'Staff';

  const filteredProducts = products.filter(p => {
    if (!p) return false;
    
    // Admins can see hidden products for editing/publishing, but guests and normal users cannot
    if (p.hidden && !isPlatformAdmin) return false;

    let matchesCategory = true;
    if (selectedCategory === 'Giveaways') {
      matchesCategory = p.isGiveaway === true || p.price === 0;
    } else if (selectedCategory !== 'All') {
      matchesCategory = p.category === selectedCategory && !(p.isGiveaway === true || p.price === 0);
    }

    const nameStr = p.name || '';
    const descStr = p.description || '';
    const searchVal = searchQuery || '';
    const matchesSearch = nameStr.toLowerCase().includes(searchVal.toLowerCase()) || 
                          descStr.toLowerCase().includes(searchVal.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Banner / Header section */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-amber-500 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-orange-500/10">
        {/* Abstract overlays */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-950/20 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-slate-950/90 rounded-2xl shrink-0 shadow-lg shadow-orange-600/20 text-orange-400 border border-slate-800">
            <ShoppingBag className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
              GhostFire™ Marketplace
            </h1>
            <p className="text-xs text-white/90 font-medium max-w-md mt-1 leading-relaxed">
              Unlock premium digital gaming configurations, optimized sensitivity setups, and rare account listings.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl text-xs max-w-xs md:self-stretch justify-center relative z-10">
          <div className="flex items-center gap-1.5 text-amber-500 font-bold uppercase tracking-wider text-[10px]">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            Verified Telegram Escrow
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            To safeguard credentials, all marketplace transactions and giveaways are delivered instantly through Telegram support channels.
          </p>
        </div>
      </div>

      {/* ADMIN OR VENDOR HUB CONTROL PANEL */}
      {(isPlatformAdmin || currentUser?.isVendor) && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 border-2 border-orange-500/30 rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
          {/* Neon scan lines */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-600/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 font-mono font-bold shrink-0">
                {isPlatformAdmin ? (
                  <Crown className="w-6 h-6 text-orange-500" />
                ) : (
                  <Briefcase className="w-6 h-6 text-orange-500" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
                  {isPlatformAdmin ? 'VERIFIED ADMINISTRATOR PORTAL' : 'VERIFIED VENDOR SALES CENTER'} <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                </h2>
                <div className="text-[10px] text-orange-500 font-mono font-bold uppercase mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                  {isPlatformAdmin ? 'Logged in as: Founder (GhostFire)' : `Logged in as Vendor: ${currentUser?.username || 'Partner'}`}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (editingProductId) {
                  handleCancelForm();
                } else {
                  setShowUploadForm(!showUploadForm);
                }
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-600/15 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              {showUploadForm ? (editingProductId ? 'Cancel Edit' : 'Collapse Uploader') : 'Upload Account / Config'}
            </button>
          </div>

          {/* Admin / Vendor Avatar & Art Area */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-slate-800">
            <div className="md:col-span-8 flex flex-col md:flex-row items-center gap-4 p-4 bg-slate-950/60 border border-slate-850 rounded-2xl">
              {/* Custom character / avatar art wrapper */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-600 via-red-600 to-amber-400 p-0.5 shrink-0 shadow-lg relative">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-3xl">
                  {isPlatformAdmin ? '🦊' : '💼'}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-orange-500 p-1 rounded-full">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
              <div className="text-center md:text-left space-y-1">
                <div className="text-xs font-bold text-slate-200">
                  {isPlatformAdmin ? 'System Operator Dashboard' : 'Vendor Merchant Terminal'}
                </div>
                <pre className="text-[9px] text-orange-500/70 font-mono leading-none bg-slate-950 p-2 rounded border border-slate-900 hidden sm:block">
{isPlatformAdmin ? `   _____ _               _   ______ _          
  / ____| |             | | |  ____(_)         
 | |  __| |__   ___  ___| |_| |__   _ _ __ ___ 
 | | |_ | '_ \\ / _ \\/ __| __|  __| | | '__/ _ \\
 | |__| | | | | (_) \\__ \\ |_| |    | | | |  __/
  \\_____|_| |_|\\___/|___/\\__|_|    |_|_|  \\___|` : ` __     __              _             
 \\ \\   / /             | |            
  \\ \\_/ /__ _ __   __ _| | ___  _ __  
   \\   / _ \\ '_ \\ / _\` | |/ _ \\| '__| 
    | |  __/ | | | (_| | | (_) | |    
    |_|\\___|_| |_|\\__,_|_|\\___/|_|    `}
                </pre>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  {isPlatformAdmin 
                    ? "Welcome, Founder! Modify, edit, feature, hide or delete existing marketplace accounts and configuration listings instantly. All pricing modifications apply live in real-time."
                    : "Welcome, Verified Merchant Partner! List your custom sensitivity settings, optimized HUD designs, or rare accounts directly to our active Free Fire community. Please configure your Telegram handle to receive sales inquiries."}
                </p>
              </div>
            </div>

            <div className="md:col-span-4 p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col justify-center gap-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Stats</div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500">Active Listings:</span>
                <span className="font-bold text-white font-mono">{products.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Free Giveaways:</span>
                <span className="font-bold text-purple-400 font-mono">
                  {products.filter(p => p.isGiveaway || p.price === 0).length}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Admin Clearance:</span>
                <span className="text-emerald-400 font-bold font-mono uppercase text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">ROOT LEVEL</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC UPLOADER / EDIT FORM */}
          {showUploadForm && (
            <form onSubmit={handleFormSubmit} className="bg-slate-950 border border-orange-500/20 rounded-2xl p-5 space-y-4 animate-slideDown text-xs text-slate-300">
              <div className="border-b border-slate-900 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-100 uppercase flex items-center gap-1.5 text-xs">
                    <Upload className="w-4 h-4 text-orange-500" /> 
                    {editingProductId ? `Modify Listing: "${prodName}"` : 'Specify Listing Specifications & Credentials'}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Drag and drop images, replace categories, or modify price points dynamically.
                  </p>
                </div>
                {editingProductId && (
                  <span className="text-[9px] bg-orange-500/10 border border-orange-500/25 text-orange-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                    Editing Mode
                  </span>
                )}
              </div>

              {successMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left Side fields */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Name / Account Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rare OG Hip Hop Pass Max Account"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-orange-500 text-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-orange-500 text-white transition-colors cursor-pointer"
                      >
                        <option value="Accounts">Accounts</option>
                        <option value="Config Files">Config Files</option>
                        <option value="HUD Layouts">HUD Layouts</option>
                        <option value="Skins">Skins</option>
                        <option value="Coaching">Coaching</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        disabled={isGiveawayItem}
                        placeholder={isGiveawayItem ? "FREE" : "e.g. 19.99"}
                        required={!isGiveawayItem}
                        value={isGiveawayItem ? "" : prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-orange-500 text-white transition-colors disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telegram Escrow Support Username (No @)</label>
                    <input
                      type="text"
                      required
                      placeholder="ghostfirehub1"
                      value={prodTelegram}
                      onChange={(e) => setProdTelegram(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-orange-500 text-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custom Badges &amp; Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer select-none text-[10px] text-slate-300 font-bold uppercase hover:bg-slate-850">
                        <input
                          type="checkbox"
                          checked={isGiveawayItem}
                          onChange={(e) => {
                            setIsGiveawayItem(e.target.checked);
                            if (e.target.checked) setProdPrice('0');
                          }}
                          className="accent-purple-500 w-3.5 h-3.5"
                        />
                        <span>Giveaway</span>
                      </label>

                      <label className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer select-none text-[10px] text-slate-300 font-bold uppercase hover:bg-slate-850">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="accent-orange-500 w-3.5 h-3.5"
                        />
                        <span>Featured</span>
                      </label>

                      <label className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer select-none text-[10px] text-slate-300 font-bold uppercase hover:bg-slate-850">
                        <input
                          type="checkbox"
                          checked={isHiddenListing}
                          onChange={(e) => setIsHiddenListing(e.target.checked)}
                          className="accent-red-500 w-3.5 h-3.5"
                        />
                        <span>Hide Item</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detailed Description &amp; Account Specifications</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Fully maxed Level 75 account, contains EVO Cobra MP40 Level 6, multiple rare outfits, competitive KD ratio."
                      value={prodDescription}
                      onChange={(e) => setProdDescription(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-orange-500 text-white transition-colors resize-none leading-relaxed"
                    ></textarea>
                  </div>

                </div>

                {/* Right Side Drag & Drop */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-1 flex-1 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Snaps &amp; Coverage Image</label>
                    
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('listing-img-input')?.click()}
                      className={`flex-1 min-h-[160px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${dragActive ? 'border-orange-500 bg-orange-500/5' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'}`}
                    >
                      <input 
                        id="listing-img-input"
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="hidden" 
                      />

                      {uploadedImage ? (
                        <div className="space-y-3">
                          <img 
                            src={uploadedImage} 
                            alt="Uploaded snap preview" 
                            className="max-h-24 mx-auto rounded-lg object-cover border border-slate-800 shadow"
                          />
                          <div>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase flex items-center justify-center gap-1">
                              <Check className="w-3.5 h-3.5" /> SNAP LOADED SUCCESSFULLY
                            </p>
                            <p className="text-[9px] text-slate-500 mt-0.5">Click or drag another image to change</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="p-3 bg-slate-900/80 border border-slate-800 text-slate-400 rounded-xl w-12 h-12 flex items-center justify-center mx-auto">
                            <Upload className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-300">Drag &amp; Drop Account Image Here</p>
                            <p className="text-[10px] text-slate-500 mt-1">or click to browse from local device storage</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
                      <span>No login details or passwords should ever be listed publicly. All items remain escrow protected.</span>
                    </div>
                  </div>

                </div>

              </div>

              <div className="flex justify-end gap-3.5 pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-400 text-xs uppercase font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingListing}
                  className="px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-500 text-slate-950 text-xs uppercase font-black tracking-wider rounded-xl transition-all shadow-lg hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingListing ? 'Syncing...' : (editingProductId ? 'Save Changes' : 'Publish Listing')}
                </button>
              </div>
            </form>
          )}

        </div>
      )}

      {/* ACTIVE GIVEAWAY BOARD */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-indigo-950/40 border border-purple-500/20 rounded-3xl p-5 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-600/10 border border-purple-500/30 rounded-2xl text-purple-400 shrink-0">
            <Gift className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <span className="text-[9px] bg-purple-500/20 text-purple-300 font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
              Community Giveaway Active
            </span>
            <h3 className="font-extrabold text-white text-xs uppercase mt-1">Free esports calibrated accounts &amp; VIP Configs</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 max-w-lg leading-relaxed">
              In celebration of our platform launch, we're giving away selected competitive mobile accounts and premium claw layout files for free! Select the Giveaways tab below to claim.
            </p>
          </div>
        </div>
        <button
          onClick={() => setSelectedCategory('Giveaways')}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shrink-0 cursor-pointer"
        >
          View Free Claims
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Catalog Main - LEFT */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Filters & Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-900/30 p-3 rounded-2xl border border-slate-800/80">
            
            {/* Horizontal Categories slider */}
            <div className="flex gap-1 overflow-x-auto pr-2 pb-1.5 sm:pb-0 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all uppercase tracking-wider ${selectedCategory === cat ? 'bg-orange-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Input Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors placeholder:text-slate-700 w-full sm:w-48"
              />
            </div>

          </div>

          {/* GHOSTCORE VENDOR LICENSE & SELLING HUB */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
            {/* Ambient neon backdrop */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    <Briefcase className="w-4 h-4 text-orange-500 shrink-0" />
                  </div>
                  <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                    GhostCore Vendor Hub
                    {currentUser?.isVendor && (
                      <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest animate-pulse">✓ LICENSED</span>
                    )}
                  </h3>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-relaxed max-w-lg font-sans">
                  {currentUser?.isVendor 
                    ? "Your Verified Merchant License is active! Enjoy permanent 20% discounts on all priced assets and list your custom items on our global store instantly."
                    : "Get a registered Merchant account to sell configurations and accounts. Licensed vendors get a permanent 20% discount on all active store items & upload privilege."}
                </p>
              </div>
              
              {!currentUser?.isVendor ? (
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={handleRequestVendorStatus}
                    disabled={currentUser?.vendorRequested}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      currentUser?.vendorRequested 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750' 
                        : 'bg-slate-950 border border-orange-500/30 text-orange-400 hover:bg-slate-900'
                    }`}
                  >
                    {currentUser?.vendorRequested ? 'Request Logged' : 'Submit ID for Verification'}
                  </button>
                </div>
              ) : (
                <div className="text-right shrink-0">
                  <div className="text-[9px] text-slate-500 uppercase font-mono font-bold leading-none">VEND-CODE</div>
                  <div className="text-xs font-bold text-orange-400 font-mono mt-1 tracking-widest">
                    {currentUser?.vendorCode || 'ACTIVE-GP-LIC'}
                  </div>
                </div>
              )}
            </div>

            {/* Key entry & DM link block for non-vendors */}
            {!currentUser?.isVendor && (
              <div className="mt-4 pt-4 border-t border-slate-850/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                <form onSubmit={handleActivateVendorWithKey} className="flex gap-2">
                  <input
                    type="text"
                    value={vendorKeyInput}
                    onChange={(e) => setVendorKeyInput(e.target.value)}
                    placeholder="Enter License Key (e.g. VEND-XXXX)"
                    className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-[10px] text-slate-200 outline-none focus:border-orange-500 transition-colors placeholder:text-slate-700 flex-1 font-mono uppercase"
                  />
                  <button
                    type="submit"
                    disabled={submittingVendorKey}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {submittingVendorKey ? 'Activating...' : 'Activate Key'}
                  </button>
                </form>

                <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-850">
                  <div className="text-[10px] text-slate-400">
                    Want to purchase a personal key?
                  </div>
                  <a
                    href={`https://t.me/ghostfirehub1?text=${encodeURIComponent(`Hi Admin! I want to purchase a GhostCore Vendor Account. My registered email is: ${userEmail || ''}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 text-white fill-current shrink-0" /> DM Admin
                  </a>
                </div>
              </div>
            )}

            {/* Success / Error notification */}
            {(vendorError || vendorSuccess) && (
              <div className="mt-3 animate-slideDown">
                {vendorError && (
                  <div className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl">
                    {vendorError}
                  </div>
                )}
                {vendorSuccess && (
                  <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                    {vendorSuccess}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="bg-slate-900/20 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between gap-4 animate-pulse">
                  <div className="flex gap-3.5">
                    {/* Visual Icon Box Skeleton */}
                    <div className="w-14 h-14 bg-slate-950 border border-slate-850 rounded-xl shrink-0"></div>
                    
                    {/* Header Specs Skeleton */}
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-16 bg-slate-800 rounded-md"></div>
                      <div className="h-4 w-3/4 bg-slate-800 rounded-md"></div>
                      <div className="flex gap-1">
                        <div className="h-3.5 w-12 bg-slate-800 rounded-md"></div>
                        <div className="h-3.5 w-16 bg-slate-800 rounded-md"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description text skeleton */}
                  <div className="h-10 bg-slate-950/40 rounded-lg border border-slate-850/40 w-full"></div>
                  
                  {/* Footer details skeleton */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/40">
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-10 bg-slate-800 rounded-md"></div>
                      <div className="h-4.5 w-20 bg-slate-800 rounded-md"></div>
                    </div>
                    <div className="h-7 w-24 bg-slate-800 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
              No digital products found matching your search term. Try another filter category!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map(prod => {
                const isLiked = likedProductIds.includes(prod.id);
                const isItemGiveaway = prod.isGiveaway || prod.price === 0;

                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProduct(prod);
                      const savedUser = localStorage.getItem('ghostfire_user');
                      if (savedUser) {
                        try {
                          const email = JSON.parse(savedUser).email;
                          trackMissionProgress(email, 'view_marketplace');
                        } catch (e) {}
                      }
                    }}
                    className={`group bg-slate-900/40 border hover:border-orange-500/30 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all duration-200 shadow-lg cursor-pointer relative overflow-hidden ${isItemGiveaway ? 'border-purple-500/20 shadow-purple-950/10' : 'border-slate-800'} ${prod.hidden ? 'opacity-70 bg-slate-950/25 border-dashed border-red-500/20' : ''}`}
                  >
                    {prod.featured && (
                      <span className="absolute top-2.5 right-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] px-2 py-0.5 rounded uppercase font-semibold">
                        VIP CHOICE
                      </span>
                    )}

                    {isItemGiveaway && (
                      <span className="absolute top-2.5 right-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider animate-pulse">
                        GIVEAWAY
                      </span>
                    )}

                    {prod.hidden && (
                      <span className="absolute top-2.5 left-2.5 bg-red-500/15 border border-red-500/30 text-red-400 font-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> HIDDEN
                      </span>
                    )}

                    <div className="flex gap-3.5">
                      {/* Product Visual Icon / Box */}
                      <div className="w-14 h-14 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-200">
                        {prod.image && (prod.image.startsWith('data:') || prod.image.startsWith('http')) ? (
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-2xl">{prod.image || '📦'}</span>
                        )}
                      </div>

                      {/* Header Specs */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                          {prod.category}
                        </span>
                        <h3 className="font-bold text-white text-xs mt-0.5 group-hover:text-orange-400 transition-colors line-clamp-1">
                          {prod.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex text-amber-400 shrink-0">
                            <Star className="w-3 h-3 fill-amber-400" />
                          </div>
                          <span className="text-[10px] text-slate-300 font-mono font-bold">{prod.rating || '5.0'}</span>
                          <span className="text-[9px] text-slate-500">({prod.reviewsCount || 1} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed bg-slate-950/20 p-2 rounded-lg border border-slate-850/40">
                      {prod.description}
                    </p>

                    {/* Footer Details */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/40">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-mono uppercase leading-none">
                          {currentUser?.country?.toLowerCase() === 'nigeria' ? 'Price NGN' : 'Price USD'}
                        </span>
                        {isItemGiveaway ? (
                          <span className="text-sm font-black font-mono text-purple-400 mt-0.5 uppercase tracking-wide">FREE CLAIM</span>
                        ) : currentUser?.isVendor ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm font-black font-mono text-orange-400">{formatPrice(prod.price * 0.8, currentUser?.country)}</span>
                            <span className="text-[9px] line-through font-mono text-slate-500">{formatPrice(prod.price, currentUser?.country)}</span>
                            <span className="text-[7.5px] font-bold text-orange-400 uppercase bg-orange-500/10 border border-orange-500/20 px-1 rounded">Vendor 20% Off</span>
                          </div>
                        ) : (
                          <span className="text-sm font-black font-mono text-white mt-0.5">{formatPrice(prod.price, currentUser?.country)}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Administrator Modification Operations */}
                        {isPlatformAdmin && (
                          <div className="flex items-center gap-1 border-r border-slate-800 pr-2 mr-1">
                            <button
                              onClick={(e) => handleStartEdit(prod, e)}
                              title="Edit Listing"
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-orange-500 hover:border-orange-500/20 transition-all cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(prod.id, e)}
                              title="Delete Listing"
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-red-500 hover:border-red-500/20 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {onToggleBookmark && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!userEmail) {
                                alert('Please register or log in to bookmark products.');
                                return;
                              }
                              onToggleBookmark('product', prod.id);
                            }}
                            className={`p-2 rounded-lg border transition-all ${bookmarkedProductIds.includes(prod.id) ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                            title="Bookmark this product"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${bookmarkedProductIds.includes(prod.id) ? 'fill-current' : ''}`} />
                          </button>
                        )}

                        <button
                          onClick={(e) => toggleLike(prod.id, e)}
                          className={`p-2 rounded-lg border transition-all ${isLiked ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${isItemGiveaway ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-orange-600 hover:bg-orange-500 text-slate-950'}`}>
                          Specs <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Product Details overlay / Order History Sidebar - RIGHT */}
        <div className="lg:col-span-4 space-y-6">
          
          {selectedProduct ? (
            <div className={`bg-gradient-to-b from-slate-900 to-slate-950 border rounded-3xl p-5 shadow-2xl flex flex-col gap-5 animate-fadeIn relative ${selectedProduct.isGiveaway || selectedProduct.price === 0 ? 'border-purple-500/30' : 'border-orange-500/20'}`}>
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>

              <div className="pb-3 border-b border-slate-800/80 mt-2">
                <span className={`text-[9px] border font-mono px-2 py-0.5 rounded uppercase font-bold ${selectedProduct.isGiveaway || selectedProduct.price === 0 ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                  {selectedProduct.isGiveaway || selectedProduct.price === 0 ? 'Giveaway Listing' : 'Active Listing Overview'}
                </span>
                
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-14 h-14 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    {selectedProduct.image && (selectedProduct.image.startsWith('data:') || selectedProduct.image.startsWith('http')) ? (
                      <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">{selectedProduct.image || '📦'}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs uppercase leading-tight">{selectedProduct.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500">Category:</span>
                      <span className="text-[10px] text-slate-300 font-semibold uppercase">{selectedProduct.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specs Details */}
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Delivery Time</span>
                  <span className="font-bold text-slate-200 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Instant (Within 10m)
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Security Clearance</span>
                  <span className="font-bold text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Client-safe (No ban)
                  </span>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-orange-500" /> Product Details
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
                    "{selectedProduct.description}"
                  </p>
                </div>
              </div>

              {/* Dynamic instruction notice about not selling login credentials directly */}
              {selectedProduct.category === 'Accounts' && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-slate-300 space-y-1">
                  <div className="font-bold text-orange-400 uppercase flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    Secure Trading Protocol
                  </div>
                  <p className="leading-relaxed font-sans">
                    To prevent fraud, account login details and credentials are <strong>never</strong> sold or listed publicly on the page. All transactions must be completed on Telegram support, under fully secure escrow validation.
                  </p>
                </div>
              )}

              {/* Pricing banner */}
              <div className={`p-4 bg-slate-950 border rounded-2xl flex justify-between items-center ${selectedProduct.isGiveaway || selectedProduct.price === 0 ? 'border-purple-500/30' : 'border-orange-500/20'}`}>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono leading-none">Escrow Price</span>
                  {selectedProduct.isGiveaway || selectedProduct.price === 0 ? (
                    <div className="text-xl font-black font-mono text-purple-400 mt-1 uppercase tracking-wide">FREE CLAIM</div>
                  ) : currentUser?.isVendor ? (
                    <div className="flex items-baseline gap-2 mt-1">
                      <div className="text-2xl font-black font-mono text-orange-400">{formatPrice(selectedProduct.price * 0.8, currentUser?.country)}</div>
                      <div className="text-xs line-through font-mono text-slate-500">{formatPrice(selectedProduct.price, currentUser?.country)}</div>
                      <div className="text-[8px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded font-bold uppercase border border-orange-500/20">Vendor 20% Off</div>
                    </div>
                  ) : (
                    <div className="text-2xl font-black font-mono text-white mt-1">{formatPrice(selectedProduct.price, currentUser?.country)}</div>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-[9px] border font-mono px-2 py-0.5 rounded uppercase font-semibold ${selectedProduct.isGiveaway || selectedProduct.price === 0 ? 'bg-purple-500/20 border-purple-500/30 text-purple-300 animate-pulse' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                    In Stock
                  </span>
                </div>
              </div>

              {/* Secure CTA Buy via Telegram */}
              <div className="flex flex-col gap-2.5">
                <a
                  href={`https://t.me/${selectedProduct.telegramLink || 'ghostfirehub1'}?text=${encodeURIComponent(
                    selectedProduct.isGiveaway || selectedProduct.price === 0
                      ? `I'm from your website, I want to claim or participate in the giveaway of "${selectedProduct.name}". Kindly DM me.`
                      : currentUser?.isVendor
                      ? `Hi! I'm a registered GhostCore Vendor. I want to buy "${selectedProduct.name}" at the 20% Vendor Discount rate of $${(selectedProduct.price * 0.8).toFixed(2)}. My registered email is: ${userEmail || ''}.`
                      : `I'm a professional, I'm from your website, I want to buy an account or I want to purchase "${selectedProduct.name}". Kindly DM me.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full py-3.5 text-slate-950 font-extrabold uppercase text-xs tracking-widest rounded-2xl text-center shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer ${selectedProduct.isGiveaway || selectedProduct.price === 0 ? 'bg-gradient-to-r from-purple-600 to-indigo-500 shadow-purple-500/10 hover:brightness-110 text-white' : 'bg-gradient-to-r from-orange-600 to-amber-500 shadow-orange-500/10 hover:brightness-110 text-slate-950'}`}
                >
                  <Send className={`w-4 h-4 shrink-0 ${selectedProduct.isGiveaway || selectedProduct.price === 0 ? 'text-white fill-current' : 'text-slate-950 fill-current'}`} />
                  <span>
                    {selectedProduct.isGiveaway || selectedProduct.price === 0 
                      ? 'Claim Giveaway via DM' 
                      : `DM Owner to Purchase (@${selectedProduct.telegramLink || 'ghostfirehub1'})`}
                  </span>
                </a>
                <p className="text-[10px] text-slate-500 text-center leading-normal font-sans">
                  Note: Clicking the link opens direct messenger support with our Telegram handle <strong>@{selectedProduct.telegramLink || 'ghostfirehub1'}</strong> automatically.
                </p>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/10 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-sm text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="p-3 bg-slate-900 border border-slate-850 rounded-2xl text-slate-600 mb-3">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item Details</h3>
              <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-normal font-sans">
                Select any digital configuration file, claw layout blueprint, skin overlay or custom coaching lesson to inspect delivery parameters and launch the buy process.
              </p>
            </div>
          )}

          {/* Local Order History */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-orange-500" />
              Your Purchase History
            </h3>
            
            {userEmail ? (
              <div className="space-y-2 text-xs">
                {orders.map(o => (
                  <div key={o.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-200 line-clamp-1">{o.item}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{o.id} • {o.date}</div>
                    </div>
                    <div className="text-right font-mono text-[11px] shrink-0 ml-2">
                      <span className="font-bold text-slate-200">{formatPrice(o.price, currentUser?.country)}</span>
                      <div className="text-[9px] text-emerald-400 font-bold">{o.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-600 italic font-sans">
                Sign up and register to view your secure automated purchase history here.
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
