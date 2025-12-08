
import React, { useState, useRef, useEffect } from 'react';
import { User, Battle, Comment, SystemConfig, EmailProvider, Topic } from '../types';
import { Shield, Settings, Mail, Save, Info, MoreHorizontal, ArrowUpCircle, ArrowDownCircle, StopCircle, Trash2, CheckCircle, XCircle, Plus, AlertCircle, RefreshCcw, X, Edit3, Monitor, Sun, Moon, Hash, Ban, Check, Type } from 'lucide-react';
import { dataProvider } from '../services/dataProvider';

interface AdminPanelProps {
  currentUser: User;
  battles: Battle[];
  comments: Comment[];
  admins: User[];
  systemConfig: SystemConfig;
  // We will now reload data from App via dataProvider mostly, but these props are kept for initial render or synced state
  onUpdateBattle: (battleId: string, updates: Partial<Battle>) => void;
  onUpdateCommentStatus: (commentId: string, status: 'approved' | 'rejected') => void;
  onAddAdmin: (name: string, email: string) => void;
  onRemoveAdmin: (adminId: string) => void;
  onUpdateSystemConfig: (config: SystemConfig) => void;
}

// Helper to check if click outside
function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  currentUser, 
  battles, 
  comments,
  admins, 
  systemConfig,
  onUpdateBattle, 
  onUpdateCommentStatus,
  onAddAdmin, 
  onRemoveAdmin,
  onUpdateSystemConfig
}) => {
  const [activeTab, setActiveTab] = useState<'battles' | 'comments' | 'topics' | 'users' | 'system'>('battles');
  const [subTab, setSubTab] = useState<'active' | 'ended' | 'pending' | 'trash'>('active');
  
  // Topic Management State
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  // Admin Add State
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  // Dropdown State
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Edit Expiry Modal State
  const [editingBattle, setEditingBattle] = useState<Battle | null>(null);
  const [editDate, setEditDate] = useState('');

  // Edit Content Modal State
  const [editingContentBattle, setEditingContentBattle] = useState<Battle | null>(null);
  const [editSoupContent, setEditSoupContent] = useState('');
  const [editAntiContent, setEditAntiContent] = useState('');

  // System Config State (Local buffer before save)
  const [localConfig, setLocalConfig] = useState<SystemConfig>(systemConfig);

  const isSuperAdmin = currentUser.role === 'super_admin';

  useOnClickOutside(dropdownRef, () => setOpenDropdownId(null));

  // Fetch topics when tab is active
  useEffect(() => {
      if (activeTab === 'topics') {
          const loadTopics = async () => {
              const data = await dataProvider.getTopics();
              setTopics(data);
          };
          loadTopics();
      }
  }, [activeTab]);

  // --- Filter Logic ---
  const now = new Date().getTime();
  
  const pendingBattles = battles.filter(b => b.status === 'pending');
  const trashBattles = battles.filter(b => b.status === 'rejected');
  const activeBattles = battles.filter(b => b.status === 'approved' && new Date(b.expiresAt).getTime() > now);
  const endedBattles = battles.filter(b => b.status === 'approved' && new Date(b.expiresAt).getTime() <= now);

  const currentList = 
    subTab === 'pending' ? pendingBattles : 
    subTab === 'trash' ? trashBattles : 
    subTab === 'ended' ? endedBattles : 
    activeBattles;

  const pendingComments = comments.filter(c => c.status === 'pending');

  // --- Battle Actions ---

  const handleAction = (action: () => void) => {
      action();
      setOpenDropdownId(null);
  };

  const openEditExpiry = (battle: Battle) => {
      setEditingBattle(battle);
      const date = new Date(battle.expiresAt);
      const isoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      setEditDate(isoString);
      setOpenDropdownId(null);
  };

  const saveExpiry = () => {
      if (editingBattle && editDate) {
          onUpdateBattle(editingBattle.id, { expiresAt: new Date(editDate).toISOString() });
          setEditingBattle(null);
      }
  };

  const openEditContent = (battle: Battle) => {
    setEditingContentBattle(battle);
    setEditSoupContent(battle.soupContent);
    setEditAntiContent(battle.antiContent);
    setOpenDropdownId(null);
  };

  const saveContent = () => {
    if (editingContentBattle) {
        if (editSoupContent.length > 500 || editAntiContent.length > 500) {
            alert("内容过长，请精简至500字以内。");
            return;
        }
        onUpdateBattle(editingContentBattle.id, {
            soupContent: editSoupContent,
            antiContent: editAntiContent
        });
        setEditingContentBattle(null);
    }
  };

  const toggleShelf = (battle: Battle) => {
      const newStatus = battle.status === 'approved' ? 'pending' : 'approved';
      onUpdateBattle(battle.id, { status: newStatus });
  };

  const endImmediately = (battle: Battle) => {
      onUpdateBattle(battle.id, { expiresAt: new Date().toISOString() });
  };

  const moveToTrash = (battle: Battle) => {
      onUpdateBattle(battle.id, { status: 'rejected' });
  };

  const restoreFromTrash = (battle: Battle) => {
      onUpdateBattle(battle.id, { status: 'pending' });
  };

  const togglePin = (battle: Battle) => {
      onUpdateBattle(battle.id, { isPinned: !battle.isPinned });
  };

  // --- Topic Actions ---
  const handleAddTopic = async () => {
      if (!newTopicName.trim()) return;
      setIsAddingTopic(true);
      try {
          const newTopic = await dataProvider.createTopic(newTopicName.trim());
          setTopics(prev => [...prev, newTopic]);
          setNewTopicName('');
      } finally {
          setIsAddingTopic(false);
      }
  };

  const toggleTopicStatus = async (topic: Topic) => {
      const newStatus = topic.status === 'active' ? 'disabled' : 'active';
      await dataProvider.updateTopic(topic.id, { status: newStatus });
      setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, status: newStatus } : t));
  };

  // --- Admin User Management ---
  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminEmail) {
        onAddAdmin('New Admin', newAdminEmail); 
        setNewAdminEmail('');
        setShowAddAdmin(false);
    }
  };

  // --- System Config ---
  const handleConfigSave = () => {
      onUpdateSystemConfig(localConfig);
      alert("系统配置已保存！");
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in relative">
      
      {/* Edit Expiry Modal */}
      {editingBattle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">修改结束时间</h3>
                      <button onClick={() => setEditingBattle(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20}/></button>
                  </div>
                  <div className="mb-6">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">话题: {editingBattle.topic}</p>
                      <input 
                        type="datetime-local" 
                        className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                      />
                  </div>
                  <div className="flex gap-3">
                      <button onClick={saveExpiry} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700">保存修改</button>
                      <button onClick={() => setEditingBattle(null)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-2 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600">取消</button>
                  </div>
              </div>
          </div>
      )}

      {/* Edit Content Modal */}
      {editingContentBattle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-in zoom-in-95 border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white">编辑PK内容</h3>
                          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded font-bold">审核模式</span>
                      </div>
                      <button onClick={() => setEditingContentBattle(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20}/></button>
                  </div>
                  <div className="mb-2 text-sm text-slate-500 dark:text-slate-400">话题: <span className="font-bold text-slate-800 dark:text-white">{editingContentBattle.topic}</span></div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                      <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-bold text-blue-600 dark:text-blue-400">Reality (反鸡汤)</label>
                            <span className={`text-xs ${editAntiContent.length > 500 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{editAntiContent.length}/500</span>
                          </div>
                          <textarea 
                            className="w-full h-32 border border-slate-300 dark:border-slate-600 bg-blue-50/50 dark:bg-slate-900 rounded-lg px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            value={editAntiContent}
                            onChange={(e) => setEditAntiContent(e.target.value)}
                            maxLength={500}
                          />
                      </div>
                      <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-bold text-red-600 dark:text-red-400">Soup (鸡汤)</label>
                            <span className={`text-xs ${editSoupContent.length > 500 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{editSoupContent.length}/500</span>
                          </div>
                          <textarea 
                            className="w-full h-32 border border-slate-300 dark:border-slate-600 bg-red-50/50 dark:bg-slate-900 rounded-lg px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                            value={editSoupContent}
                            onChange={(e) => setEditSoupContent(e.target.value)}
                            maxLength={500}
                          />
                      </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                      <button onClick={saveContent} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">保存并更新</button>
                      <button onClick={() => setEditingContentBattle(null)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">取消</button>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <Shield className="text-blue-600 w-8 h-8" />
            后台管理中心
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
                当前身份: <span className="font-bold text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{isSuperAdmin ? '超级管理员' : '管理员'}</span>
            </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
            <button onClick={() => setActiveTab('battles')} className={`px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap ${activeTab === 'battles' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>内容管理</button>
            <button onClick={() => setActiveTab('comments')} className={`px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap ${activeTab === 'comments' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>评论审核</button>
            <button onClick={() => setActiveTab('topics')} className={`px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap ${activeTab === 'topics' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>话题管理</button>
            {isSuperAdmin && (
                <>
                <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap ${activeTab === 'users' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>人员管理</button>
                <button onClick={() => setActiveTab('system')} className={`px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap ${activeTab === 'system' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>系统设置</button>
                </>
            )}
        </div>
      </div>

      {/* --- BATTLES TAB --- */}
      {(activeTab === 'battles') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-visible min-h-[500px]">
             {/* Sub Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                <button onClick={() => setSubTab('active')} className={`flex-1 py-3 text-sm font-bold whitespace-nowrap px-4 ${subTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    进行中 ({activeBattles.length})
                </button>
                <button onClick={() => setSubTab('ended')} className={`flex-1 py-3 text-sm font-bold whitespace-nowrap px-4 ${subTab === 'ended' ? 'text-slate-800 dark:text-white border-b-2 border-slate-800 dark:border-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    已结束 ({endedBattles.length})
                </button>
                <button onClick={() => setSubTab('pending')} className={`flex-1 py-3 text-sm font-bold whitespace-nowrap px-4 ${subTab === 'pending' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    待审核 ({pendingBattles.length})
                </button>
                <button onClick={() => setSubTab('trash')} className={`flex-1 py-3 text-sm font-bold whitespace-nowrap px-4 ${subTab === 'trash' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    回收站 ({trashBattles.length})
                </button>
            </div>

            {/* List Content */}
            <div className="overflow-visible">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                            <th className="p-4">话题</th>
                            <th className="p-4 hidden md:table-cell">内容预览</th>
                            <th className="p-4 text-right">有效期/状态</th>
                            <th className="p-4 text-center w-20">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {currentList.map(battle => (
                            <tr key={battle.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 group">
                                <td className="p-4 font-bold text-slate-800 dark:text-white align-top">
                                    {battle.topic}
                                    {battle.isPinned && <span className="ml-2 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">TOP</span>}
                                </td>
                                <td className="p-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs align-top hidden md:table-cell">
                                    <div className="truncate text-blue-600 dark:text-blue-400">🔵 {battle.antiContent}</div>
                                    <div className="truncate text-red-600 dark:text-red-400">🔴 {battle.soupContent}</div>
                                </td>
                                <td className="p-4 text-right align-top">
                                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{new Date(battle.expiresAt).toLocaleDateString()}</div>
                                    {new Date(battle.expiresAt).getTime() <= now && battle.status === 'approved' && (
                                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">已过期</span>
                                    )}
                                </td>
                                <td className="p-4 text-center align-top relative">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDropdownId(openDropdownId === battle.id ? null : battle.id);
                                        }}
                                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {openDropdownId === battle.id && (
                                        <div 
                                            ref={dropdownRef}
                                            className="absolute right-8 top-10 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in zoom-in-95 origin-top-right"
                                        >
                                            <div className="p-1">
                                                {/* Edit Content Action - Priority for Pending */}
                                                {battle.status === 'pending' && (
                                                     <button onClick={() => handleAction(() => openEditContent(battle))} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded flex items-center gap-2">
                                                        <Type size={14} className="text-orange-500"/> 编辑内容
                                                    </button>
                                                )}

                                                {battle.status !== 'rejected' && (
                                                     <button onClick={() => handleAction(() => openEditExpiry(battle))} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded flex items-center gap-2">
                                                        <Edit3 size={14} className="text-blue-500"/> 编辑有效期
                                                    </button>
                                                )}

                                                {(battle.status === 'approved' || battle.status === 'pending') && (
                                                    <button onClick={() => handleAction(() => toggleShelf(battle))} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded flex items-center gap-2">
                                                        {battle.status === 'approved' ? (
                                                            <>
                                                                <ArrowDownCircle size={14} className="text-orange-500"/> 下架 (转待审核)
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ArrowUpCircle size={14} className="text-green-500"/> 上架 (发布)
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                                {battle.status === 'approved' && (
                                                    <button onClick={() => handleAction(() => togglePin(battle))} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded flex items-center gap-2">
                                                        <Settings size={14} className="text-purple-500"/> {battle.isPinned ? '取消置顶' : '置顶'}
                                                    </button>
                                                )}

                                                {subTab === 'active' && (
                                                    <button onClick={() => handleAction(() => endImmediately(battle))} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded flex items-center gap-2">
                                                        <StopCircle size={14} className="text-slate-500"/> 立即结束
                                                    </button>
                                                )}

                                                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>

                                                {battle.status === 'rejected' && (
                                                     <button onClick={() => handleAction(() => restoreFromTrash(battle))} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded flex items-center gap-2">
                                                        <RefreshCcw size={14} className="text-blue-500"/> 还原
                                                    </button>
                                                )}

                                                {battle.status !== 'rejected' && (
                                                    <button onClick={() => handleAction(() => moveToTrash(battle))} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded flex items-center gap-2">
                                                        <Trash2 size={14}/> 删除 (回收站)
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* --- COMMENTS TAB --- */}
      {activeTab === 'comments' && (
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
               <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                   <h3 className="font-bold text-slate-700 dark:text-white">待审核评论 ({pendingComments.length})</h3>
               </div>
               <div className="divide-y divide-slate-100 dark:divide-slate-800">
                   {pendingComments.map(comment => (
                       <div key={comment.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 flex gap-4">
                           <img src={comment.userAvatar} className="w-10 h-10 rounded-full bg-slate-200" />
                           <div className="flex-1">
                               <div className="flex justify-between mb-1">
                                   <span className="font-bold text-slate-700 dark:text-slate-200">{comment.userName}</span>
                                   <span className={`text-xs px-2 py-0.5 rounded ${comment.side === 'anti' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                       {comment.side === 'anti' ? '挺现实' : '挺鸡汤'}
                                   </span>
                               </div>
                               <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{comment.content}</p>
                               <div className="flex gap-2">
                                   <button onClick={() => onUpdateCommentStatus(comment.id, 'approved')} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded font-bold hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center gap-1"><CheckCircle size={14}/> 批准</button>
                                   <button onClick={() => onUpdateCommentStatus(comment.id, 'rejected')} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded font-bold hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center gap-1"><XCircle size={14}/> 拒绝</button>
                               </div>
                           </div>
                       </div>
                   ))}
                   {pendingComments.length === 0 && (
                       <div className="p-8 text-center text-slate-400">太棒了，没有待审核的评论！</div>
                   )}
               </div>
           </div>
      )}

      {/* --- TOPICS TAB --- */}
      {activeTab === 'topics' && (
          <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex items-center gap-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full">
                          <Hash className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white">新增话题</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">添加新的话题供用户生成内容，禁用的话题将无法被选中。</p>
                      </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                      <input 
                          type="text" 
                          placeholder="输入话题名称..." 
                          className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newTopicName}
                          onChange={(e) => setNewTopicName(e.target.value)}
                      />
                      <button 
                          onClick={handleAddTopic}
                          disabled={isAddingTopic || !newTopicName.trim()}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                      >
                          <Plus size={18} /> 添加
                      </button>
                  </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">话题名称</th>
                            <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">状态</th>
                            <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">PK 数量</th>
                            <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {topics.map(topic => (
                            <tr key={topic.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800">
                                <td className="p-4 font-bold text-slate-800 dark:text-white">{topic.name}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${topic.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                        <span className={`w-2 h-2 rounded-full ${topic.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                                        {topic.status === 'active' ? '启用中' : '已禁用'}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-mono text-slate-500 dark:text-slate-400">{topic.battleCount}</td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => toggleTopicStatus(topic)}
                                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold mx-auto border ${topic.status === 'active' ? 'text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20' : 'text-green-600 border-green-200 hover:bg-green-50 dark:border-green-900/30 dark:hover:bg-green-900/20'}`}
                                    >
                                        {topic.status === 'active' ? <Ban size={14} /> : <Check size={14} />}
                                        {topic.status === 'active' ? '禁用' : '启用'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
          </div>
      )}

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && isSuperAdmin && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg text-slate-700 dark:text-white">添加管理员</h3>
                     {!showAddAdmin && (
                         <button onClick={() => setShowAddAdmin(true)} className="text-sm bg-slate-900 dark:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-800 dark:hover:bg-blue-700">
                             <Plus size={16} /> 添加新成员
                         </button>
                     )}
                </div>
                
                {showAddAdmin && (
                    <form onSubmit={handleAddAdmin} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                                type="email" 
                                placeholder="用户邮箱 (必须是已注册用户)" 
                                className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={newAdminEmail}
                                onChange={(e) => setNewAdminEmail(e.target.value)}
                                required
                            />
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">确认添加</button>
                                <button type="button" onClick={() => setShowAddAdmin(false)} className="px-4 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">取消</button>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                            <AlertCircle size={12} />
                            系统将自动匹配邮箱。如果该邮箱对应的用户不存在，请先让其注册。
                        </p>
                    </form>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">管理员</th>
                            <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {admins.map(admin => (
                            <tr key={admin.id}>
                                <td className="p-4 flex items-center gap-3">
                                    <img src={admin.avatar} className="w-8 h-8 rounded-full bg-slate-200" />
                                    <div>
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{admin.name}</div>
                                        <div className="text-xs text-slate-400">{admin.email}</div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <button onClick={() => onRemoveAdmin(admin.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
      )}

      {/* --- SYSTEM SETTINGS TAB --- */}
      {activeTab === 'system' && isSuperAdmin && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-8">
              {/* Settings Content... Same as before */}
              <section>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                      <Monitor className="w-5 h-5 text-slate-500" />
                      外观设置 (默认)
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 max-w-lg">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">默认显示模式</label>
                      <div className="grid grid-cols-3 gap-3">
                          <button
                            onClick={() => setLocalConfig({...localConfig, defaultTheme: 'light'})}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${localConfig.defaultTheme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-500'}`}
                          >
                              <Sun size={24} className="mb-2" />
                              <span className="text-xs font-bold">亮色</span>
                          </button>
                          <button
                            onClick={() => setLocalConfig({...localConfig, defaultTheme: 'dark'})}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${localConfig.defaultTheme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-500'}`}
                          >
                              <Moon size={24} className="mb-2" />
                              <span className="text-xs font-bold">暗色</span>
                          </button>
                          <button
                            onClick={() => setLocalConfig({...localConfig, defaultTheme: 'system'})}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${localConfig.defaultTheme === 'system' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-500'}`}
                          >
                              <Monitor size={24} className="mb-2" />
                              <span className="text-xs font-bold">跟随系统</span>
                          </button>
                      </div>
                  </div>
              </section>

              <section>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                      <Settings className="w-5 h-5 text-slate-500" />
                      常规设置
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 max-w-lg">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">普通用户每日生成限制 (次)</label>
                      <div className="flex gap-4">
                          <input 
                              type="number" 
                              min="0"
                              max="100"
                              className="w-32 px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={localConfig.dailyGenerationLimit}
                              onChange={(e) => setLocalConfig({...localConfig, dailyGenerationLimit: parseInt(e.target.value) || 0})}
                          />
                      </div>
                  </div>
              </section>

              <section>
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                      <Mail className="w-5 h-5 text-slate-500" />
                      邮件登录服务配置 (Magic Link)
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">邮件服务提供商</label>
                          <select 
                              className="w-full md:w-64 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                              value={localConfig.emailProvider}
                              onChange={(e) => setLocalConfig({...localConfig, emailProvider: e.target.value as EmailProvider})}
                          >
                              <option value="none">关闭 (仅模拟)</option>
                              <option value="emailjs">EmailJS (Client Side)</option>
                              <option value="mailgun">Mailgun (API)</option>
                          </select>
                      </div>
                  </div>
              </section>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                      onClick={handleConfigSave}
                      className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-blue-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                      <Save size={18} />
                      保存系统配置
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminPanel;
