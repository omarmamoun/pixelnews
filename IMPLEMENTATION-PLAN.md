# Pixel News - Implementation Roadmap

## ✅ Completed Phase 1: Rebranding & Categories
- Rebranded site to "Pixel News" across all pages
- Updated all page titles, headers, and footers
- Added 9 new category pages:
  - world.html (العالم)
  - tourism.html (السياحة) 
  - environment.html (البيئة)
  - culture.html (الثقافة والفنون)
  - celebrities.html (المشاهير)
  - events.html (المناسبات والوفيات)
  - games.html (ألعاب ذكاء)
- Updated navigation in all pages

---

## 🔄 Phase 2: Technical Infrastructure & Features (Next Priority)

### 2.1 YouTube Video Embedding Fix
**File:** `script.js`, `article.html`
- Issue: YouTube videos not displaying on the site
- Solution:
  - Check iframe embedding in article.html
  - Verify iframe allowlist attributes
  - Test with sample YouTube URLs
  - Add YouTube API error handling
  - Update media.css for responsive YouTube embeds

### 2.2 Database Integration with phpMyAdmin
**Files:** `api/`, `admin/`
- Setup MySQL/MariaDB connection
- Create database schema for:
  - Admin permissions & roles
  - User accounts & profiles
  - Article submissions & approvals
  - Advertisement placements
  - User points/rewards
- Create connection string in `.env`
- Update `api/secure-storage.php` to use database
- Add database migration scripts

### 2.3 Admin Statistics Dashboard
**Files:** `admin/admin.html`, `admin/admin.js`
**Features:**
- Article views analytics (by category)
- User engagement metrics (time on page)
- Top performing articles
- Category performance breakdown
- Real-time visitor count
- Traffic sources & referrals
- User registration trends
- Admin controls for data export

**Database Tables Needed:**
```sql
- article_views (article_id, viewer_ip, timestamp, duration)
- page_analytics (page_url, views, avg_time, category)
- user_engagement (user_id, article_id, time_spent, action)
```

---

## 📢 Phase 3: Monetization & User Engagement

### 3.1 Advertisement System
**Files:** `api/ads.php`, `admin/ads-manager.html`
**Features:**
- Admin panel to create/manage ads
- Multiple ad placement zones:
  - Header banner
  - Sidebar widgets
  - Between articles
  - Footer section
- Ad scheduling (date/time)
- Performance tracking
- Ad rotation & A/B testing

**Database Tables:**
```sql
- advertisements (ad_id, title, content, image_url, link, status, start_date, end_date)
- ad_placements (placement_id, ad_id, position, priority, views, clicks)
- ad_analytics (ad_id, date, impressions, clicks, ctr)
```

### 3.2 Points System for Users
**Files:** `api/points.php`, `admin/`
**Features:**
- Users earn points by:
  - Watching advertisements
  - Commenting on articles
  - Sharing articles
  - Reading articles
- Point redemption for:
  - Publishing articles
  - Premium features
  - Ad-free experience
- Admin control over point values

**Database Tables:**
```sql
- user_points (user_id, total_points, level)
- point_transactions (user_id, points, type, article_id, timestamp)
- point_rewards (reward_id, name, points_needed, description)
```

---

## ✍️ Phase 4: Content Creation & Collaboration

### 4.1 Article Submission/Approval Workflow
**Files:** `api/submissions.php`, `admin/submissions.html`
**Features:**
- User submission form for:
  - Articles
  - Reports
  - Investigations
- Status tracking (Pending → Approved → Published)
- Admin review & editing interface
- Rejection reason system
- Submission history per user

**Database Tables:**
```sql
- article_submissions (submission_id, user_id, title, content, category, status, created_at)
- submission_reviews (review_id, submission_id, reviewer_id, decision, reason, timestamp)
- submission_history (submission_id, status_change, timestamp)
```

### 4.2 Direct Messaging System (DM)
**Files:** `api/messages.php`, `messages.html`, `messages.js`
**Features:**
- User-to-user messaging
- Message notifications
- Inbox/Outbox interface
- Read/unread status
- Message search
- Conversation history

**Database Tables:**
```sql
- messages (message_id, sender_id, receiver_id, content, created_at, read_at)
- conversations (conversation_id, user1_id, user2_id, last_message_time, archived)
- message_notifications (notification_id, user_id, message_id, read)
```

---

## 🎬 Phase 5: Multimedia & Streaming

### 5.1 Reels System (Short Videos)
**Files:** `reels.html`, `api/reels.php`
**Features:**
- Upload short videos (TikTok-style)
- Video player with controls
- Like/comment system
- Share functionality
- Creator profiles
- Trending reels section
- Video recommendation algorithm

**Database Tables:**
```sql
- reels (reel_id, creator_id, video_url, caption, duration, created_at, likes_count)
- reel_likes (like_id, user_id, reel_id, created_at)
- reel_comments (comment_id, reel_id, user_id, content, created_at)
- reel_analytics (reel_id, date, views, shares, avg_watch_time)
```

### 5.2 Live Streaming & News Broadcast
**Files:** `broadcast.html`, `api/broadcast.php`
**Features:**
- Live stream page for news broadcasts
- Stream scheduling
- Viewer count display
- Live chat during broadcast
- Archive of past broadcasts
- Admin controls for going live
- Stream quality options

**Integration Options:**
- HLS (HTTP Live Streaming)
- RTMP streaming server
- WebRTC for peer-to-peer streaming
- Integration with services like Twitch or YouTube Live

**Database Tables:**
```sql
- broadcasts (broadcast_id, title, description, start_time, end_time, status)
- broadcast_viewers (viewer_id, broadcast_id, user_id, join_time, leave_time)
- broadcast_chat (message_id, broadcast_id, user_id, content, timestamp)
```

---

## 🌐 Phase 6: Domain & Deployment

### 6.1 Domain Setup (pixelnews.jo.com)
- Update DNS records
- Configure SSL certificate
- Setup .htaccess redirects
- Configure virtual hosts
- Update `ZAHER_SITE_URL` environment variable
- Test all functionality on production domain

### 6.2 Production Deployment Checklist
- [ ] Move `Save-Data` outside web root
- [ ] Set all environment variables securely
- [ ] Enable HTTPS
- [ ] Configure database backups
- [ ] Setup monitoring & logging
- [ ] Test all payment/point systems
- [ ] Security audit

---

## 📋 Implementation Priority Order

1. **CRITICAL (Week 1):**
   - Fix YouTube embedding
   - Setup database connection
   - Create admin statistics dashboard

2. **HIGH (Week 2-3):**
   - Advertisement system
   - Points system
   - Article submission workflow

3. **MEDIUM (Week 4):**
   - Direct messaging
   - Reels system basic structure

4. **NICE-TO-HAVE (Week 5+):**
   - Live broadcasting
   - Advanced analytics
   - Advanced recommendation algorithms

---

## 🔧 Technical Stack

**Frontend:** HTML5, CSS3, JavaScript (ES6+)
**Backend:** PHP 8.2+
**Database:** MySQL/MariaDB
**Security:** Libsodium encryption, CSRF tokens
**Hosting Requirements:**
- SSL/TLS support
- PHP 8.2+ with extensions
- MySQL 5.7+ or MariaDB 10.2+
- File upload capability
- Cron jobs for scheduled tasks

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks:
- Database backups (daily)
- Server monitoring
- Security updates
- Performance optimization
- Bug fixes
- Feature updates based on user feedback

### Monitoring URLs:
- Admin panel: `/admin/admin.html`
- Statistics: `/admin/admin.html?view=stats`
- Moderation: `/admin/admin.html?view=moderation`

---

**Last Updated:** August 19, 2026
**Status:** Phase 1 Complete, Phase 2-3 In Planning
