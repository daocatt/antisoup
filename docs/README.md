
# 数据库与权限初始化指南

本文档说明如何在本地或 Vercel 环境中初始化 PostgreSQL 数据库结构，并创建首位超级管理员。

## 1. 准备工作

确保你的项目中安装了必要的依赖：

```bash
npm install @vercel/postgres dotenv
```

确保项目根目录下有 `.env.local` 文件，并包含数据库连接字符串：

```env
POSTGRES_URL="postgres://default:xxxxxx@ep-xxxx.us-east-1.postgres.vercel-storage.com:5432/verceldb"
```

## 2. 初始化数据库结构 (Schema)

`docs/schema.sql` 包含了完整的表结构定义。

**方法 A: Vercel Dashboard (推荐)**
1. 打开 Vercel 项目控制台 -> Storage -> Postgres -> Data.
2. 点击 "Query" 标签页。
3. 复制 `docs/schema.sql` 的内容并在查询框中运行。

**方法 B: 命令行工具**
如果你配置了本地 psql 或其他数据库客户端，直接连接并运行 SQL 文件即可。

## 3. 初始化超级管理员

我们提供了一个脚本来快速设置第一个超级管理员。

运行以下命令：

```bash
node docs/init_admin.js
```

### 脚本做了什么？
1. 连接数据库。
2. 确保 `users` 表存在。
3. 插入一个 ID 为 `u_super_root` 的超级管理员账号，或者更新现有账号权限。

### 如何将我自己的真实账号设为管理员？
1. 先在网站上使用 Google 或 GitHub 登录一次（这会在数据库创建一条 `role='user'` 的记录）。
2. 修改 `docs/init_admin.js` 中的策略 B 部分，填入你的邮箱。
3. 重新运行 `node docs/init_admin.js`。

## 4. 验证

1. 启动项目 `npm run dev`。
2. 如果是本地开发环境，点击登录弹窗底部的 **"我是超级管理员 (演示通道)"**，系统将模拟使用 `u_super_root` 登录。
3. 如果是线上环境且你已提升了自己的账号权限，直接正常登录即可看到顶部的 **"后台管理"** 入口。
