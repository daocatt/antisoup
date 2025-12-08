
import React from 'react';
import { Battle } from '../types';
import { Trophy, ArrowRight, Clock, Hash } from 'lucide-react';

interface HistorySectionProps {
  battles: Battle[];
  onViewAll?: () => void;
  onSelectBattle?: (battleId: string) => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({ battles, onViewAll, onSelectBattle }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
          <Trophy className="text-yellow-500" />
          <span>PK TOP 10</span>
        </h3>
        {onViewAll && (
            <button 
                onClick={onViewAll}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1 group"
            >
                查看全部 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        )}
      </div>

      <div className="space-y-4">
        {battles.map((battle, index) => {
           const total = battle.antiVotes + battle.soupVotes;
           const antiWin = battle.antiVotes > battle.soupVotes;
           const isExpired = new Date(battle.expiresAt) < new Date();

           return (
            <div 
                key={battle.id} 
                onClick={() => onSelectBattle && onSelectBattle(battle.id)}
                className="group relative p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded font-bold uppercase">
                    #{index + 1}
                    </span>
                    {/* Add Topic Display here to ensure it's shown in the list */}
                    {battle.topic && (
                        <span className="flex items-center gap-0.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-600">
                            <Hash size={10} /> {battle.topic}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${isExpired ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900'}`}>
                        {isExpired ? '已结束' : '进行中'}
                    </span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <div className={`flex-1 text-sm font-medium ${antiWin ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                  {battle.antiContent}
                </div>
                <div className="hidden md:block text-slate-300 dark:text-slate-600 font-black italic">VS</div>
                <div className={`flex-1 text-sm font-medium ${!antiWin ? 'text-red-700 dark:text-red-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                  {battle.soupContent}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className={antiWin ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}>{battle.antiVotes} 票</span>
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${antiWin ? 'bg-blue-500' : 'bg-red-500'}`} 
                    style={{ width: `${(Math.max(battle.antiVotes, battle.soupVotes) / total) * 100}%` }}
                  ></div>
                </div>
                <span className={!antiWin ? 'text-red-600 dark:text-red-400 font-bold' : ''}>{battle.soupVotes} 票</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistorySection;
