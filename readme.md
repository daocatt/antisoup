# 🥣 Anti-Soup Battle (反鸡汤联盟)

![Status](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)
![Gemini AI](https://img.shields.io/badge/AI-Gemini_Flash-8e75b2)
![License](https://img.shields.io/badge/License-MIT-green)

> **现实与幻想的终极PK赛。**  
> 这是一个专注于反对虚假心灵鸡汤的社区。在这里，"毒鸡汤"（现实）与"热鸡汤"（幻想）交锋，由用户投票决定谁才是生活的真理。

---

## ✨ 核心特性 (Features)

### ⚖️ 观点PK (Battle Arena)
- **实时PK**: 首页展示正在进行的观点PK，红蓝阵营视觉冲击。
- **互动反馈**: 投票按钮支持粒子动效与震动反馈。
- **社交分享**: 一键生成PK文案，分享至社交媒体。

### 🤖 AI 鸡汤粉碎机 (AI Generator)
- **Gemini 驱动**: 集成 Google Gemini API。
- **自动生成**: 输入关键词（如"加班"、"相亲"），AI 自动生成一对"虚伪鸡汤"与"残酷真相"。
- **一键发布**: 生成的内容可直接发布为新的PK。

### 💬 深度互动
- **立场评论**: 用户必须先站队投票，才能以特定身份（现实派/鸡汤派）发表带有阵营颜色的评论。
- **排行榜**: 活跃鉴毒师榜单，展示社区贡献者。

### 🛡️ 完善的后台管理 (Admin System)
- **RBAC 权限控制**: 
    - **超级管理员**: 拥有最高权限，可管理管理员团队。
    - **内容管理员**: 可置顶帖子、管理投票有效期、强制结束投票。
- **PK管理**: 支持延长投票时间、重启已结束的投票或立即终止投票。

---

## 🛠️ 技术栈 (Tech Stack)

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Database**: PostgreSQL (适配 Vercel Postgres)
- **Build Tool**: Parcel / Vite (Demo environment)

---

## 🚀 快速开始 (Getting Started)

### 1. 环境准备

确保本地已安装 Node.js 18+。

```bash
git clone https://github.com/your-username/anti-soup-battle.git
cd anti-soup-battle
npm install
```

### 2. 环境变量配置

在项目根目录创建 `.env.local` 文件：

```env
# Google Gemini API Key (必须)
API_KEY=your_gemini_api_key_here

# PostgreSQL 连接 (可选，如需连接真实数据库)
POSTGRES_URL=postgres://...
```

### 3. 数据库初始化

本项目包含完整的 SQL Schema 和管理员初始化脚本。

- 查看 [数据库初始化指南](docs/README.md) 了解详细步骤。
- 运行 `node docs/init_admin.js` 快速创建超级管理员。

### 4. 启动开发服

```bash
npm start
```

访问 `http://localhost:1234` 即可看到应用。

---

## 📂 目录结构 (Project Structure)

```
.
├── components/        # React UI 组件
│   ├── HeroBattle.tsx     # 核心PK组件
│   ├── AdminPanel.tsx     # 后台管理面板
│   ├── Generator.tsx      # AI 生成器
│   └── ...
├── services/          # 业务逻辑服务
│   ├── geminiService.ts   # AI 接口封装
│   └── mockDb.ts          # 模拟数据与工具
├── docs/              # 文档与数据库脚本
│   ├── schema.sql         # 数据库表结构
│   └── init_admin.js      # 管理员初始化脚本
├── types.ts           # TypeScript 类型定义
└── App.tsx            # 应用主入口
```

## 🤝 贡献 (Contributing)

欢迎提交 Issue 或 Pull Request 来丰富这个反鸡汤的世界！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证 (License)

Distributed under the MIT License. See `LICENSE` for more information.