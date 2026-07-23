import React, { useState, useEffect } from 'react';
import { 
  Search, X, ShoppingBag, Smartphone, Crosshair, 
  Users, MessageSquare, Sliders, Megaphone, AlertCircle, ArrowRight 
} from 'lucide-react';
import { 
  getMarketplaceProducts, getDevices, getWeapons, 
  getCommunityPosts, getPresets, getSettingsDoc, adminGetAllUsers 
} from '../lib/dbService';
import { MarketplaceProduct, Device, Weapon, CommunityPost, SensitivityProfile, UserProfile } from '../types';
import { EmptyState } from './common/EmptyState';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (category: string, item: any) => void;
}

interface SearchGroupResults {
  marketplace: MarketplaceProduct[];
  devices: Device[];
  weapons: Weapon[];
  users: UserProfile[];
  posts: CommunityPost[];
  presets: SensitivityProfile[];
  announcements: any[];
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchGroupResults>({
    marketplace: [],
    devices: [],
    weapons: [],
    users: [],
    posts: [],
    presets: [],
    announcements: []
  });

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({
        marketplace: [],
        devices: [],
        weapons: [],
        users: [],
        posts: [],
        presets: [],
        announcements: []
      });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const q = query.toLowerCase();

      try {
        const [mList, dList, wList, pList, presetList, newsDoc] = await Promise.all([
          getMarketplaceProducts(),
          getDevices(),
          getWeapons(),
          getCommunityPosts(),
          getPresets(),
          getSettingsDoc('news')
        ]);

        const announcements = Array.isArray(newsDoc?.items) ? newsDoc.items : [];

        // Search logic
        const filteredMarket = mList.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
        const filteredDev = dList.filter(d => d.model?.toLowerCase().includes(q) || d.brand?.toLowerCase().includes(q) || d.os?.toLowerCase().includes(q) || d.ram?.toLowerCase().includes(q));
        const filteredWeap = wList.filter(w => w.name?.toLowerCase().includes(q) || w.category?.toLowerCase().includes(q));
        const filteredPosts = pList.filter(p => p.title?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q) || p.author?.toLowerCase().includes(q));
        const filteredPresets = presetList.filter(pr => pr.name?.toLowerCase().includes(q) || pr.deviceModel?.toLowerCase().includes(q) || pr.deviceBrand?.toLowerCase().includes(q));
        const filteredNews = announcements.filter((n: any) => n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q));

        setResults({
          marketplace: filteredMarket.slice(0, 4),
          devices: filteredDev.slice(0, 4),
          weapons: filteredWeap.slice(0, 4),
          users: [],
          posts: filteredPosts.slice(0, 4),
          presets: filteredPresets.slice(0, 4),
          announcements: filteredNews.slice(0, 4)
        });
      } catch (err) {
        console.warn('Universal search fetch failed safely:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = 
    results.marketplace.length +
    results.devices.length +
    results.weapons.length +
    results.posts.length +
    results.presets.length +
    results.announcements.length;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-16 px-4 pb-6 overflow-y-auto">
      <div className="bg-[#121212] border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-orange-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Universal Search: Marketplace, Devices, Guns, Community, Presets, News..."
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 font-sans outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono rounded-xl transition-colors shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-6">
          {!query.trim() && (
            <div className="py-8 text-center text-slate-500 font-mono text-xs">
              Type at least 2 characters to trigger GhostFire universal index search...
            </div>
          )}

          {query.trim() && loading && (
            <div className="py-12 text-center text-orange-500 font-mono text-xs animate-pulse">
              Querying tactical database nodes...
            </div>
          )}

          {query.trim() && !loading && totalResults === 0 && (
            <EmptyState
              icon={Search}
              title="No Matching Index Found"
              description={`Zero results matched '${query}' across Marketplace, Devices, Weapons, Community, and Sensitivity Presets.`}
            />
          )}

          {query.trim() && !loading && totalResults > 0 && (
            <>
              {/* Marketplace Products */}
              {results.marketplace.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-mono font-extrabold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" /> Marketplace Products
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.marketplace.map(item => (
                      <div
                        key={item.id}
                        onClick={() => { onSelectResult('marketplace', item); onClose(); }}
                        className="p-3 bg-slate-950 border border-slate-900 hover:border-orange-500/40 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div>
                          <span className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors block">{item.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.category} • ${item.price}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Devices */}
              {results.devices.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-mono font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" /> Devices Database
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.devices.map(item => (
                      <div
                        key={item.id}
                        onClick={() => { onSelectResult('devices', item); onClose(); }}
                        className="p-3 bg-slate-950 border border-slate-900 hover:border-cyan-500/40 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div>
                          <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors block">{item.brand} {item.model}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.ram} RAM • {item.refreshRate}Hz</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weapons */}
              {results.weapons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-mono font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5" /> Weapons Arsenal
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.weapons.map(item => (
                      <div
                        key={item.id}
                        onClick={() => { onSelectResult('weapons', item); onClose(); }}
                        className="p-3 bg-slate-950 border border-slate-900 hover:border-amber-500/40 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div>
                          <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors block">{item.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.category} • Dmg: {item.damage}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Presets */}
              {results.presets.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-mono font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> Sensitivity Profiles
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.presets.map(item => (
                      <div
                        key={item.id}
                        onClick={() => { onSelectResult('presets', item); onClose(); }}
                        className="p-3 bg-slate-950 border border-slate-900 hover:border-emerald-500/40 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div>
                          <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors block">{item.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.deviceModel} • Gen: {item.general}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Posts */}
              {results.posts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-mono font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Community Discussions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.posts.map(item => (
                      <div
                        key={item.id}
                        onClick={() => { onSelectResult('posts', item); onClose(); }}
                        className="p-3 bg-slate-950 border border-slate-900 hover:border-purple-500/40 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div>
                          <span className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors block truncate">{item.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">By {item.author}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
