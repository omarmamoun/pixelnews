# Pixel News - Railway Deployment Guide

## Prerequisites
- Railway.app account
- GitHub account (repository with code)
- Domain: pixelnews.jo.com (already registered)
- MySQL database access

## Deployment Steps

### 1. Prepare GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit - Pixel News"
git remote add origin https://github.com/YOUR_USERNAME/pixel-news.git
git branch -M main
git push -u origin main
```

### 2. Railway Setup

#### Step A: Create Railway Project
1. Go to https://railway.app
2. Click "Create Project"
3. Select "Deploy from GitHub"
4. Connect your GitHub account
5. Select pixel-news repository

#### Step B: Add PHP Service
1. In Railway dashboard, click "Add Service"
2. Select "MySQL" (or use Railway's MySQL)
3. Configure:
   - Database Name: pixel_news
   - Username: admin
   - Password: (secure password)

#### Step C: Configure Environment Variables
In Railway dashboard, set these variables:

```
DATABASE_HOST=localhost  (or Railway MySQL host)
DATABASE_USER=admin
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=pixel_news
DATABASE_PORT=3306

DB_HOST=${{MYSQL.RAILWAY_PRIVATE_URL}}
DB_USER=root
DB_PASSWORD=${{MYSQL.MYSQL_PASSWORD}}
DB_NAME=pixel_news

SITE_URL=https://pixelnews.jo.com
ADMIN_EMAIL=admin@pixelnews.jo
APP_ENV=production
```

### 3. Connect Custom Domain

#### In Railway Dashboard:
1. Go to your deployment settings
2. Click "Domain"
3. Add custom domain: pixelnews.jo.com

#### Update DNS Records at Domain Registrar:
Contact your domain registrar (.jo registry) and update:

**CNAME Record:**
- Type: CNAME
- Name: pixelnews (or @)
- Value: (Railway will provide this)
- TTL: 3600

OR

**A Record:**
- Type: A
- Name: pixelnews (or @)
- Value: (Railway IP address)
- TTL: 3600

### 4. Database Setup

#### Automatic Setup:
Railway will run database migrations if configured.

#### Manual Setup:
1. Get MySQL connection details from Railway
2. Connect with phpMyAdmin or MySQL client
3. Run: `api/database-schema.sql`
4. Verify tables created

### 5. File Structure for Deployment

```
project-root/
├── api/
│   ├── database.php
│   ├── auth.php
│   ├── articles.php
│   ├── comments.php
│   └── ... (other PHP files)
├── admin/
│   ├── admin.html
│   └── admin.js
├── index.html
├── style.css
├── script.js
├── .htaccess
├── .env.example
├── composer.json
├── Procfile
└── railway.json (optional)
```

### 6. URL Rewriting (.htaccess)

Ensure your `.htaccess` has:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Redirect to HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Rewrite API calls
    RewriteRule ^api/([a-z-]+)\.php$ api/$1.php [L]
</IfModule>
```

### 7. First Deploy

```bash
# Push to trigger automatic deployment
git push origin main

# Check logs in Railway dashboard
# Deployment should complete in 2-3 minutes
```

### 8. Post-Deployment Verification

1. Visit: https://pixelnews.jo.com
2. Test homepage loads
3. Test article pages: https://pixelnews.jo.com/politics.html
4. Test admin panel: https://pixelnews.jo.com/admin/
5. Test API: https://pixelnews.jo.com/api/articles.php
6. Check console for errors (F12)

### 9. Troubleshooting

**502 Bad Gateway:**
- Check Railway logs
- Verify database connection
- Check PHP errors in logs

**Cannot connect to database:**
- Verify DATABASE_HOST is correct
- Check database credentials
- Ensure database tables exist

**Domain not resolving:**
- Wait 24-48 hours for DNS propagation
- Verify CNAME/A records with: `nslookup pixelnews.jo.com`
- Check Railway domain settings

**API not working:**
- Check .htaccess rewriting
- Verify API file permissions
- Check database connection in api/database.php

### 10. Ongoing Maintenance

**Backup Database:**
```bash
# Railway provides automatic backups
# Also can export manually from phpMyAdmin
```

**Monitor Performance:**
1. Railway dashboard shows CPU/Memory usage
2. Check logs regularly
3. Monitor database size

**Update Code:**
```bash
git push origin main  # Triggers automatic redeploy
```

---

## Alternative Hosting Options

If Railway doesn't work:
- **Heroku**: heroku.com (paid plans)
- **PythonAnywhere**: pythonanywhere.com (PHP support via workarounds)
- **Traditional Hosting**: GoDaddy, SiteGround, Bluehost (.jo domains)

---

## Questions?

For more help:
1. Railway Docs: https://docs.railway.app
2. PHP Deployment: https://railway.app/docs/guides/php
3. Domain Management: Contact your registrar

