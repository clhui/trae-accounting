# Render Auto Deploy Script
Write-Host "================================" -ForegroundColor Cyan
Write-Host "   Render Auto Deploy Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Git status
Write-Host "Checking Git status..." -ForegroundColor Yellow
git status --porcelain

# Add all changes
Write-Host "Adding all changes..." -ForegroundColor Yellow
git add .

# Commit changes
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMsg = "Auto deploy to Render - $timestamp"
Write-Host "Committing changes: $commitMsg" -ForegroundColor Yellow
git commit -m "$commitMsg"

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Code pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps for Render Deployment:" -ForegroundColor Cyan
    Write-Host "1. Visit: https://dashboard.render.com/" -ForegroundColor Blue
    Write-Host "2. Create New Web Service" -ForegroundColor White
    Write-Host "3. Connect your GitHub repository" -ForegroundColor White
    Write-Host "4. Set Root Directory: backend" -ForegroundColor White
    Write-Host "5. Set Build Command: npm install" -ForegroundColor White
    Write-Host "6. Set Start Command: npm start" -ForegroundColor White
    Write-Host "7. Add environment variables" -ForegroundColor White
    Write-Host ""
    Write-Host "For detailed instructions, see RENDER_DEPLOY.md" -ForegroundColor Cyan
    
    $open = Read-Host "Open Render Dashboard? (y/N)"
    if ($open -eq "y" -or $open -eq "Y") {
        Start-Process "https://dashboard.render.com/"
    }
} else {
    Write-Host "ERROR: Failed to push to GitHub" -ForegroundColor Red
    Write-Host "Please check your network connection and try again" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Script completed" -ForegroundColor Cyan
Read-Host "Press Enter to exit"