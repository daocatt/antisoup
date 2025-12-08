
import React, { useState, useRef, useEffect } from 'react';
import { Battle, ReactionType } from '../types';
import { ThumbsUp, MessageCircleWarning, Heart, Check, Clock, MessageSquare, Plus, Smile, Link as LinkIcon } from 'lucide-react';

interface HeroBattleProps {
  battle: Battle;
  userReaction?: ReactionType | null;
  onVote: (battleId: string, side: 'soup' | 'anti') => void;
  onViewDetail?: (battleId: string) => void;
  onReaction?: (battleId: string, type: ReactionType) => void;
}

const REACTION_MAP: Record<ReactionType, string> = {
  like: '👍',
  clap: '👏',
  disagree: '👎',
  shock: '🤯',
  neutral: '😐'
};

const HeroBattle: React.FC<HeroBattleProps> = ({ battle, userReaction, onVote, onViewDetail, onReaction }) => {
  const [votedSide, setVotedSide] = useState<'soup' | 'anti' | null>(null);
  const [animatingSide, setAnimatingSide] = useState<'soup' | 'anti' | null>(null);
  const [showCopied, setShowCopied] = useState(false);
  
  // Reaction State
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [activeEmoji, setActiveEmoji] = useState<ReactionType | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const isExpired = new Date(battle.expiresAt) < new Date();

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowReactionPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVote = (side: 'soup' | 'anti') => {
    if (votedSide || isExpired) return; 
    
    setVotedSide(side);
    setAnimatingSide(side);
    onVote(battle.id, side);

    setTimeout(() => {
        setAnimatingSide(null);
    }, 300);
  };

  const getShareUrl = () => {
      // Construct deep link
      return `${window.location.origin}${window.location.pathname}?battleId=${battle.id}`;
  };

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    try {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
        console.error('Failed to copy');
    }
  };

  const handleShareToX = () => {
      const shareUrl = getShareUrl();
      const text = `【反鸡汤联盟】\n\n🔵 Reality: ${battle.antiContent}\n⚡ VS\n🔴 Fantasy: ${battle.soupContent}\n\n👇 谁是真理？来投票！`;
      const hashtags = "反鸡汤联盟,AntiSoup";
      
      const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(hashtags)}`;
      
      window.open(intentUrl, '_blank', 'width=600,height=400');
  };

  const handleReactionClick = (type: ReactionType) => {
      if (onReaction && !isExpired) {
          setActiveEmoji(type);
          onReaction(battle.id, type);
          // Keep picker open briefly to show animation
          setTimeout(() => {
              setActiveEmoji(null);
              setShowReactionPicker(false);
          }, 400);
      }
  };

  const totalVotes = battle.antiVotes + battle.soupVotes;
  const antiPercent = totalVotes === 0 ? 50 : Math.round((battle.antiVotes / totalVotes) * 100);
  const soupPercent = 100 - antiPercent;
  
  // Calculate total reactions and active types
  const reactionCounts = battle.reactionCounts || { like: 0, clap: 0, disagree: 0, shock: 0, neutral: 0 };
  const totalReactions = (Object.values(reactionCounts) as number[]).reduce((sum, count) => sum + count, 0);
  const activeReactionTypes = (Object.entries(reactionCounts) as [string, number][])
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]) // Sort by count desc
    .map(([type]) => type as ReactionType)
    .slice(0, 3); // Show top 3

  return (
    <div className="w-full flex flex-col md:flex-row relative overflow-hidden rounded-3xl shadow-2xl my-4 md:my-8 md:h-[600px] group/card select-none md:select-auto">
      
      {/* Share & Detail Buttons Container */}
      <div className="absolute top-16 md:top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        
        {/* Share Group */}
        <div className="flex items-center p-1 bg-black/20 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
            {/* Copy Link */}
            <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/20 text-white transition-all active:scale-95 group/copy"
                title="复制链接"
            >
                {showCopied ? <Check className="w-3 h-3 md:w-4 md:h-4 text-green-400" /> : <LinkIcon className="w-3 h-3 md:w-4 md:h-4 group-hover/copy:text-blue-200" />}
                <span className="text-[10px] md:text-xs font-bold tracking-wide">{showCopied ? '已复制' : '复制'}</span>
            </button>
            
            <div className="w-px h-3 bg-white/20 mx-1"></div>

            {/* Share to X */}
            <button
                onClick={handleShareToX}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-black/40 text-white transition-all active:scale-95 group/x"
                title="分享到 X (Twitter)"
            >
                 {/* X Logo SVG */}
                <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-4 md:h-4 fill-current group-hover/x:text-white" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-[10px] md:text-xs font-bold tracking-wide">分享</span>
            </button>
        </div>
        
        {onViewDetail && (
            <button
                onClick={() => onViewDetail(battle.id)}
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg group/detail h-[34px] md:h-[40px]"
                title="查看详情与评论"
            >
                <MessageSquare className="w-3 h-3 md:w-4 md:h-4 group-hover/detail:text-blue-200" />
                <span className="text-[10px] md:text-xs font-bold tracking-wide">详情</span>
            </button>
        )}
      </div>

      {/* VS Badge */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="bg-white dark:bg-slate-800 rounded-full p-1.5 md:p-2 shadow-[0_0_20px_rgba(0,0,0,0.3)] md:shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-colors duration-300">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-2xl md:text-4xl w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-full border-4 border-slate-100 dark:border-slate-700 italic vs-text transition-colors duration-300">
            VS
          </div>
        </div>
      </div>

      {/* Reaction Area */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30" ref={pickerRef}>
         {/* Reaction Trigger Button (Stacked) */}
         <button
            onClick={() => !isExpired && setShowReactionPicker(!showReactionPicker)}
            disabled={isExpired}
            className={`relative flex items-center gap-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md pl-3 pr-4 py-2 rounded-full shadow-xl border-2 border-slate-100 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all duration-200 group/reaction ${isExpired ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
         >
             {totalReactions === 0 ? (
                 <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover/reaction:text-yellow-500 transition-colors">
                     <Smile size={16} />
                 </div>
             ) : (
                 <div className="flex -space-x-2 mr-1">
                     {activeReactionTypes.map((type, i) => (
                         <div key={type} className={`w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-sm shadow-sm z-[3-i] ${activeEmoji === type ? 'animate-[pulse_0.5s_ease-in-out]' : ''}`}>
                             {REACTION_MAP[type]}
                         </div>
                     ))}
                 </div>
             )}
             
             <div className="flex flex-col items-start leading-none">
                <span className={`font-bold text-sm ${totalReactions > 0 ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {totalReactions > 0 ? totalReactions : '表态'}
                </span>
                {totalReactions > 0 && <span className="text-[10px] text-slate-400">人已表态</span>}
             </div>
             
             {!isExpired && <Plus size={14} className="text-slate-300 group-hover/reaction:text-blue-500 transition-colors ml-1" />}
         </button>

         {/* Reaction Picker Popover */}
         {showReactionPicker && (
             <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-full shadow-2xl p-2 flex items-center gap-1 border border-slate-100 dark:border-slate-700 animate-in slide-in-from-bottom-2 zoom-in-95 origin-bottom">
                 {(Object.keys(REACTION_MAP) as ReactionType[]).map((type) => (
                     <button
                        key={type}
                        onClick={() => handleReactionClick(type)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-125 relative
                            ${activeEmoji === type ? 'scale-125 bg-blue-50 dark:bg-slate-600' : ''}
                        `}
                     >
                         <span className={activeEmoji === type ? 'animate-[pulse_0.4s_ease-in-out_infinite]' : ''}>{REACTION_MAP[type]}</span>
                         {activeEmoji === type && (
                             <span className="absolute -top-4 text-xs font-bold text-blue-600 dark:text-blue-400 animate-[bounce_0.5s_ease-out]">+1</span>
                         )}
                         {userReaction === type && activeEmoji !== type && (
                             <span className="absolute bottom-0 w-1 h-1 bg-blue-500 rounded-full"></span>
                         )}
                     </button>
                 ))}
             </div>
         )}
      </div>

      {/* Left: Anti-Soup (Blue) */}
      <div className={`relative flex-1 bg-gradient-to-br from-blue-600 to-indigo-800 p-6 pt-12 pb-24 md:p-12 md:pb-20 flex flex-col justify-center items-center text-center text-white transition-all duration-500 group min-h-[350px] md:min-h-0 ${isExpired ? 'grayscale-[0.3]' : 'hover:flex-[1.1]'}`}>
        <div className="absolute top-4 left-4 bg-blue-900/30 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase backdrop-blur-sm">
          REALITY CHECK
        </div>
        
        <MessageCircleWarning className="w-10 h-10 md:w-16 md:h-16 mb-4 md:mb-6 opacity-80 group-hover:scale-110 transition-transform duration-300" />
        
        <h2 className="text-xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 leading-tight drop-shadow-md px-2">
          "{battle.antiContent}"
        </h2>
        
        <div className="mt-auto flex flex-col items-center gap-3 md:gap-4 w-full max-w-xs mb-8 md:mb-0 relative">
          
          {/* Expired Badge for Button */}
          {isExpired && (
             <div className="animate-in fade-in slide-in-from-bottom-2 absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20 shadow-lg flex items-center gap-1.5 z-20">
                <Clock className="w-3 h-3 text-red-400" />
                <span>投票已截止</span>
             </div>
          )}

          <button 
            onClick={() => handleVote('anti')}
            disabled={votedSide !== null || isExpired}
            className={`
              w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-2 md:gap-3 transition-all duration-200 ease-out transform
              ${isExpired 
                 ? 'bg-slate-800/40 text-slate-300 cursor-not-allowed border-2 border-white/5 opacity-80'
                 : animatingSide === 'anti'
                    ? 'bg-white text-blue-700 shadow-[0_0_50px_rgba(59,130,246,0.8)] scale-110 ring-8 ring-blue-400/80 z-10'
                    : votedSide === 'anti' 
                      ? 'bg-white text-blue-700 shadow-lg scale-105 ring-4 ring-blue-300/50 z-10' 
                      : votedSide === 'soup'
                        ? 'bg-blue-800/50 text-blue-200 cursor-not-allowed grayscale-[0.5]'
                        : 'bg-blue-700 hover:bg-white hover:text-blue-700 shadow-lg hover:shadow-xl active:scale-95 border-2 border-transparent'
              }
            `}
          >
            <ThumbsUp className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 ${votedSide === 'anti' ? 'fill-current' : ''} ${animatingSide === 'anti' ? 'animate-bounce' : ''}`} />
            <span>支持现实 (+1)</span>
          </button>
          
          <div className="w-full text-center">
            <span className="text-2xl md:text-4xl font-black">{battle.antiVotes}</span>
            <span className="text-blue-200 ml-2 text-xs md:text-sm">票</span>
          </div>
        </div>
      </div>

      {/* Right: Soup (Red) */}
      <div className={`relative flex-1 bg-gradient-to-bl from-red-500 to-pink-600 p-6 pt-20 pb-24 md:p-12 md:pb-20 flex flex-col justify-center items-center text-center text-white transition-all duration-500 group min-h-[350px] md:min-h-0 ${isExpired ? 'grayscale-[0.3]' : 'hover:flex-[1.1]'}`}>
        <div className="absolute top-4 right-4 bg-red-900/30 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase backdrop-blur-sm">
          CHICKEN SOUP
        </div>

        <Heart className="w-10 h-10 md:w-16 md:h-16 mb-4 md:mb-6 opacity-80 group-hover:scale-110 transition-transform duration-300" />

        <h2 className="text-xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 leading-tight drop-shadow-md font-serif italic px-2">
          "{battle.soupContent}"
        </h2>

        <div className="mt-auto flex flex-col items-center gap-3 md:gap-4 w-full max-w-xs mb-8 md:mb-0 relative">
          
          {/* Expired Badge for Button */}
          {isExpired && (
             <div className="animate-in fade-in slide-in-from-bottom-2 absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20 shadow-lg flex items-center gap-1.5 z-20">
                <Clock className="w-3 h-3 text-red-400" />
                <span>投票已截止</span>
             </div>
          )}

          <button 
            onClick={() => handleVote('soup')}
            disabled={votedSide !== null || isExpired}
            className={`
              w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-2 md:gap-3 transition-all duration-200 ease-out transform
              ${isExpired 
                 ? 'bg-slate-800/40 text-slate-300 cursor-not-allowed border-2 border-white/5 opacity-80'
                 : animatingSide === 'soup'
                    ? 'bg-white text-red-600 shadow-[0_0_50px_rgba(239,68,68,0.8)] scale-110 ring-8 ring-red-400/80 z-10'
                    : votedSide === 'soup' 
                      ? 'bg-white text-red-600 shadow-lg scale-105 ring-4 ring-red-300/50 z-10' 
                      : votedSide === 'anti'
                        ? 'bg-red-800/50 text-red-200 cursor-not-allowed grayscale-[0.5]'
                        : 'bg-red-600 hover:bg-white hover:text-red-600 shadow-lg hover:shadow-xl active:scale-95 border-2 border-transparent'
              }
            `}
          >
            <Heart className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 ${votedSide === 'soup' ? 'fill-current' : ''} ${animatingSide === 'soup' ? 'animate-bounce' : ''}`} />
            <span>干了这碗 (+1)</span>
          </button>

          <div className="w-full text-center">
            <span className="text-2xl md:text-4xl font-black">{battle.soupVotes}</span>
            <span className="text-red-200 ml-2 text-xs md:text-sm">票</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-2 flex">
        <div style={{ width: `${antiPercent}%` }} className={`h-full bg-blue-400 z-10 transition-all duration-500 ${isExpired ? 'opacity-60' : 'shadow-[0_0_10px_rgba(59,130,246,0.8)]'}`}></div>
        <div style={{ width: `${soupPercent}%` }} className={`h-full bg-red-400 z-10 transition-all duration-500 ${isExpired ? 'opacity-60' : 'shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`}></div>
      </div>
    </div>
  );
};

export default HeroBattle;
