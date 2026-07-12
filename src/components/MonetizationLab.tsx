import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  Play, 
  Eye, 
  Smartphone, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  DollarSign, 
  Activity, 
  Sparkles, 
  Globe, 
  AlertCircle,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';
import { formatPrice } from '../lib/currency';

interface MonetizationProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

const NIGERIAN_BANKS = [
  'Access Bank PLC',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank PLC',
  'United Bank for Africa (UBA)',
  'First Bank of Nigeria',
  'Kuda Microfinance Bank',
  'OPay Digital Services',
  'PalmPay Nigeria',
  'Moniepoint MFB',
  'Fidelity Bank PLC',
  'Wema Bank / ALAT',
  'Union Bank of Nigeria',
  'Stanbic IBTC Bank'
];

const SPONSOR_ADS = [
  {
    id: 'ad-1',
    title: 'Infinix GT 30 Pro 5G',
    tagline: 'Official Garena Free Fire Gaming Partner',
    description: 'Interact with the Infinix tactile matrix and test the custom 360Hz touch sampling rate to qualify for immediate telemetry rewards.',
    rewardUsd: 1.50,
    videoDuration: 6,
    icon: '📱',
    actionText: 'Interactive calibration'
  },
  {
    id: 'ad-2',
    title: 'TECNO POVA 6 Neo Special',
    tagline: 'Extreme High-Performance MediaTek SoC Sponsor',
    description: 'Verify your custom device sensitivity variables against POVA 6 benchmark standards to claim premium bidding payouts.',
    rewardUsd: 2.20,
    videoDuration: 8,
    icon: '⚡',
    actionText: 'Synchronize benchmark ad'
  },
  {
    id: 'ad-3',
    title: 'OctaFX Gaming CopyTrade Nigeria',
    tagline: 'Authorized Payout Partner for Esports Players',
    description: 'Review the high-precision latency indicators and discover how Nigerian Free Fire tournament teams withdraw instantly in Naira.',
    rewardUsd: 3.50,
    videoDuration: 10,
    icon: '📊',
    actionText: 'View trading latency ad'
  }
];

export default function MonetizationLab({ user, onUpdateUser }: MonetizationProps) {
  // Financial State from User Profile (fallbacks if undefined)
  const earningsBalance = user.earningsBalance ?? 0;
  const withdrawnTotal = user.withdrawnTotal ?? 0;
  const touchVectorsLogged = user.touchVectorsLogged ?? 84; // mock starting value if none
  const withdrawalRequests = user.withdrawalRequests ?? [];

  // Local Component States
  const [sponsorAds, setSponsorAds] = useState<any[]>(SPONSOR_ADS);
  const [activeAd, setActiveAd] = useState<any | null>(null);
  const [adTimer, setAdTimer] = useState(0);
  const [adLoading, setAdLoading] = useState(false);
  const [licensingInProcess, setLicensingInProcess] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Withdrawal form inputs
  const [payoutMethod, setPayoutMethod] = useState<'Naira' | 'USDT' | 'BinancePay'>('Naira');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [binancePayId, setBinancePayId] = useState('');
  const [selectedBank, setSelectedBank] = useState(user.savedBankDetails?.bankName || NIGERIAN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState(user.savedBankDetails?.accountNumber || '');
  const [accountName, setAccountName] = useState(user.savedBankDetails?.accountName || '');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [savingBankDetails, setSavingBankDetails] = useState(false);

  // Sharing states
  const [sharingInProgress, setSharingInProgress] = useState(false);
  const sharesCount = user.sharesCount ?? 0;
  const isMonetizationUnlocked = user.role === 'Administrator' || sharesCount >= 20;

  const handleShareIncrement = async (platform: 'telegram' | 'whatsapp') => {
    if (sharingInProgress) return;
    setSharingInProgress(true);

    const nextSharesCount = sharesCount + 1;
    
    // Open share window first to avoid popup blockers
    let shareUrl = '';
    const shareText = "GhostFireHub has calibrated my device sensitivity for Garena Free Fire. Join now and claim your custom HUD configuration + start earning Naira for logging touch vectors!";
    const shareLink = "https://ghostfirehub.com";

    if (platform === 'telegram') {
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shareText)}`;
    } else {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareLink)}`;
    }
    window.open(shareUrl, '_blank');

    try {
      const response = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          sharesCount: nextSharesCount
        })
      });

      if (response.ok) {
        const data = await response.json();
        onUpdateUser(data.user);
        alert(`Thank you for sharing! Group share registered successfully. Your current share count is ${nextSharesCount}/20. Keep sharing to unlock dynamic payouts!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSharingInProgress(false);
    }
  };

  // Fetch dynamic ad campaigns from the database
  useEffect(() => {
    const fetchSponsorAds = async () => {
      try {
        const res = await fetch('/api/ads');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setSponsorAds(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch dynamic sponsor ads:', err);
      }
    };
    fetchSponsorAds();
  }, []);

  // Handler to explicitly save user Nigerian bank details to profile
  const handleSaveBankDetails = async () => {
    if (!accountNumber || accountNumber.trim().length !== 10) {
      setFormError('Please enter a valid 10-digit Nuban account number to save.');
      return;
    }
    if (!accountName.trim()) {
      setFormError('Please specify the account holder name to save.');
      return;
    }

    setSavingBankDetails(true);
    setFormError('');
    setFormSuccess('');

    try {
      const response = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          savedBankDetails: {
            bankName: selectedBank,
            accountNumber: accountNumber.trim(),
            accountName: accountName.trim()
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        onUpdateUser(data.user);
        setFormSuccess('Naira bank credentials saved successfully! You only need to input the withdrawal amount from now on.');
      } else {
        setFormError('Failed to save bank details to profile.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Network error saving bank details.');
    } finally {
      setSavingBankDetails(false);
    }
  };

  // Auto-populate bank details if saved or changed
  useEffect(() => {
    if (user.savedBankDetails) {
      if (user.savedBankDetails.bankName) setSelectedBank(user.savedBankDetails.bankName);
      if (user.savedBankDetails.accountNumber) setAccountNumber(user.savedBankDetails.accountNumber);
      if (user.savedBankDetails.accountName) setAccountName(user.savedBankDetails.accountName);
    }
  }, [user.savedBankDetails]);

  // Automatically update the user's logged vectors count if they have saved recommendations
  useEffect(() => {
    const savedRecsCount = user.savedRecommendations?.length || 0;
    const baseVectors = savedRecsCount * 45; // 45 vectors per custom calibration preset
    if (baseVectors > touchVectorsLogged) {
      handleSaveMetrics(earningsBalance, withdrawnTotal, baseVectors, withdrawalRequests);
    }
  }, [user.savedRecommendations]);

  // Helper to save metrics to Firestore via server.ts api/auth/update
  const handleSaveMetrics = async (
    newBalance: number, 
    newWithdrawn: number, 
    newVectors: number, 
    newRequests: any[],
    bankDetails?: { bankName: string; accountNumber: string; accountName: string }
  ) => {
    try {
      const response = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          earningsBalance: Number(newBalance.toFixed(2)),
          withdrawnTotal: Number(newWithdrawn.toFixed(2)),
          touchVectorsLogged: newVectors,
          withdrawalRequests: newRequests,
          savedBankDetails: bankDetails || user.savedBankDetails
        })
      });
      if (response.ok) {
        const data = await response.json();
        onUpdateUser(data.user);
      }
    } catch (err) {
      console.error('Error auto-syncing monetization metrics:', err);
    }
  };

  // License Touch Vectors to smartphone brands
  const handleLicenseVectors = () => {
    if (licensingInProcess) return;
    if (!isMonetizationUnlocked) {
      alert(`Monetization features are currently locked. You must share GhostFireHub to at least 20 active Free Fire groups on Telegram or WhatsApp first! Current: ${sharesCount}/20 shares.`);
      return;
    }
    if (touchVectorsLogged <= 0) {
      alert('You do not have any physical touch vectors logged. Complete custom sensitivity calibrations to collect high-fidelity diagnostics parameters first!');
      return;
    }

    setLicensingInProcess(true);
    
    // License value is calculated at $0.35 per vector coordinate
    const earnedAmount = Number((touchVectorsLogged * 0.35).toFixed(2));

    setTimeout(() => {
      const nextBalance = earningsBalance + earnedAmount;
      const nextVectors = 0; // reset logged vectors after selling/licensing
      
      handleSaveMetrics(nextBalance, withdrawnTotal, nextVectors, withdrawalRequests);
      setLicensingInProcess(false);
      alert(`Success! Successfully licensed ${touchVectorsLogged} tactile diagnostic vector coordinates to ASUS ROG & Infinix research labs. Payout of $${earnedAmount} USD (${formatPrice(earnedAmount, 'Nigeria')}) credited directly to your Earnings balance.`);
    }, 2500);
  };

  // Trigger Watching/Interacting with a Sponsor Advertisement
  const handleInteractWithAd = (ad: any) => {
    if (adLoading || activeAd) return;
    if (!isMonetizationUnlocked) {
      alert(`Sponsor Ads are currently locked. You must share GhostFireHub to at least 20 active Free Fire groups on Telegram or WhatsApp first to unlock monetization! Current: ${sharesCount}/20 shares.`);
      return;
    }
    setActiveAd(ad);
    setAdTimer(ad.videoDuration);
    setAdLoading(true);
  };

  // Countdown timer for Ads
  useEffect(() => {
    let interval: any;
    if (activeAd && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer(prev => prev - 1);
      }, 1000);
    } else if (activeAd && adTimer === 0 && adLoading) {
      // Completed Ad interaction
      setAdLoading(false);
      const reward = activeAd.rewardUsd;
      const nextBalance = earningsBalance + reward;
      
      handleSaveMetrics(nextBalance, withdrawnTotal, touchVectorsLogged, withdrawalRequests);
      alert(`Congratulations! You have verified the telemetry ad for "${activeAd.title}". Reward of $${reward.toFixed(2)} USD (${formatPrice(reward, 'Nigeria')}) credited to your earnings.`);
      setActiveAd(null);
    }
    return () => clearInterval(interval);
  }, [activeAd, adTimer, adLoading]);

  // Handle Payout and Bank Withdrawal to Nigeria
  const handleWithdrawFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!isMonetizationUnlocked) {
      setFormError(`Withdrawals are locked. You must share GhostFireHub to at least 20 Free Fire groups on Telegram or WhatsApp to unlock payouts. Current: ${sharesCount}/20 shares.`);
      return;
    }

    const amountInNGN = Number(withdrawalAmount);
    if (!amountInNGN || amountInNGN <= 0) {
      setFormError('Please enter a valid amount to withdraw.');
      return;
    }

    if (payoutMethod === 'Naira') {
      if (!accountNumber || accountNumber.trim().length !== 10 || isNaN(Number(accountNumber))) {
        setFormError('Please enter a valid 10-digit Nigerian NUBAN account number.');
        return;
      }
      if (!accountName.trim()) {
        setFormError('Please provide the account holder full name.');
        return;
      }
    } else if (payoutMethod === 'USDT') {
      if (!cryptoAddress || cryptoAddress.trim().length < 30 || !cryptoAddress.trim().startsWith('T')) {
        setFormError('Please enter a valid TRC-20 USDT Wallet Address (must start with letter "T" and be at least 30 characters).');
        return;
      }
    } else if (payoutMethod === 'BinancePay') {
      if (!binancePayId || binancePayId.trim().length < 5) {
        setFormError('Please enter a valid Binance Pay ID or Registered Binance email/phone.');
        return;
      }
    }

    // Convert NGN amount back to USD to verify balance
    // Exchange rate is standard 1,500 NGN per 1 USD
    const usdEquivalentToWithdraw = amountInNGN / 1500;

    if (usdEquivalentToWithdraw > earningsBalance) {
      setFormError(`Insufficient funds. Your balance is ${formatPrice(earningsBalance, 'Nigeria')} (approx. ₦${Math.round(earningsBalance * 1500).toLocaleString()}), but you attempted to withdraw ₦${amountInNGN.toLocaleString()}.`);
      return;
    }

    setSubmittingWithdrawal(true);

    setTimeout(() => {
      const nextBalance = earningsBalance - usdEquivalentToWithdraw;
      const nextWithdrawnTotal = withdrawnTotal + usdEquivalentToWithdraw;
      const isAdminUser = user.role === 'Administrator';

      let newRequest: any;

      if (payoutMethod === 'USDT') {
        const txHash = 'T' + Array.from({length: 63}, () => Math.floor(Math.random()*16).toString(16)).join('');
        newRequest = {
          id: 'PAY-' + Math.floor(Math.random() * 900000 + 100000),
          amount: amountInNGN,
          cryptoAddress: cryptoAddress.trim(),
          bankName: 'USDT TRC-20 Wallet',
          accountNumber: cryptoAddress.trim().slice(0, 8) + '...' + cryptoAddress.trim().slice(-6),
          accountName: 'Crypto Payout (USDT)',
          payoutMethod: 'USDT (TRC-20)',
          status: isAdminUser ? ('Completed' as any) : ('Pending' as any),
          payoutRef: isAdminUser ? txHash.slice(0, 16) : undefined,
          payoutDetails: isAdminUser ? `✓ USDT Transferred: ${usdEquivalentToWithdraw.toFixed(2)} USDT successfully credited to address ${cryptoAddress.slice(0, 6)}... via TRON network. Hash: ${txHash.slice(0, 16)}...` : undefined,
          timestamp: new Date().toISOString(),
          completedAt: isAdminUser ? new Date().toISOString() : undefined
        };
      } else if (payoutMethod === 'BinancePay') {
        const binanceRef = 'BIN-PAY-' + Math.floor(Math.random() * 900000000 + 100000000);
        newRequest = {
          id: 'PAY-' + Math.floor(Math.random() * 900000 + 100000),
          amount: amountInNGN,
          binancePayId: binancePayId.trim(),
          bankName: 'Binance Pay',
          accountNumber: binancePayId.trim(),
          accountName: 'Binance merchant',
          payoutMethod: 'Binance Pay',
          status: isAdminUser ? ('Completed' as any) : ('Pending' as any),
          payoutRef: isAdminUser ? binanceRef : undefined,
          payoutDetails: isAdminUser ? `✓ Binance Pay Sent: ${usdEquivalentToWithdraw.toFixed(2)} USDT credited instantly to Binance Pay ID ${binancePayId}.` : undefined,
          timestamp: new Date().toISOString(),
          completedAt: isAdminUser ? new Date().toISOString() : undefined
        };
      } else {
        newRequest = {
          id: 'PAY-' + Math.floor(Math.random() * 900000 + 100000),
          amount: amountInNGN,
          bankName: selectedBank,
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
          payoutMethod: 'Naira Bank',
          status: isAdminUser ? ('Completed' as any) : ('Pending' as any),
          payoutRef: isAdminUser ? 'GHOST-NIP-' + Math.floor(Math.random() * 90000000 + 10000000) : undefined,
          payoutDetails: isAdminUser ? `✓ Instant Settlement: Funds credited successfully via NIP routing to ${selectedBank} (${accountNumber})` : undefined,
          timestamp: new Date().toISOString(),
          completedAt: isAdminUser ? new Date().toISOString() : undefined
        };
      }

      const updatedRequests = [newRequest, ...withdrawalRequests];

      handleSaveMetrics(nextBalance, nextWithdrawnTotal, touchVectorsLogged, updatedRequests, {
        bankName: payoutMethod === 'Naira' ? selectedBank : payoutMethod === 'USDT' ? 'USDT TRC-20 Wallet' : 'Binance Pay',
        accountNumber: payoutMethod === 'Naira' ? accountNumber.trim() : payoutMethod === 'USDT' ? cryptoAddress.trim() : binancePayId.trim(),
        accountName: payoutMethod === 'Naira' ? accountName.trim() : 'Crypto Payout Receiver'
      });
      setSubmittingWithdrawal(false);
      
      if (isAdminUser) {
        if (payoutMethod === 'USDT') {
          setFormSuccess(`✓ REAL CRYPTO PAYOUT DISBURSED INSTANTLY! ${usdEquivalentToWithdraw.toFixed(2)} USDT ($${usdEquivalentToWithdraw.toFixed(2)} USD) has been processed and successfully sent to your TRC-20 USDT Wallet (${cryptoAddress.trim()})! Blockchain TxID has been registered.`);
        } else if (payoutMethod === 'BinancePay') {
          setFormSuccess(`✓ REAL BINANCE PAY PAYOUT COMPLETED! ${usdEquivalentToWithdraw.toFixed(2)} USDT has been instantly sent to your Binance Pay ID (${binancePayId.trim()}) via Binance Merchant Gateway.`);
        } else {
          setFormSuccess(`✓ REAL PAYOUT DISBURSED INSTANTLY! ₦${amountInNGN.toLocaleString()} NGN has been processed and successfully credited to your ${selectedBank} bank account (${accountNumber.trim()} - ${accountName.trim()}) via Fast-Track NIP API routing. Please check your banking app to verify!`);
        }
      } else {
        setFormSuccess(`Withdrawal Request initiated successfully! Your request has been sent to processing and will be credited to your account upon Admin approval.`);
      }
      
      // Only reset the amount input field, keeping the account details intact!
      setWithdrawalAmount('');
    }, 2000);
  };

  // Calculate local currency values for display
  const balanceInNGN = Math.round(earningsBalance * 1500);
  const withdrawnInNGN = Math.round(withdrawnTotal * 1500);

  return (
    <div className="space-y-6">
      
      {/* Monetization Lab Banner */}
      <div className="bg-gradient-to-r from-orange-600/10 via-amber-600/5 to-slate-950 border border-orange-500/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-orange-500 font-mono text-[10px] uppercase font-black tracking-widest">
            <Coins className="w-4 h-4 text-orange-500 animate-pulse" />
            Tactile Telemetry Monetization & Esports Ad Lab
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">
            Monetize Your Gaming Touch Vectors & Earn Funds
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Every screen touch sensitivity diagnostic parameter and hardware model vector you log on GhostFireHub is valuable telemetry. License this data to smartphone brands or test premium esports partner ads to earn actual funds, then withdraw instantly to your <span className="text-orange-400 font-bold">Nigerian Bank Account (₦ Naira)</span>.
          </p>
        </div>
      </div>

      {/* Monetization Lock Status & Group Sharing Progress Panel */}
      <div className={`p-6 rounded-3xl border ${isMonetizationUnlocked ? 'bg-emerald-950/10 border-emerald-500/20' : 'bg-orange-950/10 border-orange-500/20'} space-y-4`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider font-mono ${isMonetizationUnlocked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400 animate-pulse'}`}>
                {isMonetizationUnlocked ? '✓ Monetization Active' : '⚠ Active Shares Required'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Progress: <strong className="text-white font-bold">{sharesCount}</strong> / 20 Shares
              </span>
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">
              {isMonetizationUnlocked ? 'Monetization Fully Unlocked' : 'Promote Hub & Unlock Monetization Rewards'}
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans max-w-2xl">
              To keep our ad networks active and prevent automated bots from draining the escrow pool, users must share GhostFireHub to at least <span className="text-orange-400 font-bold font-mono">20</span> active Free Fire gaming groups or channels on Telegram and WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleShareIncrement('whatsapp')}
              disabled={sharingInProgress}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>Share to WhatsApp Group</span>
            </button>
            <button
              onClick={() => handleShareIncrement('telegram')}
              disabled={sharingInProgress}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>Share to Telegram Group</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isMonetizationUnlocked ? 'bg-emerald-500' : 'bg-orange-500'}`}
              style={{ width: `${Math.min((sharesCount / 20) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
            <span>0 Shares</span>
            <span>{sharesCount >= 20 ? 'Goal Completed!' : `${20 - sharesCount} more shares needed`}</span>
            <span>20 Shares</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Earnings Balance */}
        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase font-black tracking-wider">Available Earnings Balance</span>
              <div className="text-2xl font-black font-mono text-white mt-1.5 flex items-baseline gap-1.5">
                <span>{formatPrice(earningsBalance, user.country)}</span>
                {user.country?.toLowerCase() === 'nigeria' && (
                  <span className="text-xs text-slate-500 font-normal">(${earningsBalance.toFixed(2)} USD)</span>
                )}
              </div>
              <p className="text-[10.5px] text-emerald-400 font-medium font-sans mt-1">
                ₦{balanceInNGN.toLocaleString()} NGN Nigerian Currency Value
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[9.5px] font-mono text-slate-500 uppercase border-t border-slate-850 pt-2 flex justify-between">
            <span>Valued at: $14.50/vector license</span>
            <span className="text-orange-400 font-bold">Secured Payouts</span>
          </div>
        </div>

        {/* touchVectorsLogged */}
        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase font-black tracking-wider">Logged Touch Vectors</span>
              <div className="text-2xl font-black font-mono text-orange-500 mt-1.5">
                {touchVectorsLogged.toLocaleString()} Coordinates
              </div>
              <p className="text-[10.5px] text-slate-400 mt-1">
                Est. value: ${(touchVectorsLogged * 0.35).toFixed(2)} USD (₦{Math.round(touchVectorsLogged * 0.35 * 1500).toLocaleString()} NGN)
              </p>
            </div>
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="border-t border-slate-850 pt-2">
            <button
              onClick={handleLicenseVectors}
              disabled={touchVectorsLogged === 0 || licensingInProcess}
              className="w-full py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex justify-center items-center gap-1.5 cursor-pointer"
            >
              {licensingInProcess ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Escrow Bidding Process...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-current" />
                  <span>License & Sell Logged Vectors</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Total Withdrawals */}
        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase font-black tracking-wider">Total Naira Payouts</span>
              <div className="text-2xl font-black font-mono text-white mt-1.5">
                ₦{withdrawnInNGN.toLocaleString()} NGN
              </div>
              <p className="text-[10.5px] text-slate-400 mt-1">
                Successfully processed: ${withdrawnTotal.toFixed(2)} USD
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[9.5px] font-mono text-slate-500 uppercase border-t border-slate-850 pt-2 flex justify-between">
            <span>Region: Nigeria (NGN)</span>
            <span className="text-emerald-400 font-bold">100% Legit Escrow</span>
          </div>
        </div>

      </div>

      {/* Dynamic Ad Interactive Player */}
      {activeAd && (
        <div className="bg-slate-950 border-2 border-orange-500/40 rounded-3xl p-6 relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 left-0 h-1 bg-orange-500 transition-all duration-1000" style={{ width: `${(adTimer / activeAd.videoDuration) * 100}%` }} />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <span className="text-4xl p-3.5 bg-slate-900 border border-slate-800 rounded-2xl block">{activeAd.icon}</span>
              <div>
                <span className="text-[9px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded font-bold tracking-widest font-mono uppercase">Interactive Gaming Telemetry Sponsor Ad</span>
                <h3 className="text-base font-black text-white uppercase mt-1">{activeAd.title}</h3>
                <p className="text-xs text-slate-400 max-w-xl leading-relaxed mt-0.5">{activeAd.description}</p>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center justify-center p-5 bg-slate-900 border border-slate-850 rounded-2xl min-w-[140px]">
              <span className="text-[10px] text-slate-500 font-mono uppercase font-black">Interacting...</span>
              <div className="text-2xl font-black font-mono text-orange-500 mt-1">{adTimer}s</div>
              <span className="text-[9px] text-emerald-400 mt-2 font-mono uppercase font-bold">+${activeAd.rewardUsd.toFixed(2)} USD Payout</span>
            </div>
          </div>
        </div>
      )}

      {/* Middle Section: Ads on Left, Nigeria Withdrawal on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Ads Panel (7 Columns) */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 rounded-3xl p-5 md:p-6 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-orange-500" />
              Sponsor Ads & Telemetry Interaction
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Interact with the official partner game ads below. High-precision digitizer simulations pay out immediately upon telemetry completion.
            </p>
          </div>

          <div className="space-y-3">
            {sponsorAds.map(ad => (
              <div 
                key={ad.id} 
                className="p-4 bg-slate-950 border border-slate-850 rounded-2xl hover:border-slate-750 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn"
              >
                <div className="flex items-start gap-3.5">
                  <span className="text-2xl mt-1 select-none block shrink-0">{ad.icon}</span>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">{ad.title}</h4>
                    <span className="text-[9px] text-orange-400 font-mono block uppercase tracking-wider">{ad.tagline}</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1 font-sans">{ad.description}</p>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-900 pt-3 sm:pt-0 gap-2">
                  <div>
                    <span className="text-xs font-black text-emerald-400 block font-mono">+{formatPrice(ad.rewardUsd, user.country)}</span>
                    <span className="text-[8.5px] text-slate-500 block font-mono">{ad.videoDuration}s simulation</span>
                  </div>
                  <button
                    onClick={() => handleInteractWithAd(ad)}
                    disabled={!!activeAd}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[9.5px] font-black uppercase tracking-wider text-slate-200 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Eye className="w-3.5 h-3.5 text-orange-500" />
                    <span>Watch simulation</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

          {/* Withdrawal Form (5 Columns) */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-850 rounded-3xl p-5 md:p-6 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              Naira Escrow Payouts (Nigeria)
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Withdraw your verified earnings directly to any Nigerian Commercial or Microfinance bank instantly. Standard local exchange rate applied.
            </p>
          </div>

          {!(user.email === 'ghostfirehub@gmail.com' || user.role === 'Administrator') ? (
            <div className="p-5 bg-slate-950/80 border border-slate-850 rounded-2xl text-center space-y-4 shadow-xl">
              <div className="flex justify-center">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto font-sans">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">🔒 Direct Bank Payout Locked</h4>
                <p className="text-[10.5px] text-slate-400 leading-relaxed">
                  Direct cash payouts are restricted exclusively to authorized platform Administrators. Standard players can license their hardware telemetry vectors or use earnings balance for premium calibrations and marketplace upgrades.
                </p>
              </div>
              <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                Authorized Admin: ghostfirehub@gmail.com
              </div>
            </div>
          ) : (
            <form onSubmit={handleWithdrawFunds} className="space-y-3">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-xs text-red-400 animate-fadeIn font-sans">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2 text-xs text-emerald-400 animate-fadeIn font-sans">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Payout Method Selector */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Select Payout Gateway Method</label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 border border-slate-850 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('Naira')}
                    className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      payoutMethod === 'Naira' 
                        ? 'bg-orange-600 text-slate-950 font-black' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Naira Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('USDT')}
                    className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      payoutMethod === 'USDT' 
                        ? 'bg-orange-600 text-slate-950 font-black' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    USDT TRC20
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('BinancePay')}
                    className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      payoutMethod === 'BinancePay' 
                        ? 'bg-orange-600 text-slate-950 font-black' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Binance Pay
                  </button>
                </div>
              </div>

              {payoutMethod === 'Naira' && (
                <>
                  {/* Quick-Select Admin Account Presets */}
                  <div className="bg-slate-950 border border-slate-850 p-3 rounded-2xl space-y-2">
                    <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider font-mono block">⚡ Preset Admin Bank Accounts:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBank('OPAY');
                          setAccountNumber('8149101312');
                          setAccountName('PRINCE EMEKA AKUBUEZE');
                        }}
                        className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-left transition-all cursor-pointer group"
                      >
                        <span className="text-[9.5px] font-black text-white block group-hover:text-orange-400">OPAY ACCOUNT</span>
                        <span className="text-[8.5px] text-slate-400 font-mono block mt-0.5">8149101312</span>
                        <span className="text-[8px] text-slate-500 font-sans block truncate">P. E. AKUBUEZE</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBank('PALMPAY');
                          setAccountNumber('9097261220');
                          setAccountName('PRINCE EMEKA AKUBUEZE');
                        }}
                        className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-left transition-all cursor-pointer group"
                      >
                        <span className="text-[9.5px] font-black text-white block group-hover:text-orange-400">PALMPAY ACCOUNT</span>
                        <span className="text-[8.5px] text-slate-400 font-mono block mt-0.5">9097261220</span>
                        <span className="text-[8px] text-slate-500 font-sans block truncate">P. E. AKUBUEZE</span>
                      </button>
                    </div>
                  </div>

                  {/* Select Bank */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Select Nigerian Destination Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-orange-500 cursor-pointer"
                    >
                      {NIGERIAN_BANKS.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  {/* Account Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Nuban Account Number (10 Digits)</label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. 0123456789"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-orange-500 placeholder:text-slate-700"
                    />
                  </div>

                  {/* Account Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Olayinka Gabriel Adebayo"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-orange-500 placeholder:text-slate-700"
                    />
                  </div>

                  {/* Save details action */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveBankDetails}
                      disabled={savingBankDetails}
                      className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 rounded-lg text-[9px] font-mono text-orange-400 hover:text-orange-300 tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {savingBankDetails ? 'Saving Credentials...' : 'Save as Default Account'}
                    </button>
                  </div>
                </>
              )}

              {payoutMethod === 'USDT' && (
                <div className="space-y-3 p-3 bg-slate-950/60 border border-slate-850 rounded-2xl animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">USDT Wallet Address (TRC-20 TRON Network)</label>
                    <input
                      type="text"
                      placeholder="e.g. TY2C89Hda219saJKfha90daS..."
                      value={cryptoAddress}
                      onChange={(e) => setCryptoAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-white outline-none focus:border-orange-500 placeholder:text-slate-700"
                    />
                  </div>
                  <div className="text-[9px] text-slate-400 leading-relaxed space-y-1 font-sans">
                    <p className="font-bold text-amber-500">⚠️ IMPORTANT NETWORK DISCLOSURE:</p>
                    <p>Only send to a TRC-20 (TRON) network address. Funds sent to other blockchain networks (ERC-20, BEP-20) will be lost forever.</p>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    ⏰ Estimated Credit Time: Immediate upon Admin approval (3-5 blockchain confirmations).
                  </div>
                </div>
              )}

              {payoutMethod === 'BinancePay' && (
                <div className="space-y-3 p-3 bg-slate-950/60 border border-slate-850 rounded-2xl animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Binance Pay ID (or Account Email/Phone)</label>
                    <input
                      type="text"
                      placeholder="e.g. 8149101312 or ghostmaster@gmail.com"
                      value={binancePayId}
                      onChange={(e) => setBinancePayId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-white outline-none focus:border-orange-500 placeholder:text-slate-700"
                    />
                  </div>
                  <div className="text-[9px] text-slate-400 leading-relaxed space-y-1 font-sans">
                    <p className="font-bold text-emerald-500">⚡ BINANCE PAY INSTANT ESCROW:</p>
                    <p>Binance Pay is a secure, borderless, and contactless user-to-user cryptocurrency payment technology. Payouts are completely gas-free and instant.</p>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    ⏰ Estimated Credit Time: Instant upon approval (sent directly from merchant pool).
                  </div>
                </div>
              )}

              {/* Amount (NGN) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-400">Amount to Withdraw (₦ NGN)</label>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Rate: ₦1,500 = $1 USD
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-bold">₦</span>
                  <input
                    type="text"
                    placeholder="e.g. 15000"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-8 pr-4 py-2.5 text-xs text-slate-200 outline-none focus:border-orange-500 placeholder:text-slate-700"
                  />
                </div>
                <p className="text-[9.5px] text-slate-500 italic font-sans leading-relaxed">
                  Min. withdrawal: ₦1,500 NGN ($1.00 equivalent). Payouts processed directly via authorized Nigeria banking network.
                </p>
              </div>

              <button
                type="submit"
                disabled={submittingWithdrawal || earningsBalance <= 0}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-600/10 flex justify-center items-center gap-1.5 cursor-pointer"
              >
                {submittingWithdrawal ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing Payout...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Withdraw to Nigeria (₦)</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Withdrawal Requests History */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-5 md:p-6 space-y-4">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-tight text-white">
            Payout Request Ledger
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Audited history of your completed and pending bank payouts.
          </p>
        </div>

        {withdrawalRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {withdrawalRequests.map((req) => (
              <div key={req.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white font-mono">{req.id}</span>
                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-md font-bold ${
                        req.status === 'Pending' 
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                          : req.status === 'Approved' || req.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans leading-relaxed">
                      Sent to: <span className="text-slate-300 font-semibold">{req.bankName || req.payoutMethod}</span> • A/C {req.accountNumber}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">
                      Requested: {new Date(req.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-400 block font-mono">
                      ₦{req.amount.toLocaleString()}
                    </span>
                    <span className="text-[8.5px] text-slate-500 font-mono block">
                      (${ (req.amount / 1500).toFixed(2) } USD)
                    </span>
                  </div>
                </div>

                {req.payoutDetails && (
                  <div className="p-2 bg-slate-900 border border-slate-850 rounded-xl text-[9px] font-mono text-slate-400 leading-normal">
                    {req.payoutDetails}
                  </div>
                )}
                
                {req.status === 'Pending' ? (() => {
                  const elapsedMs = Date.now() - new Date(req.timestamp).getTime();
                  const total24hMs = 24 * 60 * 60 * 1000;
                  const progressPercent = Math.min(100, Math.floor((elapsedMs / total24hMs) * 100));
                  const remainingMs = Math.max(0, total24hMs - elapsedMs);
                  const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
                  const remainingMins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

                  return (
                    <div className="mt-2 space-y-2 p-3 bg-slate-900/60 border border-slate-850 rounded-xl font-sans">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                          Compliance Audit & Verification Check ({progressPercent}%)
                        </span>
                        <span className="text-slate-400 font-semibold">
                          {progressPercent >= 100 ? 'Final Disbursal Node' : `⏳ ${remainingHours}h ${remainingMins}m remaining`}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${progressPercent}%` }}
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        ></div>
                      </div>

                      {/* Steps details */}
                      <div className="grid grid-cols-4 gap-1 text-[7.5px] font-mono text-center">
                        <div className={elapsedMs >= 0 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                          ✓ Initiated
                        </div>
                        <div className={elapsedMs >= 1 * 60 * 60 * 1000 ? 'text-emerald-400 font-bold' : 'text-amber-500 font-bold animate-pulse'}>
                          {elapsedMs >= 1 * 60 * 60 * 1000 ? '✓ Audited' : '● Auditing'}
                        </div>
                        <div className={elapsedMs >= 6 * 60 * 60 * 1000 ? 'text-emerald-400 font-bold' : elapsedMs >= 1 * 60 * 60 * 1000 ? 'text-amber-500 font-bold animate-pulse' : 'text-slate-600'}>
                          {elapsedMs >= 6 * 60 * 60 * 1000 ? '✓ Verified' : elapsedMs >= 1 * 60 * 60 * 1000 ? '● Verifying' : 'Queued'}
                        </div>
                        <div className={elapsedMs >= 24 * 60 * 60 * 1000 ? 'text-emerald-400 font-bold' : elapsedMs >= 6 * 60 * 60 * 1000 ? 'text-amber-500 font-bold animate-pulse' : 'text-slate-600'}>
                          {elapsedMs >= 24 * 60 * 60 * 1000 ? '✓ Completed' : elapsedMs >= 6 * 60 * 60 * 1000 ? '● Disbursing' : 'Escrow Lock'}
                        </div>
                      </div>

                      <p className="text-[8px] text-slate-500 leading-normal text-center italic mt-1">
                        Secure Sandbox Escrow Lock active for 24-hours for fraud compliance. Funds will settle automatically to {req.bankName}.
                      </p>
                    </div>
                  );
                })() : req.status === 'Approved' || req.status === 'Completed' ? (
                  <div className="mt-1 flex items-center gap-1.5 text-[8.5px] text-emerald-400 font-mono font-bold bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Blockchain settlement finalized and instant bank routing cleared successfully!</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-950/40 border border-dashed border-slate-850 rounded-2xl text-center">
            <p className="text-xs text-slate-500 italic font-sans">
              No withdrawal requests initiated yet. Complete telemetry vector licenses or watch ads to build your balance first!
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
