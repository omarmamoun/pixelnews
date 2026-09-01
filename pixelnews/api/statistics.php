<?php
/**
 * Pixel News Admin Statistics API
 * Provides analytics and statistics for the admin dashboard
 */

header('Content-Type: application/json; charset=utf-8');

require_once 'database.php';
require_once 'admin-auth.php';

// Check admin authorization
if (!isAdminAuthorized()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

$db = getDB();
if (!$db->getConnection()) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    // Get all statistics
    case 'overview':
        echo json_encode(getOverviewStats($db));
        break;
    
    // Get article statistics
    case 'articles':
        echo json_encode(getArticleStats($db));
        break;
    
    // Get user engagement
    case 'engagement':
        echo json_encode(getUserEngagementStats($db));
        break;
    
    // Get advertisement performance
    case 'ads':
        echo json_encode(getAdStats($db));
        break;
    
    // Get trending content
    case 'trending':
        echo json_encode(getTrendingStats($db));
        break;
    
    // Get traffic sources
    case 'traffic':
        echo json_encode(getTrafficStats($db));
        break;
    
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
}

/**
 * Get overview statistics
 */
function getOverviewStats($db) {
    $connection = $db->getConnection();
    
    // Total views today
    $result = $connection->query("
        SELECT COUNT(*) as count FROM article_views 
        WHERE DATE(timestamp) = CURDATE()
    ");
    $todayViews = $result->fetch_assoc()['count'] ?? 0;
    
    // Total articles
    $result = $connection->query("
        SELECT COUNT(DISTINCT article_id) as count FROM article_views
    ");
    $totalArticles = $result->fetch_assoc()['count'] ?? 0;
    
    // Unique visitors today
    $result = $connection->query("
        SELECT COUNT(DISTINCT viewer_ip) as count FROM article_views 
        WHERE DATE(timestamp) = CURDATE()
    ");
    $uniqueVisitorsToday = $result->fetch_assoc()['count'] ?? 0;
    
    // Active users (last 24 hours)
    $result = $connection->query("
        SELECT COUNT(DISTINCT user_id) as count FROM user_engagement 
        WHERE DATE(timestamp) = CURDATE()
    ");
    $activeUsers = $result->fetch_assoc()['count'] ?? 0;
    
    return [
        'todayViews' => $todayViews,
        'totalArticles' => $totalArticles,
        'uniqueVisitorsToday' => $uniqueVisitorsToday,
        'activeUsers' => $activeUsers,
        'timestamp' => date('Y-m-d H:i:s')
    ];
}

/**
 * Get article statistics
 */
function getArticleStats($db) {
    $connection = $db->getConnection();
    
    // Top articles by views
    $result = $connection->query("
        SELECT article_id, COUNT(*) as views, COUNT(DISTINCT viewer_ip) as unique_views,
               AVG(duration_seconds) as avg_duration
        FROM article_views
        GROUP BY article_id
        ORDER BY views DESC
        LIMIT 20
    ");
    
    $topArticles = [];
    while ($row = $result->fetch_assoc()) {
        $topArticles[] = [
            'articleId' => $row['article_id'],
            'views' => $row['views'],
            'uniqueViews' => $row['unique_views'],
            'avgDuration' => round($row['avg_duration']),
            'avgReadTime' => round($row['avg_duration'] / 60, 1) . ' دقائق'
        ];
    }
    
    // Article performance by category
    $result = $connection->query("
        SELECT category, COUNT(DISTINCT article_id) as article_count,
               SUM(views) as total_views, AVG(avg_duration_seconds) as avg_duration
        FROM page_analytics
        GROUP BY category
        ORDER BY total_views DESC
    ");
    
    $byCategory = [];
    while ($row = $result->fetch_assoc()) {
        $byCategory[] = [
            'category' => $row['category'],
            'articles' => $row['article_count'],
            'views' => $row['total_views'],
            'avgDuration' => round($row['avg_duration'])
        ];
    }
    
    return [
        'topArticles' => $topArticles,
        'byCategory' => $byCategory,
        'timestamp' => date('Y-m-d H:i:s')
    ];
}

/**
 * Get user engagement statistics
 */
function getUserEngagementStats($db) {
    $connection = $db->getConnection();
    
    // Engagement by action type
    $result = $connection->query("
        SELECT action, COUNT(*) as count, COUNT(DISTINCT user_id) as users
        FROM user_engagement
        WHERE DATE(timestamp) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY action
    ");
    
    $byAction = [];
    while ($row = $result->fetch_assoc()) {
        $byAction[] = [
            'action' => $row['action'],
            'count' => $row['count'],
            'users' => $row['users']
        ];
    }
    
    // Average engagement time by category
    $result = $connection->query("
        SELECT ue.action, AVG(ue.time_spent_seconds) as avg_time
        FROM user_engagement ue
        WHERE DATE(ue.timestamp) = CURDATE()
        GROUP BY ue.action
    ");
    
    $avgTimes = [];
    while ($row = $result->fetch_assoc()) {
        $avgTimes[] = [
            'action' => $row['action'],
            'avgTime' => round($row['avg_time']) . ' ثانية'
        ];
    }
    
    // Most engaged articles
    $result = $connection->query("
        SELECT article_id, SUM(time_spent_seconds) as total_time,
               COUNT(DISTINCT user_id) as engaged_users
        FROM user_engagement
        GROUP BY article_id
        ORDER BY total_time DESC
        LIMIT 10
    ");
    
    $mostEngaged = [];
    while ($row = $result->fetch_assoc()) {
        $mostEngaged[] = [
            'articleId' => $row['article_id'],
            'totalTime' => $row['total_time'],
            'engagedUsers' => $row['engaged_users']
        ];
    }
    
    return [
        'byAction' => $byAction,
        'avgTimes' => $avgTimes,
        'mostEngaged' => $mostEngaged
    ];
}

/**
 * Get advertisement statistics
 */
function getAdStats($db) {
    $connection = $db->getConnection();
    
    // Ad performance
    $result = $connection->query("
        SELECT a.ad_id, a.title, ap.placement_id, ap.views_count, ap.clicks_count,
               ROUND((ap.clicks_count / ap.views_count * 100), 2) as ctr
        FROM advertisements a
        JOIN ad_placements ap ON a.ad_id = ap.ad_id
        WHERE a.status = 'active'
        ORDER BY ap.views_count DESC
    ");
    
    $ads = [];
    while ($row = $result->fetch_assoc()) {
        $ads[] = [
            'adId' => $row['ad_id'],
            'title' => $row['title'],
            'views' => $row['views_count'],
            'clicks' => $row['clicks_count'],
            'ctr' => $row['ctr'] ?? 0
        ];
    }
    
    // Total ad metrics
    $result = $connection->query("
        SELECT SUM(views_count) as total_views, SUM(clicks_count) as total_clicks
        FROM ad_placements
        JOIN advertisements ON ad_placements.ad_id = advertisements.ad_id
        WHERE advertisements.status = 'active'
    ");
    
    $total = $result->fetch_assoc();
    $totalViews = $total['total_views'] ?? 0;
    $totalClicks = $total['total_clicks'] ?? 0;
    $overallCTR = $totalViews > 0 ? round(($totalClicks / $totalViews * 100), 2) : 0;
    
    return [
        'ads' => $ads,
        'summary' => [
            'totalViews' => $totalViews,
            'totalClicks' => $totalClicks,
            'overallCTR' => $overallCTR . '%'
        ]
    ];
}

/**
 * Get trending content
 */
function getTrendingStats($db) {
    $connection = $db->getConnection();
    
    // Trending articles (last 7 days)
    $result = $connection->query("
        SELECT article_id, COUNT(*) as recent_views
        FROM article_views
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY article_id
        ORDER BY recent_views DESC
        LIMIT 10
    ");
    
    $trending = [];
    while ($row = $result->fetch_assoc()) {
        $trending[] = [
            'articleId' => $row['article_id'],
            'recentViews' => $row['recent_views'],
            'trend' => 'rising'
        ];
    }
    
    // Popular categories
    $result = $connection->query("
        SELECT category, views
        FROM page_analytics
        ORDER BY views DESC
        LIMIT 5
    ");
    
    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $categories[] = [
            'category' => $row['category'],
            'views' => $row['views']
        ];
    }
    
    return [
        'trendingArticles' => $trending,
        'popularCategories' => $categories
    ];
}

/**
 * Get traffic source statistics
 */
function getTrafficStats($db) {
    $connection = $db->getConnection();
    
    // Hourly traffic
    $result = $connection->query("
        SELECT HOUR(timestamp) as hour, COUNT(*) as views
        FROM article_views
        WHERE DATE(timestamp) = CURDATE()
        GROUP BY HOUR(timestamp)
        ORDER BY hour ASC
    ");
    
    $hourly = [];
    $hours = array_fill(0, 24, 0);
    while ($row = $result->fetch_assoc()) {
        $hours[$row['hour']] = $row['views'];
    }
    
    for ($i = 0; $i < 24; $i++) {
        $hourly[] = [
            'hour' => sprintf('%02d:00', $i),
            'views' => $hours[$i]
        ];
    }
    
    return [
        'hourlyTraffic' => $hourly,
        'timestamp' => date('Y-m-d H:i:s')
    ];
}
?>
