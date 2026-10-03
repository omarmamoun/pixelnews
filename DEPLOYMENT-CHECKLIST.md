# Deploy Pixel News to pixelnews.jo.com - Complete Checklist

## 📋 Pre-Deployment Checklist

### Code Preparation
- [ ] Update `.env.production` with your configuration
- [ ] Verify all PHP files are syntactically correct
- [ ] Test API endpoints locally with PHP server
- [ ] Ensure `.gitignore` excludes sensitive files
- [ ] Review database-schema.sql for correctness
- [ ] Update `SITE_URL` in config to `https://pixelnews.jo.com`

### GitHub Setup
- [ ] Create GitHub account (if not already done)
- [ ] Create new repository: `pixel-news`
- [ ] Initialize git locally: `git init`
- [ ] Add remote: `git remote add origin https://github.com/YOUR_USERNAME/pixel-news.git`
- [ ] Make initial commit: `git commit -m "Initial commit"`
- [ ] Push to GitHub: `git push -u origin main`

### Domain & Registrar
- [ ] Confirm domain `pixelnews.jo.com` is registered
- [ ] Verify domain registrar (e.g., Namecheap, GoDaddy, local .jo registry)
- [ ] Access domain DNS settings
- [ ] Have notepad ready for DNS record values

---

## 🚀 Railway Deployment Steps

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Click "Start Project"
3. Sign up or login with GitHub
4. Grant Railway access to your repositories

### Step 2: Create New Project
1. Click "Create Project"
2. Select "Deploy from GitHub"
3. Authorize Railway to access GitHub
4. Select your `pixel-news` repository
5. Choose branch (main)

### Step 3: Add Database Service
1. In your Railway project, click "Add Service"
2. Select "MySQL"
3. Configure:
   - **Database**: `pixel_news`
   - **Username**: `admin` (or custom)
   - **Password**: Generate strong password
   - **Port**: 3306

### Step 4: Configure Environment Variables
In Railway project settings, add these variables:

```
# Database (Railway will provide connection details)
DATABASE_HOST=mysql.railway.internal
DATABASE_PORT=3306
DATABASE_USER=admin
DATABASE_PASSWORD=YOUR_SECURE_PASSWORD
DATABASE_NAME=pixel_news

# Site Configuration
SITE_URL=https://pixelnews.jo.com
SITE_NAME=Pixel News
ADMIN_EMAIL=admin@pixelnews.jo
APP_ENV=production
APP_DEBUG=false

# Security
ENCRYPTION_KEY=your_32_char_encryption_key_here
JWT_SECRET=your_jwt_secret_key_here

# Features
ENABLE_COMMENTS=true
ENABLE_ADS_SYSTEM=true
ENABLE_ARTICLES_SUBMISSION=true
```

**Getting Railway MySQL Details:**
1. Click MySQL service card
2. Click "Connect" tab
3. Copy the connection string
4. Extract HOST, USER, PASSWORD from connection string

### Step 5: Deploy Application
1. Railway detects your `composer.json`
2. Automatically starts deployment
3. Install PHP dependencies
4. Start web server
5. Watch deployment logs for errors

**Monitor Deployment:**
- Click "Logs" tab
- Watch for "Build complete" or error messages
- Deployment typically takes 2-3 minutes

### Step 6: Configure Custom Domain
In Railway project settings:
1. Click "Settings" tab
2. Scroll to "Domains"
3. Click "Add Custom Domain"
4. Enter: `pixelnews.jo.com`
5. Railway generates CNAME value

**Example CNAME value:**
```
railway-abc123.up.railway.app
```

---

## 🌐 Configure DNS Records

### At Your Domain Registrar (.jo Registry)

#### Option A: CNAME Record (Recommended)
1. Login to domain registrar
2. Go to DNS Management / Zone Settings
3. Add new record:
   - **Type**: CNAME
   - **Name/Host**: `pixelnews` (or leave blank for root)
   - **Value**: Railway CNAME provided above
   - **TTL**: 3600

4. Also add for www (optional):
   - **Type**: CNAME
   - **Name/Host**: `www`
   - **Value**: Railway CNAME
   - **TTL**: 3600

#### Option B: A Record (If CNAME not available)
1. Get Railway A record IP from Railway dashboard
2. Add new record:
   - **Type**: A
   - **Name/Host**: `pixelnews` (or @)
   - **Value**: Railway IP address
   - **TTL**: 3600

### DNS Propagation
- Changes take 24-48 hours to propagate worldwide
- Check status: `nslookup pixelnews.jo.com` (Windows Command Prompt)
- Or use: https://dnschecker.org

---

## 🔧 Database Setup

### Automatic Schema Creation (Recommended)
1. Railway automatically runs migrations if configured
2. Database tables created from `database-schema.sql`
3. Check logs for "Database initialized" message

### Manual Database Setup
If automatic doesn't work:

1. Connect to MySQL via phpMyAdmin:
   - Railway MySQL details from Connect tab
   - Or use MySQL client:
     ```bash
     mysql -h HOSTNAME -u USERNAME -p DATABASE_NAME < api/database-schema.sql
     ```

2. Verify tables created:
   - articles
   - comments
   - users
   - article_views
   - etc.

---

## ✅ Post-Deployment Verification

### 1. Website Accessibility
```bash
# Test in browser
https://pixelnews.jo.com

# Should see homepage loading
# No connection errors
```

### 2. Static Content
- [ ] Homepage loads: https://pixelnews.jo.com
- [ ] CSS loads properly
- [ ] Images display correctly
- [ ] Navigation works
- [ ] Category pages load: /politics.html, /economy.html, etc.

### 3. API Endpoints
```bash
# Test API responses
https://pixelnews.jo.com/api/articles.php

# Should return JSON data
```

### 4. Admin Panel
```bash
# Admin login
https://pixelnews.jo.com/admin/

# Should load admin interface
# Login with credentials
```

### 5. Console Check
- Open DevTools (F12)
- Check Console tab
- Look for JavaScript errors
- Verify no 404 errors for resources

### 6. Performance Check
- Run Lighthouse audit (DevTools > Lighthouse)
- Check Core Web Vitals
- Monitor page load time

---

## 🐛 Troubleshooting

### Issue: 502 Bad Gateway

**Cause**: Application crash or connection error

**Solution**:
1. Check Railway logs for errors
2. Verify database connection settings
3. Check if `.env` variables are correct
4. Restart Railway deployment

```bash
# In Railway dashboard:
Click "Redeploy" button
```

### Issue: Cannot Connect to Database

**Cause**: Wrong credentials or firewall

**Solution**:
1. Verify DATABASE_HOST, USER, PASSWORD in Railway
2. Ensure database is running (MySQL service active)
3. Check database-schema.sql syntax
4. Use Railway MySQL connection test

### Issue: Domain Not Resolving

**Cause**: DNS not configured or not propagated

**Solution**:
1. Verify CNAME/A records in registrar (wait 24-48 hours)
2. Check DNS propagation: https://dnschecker.org
3. Flush local DNS cache:
   ```bash
   # Windows PowerShell
   ipconfig /flushdns
   ```

### Issue: HTTPS Certificate Error

**Cause**: SSL certificate not issued yet

**Solution**:
1. Railway auto-generates SSL certificates
2. Wait 5-10 minutes for cert to issue
3. Refresh browser (clear cache)
4. Check certificate in browser (🔒 icon)

### Issue: PHP Errors in Logs

**Cause**: Syntax or runtime errors

**Solution**:
1. Check error logs in Railway dashboard
2. Fix PHP errors locally
3. Test with `php -l filename.php`
4. Commit and push (auto-redeploy)

---

## 📊 Monitoring & Maintenance

### Railway Dashboard Monitoring
- **CPU Usage**: Monitor green graph (should be <50%)
- **Memory Usage**: Check RAM usage
- **Deployment History**: View past deployments
- **Logs**: Real-time log viewing
- **Metrics**: Response time, requests/sec

### Set Up Alerts (Optional)
1. Railway Settings → Alerts
2. Email notifications for:
   - Deployment failures
   - High CPU/Memory
   - Service errors

### Regular Maintenance
```bash
# Update code and redeploy
git commit -am "Your changes"
git push origin main
# Railway auto-redeploys

# Database backup
# Railway auto-backs up daily
# Or export from phpMyAdmin
```

---

## 🔐 Security Checklist

- [ ] `ENCRYPTION_KEY` is strong (32+ characters)
- [ ] `JWT_SECRET` is secure
- [ ] Database password is strong
- [ ] `.env` is in `.gitignore` (not in Git)
- [ ] HTTPS is enforced (check Railway settings)
- [ ] Admin credentials changed from default
- [ ] API keys not exposed in code

---

## 🎯 Next Steps After Deployment

1. **Update Configuration**:
   - Test admin login
   - Configure site settings
   - Upload logos/images

2. **Add Content**:
   - Import initial articles
   - Set up categories
   - Configure advertisement placements

3. **Social Integration**:
   - Connect social media accounts
   - Setup sharing features
   - Configure notifications

4. **Performance**:
   - Run Lighthouse audit
   - Optimize images
   - Enable caching
   - Monitor analytics

5. **Backup Strategy**:
   - Set up database backups
   - Document recovery procedures
   - Test restore process

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **PHP Deployment**: https://docs.railway.app/guides/php
- **MySQL Deployment**: https://docs.railway.app/guides/mysql
- **Domain Issues**: Contact your registrar (.jo registry)
- **Troubleshooting**: Check Railway logs and error messages

---

## ⏱️ Timeline Expectations

| Step | Duration | Notes |
|------|----------|-------|
| GitHub setup | 5 min | Create repo, push code |
| Railway project | 2 min | Create project on Railway |
| Database setup | 2 min | Add MySQL service |
| Configuration | 5 min | Add environment variables |
| Initial deployment | 3-5 min | First build and deploy |
| DNS configuration | 2 min | Add CNAME records |
| DNS propagation | 24-48 hrs | Wait for global propagation |
| **Total** | **30 min + 48 hrs** | **Most work happens first 30 min** |

---

## 📝 Deployment Record

**Date Deployed**: ___________

**Railway Project**: https://railway.app/project/___________

**Domain**: pixelnews.jo.com

**Initial Admin Email**: ___________

**Database Password**: (stored securely)

**First Deployment Log**: [Link to logs]

---

**Deployment Status**: ☐ In Progress ☐ Complete ☐ Ready for Go-Live
