import React, { useEffect, useState } from 'react';
import { Github, Mail, ShieldAlert, ArrowRight, Check, Loader2, RefreshCw } from 'lucide-react';
import { User, MOCK_USER, MOCK_SUPER_ADMIN, SystemConfig } from '../types';
import { dataProvider } from '../services/dataProvider';
import { emailService } from '../services/emailService';

interface LoginModalProps {
  systemConfig?: SystemConfig;
  onLogin: (user: User) => void;
  onCancel: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ systemConfig, onLogin, onCancel }) => {
  const [showDemoAdmin, setShowDemoAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [sentMessage, setSentMessage] = useState('');
  const [mockLink, setMockLink] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const shouldShow = await dataProvider.shouldShowDemoAdminEntry();
      setShowDemoAdmin(shouldShow);
    };
    checkStatus();
  }, []);
  
  const handleMockLogin = (provider: 'google' | 'github') => {
    const user = { ...MOCK_USER, provider };
    onLogin(user);
  };

  const handleSuperAdminLogin = () => {
      onLogin(MOCK_SUPER_ADMIN);
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !systemConfig) return;

      setIsSendingLink(true);
      setMockLink(null);
      
      try {
          const result = await emailService.sendLoginLink(email, systemConfig);
          if (result.success) {
              setLinkSent(true);
              setSentMessage(result.message);
              if (result.mockLink) setMockLink(result.mockLink);
          } else {
              alert(result.message);
          }
      } catch (error) {
          alert("发送失败，请检查网络设置。");
      } finally {
          setIsSendingLink(false);
      }
  };

  const handleMockClickLink = () => {
      // Simulate verifying the token and logging in
      const newUser: User = {
          id: `u_${btoa(email).substring(0,8)}`,
          name: email.split('@')[0],
          email: email,
          avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`,
          provider: 'email',
          role: 'user', // Default role
          createdAt: new Date().toISOString()
      };
      onLogin(newUser);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8 relative border border-slate-200 dark:border-slate-800 transition-colors">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">加入反鸡汤联盟</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">认清现实，从登录开始</p>
        </div>

        {/* Email Login Flow */}
        {!linkSent ? (
            <div className="mb-6">
                <form onSubmit={handleMagicLinkLogin} className="space-y-3">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                            type="email" 
                            required
                            placeholder="输入您的邮箱" 
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={isSendingLink || !email}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isSendingLink ? <Loader2 className="animate-spin" /> : <ArrowRight size={18} />}
                        发送登录链接
                    </button>
                    {systemConfig && systemConfig.emailProvider === 'none' && (
                        <p className="text-[10px] text-center text-slate-400">
                            (当前为演示模式，点击发送将直接显示模拟链接)
                        </p>
                    )}
                </form>
            </div>
        ) : (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 p-6 rounded-xl text-center border border-green-100 dark:border-green-900/50 animate-in zoom-in-95">
                <div className="bg-green-100 dark:bg-green-900/40 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="text-green-600 dark:text-green-400 w-6 h-6" />
                </div>
                <h3 className="font-bold text-green-800 dark:text-green-300 mb-1">邮件已发送!</h3>
                <p className="text-sm text-green-700 dark:text-green-400 mb-4">{sentMessage}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">请检查您的邮箱 {email} 并点击链接登录。</p>
                
                {mockLink ? (
                     <button 
                        onClick={handleMockClickLink}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 flex items-center justify-center gap-2"
                     >
                        [演示] 模拟点击收到的链接
                     </button>
                ) : (
                     <button 
                        onClick={() => setLinkSent(false)}
                        className="text-sm text-slate-400 hover:text-blue-600 flex items-center justify-center gap-1 mx-auto"
                     >
                        <RefreshCw size={12} /> 未收到？重试
                     </button>
                )}
            </div>
        )}

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">或通过其他方式</span></div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => handleMockLogin('github')}
            className="w-full flex items-center justify-center gap-3 bg-[#24292e] dark:bg-black text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            <Github size={20} />
            <span>GitHub 快速登录</span>
          </button>
          
          <button 
            onClick={() => handleMockLogin('google')}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google 快速登录</span>
          </button>
        </div>

        {showDemoAdmin && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
               <button onClick={handleSuperAdminLogin} className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-red-500 transition-colors">
                  <ShieldAlert size={14} />
                  <span>我是超级管理员 (演示通道)</span>
               </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;