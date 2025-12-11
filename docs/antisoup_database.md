
# 数据库结构定义 (SQL)

以下 SQL 语句用于初始化 PostgreSQL 数据库。包含了所有必要的表结构、索引和初始数据。

```sql
-- 启用 UUID 扩展 (用于生成唯一 ID)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 用户表 (Users)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    avatar TEXT,
    provider TEXT NOT NULL, -- 'google', 'github', 'email', 'system'
    role TEXT NOT NULL DEFAULT 'user', -- 'user', 'admin', 'super_admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    daily_generations INTEGER DEFAULT 0,
    last_generation_date DATE DEFAULT CURRENT_DATE
);

-- 2. 话题表 (Topics)
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'disabled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PK对决表 (Battles)
CREATE TABLE IF NOT EXISTS battles (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic TEXT NOT NULL,
    topic_id TEXT REFERENCES topics(id),
    soup_content TEXT NOT NULL, -- 鸡汤内容
    soup_votes INTEGER DEFAULT 0,
    anti_content TEXT NOT NULL, -- 反鸡汤内容
    anti_votes INTEGER DEFAULT 0,
    author_id TEXT REFERENCES users(id),
    status TEXT DEFAULT 'pending', -- 'pending' (待审核), 'approved' (已发布), 'rejected' (已拒绝)
    is_pinned BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reaction_counts JSONB DEFAULT '{}'::jsonb -- 存储表情统计 { like: 10, clap: 5 ... }
);

-- 4. 评论表 (Comments)
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    battle_id TEXT REFERENCES battles(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id),
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    side TEXT NOT NULL, -- 'soup' (挺鸡汤) or 'anti' (挺现实)
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 投票记录表 (Votes History - 防止重复刷票或用于审计)
CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    battle_id TEXT REFERENCES battles(id) ON DELETE CASCADE,
    user_id TEXT, -- 如果未登录可能是 Session ID 或 Null
    side TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. 表情反应记录表 (Reactions History)
CREATE TABLE IF NOT EXISTS reactions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    battle_id TEXT REFERENCES battles(id) ON DELETE CASCADE,
    user_id TEXT,
    type TEXT NOT NULL, -- 'like', 'clap', 'shock', 'disagree', 'neutral'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. 系统配置表 (System Config - 单例表)
CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    daily_generation_limit INTEGER DEFAULT 5,
    email_provider TEXT DEFAULT 'none', -- 'none', 'emailjs', 'mailgun'
    default_theme TEXT DEFAULT 'system', -- 'light', 'dark', 'system'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- 8. 索引优化 (Indexes)
CREATE INDEX IF NOT EXISTS idx_battles_status_expires ON battles(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_battles_created_at ON battles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_battle_id ON comments(battle_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 9. 初始种子数据 (Seed Data)

-- 初始化系统配置
INSERT INTO system_config (id, daily_generation_limit, email_provider, default_theme)
VALUES (1, 5, 'none', 'system')
ON CONFLICT (id) DO NOTHING;

-- 初始化默认话题
INSERT INTO topics (name, status) VALUES 
('工作', 'active'),
('爱情', 'active'),
('失败', 'active'),
('旅行', 'active'),
('梦想', 'active'),
('金钱', 'active'),
('孤独', 'active'),
('社交', 'active'),
('婚姻', 'active'),
('职场', 'active'),
('减肥', 'active'),
('内卷', 'active'),
('相亲', 'active'),
('买房', 'active'),
('考研', 'active')
ON CONFLICT (name) DO NOTHING;
```
