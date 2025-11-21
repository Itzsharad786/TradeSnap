
export type Theme = 'dark' | 'light' | 'ocean' | 'forest' | 'sunset';

export type Page = 'Home' | 'Market' | 'News' | 'Analyzer' | 'TraderLab' | 'Community' | 'Profile';

export interface UserProfile {
  uid: string;
  name: string;
  displayName?: string; // Display name (can be different from username)
  username: string;
  email: string | null;
  avatar: string; // base64 or preset key
  bio: string;
  country: string; // Country code or name
  experience: 'Beginner' | 'Intermediate' | 'Expert';
  isGuest?: boolean;
  createdAt?: Date;
  lastLogin?: Date; // Track last login time
  onboardingCompleted: boolean;
  theme: Theme;
  themeColor?: string; // Hex code for accent color
  groupsJoined?: string[]; // Array of group IDs the user has joined
  traderLabProgress?: { // Track progress through TraderLab topics
    [topicId: string]: {
      completed: boolean;
      lastViewed?: Date;
      aiExplanationGenerated?: boolean;
    };
  };
  // Stats
  stats: {
    analysesRun: number;
    chartsUploaded: number;
    groupsJoined: number;
    xp: number;
    rank: 'Bronze' | 'Silver' | 'Gold' | 'Heroic';
    badges: string[];
    balance: number; // Paper trading balance
    pnl: number;
  };
}

export const PROFILE_AVATARS: { [key: string]: string } = {
  'trader-1': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'trader-2': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'trader-3': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack',
  'trader-4': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trouble',
  'trader-5': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Molly',
  'trader-6': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bear',
  'trader-7': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lilith',
  'trader-8': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bandit',
  'trader-9': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abby',
  'trader-10': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gizmo',
  'trader-11': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight',
  'trader-12': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kitty',
};

export interface TickerData {
  symbol: string;
  name: string;
  market: 'Stocks' | 'Crypto' | 'Forex' | 'Indices';
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GroupChatMessage {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: number;
  reactions: { [key: string]: any };
  type: 'text' | 'image';
  mediaUrl?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatar: string;
  type: 'Public' | 'Private';
  isPrivate?: boolean;
  password?: string; // In a real app, this would be hashed
  topic?: string;
  createdBy: string;
  members: string[];
  createdAt: any;
  inviteCode?: string;
  bannerUrl?: string;
}

export interface NewsCategory {
  // ... existing
}

export interface NewsArticleWithImage {
  title: string;
  link: string;
  publishedAt: string;
  description: string;
  image: string;
  source: string;
  category: string;
}

export interface RssArticle {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  isoDate?: string;
}

export interface TraderLabTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  imageUrl?: string;
}


// Paper Trading Position
export interface Position {
  id: string;
  symbol: string;
  entryPrice: number;
  quantity: number; // Lots
  type: 'BUY' | 'SELL';
  status: 'OPEN' | 'CLOSED';
  pnl?: number;
  timestamp: number;
}