import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  increment, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { 
  UserProfile, 
  Device, 
  Weapon, 
  MarketplaceProduct, 
  CommunityPost, 
  HUDLayout, 
  Giveaway, 
  VendorApplication,
  PostComment
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Format the exact required JSON error message and log to console for diagnostic tooling
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// === Offline Cache Helpers ===
function getCache<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Offline caching skipped:", e);
  }
}

// === Static Fallbacks ===
const SEED_DEVICES: Device[] = [
  { id: "1", brand: "Samsung", model: "Galaxy S24 Ultra", os: "Android 14", ram: "12GB", refreshRate: "120Hz", touchSamplingRate: "240Hz", resolution: "QHD+", screenSize: "6.8\"", gyroscope: true },
  { id: "2", brand: "Apple", model: "iPhone 15 Pro Max", os: "iOS 17", ram: "8GB", refreshRate: "120Hz", touchSamplingRate: "240Hz", resolution: "Super Retina XDR", screenSize: "6.7\"", gyroscope: true },
  { id: "3", brand: "TECNO", model: "Pova 6 Pro", os: "Android 14", ram: "12GB", refreshRate: "120Hz", touchSamplingRate: "480Hz", resolution: "FHD+", screenSize: "6.78\"", gyroscope: true },
  { id: "4", brand: "Infinix", model: "GT 20 Pro", os: "Android 14", ram: "12GB", refreshRate: "144Hz", touchSamplingRate: "360Hz", resolution: "FHD+", screenSize: "6.78\"", gyroscope: true },
  { id: "5", brand: "Xiaomi", model: "Redmi Note 13 Pro+", os: "Android 14", ram: "12GB", refreshRate: "120Hz", touchSamplingRate: "2160Hz", resolution: "1.5K", screenSize: "6.67\"", gyroscope: true }
];

const SEED_WEAPONS: Weapon[] = [
  { id: "w1", name: "MP40", category: "SMG", image: "🔫", baseDamage: 48, rateOfFire: 83, range: 22 },
  { id: "w2", name: "M1014", category: "Shotgun", image: "💥", baseDamage: 94, rateOfFire: 38, range: 10 },
  { id: "w3", name: "AK47", category: "Rifle", image: "🎯", baseDamage: 61, rateOfFire: 56, range: 72 },
  { id: "w4", name: "AWM", category: "Sniper", image: "🔭", baseDamage: 90, rateOfFire: 27, range: 91 },
  { id: "w5", name: "Desert Eagle", category: "Pistol", image: "🦅", baseDamage: 90, rateOfFire: 33, range: 74 },
  { id: "w6", name: "SVD", category: "Sniper", image: "🎯", baseDamage: 89, rateOfFire: 35, range: 80 }
];

const SEED_MARKETPLACE: MarketplaceProduct[] = [
  { id: "p1", name: "GhostCore™ Pro Config File (VIP)", category: "Config Files", price: 4.99, description: "Highly optimized sensitivity configurations for all main processors. Bypasses regular lag spikes.", rating: 4.9, reviewsCount: 184, image: "🔥", featured: true, telegramLink: "ghostfirehub1" },
  { id: "p2", name: "Premium 4-Finger Claw HUD Blueprint", category: "HUD Layouts", price: 2.5, description: "Layout engineered for maximum agility, faster jump-shots, and rapid gloo-wall placement.", rating: 4.8, reviewsCount: 92, image: "🎮", featured: true, telegramLink: "ghostfirehub1" },
  { id: "p3", name: "One-on-One Custom Sensitivity Training", category: "Coaching", price: 15, description: "30-minute coaching session with our Master Tier esports experts to refine your drag shots.", rating: 5, reviewsCount: 41, image: "🎓", featured: false, telegramLink: "ghostfirehub1" }
];

const SEED_POSTS: CommunityPost[] = [
  { id: "cp1", title: "GhostCore™ v4.2 Update Released!", content: "Our updated predictive recommendation formula is now live. We have analyzed tactile performance indexes on the newest 144Hz smartphone models to calibrate even finer drag-shot values.", author: "GhostFireAdmin", category: "Announcement", timestamp: new Date().toISOString().split('T')[0], likes: 240 },
  { id: "cp2", title: "Free Fire Regional Tournament Coming Up!", content: "Get ready for the Summer Clash Series. Assemble your 4-man squad and make sure your sensitivities and HUD buttons are optimized using our builder.", author: "TournamentTeam", category: "Tournament", timestamp: new Date().toISOString().split('T')[0], likes: 182 }
];

const SEED_GIVEAWAYS: Giveaway[] = [
  { id: "g-1", title: "Premium GhostCore™ Sensitivity VIP Key", description: "Participate to win a lifetime license to our elite automated predictive engine with unlimited device profiles.", reward: "Lifetime VIP GhostCore License", endTime: new Date(Date.now() + 86400000 * 3).toISOString(), telegramLink: "ghostfirehub1", participants: [] },
  { id: "g-2", title: "Grandmaster Double Pass Esports Account", description: "A fully calibrated Level 72 heroic division account with multiple legendary weapon skins unlocked.", reward: "Level 72 Grandmaster Account", endTime: new Date(Date.now() + 86400000 * 5).toISOString(), telegramLink: "ghostfirehub1", participants: [] }
];

const SEED_PRESETS = [
  { id: "preset-1", name: "Full Red M1887 Shotgun Calibration", deviceBrand: "Apple", deviceModel: "iPhone 15 Pro Max", general: 125, redDot: 110, scope2x: 95, scope4x: 88, sniper: 45, freeLook: 80, playStyle: "Tapper, Rusher", gameMode: "Clash Squad, Custom Room", description: "Esports-grade shotgun preset optimized for high refresh screens and swift one-tap drags.", status: "published", created_at: new Date().toISOString() },
  { id: "preset-2", name: "No-Recoil MP40/UMP Spray Profile", deviceBrand: "Samsung", deviceModel: "Galaxy S24 Ultra", general: 98, redDot: 115, scope2x: 105, scope4x: 92, sniper: 50, freeLook: 75, playStyle: "Spammer, Tap & Spam Hybrid", gameMode: "CS Ranked, Battle Royale", description: "Specifically calculated to reduce vertical recoil during continuous automatic firing with popular submachine guns.", status: "published", created_at: new Date().toISOString() }
];

// === Deduplicated Warning Logger for Production Cleanliness ===
const loggedWarnings = new Set<string>();

export function logWarningOnce(key: string, message: string, error?: any) {
  if (process.env.NODE_ENV === 'development') {
    if (!loggedWarnings.has(key)) {
      loggedWarnings.add(key);
      console.warn(`[GhostFire Core] ${message}`, error ? (error.message || error) : '');
    }
  }
}

// === Default Global Settings Map ===
export const DEFAULT_SETTINGS = {
  global_theme: { themePrimary: '#f97316', themeSecondary: '#f59e0b' },
  app_config: { appName: 'GhostFireHub 2.0', version: '2.0.0', maxLoginAttempts: 5, maintenanceMode: false },
  maintenance: { active: false, message: 'GhostFireHub is undergoing scheduled tactical server upgrades. Please check back soon.', estimatedEndTime: '' },
  marketplace: { commissionRate: 0.10, minPayoutAmount: 500.00, featuredCommissionRate: 0.15 },
  features: { enableCoaching: true, enableGiveaways: true, enablePresets: true, enableHUDCanvas: true, analyticsReporting: true, maintenanceMode: false },
  ads: { popupInterval: 5, bannerEnabled: true, sponsorName: 'GhostFire Elite Esports', adsList: [] },
  subscriptions: {
    plans: [
      { id: 'bronze', name: 'Bronze', price: 2.99, description: 'Essential sensitivity generation and basic hardware diagnostics', active: true, features: ['Sensitivity Generator', 'Basic Devices DB Access', 'Community Forum Posting'] },
      { id: 'silver', name: 'Silver', price: 4.99, description: 'Custom HUD layout canvas and weapon damage analytics', active: true, features: ['Everything in Bronze', '4-Finger HUD Canvas Editor', 'Weapon Damage Analyzer'] },
      { id: 'gold', name: 'Gold', price: 9.99, description: 'Full GhostCore AI engine access and marketplace vendor listing', active: true, features: ['Everything in Silver', 'GhostCore™ AI Recommendation Engine', 'Vendor Marketplace Privilege'] },
      { id: 'diamond', name: 'Diamond', price: 19.99, description: 'Unlimited preset cloud saves and zero popup advertisements', active: true, features: ['Everything in Gold', 'Unlimited Preset Saving', 'Zero Popup Ads'] },
      { id: 'platinum', name: 'Platinum', price: 29.99, description: 'Apex flagship tier with direct developer support and master badge', active: true, features: ['Everything in Diamond', 'Direct Developer Access', 'Featured Vendor Priority', 'Apex Master Badge'] }
    ]
  },
  payment_methods: {
    bank_transfer: {
      enabled: true,
      bankName: 'First Bank of Nigeria',
      accountName: 'GhostFire Esports Enterprise',
      accountNumber: '3098765432',
      instructions: 'Transfer exact fee to the account above. Send transaction receipt to Admin on Telegram for instant activation.'
    },
    crypto_wallet: {
      enabled: true,
      walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      network: 'USDT (TRC-20 / BEP-20)',
      qrImage: '',
      instructions: 'Send USDT to the address above and forward TX Hash to Telegram support.'
    },
    telegram: {
      enabled: true,
      telegramUrl: 'https://t.me/ghostfirehub1',
      buttonLabel: 'Contact Admin'
    }
  }
};

// === Client Startup Settings Pre-fetch (Read-Only) ===
export async function initializeSettings() {
  const keys = Object.keys(DEFAULT_SETTINGS) as Array<keyof typeof DEFAULT_SETTINGS>;
  for (const k of keys) {
    try {
      await getSettingsDoc(k);
    } catch (e) {
      logWarningOnce(`init_read_${k}`, `Client prefetch safely skipped for settings/${k}`);
    }
  }
}

// === Super Admin Dedicated Platform Initialization Tool (PART 3) ===
export async function initializePlatformSettings(adminEmail?: string): Promise<{
  success: boolean;
  createdKeys: string[];
  existingKeys: string[];
  error?: string;
}> {
  const isSuperAdmin = 
    adminEmail === 'ghostfirehub@gmail.com' || 
    adminEmail === 'ghostfire@ghost.com' || 
    auth.currentUser?.email === 'ghostfirehub@gmail.com' || 
    auth.currentUser?.email === 'ghostfire@ghost.com';

  if (!isSuperAdmin) {
    return {
      success: false,
      createdKeys: [],
      existingKeys: [],
      error: 'Permission denied: Only Super Admin may initialize platform settings documents.'
    };
  }

  const createdKeys: string[] = [];
  const existingKeys: string[] = [];
  const keys = Object.keys(DEFAULT_SETTINGS) as Array<keyof typeof DEFAULT_SETTINGS>;

  for (const k of keys) {
    try {
      const snap = await getDoc(doc(db, 'settings', k));
      if (!snap.exists()) {
        await setDoc(doc(db, 'settings', k), DEFAULT_SETTINGS[k]);
        setCache(`settings_${k}`, DEFAULT_SETTINGS[k]);
        createdKeys.push(k);
      } else {
        existingKeys.push(k);
      }
    } catch (e: any) {
      logWarningOnce(`init_admin_write_${k}`, `Failed writing settings/${k} during platform init:`, e);
      return {
        success: false,
        createdKeys,
        existingKeys,
        error: `Error creating settings/${k}: ${e?.message || e}`
      };
    }
  }

  return { success: true, createdKeys, existingKeys };
}

// General Safe Settings fetcher
export async function getSettingsDoc(configPath: string): Promise<any> {
  const path = `settings/${configPath}`;
  try {
    const snap = await getDoc(doc(db, 'settings', configPath));
    if (snap.exists()) {
      const data = snap.data();
      setCache(`settings_${configPath}`, data);
      return data;
    }
    return DEFAULT_SETTINGS[configPath as keyof typeof DEFAULT_SETTINGS] || {};
  } catch (error) {
    logWarningOnce(`settings_read_${configPath}`, `Could not read settings/${configPath}, using default configuration safely:`, error);
    return getCache(`settings_${configPath}`, DEFAULT_SETTINGS[configPath as keyof typeof DEFAULT_SETTINGS] || {});
  }
}

// Generalized Settings updater for Admin configurations
export async function updateSettingsDoc(configPath: string, data: any): Promise<boolean> {
  try {
    await setDoc(doc(db, 'settings', configPath), data);
    setCache(`settings_${configPath}`, data);
    return true;
  } catch (error) {
    logWarningOnce(`settings_update_${configPath}`, `Could not update settings/${configPath}:`, error);
    return false;
  }
}

// === User Profile Services ===
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      const u = docSnap.data() as UserProfile;
      setCache(`cached_user_${uid}`, u);
      return u;
    }
    return null;
  } catch (error) {
    console.warn(`Error reading user profile for ${uid}, fetching from offline cache:`, error);
    return getCache<UserProfile | null>(`cached_user_${uid}`, null);
  }
}

export async function createUserProfile(uid: string, profile: Partial<UserProfile>): Promise<UserProfile> {
  const path = `users/${uid}`;
  try {
    const newUserCode = 'GHOST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const defaultProfile: UserProfile = {
      email: profile.email || '',
      username: profile.username || 'GhostUser',
      favoriteWeapons: ['M1014'],
      favoriteDevices: [],
      referralCount: 0,
      isPremium: false,
      isBanned: false,
      referralCode: newUserCode,
      ghostPoints: 100,
      savedRecommendations: [],
      country: profile.country || 'Nigeria',
      earningsBalance: 3500.00,
      withdrawnTotal: 0,
      touchVectorsLogged: 0,
      withdrawalRequests: [],
      sharesCount: 0,
      completedMissions: [],
      claimedMissions: [],
      missionProgress: {},
      themePrimary: '#f97316',
      themeSecondary: '#f59e0b',
      role: (profile.email === 'ghostfirehub@gmail.com' || profile.email === 'ghostfire@ghost.com') ? 'Administrator' : 'Gamer',
      ...profile
    };
    await setDoc(doc(db, 'users', uid), defaultProfile);
    setCache(`cached_user_${uid}`, defaultProfile);
    return defaultProfile;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // Return local default so we don't crash
    }
    const defaultProfile: UserProfile = {
      email: profile.email || '',
      username: profile.username || 'GhostUser',
      favoriteWeapons: ['M1014'],
      favoriteDevices: [],
      referralCount: 0,
      isPremium: false,
      isBanned: false,
      referralCode: 'GHOST-LOCAL',
      ghostPoints: 100,
      savedRecommendations: [],
      country: profile.country || 'Nigeria',
      earningsBalance: 3500.00,
      withdrawnTotal: 0,
      touchVectorsLogged: 0,
      withdrawalRequests: [],
      sharesCount: 0,
      completedMissions: [],
      claimedMissions: [],
      missionProgress: {},
      themePrimary: '#f97316',
      themeSecondary: '#f59e0b',
      role: 'Gamer',
      ...profile
    } as UserProfile;
    return defaultProfile;
  }
}

export function isPermissionError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes('permission') ||
    msg.includes('Permission') ||
    msg.includes('PERMISSION_DENIED') ||
    msg.includes('insufficient') ||
    msg.includes('Missing or insufficient')
  );
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
  let targetUid = uid;
  if ((!targetUid || targetUid.includes('@')) && auth.currentUser?.uid) {
    targetUid = auth.currentUser.uid;
  }
  const path = `users/${targetUid}`;
  try {
    const userRef = doc(db, 'users', targetUid);
    await setDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    const updatedSnap = await getDoc(userRef);
    const updated = updatedSnap.data() as UserProfile;
    setCache(`cached_user_${targetUid}`, updated);
    return updated;
  } catch (error) {
    if (isPermissionError(error)) {
      console.error(`Permission error updating user profile at ${path}:`, error);
      try {
        handleFirestoreError(error, OperationType.UPDATE, path);
      } catch {
        // Re-throw or handle as permission error
      }
    }
    console.warn(`Offline fallback for user ${targetUid}:`, error);
    const existing = getCache<UserProfile | null>(`cached_user_${targetUid}`, null);
    const updated = { ...existing, ...data } as UserProfile;
    setCache(`cached_user_${targetUid}`, updated);
    return updated;
  }
}

// === Devices Services ===
export async function getDevices(): Promise<Device[]> {
  const path = 'devices';
  try {
    const snap = await getDocs(collection(db, 'devices'));
    const list = snap.docs.map(doc => doc.data() as Device);
    setCache('cached_devices', list);
    return list;
  } catch (error) {
    console.warn("getDevices failed, returning cached devices:", error);
    return getCache<Device[]>('cached_devices', SEED_DEVICES);
  }
}

export async function addDevice(device: Partial<Device>): Promise<Device> {
  const path = 'devices';
  try {
    const id = device.id || doc(collection(db, 'devices')).id;
    const finalDevice = { ...device, id } as Device;
    await setDoc(doc(db, 'devices', id), finalDevice);
    return finalDevice;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {}
    return device as Device;
  }
}

export async function deleteDevice(deviceId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'devices', deviceId));
    return true;
  } catch (error) {
    console.warn("deleteDevice failed:", error);
    return false;
  }
}

// === Weapons Services ===
export async function getWeapons(): Promise<Weapon[]> {
  const path = 'weapons';
  try {
    const snap = await getDocs(collection(db, 'weapons'));
    const list = snap.docs.map(doc => doc.data() as Weapon);
    setCache('cached_weapons', list);
    return list;
  } catch (error) {
    console.warn("getWeapons failed, returning cached weapons:", error);
    return getCache<Weapon[]>('cached_weapons', SEED_WEAPONS);
  }
}

export async function syncWeapons(weapons: Weapon[]): Promise<boolean> {
  const path = 'weapons';
  try {
    for (const w of weapons) {
      await setDoc(doc(db, 'weapons', w.id), w);
    }
    return true;
  } catch (error) {
    console.warn("syncWeapons failed:", error);
    return false;
  }
}

export async function addWeapon(weapon: Partial<Weapon>): Promise<Weapon> {
  const id = weapon.id || doc(collection(db, 'weapons')).id;
  const finalWeapon = { ...weapon, id } as Weapon;
  await setDoc(doc(db, 'weapons', id), finalWeapon);
  return finalWeapon;
}

export async function deleteWeapon(weaponId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'weapons', weaponId));
    return true;
  } catch (error) {
    console.warn("deleteWeapon failed:", error);
    return false;
  }
}

// === Marketplace Services ===
export async function getMarketplaceProducts(): Promise<MarketplaceProduct[]> {
  const path = 'marketplace';
  try {
    const snap = await getDocs(collection(db, 'marketplace'));
    const list = snap.docs.map(doc => doc.data() as MarketplaceProduct);
    setCache('cached_marketplace', list);
    return list;
  } catch (error) {
    console.warn("getMarketplaceProducts failed, loading cache:", error);
    return getCache<MarketplaceProduct[]>('cached_marketplace', SEED_MARKETPLACE);
  }
}

export async function addMarketplaceProduct(prod: Partial<MarketplaceProduct>): Promise<MarketplaceProduct> {
  const path = 'marketplace';
  try {
    const id = prod.id || doc(collection(db, 'marketplace')).id;
    const finalProd = { 
      id, 
      rating: 5.0, 
      reviewsCount: 1, 
      ...prod 
    } as MarketplaceProduct;
    await setDoc(doc(db, 'marketplace', id), finalProd);
    return finalProd;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {}
    return prod as MarketplaceProduct;
  }
}

export async function editMarketplaceProduct(id: string, prod: Partial<MarketplaceProduct>): Promise<MarketplaceProduct> {
  const path = `marketplace/${id}`;
  try {
    const ref = doc(db, 'marketplace', id);
    await updateDoc(ref, prod);
    const snap = await getDoc(ref);
    return snap.data() as MarketplaceProduct;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {}
    return prod as MarketplaceProduct;
  }
}

export async function deleteMarketplaceProduct(id: string): Promise<boolean> {
  const path = `marketplace/${id}`;
  try {
    await deleteDoc(doc(db, 'marketplace', id));
    return true;
  } catch (error) {
    console.warn("deleteMarketplaceProduct failed:", error);
    return false;
  }
}

// === Community Posts & Comments ===
export async function getCommunityPosts(): Promise<CommunityPost[]> {
  const path = 'communityPosts';
  try {
    const snap = await getDocs(collection(db, 'communityPosts'));
    const posts = snap.docs.map(doc => doc.data() as CommunityPost);
    const sorted = posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setCache('cached_posts', sorted);
    return sorted;
  } catch (error) {
    console.warn("getCommunityPosts failed, loading cache:", error);
    return getCache<CommunityPost[]>('cached_posts', SEED_POSTS);
  }
}

export async function addCommunityPost(post: Partial<CommunityPost>): Promise<CommunityPost> {
  const path = 'communityPosts';
  try {
    const id = post.id || doc(collection(db, 'communityPosts')).id;
    const finalPost = {
      id,
      title: post.title || 'Untitled Post',
      content: post.content || '',
      author: post.author || 'Anonymous Gamer',
      category: post.category || 'Guide',
      timestamp: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: [],
      ...post
    } as CommunityPost;
    await setDoc(doc(db, 'communityPosts', id), finalPost);
    return finalPost;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {}
    return post as CommunityPost;
  }
}

export async function editCommunityPost(id: string, post: Partial<CommunityPost>): Promise<CommunityPost> {
  const path = `communityPosts/${id}`;
  try {
    const ref = doc(db, 'communityPosts', id);
    await updateDoc(ref, post);
    const snap = await getDoc(ref);
    return snap.data() as CommunityPost;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {}
    return post as CommunityPost;
  }
}

export async function deleteCommunityPost(id: string): Promise<boolean> {
  const path = `communityPosts/${id}`;
  try {
    await deleteDoc(doc(db, 'communityPosts', id));
    return true;
  } catch (error) {
    console.warn("deleteCommunityPost failed:", error);
    return false;
  }
}

export async function addPostComment(postId: string, comment: Partial<PostComment>): Promise<CommunityPost> {
  const path = `communityPosts/${postId}`;
  try {
    const ref = doc(db, 'communityPosts', postId);
    const newComment = {
      id: comment.id || 'comment-' + Date.now(),
      author: comment.author || 'Anonymous',
      authorEmail: comment.authorEmail || '',
      content: comment.content || '',
      timestamp: new Date().toISOString()
    } as PostComment;
    
    await updateDoc(ref, {
      comments: arrayUnion(newComment)
    });
    
    const snap = await getDoc(ref);
    return snap.data() as CommunityPost;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {}
    return {} as CommunityPost;
  }
}

export async function likePost(postId: string): Promise<CommunityPost> {
  const path = `communityPosts/${postId}`;
  try {
    const ref = doc(db, 'communityPosts', postId);
    await updateDoc(ref, {
      likes: increment(1)
    });
    const snap = await getDoc(ref);
    return snap.data() as CommunityPost;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {}
    return {} as CommunityPost;
  }
}

// === HUD Layouts Services ===
export async function getHUDLayouts(userEmail: string): Promise<HUDLayout[]> {
  const cleanId = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
  const path = `hudLayouts/${cleanId}`;
  try {
    const snap = await getDoc(doc(db, 'hudLayouts', cleanId));
    if (snap.exists() && snap.data().layouts) {
      const list = snap.data().layouts as HUDLayout[];
      setCache(`cached_hud_layouts_${cleanId}`, list);
      return list;
    }
    return [];
  } catch (error) {
    console.warn("getHUDLayouts failed, reading cache:", error);
    return getCache<HUDLayout[]>(`cached_hud_layouts_${cleanId}`, []);
  }
}

export async function saveHUDLayout(userEmail: string, layout: Partial<HUDLayout>): Promise<HUDLayout[]> {
  const cleanId = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
  const path = `hudLayouts/${cleanId}`;
  try {
    const docRef = doc(db, 'hudLayouts', cleanId);
    const existingSnap = await getDoc(docRef);
    let layoutsList: HUDLayout[] = [];
    if (existingSnap.exists() && existingSnap.data().layouts) {
      layoutsList = existingSnap.data().layouts as HUDLayout[];
    }

    const layoutId = layout.id || 'hud-' + Date.now();
    const finalLayout = {
      id: layoutId,
      name: layout.name || 'My Configured HUD',
      orientation: layout.orientation || 'landscape',
      buttons: layout.buttons || [],
      created_at: new Date().toISOString()
    } as HUDLayout;

    const index = layoutsList.findIndex(l => l.id === layoutId);
    if (index >= 0) {
      layoutsList[index] = finalLayout;
    } else {
      layoutsList.unshift(finalLayout);
    }

    await setDoc(docRef, { layouts: layoutsList });
    setCache(`cached_hud_layouts_${cleanId}`, layoutsList);
    return layoutsList;
  } catch (error) {
    console.warn("saveHUDLayout failed, saving to cache:", error);
    const layoutsList = getCache<HUDLayout[]>(`cached_hud_layouts_${cleanId}`, []);
    const layoutId = layout.id || 'hud-' + Date.now();
    const finalLayout = {
      id: layoutId,
      name: layout.name || 'My Configured HUD',
      orientation: layout.orientation || 'landscape',
      buttons: layout.buttons || [],
      created_at: new Date().toISOString()
    } as HUDLayout;

    const index = layoutsList.findIndex(l => l.id === layoutId);
    if (index >= 0) {
      layoutsList[index] = finalLayout;
    } else {
      layoutsList.unshift(finalLayout);
    }
    setCache(`cached_hud_layouts_${cleanId}`, layoutsList);
    return layoutsList;
  }
}

export async function deleteHUDLayout(userEmail: string, layoutId: string): Promise<HUDLayout[]> {
  const cleanId = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
  const path = `hudLayouts/${cleanId}`;
  try {
    const docRef = doc(db, 'hudLayouts', cleanId);
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists() && existingSnap.data().layouts) {
      const layoutsList = (existingSnap.data().layouts as HUDLayout[]).filter(l => l.id !== layoutId);
      await setDoc(docRef, { layouts: layoutsList });
      setCache(`cached_hud_layouts_${cleanId}`, layoutsList);
      return layoutsList;
    }
    return [];
  } catch (error) {
    console.warn("deleteHUDLayout failed, editing cache:", error);
    const layoutsList = getCache<HUDLayout[]>(`cached_hud_layouts_${cleanId}`, []).filter(l => l.id !== layoutId);
    setCache(`cached_hud_layouts_${cleanId}`, layoutsList);
    return layoutsList;
  }
}

// === Giveaways Services ===
export async function getGiveaways(): Promise<Giveaway[]> {
  const path = 'giveaways';
  try {
    const snap = await getDocs(collection(db, 'giveaways'));
    const list = snap.docs.map(doc => doc.data() as Giveaway);
    setCache('cached_giveaways', list);
    return list;
  } catch (error) {
    console.warn("getGiveaways failed, returning cache:", error);
    return getCache<Giveaway[]>('cached_giveaways', SEED_GIVEAWAYS);
  }
}

export async function joinGiveaway(id: string, userEmail: string): Promise<Giveaway> {
  const path = `giveaways/${id}`;
  try {
    const ref = doc(db, 'giveaways', id);
    await updateDoc(ref, {
      participants: arrayUnion(userEmail)
    });
    const snap = await getDoc(ref);
    return snap.data() as Giveaway;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {}
    return {} as Giveaway;
  }
}

export async function addGiveaway(g: Partial<Giveaway>): Promise<Giveaway> {
  const path = 'giveaways';
  try {
    const id = g.id || 'g-' + Date.now();
    const finalG = {
      id,
      title: g.title || 'Special Giveaway',
      description: g.description || '',
      reward: g.reward || 'Free Calibration Code',
      endTime: g.endTime || new Date(Date.now() + 86400000).toISOString(),
      telegramLink: g.telegramLink || 'ghostfirehub1',
      participants: [],
      winner: null
    } as Giveaway;
    await setDoc(doc(db, 'giveaways', id), finalG);
    return finalG;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {}
    return g as Giveaway;
  }
}

export async function updateGiveaway(id: string, data: Partial<Giveaway>): Promise<Giveaway> {
  const path = `giveaways/${id}`;
  try {
    const ref = doc(db, 'giveaways', id);
    await updateDoc(ref, data);
    const snap = await getDoc(ref);
    return snap.data() as Giveaway;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {}
    return data as Giveaway;
  }
}

// === Daily Streak / Claim Mission / Referral Services ===
export async function claimDailyStreak(uid: string): Promise<UserProfile> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      throw new Error("User does not exist");
    }
    const user = snap.data() as UserProfile;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const prevPoints = user.ghostPoints || 0;
    const prevStreak = user.loginStreak || 0;
    
    const nextPoints = prevPoints + 50; 
    const nextStreak = prevStreak + 1;

    await updateDoc(userRef, {
      ghostPoints: nextPoints,
      loginStreak: nextStreak,
      lastClaimedDailyRewardDate: todayStr,
      updatedAt: serverTimestamp()
    });

    const updatedSnap = await getDoc(userRef);
    const updated = updatedSnap.data() as UserProfile;
    setCache(`cached_user_${uid}`, updated);
    return updated;
  } catch (error) {
    console.warn("claimDailyStreak failed, executing locally on cache:", error);
    const user = getCache<UserProfile>(`cached_user_${uid}`, {} as UserProfile);
    user.ghostPoints = (user.ghostPoints || 0) + 50;
    user.loginStreak = (user.loginStreak || 0) + 1;
    user.lastClaimedDailyRewardDate = new Date().toISOString().split('T')[0];
    setCache(`cached_user_${uid}`, user);
    return user;
  }
}

export async function claimMission(uid: string, missionId: string): Promise<UserProfile> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      throw new Error("User does not exist");
    }
    const user = snap.data() as UserProfile;
    const prevPoints = user.ghostPoints || 0;
    const prevClaimed = user.claimedMissions || [];
    
    if (prevClaimed.includes(missionId)) {
      return user; 
    }

    await updateDoc(userRef, {
      ghostPoints: prevPoints + 15, 
      claimedMissions: arrayUnion(missionId),
      updatedAt: serverTimestamp()
    });

    const updatedSnap = await getDoc(userRef);
    const updated = updatedSnap.data() as UserProfile;
    setCache(`cached_user_${uid}`, updated);
    return updated;
  } catch (error) {
    console.warn("claimMission failed, executing locally on cache:", error);
    const user = getCache<UserProfile>(`cached_user_${uid}`, {} as UserProfile);
    const prevClaimed = user.claimedMissions || [];
    if (!prevClaimed.includes(missionId)) {
      user.ghostPoints = (user.ghostPoints || 0) + 15;
      user.claimedMissions = [...prevClaimed, missionId];
      setCache(`cached_user_${uid}`, user);
    }
    return user;
  }
}

export async function incrementMissionProgress(uid: string, missionId: string): Promise<UserProfile> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      throw new Error("User profile not found");
    }
    
    const user = snap.data() as UserProfile;
    const progressMap = user.missionProgress || {};
    const currentProg = progressMap[missionId] || 0;
    
    const updatedProgress = {
      ...progressMap,
      [missionId]: currentProg + 1
    };
    
    const completedList = user.completedMissions || [];
    let nextCompleted = [...completedList];
    
    const target = 1; 
    if (currentProg + 1 >= target && !completedList.includes(missionId)) {
      nextCompleted.push(missionId);
    }

    await updateDoc(userRef, {
      missionProgress: updatedProgress,
      completedMissions: nextCompleted,
      updatedAt: serverTimestamp()
    });

    const updatedSnap = await getDoc(userRef);
    const updated = updatedSnap.data() as UserProfile;
    setCache(`cached_user_${uid}`, updated);
    return updated;
  } catch (error) {
    console.warn("incrementMissionProgress failed, executing locally on cache:", error);
    const user = getCache<UserProfile>(`cached_user_${uid}`, {} as UserProfile);
    const progressMap = user.missionProgress || {};
    const currentProg = progressMap[missionId] || 0;
    const updatedProgress = {
      ...progressMap,
      [missionId]: currentProg + 1
    };
    const completedList = user.completedMissions || [];
    let nextCompleted = [...completedList];
    if (currentProg + 1 >= 1 && !completedList.includes(missionId)) {
      nextCompleted.push(missionId);
    }
    user.missionProgress = updatedProgress;
    user.completedMissions = nextCompleted;
    setCache(`cached_user_${uid}`, user);
    return user;
  }
}

// === Notifications Services ===
export async function getNotifications(userEmail?: string): Promise<Notification[]> {
  const path = 'notifications';
  try {
    const snap = await getDocs(collection(db, 'notifications'));
    const all = snap.docs.map(doc => doc.data() as any);
    const filtered = all.filter((n: any) => 
      !n.targetEmail || 
      (userEmail && n.targetEmail.toLowerCase() === userEmail.toLowerCase())
    );
    const sorted = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) as Notification[];
    setCache('cached_notifications', sorted);
    return sorted;
  } catch (error) {
    console.warn("getNotifications failed, loading cache:", error);
    return getCache<Notification[]>('cached_notifications', []);
  }
}

export async function addNotification(title: string, message: string, type: string = 'info', targetEmail: string | null = null) {
  const path = 'notifications';
  try {
    const id = 'notif-' + Date.now();
    await setDoc(doc(db, 'notifications', id), {
      id,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      targetEmail
    });
  } catch (error) {
    console.warn("addNotification failed:", error);
  }
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const path = `notifications/${id}`;
  try {
    await updateDoc(doc(db, 'notifications', id), {
      read: true
    });
    return true;
  } catch (error) {
    console.warn("markNotificationRead failed:", error);
    return false;
  }
}

// === Presets, Sensitivity Recommendations & Theme Services ===
export async function getPresets(): Promise<any[]> {
  const path = 'presets';
  try {
    const snap = await getDocs(collection(db, 'presets'));
    const list = snap.docs.map(doc => doc.data());
    setCache('cached_presets', list);
    return list;
  } catch (error) {
    console.warn("getPresets failed, loading cache:", error);
    return getCache<any[]>('cached_presets', SEED_PRESETS);
  }
}

export async function savePreset(preset: any): Promise<any> {
  const path = 'presets';
  try {
    const id = preset.id || 'preset-' + Date.now();
    const finalPr = { ...preset, id, created_at: new Date().toISOString() };
    await setDoc(doc(db, 'presets', id), finalPr);
    return finalPr;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {}
    return preset;
  }
}

export async function getGlobalTheme(): Promise<{ themePrimary: string, themeSecondary: string }> {
  return getSettingsDoc('global_theme');
}

export async function updateGlobalTheme(themePrimary: string, themeSecondary: string): Promise<boolean> {
  const path = 'settings/global_theme';
  try {
    await setDoc(doc(db, 'settings', 'global_theme'), { themePrimary, themeSecondary });
    setCache('settings_global_theme', { themePrimary, themeSecondary });
    return true;
  } catch (error) {
    console.warn("updateGlobalTheme failed:", error);
    return false;
  }
}

// === Leaderboard & Vendor Token Services ===
export async function getLeaderboard(): Promise<any[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, 'users'));
    const allUsers = snap.docs.map(d => d.data() as UserProfile);
    const sorted = allUsers
      .map(u => ({
        username: u.username || 'TacticalGamer',
        country: u.country || 'Nigeria',
        referralCount: u.referralCount || 0,
        ghostPoints: u.ghostPoints || 0,
        isPremium: u.isPremium || false
      }))
      .sort((a, b) => b.referralCount - a.referralCount);
    setCache('cached_leaderboard', sorted);
    return sorted;
  } catch (error) {
    console.warn("getLeaderboard failed, returning cache:", error);
    return getCache<any[]>('cached_leaderboard', []);
  }
}

export async function activateVendorToken(uid: string, token: string): Promise<{ success: boolean, message?: string, user?: UserProfile }> {
  const path = `vendorTokens/${token}`;
  try {
    const tokenRef = doc(db, 'vendorTokens', token);
    const tokenSnap = await getDoc(tokenRef);
    
    if (!tokenSnap.exists()) {
      return { success: false, message: "Invalid activation token. Please verify or contact support." };
    }

    const tokenData = tokenSnap.data();
    if (tokenData.used) {
      return { success: false, message: "This key has already been consumed by another merchant." };
    }

    await updateDoc(tokenRef, {
      used: true,
      usedBy: uid,
      usedAt: new Date().toISOString()
    });

    const updatedUser = await updateUserProfile(uid, {
      isVendor: true,
      vendorKey: token,
      vendorStatus: 'active'
    } as any);

    return { success: true, user: updatedUser };
  } catch (error) {
    console.warn("activateVendorToken failed:", error);
    return { success: false, message: "Server communication failed. Please try again." };
  }
}

export async function generateVendorToken(createdBy: string): Promise<any> {
  const path = 'vendorTokens';
  try {
    const token = 'KEY-MKT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    await setDoc(doc(db, 'vendorTokens', token), {
      token,
      used: false,
      createdBy,
      createdAt: new Date().toISOString()
    });
    return { token, success: true };
  } catch (error) {
    console.warn("generateVendorToken failed:", error);
    return { success: false };
  }
}

export async function getVendorTokens(): Promise<any[]> {
  const path = 'vendorTokens';
  try {
    const snap = await getDocs(collection(db, 'vendorTokens'));
    return snap.docs.map(doc => doc.data());
  } catch (error) {
    console.warn("getVendorTokens failed:", error);
    return [];
  }
}

export async function applyVendor(uid: string, app: Partial<VendorApplication>): Promise<VendorApplication> {
  const path = `vendorApplications/${uid}`;
  try {
    const id = uid; 
    const finalApp = {
      id,
      status: 'Pending',
      appliedAt: new Date().toISOString(),
      ...app
    } as VendorApplication;
    
    await setDoc(doc(db, 'vendorApplications', id), finalApp);
    
    await updateUserProfile(uid, {
      vendorRequested: true,
      vendorStatus: 'pending'
    } as any);

    return finalApp;
  } catch (error) {
    console.warn("applyVendor failed:", error);
    return app as VendorApplication;
  }
}

export async function getVendorApplications(): Promise<VendorApplication[]> {
  const path = 'vendorApplications';
  try {
    const snap = await getDocs(collection(db, 'vendorApplications'));
    return snap.docs.map(doc => doc.data() as VendorApplication);
  } catch (error) {
    console.warn("getVendorApplications failed:", error);
    return [];
  }
}

export async function approveVendorApplication(id: string): Promise<boolean> {
  const path = `vendorApplications/${id}`;
  try {
    const appRef = doc(db, 'vendorApplications', id);
    const token = 'KEY-MKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await updateDoc(appRef, {
      status: 'Approved',
      vendorKey: token
    });

    await setDoc(doc(db, 'vendorTokens', token), {
      token,
      used: false,
      createdBy: 'ghostfirehub@gmail.com',
      createdAt: new Date().toISOString()
    });

    await addNotification(
      'Vendor Application Approved!',
      `Congratulations! Your application has been approved. Activation Token: ${token}`,
      'info',
      id 
    );

    return true;
  } catch (error) {
    console.warn("approveVendorApplication failed:", error);
    return false;
  }
}

// === Support Issues, Ads & Payouts ===
export async function submitIssue(userEmail: string, content: string): Promise<any> {
  const path = 'feedback';
  try {
    const id = 'issue-' + Date.now();
    const payload = {
      id,
      email: userEmail,
      details: content,
      status: 'Open',
      timestamp: new Date().toISOString(),
      analysis: 'Pending automated diagnostic triage.'
    };
    await setDoc(doc(db, 'feedback', id), payload);
    return payload;
  } catch (error) {
    console.warn("submitIssue failed:", error);
    return {};
  }
}

export async function getIssues(): Promise<any[]> {
  const path = 'feedback';
  try {
    const snap = await getDocs(collection(db, 'feedback'));
    return snap.docs.map(doc => doc.data());
  } catch (error) {
    console.warn("getIssues failed:", error);
    return [];
  }
}

export async function analyzeIssueInFirestore(issueId: string): Promise<any> {
  const path = `feedback/${issueId}`;
  try {
    const ref = doc(db, 'feedback', issueId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    
    const data = snap.data();
    const details = data.details || '';
    
    let analysis = 'Diagnostic Complete: Tactile latency patterns appear consistent. Recommend 4-finger claw re-orientation and lowering scope General Sensi value by 5 points.';
    if (details.toLowerCase().includes('recoil') || details.toLowerCase().includes('shake')) {
      analysis = 'Diagnostic Alert: High vertical muzzle drift detected. Resolution: Increase general drag rate coefficient by +10 and activate standard Android Touch Smoothness overlays.';
    } else if (details.toLowerCase().includes('lag') || details.toLowerCase().includes('fps')) {
      analysis = 'Diagnostic Alert: Thermal performance throttle. Resolution: Set in-game display metrics to Standard, disable High FPS shadow tracing, and purge browser storage cash.';
    }

    await updateDoc(ref, {
      status: 'Resolved',
      analysis
    });

    const updatedSnap = await getDoc(ref);
    return updatedSnap.data();
  } catch (error) {
    console.warn("analyzeIssueInFirestore failed:", error);
    return null;
  }
}

export async function getAds(): Promise<any[]> {
  return (await getSettingsDoc('ads')).adsList || [
    { id: "ad1", company: "OctaFX Gaming CopyTrade Nigeria", text: "Deposit $10 USD, follow Verified Esports Professionals, and copy their drag-shot sensitivity portfolios instantly. 100% deposit bonus inside!", link: "https://octafx.com", budget: 450.00, views: 240 },
    { id: "ad2", company: "Red Bull Esports Arena West Africa", text: "Fuel your focus. Enter the ultimate 1v1 Clash Squad tournament and calibrate your trigger fingers with Red Bull energy.", link: "https://redbull.com", budget: 1200.00, views: 408 }
  ];
}

export async function saveAdsList(ads: any[]): Promise<boolean> {
  const path = 'settings/ads';
  try {
    await setDoc(doc(db, 'settings', 'ads'), { adsList: ads });
    setCache('settings_ads', { adsList: ads });
    return true;
  } catch (error) {
    console.warn("saveAdsList failed:", error);
    return false;
  }
}

export async function getAdminPayouts(): Promise<any[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, 'users'));
    const payouts: any[] = [];
    snap.docs.forEach(docSnap => {
      const user = docSnap.data() as UserProfile;
      if (user.withdrawalRequests && user.withdrawalRequests.length > 0) {
        user.withdrawalRequests.forEach(req => {
          payouts.push({
            ...req,
            userEmail: user.email,
            username: user.username
          });
        });
      }
    });
    return payouts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.warn("getAdminPayouts failed:", error);
    return [];
  }
}

export async function logAdminActivity(action: string, details: string, adminEmail: string) {
  const path = 'adminActivityLogs';
  try {
    const id = 'LOG-' + Math.floor(Math.random() * 900000 + 100000);
    await setDoc(doc(db, 'adminActivityLogs', id), {
      id,
      action,
      details,
      adminEmail,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.warn("logAdminActivity failed:", error);
  }
}

export async function getAdminLogs(): Promise<any[]> {
  const path = 'adminActivityLogs';
  try {
    const snap = await getDocs(collection(db, 'adminActivityLogs'));
    return snap.docs.map(doc => doc.data()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.warn("getAdminLogs failed:", error);
    return [];
  }
}

// === Optional Developer manual Seeder (PART 2) ===
export async function seedDatabaseIfEmpty() {
  // Check if we are logged in as admin to allow seeding
  const email = auth.currentUser?.email;
  const isDevOrAdmin = !email || email === 'ghostfirehub@gmail.com' || email === 'ghostfire@ghost.com';
  if (!isDevOrAdmin) {
    console.warn("Database seeding aborted: must be an administrator or run locally.");
    return;
  }
  
  try {
    const devSnap = await getDocs(collection(db, 'devices'));
    if (devSnap.empty) {
      for (const d of SEED_DEVICES) {
        await setDoc(doc(db, 'devices', d.id), d);
      }
    }

    const wepSnap = await getDocs(collection(db, 'weapons'));
    if (wepSnap.empty) {
      for (const w of SEED_WEAPONS) {
        await setDoc(doc(db, 'weapons', w.id), w);
      }
    }

    const mktSnap = await getDocs(collection(db, 'marketplace'));
    if (mktSnap.empty) {
      for (const p of SEED_MARKETPLACE) {
        await setDoc(doc(db, 'marketplace', p.id), p);
      }
    }

    const postSnap = await getDocs(collection(db, 'communityPosts'));
    if (postSnap.empty) {
      for (const cp of SEED_POSTS) {
        await setDoc(doc(db, 'communityPosts', cp.id), cp);
      }
    }

    const giveSnap = await getDocs(collection(db, 'giveaways'));
    if (giveSnap.empty) {
      for (const g of SEED_GIVEAWAYS) {
        await setDoc(doc(db, 'giveaways', g.id), g);
      }
    }

    const presetSnap = await getDocs(collection(db, 'presets'));
    if (presetSnap.empty) {
      for (const pr of SEED_PRESETS) {
        await setDoc(doc(db, 'presets', pr.id), pr);
      }
    }

    await initializeSettings();
    console.log("Database seeded successfully with fallback mock items.");
  } catch (error) {
    console.warn("Database manual seeding error:", error);
  }
}

// === MVVM Repositories Abstractions (PART 6) ===
export async function isUsernameTaken(username: string): Promise<boolean> {
  const path = 'users';
  try {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.warn("isUsernameTaken error, checking cache:", error);
    return false;
  }
}

export async function findUserByReferralCode(code: string): Promise<{ id: string, data: UserProfile } | null> {
  const path = 'users';
  try {
    const q = query(collection(db, 'users'), where('referralCode', '==', code.toUpperCase()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, data: snap.docs[0].data() as UserProfile };
    }
    return null;
  } catch (error) {
    console.warn("findUserByReferralCode error:", error);
    return null;
  }
}

export async function findUserByUsername(username: string): Promise<UserProfile | null> {
  const path = 'users';
  try {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn("findUserByUsername error:", error);
    return null;
  }
}

export async function findUserByEmailOrUsername(identifier: string): Promise<UserProfile | null> {
  const path = 'users';
  try {
    const qEmail = query(collection(db, 'users'), where('email', '==', identifier));
    let snap = await getDocs(qEmail);
    if (!snap.empty) {
      return snap.docs[0].data() as UserProfile;
    }
    const qUser = query(collection(db, 'users'), where('username', '==', identifier));
    snap = await getDocs(qUser);
    if (!snap.empty) {
      return snap.docs[0].data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn("findUserByEmailOrUsername error:", error);
    return null;
  }
}

export async function findUidByEmail(email: string): Promise<string | null> {
  const path = 'users';
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].id;
    }
    return null;
  } catch (error) {
    console.warn("findUidByEmail error:", error);
    return null;
  }
}

// === Auxiliary and Admin Delegates for complete Firebase abstraction ===
export async function updateWeaponsLastSync(): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'weapons_last_sync'), { timestamp: new Date().toISOString() });
  } catch (e) {
    console.warn("Skipped updating weapons_last_sync:", e);
  }
}

export async function deletePreset(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'presets', id));
  } catch (e) {
    console.warn("deletePreset failed:", e);
  }
}

export async function deleteGiveaway(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'giveaways', id));
  } catch (e) {
    console.warn("deleteGiveaway failed:", e);
  }
}

export async function deleteIssue(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'feedback', id));
  } catch (e) {
    console.warn("deleteIssue failed:", e);
  }
}

export async function getFeedbackList(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'feedback'));
    return snap.docs.map(doc => doc.data());
  } catch (e) {
    console.warn("getFeedbackList failed:", e);
    return [];
  }
}

export async function submitFeedbackComment(body: any): Promise<any> {
  try {
    const id = 'feedback-' + Date.now();
    const payload = { id, ...body, timestamp: new Date().toISOString() };
    await setDoc(doc(db, 'feedback', id), payload);
    return payload;
  } catch (e) {
    console.warn("submitFeedbackComment failed:", e);
    return body;
  }
}

export async function updatePayoutStatus(payoutId: string, status: string, payoutRef?: string, payoutDetails?: string, adminEmail?: string): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    for (const docSnap of snap.docs) {
      const u = docSnap.data() as UserProfile;
      if (u.withdrawalRequests) {
        const reqIndex = u.withdrawalRequests.findIndex((r: any) => r.id === payoutId);
        if (reqIndex >= 0) {
          const reqs = [...u.withdrawalRequests];
          reqs[reqIndex].status = status as any;
          if (payoutRef) reqs[reqIndex].payoutRef = payoutRef;
          if (payoutDetails) reqs[reqIndex].payoutDetails = payoutDetails;
          reqs[reqIndex].completedAt = new Date().toISOString();

          await updateDoc(doc(db, 'users', docSnap.id), { withdrawalRequests: reqs });
          await logAdminActivity('Payout Status Updated', `Payout ${payoutId} updated to ${status}`, adminEmail || 'Admin');
          return true;
        }
      }
    }
    return false;
  } catch (e) {
    console.warn("updatePayoutStatus failed:", e);
    return false;
  }
}

export async function adminUpdateUserStatus(targetEmail: string, isBanned: boolean): Promise<boolean> {
  try {
    const uid = await findUidByEmail(targetEmail);
    if (uid) {
      await updateDoc(doc(db, 'users', uid), { isBanned });
      return true;
    }
    return false;
  } catch (e) {
    console.warn("adminUpdateUserStatus failed:", e);
    return false;
  }
}

export async function adminOverrideUser(targetEmail: string, data: any): Promise<boolean> {
  try {
    const uid = await findUidByEmail(targetEmail);
    if (uid) {
      await updateDoc(doc(db, 'users', uid), data);
      return true;
    }
    return false;
  } catch (e) {
    console.warn("adminOverrideUser failed:", e);
    return false;
  }
}

export async function adminDeleteUser(targetEmail: string): Promise<boolean> {
  try {
    const uid = await findUidByEmail(targetEmail);
    if (uid) {
      await deleteDoc(doc(db, 'users', uid));
      return true;
    }
    return false;
  } catch (e) {
    console.warn("adminDeleteUser failed:", e);
    return false;
  }
}

export async function adminGetAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(doc => doc.data() as UserProfile);
  } catch (e) {
    console.warn("adminGetAllUsers failed:", e);
    return [];
  }
}
