# 防缓存部署脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "Start Deploy - Cache Busting Version" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# 获取脚本所在目录的父目录
$scriptDir = $PSScriptRoot
if (-not $scriptDir) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

try {
    Write-Host "`n[1/4] Cleaning old build files..." -ForegroundColor Yellow
    if (Test-Path "frontend\dist") {
        Remove-Item "frontend\dist" -Recurse -Force
        Write-Host "Frontend build files cleaned" -ForegroundColor Gray
    }
    if (Test-Path "backend\dist") {
        Remove-Item "backend\dist" -Recurse -Force
        Write-Host "Backend build files cleaned" -ForegroundColor Gray
    }

    Write-Host "`n[2/4] Building frontend with timestamp hash..." -ForegroundColor Yellow
    Set-Location "frontend"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend build failed!"
    }
    Write-Host "Frontend build successful with unique timestamp hash" -ForegroundColor Green

    Write-Host "`n[3/4] Building backend..." -ForegroundColor Yellow
    Set-Location "..\backend"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Backend build failed!"
    }
    Write-Host "Backend build successful" -ForegroundColor Green

    Write-Host "`n[4/4] Deploying to Vercel..." -ForegroundColor Yellow
    
    Write-Host "`nDeploying frontend to Vercel..." -ForegroundColor Cyan
    Set-Location "..\frontend"
    vercel --prod
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend deployment failed!"
    }
    Write-Host "Frontend deployment successful" -ForegroundColor Green

    Write-Host "`nDeploying backend to Vercel..." -ForegroundColor Cyan
    Set-Location "..\backend"
    vercel --prod
    if ($LASTEXITCODE -ne 0) {
        throw "Backend deployment failed!"
    }
    Write-Host "Backend deployment successful" -ForegroundColor Green

    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "Deployment Complete! All files have unique timestamp hash" -ForegroundColor Green
    Write-Host "Users will automatically get the latest version, no cache issues" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`nFrontend URL: https://jizhang.lanbito.asia" -ForegroundColor White
    Write-Host "Backend URL: https://backend.lanbito.asia" -ForegroundColor White
    
    # 显示构建文件信息
    Write-Host "`nBuild Information:" -ForegroundColor Yellow
    $timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    Write-Host "Build timestamp: $timestamp" -ForegroundColor Gray
    
} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
} finally {
    Set-Location $projectRoot
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")