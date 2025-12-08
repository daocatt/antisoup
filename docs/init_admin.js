
const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

/**
 * 初始化超级管理员脚本
 * 
 * 用法: 
 * 1. 确保项目根目录有 .env.local 文件，且包含 POSTGRES_URL
 * 2. 运行: node docs/init_admin.js
 */

async function initAdmin() {
  console.log('🔌 Connecting to database...');
  
  const pool = createPool();

  const SUPER_ADMIN = {
    id: 'u_super_root',
    name: '系统主宰 (Root)',
    email: 'admin@antisoup.com', // 这是你的登录识别邮箱
    avatar: 'https://ui-avatars.com/api/?name=Root&background=000&color=fff',
    provider: 'system', // 标识为系统内置账号
    role: 'super_admin'
  };

  try {
    // 1. 确保用户表存在 (虽然通常应该先运行 schema.sql，但这作为一种防御性编程)
    console.log('🛠️  Ensuring users table exists...');
    await pool.sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT,
        email TEXT,
        provider TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. 插入或更新超级管理员
    console.log(`👤 Upserting Super Admin: ${SUPER_ADMIN.name} (${SUPER_ADMIN.email})...`);
    
    // 注意：这里假设 id 是固定的。在实际 OAuth 登录中，ID 通常由 Provider 提供。
    // 如果你想将某个实际的 Google/Github 账号设为超管，请先登录一次获取 ID，或者直接使用 email 匹配更新。
    // 下面的 SQL 演示了如何根据 email 提升权限（如果用户已存在），或者插入新用户。
    
    // 策略 A: 强制插入特定的系统管理员账号
    await pool.sql`
      INSERT INTO users (id, name, avatar, email, provider, role)
      VALUES (${SUPER_ADMIN.id}, ${SUPER_ADMIN.name}, ${SUPER_ADMIN.avatar}, ${SUPER_ADMIN.email}, ${SUPER_ADMIN.provider}, ${SUPER_ADMIN.role})
      ON CONFLICT (id) DO UPDATE 
      SET role = 'super_admin', name = ${SUPER_ADMIN.name};
    `;

    // 策略 B (可选): 如果你想把你自己的 Google 账号设为超管，请取消注释并修改下方邮箱
    /*
    const MY_EMAIL = 'your_email@gmail.com';
    await pool.sql`
        UPDATE users SET role = 'super_admin' WHERE email = ${MY_EMAIL};
    `;
    */

    console.log('✅ Super Admin initialized successfully!');
    console.log('👉 您现在可以使用该账号登录，或在 LoginModal 中使用演示入口测试。');

  } catch (error) {
    console.error('❌ Error initializing admin:', error);
  } finally {
    await pool.end();
  }
}

initAdmin();
