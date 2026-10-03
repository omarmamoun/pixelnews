# Pixel News - Database Setup Guide

## Quick Start

### Step 1: Create Database
```bash
# Login to MySQL/MariaDB
mysql -u root -p

# Create database
CREATE DATABASE pixel_news CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Import Schema
```bash
# Import the database schema
mysql -u root -p pixel_news < api/database-schema.sql
```

### Step 3: Configure Environment Variables

Create or update your `.env` file with:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=pixel_news_user
DB_PASSWORD=your_secure_password_here
DB_NAME=pixel_news
DB_PORT=3306

# Optional: If using custom path for Save-Data
ZAHER_PRIVATE_DATA_PATH=/path/outside/webroot/Save-Data
```

### Step 4: Create Database User

```sql
-- Create dedicated database user (more secure)
CREATE USER 'pixel_news_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON pixel_news.* TO 'pixel_news_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## Database Features

### Analytics Tracking
The system automatically tracks:
- **Page Views**: Every article view with unique IP tracking
- **User Engagement**: Time spent, actions performed, articles read
- **Category Performance**: Views and engagement by category
- **Hourly Traffic**: Traffic patterns throughout the day

### Advertisement Management
- Track ad impressions and clicks
- Calculate Click-Through Rate (CTR)
- Multiple ad placements
- Ad scheduling

### Point System
- Award points for user actions
- Track point transactions
- User levels and achievements
- Point redemption

### User Features
- Article submissions and approval workflow
- Direct messaging system
- Real-time notifications
- Engagement tracking

### Advanced Features
- Reels/short videos with analytics
- Live streaming broadcasts
- Stream chat and viewer tracking
- Video engagement metrics

---

## API Endpoints

### Statistics Endpoints
```
GET /api/statistics.php?action=overview     # Dashboard overview
GET /api/statistics.php?action=articles     # Article stats
GET /api/statistics.php?action=engagement   # User engagement
GET /api/statistics.php?action=ads          # Ad performance
GET /api/statistics.php?action=trending     # Trending content
GET /api/statistics.php?action=traffic      # Traffic analysis
```

### Database Helper Usage

```php
<?php
require_once 'api/database.php';

$db = getDB();

// Record article view
$db->recordArticleView($articleId, $ipAddress, $duration);

// Get article views
$views = $db->getArticleViewCount($articleId);

// Award points
$db->awardPoints($userId, 10, 'article_view', $articleId);

// Get user points
$userPoints = $db->getUserPoints($userId);

// Send message
$messageId = $db->sendMessage($senderId, $receiverId, $content);

// Get active ads
$ads = $db->getActiveAds('header'); // or 'sidebar', 'footer', etc
?>
```

---

## Integration with Existing System

### Update article.html
Add tracking script to record page views:

```javascript
<script>
// Record page view when article loads
const articleId = new URLSearchParams(window.location.search).get('id');
if (articleId && navigator.onLine) {
    fetch('api/track-view.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: articleId })
    }).catch(err => console.log('View tracking skipped'));
}
</script>
```

### Update script.js
Integrate point awarding:

```javascript
// Award points when user performs actions
async function performAction(action, articleId) {
    await fetch('api/track-engagement.php', {
        method: 'POST',
        body: JSON.stringify({
            action: action,
            articleId: articleId,
            timeSpent: calculateTimeSpent()
        })
    });
}
```

---

## Database Maintenance

### Regular Backups
```bash
# Daily backup
mysqldump -u pixel_news_user -p pixel_news > backup_$(date +%Y%m%d).sql
```

### Optimize Tables (Monthly)
```sql
-- Run monthly to optimize tables
OPTIMIZE TABLE article_views;
OPTIMIZE TABLE user_engagement;
OPTIMIZE TABLE ad_placements;
OPTIMIZE TABLE messages;
```

### Clean Old Data (Optional)
```sql
-- Delete views older than 1 year
DELETE FROM article_views WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Archive old messages
DELETE FROM messages WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
```

---

## Security Considerations

1. **Use Environment Variables**: Never hardcode database credentials
2. **Prepared Statements**: All queries use prepared statements to prevent SQL injection
3. **User Permissions**: Create dedicated database user with minimal required privileges
4. **Encrypted Passwords**: Use PHP's password_hash() for user passwords
5. **HTTPS Only**: Ensure all database operations use HTTPS in production
6. **IP Whitelisting**: If possible, restrict database access to application server only

---

## Monitoring & Troubleshooting

### Check Database Connection
```php
<?php
require 'api/database.php';
$db = getDB();
if ($db->getConnection()) {
    echo "✓ Database connected successfully";
} else {
    echo "✗ Connection failed: " . $db->getError();
}
?>
```

### Monitor Table Sizes
```sql
SELECT 
    TABLE_NAME,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS `Size (MB)`
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'pixel_news'
ORDER BY (data_length + index_length) DESC;
```

### Check Active Connections
```sql
SHOW PROCESSLIST;
```

### Database Error Logs
Check MySQL error log:
- Linux: `/var/log/mysql/error.log`
- Windows: `C:\ProgramData\MySQL\MySQL Server\data\*.err`

---

## Migration from Static JSON

If you're currently using JSON files for data:

```php
<?php
// Convert JSON articles to database
require 'api/database.php';
$db = getDB();

$articles = json_decode(file_get_contents('articles-data.json'), true);

foreach ($articles as $id => $article) {
    $db->recordArticleView($id, '127.0.0.1', 0);
    
    // Add to page_analytics if needed
}
echo "Migration completed";
?>
```

---

## Next Steps

1. ✅ Create database and import schema
2. ✅ Configure environment variables
3. ✅ Test database connection
4. ⏳ Integrate tracking into article pages
5. ⏳ Create admin dashboard UI
6. ⏳ Setup point system API
7. ⏳ Configure ad system
8. ⏳ Enable notifications

---

**Last Updated:** August 19, 2026
**Database Version:** 1.0
