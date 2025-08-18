#!/usr/bin/env node

/**
 * 部署脚本
 * 用于自动化部署流程，包括环境检查、构建和部署
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironment() {
  log('🔍 检查环境配置...', 'blue');
  
  const envFile = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envFile)) {
    log('❌ .env 文件不存在，请先创建环境配置文件', 'red');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = [
    'JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'FRONTEND_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm');
    return !regex.test(envContent);
  });
  
  if (missingVars.length > 0) {
    log(`❌ 缺少必需的环境变量: ${missingVars.join(', ')}`, 'red');
    process.exit(1);
  }
  
  log('✅ 环境配置检查通过', 'green');
}

function runTests() {
  log('🧪 运行测试...', 'blue');
  
  try {
    execSync('npm test', { stdio: 'inherit' });
    log('✅ 测试通过', 'green');
  } catch (error) {
    log('❌ 测试失败', 'red');
    process.exit(1);
  }
}

function buildProject() {
  log('🔨 构建项目...', 'blue');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    log('✅ 构建完成', 'green');
  } catch (error) {
    log('❌ 构建失败', 'red');
    process.exit(1);
  }
}

function deployToVercel() {
  log('🚀 部署到 Vercel...', 'blue');
  
  try {
    execSync('vercel --prod', { stdio: 'inherit' });
    log('✅ 部署成功', 'green');
  } catch (error) {
    log('❌ 部署失败', 'red');
    process.exit(1);
  }
}

function deployToRailway() {
  log('🚀 部署到 Railway...', 'blue');
  
  try {
    execSync('railway up', { stdio: 'inherit' });
    log('✅ 部署成功', 'green');
  } catch (error) {
    log('❌ 部署失败', 'red');
    process.exit(1);
  }
}

function main() {
  const platform = process.argv[2];
  
  log('🎯 开始部署流程...', 'magenta');
  
  // 检查环境
  checkEnvironment();
  
  // 运行测试（如果存在）
  if (fs.existsSync(path.join(__dirname, '..', 'package.json'))) {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    if (packageJson.scripts && packageJson.scripts.test) {
      runTests();
    }
  }
  
  // 构建项目
  buildProject();
  
  // 部署到指定平台
  switch (platform) {
    case 'vercel':
      deployToVercel();
      break;
    case 'railway':
      deployToRailway();
      break;
    default:
      log('❓ 请指定部署平台: vercel 或 railway', 'yellow');
      log('用法: node scripts/deploy.js [vercel|railway]', 'cyan');
      process.exit(1);
  }
  
  log('🎉 部署完成！', 'green');
}

if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironment,
  runTests,
  buildProject,
  deployToVercel,
  deployToRailway
};