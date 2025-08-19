# Network Recovery and Auto Deploy Script
# 网络恢复检测和自动部署脚本

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Network Recovery & Auto Deploy" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Function to test GitHub connectivity
function Test-GitHubConnection {
    try {
        Write-Host "Testing GitHub connectivity..." -ForegroundColor Yellow
        $result = git ls-remote --heads origin 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $true
        } else {
            return $false
        }
    } catch {
        return $false
    }
}

# Function to deploy
function Start-Deploy {
    Write-Host "Starting deployment process..." -ForegroundColor Green
    
    # Check local status
    Write-Host "Checking local Git status..." -ForegroundColor Yellow
    git status --porcelain
    
    # Push to GitHub
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Code pushed to GitHub!" -ForegroundColor Green
        Write-Host ""
        
        # Show Render deployment guide
        Write-Host "Next: Complete Render Deployment" -ForegroundColor Cyan
        Write-Host "1. Visit: https://dashboard.render.com/" -ForegroundColor Blue
        Write-Host "2. Create Web Service from GitHub repo" -ForegroundColor White
        Write-Host "3. Set Root Directory: backend" -ForegroundColor White
        Write-Host "4. Configure environment variables" -ForegroundColor White
        Write-Host "5. Deploy and test" -ForegroundColor White
        Write-Host ""
        
        $openRender = Read-Host "Open Render Dashboard now? (y/N)"
        if ($openRender -eq "y" -or $openRender -eq "Y") {
            Start-Process "https://dashboard.render.com/"
            Write-Host "Render Dashboard opened" -ForegroundColor Green
        }
        
        return $true
    } else {
        Write-Host "ERROR: Failed to push to GitHub" -ForegroundColor Red
        return $false
    }
}

# Main execution
$maxAttempts = 5
$attempt = 1
$deploySuccess = $false

Write-Host "Checking network connectivity (max $maxAttempts attempts)..." -ForegroundColor Cyan
Write-Host ""

while ($attempt -le $maxAttempts -and -not $deploySuccess) {
    Write-Host "Attempt $attempt/$maxAttempts" -ForegroundColor Yellow
    
    if (Test-GitHubConnection) {
        Write-Host "GitHub connection successful!" -ForegroundColor Green
        $deploySuccess = Start-Deploy
        break
    } else {
        Write-Host "GitHub connection failed (502 error or network issue)" -ForegroundColor Red
        
        if ($attempt -lt $maxAttempts) {
            Write-Host "Waiting 30 seconds before retry..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
        }
    }
    
    $attempt++
}

if (-not $deploySuccess) {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Red
    Write-Host "  Network Issue Persists" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "GitHub is still not accessible after $maxAttempts attempts." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative solutions:" -ForegroundColor Cyan
    Write-Host "1. Try mobile hotspot or different network" -ForegroundColor White
    Write-Host "2. Use VPN service" -ForegroundColor White
    Write-Host "3. Wait for GitHub service recovery" -ForegroundColor White
    Write-Host "4. Check OFFLINE_DEPLOY_GUIDE.md for manual options" -ForegroundColor White
    Write-Host ""
    Write-Host "Your code is safely committed locally." -ForegroundColor Green
    Write-Host "Run this script again when network recovers." -ForegroundColor Green
}

Write-Host ""
Write-Host "Script completed" -ForegroundColor Cyan
Read-Host "Press Enter to exit"