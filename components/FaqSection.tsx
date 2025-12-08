import React from 'react';
import { HelpCircle } from 'lucide-react';

const FaqSection: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-300 rounded-3xl p-8 md:p-12 relative overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <HelpCircle size={300} />
      </div>

      <div className="relative z-10 max-w-3xl">
        <h2 className="text-3xl font-bold text-white mb-8">关于「反鸡汤联盟」</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-2">Q: 为什么要建这个网站？</h3>
            <p className="leading-relaxed">
              在这个充满过度美化和廉价鼓励的互联网时代，我们往往被"只要努力就能成功"的幸存者偏差所误导。
              这个网站旨在通过幽默和犀利的PK，戳破虚幻的泡沫，让大家看到生活的B面——那里也许不完美，但更真实。
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-2">Q: 这里的观点太消极了怎么办？</h3>
            <p className="leading-relaxed">
              "反鸡汤"不是贩卖焦虑或消极，而是倡导一种"清醒的乐观主义"。
              认清现实的残酷依然热爱生活，比盲目的自我感动更有力量。这里的每一句"毒舌"，其实都是对现实生活的深情调侃。
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-2">Q: 如何参与？</h3>
            <p className="leading-relaxed">
              你可以对首页的观点进行投票，支持你认同的一方。
              如果你有好的创意，可以使用我们的"鸡汤粉碎机"生成新的PK，或者登录后分享你自己的原创观点。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqSection;