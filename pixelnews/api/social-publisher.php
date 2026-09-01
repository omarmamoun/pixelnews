<?php
declare(strict_types=1);

function social_json(string $value): array {
    $data = json_decode($value, true);
    return is_array($data) ? $data : [];
}

function social_request(string $url, array $fields, array $headers = []): array {
    if (!function_exists('curl_init')) return ['ok' => false, 'error' => 'cURL غير مثبت على الخادم'];
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => in_array('Content-Type: application/json', $headers, true) ? json_encode($fields, JSON_UNESCAPED_UNICODE) : http_build_query($fields),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => $headers
    ]);
    $body = curl_exec($curl);
    $error = curl_error($curl);
    $status = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    if ($body === false) return ['ok' => false, 'error' => $error ?: 'فشل الاتصال'];
    $result = social_json($body);
    return ['ok' => $status >= 200 && $status < 300 && !isset($result['error']), 'status' => $status, 'response' => $result];
}

function social_message(string $id, array $article): string {
    $siteUrl = rtrim((string)(getenv('ZAHER_SITE_URL') ?: ''), '/');
    $articleUrl = $siteUrl !== '' ? $siteUrl . '/article.html?id=' . rawurlencode($id) : '';
    $message = "منصة ظاهر الإعلامية\n" . trim((string)($article['title'] ?? '')) . "\n\n" . trim((string)($article['category'] ?? ''));
    return $articleUrl !== '' ? $message . "\n" . $articleUrl : $message;
}

function social_publish_facebook(string $message): array {
    $pageId = getenv('ZAHER_FACEBOOK_PAGE_ID') ?: '';
    $token = getenv('ZAHER_FACEBOOK_PAGE_TOKEN') ?: '';
    if ($pageId === '' || $token === '') return ['status' => 'not_configured'];
    return social_request('https://graph.facebook.com/v20.0/' . rawurlencode($pageId) . '/feed', ['message' => $message, 'access_token' => $token]);
}

function social_publish_instagram(array $article, string $message): array {
    $userId = getenv('ZAHER_INSTAGRAM_USER_ID') ?: '';
    $token = getenv('ZAHER_INSTAGRAM_ACCESS_TOKEN') ?: '';
    $imageUrl = trim((string)($article['image'] ?? ''));
    $siteUrl = rtrim((string)(getenv('ZAHER_SITE_URL') ?: ''), '/');
    if ($imageUrl !== '' && !preg_match('/^https?:\/\//i', $imageUrl) && $siteUrl !== '') $imageUrl = $siteUrl . '/' . ltrim($imageUrl, './');
    if ($userId === '' || $token === '' || $imageUrl === '') return ['status' => 'not_configured'];
    $container = social_request('https://graph.facebook.com/v20.0/' . rawurlencode($userId) . '/media', ['image_url' => $imageUrl, 'caption' => $message, 'access_token' => $token]);
    if (!$container['ok'] || empty($container['response']['id'])) return $container;
    return social_request('https://graph.facebook.com/v20.0/' . rawurlencode($userId) . '/media_publish', ['creation_id' => $container['response']['id'], 'access_token' => $token]);
}

function social_publish_telegram(string $message): array {
    $token = getenv('ZAHER_TELEGRAM_BOT_TOKEN') ?: '';
    $chatId = getenv('ZAHER_TELEGRAM_CHAT_ID') ?: '';
    if ($token === '' || $chatId === '') return ['status' => 'not_configured'];
    return social_request('https://api.telegram.org/bot' . $token . '/sendMessage', ['chat_id' => $chatId, 'text' => $message, 'disable_web_page_preview' => 'false']);
}

function social_publish_x(string $message): array {
    $token = getenv('ZAHER_X_ACCESS_TOKEN') ?: '';
    if ($token === '') return ['status' => 'not_configured'];
    return social_request('https://api.x.com/2/tweets', ['text' => $message], ['Authorization: Bearer ' . $token, 'Content-Type: application/json']);
}

function social_log(string $id, array $results): void {
    $path = __DIR__ . DIRECTORY_SEPARATOR . 'social-posts.json';
    $data = is_file($path) ? social_json((string)file_get_contents($path)) : [];
    $posts = is_array($data['posts'] ?? null) ? $data['posts'] : [];
    $posts[] = ['articleId' => $id, 'createdAt' => date(DATE_ATOM), 'results' => $results];
    $handle = fopen($path, 'c+');
    if (!$handle || !flock($handle, LOCK_EX)) return;
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode(['posts' => array_slice($posts, -200)], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
}

function social_publish_article(string $id, array $article): array {
    $message = social_message($id, $article);
    $results = [
        'facebook' => social_publish_facebook($message),
        'instagram' => social_publish_instagram($article, $message),
        'telegram' => social_publish_telegram($message),
        'x' => social_publish_x($message)
    ];
    social_log($id, $results);
    return $results;
}
