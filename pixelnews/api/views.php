<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . DIRECTORY_SEPARATOR . 'security-headers.php';

$articleId = $_GET['id'] ?? '';
$metric = $_GET['metric'] ?? 'views';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = json_decode(file_get_contents('php://input'), true);
    $articleId = $payload['id'] ?? '';
    $metric = $payload['metric'] ?? 'views';
}

if (!is_string($articleId) || !preg_match('/^[a-z0-9-]{1,80}$/', $articleId) || !in_array($metric, ['views', 'shares'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid article id']);
    exit;
}

$dataPath = __DIR__ . DIRECTORY_SEPARATOR . 'views-data.json';
$secret = getenv('ZAHER_VIEW_SECRET') ?: 'change-this-zaher-view-secret';
$visitorIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$visitorHash = hash('sha256', $secret . '|' . $visitorIp);
$handle = fopen($dataPath, 'c+');
if (!$handle || !flock($handle, LOCK_EX)) {
    http_response_code(500);
    echo json_encode(['error' => 'Storage unavailable']);
    exit;
}

$contents = stream_get_contents($handle);
$data = $contents ? json_decode($contents, true) : [];
if (!is_array($data)) $data = [];
if (!isset($data[$articleId]) || !is_array($data[$articleId])) $data[$articleId] = [];
$visitorKey = $metric === 'shares' ? 'sharers' : 'visitors';
$countKey = $metric;
if (!isset($data[$articleId][$visitorKey]) || !is_array($data[$articleId][$visitorKey])) $data[$articleId][$visitorKey] = [];
if (!isset($data[$articleId][$countKey])) $data[$articleId][$countKey] = count($data[$articleId][$visitorKey]);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($data[$articleId][$visitorKey][$visitorHash])) {
    $data[$articleId][$visitorKey][$visitorHash] = time();
    $data[$articleId][$countKey] = count($data[$articleId][$visitorKey]);
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($handle);
}

$views = (int)($data[$articleId][$countKey] ?? count($data[$articleId][$visitorKey]));
flock($handle, LOCK_UN);
fclose($handle);
echo json_encode(['articleId' => $articleId, 'views' => $views], JSON_UNESCAPED_UNICODE);