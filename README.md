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
- **互动反馈**: 支持点赞、鼓掌、震惊等多种表情态势，投票后可见比例。
- **话题系统**: 支持话题分类（如工作、爱情、内卷），后台可管理话题状态。

### 🤖 AI 鸡汤粉碎机 (AI Generator)
- **Gemini 驱动**: 集成 Google Gemini 2.5 Flash 模型。
- **智能生成**: 输入或选择话题，AI 自动生成一对"虚伪鸡汤"与"残酷真相"。
- **编辑与发布**: 生成的内容支持用户在发布前二次编辑（限500字），发布后自动进入审核队列。
- **限流机制**: 普通用户每日有限额，管理员无限制。

### 🛡️ 完善的后台管理 (Admin System)
- **RBAC 权限控制**: 
    - **超级管理员**: 管理员成员管理、系统全局配置（每日限额、邮件服务、默认主题）。
    - **内容管理员**: 审核PK内容（支持修改文字）、管理评论、管理话题。
- **数据管理**: 支持回收站机制、置顶推荐、强制结束投票。

### 🎨 现代化 UI/UX
- **深色模式**: 支持浅色/深色/跟随系统自动切换。
- **响应式设计**: 完美适配移动端与桌面端。
- **交互细节**: 粒子投票动效、骨架屏加载、Toast 提示。

---

## 🛠️ 技术栈 (Tech Stack)

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS (PostCSS integration), Lucide React Icons
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Database Strategy**: 
    - **Development**: In-Memory Mock Data (无数据库也可运行)
    - **Production**: PostgreSQL (推荐 Vercel Postgres)
- **Build Tool**: Parcel / Vite

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

创建 `.env.local` 文件并配置必要的环境变量：

```env
# 必选: Gemini API Key
API_KEY=your_gemini_api_key_here

# 可选: 数据库连接 (不填则使用模拟数据模式)
POSTGRES_URL=postgres://user:password@host:port/database
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 开始体验！

> 💡 **提示**: 项目支持 Mock 数据模式，无需数据库即可运行。如需持久化存储，请参考部署指南中的数据库配置步骤。

---

## 🗄️ 数据库配置 (Database Setup)

项目支持两种数据存储模式：

### Mock 数据模式 (默认)
- **无需配置数据库**
- 数据存储在内存中，刷新页面后重置
- 适合快速体验和开发测试

### PostgreSQL 持久化模式
项目提供了完整的数据库初始化工具：

#### 本地开发环境
```bash
# 1. 导入表结构
psql -d your_database_name -f docs/schema.sql

# 2. 创建管理员账号
node docs/init_admin_email.js
```

#### Vercel 生产环境
1. 在 Vercel Storage 控制台的 Query 选项卡中执行 `docs/schema.sql`
2. 使用 SQL 命令手动创建管理员账号（见部署指南）

数据库表结构包含：用户、话题、PK对决、评论、投票、反应等完整功能支持。

---

## 📦 部署指南 (Deployment)

### 本地开发部署

#### 1. 环境准备
```bash
git clone https://github.com/your-username/anti-soup-battle.git
cd anti-soup-battle
npm install
```

#### 2. 环境变量配置
在项目根目录创建 `.env.local` 文件：

```env
# 必选配置
API_KEY=your_gemini_api_key_here

# 可选配置
POSTGRES_URL=postgres://user:password@host:port/database

# 邮件服务配置 (可选，用于 Magic Link 登录)
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# 或者使用 Mailgun (可选)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
```

#### 3. 数据库配置 (可选)
如果要使用数据库持久化存储：

1. **导入表结构**:
   ```bash
   psql -d your_database_name -f docs/schema.sql
   ```

2. **创建管理员账号**:
   ```bash
   node docs/init_admin_email.js
   ```

#### 4. 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:3000` 即可看到应用。

---

### Vercel 生产部署

#### 1. 代码部署
1. **Fork 本仓库** 到你的 GitHub
2. **登录 Vercel** 并点击 "Add New Project"
3. 选择你的仓库进行导入
4. **部署**: 点击 Deploy

#### 2. 环境变量配置
在 Vercel Dashboard 中配置环境变量 (Settings → Environment Variables)：

**必选配置:**
- `API_KEY`: 你的 Gemini API Key (从 https://aistudio.google.com/app/apikey 获取)

**可选配置:**
- `POSTGRES_URL`: Vercel Postgres 连接字符串 (创建数据库后自动注入)
- `EMAILJS_SERVICE_ID`: EmailJS 服务 ID
- `EMAILJS_TEMPLATE_ID`: EmailJS 模板 ID
- `EMAILJS_PUBLIC_KEY`: EmailJS 公钥
- `MAILGUN_API_KEY`: Mailgun API 密钥
- `MAILGUN_DOMAIN`: Mailgun 域名

#### 3. 数据库初始化
部署完成后初始化数据库：

1. **导入表结构**:
   - 进入 Vercel Storage 控制台 → Postgres → Data → Query
   - 粘贴 `docs/schema.sql` 的内容并执行

2. **创建管理员账号**:
   在 Query 中执行以下 SQL (替换为你的邮箱):
   ```sql
   INSERT INTO users (id, name, email, avatar, provider, role, created_at)
   VALUES ('u_admin_main', '系统管理员', 'your-email@example.com', 'https://ui-avatars.com/api/?name=Admin&background=blue', 'system', 'super_admin', CURRENT_TIMESTAMP)
   ON CONFLICT (email) DO UPDATE SET
       role = 'super_admin',
       updated_at = CURRENT_TIMESTAMP;
   ```

#### 4. 访问应用
部署完成后即可通过 Vercel 提供的域名访问应用。

---

## 📂 目录结构 (Project Structure)

```
.
├── components/        # React UI 组件
│   ├── HeroBattle.tsx     # 核心PK卡片
│   ├── Generator.tsx      # AI 生成器
│   ├── AdminPanel.tsx     # 后台管理面板
│   └── ...
├── services/          # 业务逻辑服务
│   ├── geminiService.ts   # AI 接口封装
│   ├── dataProvider.ts    # 数据层 (适配 API/Mock)
│   └── mockDb.ts          # 本地模拟数据
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

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.