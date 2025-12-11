
# 数据库与权限初始化指南

本文档说明如何在本地或 Vercel 环境中初始化 PostgreSQL 数据库结构，并创建首位超级管理员。

## 1. 准备工作

确保你的项目中安装了必要的依赖：

```bash
npm install @vercel/postgres dotenv
```

### 本地开发环境
确保项目根目录下有 `.env.local` 文件，并包含数据库连接字符串：

```env
POSTGRES_URL="postgres://your_local_db_connection_string"
```

### Vercel 生产环境
在 Vercel 中，环境变量通过 Dashboard 设置，而不是通过 `.env` 文件：

1. 进入 Vercel 项目 Dashboard
2. 导航到 Settings → Environment Variables
3. 添加 `POSTGRES_URL` 变量（值从 Vercel Postgres 数据库获取）
4. 重新部署项目以应用新环境变量

## 2. 初始化数据库结构 (Schema)

`docs/schema.sql` 包含了完整的表结构定义。

**方法 A: Vercel Dashboard (推荐)**
1. 打开 Vercel 项目控制台 -> Storage -> Postgres -> Data.
2. 点击 "Query" 标签页。
3. 复制 `docs/schema.sql` 的内容并在查询框中运行。

**方法 B: 命令行工具**
如果你配置了本地 psql 或其他数据库客户端，直接连接并运行 SQL 文件即可。

```bash
psql -d your_database_name -f docs/schema.sql
```

## 3. 创建管理员账号

### 本地开发环境

数据库结构导入完成后，运行管理员初始化脚本：

```bash
node docs/init_admin_email.js
```

此脚本将：
- 连接到已配置的数据库（从 `.env.local` 读取连接信息）
- **检查现有管理员账号**并显示列表
- 让您选择创建新管理员或替换现有管理员
- 直接在数据库中创建/更新管理员账号
- **不会修改任何文件**，确保邮箱信息不会意外提交到版本控制

### Vercel 生产环境

如果您使用 Vercel 且无法运行脚本，可以在数据库查询界面手动创建管理员：

1. 打开 Vercel 项目控制台 → Storage → Postgres → Data
2. 点击 "Query" 标签页
3. 运行以下 SQL（将 `your-email@example.com` 替换为您的邮箱）：

```sql
INSERT INTO users (id, name, email, avatar, provider, role, created_at)
VALUES ('u_admin_main', '系统管理员', 'your-email@example.com', 'https://ui-avatars.com/api/?name=Admin&background=blue', 'system', 'super_admin', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    updated_at = CURRENT_TIMESTAMP;
```

## 4. 验证

1. 启动项目 `npm run dev`。
2. **如果未配置数据库**（使用模拟数据模式），点击登录弹窗底部的 **"我是超级管理员 (演示通道)"**，系统将模拟使用 `u_super_root` 登录。
3. **如果已配置数据库**，使用正常的登录方式（Google/GitHub），然后访问后台管理入口。
   - **注意：** 在本地环境中，即使配置了数据库，如果数据库连接失败或 API 不可用，演示通道仍可能显示作为后备选项。
