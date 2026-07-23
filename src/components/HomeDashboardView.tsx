import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Calendar, 
  Trophy, 
  Sparkles, 
  Crown, 
  Gift, 
  Newspaper, 
  Gamepad2, 
  UserCheck, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight, 
  Award,
  Users,
  ShieldAlert
} from 'lucide-react';
import { UserProfile, CommunityPost } from '../types';
import DailyStreakTracker from './DailyStreakTracker';

interface HomeDashboardViewProps {
  user: UserProfile | null;
  onUpdateUser: (updated: UserProfile) => void;
  posts: CommunityPost[];
  setActiveTab: (tab: any) => void;
  isAdmin: boolean;
  onNavigateToAuth: () => void;
}

export default function HomeDashboardView({ 
  user, 
  onUpdateUser, 
  posts, 
  setActiveTab, 
  isAdmin,
  onNavigateToAuth
}: HomeDashboardViewProps) {
  // Local Daily Missions Tracker
  const [missions, setMissions] = useState([
    { id: 'm1', text: 'Calibrate Gyroscope Sensitivity', gp: 15, completed: false, category: 'Calibration' },
    { id: 'm2', text: 'Review a Marketplace Config', gp: 10, completed: false, category: 'Community' },
    { id: 'm3', text: 'Customize Active HUD Fingers', gp: 20, completed: false, category: 'HUD Builder' },
    { id: 'm4', text: 'Browse Device specs database', gp: 10, completed: true, category: 'Database' }
  ]);

  const [claimingMissionId, setClaimingMissionId] = useState<string | null>(null);

  // Toggle mission completion & award GP points
  const handleToggleMission = async (mId: string) => {
    if (!user) {
      onNavigateToAuth();
      return;
    }
    const target = missions.find(m => m.id === mId);
    if (!target || target.completed) return;

    setClaimingMissionId(mId);

    // Simulate database updates & dispatch state synchronizations
    setTimeout(() => {
      const updatedUser = {
        ...user,
        ghostPoints: (user.ghostPoints || 0) + target.gp,
        xp: (user.xp || 0) + (target.gp * 2) // Also award 2x XP for levels!
      };
      
      // Calculate level promotion
      const nextLvlXp = (user.level || 1) * 300;
      if (updatedUser.xp && updatedUser.xp >= nextLvlXp) {
        updatedUser.level = (user.level || 1) + 1;
        updatedUser.xp = updatedUser.xp - nextLvlXp;
      }

      onUpdateUser(updatedUser);
      setMissions(prev => prev.map(m => m.id === mId ? { ...m, completed: true } : m));
      setClaimingMissionId(null);

      // Fire profile global synchronization event
      window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: updatedUser }));
    }, 800);
  };

  // Extract giveaways & announcements from feed posts
  const giveaways = posts.filter(p => p.title.toLowerCase().includes('giveaway') || p.category === 'Tournament');
  const announcements = posts.filter(p => p.category === 'Announcement' || p.category === 'Update');

  // Achievements mock structure
  const achievementsList = [
    { id: 'ach1', title: 'Sensory Overlord', desc: 'Generate 10+ calibration presets', unlocked: true, rarity: 'Legendary' },
    { id: 'ach2', title: 'Tactical Critic', desc: 'Submit 5 verified reviews', unlocked: (user?.ghostPoints || 0) > 100, rarity: 'Rare' },
    { id: 'ach3', title: 'Certified Vendor', desc: 'Gain official listing merchant rights', unlocked: user?.role === 'Vendor', rarity: 'Mythic' },
    { id: 'ach4', title: 'Esports Elite', desc: 'Sync layout to pipeline', unlocked: false, rarity: 'Epic' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. HERO GRAPHIC BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl backdrop-blur-md">
        {/* Vector glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2 max-w-xl text-left">
            <span className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[9px] px-2.5 py-1 rounded-full uppercase font-bold tracking-widest animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> Cyber Esport Hub active
            </span>
            <h2 className="text-xl sm:text-3xl font-black uppercase text-white leading-tight">
              WELCOME BACK, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{user?.username || 'GUEST SOLDIER'}</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Optimize your tactile sensors, verify equipment configurations, and collaborate with competitive esports organizations. Free of cheat utilities.
            </p>
          </div>

          {/* Quick Level & XP Profile summary */}
          <div className="w-full lg:w-72 bg-slate-950/80 border border-slate-850 p-4 rounded-2xl space-y-3 shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl font-mono text-xs font-black">
                  Lvl {user?.level || 1}
                </div>
                <div className="text-left font-sans">
                  <div className="text-[10px] font-bold text-white uppercase tracking-wide">Esport Recruit</div>
                  <span className="text-[9px] text-slate-500 font-mono font-bold">XP Level Progress</span>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs font-black text-cyan-400">{(user?.ghostPoints || 0)} GP</span>
                <span className="text-[8px] text-slate-500 block uppercase font-bold">Ghost Points</span>
              </div>
            </div>

            {/* Level XP Bar */}
            <div className="space-y-1">
              <div className="w-full h-2 bg-slate-900 border border-slate-850 rounded-full overflow-hidden p-[1px]">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" 
                  style={{ width: `${Math.min(100, (((user?.xp || 0) / ((user?.level || 1) * 300)) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono font-bold text-slate-600">
                <span>{user?.xp || 0} XP</span>
                <span>{(user?.level || 1) * 300} XP NEXT LVL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROLE-BASED CONTROL ROOM STATUS INDICATORS */}
      {user && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center justify-between">
            <div className="text-left font-sans">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Licensing status</span>
              <span className="text-xs font-black uppercase text-white mt-0.5 block flex items-center gap-1.5">
                {user.role === 'Premium' || user.role === 'Administrator' ? (
                  <>
                    <Crown className="w-3.5 h-3.5 text-amber-500 fill-current" /> Active Elite Premium
                  </>
                ) : (
                  'Free Standard Tier'
                )}
              </span>
            </div>
            {user.role !== 'Premium' && user.role !== 'Administrator' && (
              <button 
                onClick={() => setActiveTab('Premium')} 
                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded cursor-pointer"
              >
                Upgrade
              </button>
            )}
          </div>

          <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center justify-between">
            <div className="text-left font-sans">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Merchant Rights</span>
              <span className="text-xs font-black uppercase text-white mt-0.5 block flex items-center gap-1.5">
                {user.role === 'Vendor' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-400" /> Active Verified Vendor
                  </>
                ) : (
                  'Standard Member'
                )}
              </span>
            </div>
            {user.role !== 'Vendor' && (
              <button 
                onClick={() => setActiveTab('Profile')} // Opens the Vendor Application form
                className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded cursor-pointer"
              >
                Apply
              </button>
            )}
          </div>

          {/* Quick link to generate page */}
          <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center justify-between">
            <div className="text-left font-sans">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Active Calibrations</span>
              <span className="text-xs font-black uppercase text-white mt-0.5 block">
                {(user.savedRecommendations?.length || 0)} Presets Bound
              </span>
            </div>
            <button 
              onClick={() => setActiveTab('Generate')} 
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded cursor-pointer"
            >
              Calibrate
            </button>
          </div>

          {/* Admin Command Indicator */}
          <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center justify-between">
            <div className="text-left font-sans">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Admin Ops Status</span>
              <span className={`text-xs font-black uppercase mt-0.5 block flex items-center gap-1 ${isAdmin ? 'text-red-400' : 'text-slate-500'}`}>
                {isAdmin ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> Operator Status Active
                  </>
                ) : (
                  'Operators Locked'
                )}
              </span>
            </div>
            {isAdmin && (
              <button 
                onClick={() => setActiveTab('AdminWorkspace')} 
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded cursor-pointer"
              >
                Enter
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. DUAL LAYOUT: STREAKS & DAILY MISSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Streak Tracker & Daily Missions */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Daily login streak inline */}
          {user ? (
            <DailyStreakTracker user={user} onUpdateUser={onUpdateUser} />
          ) : (
            <div className="p-5 bg-slate-950/60 border border-slate-850 rounded-3xl text-center space-y-3">
              <Flame className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Streaks & Daily Claims Offline</h4>
                <p className="text-[10px] text-slate-500">Sign in to track continuous calibrations and lock consecutive GP rewards.</p>
              </div>
              <button 
                onClick={onNavigateToAuth}
                className="px-4 py-1.5 bg-cyan-600 text-slate-950 text-[10px] font-black uppercase rounded-xl"
              >
                Connect account
              </button>
            </div>
          )}

          {/* Daily Tactical Missions */}
          <div className="p-5 bg-slate-950/60 border border-slate-850 rounded-3xl relative overflow-hidden backdrop-blur-md">
            <div className="flex justify-between items-center pb-3 border-b border-slate-900">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                  <Gamepad2 className="w-4 h-4" />
                </span>
                <div className="text-left">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Tactical Daily Missions</h3>
                  <span className="text-[8px] font-mono text-slate-500 uppercase">Resets every 24 Hours</span>
                </div>
              </div>
              <span className="text-[9px] font-mono text-cyan-400 font-bold bg-cyan-500/5 border border-cyan-500/20 px-2 py-0.5 rounded uppercase">
                {missions.filter(m => m.completed).length} / {missions.length} Complete
              </span>
            </div>

            <div className="divide-y divide-slate-900/60 mt-4">
              {missions.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleMission(m.id)}
                      disabled={m.completed || claimingMissionId === m.id}
                      className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition-all cursor-pointer ${
                        m.completed 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                          : 'border-slate-850 hover:border-cyan-500/40'
                      }`}
                    >
                      {m.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3px]" />}
                    </button>
                    <div className="text-left font-sans">
                      <span className="text-[8px] font-mono bg-slate-900 border border-slate-850 text-slate-400 px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                        {m.category}
                      </span>
                      <p className={`text-[10.5px] mt-1 font-bold ${m.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                        {m.text}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleMission(m.id)}
                    disabled={m.completed || claimingMissionId === m.id}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-black uppercase transition-all ${
                      m.completed
                        ? 'bg-slate-900 text-slate-500 border border-slate-850 cursor-not-allowed'
                        : claimingMissionId === m.id
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black cursor-pointer shadow hover:scale-[1.02]'
                    }`}
                  >
                    {claimingMissionId === m.id ? (
                      'Syncing...'
                    ) : m.completed ? (
                      'Claimed'
                    ) : (
                      `+${m.gp} GP`
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE ROADMAP GAME PIPELINES */}
          <div className="p-5 bg-slate-950/60 border border-slate-850 rounded-3xl relative overflow-hidden backdrop-blur-md">
            <div className="flex justify-between items-center pb-3 border-b border-slate-900">
              <div className="flex items-center gap-2 text-left">
                <span className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Active game integrations</h3>
                  <span className="text-[8px] font-mono text-slate-500 uppercase">Competitive Esports Esports Blueprints</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('Generate')} // Navigates to the Pipeline menu
                className="text-[9px] font-mono font-bold text-purple-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                View Pipeline <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-2xl text-left">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black text-white uppercase font-mono">Free Fire</span>
                  <span className="text-[7.5px] font-bold bg-emerald-500/15 text-emerald-400 px-1 rounded uppercase">Live</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal mt-1">Touch sensitivity & auto-recoil calibrations optimized for OB45 update.</p>
              </div>

              <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-2xl text-left">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black text-white uppercase font-mono">PUBG Mobile</span>
                  <span className="text-[7.5px] font-bold bg-emerald-500/15 text-emerald-400 px-1 rounded uppercase">Live</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal mt-1">DPI layouts & 4-finger gyroscope sensitivity matrices calibrated.</p>
              </div>

              <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-2xl text-left">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black text-white uppercase font-mono">COD Mobile</span>
                  <span className="text-[7.5px] font-bold bg-amber-500/15 text-amber-400 px-1 rounded uppercase">Syncing</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal mt-1">ADS sensory multipliers mapping underway. Releases shortly.</p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Announcements, Giveaways, Achievements */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* Active Giveaways */}
          <div className="p-5 bg-gradient-to-b from-purple-950/20 to-slate-950/60 border border-purple-500/20 rounded-3xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
              <span className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                <Gift className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Premium Giveaways</h3>
                <span className="text-[8px] font-mono text-purple-400 uppercase font-bold animate-pulse">● ACTIVE ESports EXCLUSIVES</span>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {giveaways.length === 0 ? (
                <div className="py-2 text-center text-slate-500 text-[10px] italic">
                  No active giveaways at this moment.
                </div>
              ) : (
                giveaways.slice(0, 3).map((g) => (
                  <div key={g.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[8.5px] font-mono text-purple-400 uppercase font-black tracking-widest">{g.category}</span>
                      <span className="text-[7.5px] font-bold bg-purple-500/15 text-purple-400 px-1 py-0.2 rounded uppercase">WIN VIP CONFIGS</span>
                    </div>
                    <h4 className="text-[10px] font-extrabold text-white uppercase">{g.title}</h4>
                    <button 
                      onClick={() => setActiveTab('Community')}
                      className="w-full py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[8.5px] font-mono font-black uppercase tracking-wider rounded transition-colors"
                    >
                      Join Raffle In Feed
                    </button>
                  </div>
                ))
              )}

              <button 
                onClick={() => setActiveTab('Community')}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-slate-950 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View Community Drops</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[2px]" />
              </button>
            </div>
          </div>

          {/* Announcements / Official Updates */}
          <div className="p-5 bg-slate-950/60 border border-slate-850 rounded-3xl relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
              <span className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                <Newspaper className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">News & announcements</h3>
                <span className="text-[8px] font-mono text-slate-500 uppercase">Hub System Broadcasters</span>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {announcements.length === 0 ? (
                <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl text-left">
                  <span className="text-[8px] font-mono text-cyan-400 font-extrabold block uppercase mb-1">SYSTEM MAINTENANCE</span>
                  <h4 className="text-[10px] font-bold text-white uppercase">GhostCore v2.0 Engine Upgraded Successfully</h4>
                  <p className="text-[9.5px] text-slate-400 leading-normal mt-1">Recalibrated local Firestore storage to prevent latency. Fast, client-side caching activated.</p>
                </div>
              ) : (
                announcements.slice(0, 2).map((a) => (
                  <div key={a.id} className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl text-left space-y-1">
                    <span className="text-[8px] font-mono text-cyan-400 font-extrabold block uppercase">{a.category} • UPDATED</span>
                    <h4 className="text-[10px] font-bold text-white uppercase">{a.title}</h4>
                    <p className="text-[9.5px] text-slate-400 leading-normal line-clamp-3">{a.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Achievements Checklist */}
          <div className="p-5 bg-slate-950/60 border border-slate-850 rounded-3xl relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
              <span className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                <Award className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">TACTICAL ACHIEVEMENTS</h3>
                <span className="text-[8px] font-mono text-slate-500 uppercase">Competitive Milestones</span>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {achievementsList.map((ach) => (
                <div key={ach.id} className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${ach.unlocked ? 'bg-slate-900/30 border-emerald-950/50' : 'bg-slate-950 border-slate-900/80 opacity-60'}`}>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[10px] font-extrabold text-white uppercase">{ach.title}</h4>
                      <span className={`text-[7px] font-bold px-1 rounded uppercase ${
                        ach.rarity === 'Mythic' ? 'bg-red-500/15 text-red-400' :
                        ach.rarity === 'Legendary' ? 'bg-amber-500/15 text-amber-400' :
                        ach.rarity === 'Rare' ? 'bg-cyan-500/15 text-cyan-400' :
                        'bg-purple-500/15 text-purple-400'
                      }`}>{ach.rarity}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{ach.desc}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${ach.unlocked ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-900 border-slate-850 text-slate-600'}`}>
                    {ach.unlocked ? <CheckCircle2 className="w-3.5 h-3.5" /> : '🔒'}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
