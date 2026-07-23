import React, { useState, useEffect } from 'react';
import { firebaseApi } from '../lib/firebaseApi';
import { 
  Users, 
  Send, 
  MessageSquare, 
  Sparkles, 
  Bell, 
  Bookmark, 
  ThumbsUp, 
  PlusCircle, 
  Calendar, 
  User,
  ExternalLink,
  ShieldCheck,
  Edit,
  Trash2,
  Upload,
  CornerDownRight,
  Reply,
  MessageCircle,
  Search,
  Trophy,
  RefreshCw,
  Crown,
  Medal
} from 'lucide-react';
import { CommunityPost } from '../types';
import { formatDisplayName, trackMissionProgress } from '../utils';
import CommunityGiveaways from './CommunityGiveaways';

interface CommProps {
  posts: CommunityPost[];
  onAddPost: (post: Partial<CommunityPost>) => Promise<boolean>;
  onEditPost: (postId: string, post: Partial<CommunityPost>) => Promise<boolean>;
  onDeletePost: (postId: string) => Promise<boolean>;
  isAdmin?: boolean;
  userEmail?: string;
  initialSearchQuery?: string;
  onRefreshPosts?: () => void;
}

export default function CommunitySection({ 
  posts, 
  onAddPost, 
  onEditPost, 
  onDeletePost, 
  isAdmin, 
  userEmail,
  initialSearchQuery,
  onRefreshPosts
}: CommProps) {
  const [activeTab, setActiveTab] = useState<'Feed' | 'Updates' | 'Guidelines' | 'Giveaways' | 'Leaderboard'>('Feed');
  
  // Likes trigger
  const [likedPosts, setLikedPosts] = useState<string[]>(['cp3']);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Comment accordions state
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);

  // Leaderboard state
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState('');

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    setLeaderboardError('');
    try {
      const res = await firebaseApi.request('leaderboard');
      if (res.ok) {
        const data = await res.json();
        setLeaderboardData(data);
      } else {
        setLeaderboardError('Unable to update current leaderboard listings.');
      }
    } catch (e) {
      console.error(e);
      setLeaderboardError('Unable to update current leaderboard listings.');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Admin announcement state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Announcement' | 'Update' | 'Guide' | 'Tournament'>('Announcement');
  const [visibility, setVisibility] = useState<'public' | 'registered'>('public');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [image, setImage] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = (id: string) => {
    if (likedPosts.includes(id)) {
      setLikedPosts(prev => prev.filter(pId => pId !== id));
    } else {
      setLikedPosts(prev => [...prev, id]);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const savedUser = localStorage.getItem('ghostfire_user');
      const authorName = savedUser ? JSON.parse(savedUser).displayName || 'Player' : 'Player';
      const authorEmail = savedUser ? JSON.parse(savedUser).email || '' : '';

      const res = await firebaseApi.request(`posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: authorName,
          authorEmail: authorEmail,
          content: commentText.trim(),
          parentId: replyToCommentId || undefined
        })
      });

      if (res.ok) {
        setCommentText('');
        setReplyToCommentId(null);
        if (onRefreshPosts) {
          onRefreshPosts();
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to post comment.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    if (!title || !content) return;

    setLoading(true);
    let ok = false;
    if (editingPostId) {
      ok = await onEditPost(editingPostId, { 
        title, 
        content, 
        category,
        visibility,
        isAnonymous,
        image: image || undefined
      });
      if (ok) {
        setSuccess('Esports bulletin updated successfully!');
        setTitle('');
        setContent('');
        setImage('');
        setEditingPostId(null);
        setVisibility('public');
        setIsAnonymous(false);
      }
    } else {
      let authorName = userEmail ? userEmail.split('@')[0] : 'Guest';
      if (isAnonymous) {
        authorName = 'Anonymous Player';
      } else if (isAdmin) {
        authorName = 'GhostFireAdmin';
      }
      
      const targetCategory = isAdmin ? category : 'Feedback';
      const targetVisibility = isAdmin ? visibility : 'registered';
      
      ok = await onAddPost({ 
        title, 
        content, 
        category: targetCategory, 
        author: authorName,
        authorEmail: userEmail,
        visibility: targetVisibility,
        isAnonymous,
        image: image || undefined
      });
      if (ok) {
        setSuccess(isAdmin ? 'Esports bulletin published successfully!' : 'Feedback & upgrade request submitted directly to Admin successfully!');
        setTitle('');
        setContent('');
        setImage('');
        setVisibility('public');
        setIsAnonymous(false);
      }
    }
    setLoading(false);
  };

  const handleStartEdit = (post: CommunityPost) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setCategory(post.category as any);
    setVisibility(post.visibility || 'public');
    setIsAnonymous(!!post.isAnonymous);
    setImage(post.image || '');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setTitle('');
    setContent('');
    setImage('');
    setCategory('Announcement');
    setVisibility('public');
    setIsAnonymous(false);
    setSuccess('');
  };

  const handleDeletePostClick = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to permanently delete this post?')) {
      await onDeletePost(postId);
      if (editingPostId === postId) {
        handleCancelEdit();
      }
    }
  };

  const filteredPosts = posts.filter(post => {
    if (post.category === 'Feedback' && !isAdmin) return false;
    if (!searchQuery) return true;
    const s = searchQuery.toLowerCase();
    return (
      (post.title || '').toLowerCase().includes(s) ||
      (post.content || '').toLowerCase().includes(s) ||
      (post.category || '').toLowerCase().includes(s) ||
      (post.author || '').toLowerCase().includes(s)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Social Join Links Bento Grid & Announcements - LEFT */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Social Join Launchpad */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 lg:p-6 backdrop-blur-md space-y-5">
          <div>
            <h2 className="text-md font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              GhostFire Hub Social launchpad
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Accelerate your gameplay with community access channels</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Telegram Channel */}
            <a 
              href="https://t.me/ghostfirehub" 
              target="_blank" 
              rel="noreferrer" 
              className="group bg-slate-950 border border-slate-850 hover:border-indigo-500/30 p-4 rounded-2xl transition-all duration-200 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Send className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase">Telegram Channel</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Daily sensi alerts &amp; premium updates</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* Telegram Support DM */}
            <a 
              href="https://t.me/ghostfirehub1" 
              target="_blank" 
              rel="noreferrer" 
              className="group bg-slate-950 border border-slate-850 hover:border-indigo-500/30 p-4 rounded-2xl transition-all duration-200 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase">Telegram Support DM</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Order deliveries &amp; custom HUD help</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* WhatsApp Esports Group */}
            <a 
              href="https://chat.whatsapp.com/Bp5E4LcGy6S4ZoU2Hzt29u" 
              target="_blank" 
              rel="noreferrer" 
              className="group bg-slate-950 border border-slate-850 hover:border-emerald-500/30 p-4 rounded-2xl transition-all duration-200 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase">WhatsApp Esports Group</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Join discussion with 1,500+ active players</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* WhatsApp Official Channel */}
            <a 
              href="https://whatsapp.com/channel/0029Vb7umIEDZ4LgTf3TXN0p" 
              target="_blank" 
              rel="noreferrer" 
              className="group bg-slate-950 border border-slate-850 hover:border-emerald-500/30 p-4 rounded-2xl transition-all duration-200 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase">WhatsApp Sensi Channel</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Weekly custom configurations alerts</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </a>

          </div>
        </div>

        {/* Global/Feed Search input */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-600" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tactical bulletins, tournament logs, guidelines, authors..."
            className="w-full bg-slate-950 border border-slate-850 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors placeholder:text-slate-700"
          />
        </div>

        {/* Content feed category headers */}
        <div className="flex gap-2.5 border-b border-slate-850 pb-2 flex-wrap">
          {['Feed', 'Giveaways', 'Updates', 'Leaderboard', 'Guidelines'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-orange-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Feed Posts */}
        {activeTab === 'Feed' && (
          <div className="space-y-4 animate-fadeIn">
            {filteredPosts.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
                No bulletins match your search criteria. Try a different term or create a new bulletin!
              </div>
            ) : (
              filteredPosts.map(post => {
                const hasLiked = likedPosts.includes(post.id);
                const isPostRegisteredOnly = post.visibility === 'registered';
                const canViewContent = !isPostRegisteredOnly || !!userEmail;

                return (
                  <div 
                    key={post.id} 
                    onClick={isAdmin ? () => handleStartEdit(post) : undefined}
                    className={`bg-slate-900/40 border rounded-3xl p-5 shadow-xl flex flex-col gap-3.5 relative overflow-hidden transition-all duration-200 ${isAdmin ? 'cursor-pointer hover:border-orange-500/40 border-slate-800' : 'border-slate-800'} ${editingPostId === post.id ? 'border-orange-500 bg-orange-500/5' : ''}`}
                  >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-orange-400 uppercase">
                          {post.category}
                        </span>
                        {isPostRegisteredOnly && (
                          <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 uppercase">
                            Registered Users Only
                          </span>
                        )}
                        {post.isAnonymous && (
                          <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-slate-500 uppercase">
                            🕵️ Anonymous Topic
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-white text-xs sm:text-sm mt-1.5 flex items-center gap-1.5">
                        {post.title}
                        {isAdmin && (
                          <span className="text-[8px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                            Click to edit
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{post.timestamp}</span>
                    </div>
                  </div>

                  {canViewContent ? (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                        {post.content}
                      </p>
                      {post.image && (
                        <div className="max-w-md max-h-72 rounded-2xl overflow-hidden border border-slate-850 bg-slate-950/40">
                          <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-full object-cover max-h-72" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col gap-2.5 items-center text-center">
                      <div className="p-2 bg-indigo-500/10 rounded-full text-indigo-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 uppercase">Registered Players Topic</h4>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-normal font-sans">
                          This exclusive topic contains customized gameplay bulletins, layouts, or tournament strategies reserved for registered users. Open or register a free account to view.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-850/60" onClick={(e) => e.stopPropagation()}>
                    <div 
                      className={`flex items-center gap-1 text-[10px] font-mono text-slate-500 ${!post.isAnonymous ? 'hover:text-orange-400 cursor-pointer transition-colors' : ''}`}
                      onClick={() => {
                        if (!post.isAnonymous) {
                          window.location.href = '?share=' + encodeURIComponent(post.author);
                        }
                      }}
                      title={!post.isAnonymous ? "Click to view public profile" : undefined}
                    >
                      <User className="w-3.5 h-3.5 text-slate-600" />
                      <span>By {post.isAnonymous ? 'Anonymous Player' : formatDisplayName(post.author)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {(isAdmin || (userEmail && (post.authorEmail === userEmail || (!post.isAnonymous && post.author === userEmail.split('@')[0])))) && (
                        <div className="flex items-center gap-1.5 border-r border-slate-850 pr-2 mr-1">
                          <button
                            onClick={() => handleStartEdit(post)}
                            title="Edit Bulletin"
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-orange-500 hover:border-orange-500/20 transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeletePostClick(post.id, e)}
                            title="Delete Bulletin"
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-red-500 hover:border-red-500/20 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => handleLike(post.id)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${hasLiked ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                      >
                        <ThumbsUp className="w-3 h-3 fill-current" />
                        <span>{post.likes + (hasLiked ? 1 : 0)} Likes</span>
                      </button>

                      <button
                        onClick={() => {
                          const willExpand = expandedPostId !== post.id;
                          setExpandedPostId(willExpand ? post.id : null);
                          if (willExpand) {
                            const savedUser = localStorage.getItem('ghostfire_user');
                            if (savedUser) {
                              try {
                                const email = JSON.parse(savedUser).email;
                                trackMissionProgress(email, 'read_community');
                              } catch (e) {}
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${expandedPostId === post.id ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Comments ({post.comments?.length || 0})</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments section */}
                  {expandedPostId === post.id && (
                    <div className="mt-4 pt-4 border-t border-slate-850/60 flex flex-col gap-3 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-orange-500" /> Comments & Tactical Responses ({post.comments?.length || 0})
                      </h4>

                      {/* Existing comments */}
                      {(!post.comments || post.comments.length === 0) ? (
                        <p className="text-[10px] text-slate-500 italic px-2">No comments yet. Start the conversation!</p>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="p-3 bg-slate-950/40 rounded-2xl border border-slate-850/40 flex flex-col gap-1.5 text-xs">
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-orange-400 font-bold flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-500" /> {formatDisplayName(comment.author)}
                                </span>
                                <span className="text-slate-500">{comment.timestamp}</span>
                              </div>
                              <p className="text-slate-300 font-sans leading-normal whitespace-pre-wrap">{comment.content}</p>

                              {/* Reply button */}
                              {userEmail && (
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplyToCommentId(comment.id);
                                      setCommentText(`@${formatDisplayName(comment.author)} `);
                                    }}
                                    className="text-[9px] font-bold text-slate-500 hover:text-orange-400 transition-colors flex items-center gap-1"
                                  >
                                    <Reply className="w-3 h-3" /> Reply
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment box */}
                      {userEmail ? (
                        <div className="flex flex-col gap-2 mt-2">
                          {replyToCommentId && (
                            <div className="flex justify-between items-center bg-orange-500/10 border border-orange-500/20 rounded-lg px-2 py-1 text-[10px] text-orange-400">
                              <span>Replying to comment thread...</span>
                              <button onClick={() => setReplyToCommentId(null)} className="text-slate-400 hover:text-slate-200 uppercase font-mono font-bold text-[9px]">Cancel</button>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Add your tactical response..."
                              className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors placeholder:text-slate-700"
                            />
                            <button
                              type="button"
                              disabled={commentLoading}
                              onClick={() => handleAddComment(post.id)}
                              className="px-3 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black uppercase text-[10px] rounded-xl flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 bg-slate-950/20 p-2.5 rounded-xl border border-slate-850/40 text-center">
                          Please register or login to comment on this esports topic.
                        </p>
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}
          </div>
        )}

        {activeTab === 'Giveaways' && (
          <div className="animate-fadeIn">
            <CommunityGiveaways userEmail={userEmail} isAdmin={isAdmin} />
          </div>
        )}

        {activeTab === 'Updates' && (
          <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-6 text-xs text-slate-400 space-y-4 leading-relaxed animate-fadeIn">
            <h3 className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              Latest GhostCore™ Calibration Records
            </h3>
            <ul className="space-y-3 list-disc pl-4 text-slate-300">
              <li><strong>June 2026 calibration update:</strong> Optimized drag vectors for MediaTek Dimensity 9200+ and Qualcomm Snapdragon 8 Gen 3 SoC models.</li>
              <li>Added instant gyroscope offsets matrix to eliminate recoil patterns on 120Hz Apple devices.</li>
              <li>Rebuilt the visual button rendering inside the Custom HUD Builder canvas workspace.</li>
            </ul>
          </div>
        )}

        {activeTab === 'Leaderboard' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-orange-500/10 via-slate-950/20 to-transparent border border-slate-850 rounded-3xl p-5 space-y-3">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-orange-500" />
                    Global Esports Leaderboard
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Real-time ranking of elite tactical players based on cumulative **GhostPoints (GP)**. Complete daily missions and device calibrations to climb the ranks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchLeaderboard}
                  disabled={leaderboardLoading}
                  className="p-2.5 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 rounded-xl transition-all hover:bg-slate-900 cursor-pointer text-xs flex items-center gap-1 font-mono uppercase tracking-wider shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${leaderboardLoading ? 'animate-spin text-orange-500' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-slate-950/40 border border-slate-900/85 rounded-xl text-[9px] text-slate-500 leading-normal">
                <span className="text-orange-500 font-bold font-mono">💡 INFO:</span>
                <span>Claim your GP rewards from completed daily activities in the Dashboard tab to increase your global rank instantly!</span>
              </div>
            </div>

            {leaderboardError && (
              <div className="p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-2xl text-[11px] text-center font-mono">
                {leaderboardError}
              </div>
            )}

            {leaderboardLoading && leaderboardData.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-t-orange-500 border-slate-850 rounded-full animate-spin"></div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Retrieving Global Rankings...</span>
              </div>
            ) : (
              <div className="bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="grid grid-cols-12 px-5 py-3 border-b border-slate-850 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-6">Player / Role</div>
                  <div className="col-span-4 text-right">Score (GP)</div>
                </div>

                <div className="divide-y divide-slate-850/50">
                  {leaderboardData.map((player, index) => {
                    const rank = index + 1;
                    const isSelf = player.email && userEmail && player.email.toLowerCase() === userEmail.toLowerCase();
                    const isPremium = player.isPremium;
                    
                    let rankDisplay: React.ReactNode = <span className="font-mono text-xs font-black text-slate-600 pl-2">{rank}</span>;
                    if (rank === 1) {
                      rankDisplay = (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-extrabold shadow-sm">
                          1
                        </div>
                      );
                    } else if (rank === 2) {
                      rankDisplay = (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/10 border border-slate-400/30 text-slate-300 text-xs font-extrabold shadow-sm">
                          2
                        </div>
                      );
                    } else if (rank === 3) {
                      rankDisplay = (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-700/15 border border-orange-700/30 text-orange-500 text-xs font-extrabold shadow-sm">
                          3
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={player.username + index}
                        onClick={() => {
                          window.location.href = '?share=' + encodeURIComponent(player.username);
                        }}
                        title="Click to view public profile"
                        className={`grid grid-cols-12 px-5 py-3.5 items-center transition-colors cursor-pointer ${
                          isSelf 
                            ? 'bg-orange-500/10 border-l-2 border-l-orange-500' 
                            : 'hover:bg-slate-950/20 hover:bg-slate-900/10'
                        }`}
                      >
                        <div className="col-span-2 flex items-center">
                          {rankDisplay}
                        </div>

                        <div className="col-span-6 flex items-center gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-xs font-extrabold leading-none ${isSelf ? 'text-orange-400' : 'text-slate-200'}`}>
                                {player.username}
                              </span>
                              {isPremium && (
                                <span className="text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded flex items-center gap-0.5">
                                  <Crown className="w-2 h-2" /> VIP
                                </span>
                              )}
                              {isSelf && (
                                <span className="text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-orange-500 text-slate-950 rounded leading-none">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[9.5px] text-slate-500 font-mono block leading-none">
                              {player.role || 'Player'}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-4 text-right flex items-center justify-end gap-1.5">
                          <span className="text-xs font-black text-slate-100 font-mono">
                            {player.ghostPoints.toLocaleString()}
                          </span>
                          <span className="text-[9px] font-bold font-mono text-orange-500 uppercase">GP</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Guidelines' && (
          <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-6 text-xs text-slate-400 space-y-4 leading-relaxed animate-fadeIn">
            <h3 className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              GhostFire Hub Fair-play Guidelines
            </h3>
            <p className="text-slate-300 font-serif italic leading-relaxed">
              "GhostFireHub is an elite hub built for pro-level training, layouts design, and mathematical device calibrations. We do not provide, sell, or allow modified game files like automatic headshot scripts, aimbots, ESP overlays, or any injectables. All recommendations are designed to build better memory muscles through legitimate hardware tuning."
            </p>
          </div>
        )}

      </div>

      {/* Community stats bento sidebar and Announcement maker - RIGHT */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Statistics Card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 backdrop-blur-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hub Statistics</h3>
          
          <div className="space-y-3">
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-500">Active Players Online</span>
              <span className="font-bold text-slate-200 font-mono">1,482</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-500">Saved Sensitivity Profiles</span>
              <span className="font-bold text-orange-400 font-mono">24,192</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-500">Custom HUD Layouts Built</span>
              <span className="font-bold text-amber-500 font-mono">8,913</span>
            </div>
          </div>
        </div>

        {/* Administrator announcement creator */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 backdrop-blur-sm flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-orange-500" /> {isAdmin ? (editingPostId ? 'Edit Esports Post' : 'Publish Esports Post') : 'Submit Admin Feedback & Upgrade Ideas'}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {isAdmin 
                ? (editingPostId ? 'Modify the selected bulletin details' : 'System administrator access to post news & guides') 
                : 'Request features, report bugs, or tell the Admin what you would like upgraded'}
            </p>
          </div>

          {success && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
            
            <div className="space-y-1">
              <label className="text-[9px] font-semibold text-slate-400 uppercase">
                {isAdmin ? 'Post Title' : 'Feedback Title / Subject'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isAdmin ? "e.g. Master the scope slide" : "e.g. Requesting auto-macro sensitivity presets"}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors placeholder:text-slate-700"
              />
            </div>

            {isAdmin && (
              <>
                <div className="grid grid-cols-1 gap-1">
                  <label className="text-[9px] font-semibold text-slate-400 uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="Guide">Guide / Tutorial</option>
                    <option value="Announcement">Global Announcement</option>
                    <option value="Tournament">Esports Tournament</option>
                    <option value="Update">GhostCore Update</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  <label className="text-[9px] font-semibold text-slate-400 uppercase">Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="public">🌍 Public (All Visitors)</option>
                    <option value="registered">🔒 Registered Users Only</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex items-center gap-2 py-2 px-3 bg-slate-950 border border-slate-850 rounded-xl">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-orange-500 accent-orange-500 cursor-pointer"
              />
              <label htmlFor="isAnonymous" className="text-[10px] text-slate-400 select-none cursor-pointer uppercase font-mono">
                🕵️ Submit anonymously to Admin
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-semibold text-slate-400 uppercase">
                {isAdmin ? 'Content' : 'Upgrade Details / Feature Request'}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isAdmin 
                  ? "Publish guide details, tactical setups, or anonymous topics..." 
                  : "Detail what you would like the admin or owner of the website to upgrade, add, or fix on the platform..."}
                className="w-full h-24 bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors resize-none placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-semibold text-slate-400 uppercase">Attach Reference Screenshot (Optional)</label>
              <div className="border border-dashed border-slate-800 bg-slate-950/30 rounded-xl p-3 text-center relative hover:border-orange-500/30 transition-colors">
                <input 
                  type="file" accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-slate-600 mx-auto mb-1 animate-pulse" />
                <p className="text-[9px] text-slate-500 font-mono">CLICK TO UPLOAD PICTURE (Max 2MB)</p>
                {image && image.startsWith('data:') && (
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className="text-[8px] text-emerald-400 font-mono">✓ Image loaded</span>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setImage(''); }}
                      className="text-[8px] bg-red-950/55 text-red-400 border border-red-900 px-1 rounded hover:bg-red-900 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !title || !content}
                className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-orange-500 hover:text-orange-400 font-bold uppercase tracking-wider text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>{loading ? 'Processing...' : (isAdmin ? (editingPostId ? 'Save Changes' : 'Publish to Feed') : 'Submit Feedback')}</span>
              </button>

              {editingPostId && isAdmin && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
