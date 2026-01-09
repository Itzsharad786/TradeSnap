Write-Host "Deploying Analyzer Updates..." -ForegroundColor Cyan
Set-Location "c:\myproject"
git add -A
git status
$commitMsg = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "feat: add dual-tab analyzer with stock and chart analysis"
}
git commit -m $commitMsg
git push origin main
Write-Host "Deployment complete! Check your hosting dashboard." -ForegroundColor Green
pause
