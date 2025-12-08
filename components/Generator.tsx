
import React, { useState, useMemo } from 'react';
import { generateBattleContent, GeneratedBattleContent } from '../services/geminiService';
import { Battle, User, Topic } from '../types';
import { Sparkles, Loader2, ArrowRight, Lock, Flame, Ban, Edit3 } from 'lucide-react';

interface GeneratorProps {
  user: User | null;
  dailyLimit: number;
  onPublish: (battle: Battle) => void;
  onRequireLogin: () => void;
  topics: Topic[];
}

const Generator: React.FC<GeneratorProps> = ({ user, dailyLimit, onPublish, onRequireLogin, topics }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedBattleContent | null>(null);

  // Admins bypass limits
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
  const usedCount = user?.dailyGenerations || 0;
  const lastDate = user?.lastGenerationDate;
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate if limit reached
  const isLimitReached = !isAdmin && lastDate === today && usedCount >= dailyLimit;
  const remaining = isAdmin ? 999 : (lastDate === today ? Math.max(0, dailyLimit - usedCount) : dailyLimit);

  // Filter Active Topics only for suggestions
  const activeTopics = useMemo(() => topics.filter(t => t.status !== 'disabled'), [topics]);

  // Check if current input topic is disabled
  const isCurrentTopicDisabled = useMemo(() => {
      const matched = topics.find(t => t.name.toLowerCase() === topic.trim().toLowerCase());
      return matched?.status === 'disabled';
  }, [topic, topics]);

  // Randomize topics for display (10-15 random topics)
  const displayTopics = useMemo(() => {
    // 1. Filter out topics with 0 count unless total topics is small
    const candidates = activeTopics.length > 20 ? activeTopics.filter(t => t.battleCount > 0) : activeTopics;
    const pool = candidates.length < 10 ? activeTopics : candidates;

    // 2. Shuffle array
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    
    // 3. Take top 12
    return shuffled.slice(0, 12);
  }, [activeTopics]); 

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        onRequireLogin();
        return;
    }
    if (isLimitReached) {
        alert("今日生成次数已用完，明天再来吧！");
        return;
    }
    if (isCurrentTopicDisabled) {
        return; // blocked by UI, but double check
    }
    if (!topic.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const data = await generateBattleContent(topic);
      setResult(data);
    } catch (error) {
      alert("生成失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = () => {
    if (!user) {
      onRequireLogin();
      return;
    }
    if (!result) return;
    
    // Validate length again
    if (result.soup.length > 500 || result.anti.length > 500) {
        alert("内容过长，请精简至500字以内。");
        return;
    }

    // Default validity: 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const newBattle: Battle = {
      id: `b_${Date.now()}`,
      topic: topic,
      soupContent: result.soup,
      soupVotes: 1, // Start with 1 vote to avoid div/0
      antiContent: result.anti,
      antiVotes: 1,
      authorId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      isPinned: false,
      status: 'pending' // Default to pending review
    };

    onPublish(newBattle);
    alert("发布成功！已提交至后台审核。");
    setResult(null);
    setTopic('');
  };

  const handleTopicClick = (name: string) => {
      setTopic(name);
  };

  const handleContentChange = (type: 'soup' | 'anti', value: string) => {
      if (value.length > 500) return;
      setResult(prev => prev ? { ...prev, [type]: value } : null);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">鸡汤粉碎机 <span className="text-blue-600 dark:text-blue-400">AI版</span></h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">输入一个话题，AI 将自动为你生成"虚伪的鸡汤"和"残酷的真相"。</p>
        
        {user && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300">
                {isAdmin ? (
                    <span className="text-blue-600 dark:text-blue-400 font-bold">管理员无限模式</span>
                ) : (
                    <span>今日剩余次数: <span className={remaining === 0 ? 'text-red-500 font-bold' : 'text-blue-600 dark:text-blue-400 font-bold'}>{remaining}</span> / {dailyLimit}</span>
                )}
            </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 mb-8 border border-slate-100 dark:border-slate-800 relative overflow-visible transition-colors">
        {isLimitReached && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-8 rounded-2xl">
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">今日额度已耗尽</h3>
                <p className="text-slate-500 dark:text-slate-400">为了防止AI过热，普通用户每天限制使用 {dailyLimit} 次。</p>
            </div>
        )}

        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4 relative z-0">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={user ? "例如：加班、相亲、减肥..." : "登录后即可开始生成..."}
            disabled={isLimitReached}
            className="flex-1 px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-slate-900 dark:text-white disabled:opacity-60 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
            maxLength={20}
          />
          <button
            type="submit"
            disabled={isLoading || !topic || isLimitReached || !user || isCurrentTopicDisabled}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {user ? '开始粉碎' : '请先登录'}
          </button>
        </form>
        
        {/* Error Message for Disabled Topic */}
        {isCurrentTopicDisabled && (
            <div className="mt-3 flex items-center gap-2 text-red-500 text-sm animate-in slide-in-from-top-1">
                <Ban size={14} />
                <span>该话题已被管理员暂时禁用，请尝试其他话题。</span>
            </div>
        )}

        {/* Topic Tags Area (Random Layout with Badges) */}
        {displayTopics.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 mb-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Flame size={12} className="text-orange-500" />
                    <span>热门话题灵感 (点击填入)</span>
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center items-center pb-2">
                    {displayTopics.map((tag, index) => (
                        <button
                            key={tag.id || tag.name}
                            onClick={() => handleTopicClick(tag.name)}
                            disabled={isLimitReached}
                            className={`
                                group relative border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                                ${index % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300' : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-300'}
                                hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md hover:-translate-y-0.5
                                rounded-lg px-5 py-2.5 text-sm font-medium
                            `}
                            style={{
                                // Add slight randomness to margin for "scattered" look
                                marginLeft: `${Math.random() * 10}px`,
                                marginRight: `${Math.random() * 10}px`
                            }}
                        >
                            <span className="relative z-10">{tag.name}</span>
                            
                            {/* Right Top Badge */}
                            <span className="absolute -top-2 -right-2 z-20 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-red-500 text-[10px] font-bold text-white rounded-full shadow-sm border-2 border-white dark:border-slate-900 transform scale-90 group-hover:scale-110 transition-transform">
                                {tag.battleCount > 99 ? '99+' : tag.battleCount}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>

      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 justify-center text-slate-500 dark:text-slate-400 text-sm mb-4">
              <Edit3 size={14} />
              <span>点击下方文本框可修改内容 (上限500字)</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/30 rounded-xl p-4 md:p-6 relative group focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all">
              <div className="flex justify-between items-center mb-3">
                  <div className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">Reality (反鸡汤)</div>
                  <span className={`text-[10px] ${result.anti.length >= 480 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{result.anti.length}/500</span>
              </div>
              <textarea 
                  value={result.anti}
                  onChange={(e) => handleContentChange('anti', e.target.value)}
                  className="w-full h-40 bg-transparent resize-none focus:outline-none text-xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-800"
                  placeholder="输入现实派观点..."
              />
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/30 rounded-xl p-4 md:p-6 relative group focus-within:ring-2 focus-within:ring-red-400 focus-within:border-transparent transition-all">
              <div className="flex justify-between items-center mb-3">
                  <div className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-widest">Fantasy (鸡汤)</div>
                  <span className={`text-[10px] ${result.soup.length >= 480 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{result.soup.length}/500</span>
              </div>
              <textarea 
                  value={result.soup}
                  onChange={(e) => handleContentChange('soup', e.target.value)}
                  className="w-full h-40 bg-transparent resize-none focus:outline-none text-xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed scrollbar-thin scrollbar-thumb-red-200 dark:scrollbar-thumb-red-800"
                  placeholder="输入鸡汤派观点..."
              />
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={handlePublish}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-12 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              发布这场PK <ArrowRight />
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
              注：发布的内容需要经过管理员审核后才会出现在首页。
          </p>
        </div>
      )}
    </div>
  );
};

export default Generator;
