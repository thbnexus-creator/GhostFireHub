import { firebaseApi } from '../lib/firebaseApi';
import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Clock, 
  Users, 
  Send, 
  Trophy, 
  Trash2, 
  Plus, 
  AlertCircle, 
  Sparkles, 
  CheckCircle, 
  X,
  Share2,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Giveaway } from '../types';
import { formatDisplayName } from '../utils';
import SecureImageUpload from './SecureImageUpload';
import { deleteFileFromFirebase } from '../lib/firebase';

interface GiveawaysProps {
  userEmail?: string;
  isAdmin?: boolean;
}

export default function CommunityGiveaways({ userEmail, isAdmin }: GiveawaysProps) {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Create Giveaway Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [durationDays, setDurationDays] = useState('3');
  const [telegramLink, setTelegramLink] = useState('ghostfirehub1');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time ticker state
  const [now, setNow] = useState(new Date());

  // Load Giveaways
  const loadGiveaways = async () => {
    setLoading(true);
    try {
      const res = await firebaseApi.request('giveaways');
      if (res.ok) {
        const data = await res.json();
        setGiveaways(data);
      } else {
        setError('Failed to fetch community giveaways.');
      }
    } catch (err) {
      setError('Connection failure loading giveaways.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGiveaways();
    
    // Live countdown timer ticker
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Form submission
  const handleAddGiveaway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !reward) {
      setError('Please provide all required giveaway details.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    // Compute end date
    const end = new Date();
    end.setDate(end.getDate() + Number(durationDays));

    try {
      const res = await firebaseApi.request('giveaways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          reward,
          endTime: end.toISOString(),
          telegramLink: telegramLink.replace('@', '').trim(),
          image: image || ''
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSuccess('Community giveaway posted live successfully!');
          setTitle('');
          setDescription('');
          setReward('');
          setImage('');
          setShowAddForm(false);
          loadGiveaways();
        }
      } else {
        setError('Server refused to post giveaway.');
      }
    } catch (err) {
      setError('Failed to communicate with API server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Participate/Join Giveaway
  const handleJoinGiveaway = async (giveawayId: string) => {
    if (!userEmail) {
      setError('You must open or register a profile first to join community giveaways.');
      setTimeout(() => setError(''), 4000);
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await firebaseApi.request(`giveaways/${giveawayId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.alreadyJoined) {
            setSuccess('You have already registered your participation in this drawing!');
          } else {
            setSuccess('Successfully joined drawing! Keep an eye on the countdown ticker.');
          }
          loadGiveaways();
          setTimeout(() => setSuccess(''), 4000);
        }
      } else {
        setError('Failed to join drawing.');
      }
    } catch (err) {
      setError('Failed to register entry. Connection error.');
    }
  };

  // Pick Random Winner (Admin Only)
  const handlePickWinner = async (giveawayId: string) => {
    const g = giveaways.find(item => item.id === giveawayId);
    if (!g) return;
    if (!g.participants || g.participants.length === 0) {
      alert('Cannot roll a winner because there are no players registered yet.');
      return;
    }

    if (!confirm('Are you ready to roll the dice and deterministically draw a lucky winner from the registered pool?')) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * g.participants.length);
    const chosenWinnerEmail = g.participants[randomIndex];

    try {
      const res = await firebaseApi.request(`giveaways/${giveawayId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner: chosenWinnerEmail })
      });

      if (res.ok) {
        setSuccess(`And the winner is... ${chosenWinnerEmail}! Updated live.`);
        loadGiveaways();
        setTimeout(() => setSuccess(''), 6000);
      }
    } catch (err) {
      alert('Failed to register winner selection on database.');
    }
  };

  // Delete Giveaway (Admin Only)
  const handleDeleteGiveaway = async (giveawayId: string) => {
    if (!confirm('Are you absolutely sure you want to permanently delete this community giveaway drawing?')) {
      return;
    }

    try {
      const g = giveaways.find(item => item.id === giveawayId);
      if (g && g.image) {
        await deleteFileFromFirebase(g.image);
      }
      const res = await firebaseApi.request(`giveaways/${giveawayId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSuccess('Giveaway removed successfully.');
        loadGiveaways();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      alert('Failed to erase giveaway.');
    }
  };

  // Countdown computation helper
  const getCountdownString = (endTimeStr: string) => {
    const end = new Date(endTimeStr);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 'EXPIRED';

    const secs = Math.floor(diff / 1000) % 60;
    const mins = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    let str = '';
    if (days > 0) str += `${days}d `;
    if (hours > 0 || days > 0) str += `${hours}h `;
    str += `${mins}m ${secs}s`;
    return str;
  };

  // Share giveaway
  const handleShareGiveaway = (g: Giveaway) => {
    const text = `Join the community giveaway of "${g.title}" at GhostFireHub! Claim free reward: ${g.reward}`;
    const url = window.location.origin;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Badge */}
      <div className="bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-slate-900 border border-purple-500/20 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-purple-400 font-mono text-[10px] font-bold uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
              <span>Community Drop Hub</span>
            </div>
            <h2 className="text-sm sm:text-md font-black text-white uppercase mt-1">
              Active Community Giveaways
            </h2>
            <p className="text-[10px] text-slate-400 font-sans mt-1 max-w-xl">
              We reward our community with premium sensitivity license keys, configurations, fully loaded accounts, and HUD layouts completely for free! Open a free profile to enter.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-purple-900/25 transition-all"
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showAddForm ? 'Close Builder' : 'Post Giveaway'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Create Giveaway Panel (Admin only) */}
      <AnimatePresence>
        {showAddForm && isAdmin && (
          <motion.form
            initial={{ opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleAddGiveaway}
            className="bg-slate-900/40 border border-purple-500/20 rounded-2xl p-4 space-y-4 overflow-hidden text-xs text-white"
          >
            <div className="flex items-center gap-2 pb-1 border-b border-slate-850">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <h3 className="font-extrabold uppercase text-[10px] tracking-wider text-purple-300">
                ADMIN GIVEAWAY DRAWING CREATOR
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Giveaway Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Fire Level 75 Account"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Item Reward</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Level 75 heroic badge voucher"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Duration (Days)</label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-500 transition-colors text-slate-300"
                >
                  <option value="1">1 Day</option>
                  <option value="2">2 Days</option>
                  <option value="3">3 Days (Default)</option>
                  <option value="5">5 Days</option>
                  <option value="7">7 Days</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Telegram Admin Link</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ghostfirehub1"
                  value={telegramLink}
                  onChange={(e) => setTelegramLink(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Description & Instructions</label>
              <textarea
                required
                rows={3}
                placeholder="Give instructions on what users will receive and how they claim from your official support DM..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Upload Banner (Optional)</label>
              <SecureImageUpload
                imageUrl={image}
                onUploadSuccess={(url) => setImage(url)}
                onClear={() => setImage('')}
                folder="giveaways"
                label="PNG / JPG GIVEAWAY BANNER (Max 2MB)"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all"
            >
              {isSubmitting ? 'Syncing Server...' : 'Launch Community Giveaway'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* List of Giveaways */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Loading drawings...</p>
        </div>
      ) : giveaways.length === 0 ? (
        <div className="p-8 bg-slate-900/20 border border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center">
          <Gift className="w-8 h-8 text-slate-750 mb-3" />
          <h3 className="text-xs font-bold text-slate-300 uppercase">No Active Giveaways</h3>
          <p className="text-[10px] text-slate-500 max-w-xs mt-1 font-sans leading-normal">
            We are preparing the next batch of legendary drops! Subscribe to notifications or announcements to stay tuned.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {giveaways.map(g => {
            const isExpired = getCountdownString(g.endTime) === 'EXPIRED';
            const userHasJoined = userEmail && g.participants && g.participants.includes(userEmail);
            
            return (
              <div 
                key={g.id}
                className={`bg-slate-900/40 border rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-lg hover:border-purple-500/30 transition-all duration-200 relative overflow-hidden ${isExpired ? 'border-slate-850 opacity-80' : 'border-purple-500/10'}`}
              >
                {/* Glow decor for active giveaways */}
                {!isExpired && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
                )}

                <div className="space-y-2 relative z-10">
                  {/* Status header badge */}
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <span className="text-[9px] font-bold font-mono px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 uppercase">
                      🎁 Prize: {g.reward}
                    </span>

                    <span className={`text-[9px] font-bold font-mono px-2.5 py-1 rounded flex items-center gap-1 ${isExpired ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-slate-950 border border-slate-850 text-amber-400 animate-pulse'}`}>
                      <Clock className="w-3 h-3" />
                      {isExpired ? 'EXPIRED DRAWING' : getCountdownString(g.endTime)}
                    </span>
                  </div>

                  {g.image && (
                    <div className="w-full h-28 bg-slate-950 rounded-xl border border-slate-850 overflow-hidden relative group mt-1.5">
                      <img src={g.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" alt={g.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                    </div>
                  )}

                  <h3 className="text-xs sm:text-sm font-black text-white uppercase mt-1 leading-snug">
                    {g.title}
                  </h3>

                  <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                    {g.description}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1 text-[9.5px] text-slate-500 font-mono">
                    <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{g.participants?.length || 0} players joined drawing</span>
                  </div>

                  {g.winner && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 mt-2">
                      <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="text-[9.5px] leading-tight text-amber-300">
                        <span className="font-extrabold uppercase">Winner:</span> {formatDisplayName('Player', g.winner)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Operations & Buttons */}
                <div className="space-y-2 relative z-10 pt-2 border-t border-slate-850/60">
                  
                  {/* Join / Claim Action */}
                  {isExpired ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-center py-2 bg-slate-950 border border-slate-850 rounded-xl text-[9px] text-slate-500 font-mono uppercase font-black">
                        Drawing Completed
                      </div>
                      
                      <button
                        onClick={() => handleShareGiveaway(g)}
                        className="p-2 bg-slate-950 border border-slate-850 hover:text-white rounded-xl text-slate-400 transition-colors"
                        title="Share drawing link"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJoinGiveaway(g.id)}
                        disabled={!!userHasJoined}
                        className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${userHasJoined ? 'bg-slate-950 border border-emerald-500/20 text-emerald-400 flex items-center justify-center gap-1.5' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-lg'}`}
                      >
                        {userHasJoined ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Entered Drawing</span>
                          </>
                        ) : (
                          'Enter Drawing Free'
                        )}
                      </button>

                      {g.telegramLink && (
                        <a
                          href={`https://t.me/${g.telegramLink}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-purple-400 rounded-xl flex items-center justify-center"
                          title="Contact support telegram"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Admin Utilities */}
                  {isAdmin && (
                    <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-950 rounded-xl border border-purple-900/30 text-[9px] font-mono">
                      <span className="text-purple-400 font-extrabold uppercase px-1.5">Admin Ops:</span>
                      
                      <div className="flex items-center gap-1.5">
                        {!g.winner && g.participants && g.participants.length > 0 && (
                          <button
                            onClick={() => handlePickWinner(g.id)}
                            className="px-2 py-1 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-md font-black uppercase tracking-wider"
                          >
                            Draw Winner
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteGiveaway(g.id)}
                          className="p-1 text-red-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
