import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Sparkles, Layout, Smartphone, ShieldCheck, Crown, ShieldAlert, ChevronRight, UserCheck } from 'lucide-react';

interface SplashAndOnboardingProps {
  onComplete: () => void;
}

export default function SplashAndOnboarding({ onComplete }: SplashAndOnboardingProps) {
  const [stage, setStage] = useState<'splash' | 'welcome' | 'features' | 'permissions' | 'ready'>('splash');
  const [bootProgress, setBootProgress] = useState(0);
  const [bootText, setBootText] = useState('INITIALIZING GHOSTCORE ENGINE...');

  // Splash Screen Loading Simulation
  useEffect(() => {
    if (stage !== 'splash') return;

    const phrases = [
      'LOADING GRAPHICS ACCELERATOR...',
      'ESTABLISHING TELEGRAM API TUNNELS...',
      'CALIBRATING SENSORY MATRIX COMPLIANCE...',
      'SYNCING GHOSTFIRE CORE AI LOGS...',
      'READY TO INJECT TACTICAL DEFILES...'
    ];

    let currentPhraseIndex = 0;
    const interval = setInterval(() => {
      setBootProgress(prev => {
        const next = prev + Math.floor(Math.random() * 15) + 5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Check if user is already onboarded
            const onboarded = localStorage.getItem('ghostfire_onboarded');
            if (onboarded === 'true') {
              onComplete();
            } else {
              setStage('welcome');
            }
          }, 600);
          return 100;
        }
        
        // Update boot texts on certain intervals
        if (next > (currentPhraseIndex + 1) * 20 && currentPhraseIndex < phrases.length) {
          setBootText(phrases[currentPhraseIndex]);
          currentPhraseIndex++;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [stage, onComplete]);

  const handleNextStep = () => {
    if (stage === 'welcome') setStage('features');
    else if (stage === 'features') setStage('permissions');
    else if (stage === 'permissions') setStage('ready');
    else if (stage === 'ready') {
      localStorage.setItem('ghostfire_onboarded', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('ghostfire_onboarded', 'true');
    onComplete();
  };

  return (
    <div id="splash-onboarding-container" className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col items-center justify-center p-4 overflow-y-auto selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background Cyberpunk grid overlay & glow effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#090d16_1px,transparent_1px),linear-gradient(to_bottom,#090d16_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <AnimatePresence mode="wait">
        
        {/* STAGE 1: INTRO SPLASH SCREEN */}
        {stage === 'splash' && (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm flex flex-col items-center text-center space-y-8 relative z-10"
          >
            {/* Pulsing Gamepad HUD Logo */}
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: ['0 0 15px rgba(6,182,212,0.15)', '0 0 35px rgba(168,85,247,0.35)', '0 0 15px rgba(6,182,212,0.15)']
              }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="p-5 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl border border-cyan-400/30 relative"
            >
              <Gamepad2 className="w-12 h-12 text-slate-950 stroke-[2px]" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl blur-sm opacity-50 -z-10 animate-pulse"></div>
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-widest text-white uppercase font-sans">
                GHOSTFIRE<span className="text-cyan-400 font-mono">HUB</span> <span className="text-xs bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-black border border-cyan-500/30 align-middle">v2.0</span>
              </h1>
              <p className="text-[10px] text-purple-400 font-mono font-black uppercase tracking-[0.35em]">
                Cyber Esport Calibration System
              </p>
            </div>

            {/* Simulated progress tracker */}
            <div className="w-full space-y-2">
              <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                <span className="text-cyan-400/90 truncate max-w-[240px]">{bootText}</span>
                <span className="text-purple-400 font-mono font-black">{bootProgress}%</span>
              </div>
              <div className="w-full h-1 bg-slate-900 border border-slate-850 rounded-full overflow-hidden p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${bootProgress}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 rounded-full"
                />
              </div>
              <p className="text-[7.5px] text-slate-600 font-mono uppercase tracking-wider">
                Authorized Connection Secure • Cloud Ingress Protected
              </p>
            </div>
          </motion.div>
        )}

        {/* STAGE 2: ONBOARDING - WELCOME */}
        {stage === 'welcome' && (
          <motion.div
            key="onboard-welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md bg-slate-900/60 border border-slate-850 p-6 sm:p-8 rounded-3xl backdrop-blur-xl space-y-6 text-center relative z-10 shadow-2xl shadow-cyan-500/5"
          >
            <div className="flex justify-end">
              <button 
                onClick={handleSkip} 
                className="text-[10px] text-slate-500 hover:text-cyan-400 font-mono uppercase tracking-widest cursor-pointer"
              >
                Skip Intro
              </button>
            </div>

            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto text-cyan-400">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-widest">Welcome to Next Gen Calibrations</span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Tactical Performance Unleashed</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                GhostFireHub 2.0 is the definitive pro-player repository. Gain optimized hardware calibration recommendations, custom HUD blueprints, and access the verified premium esports marketplace.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleNextStep}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
              >
                <span>Initiate Sequence</span>
                <ChevronRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>

            <div className="flex justify-center gap-1">
              <div className="w-6 h-1.5 rounded-full bg-cyan-500"></div>
              <div className="w-2 h-1.5 rounded-full bg-slate-800"></div>
              <div className="w-2 h-1.5 rounded-full bg-slate-800"></div>
              <div className="w-2 h-1.5 rounded-full bg-slate-800"></div>
            </div>
          </motion.div>
        )}

        {/* STAGE 3: ONBOARDING - FEATURES */}
        {stage === 'features' && (
          <motion.div
            key="onboard-features"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-md bg-slate-900/60 border border-slate-850 p-6 sm:p-8 rounded-3xl backdrop-blur-xl space-y-6 relative z-10 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-850">
              <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-widest">02 // Core Capabilities</span>
              <button 
                onClick={handleSkip} 
                className="text-[10px] text-slate-500 hover:text-cyan-400 font-mono uppercase tracking-widest cursor-pointer"
              >
                Skip
              </button>
            </div>

            <div className="space-y-4">
              {/* Feature 1 */}
              <div className="flex gap-4 p-3 bg-slate-950/40 rounded-2xl border border-slate-900">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wide">GhostCore™ AI Calibration</h3>
                  <p className="text-[10.5px] text-slate-400 leading-normal mt-0.5">
                    Generate optimized sensitivities, DPI multipliers, and pointer speeds suited for Android and iOS systems.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4 p-3 bg-slate-950/40 rounded-2xl border border-slate-900">
                <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center">
                  <Layout className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wide">Interactive HUD Blueprints</h3>
                  <p className="text-[10.5px] text-slate-400 leading-normal mt-0.5">
                    Drag, drop, and configure multi-finger layout profiles. Share directly into competitive game pipelines.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4 p-3 bg-slate-950/40 rounded-2xl border border-slate-900">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wide">Verified Premium Marketplace</h3>
                  <p className="text-[10.5px] text-slate-400 leading-normal mt-0.5">
                    Acquire elite configurations with confidence. Audited by AI and manual Super Admins with full proof compliance.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleNextStep}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>

            <div className="flex justify-center gap-1">
              <div className="w-2 h-1.5 rounded-full bg-slate-800"></div>
              <div className="w-6 h-1.5 rounded-full bg-cyan-500"></div>
              <div className="w-2 h-1.5 rounded-full bg-slate-800"></div>
              <div className="w-2 h-1.5 rounded-full bg-slate-800"></div>
            </div>
          </motion.div>
        )}

        {/* STAGE 4: ONBOARDING - PERMISSIONS & POLICIES */}
        {stage === 'permissions' && (
          <motion.div
            key="onboard-permissions"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-md bg-slate-900/60 border border-slate-850 p-6 sm:p-8 rounded-3xl backdrop-blur-xl space-y-6 relative z-10 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-850">
              <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-widest">03 // Compliance & Safety</span>
              <button 
                onClick={handleSkip} 
                className="text-[10px] text-slate-500 hover:text-cyan-400 font-mono uppercase tracking-widest cursor-pointer"
              >
                Skip
              </button>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-3 text-center">
              <h2 className="text-md font-extrabold text-white uppercase tracking-wide">Strict Zero-Cheating Policy</h2>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans text-left">
                GhostFireHub provides <span className="text-cyan-400 font-semibold">tactile sensory calibrations</span>, layouts, and recommendations. We do not support, distribute, or configure scripts, injectors, bypass tools, or cheating software.
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans text-left bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                <span className="text-purple-400 font-bold uppercase tracking-wider block text-[9px] font-mono">Frame Permissions Request:</span>
                This application operates cleanly inside your browser, using standard container interfaces. No administrative access is required to apply recommended device tactile enhancements.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleNextStep}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Accept Terms & Complete</span>
                <ChevronRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>

            <div className="flex justify-center gap-1">
              <div className="w-2 h-1.5 rounded-full bg-slate-800"></div>
              <div className="w-2 h-1.5 rounded-full bg-slate-800"></div>
              <div className="w-6 h-1.5 rounded-full bg-cyan-500"></div>
              <div className="w-2 h-1.5 rounded-full bg-slate-800"></div>
            </div>
          </motion.div>
        )}

        {/* STAGE 5: ONBOARDING - READY TO BEGIN */}
        {stage === 'ready' && (
          <motion.div
            key="onboard-ready"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md bg-slate-900/60 border border-slate-850 p-6 sm:p-8 rounded-3xl backdrop-blur-xl space-y-6 text-center relative z-10 shadow-2xl"
          >
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto">
              <UserCheck className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest">Identity Verified</span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">System Fully Loaded</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Your sandbox tactical layout and device metrics have successfully bound. You are ready to explore GhostFireHub 2.0. Good luck out there, soldier!
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleNextStep}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                <span>Enter GhostFireHub</span>
                <ChevronRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>

            <div className="flex justify-center gap-1">
              <div className="w-2 h-1.5 rounded-full bg-slate-800"></div>
              <div className="w-2 h-1.5 rounded-full bg-slate-800"></div>
              <div className="w-2 h-1.5 rounded-full bg-slate-800"></div>
              <div className="w-6 h-1.5 rounded-full bg-emerald-500"></div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
