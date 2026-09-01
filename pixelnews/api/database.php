<?php
/**
 * Pixel News Database Helper Class
 * Handles all database operations and initialization
 */

class PixelNewsDatabase {
    private $connection = null;
    private $error = null;
    
    /**
     * Initialize database connection
     */
    public function __construct() {
        $this->connect();
    }
    
    /**
     * Connect to the database using environment variables or config
     */
    private function connect() {
        $host = getenv('DB_HOST') ?? 'localhost';
        $user = getenv('DB_USER') ?? 'root';
        $password = getenv('DB_PASSWORD') ?? '';
        $database = getenv('DB_NAME') ?? 'pixel_news';
        $port = getenv('DB_PORT') ?? 3306;
        
        try {
            $this->connection = new mysqli($host, $user, $password, $database, $port);
            
            if ($this->connection->connect_error) {
                $this->error = "Connection failed: " . $this->connection->connect_error;
                return false;
            }
            
            // Set charset to UTF-8 for Arabic support
            $this->connection->set_charset("utf8mb4");
            return true;
            
        } catch (Exception $e) {
            $this->error = $e->getMessage();
            return false;
        }
    }
    
    /**
     * Get connection object
     */
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * Execute a query
     */
    public function query($sql) {
        if (!$this->connection) return null;
        
        $result = $this->connection->query($sql);
        if (!$result) {
            $this->error = $this->connection->error;
            return null;
        }
        return $result;
    }
    
    /**
     * Execute prepared statement
     */
    public function prepare($sql) {
        if (!$this->connection) return null;
        return $this->connection->prepare($sql);
    }
    
    /**
     * Record article view
     */
    public function recordArticleView($articleId, $ipAddress, $durationSeconds = 0) {
        $stmt = $this->prepare("
            INSERT INTO article_views (article_id, viewer_ip, duration_seconds)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE duration_seconds = duration_seconds + ?
        ");
        
        if ($stmt) {
            $stmt->bind_param("ssii", $articleId, $ipAddress, $durationSeconds, $durationSeconds);
            $stmt->execute();
            $stmt->close();
            return true;
        }
        return false;
    }
    
    /**
     * Get article view count
     */
    public function getArticleViewCount($articleId) {
        $stmt = $this->prepare("
            SELECT COUNT(DISTINCT viewer_ip) as view_count
            FROM article_views
            WHERE article_id = ?
        ");
        
        if ($stmt) {
            $stmt->bind_param("s", $articleId);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $stmt->close();
            return $row['view_count'] ?? 0;
        }
        return 0;
    }
    
    /**
     * Record user engagement
     */
    public function recordUserEngagement($userId, $articleId, $timeSpent, $action) {
        $stmt = $this->prepare("
            INSERT INTO user_engagement (user_id, article_id, time_spent_seconds, action)
            VALUES (?, ?, ?, ?)
        ");
        
        if ($stmt) {
            $stmt->bind_param("ssss", $userId, $articleId, $timeSpent, $action);
            $stmt->execute();
            $stmt->close();
            return true;
        }
        return false;
    }
    
    /**
     * Award points to user
     */
    public function awardPoints($userId, $points, $type, $articleId = null, $relatedId = null) {
        // Start transaction
        $this->connection->begin_transaction();
        
        try {
            // Update or insert user points
            $stmt = $this->prepare("
                INSERT INTO user_points (user_id, total_points)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE total_points = total_points + ?
            ");
            $stmt->bind_param("sii", $userId, $points, $points);
            $stmt->execute();
            $stmt->close();
            
            // Record transaction
            $stmt = $this->prepare("
                INSERT INTO point_transactions (user_id, points, type, article_id, related_id)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->bind_param("sssss", $userId, $points, $type, $articleId, $relatedId);
            $stmt->execute();
            $stmt->close();
            
            // Commit transaction
            $this->connection->commit();
            return true;
            
        } catch (Exception $e) {
            $this->connection->rollback();
            $this->error = $e->getMessage();
            return false;
        }
    }
    
    /**
     * Get user points
     */
    public function getUserPoints($userId) {
        $stmt = $this->prepare("
            SELECT total_points, level FROM user_points WHERE user_id = ?
        ");
        
        if ($stmt) {
            $stmt->bind_param("s", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $stmt->close();
            return $row ? [
                'points' => $row['total_points'],
                'level' => $row['level']
            ] : ['points' => 0, 'level' => 1];
        }
        return ['points' => 0, 'level' => 1];
    }
    
    /**
     * Record ad view
     */
    public function recordAdView($adId, $placementId) {
        $stmt = $this->prepare("
            UPDATE ad_placements SET views_count = views_count + 1 
            WHERE ad_id = ? AND placement_id = ?
        ");
        
        if ($stmt) {
            $stmt->bind_param("ii", $adId, $placementId);
            $stmt->execute();
            $stmt->close();
            return true;
        }
        return false;
    }
    
    /**
     * Record ad click
     */
    public function recordAdClick($adId, $placementId) {
        $stmt = $this->prepare("
            UPDATE ad_placements SET clicks_count = clicks_count + 1 
            WHERE ad_id = ? AND placement_id = ?
        ");
        
        if ($stmt) {
            $stmt->bind_param("ii", $adId, $placementId);
            $stmt->execute();
            $stmt->close();
            return true;
        }
        return false;
    }
    
    /**
     * Get active advertisements for position
     */
    public function getActiveAds($position) {
        $stmt = $this->prepare("
            SELECT a.ad_id, a.title, a.image_url, a.link_url, a.click_text,
                   ap.placement_id, ap.priority
            FROM advertisements a
            JOIN ad_placements ap ON a.ad_id = ap.ad_id
            WHERE ap.position = ? 
            AND a.status = 'active'
            AND NOW() BETWEEN a.start_date AND a.end_date
            ORDER BY ap.priority DESC, RAND()
            LIMIT 5
        ");
        
        if ($stmt) {
            $stmt->bind_param("s", $position);
            $stmt->execute();
            $result = $stmt->get_result();
            $ads = $result->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
            return $ads;
        }
        return [];
    }
    
    /**
     * Submit article
     */
    public function submitArticle($userId, $title, $content, $excerpt, $imageUrl, $category) {
        $stmt = $this->prepare("
            INSERT INTO article_submissions 
            (user_id, title, content, excerpt, featured_image_url, category, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        ");
        
        if ($stmt) {
            $stmt->bind_param("ssssss", $userId, $title, $content, $excerpt, $imageUrl, $category);
            $stmt->execute();
            $submissionId = $stmt->insert_id;
            $stmt->close();
            return $submissionId;
        }
        return null;
    }
    
    /**
     * Send message
     */
    public function sendMessage($senderId, $receiverId, $content) {
        $this->connection->begin_transaction();
        
        try {
            // Insert message
            $stmt = $this->prepare("
                INSERT INTO messages (sender_id, receiver_id, content)
                VALUES (?, ?, ?)
            ");
            $stmt->bind_param("sss", $senderId, $receiverId, $content);
            $stmt->execute();
            $messageId = $stmt->insert_id;
            $stmt->close();
            
            // Update or create conversation
            $stmt = $this->prepare("
                INSERT INTO conversations (user1_id, user2_id, last_message_time)
                VALUES (LEAST(?, ?), GREATEST(?, ?), NOW())
                ON DUPLICATE KEY UPDATE last_message_time = NOW()
            ");
            $stmt->bind_param("ssss", $senderId, $receiverId, $senderId, $receiverId);
            $stmt->execute();
            $stmt->close();
            
            // Create notification
            $stmt = $this->prepare("
                INSERT INTO message_notifications (user_id, message_id)
                VALUES (?, ?)
            ");
            $stmt->bind_param("si", $receiverId, $messageId);
            $stmt->execute();
            $stmt->close();
            
            $this->connection->commit();
            return $messageId;
            
        } catch (Exception $e) {
            $this->connection->rollback();
            $this->error = $e->getMessage();
            return null;
        }
    }
    
    /**
     * Get unread messages for user
     */
    public function getUnreadMessages($userId) {
        $stmt = $this->prepare("
            SELECT COUNT(*) as unread_count
            FROM messages
            WHERE receiver_id = ? AND is_read = FALSE
        ");
        
        if ($stmt) {
            $stmt->bind_param("s", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $stmt->close();
            return $row['unread_count'] ?? 0;
        }
        return 0;
    }
    
    /**
     * Get connection error
     */
    public function getError() {
        return $this->error;
    }
    
    /**
     * Close connection
     */
    public function close() {
        if ($this->connection) {
            $this->connection->close();
        }
    }
}

// Helper function to get database instance
function getDB() {
    static $db = null;
    if (!$db) {
        $db = new PixelNewsDatabase();
    }
    return $db;
}

// Get user IP address
function getUserIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
}
?>
