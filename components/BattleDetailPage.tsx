import React, { useState } from 'react';
import { Battle, User, Comment, ReactionType } from '../types';
import HeroBattle from './HeroBattle';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';

interface BattleDetailPageProps {
  battle: Battle;
  currentUser: User | null;
  comments: Comment[];
  userReaction?: ReactionType | null;
  onVote: (battleId: string, side: 'soup' | 'anti') => void;
  onAddComment: (battleId: string, content: string, side: 'soup' | 'anti') => void;
  onReaction?: (battleId: string, type: ReactionType) => void;
  onBack: () => void;
  onRequireLogin: () => void;
}

const BattleDetailPage: React.FC<BattleDetailPageProps> = ({ 
  battle, 
  currentUser, 
  comments, 
  userReaction,
  onVote, 
  onAddComment, 
  onReaction,
  onBack,
  onRequireLogin
}) => {
  const [newComment, setNewComment] = useState('');
  const [hasVotedSession, setHasVotedSession] = useState<'soup' | 'anti' | null>(null);

  const handleVoteLocal = (battleId: string, side: 'soup' | 'anti') => {
      setHasVotedSession(side);
      onVote(battleId, side);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!currentUser) {
        onRequireLogin();
        return;
    }
    
    if (!hasVotedSession) {
        alert("请先在上方投票支持一方，然后才能发表评论。");
        return;
    }

    onAddComment(battle.id, newComment, hasVotedSession);
    setNewComment('');
  };

  const userHasCommented = currentUser && comments.some(c => c.userId === currentUser.id);

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-4 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
      >
        <ArrowLeft size={20} />
        返回列表
      </button>

      <HeroBattle 
        battle={battle} 
        onVote={handleVoteLocal} 
        onReaction={onReaction}
        userReaction={userReaction}
      />

      <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-10 transition-colors">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
            <MessageSquare className="text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">PK讨论 ({comments.length})</h2>
        </div>

        <div className="mb-10">
            {currentUser ? (
                userHasCommented ? (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center text-slate-500 dark:text-slate-400 text-sm flex flex-col items-center">
                        <span className="font-bold text-slate-600 dark:text-slate-300 mb-1">评论已提交</span>
                        <span>等待管理员审核通过后显示。</span>
                    </div>
                ) : hasVotedSession ? (
                    <form onSubmit={handleSubmitComment} className="flex gap-4">
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700" />
                        <div className="flex-1">
                            <div className="relative group">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={`作为【${hasVotedSession === 'anti' ? '现实派' : '鸡汤派'}】发表你的看法...`}
                                    className={`w-full p-4 pr-12 rounded-xl border-2 focus:outline-none transition-all duration-300 resize-none h-24 font-medium
                                    ${hasVotedSession === 'anti' 
                                        ? 'border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/20 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 placeholder-blue-300 dark:placeholder-blue-600 text-slate-700 dark:text-slate-200' 
                                        : 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/20 focus:bg-white dark:focus:bg-slate-800 focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/40 placeholder-red-300 dark:placeholder-red-600 text-slate-700 dark:text-slate-200'
                                    }`}
                                    maxLength={200}
                                />
                                <button 
                                    type="submit"
                                    disabled={!newComment.trim()}
                                    className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all duration-300 transform ${newComment.trim() ? 'scale-100 opacity-100' : 'scale-90 opacity-70'} 
                                    ${newComment.trim() 
                                        ? (hasVotedSession === 'anti' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200') 
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                            <div className="flex justify-between mt-2 px-1">
                                <span className={`text-xs font-bold ${hasVotedSession === 'anti' ? 'text-blue-400' : 'text-red-400'}`}>
                                    {hasVotedSession === 'anti' ? '🔵 正在为现实发声' : '🔴 正在为鸡汤辩护'}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">{newComment.length}/200</span>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center text-slate-500 dark:text-slate-400 text-sm">
                        请先在上方投票支持一方，然后才能发表评论。
                    </div>
                )
            ) : (
                <button 
                    onClick={onRequireLogin}
                    className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                    登录参与讨论
                </button>
            )}
        </div>

        <div className="space-y-6">
            {comments.map(comment => (
                <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <img src={comment.userAvatar} alt={comment.userName} className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-700" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{comment.userName}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${comment.side === 'anti' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/40'}`}>
                                {comment.side === 'anti' ? '现实派' : '鸡汤派'}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl text-sm">
                            {comment.content}
                        </p>
                    </div>
                </div>
            ))}
            {comments.length === 0 && (
                <div className="text-center text-slate-400 dark:text-slate-500 py-12">
                    暂无评论，来抢沙发吧！
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BattleDetailPage;