#!/usr/bin/env node

import { createPool } from '@vercel/postgres';
import { createInterface } from 'readline';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function initAdminEmail() {
  console.log('🚀 Anti-Soup 数据库管理员初始化工具');
  console.log('=====================================\n');

  try {
    // 1. 检查数据库连接
    if (!process.env.POSTGRES_URL) {
      console.error('❌ 未找到 POSTGRES_URL 环境变量');
      console.error('请确保 .env.local 文件中包含数据库连接字符串');
      process.exit(1);
    }

    // 2. 连接数据库
    console.log('🔌 连接数据库...');
    const pool = createPool();

    // 3. 确保用户表存在
    console.log('🛠️ 确保用户表存在...');
    await pool.sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT,
        email TEXT UNIQUE,
        provider TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. 检查现有管理员
    console.log('👀 检查现有管理员...');
    const existingAdmins = await pool.sql`
      SELECT id, name, email, created_at FROM users WHERE role = 'super_admin' ORDER BY created_at DESC
    `;

    if (existingAdmins.rows.length > 0) {
      console.log('\n📋 发现现有超级管理员:');
      existingAdmins.rows.forEach((admin, index) => {
        console.log(`  ${index + 1}. ${admin.name} (${admin.email}) - 创建时间: ${admin.created_at.toISOString().split('T')[0]}`);
      });

      const choice = await askQuestion('\n选择操作:\n  1. 创建新的管理员账号\n  2. 替换现有管理员\n  3. 取消操作\n请输入选择 (1-3): ');

      if (choice === '3') {
        console.log('❌ 操作已取消');
        await pool.end();
        rl.close();
        return;
      }

      if (choice === '2') {
        // 替换现有管理员
        const adminIndex = await askQuestion(`选择要替换的管理员 (1-${existingAdmins.rows.length}): `);
        const index = parseInt(adminIndex) - 1;

        if (isNaN(index) || index < 0 || index >= existingAdmins.rows.length) {
          console.error('❌ 无效选择');
          await pool.end();
          rl.close();
          return;
        }

        const targetAdmin = existingAdmins.rows[index];
        const newEmail = await askQuestion(`请输入新的管理员邮箱 (将替换 ${targetAdmin.email}): `);

        if (!newEmail || !newEmail.includes('@')) {
          console.error('❌ 请输入有效的邮箱地址');
          await pool.end();
          rl.close();
          return;
        }

        console.log(`🔄 更新管理员: ${targetAdmin.email} → ${newEmail}`);
        await pool.sql`
          UPDATE users SET
            email = ${newEmail},
            name = '系统管理员',
            avatar = 'https://ui-avatars.com/api/?name=Admin&background=blue',
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${targetAdmin.id}
        `;

        console.log('✅ 管理员账号更新成功！');
        console.log(`📧 新管理员邮箱: ${newEmail}`);

      } else {
        // 创建新管理员
        const email = await askQuestion('请输入新的管理员邮箱: ');

        if (!email || !email.includes('@')) {
          console.error('❌ 请输入有效的邮箱地址');
          await pool.end();
          rl.close();
          return;
        }

        // 检查邮箱是否已被使用
        const existingUser = await pool.sql`SELECT id FROM users WHERE email = ${email}`;
        if (existingUser.rows.length > 0) {
          console.error('❌ 此邮箱已被注册，请使用其他邮箱或选择替换现有管理员');
          await pool.end();
          rl.close();
          return;
        }

        console.log(`👤 创建新管理员账号: ${email}`);
        await pool.sql`
          INSERT INTO users (id, name, email, avatar, provider, role, created_at)
          VALUES ('u_admin_main', '系统管理员', ${email}, 'https://ui-avatars.com/api/?name=Admin&background=blue', 'system', 'super_admin', CURRENT_TIMESTAMP)
          ON CONFLICT (email) DO UPDATE SET
            role = 'super_admin',
            updated_at = CURRENT_TIMESTAMP;
        `;

        console.log('✅ 新管理员账号创建成功！');
        console.log(`📧 管理员邮箱: ${email}`);
      }

    } else {
      // 没有现有管理员，直接创建
      const email = await askQuestion('请输入管理员邮箱 (用于登录): ');

      if (!email || !email.includes('@')) {
        console.error('❌ 请输入有效的邮箱地址');
        await pool.end();
        rl.close();
        return;
      }

      console.log(`👤 创建管理员账号: ${email}`);
      await pool.sql`
        INSERT INTO users (id, name, email, avatar, provider, role, created_at)
        VALUES ('u_admin_main', '系统管理员', ${email}, 'https://ui-avatars.com/api/?name=Admin&background=blue', 'system', 'super_admin', CURRENT_TIMESTAMP)
        ON CONFLICT (email) DO UPDATE SET
          role = 'super_admin',
          updated_at = CURRENT_TIMESTAMP;
      `;

      console.log('✅ 管理员账号创建成功！');
      console.log(`📧 管理员邮箱: ${email}`);
    }

    await pool.end();

    console.log('\n🎉 初始化完成！您现在可以使用此邮箱登录系统并访问后台管理。');

  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

initAdminEmail();