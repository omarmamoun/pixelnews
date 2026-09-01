# 🚀 Pixel News Deployment to pixelnews.jo.com

## ✅ Completed Setup

I've prepared your Pixel News website for deployment to **pixelnews.jo.com** using **Railway** hosting platform. Here's what's been set up:

---

## 📦 Files Created for Deployment

### 1. **Configuration Files**
- ✅ `composer.json` - PHP dependencies and autoload setup
- ✅ `Procfile` - Railway web process configuration  
- ✅ `.env.production` - Production environment variables (secrets template)
- ✅ `api/config.php` - Configuration loader that reads .env and system variables

### 2. **Deployment Documentation**
- ✅ `DEPLOYMENT-RAILWAY.md` - Complete Railway setup guide
- ✅ `DEPLOYMENT-CHECKLIST.md` - Step-by-step deployment checklist
- ✅ `setup-railway.ps1` - PowerShell setup script (Windows)
- ✅ `setup-railway.sh` - Bash setup script (Linux/Mac)

### 3. **Configuration Updates**
- ✅ Enhanced `.env.production` with all necessary environment variables
- ✅ Created robust `api/config.php` to handle both local and hosted environments
- ✅ Support for Railway's DATABASE_URL format
- ✅ Support for individual database credentials

---

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│         pixelnews.jo.com (Domain)               │
│              ↓                                    │
│       Railway Web Service (PHP)                 │
│       ├─ Your code                              │
│       ├─ Composer dependencies                  │
│       └─ Web server (Apache/Nginx)              │
│              ↓                                    │
│       Railway MySQL Database                    │
│       ├─ Tables (articles, users, etc)          │
│       ├─ 26 tables from schema                  │
│       └─ Automatic daily backups                │
└─────────────────────────────────────────────────┘
```

---

## 📋 Next Steps to Deploy

### Phase 1: GitHub Setup (5 minutes)
```bash
# 1. Initialize git in your project folder
git init

# 2. Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/pixel-news.git

# 3. Stage and commit files
git add .
git commit -m "Initial commit - Pixel News ready for Railway"

# 4. Push to GitHub
git branch -M main
git push -u origin main
```

### Phase 2: Create Railway Project (2 minutes)
1. Go to https://railway.app
2. Click "Create Project"
3. Select "Deploy from GitHub"
4. Choose your `pixel-news` repository
5. Railway auto-detects PHP and starts build

### Phase 3: Database Setup (2 minutes)
1. In Railway project, click "Add Service"
2. Select "MySQL"
3. Configure:
   - Database Name: `pixel_news`
   - Username: `admin`
   - Password: (Railway generates secure password)

### Phase 4: Environment Configuration (5 minutes)
In Railway dashboard → Settings → Variables, add:
```
DATABASE_HOST=mysql.railway.internal
DATABASE_USER=admin
DATABASE_PASSWORD=[Railway-generated password]
DATABASE_NAME=pixel_news

SITE_URL=https://pixelnews.jo.com
APP_ENV=production
ENCRYPTION_KEY=[Generate 32 random characters]
JWT_SECRET=[Generate strong secret key]
```

### Phase 5: Domain Connection (2 minutes)
1. Railway dashboard → Settings → Domains
2. Click "Add Custom Domain"
3. Enter: `pixelnews.jo.com`
4. Copy the CNAME value Railway provides

### Phase 6: DNS Configuration (2 minutes at registrar, 24-48 hours to propagate)
At your domain registrar (.jo registry):
1. Add CNAME record:
   - Name: `pixelnews` (or @)
   - Value: [Railway CNAME]
   - TTL: 3600

2. Wait 24-48 hours for DNS to propagate worldwide

---

## 🔐 Security Checklist Before Deployment

- [ ] Update `.env.production` with real values (not example values)
- [ ] Generate strong `ENCRYPTION_KEY` (32+ random characters)
- [ ] Generate strong `JWT_SECRET`
- [ ] Ensure `.env` and `.env.production` are in `.gitignore`
- [ ] Never commit real passwords to Git
- [ ] Change default admin password after deployment
- [ ] Enable HTTPS (Railway provides free SSL certificate)

---

## 📊 Architecture & Capabilities

### What Works After Deployment ✅

- **Frontend**: All HTML pages, CSS, JavaScript
- **API**: All PHP API endpoints (articles, comments, views, admin)
- **Database**: MySQL with 26 tables for all features
- **Admin Panel**: Full admin interface at `/admin/`
- **Authentication**: Login system for users and admins
- **File Uploads**: Avatar and article image uploads
- **Dark Mode**: Complete light/dark theme support
- **Responsive Design**: Works on desktop, tablet, mobile

### What Needs After Deployment ⏳

- Admin statistics dashboard (Task 8)
- Advertisement system (Task 9)
- Article submission workflow (Task 10)
- User messaging system (Task 11)
- Reels/short videos (Task 12)
- Points system (Task 13)
- Live streaming (Task 14)

---

## 🛠️ Key Files Explained

### `composer.json`
- Defines PHP 8.0+ requirement
- Autoloads API classes
- Includes PSR-4 namespace support

### `Procfile`
- Tells Railway how to start the web server
- Uses Apache with PHP module
- Loads your root files as web content

### `api/config.php`
- **Central configuration hub** for entire application
- Reads `.env` file for development
- Reads environment variables for production (Railway)
- Supports both individual DB settings and DATABASE_URL format
- Provides methods: `Config::get()`, `Config::getDatabase()`, `Config::isProduction()`

### `.env.production`
- **Template** for production secrets
- Never commit with real values
- Copy to `.env` with real values before deploying

---

## 🌐 DNS Configuration Details

### What's CNAME?
A CNAME (Canonical Name) record points your domain to Railway's servers.

### Example:
```
Domain: pixelnews.jo.com
CNAME Value: railway-abc123xyz.up.railway.app

When someone visits pixelnews.jo.com:
1. Browser asks registrar
2. Registrar says "look at railway-abc123xyz.up.railway.app"
3. Browser gets Railway server's IP
4. Shows your website
```

### DNS Propagation
- Changes usually take 1-4 hours
- Full propagation worldwide: 24-48 hours
- Check status: https://dnschecker.org/?q=pixelnews.jo.com

---

## 📈 Performance & Monitoring

### Railway Auto-Provides:
- ✅ HTTPS/SSL Certificate (free, auto-renewing)
- ✅ Daily database backups
- ✅ Uptime monitoring
- ✅ CPU/Memory metrics
- ✅ Deployment logs
- ✅ Error tracking

### Monitor From Dashboard:
1. CPU usage (should be <50%)
2. Memory usage
3. Response time
4. Request rate
5. Error logs

---

## 🆘 Troubleshooting Quick Links

### 502 Bad Gateway
→ Check PHP syntax, database connection, Railway logs

### Cannot Connect to Database
→ Verify DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD

### Domain Not Resolving  
→ Wait 24-48 hours, check DNS propagation at dnschecker.org

### HTTPS Certificate Error
→ Wait 5-10 minutes for Railway SSL to be issued, clear browser cache

### PHP Errors in Logs
→ Check error logs, test locally with `php -l filename.php`

---

## 📚 Documentation Files in Your Project

1. **DEPLOYMENT-RAILWAY.md** - Detailed Railway setup guide
2. **DEPLOYMENT-CHECKLIST.md** - Step-by-step checklist
3. **DESIGN-IMPROVEMENTS.md** - Homepage redesign documentation
4. **IMPLEMENTATION-PLAN.md** - Overall project roadmap
5. **DATABASE-SETUP.md** - Database schema documentation
6. **PROJECT-STRUCTURE.md** - Project file structure
7. **README.md** - Project overview

---

## ⏱️ Timeline

| Phase | Task | Duration | Notes |
|-------|------|----------|-------|
| 1 | GitHub setup | 5 min | `git init`, `git push` |
| 2 | Create Railway project | 2 min | Connect GitHub repo |
| 3 | Add MySQL database | 2 min | Railway auto-setup |
| 4 | Add environment variables | 5 min | Configure secrets |
| 5 | Deploy application | 3-5 min | Auto-build and start |
| 6 | Configure DNS | 2 min | Add CNAME at registrar |
| 7 | DNS propagation | 24-48 hrs | Wait for global spread |
| **Total** | **Full deployment** | **30 min + 48 hrs** | **Go live in 30 min, full in 2 days** |

---

## 💡 Pro Tips

1. **Use Railway's free tier** to test before paying
2. **Keep `.env` separate from code** (use `.env.example` as template)
3. **Set up git before deploying** (Railway auto-deploys on git push)
4. **Monitor first 24 hours** after deployment for issues
5. **Test all functionality** after DNS propagates
6. **Keep database backups** (Railway auto-backs up daily)
7. **Use descriptive commit messages** for easy rollback

---

## 🎬 Ready to Deploy?

**Your website is now ready to go live!**

1. ✅ Code structure prepared
2. ✅ Configuration system created
3. ✅ Deployment files ready
4. ✅ Documentation complete

**Start with Phase 1** in "Next Steps" section above, or follow the detailed checklist in `DEPLOYMENT-CHECKLIST.md`.

**Need help?** Check `DEPLOYMENT-RAILWAY.md` for detailed instructions, or Railway's docs at https://docs.railway.app

---

**Deployment Status**: 🟡 Ready for Phase 1 (GitHub Setup)  
**Estimated Time to Go Live**: 30 minutes (+ 48 hours DNS propagation)  
**Support**: Check DEPLOYMENT-*.md files for detailed guides
