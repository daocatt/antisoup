import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> by Anti-Soup Team
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
          © {new Date().getFullYear()} 反鸡汤联盟. 现实虽然残酷，但我们依然爱你。
        </p>
      </div>
    </footer>
  );
};

export default Footer;