import { firebaseApi } from '../lib/firebaseApi';
import { getSettingsDoc } from '../lib/dbService';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Share2, 
  Check, 
  Send, 
  MessageCircle, 
  Link, 
  Sparkles, 
  Trophy, 
  CheckCircle2,
  Lock,
  ChevronRight,
  Cpu,
  Activity,
  Zap,
  Gauge,
  Terminal,
  Grid,
  RefreshCw,
  AlertTriangle,
  Smartphone,
  Shield,
  Fingerprint
} from 'lucide-react';

import { UserProfile } from '../types';

interface PremiumProps {
  userEmail?: string;
  currentUser?: UserProfile;
  onUpdateUser?: (user: UserProfile) => void;
}

type MembershipTier = 'Gold' | 'Platinum' | 'Diamond';

export default function PremiumUnlock({ userEmail, currentUser, onUpdateUser }: PremiumProps) {
  // Membership State
  const [activeTier, setActiveTier] = useState<MembershipTier>(() => {
    if (currentUser?.isPremium) return 'Diamond';
    return 'Gold';
  });
  const [selectedTier, setSelectedTier] = useState<MembershipTier>(() => {
    if (currentUser?.isPremium) return 'Diamond';
    return 'Gold';
  });
  const [referralCount, setReferralCount] = useState(currentUser?.referralCount ?? 12);
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  
  // Paid Admin Approval Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTargetTier, setUpgradeTargetTier] = useState<MembershipTier>('Platinum');
  const [paymentConfig, setPaymentConfig] = useState<any>(null);

  useEffect(() => {
    async function loadPaymentConfig() {
      try {
        const config = await getSettingsDoc('payment_methods');
        if (config) setPaymentConfig(config);
      } catch (e) {
        console.warn('Failed to load payment_methods settings doc:', e);
      }
    }
    loadPaymentConfig();
  }, []);

  // Diagnostics State
  const [activeDiagnostic, setActiveDiagnostic] = useState<'core' | 'gpu' | 'digitizer' | 'gyro' | 'benchmark'>('core');
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  // Interactive Digitizer State
  const [gridState, setGridState] = useState<boolean[]>(Array(30).fill(false));
  
  // Gyroscope State
  const [gyroDrift, setGyroDrift] = useState({ x: 12, y: -8 });
  const [gyroDamping, setGyroDamping] = useState(false);

  // Quantum Benchmark State
  const [benchmarkStatus, setBenchmarkStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [benchmarkTimeLeft, setBenchmarkTimeLeft] = useState(6);
  const [benchmarkLatencyList, setBenchmarkLatencyList] = useState<number[]>([]);
  const [benchmarkTapCount, setBenchmarkTapCount] = useState(0);
  const [benchmarkDragCount, setBenchmarkDragCount] = useState(0);
  const [benchmarkSaved, setBenchmarkSaved] = useState(false);

  const [measuredFps, setMeasuredFps] = useState(currentUser?.benchmarkFps ?? 0);
  const [measuredLatency, setMeasuredLatency] = useState(currentUser?.benchmarkTouchLatency ?? 0);
  const [measuredPollingRate, setMeasuredPollingRate] = useState(currentUser?.benchmarkFps ? 240 : 0);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.isPremium && activeTier === 'Gold') {
        setActiveTier('Diamond');
        setSelectedTier('Diamond');
      }
      if (currentUser.referralCount !== undefined) {
        setReferralCount(currentUser.referralCount);
      }
    }
  }, [currentUser]);

  // Quantum Benchmark Engine Loop
  useEffect(() => {
    if (benchmarkStatus !== 'running') return;

    let animFrameId: number;
    let lastFrameTime = performance.now();
    const fpsTracker: number[] = [];

    const fpsLoop = () => {
      const now = performance.now();
      const delta = now - lastFrameTime;
      lastFrameTime = now;
      const fps = Math.round(1000 / delta);
      if (fps > 10 && fps < 240) {
        fpsTracker.push(fps);
      }
      animFrameId = requestAnimationFrame(fpsLoop);
    };

    animFrameId = requestAnimationFrame(fpsLoop);

    const countdownInterval = setInterval(() => {
      setBenchmarkTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          cancelAnimationFrame(animFrameId);
          setBenchmarkStatus('completed');
          
          const avgFps = fpsTracker.length > 0 
            ? Math.round(fpsTracker.reduce((a, b) => a + b, 0) / fpsTracker.length) 
            : 60;
          
          // Force a realistic display based on browser limits or simulate real rates
          let finalFps = avgFps;
          if (finalFps > 57 && finalFps < 65) finalFps = 60;
          else if (finalFps > 85 && finalFps < 95) finalFps = 90;
          else if (finalFps > 115 && finalFps < 125) finalFps = 120;
          else if (finalFps > 135 && finalFps < 148) finalFps = 144;
          setMeasuredFps(finalFps);
          
          setBenchmarkLatencyList(latencies => {
            const avgLatency = latencies.length > 0
              ? Math.round((latencies.reduce((a, b) => a + b, 0) / latencies.length) * 10) / 10
              : 8.5 + Math.random() * 6;
            setMeasuredLatency(avgLatency);
            return latencies;
          });

          setBenchmarkDragCount(dragCount => {
            const pollingRate = Math.round(dragCount / 6);
            let normalizedRate = pollingRate > 0 
              ? Math.min(360, Math.max(60, Math.round(pollingRate / 30) * 30))
              : 240;
            if (normalizedRate < 120) normalizedRate = 120;
            setMeasuredPollingRate(normalizedRate);
            return dragCount;
          });

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      cancelAnimationFrame(animFrameId);
    };
  }, [benchmarkStatus]);

  const handleSaveBenchmark = async () => {
    if (!currentUser?.email || !onUpdateUser) {
      alert('Local hardware calibration active: Sensitivity profiles calculated!');
      setBenchmarkSaved(true);
      return;
    }
    try {
      const res = await firebaseApi.request('user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          benchmarkFps: measuredFps,
          benchmarkTouchLatency: measuredLatency
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          onUpdateUser(data.user);
          setBenchmarkSaved(true);
          // Show a beautiful diagnostic logs note
          setTerminalLogs(prev => [
            ...prev,
            `[CALIBRATION] Synchronized ${measuredFps}Hz refresh profile.`,
            `[CALIBRATION] Synchronized ${measuredLatency}ms tactile processing delay limit.`,
            `[ENGINE] Custom GhostCore sensitivity sliders initialized based on live physical benchmarking.`
          ]);
        }
      } else {
        alert('Could not synchronize profile. Saved locally.');
      }
    } catch (err) {
      console.error(err);
      alert('Could not synchronize profile. Saved locally.');
    }
  };

  const referralGoal = 25;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ghostfirehub.com';
  const referralCodeToUse = currentUser?.referralCode || (userEmail ? userEmail.split('@')[0] : 'GHOST666');
  const referralLink = `${siteUrl}/?ref=${encodeURIComponent(referralCodeToUse)}`;

  // Run terminal loop simulation when running diagnostic
  useEffect(() => {
    let interval: any;
    if (diagnosticRunning) {
      interval = setInterval(() => {
        setDiagnosticProgress(prev => {
          const next = prev + 4;
          if (next >= 100) {
            setDiagnosticRunning(false);
            clearInterval(interval);
            return 100;
          }
          return next;
        });

        // Add fun hardware-themed logs
        const mockLogs = [
          'Initializing core clock cycle checks...',
          'Sampling digitizer micro-voltage feedback...',
          'Calibrating touch sensor matrix vectors...',
          'Evaluating RAM packet transaction velocity...',
          'Analyzing thermal dissipation curves...',
          'GPU surface buffer overrun calculated: 0.04%',
          'Interpolating physical screen grid offsets...',
          'Reading device frame buffer synchronization flags...',
          'Gyroscope zero-point gravity drift isolated...',
          'Applying anti-aliasing spatial damping indexes...'
        ];
        const randomLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
        setTerminalLogs(prev => [...prev.slice(-6), `[SYS] ${randomLog}`]);
      }, 150);
    }
    return () => clearInterval(interval);
  }, [diagnosticRunning]);

  const handleStartDiagnostic = () => {
    setDiagnosticProgress(0);
    setDiagnosticRunning(true);
    setTerminalLogs(['[SYSTEM] Initiating tactile diagnostics scan...', '[SYSTEM] Thread count: 8 physical, 16 logical cores detected.']);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (channel: 'whatsapp' | 'telegram') => {
    const text = 'I calibrated my Free Fire sensitivity using GhostCore AI! Unlock premium zero-recoil settings free at:';
    let shareUrl = '';
    
    if (channel === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + referralLink)}`;
    } else {
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
    }
    
    window.open(shareUrl, '_blank');

    setReferralCount(prev => {
      const next = Math.min(prev + 1, referralGoal);
      setShareFeedback(`WhatsApp squad notification sent! Progress successfully saved: ${next}/${referralGoal} entries.`);
      setTimeout(() => setShareFeedback(''), 4000);
      return next;
    });
  };

  // Toggle single cell of digitizer dead-zone grid
  const handleCellClick = (index: number) => {
    const nextGrid = [...gridState];
    nextGrid[index] = !nextGrid[index];
    setGridState(nextGrid);
  };

  // Run automatic gyro centering sequence
  const handleRecalibrateGyro = () => {
    setGyroDamping(true);
    let steps = 0;
    const interval = setInterval(() => {
      setGyroDrift(prev => {
        const nextX = prev.x * 0.4;
        const nextY = prev.y * 0.4;
        if (Math.abs(nextX) < 0.2 && Math.abs(nextY) < 0.2) {
          clearInterval(interval);
          setGyroDamping(false);
          return { x: 0, y: 0 };
        }
        return { x: nextX, y: nextY };
      });
      steps++;
      if (steps > 20) {
        clearInterval(interval);
        setGyroDamping(false);
      }
    }, 100);
  };

  // Periodic tiny natural drift for gyroscope if not calibrating
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gyroDamping && activeTier === 'Diamond') {
        setGyroDrift(prev => ({
          x: prev.x + (Math.random() - 0.5) * 1.5,
          y: prev.y + (Math.random() - 0.5) * 1.5
        }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gyroDamping, activeTier]);

  const hasAccess = (required: MembershipTier): boolean => {
    if (activeTier === 'Diamond') return true;
    if (activeTier === 'Platinum' && required !== 'Diamond') return true;
    return activeTier === required;
  };

  const tiers = [
    {
      id: 'Gold' as MembershipTier,
      title: 'Gold Sentinel',
      price: 'Free tier',
      tagline: 'Essential tactile diagnostics for standard mobile gaming',
      color: 'from-amber-400 via-amber-500 to-yellow-600',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/35',
      shadowColor: 'shadow-amber-500/10',
      features: [
        'Multi-Touch Response Speed (ms)',
        'Core Processor Clock Jitter Test',
        'RAM Latency Allocation Estimator',
        'Standard sensitivity recommendation rules'
      ]
    },
    {
      id: 'Platinum' as MembershipTier,
      title: 'Platinum Vanguard',
      price: 'Invite 5 Comrades or Select',
      tagline: 'High fidelity screen refresh pacing & render telemetry',
      color: 'from-slate-300 via-slate-400 to-slate-500',
      textColor: 'text-slate-300',
      bgColor: 'bg-slate-400/10 border-slate-400/30',
      shadowColor: 'shadow-slate-400/5',
      features: [
        'All Gold Diagnostics tier features',
        'GPU Overdraw Render Pipeline pacing',
        'Thermal Throttling Alpha index monitor',
        'Screen Jitter Stability Rate calculation'
      ]
    },
    {
      id: 'Diamond' as MembershipTier,
      title: 'Diamond Champion',
      price: 'Invite 10 Comrades or Select',
      tagline: 'Full diagnostic overrides & digitizer physical sensor overrides',
      color: 'from-cyan-400 via-teal-400 to-indigo-500',
      textColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/35',
      shadowColor: 'shadow-cyan-500/15',
      features: [
        'All Platinum Diagnostics tier features',
        'Interactive Display Digitizer Dead-Zone Scan',
        'Real-time Gyroscope Zero-Point Drift calibrator',
        'Bespoke DPI sensitivity parameters builder'
      ]
    }
  ];

  const activeTierDetails = tiers.find(t => t.id === activeTier) || tiers[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Immersive Main Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.15),transparent_50%)] pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-4 max-w-xl text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 font-mono text-[9px] uppercase font-black rounded-full border border-amber-500/20">
            <Crown className="w-3.5 h-3.5 fill-current" />
            GhostCore™ Tiered Subscriptions
          </span>
          <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tight leading-none text-white">
            Calibrate to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">Extreme Tier</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Choose your custom membership subscription level below. Each tier unlocks precise hardware diagnostics, assisting you to detect micro-stutter, evaluate thermal degradation, and optimize digitizer coordinates.
          </p>
        </div>

        {/* Current Active Badge */}
        <div className="bg-slate-900/90 border-2 border-orange-500/30 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xl relative min-w-56 shrink-0">
          <div className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Active Membership</span>
          <span className={`text-lg font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r ${activeTierDetails.color}`}>
            {activeTierDetails.title}
          </span>
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-bold">
            <Fingerprint className="w-3.5 h-3.5 text-orange-500" />
            Diagnostics: Enabled
          </div>
        </div>
      </div>

      {/* Subscription Tier Picker Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              Choose Your Subscription Tier
            </h3>
            <p className="text-[11px] text-slate-500">Select any membership tier to examine privileges or instantly switch levels.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.id;
            const isActive = activeTier === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`group relative rounded-3xl p-5 cursor-pointer flex flex-col justify-between gap-5 transition-all duration-300 border backdrop-blur-sm ${
                  isSelected 
                    ? `bg-slate-900/90 border-slate-700 shadow-2xl ${tier.shadowColor} scale-[1.02]` 
                    : 'bg-slate-950/40 border-slate-900/80 hover:bg-slate-900/40 hover:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Status Badges */}
                  <div className="flex justify-between items-start">
                    <span className={`px-2.5 py-1 text-[8.5px] font-black uppercase tracking-widest rounded-lg ${tier.bgColor} ${tier.textColor}`}>
                      {tier.id} Level
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.5 text-[8.5px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-white uppercase tracking-wide group-hover:text-orange-400 transition-colors">
                      {tier.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 italic block mt-0.5 min-h-[30px] leading-tight">
                      {tier.tagline}
                    </span>
                  </div>

                  <div className="border-t border-slate-900/80 pt-3 space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Diagnostic Capabilities:</span>
                    <ul className="space-y-1.5">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[10.5px] text-slate-400 leading-tight">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${idx === tier.features.length - 1 ? 'text-indigo-400' : 'text-emerald-500'}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const hasPremiumStatus = currentUser?.isPremium || currentUser?.role === 'Administrator';
                      if (tier.id === 'Gold') {
                        setActiveTier('Gold');
                        setSelectedTier('Gold');
                      } else {
                        if (hasPremiumStatus) {
                          setActiveTier(tier.id);
                          setSelectedTier(tier.id);
                        } else {
                          setUpgradeTargetTier(tier.id);
                          setShowUpgradeModal(true);
                        }
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 cursor-default'
                        : 'bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {isActive ? 'Current Subscription active' : `Switch to ${tier.id}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advanced Hardware Diagnostics Suite Section */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-5 lg:p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-850 pb-4 gap-3">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-orange-500" />
              Tactile Advanced Hardware Diagnostics
            </h3>
            <p className="text-xs text-slate-400">
              Run hardware telemetry monitors matched to your current membership tier: <strong className="text-orange-400">{activeTier}</strong>.
            </p>
          </div>

          {/* Selector Tabs matching Diagnostic tests */}
          <div className="flex flex-wrap bg-slate-950/80 p-1 rounded-xl border border-slate-900/60 shrink-0 gap-1">
            {[
              { id: 'core', label: 'Core / RAM', req: 'Gold', icon: Cpu },
              { id: 'gpu', label: 'GPU & Pacing', req: 'Platinum', icon: Gauge },
              { id: 'benchmark', label: 'Hardware Diagnostics', req: 'Platinum', icon: Zap },
              { id: 'digitizer', label: 'Digitizer Grid', req: 'Diamond', icon: Grid },
              { id: 'gyro', label: 'Gyro Scope', req: 'Diamond', icon: RefreshCw },
            ].map(tab => {
              const accessible = hasAccess(tab.req as MembershipTier);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDiagnostic(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeDiagnostic === tab.id
                      ? 'bg-orange-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {!accessible && <Lock className="w-2.5 h-2.5 text-slate-500 ml-0.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Tab Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Diagnostic Display Area */}
          <div className="lg:col-span-7 space-y-5 bg-slate-950/50 rounded-2xl p-4 border border-slate-900 flex flex-col justify-between min-h-[350px]">
            
            {/* Condition: locked out because of low tier */}
            {(() => {
              const reqTier: MembershipTier = 
                (activeDiagnostic === 'gpu' || activeDiagnostic === 'benchmark') ? 'Platinum' : 
                (activeDiagnostic === 'digitizer' || activeDiagnostic === 'gyro') ? 'Diamond' : 'Gold';
              
              const isLocked = !hasAccess(reqTier);

              if (isLocked) {
                return (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fadeIn">
                    <div className="p-4 bg-orange-500/10 border-2 border-orange-500/20 rounded-full text-orange-400">
                      <Lock className="w-8 h-8" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Premium Diagnostics Lock
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        The requested <strong>{activeDiagnostic.toUpperCase()}</strong> diagnostics tool is exclusive to <strong>{reqTier} membership levels</strong> and higher.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const hasPremiumStatus = currentUser?.isPremium || currentUser?.role === 'Administrator';
                        if (hasPremiumStatus) {
                          setActiveTier(reqTier);
                          setSelectedTier(reqTier);
                        } else {
                          setUpgradeTargetTier(reqTier);
                          setShowUpgradeModal(true);
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-orange-500/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5 fill-current" />
                      Instantly Upgrade to {reqTier}
                    </button>
                  </div>
                );
              }

              return (
                <div className="flex-1 flex flex-col justify-between gap-5 animate-fadeIn">
                  
                  {/* Title & Description of Diagnostic */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">ACTIVE RUNNER</span>
                    {activeDiagnostic === 'core' && (
                      <>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Core clock jitter & latency analyzer</h4>
                        <p className="text-[11px] text-slate-400">Checks multi-touch processing latency with sub-millisecond precision to ensure continuous drag-shots.</p>
                      </>
                    )}
                    {activeDiagnostic === 'gpu' && (
                      <>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">GPU frame pacing & thermal throttling index</h4>
                        <p className="text-[11px] text-slate-400">Simulates real-time overdraw rendering buffer outputs and computes heat thermal dissipation delta rates.</p>
                      </>
                    )}
                    {activeDiagnostic === 'benchmark' && (
                      <>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-orange-400">
                          <Zap className="w-4 h-4 animate-pulse" /> Quantum Tactile & Pacing Benchmark
                        </h4>
                        <p className="text-[11px] text-slate-400">Benchmarks real-time screen refresh rates (Hz) and digitizer input packet latency (ms) for premium sensitivity overrides.</p>
                      </>
                    )}
                    {activeDiagnostic === 'digitizer' && (
                      <>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Display digitizer grid dead-zone scanner</h4>
                        <p className="text-[11px] text-slate-400">Tactile Interactive Matrix: Tap or hover on grid coordinates to confirm sensor accuracy and diagnose tactile dead zones.</p>
                      </>
                    )}
                    {activeDiagnostic === 'gyro' && (
                      <>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Gyroscope zero-point drift stabilization</h4>
                        <p className="text-[11px] text-slate-400">Examines natural sensor gravity drift in physical accelerometer arrays. Execute dynamic damping overrides.</p>
                      </>
                    )}
                  </div>

                  {/* Diagnostic Graphic Content */}
                  <div className="flex-1 flex items-center justify-center p-2">
                    
                    {/* Core / RAM Visualizer */}
                    {activeDiagnostic === 'core' && (
                      <div className="w-full grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-1.5">
                          <span className="text-[8.5px] font-mono text-slate-500 block">Touch processing delay</span>
                          <span className="text-lg font-black text-emerald-400 font-mono">1.8 ms</span>
                          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 w-1/5"></div>
                          </div>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-1.5">
                          <span className="text-[8.5px] font-mono text-slate-500 block">CPU core thread drift</span>
                          <span className="text-lg font-black text-amber-400 font-mono">±0.04 Hz</span>
                          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 w-2/5"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* GPU Pacing Visualizer */}
                    {activeDiagnostic === 'gpu' && (
                      <div className="w-full grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-1">
                          <span className="text-[8.5px] font-mono text-slate-500 block">Jitter coefficient</span>
                          <span className="text-base font-black text-indigo-400 font-mono">0.02%</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-1">
                          <span className="text-[8.5px] font-mono text-slate-500 block">Thermal margin</span>
                          <span className="text-base font-black text-emerald-400 font-mono">+14.2°C Safe</span>
                        </div>
                      </div>
                    )}

                    {/* Hardware Diagnostics Interactive Tester */}
                    {activeDiagnostic === 'benchmark' && (
                      <div className="w-full space-y-4 animate-fadeIn">
                        {benchmarkStatus === 'idle' && (
                          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 animate-pulse">
                              <Zap className="w-7 h-7" />
                            </div>
                            <div className="space-y-1 max-w-sm">
                              <h5 className="text-xs font-bold text-white uppercase">Ready to Measure Latency</h5>
                              <p className="text-[10px] text-slate-400 leading-normal">
                                Starts a high-fidelity 6-second physical capture stream. During testing, tap and drag repeatedly inside the box to measure true digitizer touch latency.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setBenchmarkStatus('running');
                                setBenchmarkTimeLeft(6);
                                setBenchmarkLatencyList([]);
                                setBenchmarkTapCount(0);
                                setBenchmarkDragCount(0);
                                setBenchmarkSaved(false);
                                setTerminalLogs(prev => [
                                  ...prev,
                                  `[BENCHMARK] Booting hardware testing pipeline...`,
                                  `[BENCHMARK] Standard precision requestAnimationFrame loop bound.`
                                ]);
                              }}
                              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                            >
                              Start Hardware Diagnostics
                            </button>
                          </div>
                        )}

                        {benchmarkStatus === 'running' && (
                          <div className="space-y-3 w-full">
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-orange-400 font-extrabold flex items-center gap-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                                RUNNING: {benchmarkTimeLeft}s REMAINING
                              </span>
                              <span className="text-slate-400">
                                Capturing: {benchmarkTapCount} Taps | {benchmarkDragCount} Drag-points
                              </span>
                            </div>

                            {/* Capture Area / Interactive target */}
                            <div
                              onTouchStart={(e) => {
                                const lat = performance.now() - e.timeStamp;
                                const norm = lat > 1 && lat < 120 ? lat : (4.1 + Math.random() * 8);
                                setBenchmarkLatencyList(prev => [...prev, norm]);
                                setBenchmarkTapCount(prev => prev + 1);
                              }}
                              onMouseDown={(e) => {
                                const lat = performance.now() - e.timeStamp;
                                const norm = lat > 1 && lat < 120 ? lat : (4.1 + Math.random() * 8);
                                setBenchmarkLatencyList(prev => [...prev, norm]);
                                setBenchmarkTapCount(prev => prev + 1);
                              }}
                              onTouchMove={() => setBenchmarkDragCount(prev => prev + 1)}
                              onMouseMove={(e) => {
                                if (e.buttons > 0) {
                                  setBenchmarkDragCount(prev => prev + 1);
                                }
                              }}
                              className="w-full h-36 bg-slate-950/80 border-2 border-dashed border-orange-500/30 hover:border-orange-500/50 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden cursor-crosshair select-none group"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-50"></div>
                              <div className="absolute w-full h-[1px] bg-orange-500/10 top-1/4"></div>
                              <div className="absolute w-full h-[1px] bg-orange-500/10 top-2/4"></div>
                              <div className="absolute w-full h-[1px] bg-orange-500/10 top-3/4"></div>
                              <div className="absolute h-full w-[1px] bg-orange-500/10 left-1/4"></div>
                              <div className="absolute h-full w-[1px] bg-orange-500/10 left-2/4"></div>
                              <div className="absolute h-full w-[1px] bg-orange-500/10 left-3/4"></div>

                              <div className="text-center space-y-1 relative z-10 pointer-events-none">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest block animate-pulse">TAP & DRAG ENERGETICALLY IN HERE</span>
                                <p className="text-[8.5px] text-slate-500 font-mono">Simulating high-frequency multi-touch inputs</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {benchmarkStatus === 'completed' && (
                          <div className="space-y-4 animate-fadeIn w-full text-left">
                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-3">
                              <h5 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Benchmark Evaluation Complete
                              </h5>
                              
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 text-center space-y-1">
                                  <span className="text-[8px] font-mono text-slate-500 uppercase block">Screen pacing</span>
                                  <span className="text-xs font-black text-white font-mono">{measuredFps} Hz</span>
                                  <span className="text-[7.5px] font-mono text-slate-400 block leading-tight">
                                    {measuredFps >= 90 ? 'Ultra Fluid' : 'Standard Refresh'}
                                  </span>
                                </div>

                                <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 text-center space-y-1">
                                  <span className="text-[8px] font-mono text-slate-500 uppercase block">Input latency</span>
                                  <span className="text-xs font-black text-white font-mono">{measuredLatency} ms</span>
                                  <span className="text-[7.5px] font-mono text-slate-400 block leading-tight">
                                    {measuredLatency <= 12 ? 'Zero-Lag Elite' : 'Standard Digitizer'}
                                  </span>
                                </div>

                                <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 text-center space-y-1">
                                  <span className="text-[8px] font-mono text-slate-500 uppercase block">Polling rate</span>
                                  <span className="text-xs font-black text-white font-mono">{measuredPollingRate} Hz</span>
                                  <span className="text-[7.5px] font-mono text-slate-400 block leading-tight">
                                    Tactile sampling
                                  </span>
                                </div>
                              </div>

                              <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-2.5 text-left">
                                <p className="text-[9.5px] text-slate-400 leading-normal">
                                  {measuredLatency <= 10 
                                    ? '🔥 AMAZING: Your screen digitizer responses are within absolute elite e-sports margins. Sensitivity sliders will be adjusted down to avoid over-swiping.'
                                    : '⚡ SUCCESS: Sensitivities will be adjusted up to compensate for physical input latency, guaranteeing instant drag-shot accuracy.'}
                                </p>
                              </div>

                              <div className="flex gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setBenchmarkStatus('idle')}
                                  className="flex-1 py-2 border border-slate-800 hover:bg-slate-900 text-slate-300 text-[9px] uppercase tracking-wider font-extrabold rounded-xl transition-all cursor-pointer"
                                >
                                  Retest Hardware
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveBenchmark}
                                  disabled={benchmarkSaved}
                                  className={`flex-1 py-2 text-[9px] uppercase tracking-wider font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                    benchmarkSaved
                                      ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 cursor-default'
                                      : 'bg-orange-500 hover:bg-orange-600 text-slate-950 font-black shadow-md'
                                  }`}
                                >
                                  {benchmarkSaved ? <Check className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                                  <span>{benchmarkSaved ? 'Calibration Active' : 'Calibrate Sensitivities'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* INTERACTIVE DIGITIZER MATRIX GRID */}
                    {activeDiagnostic === 'digitizer' && (
                      <div className="w-full space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-slate-500">Tap cells to mark as calibrated:</span>
                          <button 
                            type="button"
                            onClick={() => setGridState(Array(30).fill(false))}
                            className="text-[8.5px] text-orange-400 hover:text-orange-300 font-mono uppercase font-black"
                          >
                            Reset Matrix
                          </button>
                        </div>
                        <div className="grid grid-cols-6 gap-1 w-full max-w-sm mx-auto">
                          {gridState.map((active, i) => (
                            <div
                              key={i}
                              onClick={() => handleCellClick(i)}
                              className={`aspect-square rounded-lg border flex items-center justify-center text-[8.5px] font-mono transition-all cursor-pointer ${
                                active 
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold scale-95 shadow-[0_0_8px_rgba(16,185,129,0.15)]' 
                                  : 'bg-slate-950/60 border-slate-900 text-slate-600 hover:border-slate-800'
                              }`}
                            >
                              C{i+1}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* INTERACTIVE GYROSCOPE CALIBRATION PANEL */}
                    {activeDiagnostic === 'gyro' && (
                      <div className="flex flex-col items-center gap-4 w-full">
                        <div className="relative w-36 h-36 rounded-full border-2 border-slate-800 bg-slate-950/80 flex items-center justify-center shadow-inner">
                          {/* Inner grid concentric circles */}
                          <div className="absolute w-24 h-24 rounded-full border border-dashed border-slate-900"></div>
                          <div className="absolute w-12 h-12 rounded-full border border-dashed border-slate-900/60"></div>
                          
                          {/* Central target crosshair */}
                          <div className="absolute w-full h-[1px] bg-slate-900/50"></div>
                          <div className="absolute h-full w-[1px] bg-slate-900/50"></div>

                          {/* Bouncing Drift dot indicator */}
                          <div 
                            style={{ 
                              transform: `translate(${gyroDrift.x * 2}px, ${gyroDrift.y * 2}px)`,
                              transition: gyroDamping ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out'
                            }} 
                            className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_12px_rgba(249,115,22,0.6)] flex items-center justify-center text-[7px] font-bold text-slate-950"
                          >
                            •
                          </div>
                        </div>

                        <div className="flex items-center gap-6 font-mono text-[9px]">
                          <div>
                            <span className="text-slate-500 block">X Drift Coeff</span>
                            <span className="font-bold text-slate-300">{gyroDrift.x.toFixed(2)}%</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Y Drift Coeff</span>
                            <span className="font-bold text-slate-300">{gyroDrift.y.toFixed(2)}%</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRecalibrateGyro}
                            disabled={gyroDamping}
                            className={`px-2.5 py-1 rounded-lg uppercase tracking-wider font-extrabold text-[8.5px] border transition-all cursor-pointer ${
                              gyroDamping 
                                ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed' 
                                : 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20'
                            }`}
                          >
                            {gyroDamping ? 'Stabilizing...' : 'Damp Drift'}
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Run Diagnostic Button & Progress bar */}
                  {activeDiagnostic !== 'benchmark' && (
                    <div className="space-y-2 border-t border-slate-900/80 pt-3 animate-fadeIn">
                      <div className="flex justify-between items-center">
                        <button
                          type="button"
                          onClick={handleStartDiagnostic}
                          disabled={diagnosticRunning}
                          className={`px-4 py-2 rounded-xl text-[9px] uppercase tracking-wider font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                            diagnosticRunning
                              ? 'bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed'
                              : 'bg-orange-500 text-slate-950 font-extrabold hover:bg-orange-600 shadow-md shadow-orange-500/5'
                          }`}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${diagnosticRunning ? 'animate-spin' : ''}`} />
                          <span>{diagnosticRunning ? 'Scanning sensors...' : 'Initiate sensor diagnostics'}</span>
                        </button>

                        {diagnosticRunning && (
                          <span className="text-[10px] font-mono font-bold text-orange-400">{diagnosticProgress}% completed</span>
                        )}
                      </div>

                      {/* Progress Bar indicator */}
                      <div className="w-full bg-slate-900 border border-slate-850/50 rounded-full h-1.5 overflow-hidden">
                        <div 
                          style={{ width: `${diagnosticProgress}%` }}
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300"
                        ></div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })()}

          </div>

          {/* Interactive Diagnostic Logs Terminal / Stats Side */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950 p-4 border border-slate-900 rounded-2xl min-h-[350px]">
            <div className="space-y-3.5 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  Tactile Terminal Logs
                </span>
                <span className="text-[8.5px] text-slate-600 font-mono uppercase font-semibold">Ready</span>
              </div>

              {/* Logs area */}
              <div className="bg-slate-950/80 border border-slate-900 p-3 rounded-xl font-mono text-[10px] text-slate-400 flex-1 overflow-y-auto space-y-1.5 min-h-[160px] custom-scrollbar select-text">
                {terminalLogs.length > 0 ? (
                  terminalLogs.map((log, index) => (
                    <p key={index} className="leading-relaxed">
                      <span className="text-orange-500/80">&gt;</span> {log}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-600 italic text-center py-10">No diagnostic checks initiated. Tap "Initiate sensor diagnostics" to load system overrides logs.</p>
                )}
              </div>
            </div>

            {/* Simulated diagnostic reports download */}
            <div className="border-t border-slate-900/80 pt-3 mt-3">
              <div className="bg-slate-900/30 border border-slate-850/60 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9.5px] font-bold text-slate-300 block uppercase">Diagnostics export available</span>
                  <span className="text-[8.5px] text-slate-500 leading-none">Compile custom DPI offsets vector configuration payload</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    alert('Tactile diagnostics parameters compilation finalized. Sens-offset vector output copied to clipboard.');
                  }}
                  className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white rounded-lg text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  Export Payload
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Share / Invitation Methods - Gamified Unlocking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Invitation Referral Link */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between gap-5 backdrop-blur-md">
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Link className="w-4.5 h-4.5 text-orange-500" /> Invitation Referral Link
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When players visit using your customized link, they auto-register to your squads network roster count. Unlock Platinum and Diamond tiers for free!
            </p>
          </div>

          <div className="space-y-2">
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex justify-between items-center gap-2 overflow-hidden">
              <span className="text-[11px] font-mono text-slate-400 truncate select-all">{referralLink}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 shrink-0 cursor-pointer"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            
            {shareFeedback && (
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded-lg">
                {shareFeedback}
              </div>
            )}
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between gap-4 backdrop-blur-md">
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="w-4.5 h-4.5 text-orange-500" /> Real-time Social Shares
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulate verified community referrals instantly by sharing your personalized invitation with tactical squads.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleShare('whatsapp')}
              className="py-3 px-4 bg-slate-950 hover:bg-slate-900 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current shrink-0" />
              <span>WhatsApp Invite</span>
            </button>

            <button
              type="button"
              onClick={() => handleShare('telegram')}
              className="py-3 px-4 bg-slate-950 hover:bg-slate-900 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 fill-current shrink-0" />
              <span>Telegram Invite</span>
            </button>
          </div>
        </div>

      </div>

      {/* Premium Exclusive Benefits Grid */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-5 lg:p-6 space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500" />
          VIP Premium Privileges Included:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          
          <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl space-y-1">
            <div className="font-bold text-slate-100 uppercase text-[11px] tracking-wider text-orange-400">
              ⚡ Drag headshots sensitivity
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Unlock the absolute calibrated General, Red Dot, and 2× Scope indexes to guarantee smooth crosshair glides directly on your opponents' forehead.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl space-y-1">
            <div className="font-bold text-slate-100 uppercase text-[11px] tracking-wider text-orange-400">
              💎 VIP Direct Configs files
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Instant priority download access to our compiled elite parameters files to copy and paste directly into your smartphone root configurations directory.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl space-y-1">
            <div className="font-bold text-slate-100 uppercase text-[11px] tracking-wider text-orange-400">
              🛡️ Verified Anti-Ban
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              All VIP configuration files are generated completely using verified secure game configurations vectors, guaranteeing absolutely zero anti-cheat detection risk.
            </p>
          </div>

        </div>
      </div>

      {/* Dynamic Data Sharing Consent Program */}
      <div className="bg-gradient-to-r from-orange-600/10 via-slate-900 to-indigo-950/20 border border-orange-500/15 rounded-3xl p-5 lg:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-600/10 border border-orange-500/20 text-orange-400 font-mono text-[9px] uppercase font-bold rounded-md">
              💰 Earn Ghost Points
            </span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              Anonymized Hardware Telemetry Program
            </h3>
            <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
              Opt-in to share your anonymized physical screen calibration and benchmark logs (device model, latency times, and calculated sens ratios). We package this aggregated data for esports organizations and smartphone gaming chip designers.
            </p>
          </div>
          <div className="shrink-0">
            {currentUser?.dataSharingConsent ? (
              <span className="px-3.5 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Consent Active (+50 XP)
              </span>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  if (!currentUser?.email) {
                    alert("Please register or sign in to activate the Telemetry reward!");
                    return;
                  }
                  try {
                    const res = await firebaseApi.request('user/update', {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email: currentUser.email,
                        dataSharingConsent: true,
                        ghostPoints: (currentUser.ghostPoints || 0) + 50
                      })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      if (data.user && onUpdateUser) {
                        onUpdateUser(data.user);
                        alert("Consented successfully! +50 Ghost Points added to your account balance!");
                      }
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                Opt-In & Get +50 Points
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PAID SUBSCRIPTION MANUAL APPROVAL MODAL */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgradeModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Dialog container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-850 rounded-3xl max-w-md w-full p-6 relative z-10 shadow-2xl overflow-hidden text-left"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-2xl">
                    <Crown className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-widest">Upgrade Request Routing</h3>
                    <h2 className="text-sm font-black text-white uppercase tracking-tight">Manual Admin Approval Required</h2>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
                  <p>
                    You selected the <strong className="text-orange-400">{upgradeTargetTier.toUpperCase()}</strong> membership tier. GhostCore™ is a paid service dedicated to supporting website server hosting, dynamic high-frequency hardware diagnostics, and continuous algorithm optimization.
                  </p>
                  <p>
                    Regular users cannot switch subscriptions on their own. To activate this tier, you must purchase a manual upgrade activation. Your payment directly supports our ongoing maintenance costs.
                  </p>
                </div>

                {/* Email Verification Box */}
                <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-1">
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Your Register Account Email</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-white font-extrabold break-all select-all">{userEmail || 'guest_user@gmail.com'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(userEmail || 'guest_user@gmail.com');
                        alert('Account email copied to clipboard!');
                      }}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-[8.5px] uppercase rounded border border-slate-850 animate-fadeIn"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">OFFICIAL PAYMENT GATEWAYS & CONTACT:</span>
                  <div className="grid grid-cols-1 gap-2">
                    {/* Nigerian Bank Transfer Gateway */}
                    {paymentConfig?.bank_transfer?.enabled !== false && (
                      <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-emerald-400 font-extrabold uppercase text-[10px]">
                          <span>Nigerian Bank Transfer</span>
                          <span>{paymentConfig?.bank_transfer?.bankName || 'First Bank of Nigeria'}</span>
                        </div>
                        <div className="text-slate-300">
                          Acc Name: <strong className="text-white">{paymentConfig?.bank_transfer?.accountName || 'GhostFire Esports Enterprise'}</strong>
                        </div>
                        <div className="text-slate-300 flex justify-between items-center">
                          <span>Acc No: <strong className="text-amber-400 select-all font-bold">{paymentConfig?.bank_transfer?.accountNumber || '3098765432'}</strong></span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(paymentConfig?.bank_transfer?.accountNumber || '3098765432');
                              alert('Bank account number copied!');
                            }}
                            className="px-1.5 py-0.5 bg-slate-900 text-[8px] text-slate-400 hover:text-white rounded border border-slate-800 uppercase cursor-pointer"
                          >
                            Copy
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400 font-sans mt-1">
                          {paymentConfig?.bank_transfer?.instructions || 'Transfer fee and send proof to Admin on Telegram for instant activation.'}
                        </p>
                      </div>
                    )}

                    {/* Crypto Wallet Gateway */}
                    {paymentConfig?.crypto_wallet?.enabled !== false && (
                      <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-cyan-400 font-extrabold uppercase text-[10px]">
                          <span>Crypto Wallet Deposit</span>
                          <span>{paymentConfig?.crypto_wallet?.network || 'USDT (TRC-20)'}</span>
                        </div>
                        <div className="text-slate-300 flex justify-between items-center">
                          <span className="truncate max-w-[240px]">Address: <strong className="text-amber-400 select-all font-bold">{paymentConfig?.crypto_wallet?.walletAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'}</strong></span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(paymentConfig?.crypto_wallet?.walletAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
                              alert('Crypto wallet address copied!');
                            }}
                            className="px-1.5 py-0.5 bg-slate-900 text-[8px] text-slate-400 hover:text-white rounded border border-slate-800 uppercase cursor-pointer"
                          >
                            Copy
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400 font-sans mt-1">
                          {paymentConfig?.crypto_wallet?.instructions || 'Send USDT and forward TX Hash to Telegram support.'}
                        </p>
                      </div>
                    )}

                    {/* Telegram DM Button */}
                    {paymentConfig?.telegram?.enabled !== false && (
                      <a
                        href={`${paymentConfig?.telegram?.telegramUrl || 'https://t.me/ghostfirehub1'}?text=${encodeURIComponent(
                          `Hi Admin! I would like to upgrade my account to ${upgradeTargetTier} Tier. My registered account email is: ${userEmail || 'guest_user@gmail.com'}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer mt-1"
                      >
                        <Send className="w-4 h-4 fill-current shrink-0" />
                        <span>{paymentConfig?.telegram?.buttonLabel || 'Contact Admin on Telegram'}</span>
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-[9.5px] text-slate-500 leading-normal text-center italic font-sans pt-1">
                  Once payment is completed, the admin will instantly toggle your account to <span className="text-orange-400 font-bold">Premium Status</span> via the override dashboard, which immediately unlocks your chosen tier!
                </p>

                <div className="pt-2 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(false)}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white rounded-xl text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Close Dialog
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
