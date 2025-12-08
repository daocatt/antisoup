
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroBattle from './components/HeroBattle';
import HistorySection from './components/HistorySection';
import HistoryPage from './components/HistoryPage';
import Leaderboard from './components/Leaderboard';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import Generator from './components/Generator';
import LoginModal from './components/LoginModal';
import AdminPanel from './components/AdminPanel';
import BattleDetailPage from './components/BattleDetailPage';
import { Battle, User, ViewState, Comment, SystemConfig, ReactionType, ReactionRecord, ThemeMode, Topic } from './types';
import { TOP_USERS, INITIAL_CONFIG, INITIAL_TOPICS } from './services/mockDb'; // Keep static resources
import { dataProvider } from './services/dataProvider';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedBattleId, setSelectedBattleId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Data State
  const [battles, setBattles] = useState<Battle[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactionRecords, setReactionRecords] = useState<ReactionRecord[]>([]);
  const [currentBattleIndex, setCurrentBattleIndex] = useState(0);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(INITIAL_CONFIG);
  
  // Topic State (New)
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);
  
  // Theme State
  const [userTheme, setUserTheme] = useState<ThemeMode | null>(null); // null means no local override

  // Admin Management State
  const [admins, setAdmins] = useState<User[]>([]);

  // Initialize data from DataProvider (Real API or Mock Fallback)
  useEffect(() => {
    const initData = async () => {
      setIsInitializing(true);
      
      // Load user from local storage
      const storedUser = localStorage.getItem('as_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Load theme from local storage
      const storedTheme = localStorage.getItem('as_theme') as ThemeMode | null;
      if (storedTheme) {
        setUserTheme(storedTheme);
      }

      // Parallel fetch for data
      const [fetchedBattles, fetchedComments, fetchedAdmins, fetchedConfig, fetchedTopics] = await Promise.all([
        dataProvider.getBattles(),
        dataProvider.getComments(),
        dataProvider.getAdmins(),
        dataProvider.getSystemConfig(),
        dataProvider.getTopics()
      ]);

      setBattles(fetchedBattles);
      setComments(fetchedComments);
      setAdmins(fetchedAdmins);
      setSystemConfig(fetchedConfig);
      setTopics(fetchedTopics);
      
      // Handle Deep Linking (URL Parameters)
      const params = new URLSearchParams(window.location.search);
      const sharedBattleId = params.get('battleId');
      
      if (sharedBattleId) {
          // Check if battle exists (optional, but good for UX)
          const battleExists = fetchedBattles.find(b => b.id === sharedBattleId);
          if (battleExists) {
              setSelectedBattleId(sharedBattleId);
              setCurrentView('detail');
          } else {
              // Clean URL if battle not found
              window.history.replaceState({}, '', window.location.pathname);
          }
      }

      setIsInitializing(false);
    };

    initData();
  }, []);

  // Update Topic Counts based on Battles (Simulating Database Aggregation)
  useEffect(() => {
    if (battles.length > 0 && topics.length > 0) {
        const topicCounts = new Map<string, number>();
        
        // Count battles per topic name
        battles.forEach(battle => {
            const t = battle.topic;
            if (t) {
                topicCounts.set(t, (topicCounts.get(t) || 0) + 1);
            }
        });

        // Update topics count but keep status
        // Note: Ideally this aggregation happens on the server.
        // For now, we update the local state for display purposes.
        setTopics(prevTopics => prevTopics.map(t => ({
            ...t,
            battleCount: topicCounts.get(t.name) || 0
        })));
    }
  }, [battles, topics.length]); 

  // Theme Application Logic
  useEffect(() => {
    const root = window.document.documentElement;
    const effectiveTheme = userTheme || systemConfig.defaultTheme;

    const applyTheme = (theme: 'light' | 'dark') => {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (effectiveTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(systemDark ? 'dark' : 'light');
      
      // Listen for system changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(effectiveTheme);
    }
  }, [userTheme, systemConfig.defaultTheme]);

  const toggleTheme = () => {
    // Cycle: light -> dark -> system -> light
    let nextTheme: ThemeMode;
    const current = userTheme || systemConfig.defaultTheme;

    if (current === 'light') nextTheme = 'dark';
    else if (current === 'dark') nextTheme = 'system';
    else nextTheme = 'light';

    setUserTheme(nextTheme);
    localStorage.setItem('as_theme', nextTheme);
  };

  // Filter and Sort Battles
  const filteredBattles = useMemo(() => {
      return battles.filter(b => b.status === 'approved');
  }, [battles]);

  const sortedBattles = useMemo(() => {
    return [...filteredBattles].sort((a, b) => {
        // 1. Pinned
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // 2. Status (Active vs Expired)
        const now = new Date().getTime();
        const aExpired = new Date(a.expiresAt).getTime() < now;
        const bExpired = new Date(b.expiresAt).getTime() < now;

        if (!aExpired && bExpired) return -1;
        if (aExpired && !bExpired) return 1;

        // 3. Date Descending
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredBattles]);

  // --- ACTIONS WITH DATA PROVIDER ---

  const handleVote = async (battleId: string, side: 'soup' | 'anti') => {
    // Optimistic Update
    setBattles(prev => prev.map(b => {
      if (b.id !== battleId) return b;
      return {
        ...b,
        soupVotes: side === 'soup' ? b.soupVotes + 1 : b.soupVotes,
        antiVotes: side === 'anti' ? b.antiVotes + 1 : b.antiVotes
      };
    }));
    
    // Write to DB
    await dataProvider.vote(battleId, side);
  };

  const handleReaction = async (battleId: string, type: ReactionType) => {
      const userId = user ? user.id : 'anon_session';
      
      // Optimistic Update
      setBattles(prev => prev.map(b => {
          if (b.id !== battleId) return b;
          const currentCounts = b.reactionCounts || { like: 0, clap: 0, disagree: 0, shock: 0, neutral: 0 };
          return {
              ...b,
              reactionCounts: {
                  ...currentCounts,
                  [type]: (currentCounts[type] || 0) + 1
              }
          };
      }));

      // Record logic (mocking DB insert locally, skipping DataProvider write for records specifically to simplify demo, but recording vote)
      setReactionRecords(prev => [
          ...prev, 
          { 
              id: `r_${Date.now()}`, 
              battleId, 
              userId, 
              type, 
              createdAt: new Date().toISOString() 
          }
      ]);
      
      // Write Reaction to DB
      await dataProvider.reaction(battleId, type);
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('as_user', JSON.stringify(newUser));
    setShowLoginModal(false);
    if (currentView === 'login') setCurrentView('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('as_user');
    setCurrentView('home');
  };

  const handlePublishBattle = async (newBattle: Battle) => {
    // Write to DB
    await dataProvider.createBattle(newBattle);
    
    // Refresh local state (mock provider unshift logic means we can just prepend)
    setBattles([newBattle, ...battles]);
    
    // Update user's daily count
    if (user) {
        const today = new Date().toISOString().split('T')[0];
        const updatedUser = {
            ...user,
            lastGenerationDate: today,
            dailyGenerations: (user.lastGenerationDate === today ? (user.dailyGenerations || 0) : 0) + 1
        };
        setUser(updatedUser);
        localStorage.setItem('as_user', JSON.stringify(updatedUser));
    }

    setCurrentView('home');
    setCurrentBattleIndex(0); 
  };

  const openLogin = () => setShowLoginModal(true);

  // Detail View Navigation
  const handleSelectBattle = (battleId: string) => {
      setSelectedBattleId(battleId);
      setCurrentView('detail');
      window.scrollTo(0, 0);
      
      // Update URL without reloading to support sharing from this state
      const newUrl = `${window.location.pathname}?battleId=${battleId}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
  };
  
  // Handle going back home
  const handleBackToHome = () => {
      setCurrentView('home');
      // Reset URL to clean
      window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
  };

  // Comment Handling
  const handleAddComment = async (battleId: string, content: string, side: 'soup' | 'anti') => {
      if (!user) return;
      const newComment: Comment = {
          id: `c_${Date.now()}`,
          battleId,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          content,
          side,
          createdAt: new Date().toISOString(),
          status: 'pending' // Default to pending
      };
      
      await dataProvider.addComment(newComment);
      setComments(prev => [newComment, ...prev]);
  };

  const handleUpdateCommentStatus = async (commentId: string, status: 'approved' | 'rejected') => {
      await dataProvider.updateCommentStatus(commentId, status);
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, status } : c));
  };

  // Admin Actions
  const handleUpdateBattle = async (battleId: string, updates: Partial<Battle>) => {
      await dataProvider.updateBattle(battleId, updates);
      setBattles(prev => prev.map(b => b.id === battleId ? { ...b, ...updates } : b));
  };

  const handleAddAdmin = async (name: string, email: string) => {
      const newAdmin: User = {
          id: `u_admin_${Date.now()}`,
          name: name,
          email,
          avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}`,
          provider: 'system', 
          role: 'admin',
          createdAt: new Date().toISOString()
      };
      await dataProvider.addAdmin(newAdmin);
      setAdmins([...admins, newAdmin]);
  };

  const handleRemoveAdmin = async (adminId: string) => {
      await dataProvider.removeAdmin(adminId);
      setAdmins(admins.filter(a => a.id !== adminId));
  };
  
  const handleUpdateSystemConfig = async (config: SystemConfig) => {
      await dataProvider.updateSystemConfig(config);
      setSystemConfig(config);
  };

  const getUserReaction = (battleId: string): ReactionType | null => {
    const userId = user ? user.id : 'anon_session';
    // Find the most recent reaction by iterating backwards
    for (let i = reactionRecords.length - 1; i >= 0; i--) {
        if (reactionRecords[i].battleId === battleId && reactionRecords[i].userId === userId) {
            return reactionRecords[i].type;
        }
    }
    return null;
  };

  const currentDetailBattle = battles.find(b => b.id === selectedBattleId);
  const currentDetailComments = comments
        .filter(c => c.battleId === selectedBattleId && c.status === 'approved')
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Loading Screen
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">正在加载数据...</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">连接至现实世界</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Navbar 
        currentView={currentView} 
        setView={(view) => {
            if (view === 'login') {
                setShowLoginModal(true);
            } else {
                setCurrentView(view);
                // Clean url if navigating via nav
                window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
            }
        }} 
        user={user} 
        onLogout={handleLogout}
        theme={userTheme || systemConfig.defaultTheme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {currentView === 'home' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* 1. Hero Battle */}
            <section>
                <div className="flex justify-between items-end mb-4 px-2">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {sortedBattles[currentBattleIndex]?.isPinned && <span className="text-blue-600 mr-2">⭐ 置顶推荐</span>}
                        {sortedBattles[currentBattleIndex]?.isPinned ? '' : '正在进行'}
                    </h2>
                    <div className="flex gap-2">
                         <button 
                            className="text-sm text-slate-400 hover:text-blue-600 disabled:opacity-30 dark:text-slate-500 dark:hover:text-blue-400"
                            onClick={() => setCurrentBattleIndex(p => Math.max(0, p - 1))}
                            disabled={currentBattleIndex === 0}
                         >
                            上一场
                         </button>
                         <span className="text-slate-300 dark:text-slate-600">|</span>
                         <button 
                            className="text-sm text-slate-400 hover:text-blue-600 disabled:opacity-30 dark:text-slate-500 dark:hover:text-blue-400"
                            onClick={() => setCurrentBattleIndex(p => Math.min(sortedBattles.length - 1, p + 1))}
                            disabled={currentBattleIndex === sortedBattles.length - 1}
                         >
                            下一场
                         </button>
                    </div>
                </div>
                {sortedBattles[currentBattleIndex] ? (
                    <HeroBattle 
                        battle={sortedBattles[currentBattleIndex]} 
                        onVote={handleVote}
                        onViewDetail={handleSelectBattle} 
                        onReaction={handleReaction}
                        userReaction={getUserReaction(sortedBattles[currentBattleIndex].id)}
                    />
                ) : (
                    <div className="h-[400px] flex items-center justify-center bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="text-center text-slate-400 dark:text-slate-500">
                            <p className="text-xl font-bold mb-2">暂无进行中的PK</p>
                            <p>去生成器创建一场新的对决吧！</p>
                        </div>
                    </div>
                )}
            </section>

            {/* Grid Layout for History & Users */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 2. Top History (Takes up 2 cols) */}
              <div className="lg:col-span-2">
                <HistorySection 
                  battles={sortedBattles.slice(0, 10)} 
                  onViewAll={() => setCurrentView('history')}
                  onSelectBattle={handleSelectBattle}
                />
              </div>

              {/* 3. Leaderboard (Takes up 1 col) */}
              <div className="lg:col-span-1">
                <Leaderboard users={TOP_USERS} />
              </div>
            </div>

            {/* 4. FAQ */}
            <FaqSection />
          </div>
        )}

        {currentView === 'history' && (
          <HistoryPage 
            battles={sortedBattles} 
            onSelectBattle={handleSelectBattle}
          />
        )}

        {currentView === 'detail' && currentDetailBattle && (
          <BattleDetailPage 
            battle={currentDetailBattle}
            currentUser={user}
            comments={currentDetailComments}
            userReaction={getUserReaction(currentDetailBattle.id)}
            onVote={handleVote}
            onAddComment={handleAddComment}
            onReaction={handleReaction}
            onBack={handleBackToHome} 
            onRequireLogin={openLogin}
          />
        )}

        {currentView === 'generator' && (
          <Generator 
            user={user} 
            dailyLimit={systemConfig.dailyGenerationLimit}
            onPublish={handlePublishBattle} 
            onRequireLogin={openLogin}
            topics={topics}
          />
        )}

        {currentView === 'admin' && user && (user.role === 'admin' || user.role === 'super_admin') && (
            <AdminPanel 
                currentUser={user}
                battles={battles} 
                comments={comments} 
                admins={admins}
                systemConfig={systemConfig}
                onUpdateBattle={handleUpdateBattle}
                onUpdateCommentStatus={handleUpdateCommentStatus}
                onAddAdmin={handleAddAdmin}
                onRemoveAdmin={handleRemoveAdmin}
                onUpdateSystemConfig={handleUpdateSystemConfig}
            />
        )}

      </main>

      <Footer />

      {showLoginModal && (
        <LoginModal 
            systemConfig={systemConfig}
            onLogin={handleLogin} 
            onCancel={() => setShowLoginModal(false)} 
        />
      )}
    </div>
  );
};

export default App;
