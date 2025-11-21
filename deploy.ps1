# Quick Deploy Script
# Run this to deploy to Firebase Hosting

Write-Host "🚀 Tradesnap Deployment Script" -ForegroundColor Cyan
Write-Host ""

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "⚠️  Warning: .env.production not found!" -ForegroundColor Yellow
    Write-Host "Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.production.example" ".env.production"
    Write-Host "✅ Created .env.production - Please edit and add your API keys!" -ForegroundColor Green
    Write-Host ""
    notepad .env.production
    $response = Read-Host "Press Enter when ready to continue (or Ctrl+C to cancel)"
}

Write-Host "📦 Building project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host ""
    
    $response = Read-Host "Deploy to Firebase? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "🚀 Deploying to Firebase Hosting..." -ForegroundColor Cyan
        firebase deploy --only hosting
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "🎉 Deployment successful!" -ForegroundColor Green
            Write-Host "Your app is live at: https://tradesnapai.web.app" -ForegroundColor Cyan
        } else {
            Write-Host ""
            Write-Host "❌ Deployment failed!" -ForegroundColor Red
            Write-Host "Make sure you're logged in: firebase login" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Deployment cancelled." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "❌ Build failed! Fix errors and try again." -ForegroundColor Red
}
