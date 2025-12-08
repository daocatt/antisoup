
import React from 'react';
import { User } from '../types';
import { Flame } from 'lucide-react';

interface LeaderboardProps {
  users: User[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 h-full transition-colors duration-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
          <Flame className="text-orange-500 w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">活跃鉴毒师</h3>
      </div>

      <div className="space-y-4">
        {users.map((user, index) => (
          <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className="relative">
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700 group-hover:border-orange-200 dark:group-hover:border-orange-800 transition-colors" />
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                {index + 1}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-700 dark:text-slate-200 truncate">{user.name}</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">已参与 {120 - index * 15} 次投票</p>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">
                Lv.{10 - index}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;