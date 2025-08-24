@echo off
echo ========================================
echo 开始部署 - 防缓存版本
echo ========================================

echo.
echo [1/4] 清理旧的构建文件...
cd /d "%~dp0.."
if exist "frontend\dist" rmdir /s /q "frontend\dist"
if exist "backend\dist" rmdir /s /q "backend\dist"

echo.
echo [2/4] 构建前端项目（带时间戳哈希）...
cd frontend
npm run build
if %errorlevel% neq 0 (
    echo 前端构建失败！
    pause
    exit /b 1
)

echo.
echo [3/4] 构建后端项目...
cd ..\backend
npm run build
if %errorlevel% neq 0 (
    echo 后端构建失败！
    pause
    exit /b 1
)

echo.
echo [4/4] 部署到 Vercel...
echo.
echo 部署前端到 Vercel...
cd ..\frontend
vercel --prod
if %errorlevel% neq 0 (
    echo 前端部署失败！
    pause
    exit /b 1
)

echo.
echo 部署后端到 Vercel...
cd ..\backend
vercel --prod
if %errorlevel% neq 0 (
    echo 后端部署失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo 部署完成！所有文件都包含唯一时间戳哈希
echo 用户将自动获取最新版本，无缓存问题
echo ========================================
echo.
echo 前端地址: https://jizhang.lanbito.asia
echo 后端地址: https://backend.lanbito.asia
echo.
pause