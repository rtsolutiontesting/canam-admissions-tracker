# Cloudflare Pages Deployment Check Script

Write-Host "`n=== Cloudflare Pages Deployment Status ===" -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is installed
$wranglerInstalled = Get-Command wrangler -ErrorAction SilentlyContinue

if (-not $wranglerInstalled) {
    Write-Host "❌ Wrangler CLI not found. Installing..." -ForegroundColor Red
    npm install -g wrangler
    Write-Host "✅ Wrangler installed. Please run 'wrangler login' first." -ForegroundColor Green
    exit
}

# Check if logged in
Write-Host "Checking Cloudflare login status..." -ForegroundColor Yellow
$loginStatus = wrangler whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Cloudflare. Please run:" -ForegroundColor Red
    Write-Host "   wrangler login" -ForegroundColor Yellow
    exit
}

Write-Host "✅ Logged in to Cloudflare" -ForegroundColor Green
Write-Host ""

# List deployments
Write-Host "Fetching latest deployments..." -ForegroundColor Yellow
Write-Host ""
wrangler pages deployment list --project-name=canam-admissions-tracker

Write-Host ""
Write-Host "=== Useful Commands ===" -ForegroundColor Cyan
Write-Host "View live logs: wrangler pages deployment tail --project-name=canam-admissions-tracker" -ForegroundColor White
Write-Host "List projects: wrangler pages project list" -ForegroundColor White
Write-Host ""



