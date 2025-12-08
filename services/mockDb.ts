
import { Battle, User, Comment, SystemConfig, Topic } from '../types';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const INITIAL_CONFIG: SystemConfig = {
    dailyGenerationLimit: 2,
    emailProvider: 'none',
    defaultTheme: 'system'
};

export const INITIAL_TOPICS: Topic[] = [
    { id: 't_1', name: '工作', battleCount: 0, status: 'active' },
    { id: 't_2', name: '爱情', battleCount: 0, status: 'active' },
    { id: 't_3', name: '失败', battleCount: 0, status: 'active' },
    { id: 't_4', name: '旅行', battleCount: 0, status: 'active' },
    { id: 't_5', name: '梦想', battleCount: 0, status: 'active' },
    { id: 't_6', name: '金钱', battleCount: 0, status: 'active' },
    { id: 't_7', name: '孤独', battleCount: 0, status: 'active' },
    { id: 't_8', name: '社交', battleCount: 0, status: 'active' },
    { id: 't_9', name: '婚姻', battleCount: 0, status: 'active' },
    { id: 't_10', name: '职场', battleCount: 0, status: 'active' },
    { id: 't_11', name: '减肥', battleCount: 0, status: 'active' },
    { id: 't_12', name: '内卷', battleCount: 0, status: 'active' },
    { id: 't_13', name: '相亲', battleCount: 0, status: 'active' },
    { id: 't_14', name: '买房', battleCount: 0, status: 'active' },
    { id: 't_15', name: '考研', battleCount: 0, status: 'active' },
];

export const INITIAL_BATTLES: Battle[] = [
  {
    id: 'b_1',
    topic: '工作',
    soupContent: '把公司当成家，你的付出老板都看在眼里。',
    soupVotes: 124,
    antiContent: '把公司当家，这周房租你给免了吗？',
    antiVotes: 892,
    authorId: 'u_system',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() + THIRTY_DAYS_MS).toISOString(),
    isPinned: true,
    status: 'approved',
    reactionCounts: { like: 120, clap: 45, disagree: 12, shock: 89, neutral: 5 }
  },
  {
    id: 'b_2',
    topic: '爱情',
    soupContent: '你是我的唯一，没有你我活不下去。',
    soupVotes: 45,
    antiContent: '地球离了谁都转，没有你我活得更好，甚至省了一笔钱。',
    antiVotes: 567,
    authorId: 'u_system',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    expiresAt: new Date(Date.now() + THIRTY_DAYS_MS).toISOString(),
    isPinned: false,
    status: 'approved',
    reactionCounts: { like: 56, clap: 12, disagree: 4, shock: 33, neutral: 2 }
  },
  {
    id: 'b_3',
    topic: '失败',
    soupContent: '失败是成功之母，每一次跌倒都是为了飞得更高。',
    soupVotes: 89,
    antiContent: '失败是成功之母，但你这母亲好像有点不孕不育。',
    antiVotes: 734,
    authorId: 'u_system',
    createdAt: new Date(Date.now() - 250000000).toISOString(),
    expiresAt: new Date(Date.now() - 100000).toISOString(), // Expired example
    isPinned: false,
    status: 'approved',
    reactionCounts: { like: 20, clap: 5, disagree: 1, shock: 10, neutral: 0 }
  },
  {
    id: 'b_4',
    topic: '旅行',
    soupContent: '来一场说走就走的旅行，洗涤心灵。',
    soupVotes: 230,
    antiContent: '说走就走是因为没工作，洗涤心灵回来还得面对空空如也的银行卡。',
    antiVotes: 612,
    authorId: 'u_system',
    createdAt: new Date(Date.now() - 300000000).toISOString(),
    expiresAt: new Date(Date.now() + THIRTY_DAYS_MS).toISOString(),
    isPinned: false,
    status: 'approved',
    reactionCounts: { like: 88, clap: 23, disagree: 9, shock: 45, neutral: 12 }
  }
];

// Generate more mock data for history page testing
const topics = ['梦想', '努力', '青春', '孤独', '金钱', '快乐', '成长', '社交', '职场', '婚姻'];
const soupTemplates = [
    '只要心里有阳光，到哪都是晴天。',
    '你现在的气质里，藏着你读过的书。',
    '不要因为走得太远，而忘记为什么出发。',
    '生活不止眼前的苟且，还有诗和远方。',
    '努力不一定成功，但放弃一定失败。'
];
const antiTemplates = [
    '只要心里有阳光，就会发现还是晒得慌。',
    '你现在的气质里，藏着你吃过的麻辣烫。',
    '不要因为走得太远，就忘了还没还钱。',
    '生活不止眼前的苟且，还有读不懂的诗和到不了的远方。',
    '努力不一定成功，但是不努力真的很舒服。'
];

for (let i = 5; i <= 250; i++) {
    const topic = topics[i % topics.length];
    const soup = soupTemplates[i % soupTemplates.length] + ` (#${i})`;
    const anti = antiTemplates[i % antiTemplates.length] + ` (#${i})`;
    
    INITIAL_BATTLES.push({
        id: `b_${i}`,
        topic: topic,
        soupContent: soup,
        soupVotes: Math.floor(Math.random() * 500),
        antiContent: anti,
        antiVotes: Math.floor(Math.random() * 2000), 
        authorId: 'u_system',
        createdAt: new Date(Date.now() - i * 86400000 * 0.5).toISOString(),
        expiresAt: new Date(Date.now() + (Math.random() > 0.8 ? -10000 : THIRTY_DAYS_MS)).toISOString(), // Some expired
        isPinned: false,
        status: 'approved',
        reactionCounts: {
            like: Math.floor(Math.random() * 50),
            clap: Math.floor(Math.random() * 20),
            disagree: Math.floor(Math.random() * 10),
            shock: Math.floor(Math.random() * 5),
            neutral: Math.floor(Math.random() * 5),
        }
    });
}

export const TOP_USERS: User[] = [
  { id: 'u_1', name: '人间清醒', avatar: 'https://picsum.photos/seed/u1/100/100', email: 'u1@example.com', provider: 'github', role: 'user', createdAt: '' },
  { id: 'u_2', name: '毒舌大师', avatar: 'https://picsum.photos/seed/u2/100/100', email: 'u2@example.com', provider: 'google', role: 'user', createdAt: '' },
  { id: 'u_3', name: '躺平协会会长', avatar: 'https://picsum.photos/seed/u3/100/100', email: 'u3@example.com', provider: 'github', role: 'user', createdAt: '' },
  { id: 'u_4', name: '反卷斗士', avatar: 'https://picsum.photos/seed/u4/100/100', email: 'u4@example.com', provider: 'google', role: 'user', createdAt: '' },
  { id: 'u_5', name: '真相帝', avatar: 'https://picsum.photos/seed/u5/100/100', email: 'u5@example.com', provider: 'github', role: 'user', createdAt: '' },
];

export const INITIAL_ADMINS: User[] = [
    { id: 'u_admin1', name: '内容管理员', avatar: 'https://ui-avatars.com/api/?name=Admin', email: 'mod@antisoup.com', provider: 'google', role: 'admin', createdAt: new Date().toISOString() }
];

export const INITIAL_COMMENTS: Comment[] = [
    {
        id: 'c_1',
        battleId: 'b_1',
        userId: 'u_1',
        userName: '人间清醒',
        userAvatar: 'https://picsum.photos/seed/u1/100/100',
        content: '这话说的太对了，老板的饼画得再大也填不饱肚子。',
        side: 'anti',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'approved'
    },
    {
        id: 'c_2',
        battleId: 'b_1',
        userId: 'u_2',
        userName: '毒舌大师',
        userAvatar: 'https://picsum.photos/seed/u2/100/100',
        content: '公司是家？那我可以穿睡衣上班吗？',
        side: 'anti',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        status: 'approved'
    },
    {
        id: 'c_3',
        battleId: 'b_1',
        userId: 'u_3',
        userName: '奋斗逼',
        userAvatar: 'https://picsum.photos/seed/u3/100/100',
        content: '虽然但是，努力工作还是为了自己积累经验吧。',
        side: 'soup',
        createdAt: new Date(Date.now() - 1200000).toISOString(),
        status: 'approved'
    }
];