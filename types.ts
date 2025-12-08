
// 模拟数据库结构定义的类型

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  provider: 'google' | 'github' | 'email' | 'system';
  role: UserRole;
  createdAt: string;
  dailyGenerations?: number; // 今日已生成次数
  lastGenerationDate?: string; // 最后生成日期 YYYY-MM-DD
}

export type BattleStatus = 'approved' | 'pending' | 'rejected';

export type ReactionType = 'like' | 'clap' | 'disagree' | 'shock' | 'neutral';

export interface Topic {
  id: string;
  name: string;
  battleCount: number;
  isTrending?: boolean;
  status: 'active' | 'disabled';
}

export interface Battle {
  id: string;
  topic: string;
  topicId?: string; // Optional foreign key to Topic table
  soupContent: string; // 红色：鸡汤
  soupVotes: number;
  antiContent: string; // 蓝色：反鸡汤
  antiVotes: number;
  authorId: string; // 创建者
  expiresAt: string; // 过期时间 ISO String
  isPinned: boolean; // 是否置顶/推荐
  createdAt: string;
  status?: BattleStatus; // 审核状态
  reactionCounts?: Record<ReactionType, number>; // 表情计数
}

export interface VoteRecord {
  id: string;
  userId: string;
  battleId: string;
  side: 'soup' | 'anti';
  createdAt: string;
}

export interface Comment {
    id: string;
    battleId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    side: 'soup' | 'anti'; // User's stance when commenting
    createdAt: string;
    status?: 'pending' | 'approved' | 'rejected';
}

export interface ReactionRecord {
    id: string;
    battleId: string;
    userId: string;
    type: ReactionType;
    createdAt: string;
}

export type EmailProvider = 'none' | 'emailjs' | 'mailgun';
export type ThemeMode = 'light' | 'dark' | 'system';

// System Config
export interface SystemConfig {
    dailyGenerationLimit: number;
    // Email Config
    emailProvider: EmailProvider;
    defaultTheme: ThemeMode;
    // API Keys are now handled via Environment Variables, not stored in DB config
}

// UI State types
export type ViewState = 'home' | 'generator' | 'login' | 'history' | 'admin' | 'detail';

export const MOCK_USER: User = {
  id: 'u_123',
  name: '现实主义者',
  avatar: 'https://picsum.photos/seed/user1/200/200',
  email: 'realist@example.com',
  provider: 'github',
  role: 'user',
  createdAt: new Date().toISOString()
};

export const MOCK_SUPER_ADMIN: User = {
  id: 'u_super',
  name: '系统主宰 (Root)',
  avatar: 'https://ui-avatars.com/api/?name=Root&background=000&color=fff',
  email: 'admin@antisoup.com',
  provider: 'system',
  role: 'super_admin',
  createdAt: new Date().toISOString()
};