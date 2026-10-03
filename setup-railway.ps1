# Pixel News - Pre-Deployment Setup Script (PowerShell)
# Prepare your project for Railway deployment

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Pixel News - Railway Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    git --version | Out-Null
    Write-Host "✓ Git found" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check if composer.json exists
if (Test-Path "composer.json") {
    Write-Host "✓ composer.json found" -ForegroundColor Green
} else {
    Write-Host "⚠ composer.json not found" -ForegroundColor Yellow
}

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.production") {
        Copy-Item ".env.production" ".env"
        Write-Host "✓ Created .env from .env.production" -ForegroundColor Green
    } elseif (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ Created .env from .env.example" -ForegroundColor Green
    }
}

# Initialize git if not already done
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✓ Initialized Git repository" -ForegroundColor Green
}

# Create .gitignore if it doesn't exist
if (-not (Test-Path ".gitignore")) {
    $gitignoreContent = @"
# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Dependencies
vendor/
node_modules/
composer.lock

# Uploads and temp files
uploads/
temp/
cache/
.history/

# System files
.DS_Store
Thumbs.db
desktop.ini

# Logs
logs/
*.log

# Database backups
*.sql
*.sql.gz
"@
    Set-Content -Path ".gitignore" -Value $gitignoreContent
    Write-Host "✓ Created .gitignore" -ForegroundColor Green
}

# Stage files
git add .
Write-Host "✓ Staged files for commit" -ForegroundColor Green

# Commit files
try {
    git commit -m "Initial commit - Pixel News for Railway deployment" 2>$null
    Write-Host "✓ Created initial commit" -ForegroundColor Green
} catch {
    Write-Host "⚠ No new changes to commit" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Push to GitHub:"
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/pixel-news.git"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "2. Go to https://railway.app and create a new project"
Write-Host ""
Write-Host "3. Add your GitHub repository"
Write-Host ""
Write-Host "4. Add MySQL service and configure environment variables:"
Write-Host "   - DATABASE_HOST"
Write-Host "   - DATABASE_USER"
Write-Host "   - DATABASE_PASSWORD"
Write-Host "   - DATABASE_NAME=pixel_news"
Write-Host "   - SITE_URL=https://pixelnews.jo.com"
Write-Host ""
Write-Host "5. Configure custom domain in Railway settings"
Write-Host ""
Write-Host "6. Update DNS records at your domain registrar"
Write-Host ""
Write-Host "For detailed instructions, see: DEPLOYMENT-RAILWAY.md" -ForegroundColor Cyan
