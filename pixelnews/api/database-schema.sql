-- Pixel News Database Schema
-- Generated: August 19, 2026
-- This schema includes tables for analytics, ads, user engagement, and advanced features

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS article_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id VARCHAR(255) NOT NULL,
    viewer_ip VARCHAR(45) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INT DEFAULT 0,
    INDEX idx_article (article_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_ip (viewer_ip)
);

CREATE TABLE IF NOT EXISTS page_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    page_url VARCHAR(500) NOT NULL UNIQUE,
    category VARCHAR(100),
    views INT DEFAULT 0,
    avg_duration_seconds INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_updated (last_updated)
);

CREATE TABLE IF NOT EXISTS user_engagement (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255),
    article_id VARCHAR(255) NOT NULL,
    time_spent_seconds INT DEFAULT 0,
    action VARCHAR(50), -- 'view', 'comment', 'share', 'like'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_article (article_id),
    INDEX idx_timestamp (timestamp)
);

-- ============================================================================
-- ADVERTISEMENT TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS advertisements (
    ad_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    image_url VARCHAR(500),
    link_url VARCHAR(500),
    advertiser_name VARCHAR(255),
    status ENUM('draft', 'active', 'paused', 'expired') DEFAULT 'draft',
    start_date DATETIME,
    end_date DATETIME,
    click_text VARCHAR(100) DEFAULT 'اضغط هنا',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

CREATE TABLE IF NOT EXISTS ad_placements (
    placement_id INT PRIMARY KEY AUTO_INCREMENT,
    ad_id INT NOT NULL,
    position VARCHAR(100), -- 'header', 'sidebar', 'between-articles', 'footer'
    priority INT DEFAULT 1,
    views_count INT DEFAULT 0,
    clicks_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_id) REFERENCES advertisements(ad_id) ON DELETE CASCADE,
    INDEX idx_ad (ad_id),
    INDEX idx_position (position)
);

CREATE TABLE IF NOT EXISTS ad_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ad_id INT NOT NULL,
    date DATE NOT NULL,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    ctr DECIMAL(5,2), -- Click-through rate
    UNIQUE KEY unique_ad_date (ad_id, date),
    FOREIGN KEY (ad_id) REFERENCES advertisements(ad_id) ON DELETE CASCADE,
    INDEX idx_ad (ad_id),
    INDEX idx_date (date)
);

-- ============================================================================
-- POINTS & REWARDS TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_points (
    user_id VARCHAR(255) PRIMARY KEY,
    total_points INT DEFAULT 0,
    level INT DEFAULT 1, -- 1=Bronze, 2=Silver, 3=Gold, 4=Platinum
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_level (level)
);

CREATE TABLE IF NOT EXISTS point_transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    points INT NOT NULL, -- can be negative for deductions
    type VARCHAR(50), -- 'watch_ad', 'comment', 'share', 'article_view', 'purchase'
    article_id VARCHAR(255),
    related_id VARCHAR(255), -- ad_id for ad watching, etc
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_points(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_timestamp (timestamp)
);

CREATE TABLE IF NOT EXISTS point_rewards (
    reward_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    points_needed INT NOT NULL,
    reward_type VARCHAR(50), -- 'feature', 'discount', 'badge'
    icon_class VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_points (points_needed)
);

-- ============================================================================
-- ARTICLE SUBMISSION & APPROVAL TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS article_submissions (
    submission_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image_url VARCHAR(500),
    category VARCHAR(100),
    status ENUM('pending', 'approved', 'rejected', 'published') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

CREATE TABLE IF NOT EXISTS submission_reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    reviewer_id VARCHAR(255) NOT NULL,
    decision VARCHAR(50), -- 'approved', 'rejected', 'request_changes'
    reason TEXT,
    feedback TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES article_submissions(submission_id) ON DELETE CASCADE,
    INDEX idx_submission (submission_id),
    INDEX idx_reviewer (reviewer_id)
);

CREATE TABLE IF NOT EXISTS submission_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by VARCHAR(255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES article_submissions(submission_id) ON DELETE CASCADE,
    INDEX idx_submission (submission_id),
    INDEX idx_timestamp (timestamp)
);

-- ============================================================================
-- MESSAGING TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_created (created_at),
    INDEX idx_unread (receiver_id, is_read)
);

CREATE TABLE IF NOT EXISTS conversations (
    conversation_id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id VARCHAR(255) NOT NULL,
    user2_id VARCHAR(255) NOT NULL,
    last_message_time DATETIME,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_conversation (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id)),
    INDEX idx_user1 (user1_id),
    INDEX idx_user2 (user2_id),
    INDEX idx_updated (last_message_time)
);

CREATE TABLE IF NOT EXISTS message_notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    message_id INT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_unread (user_id, is_read)
);

-- ============================================================================
-- REELS/SHORT VIDEOS TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS reels (
    reel_id INT PRIMARY KEY AUTO_INCREMENT,
    creator_id VARCHAR(255) NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    caption TEXT,
    duration_seconds INT,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_creator (creator_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    INDEX idx_views (views_count DESC)
);

CREATE TABLE IF NOT EXISTS reel_likes (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    reel_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (reel_id, user_id),
    FOREIGN KEY (reel_id) REFERENCES reels(reel_id) ON DELETE CASCADE,
    INDEX idx_reel (reel_id),
    INDEX idx_user (user_id)
);

CREATE TABLE IF NOT EXISTS reel_comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    reel_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reel_id) REFERENCES reels(reel_id) ON DELETE CASCADE,
    INDEX idx_reel (reel_id),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
);

CREATE TABLE IF NOT EXISTS reel_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reel_id INT NOT NULL,
    date DATE NOT NULL,
    views INT DEFAULT 0,
    shares INT DEFAULT 0,
    avg_watch_time_seconds INT DEFAULT 0,
    UNIQUE KEY unique_reel_date (reel_id, date),
    FOREIGN KEY (reel_id) REFERENCES reels(reel_id) ON DELETE CASCADE,
    INDEX idx_reel (reel_id),
    INDEX idx_date (date)
);

-- ============================================================================
-- LIVE STREAMING & BROADCAST TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS broadcasts (
    broadcast_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    stream_url VARCHAR(500),
    presenter_id VARCHAR(255),
    status ENUM('scheduled', 'live', 'ended', 'archived') DEFAULT 'scheduled',
    start_time DATETIME,
    end_time DATETIME,
    viewers_peak INT DEFAULT 0,
    viewers_current INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_presenter (presenter_id),
    INDEX idx_status (status),
    INDEX idx_times (start_time, end_time)
);

CREATE TABLE IF NOT EXISTS broadcast_viewers (
    viewer_record_id INT PRIMARY KEY AUTO_INCREMENT,
    broadcast_id INT NOT NULL,
    user_id VARCHAR(255),
    viewer_ip VARCHAR(45),
    join_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    leave_time DATETIME,
    watch_duration_seconds INT,
    FOREIGN KEY (broadcast_id) REFERENCES broadcasts(broadcast_id) ON DELETE CASCADE,
    INDEX idx_broadcast (broadcast_id),
    INDEX idx_user (user_id),
    INDEX idx_join_time (join_time)
);

CREATE TABLE IF NOT EXISTS broadcast_chat (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    broadcast_id INT NOT NULL,
    user_id VARCHAR(255),
    username VARCHAR(255),
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (broadcast_id) REFERENCES broadcasts(broadcast_id) ON DELETE CASCADE,
    INDEX idx_broadcast (broadcast_id),
    INDEX idx_timestamp (timestamp)
);

-- ============================================================================
-- INDEXES FOR OPTIMIZATION
-- ============================================================================

-- Add indexes for common queries
CREATE INDEX idx_admin_actions ON article_submissions(status, created_at);
CREATE INDEX idx_trending_reels ON reels(views_count DESC, created_at DESC);
CREATE INDEX idx_active_ads ON advertisements(status, start_date, end_date);
CREATE INDEX idx_user_messages ON messages(receiver_id, created_at DESC);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default point reward levels
INSERT IGNORE INTO point_rewards (name, description, points_needed, reward_type, icon_class) VALUES
('مستوى الفضة', 'ارتقِ إلى مستوى الفضة بجمع 500 نقطة', 500, 'badge', 'fas fa-medal'),
('مستوى الذهب', 'ارتقِ إلى مستوى الذهب بجمع 2000 نقطة', 2000, 'badge', 'fas fa-crown'),
('مستوى البلاتين', 'ارتقِ إلى مستوى البلاتين بجمع 5000 نقطة', 5000, 'badge', 'fas fa-gem'),
('نشر مقال مميز', 'اجمع 100 نقطة لنشر مقال واحد', 100, 'feature', 'fas fa-pen-fancy'),
('محتوى خالٍ من الإعلانات', 'استمتع بمشاهدة 7 أيام بدون إعلانات', 300, 'feature', 'fas fa-eye');
