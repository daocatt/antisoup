
import React, { useState, useEffect, useRef } from 'react';
import { Battle } from '../types';
import { Trophy, Clock, Loader2, Hash } from 'lucide-react';

interface HistoryPageProps {
  battles: Battle[];
  onSelectBattle: (battleId: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ battles, onSelectBattle }) => {
  const [displayCount, setDisplayCount] = useState(30);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const MAX_DISPLAY = 200;
  const BATCH_SIZE = 20;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && displayCount < Math.min(battles.length, MAX_DISPLAY)) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [displayCount, battles.length]);

  const loadMore = () => {
    setIsLoadingMore(true);
    // Simulate network delay for effect
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + BATCH_SIZE, Math.min(battles.length, MAX_DISPLAY)));
      setIsLoadingMore(false);
    }, 500);
  };

  const visibleBattles = battles.slice(0, displayCount);
  const hasMore = displayCount < Math.min(battles.length, MAX_DISPLAY);

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white">历史PK记录</h2>
        <p className="text-slate-500 dark:text-slate-400">回顾过往的每一次交锋，见证现实与幻想的碰撞</p>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>共 {battles.length} 场PK</span>
        </div>
        <div className="flex items-center gap-2">
          <span>显示 {displayCount} 条</span>
          {displayCount >= MAX_DISPLAY && <span className="text-orange-500">(已达最大显示限制)</span>}
        </div>
      </div>

      <div className="space-y-4">
        {visibleBattles.map((battle) => {
           const antiWin = battle.antiVotes > battle.soupVotes;
           const isExpired = new Date(battle.expiresAt) < new Date();
           
           return (
            <div 
                key={battle.id} 
                onClick={() => onSelectBattle(battle.id)}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              {/* Topic Header */}
              <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                    <Hash className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{battle.topic}</h3>
              </div>

              <div className="flex flex-col md:flex-row h-full mt-2">
                  {/* Anti Side */}
                  <div className={`flex-1 p-4 flex flex-col justify-between transition-colors ${antiWin ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                      <div className="mb-2">
                          <span className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wide">Reality</span>
                          <p className={`font-medium ${antiWin ? 'text-blue-900 dark:text-blue-100 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                              {battle.antiContent}
                          </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                          {antiWin && <Trophy className="w-3 h-3 text-yellow-500" />}
                          <span>{battle.antiVotes} 票</span>
                      </div>
                  </div>

                  {/* Divider / VS */}
                  <div className="h-px md:h-auto w-full md:w-px bg-slate-100 dark:bg-slate-800 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 text-[10px] text-slate-300 font-black px-1">VS</div>
                  </div>

                  {/* Soup Side */}
                  <div className={`flex-1 p-4 flex flex-col justify-between transition-colors ${!antiWin ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                      <div className="mb-2">
                          <span className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wide">Soup</span>
                          <p className={`font-medium ${!antiWin ? 'text-red-900 dark:text-red-100 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                              {battle.soupContent}
                          </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 justify-end">
                          <span>{battle.soupVotes} 票</span>
                          {!antiWin && <Trophy className="w-3 h-3 text-yellow-500" />}
                      </div>
                  </div>
              </div>

              {/* Footer info */}
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <span>{new Date(battle.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                      <span className={isExpired ? 'text-slate-400' : 'text-green-500 font-medium'}>
                          {isExpired ? '已结束' : '进行中'}
                      </span>
                  </div>
              </div>
            </div>
           );
        })}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="py-8 flex justify-center">
            {isLoadingMore ? (
                <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>加载更多...</span>
                </div>
            ) : (
                <button onClick={loadMore} className="text-slate-400 hover:text-blue-500 text-sm">
                    点击加载更多
                </button>
            )}
        </div>
      )}
      
      {!hasMore && battles.length > 0 && (
          <div className="text-center py-8 text-slate-300 dark:text-slate-600 text-sm">
              - 到底了，没有更多内容 -
          </div>
      )}
    </div>
  );
};

export default HistoryPage;
