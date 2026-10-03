#!/bin/bash
# Pixel News - Pre-Deployment Setup Script
# Prepare your project for Railway deployment

set -e

echo "================================"
echo "Pixel News - Railway Setup"
echo "================================"
echo ""

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✓ Git found"

# Check if composer.json exists
if [ -f "composer.json" ]; then
    echo "✓ composer.json found"
else
    echo "⚠ composer.json not found"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        cp .env.production .env
        echo "✓ Created .env from .env.production"
    elif [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✓ Created .env from .env.example"
    fi
fi

# Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
    echo "✓ Initialized Git repository"
fi

# Check for .gitignore
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
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
EOF
    echo "✓ Created .gitignore"
fi

# Stage files
git add .
echo "✓ Staged files for commit"

# Check if there are changes to commit
if ! git diff-index --quiet HEAD --; then
    git commit -m "Initial commit - Pixel News for Railway deployment" 2>/dev/null || echo "⚠ No new changes to commit"
else
    echo "⚠ No changes to commit"
fi

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/pixel-news.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. Go to https://railway.app and create a new project"
echo ""
echo "3. Add your GitHub repository"
echo ""
echo "4. Add MySQL service and configure environment variables:"
echo "   - DATABASE_HOST"
echo "   - DATABASE_USER"
echo "   - DATABASE_PASSWORD"
echo "   - DATABASE_NAME=pixel_news"
echo "   - SITE_URL=https://pixelnews.jo.com"
echo ""
echo "5. Configure custom domain in Railway settings"
echo ""
echo "6. Update DNS records at your domain registrar"
echo ""
echo "For detailed instructions, see: DEPLOYMENT-RAILWAY.md"
