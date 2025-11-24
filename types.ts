
export type Page = 'Home' | 'Market' | 'News' | 'Analyzer' | 'TraderLab' | 'Community' | 'Profile';

export interface UserProfile {
  uid: string;
  name: string;
  displayName?: string;
  username: string;
  email: string | null;
  avatar: string;
  bio: string;
  country: string;
  experience: 'Beginner' | 'Intermediate' | 'Expert';
  isGuest?: boolean;
  createdAt?: Date;
  lastActive?: Date; // Added
  publicGroupsCount?: number; // Track public groups created
  privateGroupsCount?: number; // Track private groups created
  onboardingCompleted: boolean;
  groupsJoined?: string[];
  traderLabProgress?: {
    [topicId: string]: {
      completed: boolean;
      lastViewed?: Date;
      aiExplanationGenerated?: boolean;
    };
  };
  stats: {
    analysesRun: number;
    chartsUploaded: number;
    groupsJoined: number;
    xp: number;
    rank: 'Bronze' | 'Silver' | 'Gold' | 'Heroic';
    badges: string[];
    balance: number;
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
  authorId?: string; // Added for ownership check
  text: string;
  timestamp: number;
  reactions: { [key: string]: any };
  type: 'text' | 'image';
  mediaUrl?: string;
  seenBy?: string[]; // Array of user IDs who have seen the message
  isPinned?: boolean; // Whether message is pinned
}

export interface GroupMember {
  uid: string;
  email: string;
  joinedAt: string;
  username?: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: any;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatarUrl: string | null;
  bannerUrl?: string | null; // Group banner image
  isPrivate: boolean;
  password?: string | null;
  ownerUid: string;
  ownerEmail: string;
  inviteCode: string;
  members: GroupMember[];
  membersUidList?: string[]; // For faster queries
  createdAt: any;
  type: 'public' | 'private'; // Enforced type
  topic?: string;
  lastMessage?: {
    text: string;
    timestamp: any;
    authorName: string;
  };
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

export interface TraderLabTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  imageUrl?: string;
}

export interface Position {
  id: string;
  symbol: string;
  entryPrice: number;
  quantity: number;
  type: 'BUY' | 'SELL';
  status: 'OPEN' | 'CLOSED';
  pnl?: number;
  timestamp: number;
}