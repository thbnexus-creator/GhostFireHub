import React, { useState, useEffect } from 'react';
import { Flame, Check, Lock, Gift, Sparkles, Calendar, Trophy, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface DailyStreakTrackerProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

export default function DailyStreakTracker({ user, onUpdateUser }: DailyStreakTrackerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper to get local date string YYYY-MM-DD
  const getClientDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getClientDateStr();
  const hasClaimedToday = user.lastClaimedDailyRewardDate === todayStr;

  // Determine consecutive day logic
  let nextStreak = 1;
  if (user.lastClaimedDailyRewardDate) {
    try {
      const dLast = new Date(user.lastClaimedDailyRewardDate + 'T00:00:00');
      const dToday = new Date(todayStr + 'T00:00:00');
      const diffMs = dToday.getTime() - dLast.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        nextStreak = ((user.loginStreak || 0) % 7) + 1;
      } else if (diffDays <= 0) {
        nextStreak = user.loginStreak || 1;
      } else {
        nextStreak = 1;
      }
    } catch (e) {
      nextStreak = 1;
    }
  } else {
    nextStreak = 1;
  }

  // Current effective streak to highlight
  const currentStreakVal = hasClaimedToday ? (user.loginStreak || 1) : nextStreak;

  // Rewards by consecutive login day
  const rewards = [
    { day: 1, gp: 10, label: 'Base' },
    { day: 2, gp: 15, label: 'Booster' },
    { day: 3, gp: 20, label: 'Tactical' },
    { day: 4, gp: 25, label: 'Elite' },
    { day: 5, gp: 35, label: 'Sentinel' },
    { day: 6, gp: 50, label: 'Overlord' },
    { day: 7, gp: 100, label: 'Jackpot 👑' },
  ];

  const handleClaim = async () => {
    if (hasClaimedToday) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user/claim-daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          clientDateStr: todayStr,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim daily reward.');
      }

      setSuccess(`Successfully claimed Day ${data.loginStreak} daily login bonus! +${data.pointsReward} GP`);
      onUpdateUser(data.user);

      // Trigger standard user-profile-updated event to sync layout globally
      const event = new CustomEvent('user-profile-updated', { detail: data.user });
      window.dispatchEvent(event);
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 bg-slate-950/60 border border-slate-850 rounded-3xl relative overflow-hidden backdrop-blur-md mb-6"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Daily Rewards & Streaks
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Maintain your consecutive daily calibration login sequence to unlock high-yield <span className="text-emerald-400 font-bold">GhostPoints (GP)</span> boosters.
          </p>
        </div>

        {/* Current active streak pill */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl shrink-0">
          <Flame className={`w-4 h-4 ${user.loginStreak ? 'text-orange-500 fill-current animate-pulse' : 'text-slate-600'}`} />
          <div className="text-left font-mono leading-none">
            <div className="text-[10px] font-bold text-white uppercase">
              {user.loginStreak || 0} Day Streak
            </div>
            <span className="text-[8px] text-slate-500">
              {hasClaimedToday ? 'Sequence locked for today' : 'Calibrated claim ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid containing the 7 consecutive days */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 my-5">
        {rewards.map((r) => {
          const isClaimed = hasClaimedToday
            ? r.day <= (user.loginStreak || 0)
            : r.day < nextStreak;
          const isActive = !hasClaimedToday && r.day === nextStreak;
          const isUpcoming = r.day > currentStreakVal;

          return (
            <div
              key={r.day}
              className={`p-3 rounded-2xl border transition-all text-center relative flex flex-col justify-between h-[105px] overflow-hidden ${
                isClaimed
                  ? 'bg-slate-900/30 border-emerald-950 text-slate-500'
                  : isActive
                  ? 'bg-orange-950/20 border-orange-500/40 ring-1 ring-orange-500/20 shadow-lg shadow-orange-950/20 text-white'
                  : 'bg-slate-950/80 border-slate-900 text-slate-400 hover:border-slate-800'
              }`}
            >
              {/* Highlight background spark for Active day */}
              {isActive && (
                <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 animate-pulse"></span>
              )}

              <div className="space-y-1">
                <span className="text-[8px] font-mono uppercase tracking-widest block text-slate-500">
                  Day {r.day}
                </span>
                <span className="text-[8px] font-bold block text-slate-400 truncate">
                  {r.label}
                </span>
              </div>

              {/* Status Icons */}
              <div className="my-1.5 flex justify-center">
                {isClaimed ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  </div>
                ) : isActive ? (
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className="w-7 h-7 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400"
                  >
                    <Gift className="w-4 h-4" />
                  </motion.div>
                ) : r.day === 7 ? (
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Trophy className="w-3.5 h-3.5 animate-bounce-slow" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-600">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div>
                <span
                  className={`text-xs font-black font-mono block ${
                    isClaimed
                      ? 'text-emerald-500/60'
                      : isActive
                      ? 'text-orange-400'
                      : r.day === 7
                      ? 'text-amber-400'
                      : 'text-white'
                  }`}
                >
                  +{r.gp} GP
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactions panel */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-900">
        <div className="text-left">
          {hasClaimedToday ? (
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Daily check-in complete. Return tomorrow for Day {((user.loginStreak || 0) % 7) + 1} reward!
            </span>
          ) : (
            <span className="text-[10px] font-mono text-orange-400 flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Your Day {nextStreak} reward of {rewards[nextStreak - 1]?.gp} GP is waiting!
            </span>
          )}
        </div>

        <button
          onClick={handleClaim}
          disabled={hasClaimedToday || loading}
          className={`w-full sm:w-auto px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            hasClaimedToday
              ? 'bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-lg shadow-orange-500/10 hover:shadow-orange-400/20 cursor-pointer hover:scale-[1.02] active:scale-95'
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-1 justify-center">
              <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              Claiming...
            </span>
          ) : hasClaimedToday ? (
            'Reward Claimed Today'
          ) : (
            `Claim Day ${nextStreak} Reward`
          )}
        </button>
      </div>

      {/* Messages Feedbacks */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, h: 0 }}
            animate={{ opacity: 1, h: 'auto' }}
            exit={{ opacity: 0 }}
            className="mt-3 p-2.5 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-[9.5px] font-mono flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, h: 0 }}
            animate={{ opacity: 1, h: 'auto' }}
            exit={{ opacity: 0 }}
            className="mt-3 p-2.5 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-emerald-400 text-[9.5px] font-mono flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
