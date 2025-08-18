#!/usr/bin/env node

/**
 * Railway 部署脚本
 * 用于快速部署到 Railway 平台
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Railway 部署脚本启动...');

// 检查必要文件
function checkFiles() {
  const requiredFiles = [
    'package.json',
    'railway.json',
    'Procfile',
    '.env.example'
  ];
  
  console.log('📋 检查必要文件...');
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ 缺少文件: ${file}`);
      process.exit(1);
    }
    console.log(`✅ ${file}`);
  }
}

// 构建项目
function buildProject() {
  console.log('🔨 构建项目...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 构建完成');
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

// 检查 Railway CLI
function checkRailwayCLI() {
  console.log('🔍 检查 Railway CLI...');
  try {
    execSync('railway --version', { stdio: 'pipe' });
    console.log('✅ Railway CLI 已安装');
    return true;
  } catch (error) {
    console.log('⚠️  Railway CLI 未安装');
    return false;
  }
}

// 显示手动部署指南
function showManualGuide() {
  console.log('\n📖 手动部署指南:');
  console.log('\n1. 访问 https://railway.app 并登录');
  console.log('2. 点击 "New Project" -> "Deploy from GitHub repo"');
  console.log('3. 选择你的仓库和 backend 目录');
  console.log('4. 配置环境变量:');
  console.log('   - NODE_ENV=production');
  console.log('   - JWT_SECRET=your_jwt_secret');
  console.log('   - SUPABASE_URL=your_supabase_url');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY=your_key');
  console.log('   - FRONTEND_URL=your_frontend_url');
  console.log('5. 部署完成后测试 API: https://your-app.up.railway.app/api/health');
  console.log('\n📄 详细说明请查看 RAILWAY_DEPLOY.md');
}

// CLI 部署
function deployWithCLI() {
  console.log('🚀 使用 CLI 部署到 Railway...');
  try {
    // 检查是否已登录
    try {
      execSync('railway whoami', { stdio: 'pipe' });
    } catch {
      console.log('🔐 请先登录 Railway...');
      execSync('railway login', { stdio: 'inherit' });
    }
    
    // 检查是否已初始化项目
    if (!fs.existsSync('.railway')) {
      console.log('🆕 初始化 Railway 项目...');
      execSync('railway init', { stdio: 'inherit' });
    }
    
    // 部署
    console.log('📤 开始部署...');
    execSync('railway up', { stdio: 'inherit' });
    
    console.log('\n🎉 部署完成！');
    console.log('📋 请在 Railway Dashboard 中:');
    console.log('   1. 配置环境变量');
    console.log('   2. 检查部署状态');
    console.log('   3. 获取应用 URL');
    
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    console.log('\n💡 建议使用手动部署方式');
    showManualGuide();
  }
}

// 主函数
function main() {
  try {
    checkFiles();
    buildProject();
    
    const hasCLI = checkRailwayCLI();
    
    if (hasCLI) {
      console.log('\n选择部署方式:');
      console.log('1. 使用 CLI 自动部署');
      console.log('2. 查看手动部署指南');
      
      // 简化：直接尝试 CLI 部署
      deployWithCLI();
    } else {
      console.log('\n💡 由于网络限制，建议使用手动部署方式');
      showManualGuide();
    }
    
  } catch (error) {
    console.error('❌ 部署脚本执行失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { main, checkFiles, buildProject, showManualGuide };