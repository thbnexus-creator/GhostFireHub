export interface Device {
  id: string;
  brand: string;
  model: string;
  os: string;
  ram: string;
  refreshRate: string;
  touchSamplingRate: string;
  resolution: string;
  screenSize: string;
  gyroscope: boolean;
}

export interface Weapon {
  id: string;
  name: string;
  category: 'Rifle' | 'SMG' | 'Shotgun' | 'Sniper' | 'Pistol';
  image: string;
  baseDamage: number;
  rateOfFire: number;
  range: number;
}

export interface SensitivityProfile {
  id?: string;
  general: number;
  redDot: number;
  scope2x: number;
  scope4x: number;
  sniper: number;
  freeLook: number;
  confidenceScore: number;
  explanation: string;
  created_at: string;
  deviceBrand?: string;
  deviceModel?: string;
}

export interface RecommendationInput {
  brand: string;
  model: string;
  os: string;
  ram: string;
  refreshRate: string;
  touchSamplingRate: string;
  resolution: string;
  screenSize: string;
  gyroscope: boolean;
  fingerSetup: '2-Finger' | '3-Finger' | '4-Finger' | '5-Finger';
  gameMode: 'Battle Royale' | 'Clash Squad' | 'Custom Room';
  playStyle: 'Aggressive' | 'Passive' | 'Support' | 'Sniper' | 'Rusher';
  experience: 'Beginner' | 'Intermediate' | 'Professional';
}

export interface HUDLayout {
  id: string;
  name: string;
  orientation: 'landscape' | 'portrait';
  buttons: HUDButton[];
  created_at: string;
}

export interface HUDButton {
  id: string;
  label: string;
  x: number; // percentage
  y: number; // percentage
  size: number; // pixel diameter/scale
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  category: 'Accounts' | 'Coaching' | 'Skins' | 'HUD Layouts' | 'Config Files';
  price: number;
  description: string;
  rating: number;
  reviewsCount: number;
  image: string;
  featured?: boolean;
  telegramLink?: string;
  isGiveaway?: boolean;
  hidden?: boolean;
  vendorEmail?: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorEmail?: string;
  category: 'Announcement' | 'Update' | 'Guide' | 'Tournament' | 'Feedback';
  timestamp: string;
  likes: number;
  visibility?: 'public' | 'registered';
  isAnonymous?: boolean;
  image?: string;
  comments?: PostComment[];
}

export interface PostComment {
  id: string;
  author: string;
  authorEmail: string;
  content: string;
  timestamp: string;
  parentId?: string; // to identify if it's a reply
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'giveaway' | 'reply' | 'info';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface UserProfile {
  email: string;
  username: string;
  favoriteWeapons: string[];
  favoriteDevices: string[];
  referralCount: number;
  isPremium: boolean;
  isProfilePublic?: boolean;
  role?: string;
  isBanned?: boolean;
  referralCode?: string;
  experience?: 'Beginner' | 'Intermediate' | 'Professional';
  brandPreference?: string;
  country?: string; // New: selected country
  earningsBalance?: number; // New: earned funds from ads/vectors
  withdrawnTotal?: number; // New: total amount withdrawn
  touchVectorsLogged?: number; // New: number of touch vectors logged
  withdrawalRequests?: {
    id: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    status: 'Pending' | 'Approved' | 'Declined' | 'Completed';
    timestamp: string;
    payoutMethod?: string;
    payoutRef?: string;
    payoutDetails?: string;
    completedAt?: string;
  }[]; // New: List of withdrawal requests (e.g. to Nigeria bank account)
  savedRecommendations: {
    id: string;
    input: RecommendationInput;
    sensitivity: SensitivityProfile;
    timestamp: string;
  }[];
  bookmarkedPresets?: string[];
  bookmarkedProducts?: string[];
  ghostPoints?: number;
  completedMissions?: string[];
  claimedMissions?: string[];
  missionProgress?: { [missionId: string]: number };
  benchmarkFps?: number;
  benchmarkTouchLatency?: number;
  themePrimary?: string;
  themeSecondary?: string;
  loginStreak?: number;
  lastClaimedDailyRewardDate?: string;
  lastLoginDate?: string;
  dataSharingConsent?: boolean;
  isVendor?: boolean;
  vendorCode?: string;
  vendorKey?: string;
  vendorRequested?: boolean;
  vendorFeePaid?: boolean;
  telegramHandle?: string;
  sharesCount?: number;
  savedBankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface VendorApplication {
  id: string;
  email: string;
  username: string;
  telegramHandle: string;
  shopName: string;
  specialization: string;
  details: string;
  experienceYears: number;
  agreedToRules: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
  vendorKey?: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  reward: number; // GhostPoints
  target: number; // target completion count
  actionType: 'calibrate' | 'save_sens' | 'save_hud' | 'view_device' | 'read_community' | 'view_marketplace';
  progress?: number;
  completed?: boolean;
  claimed?: boolean;
}

export interface Giveaway {
  id: string;
  title: string;
  description: string;
  reward: string;
  endTime: string; // ISO String format
  telegramLink?: string;
  participants: string[]; // List of user emails who claimed/joined
  winner?: string | null; // Winner email if completed
  image?: string;
}
