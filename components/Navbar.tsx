
import React from 'react';
import { ViewState, User, ThemeMode } from '../types';
import { Menu, User as UserIcon, LogOut, Zap, Shield, Sun, Moon, Laptop } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  user: User | null;
  onLogout: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, user, onLogout, theme, onToggleTheme }) => {
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');

  const ThemeIcon = () => {
      switch (theme) {
          case 'light': return <Sun size={20} className="text-orange-500" />;
          case 'dark': return <Moon size={20} className="text-blue-400" />;
          case 'system': return <Laptop size={20} className="text-slate-400" />;
      }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer" onClick={() => setView('home')}>
            <Zap className="h-8 w-8 text-blue-600 mr-2" />
            <span className="font-black text-xl tracking-tighter text-slate-800 dark:text-white">
              ANTI<span className="text-red-500">SOUP</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setView('home')}
              className={`${currentView === 'home' ? 'text-blue-600 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'} transition-colors`}
            >
              首页
            </button>
            <button 
              onClick={() => setView('history')}
              className={`${currentView === 'history' ? 'text-blue-600 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'} transition-colors`}
            >
              PKs
            </button>
            <button 
              onClick={() => setView('generator')}
              className={`${currentView === 'generator' ? 'text-blue-600 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'} transition-colors`}
            >
              鸡汤粉碎机
            </button>
            {isAdmin && (
                <button 
                onClick={() => setView('admin')}
                className={`${currentView === 'admin' ? 'text-blue-600 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'} transition-colors flex items-center gap-1`}
              >
                <Shield size={16} />
                后台管理
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
                onClick={onToggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={`当前模式: ${theme === 'system' ? '跟随系统' : theme === 'light' ? '亮色' : '暗色'}`}
            >
                <ThemeIcon />
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" />
                  <div className="flex flex-col text-left">
                     <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block leading-none">{user.name}</span>
                     {isAdmin && <span className="text-[10px] text-blue-600 font-bold hidden sm:block">ADMIN</span>}
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="退出登录"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setView('login')}
                className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-all hover:shadow-lg active:scale-95"
              >
                <UserIcon size={18} />
                <span>登录</span>
              </button>
            )}
            
            {/* Mobile Menu Button - Simplified for demo */}
            <div className="md:hidden">
              <Menu className="text-slate-600 dark:text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;