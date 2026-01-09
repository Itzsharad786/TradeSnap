
export type Page = 'Home' | 'Market' | 'News' | 'Analyzer' | 'TraderLab' | 'Community' | 'Profile' | 'FullNews' | 'NewsDetail';
export type Theme = 'light' | 'dark';

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
  instagramHandle?: string; // Instagram username
  themeColor?: string; // User's theme color preference
  traderLabProgress?: {
    [topicId: string]: {
      completed: boolean;
      lastViewed?: Date;
      aiExplanationGenerated?: boolean;
    };
  };
  followersCount?: number;
  followingCount?: number;
  lastLogin?: Date;
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
  password?: string | null; // Deprecated in favor of passwordHash
  passwordHash?: string | null;
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

export interface RssArticle {
  title: string;
  link: string;
  pubDate: string;
  isoDate?: string;
  contentSnippet: string;
  guid: string;
  categories: string[];
}

export interface StockAnalysisData {
  company: {
    name: string;
    ticker: string;
    description: string;
    sector: string;
    industry: string;
    ceo: string;
    headquarters: string;
    founded: string;
    exchange: string; // Added requirement
    employees?: string;
  };
  price: {
    current: number;
    change: number;
    changePercent: number;
    currency: string;
    marketCap: string;
    volume: string;
    avgVolume: string;
    dayHigh: number;
    dayLow: number;
    yearHigh: number;
    yearLow: number;
    peRatio: string;
    eps: string;
    dividendYield: string;
    nextEarningsDate?: string;
  };
  // Expanded for "Full Dossier" structure
  fundamentals: { // New Section
    revenueTrend: string;
    profitability: string;
    debtStatus: string;
    valuation: 'Overvalued' | 'Fair' | 'Undervalued';
    valuationReason: string;
  };
  riskAnalysis: { // New Section
    marketRisk: string;
    newsRisk: string;
    volatility: 'Low' | 'Medium' | 'High';
    riskScore: number;
  };
  futureOutlook: { // New Section
    shortTerm: string; // 1-4 weeks
    midTerm: string;   // 3-6 months
    longTerm: string;  // 1+ year
  };
  // Technicals
  technicalAnalysis: {
    trend: 'Bullish' | 'Bearish' | 'Neutral';
    rsi: string;
    macd: string;
    keySupport: string[];
    keyResistance: string[];
  };
  // Legacy analysis object mapping for backward compatibility if needed, 
  // but primary logic should move to specific sections above.
  analysis: {
    recommendation: 'Buy' | 'Sell' | 'Hold';
    confidence: number;
    trend: 'Bullish' | 'Bearish' | 'Neutral';
    riskScore: number;
    opportunityScore: number;
    volatility: 'Low' | 'Medium' | 'High';
    liquidity: 'High' | 'Medium' | 'Low';
    momentum: 'Strong' | 'Weak' | 'Neutral';
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    targetPrice1W: number;
    targetPrice1M: number;
    targetPrice3M: number;
    targetPrice6M: number;
    targetPrice1Y: number;
    drivers: string[];
  };
  keyLevels: {
    support: string[];
    resistance: string[];
  };
  tradeSetup: ChartAnalysisData;
  explanation: string;
  verdict: { // New Section
    action: 'Buy' | 'Hold' | 'Avoid';
    targetAudience: 'Trader' | 'Investor' | 'Avoid';
    reasoning: string;
  };
  news: {
    headline: string;
    time: string;
    source?: string;
    summary: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    impact: 'High' | 'Medium' | 'Low';
    url?: string;
  }[];
  forecast: {
    probBullish: number;
    probBearish: number;
    projection1M: string;
    projection1Y: string;
  };
  chartData: {
    price: number;
    label: string;
  }[];
}

export interface ChartAnalysisData {
  // New Structured Fields
  chartType: {
    timeframe: string;
    asset: string;
  };
  trendAnalysis: {
    marketStructure: 'Bullish' | 'Bearish' | 'Range';
    confirmation: string;
  };
  keyLevels: {
    support: string[];
    resistance: string[];
  };
  patternDetection: {
    pattern: string;
    status: 'Breakout' | 'Breakdown' | 'Developing';
  };
  indicators: {
    rsi?: string;
    macd?: string;
    ma?: string;
  };
  tradeScenarios: {
    bullish: string;
    bearish: string;
    invalidation: string;
  };
  riskAssessment: {
    score: number;
    volatility: string;
  };
  verdict: {
    entryLogic: string;
    stopLossLogic: string;
    recommendation: 'Trade' | 'Wait';
  };
  // Existing fields for UI Compatibility
  entry: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  riskScore: number;
  warnings: string[];
  scenarios: {
    mostLikely: string;
    bullish: string;
    bearish: string;
  };
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  momentum: 'Strong' | 'Weak' | 'Neutral';
  supports: string[];
  resistances: string[];
  pattern?: string;
}