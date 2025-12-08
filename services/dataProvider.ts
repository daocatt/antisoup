
import { Battle, Comment, User, SystemConfig, Topic, ReactionType } from '../types';
import { 
  INITIAL_BATTLES, 
  INITIAL_COMMENTS, 
  INITIAL_CONFIG, 
  TOP_USERS,
  INITIAL_ADMINS,
  INITIAL_TOPICS
} from './mockDb';

interface SystemStatus {
  isDbConfigured: boolean;
  hasRealAdmins: boolean;
}

/**
 * DataProvider 负责协调真实 API 和模拟数据
 * 策略：尝试请求 API -> 成功且有数据则使用 API 数据 -> 失败或无数据则使用 Mock 数据 (Local In-Memory)
 */
class DataProvider {
  // In-memory storage for mock fallback (preserves state during session)
  private _mockBattles: Battle[] = [...INITIAL_BATTLES];
  private _mockComments: Comment[] = [...INITIAL_COMMENTS];
  private _mockTopics: Topic[] = [...INITIAL_TOPICS];
  private _mockConfig: SystemConfig = { ...INITIAL_CONFIG };
  private _mockAdmins: User[] = [...INITIAL_ADMINS];

  // --- Battles ---

  async getBattles(): Promise<Battle[]> {
    try {
      const res = await fetch('/api/battles');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) { /* Fallback */ }
    return this._mockBattles;
  }

  async createBattle(battle: Battle): Promise<Battle> {
      try {
          const res = await fetch('/api/battles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(battle)
          });
          if (res.ok) return await res.json();
      } catch (e) { /* Fallback */ }
      
      this._mockBattles.unshift(battle);
      return battle;
  }

  async updateBattle(id: string, updates: Partial<Battle>): Promise<void> {
      try {
          const res = await fetch(`/api/battles/${id}`, {
              method: 'PUT', // or PATCH
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates)
          });
          if (res.ok) return;
      } catch (e) { /* Fallback */ }

      this._mockBattles = this._mockBattles.map(b => b.id === id ? { ...b, ...updates } : b);
  }

  async vote(battleId: string, side: 'soup' | 'anti'): Promise<void> {
      try {
          const res = await fetch(`/api/battles/${battleId}/vote`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ side })
          });
          if (res.ok) return;
      } catch (e) { /* Fallback */ }

      this._mockBattles = this._mockBattles.map(b => {
          if (b.id !== battleId) return b;
          return {
              ...b,
              soupVotes: side === 'soup' ? b.soupVotes + 1 : b.soupVotes,
              antiVotes: side === 'anti' ? b.antiVotes + 1 : b.antiVotes
          };
      });
  }

  async reaction(battleId: string, type: ReactionType): Promise<void> {
      try {
          const res = await fetch(`/api/battles/${battleId}/reaction`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type })
          });
          if (res.ok) return;
      } catch (e) { /* Fallback */ }

      this._mockBattles = this._mockBattles.map(b => {
          if (b.id !== battleId) return b;
          const currentCounts = b.reactionCounts || { like: 0, clap: 0, disagree: 0, shock: 0, neutral: 0 };
          return {
              ...b,
              reactionCounts: {
                  ...currentCounts,
                  [type]: (currentCounts[type] || 0) + 1
              }
          };
      });
  }

  // --- Comments ---

  async getComments(): Promise<Comment[]> {
    try {
      const res = await fetch('/api/comments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) { /* Fallback */ }
    return this._mockComments;
  }

  async addComment(comment: Comment): Promise<Comment> {
      try {
          const res = await fetch('/api/comments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(comment)
          });
          if (res.ok) return await res.json();
      } catch (e) { /* Fallback */ }

      this._mockComments.unshift(comment);
      return comment;
  }

  async updateCommentStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
      try {
          const res = await fetch(`/api/comments/${id}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status })
          });
          if (res.ok) return;
      } catch (e) { /* Fallback */ }

      this._mockComments = this._mockComments.map(c => c.id === id ? { ...c, status } : c);
  }

  // --- Topics ---

  async getTopics(): Promise<Topic[]> {
      try {
          const res = await fetch('/api/topics');
          if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data)) return data;
          }
      } catch (e) { /* Fallback */ }
      return this._mockTopics;
  }

  async createTopic(name: string): Promise<Topic> {
      const newTopic: Topic = {
          id: `t_${Date.now()}`,
          name,
          battleCount: 0,
          status: 'active'
      };

      try {
          const res = await fetch('/api/topics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name })
          });
          if (res.ok) return await res.json();
      } catch (e) { /* Fallback */ }

      this._mockTopics.push(newTopic);
      return newTopic;
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<void> {
      try {
          const res = await fetch(`/api/topics/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates)
          });
          if (res.ok) return;
      } catch (e) { /* Fallback */ }

      this._mockTopics = this._mockTopics.map(t => t.id === id ? { ...t, ...updates } : t);
  }

  // --- Admins & System ---

  async getAdmins(): Promise<User[]> {
    try {
      const res = await fetch('/api/users?role=admin');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) { /* Fallback */ }
    return this._mockAdmins;
  }

  async addAdmin(user: User): Promise<User> {
       try {
          const res = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(user)
          });
          if (res.ok) return await res.json();
      } catch (e) { /* Fallback */ }
      this._mockAdmins.push(user);
      return user;
  }

  async removeAdmin(userId: string): Promise<void> {
       try {
          const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
          if (res.ok) return;
      } catch (e) { /* Fallback */ }
      this._mockAdmins = this._mockAdmins.filter(u => u.id !== userId);
  }

  async getSystemConfig(): Promise<SystemConfig> {
    try {
      const res = await fetch('/api/system/config');
      if (res.ok) return await res.json();
    } catch (e) { /* Fallback */ }
    return this._mockConfig;
  }

  async updateSystemConfig(config: SystemConfig): Promise<void> {
      try {
          const res = await fetch('/api/system/config', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(config)
          });
          if (res.ok) return;
      } catch (e) { /* Fallback */ }
      this._mockConfig = config;
  }

  // --- Utils ---

  async shouldShowDemoAdminEntry(): Promise<boolean> {
    try {
      const res = await fetch('/api/system/status');
      if (res.ok) {
        const status: SystemStatus = await res.json();
        if (status.isDbConfigured) {
          return false;
        }
      }
      return true;
    } catch (e) {
      return true;
    }
  }

  async simulateApiCall<T>(data: T, delay = 500): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
  }
}

export const dataProvider = new DataProvider();
