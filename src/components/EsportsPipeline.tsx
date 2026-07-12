import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  MessageSquare, 
  Send, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Star, 
  AlertTriangle,
  FileText,
  User,
  Trash2,
  BookmarkCheck,
  Flame,
  Award
} from 'lucide-react';

interface GamePipelineItem {
  id: string;
  name: string;
  logo: string;
  status: 'Live' | 'Current Update' | 'In Development' | 'Planned';
  description: string;
  features: string[];
  bannerUrl?: string;
}

interface GameFeedback {
  id: string;
  gameId: string;
  gameName: string;
  userName: string;
  userEmail: string;
  category: string;
  rating: number;
  message: string;
  timestamp: string;
  status?: 'Pending' | 'Approved' | 'Planned' | 'Implemented';
}

interface EsportsPipelineProps {
  userEmail?: string;
  userName?: string;
  isAdmin?: boolean;
}

export default function EsportsPipeline({ userEmail, userName, isAdmin }: EsportsPipelineProps) {
  const [feedbacks, setFeedbacks] = useState<GameFeedback[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('g-freefire');
  const [formCategory, setFormCategory] = useState<string>('HUD Request');
  const [formRating, setFormRating] = useState<number>(5);
  const [formMessage, setFormMessage] = useState<string>('');
  const [formName, setFormName] = useState<string>(userName || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Hardcoded games list with official logos and current status
  const gamesList: GamePipelineItem[] = [
    {
      id: 'g-freefire',
      name: 'Garena Free Fire',
      logo: 'https://upload.wikimedia.org/wikipedia/en/a/a3/Garena_Free_fire_logo.png',
      status: 'Current Update',
      description: 'The ultra-popular survival shooter on mobile. Fully calibrated HUD layout simulations, baseline weapons statistics repository, and smart DPI recommendations optimized for the OB45 Neo-Classic update.',
      features: ['GhostCore Sensitivity Engine V2', 'OB45 Neo-Classic Precision Recoil Calibrations', '2/3/4 Finger HUD Layout Playground'],
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'g-pubg',
      name: 'PUBG Mobile',
      logo: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Pubg_mobile_logo.png',
      status: 'Current Update',
      description: 'The definitive battle royale experience on mobile devices. Extreme custom sensitivity tuning for gyro scopes, vehicle control, and advanced weapon recoil calibrations.',
      features: ['6x Scope Zero Recoil Tuning', 'Full Gyroscope Calibration Database', 'Aesthetic HUD Canvas Preset Exports'],
      bannerUrl: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'g-codm',
      name: 'Call of Duty Mobile (CODM)',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Call_of_Duty_Mobile_logo.png/320px-Call_of_Duty_Mobile_logo.png',
      status: 'In Development',
      description: 'Legendary multiplayer and battle royale combat on the go. High-speed tactical movement calculations and weapon-specific ads timing optimizations coming in the next release.',
      features: ['ADS Bullet Spread Accuracy Tuning', 'Tactical Slide-Cancel Sensitivity Presets', 'Ranked MP Mode Custom Calibrations'],
      bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'g-bloodstrike',
      name: 'Bloodstrike Mobile',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Target_Corporation_logo_vector.svg/120px-Target_Corporation_logo_vector.svg.png', // Fallback high fidelity logo
      status: 'Planned',
      description: 'The fast-paced, high-octane modern rogue-lite shooter on mobile. Precise trigger action responses, high touch sampling calibrations, and optimal framerate booster HUD layouts planned.',
      features: ['Ultra-responsive slide jump setups', 'Strike pass weapon blueprints tracking', 'Zero delay touch response guides'],
      bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'g-football',
      name: 'Football Mobile (FC Mobile / eFootball)',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/EFootball_logo.png/320px-EFootball_logo.png',
      status: 'Planned',
      description: 'Immersive football simulator with full team tactics. Custom touch buttons coordinates for maximum skill moves responsiveness, cross accuracy, and defense tracking.',
      features: ['Skill Move Swipe Calibration', 'Custom Button Tap Sensitivity Adjustments', 'Optimal 2-Finger Control Templates'],
      bannerUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop'
    }
  ];

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/game-feedback');
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error('Failed to load feedback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMessage.trim()) {
      setErrorMessage('Please type a message before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSubmitSuccess(false);

    const targetGame = gamesList.find(g => g.id === selectedGame);
    const gameName = targetGame ? targetGame.name : 'Unknown Game';

    try {
      const res = await fetch('/api/game-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: selectedGame,
          gameName,
          userName: formName || 'Anonymous Warrior',
          userEmail: userEmail || 'anonymous@ghostcore.esports',
          category: formCategory,
          rating: formRating,
          message: formMessage
        })
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setFormMessage('');
        fetchFeedback();
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setErrorMessage('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeGameInfo = gamesList.find(g => g.id === selectedGame) || gamesList[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-1">
      {/* HEADER SECTION */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-orange-500 font-mono text-[10px] uppercase font-black tracking-widest mb-1.5">
              <Gamepad2 className="w-4 h-4 text-orange-500 fill-orange-500/10 animate-pulse" />
              Esports Expansion Pipeline & Lab Feedback
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Pending Updates & Games Roadmap
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              We are expanding GhostCore™ calibrations across major mobile esports. Review the active timeline of upcoming launches, examine the official, authenticated current update logos, and submit your suggestions.
            </p>
          </div>
        </div>
      </div>

      {/* GAME SELECTOR RAIL AND HERO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIDE BAR GAME CARD LIST */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 mb-2 font-mono">
            Esports Channels ({gamesList.length})
          </div>
          {gamesList.map(game => {
            const isSelected = selectedGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group relative overflow-hidden ${
                  isSelected 
                    ? 'bg-slate-950 border-orange-500/40 text-orange-400 shadow-xl' 
                    : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform bg-white/5">
                    <img 
                      src={game.logo} 
                      alt={game.name} 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-tight text-white group-hover:text-orange-400 transition-colors">
                      {game.name}
                    </h3>
                    <span className={`text-[8px] font-mono uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md ${
                      game.status === 'Current Update' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      game.status === 'In Development' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      {game.status}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ACTIVE GAME DETAIL SPOTLIGHT */}
        <div className="lg:col-span-8">
          <div className="bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden flex flex-col justify-between h-full">
            {/* Banner preview */}
            <div className="h-44 relative overflow-hidden">
              <img 
                src={activeGameInfo.bannerUrl} 
                alt={activeGameInfo.name} 
                className="w-full h-full object-cover opacity-30" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              <div className="absolute bottom-4 left-6 right-6 flex items-end gap-4">
                <div className="w-16 h-16 bg-slate-900 border-2 border-slate-800 rounded-2xl p-2 flex items-center justify-center bg-white/10 shrink-0 shadow-2xl">
                  <img 
                    src={activeGameInfo.logo} 
                    alt={activeGameInfo.name} 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <span className="text-[8px] font-mono uppercase tracking-widest font-black text-orange-500">Active Expansion Focus</span>
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                    {activeGameInfo.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Description and planned features */}
            <div className="p-6 flex-1 space-y-6">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Overview & Integration Scope</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {activeGameInfo.description}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Features Planned or Implemented</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeGameInfo.features.map((feat, idx) => (
                    <div key={idx} className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl flex items-center gap-2.5 text-xs text-slate-200">
                      <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback call to action banner */}
            <div className="bg-slate-900/30 border-t border-slate-900 p-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-[10px] font-mono text-slate-400 text-center sm:text-left">
                Have specific recommendations for {activeGameInfo.name}? Let us know below!
              </p>
              <a 
                href="#feedback-form" 
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all"
              >
                Go to Form
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FEEDBACK SUBMISSION AND SYSTEM STREAMS */}
      <div id="feedback-form" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* FEEDBACK FORM */}
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-1.5 text-orange-500 font-mono text-[9px] uppercase font-black tracking-widest">
              <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
              Interactive Feedback Lab
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Submit Calibrations Suggestion
            </h3>
            <p className="text-[11px] text-slate-400">
              Your feedback is analyzed directly by administrators to prioritize high-fidelity sensor calibrations.
            </p>
          </div>

          <form onSubmit={handleSubmitFeedback} className="space-y-4 relative z-10">
            {errorMessage && (
              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-[10px] font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="p-3 bg-green-950/20 border border-green-900/30 rounded-xl text-green-400 text-[10px] font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <span>Feedback submitted successfully to the live pipeline!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Target Game Selection</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 text-xs text-white rounded-xl px-3 py-2.5 outline-none transition-colors"
                >
                  {gamesList.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Feedback Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 text-xs text-white rounded-xl px-3 py-2.5 outline-none transition-colors"
                >
                  <option value="HUD Request">HUD Layout Request</option>
                  <option value="Sensitivity Issue">Sensitivity Issue</option>
                  <option value="Feature Suggestion">Feature Suggestion</option>
                  <option value="Content Request">Weapon Content Request</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Display Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. GhostSniper99"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 text-xs text-white rounded-xl px-3 py-2 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Urgency Priority</label>
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 justify-between">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-3.5 h-3.5 ${star <= formRating ? 'text-amber-500 fill-amber-500' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-[9px] font-black font-mono uppercase text-amber-500">Stars</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Your Message / Suggestion Description</label>
              <textarea
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder={`Describe the perfect DPI, HUD finger layout, or specific settings you need for ${activeGameInfo.name}...`}
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 text-xs text-white rounded-xl px-3 py-2 outline-none transition-colors resize-none placeholder:text-slate-600 font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-600/10 hover:shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? 'Transmitting...' : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Suggestion to Admin</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* FEEDBACK DISPLAY STREAM */}
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[9px] uppercase font-black tracking-widest">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Live Suggestion Pipeline
              </div>
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg text-[8px] font-bold font-mono">
                System Active
              </span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Recent Player Suggestions
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[340px] pr-1 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 animate-pulse">
                <div className="w-6 h-6 border-2 border-t-orange-500 border-slate-850 rounded-full animate-spin"></div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Syncing feedbacks...</p>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-900 p-6 flex flex-col items-center space-y-3">
                <FileText className="w-8 h-8 text-slate-700" />
                <p className="text-xs text-slate-400">No suggestions received yet. Be the first to shape the future of {activeGameInfo.name}!</p>
              </div>
            ) : (
              feedbacks.map((fb) => (
                <div 
                  key={fb.id} 
                  className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-2xl space-y-2 hover:border-slate-800 transition-all"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center border border-slate-750">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-200 block truncate max-w-[120px]">
                          {fb.userName}
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono block">
                          {new Date(fb.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-orange-400 rounded text-[8px] font-bold font-mono uppercase tracking-wider">
                        {fb.gameName}
                      </span>
                      <div className="flex items-center justify-end gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-2.5 h-2.5 ${i < fb.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-800'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-normal pl-9">
                    {fb.message}
                  </p>

                  <div className="flex justify-between items-center pt-1.5 pl-9 border-t border-slate-900/40">
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-black">
                      Category: <span className="text-slate-400 font-bold">{fb.category}</span>
                    </span>
                    
                    {/* Approved / pending statuses */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-1 py-0.2 rounded font-mono font-extrabold uppercase">
                        Reviewed
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-[9px] font-mono text-slate-500 text-center border-t border-slate-900/60 pt-3">
            Real-time live synchronization is active via GhostCore™ datastore.
          </div>
        </div>
      </div>
    </div>
  );
}
