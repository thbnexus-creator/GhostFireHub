import React, { useState, useEffect } from 'react';
import { Tv, Sparkles, Timer, Check, Shield } from 'lucide-react';
import { UserProfile } from '../types';

interface SponsorAdPopupProps {
  currentUser: UserProfile | null;
  onAdClose: () => void;
  onNavigateToAuth?: () => void;
}

const SAMPLE_POPUP_ADS = [
  {
    title: 'ROG Phone 9 Extreme Calibration',
    tagline: 'ASUS Republic of Gamers Sponsoring Sensi Calibrations',
    description: 'Calibrate your high-fidelity AMOLED screen using ASUS ROG G-Sync digital grid telemetry. Experience instantaneous touch latency under 0.8ms.',
    icon: '🎮',
    actionText: 'Calibrate ROG touch coordinates'
  },
  {
    title: 'Infinix GT Pro 2026 Gaming Master',
    tagline: 'Infinix Esports Lab Sponsoring Sensi Calibrations',
    description: 'Unleash full 240Hz screen refresh rates with Infinix GT Extreme Gaming Core. Low-latency vector alignment for competitive Garena Free Fire tournaments.',
    icon: '⚡',
    actionText: 'Download GT Gaming Profile'
  },
  {
    title: 'Binance Esports Championship Cup',
    tagline: 'Join the $500,000 NGN Free Fire Tournament Pool',
    description: 'Compete with top West African Free Fire guilds. Register your custom tactile sensitivity profiles to secure eligibility. Multi-layered blockchain ledger escrow guarantees fair payout.',
    icon: '🏆',
    actionText: 'Register for Free'
  }
];

export default function SponsorAdPopup({ currentUser, onAdClose, onNavigateToAuth }: SponsorAdPopupProps) {
  const [ad, setAd] = useState<any>(() => SAMPLE_POPUP_ADS[Math.floor(Math.random() * SAMPLE_POPUP_ADS.length)]);
  const [countdown, setCountdown] = useState(() => currentUser ? 5 : 30);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submittingImpression, setSubmittingImpression] = useState(false);

  useEffect(() => {
    const fetchActiveAd = async () => {
      try {
        const res = await fetch('/api/ads');
        if (res.ok) {
          const list = await res.json();
          if (list && list.length > 0) {
            const chosen = list[Math.floor(Math.random() * list.length)];
            setAd(chosen);
            setCountdown(currentUser ? (chosen.videoDuration || chosen.duration || 10) : 30);
          }
        }
      } catch (err) {
        console.error('Failed to load active sponsors:', err);
      }
    };
    fetchActiveAd();
  }, [currentUser]);

  const handleCompleteAndClose = async () => {
    if (submittingImpression) return;
    setSubmittingImpression(true);

    try {
      // Record ad impression to server database to credit Admin
      await fetch('/api/ads/record-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser?.email || 'Guest',
          adTitle: ad.title
        })
      });
    } catch (err) {
      console.error('Error logging ad impression to admin balance:', err);
    } finally {
      setSubmittingImpression(false);
      onAdClose();
    }
  };

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else {
      setIsCompleted(true);
      // For guest users, once the 30-second playback completes, automatically close the ad!
      if (!currentUser) {
        handleCompleteAndClose();
      }
    }
    return () => clearInterval(timer);
  }, [countdown, currentUser]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-orange-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl shadow-orange-500/5">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg">
                <Tv className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[8px] font-black uppercase text-orange-400 tracking-widest font-mono block">Esports Telemetry Partner</span>
                <span className="text-[10px] font-bold text-white uppercase block">Sponsor Calibration Ad</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 font-mono text-[10px] bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-xl text-slate-400">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Revenue Escrow Active</span>
            </div>
          </div>

          {/* Ad content body */}
          <div className="space-y-3.5">
            {ad.videoUrl ? (
              <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-inner">
                {ad.videoUrl.includes('youtube.com') || ad.videoUrl.includes('youtu.be') ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={`${
                        ad.videoUrl.includes('watch?v=') 
                          ? ad.videoUrl.replace('watch?v=', 'embed/') 
                          : ad.videoUrl.includes('youtu.be/') 
                            ? ad.videoUrl.replace('youtu.be/', 'youtube.com/embed/') 
                            : ad.videoUrl
                      }?autoplay=1&mute=1&controls=1`}
                      title={ad.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video
                    src={ad.videoUrl}
                    autoPlay
                    muted
                    controls
                    playsInline
                    className="w-full aspect-video object-cover"
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center text-4xl p-4 bg-slate-950 border border-slate-850 rounded-2xl w-16 h-16 mx-auto">
                {ad.icon || '📺'}
              </div>
            )}

            <div className="text-center space-y-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-white">{ad.title}</h3>
              <span className="text-[9.5px] text-orange-400 font-mono uppercase tracking-wider font-bold block">{ad.tagline}</span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans max-w-sm mx-auto mt-2">
                {ad.description}
              </p>
            </div>
          </div>

          {/* Dynamic Action Trigger Button */}
          <div className="border-t border-slate-850 pt-4 space-y-3">
            {!currentUser ? (
              <div className="space-y-3">
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl text-[10.5px] leading-relaxed text-center font-sans">
                  📺 <strong>Guest Sponsor Ad Playback</strong><br />
                  This advertisement will automatically complete and dismiss in <span className="font-bold text-white font-mono">{countdown}s</span>. Create a free account to unlock fully customizable calibrations and remove popup ads!
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToAuth) {
                      onNavigateToAuth();
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-lg shadow-orange-500/10 flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Register Free Account & Remove Ads</span>
                </button>
              </div>
            ) : !isCompleted ? (
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 border border-slate-850 py-3 rounded-2xl w-full">
                <Timer className="w-4 h-4 text-orange-500 animate-spin" />
                <span>Interact for <span className="text-white font-bold">{countdown}s</span> to dismiss...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCompleteAndClose}
                disabled={submittingImpression}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-lg shadow-orange-500/10 flex justify-center items-center gap-1.5 cursor-pointer"
              >
                {submittingImpression ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Crediting Admin Escrow...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Complete Ad & Dismiss</span>
                  </>
                )}
              </button>
            )}

            <div className="text-[9px] text-center text-slate-500 font-sans leading-normal">
              Viewing ad as <span className="text-slate-400">{currentUser?.email || 'Guest Member'}</span>.<br />
              Generated ad royalties are credited directly to authorized Administrator balance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
