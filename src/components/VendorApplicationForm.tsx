import { firebaseApi } from '../lib/firebaseApi';
import React, { useState } from 'react';
import { 
  Send, 
  X, 
  ShieldAlert, 
  Check, 
  HelpCircle, 
  AlertTriangle,
  Briefcase
} from 'lucide-react';
import { UserProfile } from '../types';

interface VendorApplicationFormProps {
  currentUser: UserProfile | null;
  userEmail: string;
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
}

export default function VendorApplicationForm({ 
  currentUser, 
  userEmail, 
  onClose, 
  onSuccess 
}: VendorApplicationFormProps) {
  const [shopName, setShopName] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [specialization, setSpecialization] = useState('Config Files');
  const [experienceYears, setExperienceYears] = useState(2);
  const [details, setDetails] = useState('');
  
  // Rules Agreement states
  const [agreeRules, setAgreeRules] = useState(false);
  const [agreeNoOffend, setAgreeNoOffend] = useState(false);
  const [agreeFeedback, setAgreeFeedback] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      setError('You must be signed in to submit an application.');
      return;
    }
    if (!shopName.trim() || !telegramHandle.trim() || !details.trim()) {
      setError('All details are required for administrator review.');
      return;
    }
    if (!agreeRules || !agreeNoOffend || !agreeFeedback) {
      setError('You must accept all regulations and rules to apply.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await firebaseApi.request('vendor/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          username: currentUser?.username || userEmail.split('@')[0],
          telegramHandle,
          shopName,
          specialization,
          details,
          experienceYears,
          agreedToRules: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(true);
        if (data.user) {
          onSuccess(data.user);
        }
      } else {
        const errData = await response.json();
        setError(errData.error || 'Server rejected your application.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to digital registration server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 animate-fadeIn max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-600/15 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black uppercase text-white tracking-wider">Application Submitted!</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Your Merchant details have been securely logged in our blockchain database. The Admin will review your profile and assign a custom <span className="font-bold text-orange-400">vendorKey</span> shortly.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-slate-950 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg cursor-pointer"
              >
                Return to Marketplace
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-600/15 border border-orange-500/20 text-orange-400">
                <Briefcase className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-white tracking-widest">GhostCore Merchant Status</h3>
                <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">Submit profile for administrator review</p>
              </div>
            </div>

            {error && (
              <div className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Shop / Channel Name */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Merchant / Shop Name</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Ghost Fire Mods, Omega Layouts"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Telegram Handle */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Telegram Username (Required)</label>
                <input
                  type="text"
                  required
                  value={telegramHandle}
                  onChange={(e) => setTelegramHandle(e.target.value)}
                  placeholder="e.g. @ghostfire_mods"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <p className="text-[8.5px] text-slate-500 leading-none mt-1">This will be shown on listings for customers to make direct inquiries.</p>
              </div>

              {/* Specialization & Experience */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Specialization</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="Config Files">Config Files</option>
                    <option value="HUD Layouts">HUD Layouts</option>
                    <option value="Accounts">FF Accounts</option>
                    <option value="Skins">Rare Skins</option>
                    <option value="Coaching">VIP Coaching</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">FF Experience</label>
                  <select
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="3">3 Years</option>
                    <option value="5">5+ Years</option>
                  </select>
                </div>
              </div>

              {/* Product Listing Details / Bio */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Product Details & Experience Description</label>
                <textarea
                  required
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe what items you plan to list and your experience optimizing Free Fire sensitivity configuration..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                />
              </div>

              {/* REGULATIONS & COMPLIANCE RULES */}
              <div className="p-3 bg-orange-950/15 border border-orange-500/20 rounded-xl space-y-3">
                <span className="text-[8px] font-mono font-bold text-orange-400 uppercase tracking-widest block flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-orange-500" /> Platform Regulations & Code of Conduct
                </span>
                
                <div className="space-y-2 text-[10px] text-slate-300">
                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreeRules}
                      onChange={(e) => setAgreeRules(e.target.checked)}
                      className="mt-0.5 rounded text-orange-500 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                    />
                    <span className="leading-tight group-hover:text-white transition-colors">
                      <strong>Rule 1</strong>: Vendors must follow all terms of service and upload only verified configs or layouts. No malware.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreeNoOffend}
                      onChange={(e) => setAgreeNoOffend(e.target.checked)}
                      className="mt-0.5 rounded text-orange-500 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                    />
                    <span className="leading-tight group-hover:text-white transition-colors">
                      <strong>Rule 2</strong>: Vendors <span className="text-orange-400 font-bold">cannot offend anyone</span>. All communications and listing copy must be professional and non-toxic.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreeFeedback}
                      onChange={(e) => setAgreeFeedback(e.target.checked)}
                      className="mt-0.5 rounded text-orange-500 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                    />
                    <span className="leading-tight group-hover:text-white transition-colors">
                      <strong>Rule 3</strong>: Vendors can post listings and <span className="text-orange-400 font-bold">must display real customer feedback</span> transparently. No fake reviews allowed.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:brightness-110 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-slate-950" /> Apply Now
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
