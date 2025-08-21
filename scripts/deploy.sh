#!/bin/bash

echo "========================================"
echo "           项目部署脚本"
echo "========================================"
echo

echo "1. 构建前端项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "前端构建失败！"
    exit 1
fi

echo
echo "2. 构建后端项目..."
cd backend
npm run build
if [ $? -ne 0 ]; then
    echo "后端构建失败！"
    exit 1
fi

cd ..
echo
echo "========================================"
echo "构建完成！现在可以部署到 Vercel："
echo
echo "1. 部署前端：vercel --prod"
echo "2. 部署后端：cd backend && vercel --prod"
echo
echo "详细部署指南请查看：DEPLOYMENT_GUIDE.md"
echo "========================================"