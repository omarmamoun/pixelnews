<?php
/**
 * Pixel News - Configuration Loader
 * Loads environment variables from .env or system environment
 * Used during deployment to Railway/Heroku
 */

class Config {
    private static $config = [];
    private static $loaded = false;

    /**
     * Load configuration from .env or environment variables
     */
    public static function load() {
        if (self::$loaded) return;

        // Try to load from .env file first
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            self::loadEnvFile($envFile);
        }

        // Override with system environment variables
        self::loadFromEnvironment();
        
        self::$loaded = true;
    }

    /**
     * Load variables from .env file
     */
    private static function loadEnvFile($filePath) {
        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Skip comments
            if (strpos(trim($line), '#') === 0) continue;
            
            // Parse KEY=VALUE
            if (strpos($line, '=') === false) continue;
            
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            $value = preg_replace('/^["\'](.*)["\']$/', '$1', $value);
            
            self::$config[$key] = $value;
        }
    }

    /**
     * Override with system environment variables
     */
    private static function loadFromEnvironment() {
        // Database
        if ($env = getenv('DATABASE_HOST')) self::$config['DATABASE_HOST'] = $env;
        if ($env = getenv('DATABASE_PORT')) self::$config['DATABASE_PORT'] = $env;
        if ($env = getenv('DATABASE_USER')) self::$config['DATABASE_USER'] = $env;
        if ($env = getenv('DATABASE_PASSWORD')) self::$config['DATABASE_PASSWORD'] = $env;
        if ($env = getenv('DATABASE_NAME')) self::$config['DATABASE_NAME'] = $env;
        if ($env = getenv('DATABASE_URL')) self::$config['DATABASE_URL'] = $env;

        // Site
        if ($env = getenv('SITE_URL')) self::$config['SITE_URL'] = $env;
        if ($env = getenv('SITE_NAME')) self::$config['SITE_NAME'] = $env;
        if ($env = getenv('APP_ENV')) self::$config['APP_ENV'] = $env;

        // Security
        if ($env = getenv('ENCRYPTION_KEY')) self::$config['ENCRYPTION_KEY'] = $env;
        if ($env = getenv('JWT_SECRET')) self::$config['JWT_SECRET'] = $env;

        // Features
        if ($env = getenv('ENABLE_COMMENTS')) self::$config['ENABLE_COMMENTS'] = $env;
        if ($env = getenv('ENABLE_ADS_SYSTEM')) self::$config['ENABLE_ADS_SYSTEM'] = $env;
    }

    /**
     * Get configuration value
     */
    public static function get($key, $default = null) {
        self::load();
        return self::$config[$key] ?? $default;
    }

    /**
     * Set configuration value
     */
    public static function set($key, $value) {
        self::$config[$key] = $value;
    }

    /**
     * Get all configuration
     */
    public static function all() {
        self::load();
        return self::$config;
    }

    /**
     * Check if in production
     */
    public static function isProduction() {
        return self::get('APP_ENV') === 'production';
    }

    /**
     * Get database configuration
     */
    public static function getDatabase() {
        self::load();

        // If DATABASE_URL is provided (Railway style)
        if ($url = self::get('DATABASE_URL')) {
            return self::parseConnectionUrl($url);
        }

        // Otherwise use individual settings
        return [
            'host' => self::get('DATABASE_HOST', 'localhost'),
            'port' => self::get('DATABASE_PORT', '3306'),
            'user' => self::get('DATABASE_USER', 'root'),
            'password' => self::get('DATABASE_PASSWORD', ''),
            'database' => self::get('DATABASE_NAME', 'pixel_news'),
        ];
    }

    /**
     * Parse MySQL connection URL
     * Format: mysql://user:password@host:port/database
     */
    private static function parseConnectionUrl($url) {
        $parsed = parse_url($url);
        
        return [
            'host' => $parsed['host'] ?? 'localhost',
            'port' => $parsed['port'] ?? 3306,
            'user' => $parsed['user'] ?? 'root',
            'password' => $parsed['pass'] ?? '',
            'database' => ltrim($parsed['path'] ?? '', '/'),
        ];
    }

    /**
     * Get site URL
     */
    public static function getSiteUrl() {
        $url = self::get('SITE_URL', 'http://localhost');
        return rtrim($url, '/');
    }

    /**
     * Get API base URL
     */
    public static function getApiUrl() {
        return self::getSiteUrl() . '/api';
    }
}

// Load configuration on include
Config::load();
