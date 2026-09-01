<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . DIRECTORY_SEPARATOR . 'security-headers.php';

$payload = $_SERVER['REQUEST_METHOD'] === 'POST' ? json_decode(file_get_contents('php://input'), true) : [];
$articleId = $_GET['id'] ?? ($payload['id'] ?? '');
if (!is_string($articleId) || !preg_match('/^[a-z0-9-]{1,80}$/', $articleId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid article id']);
    exit;
}

$dataPath = __DIR__ . DIRECTORY_SEPARATOR . 'comments-data.json';
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim((string)($payload['name'] ?? ''));
    $body = trim((string)($payload['body'] ?? ''));
    if (mb_strlen($name) < 2 || mb_strlen($body) < 2 || mb_strlen($name) > 80 || mb_strlen($body) > 2000) {
        flock($handle, LOCK_UN);
        fclose($handle);
        http_response_code(400);
        echo json_encode(['error' => 'Invalid comment']);
        exit;
    }
    $data[$articleId][] = ['name' => $name, 'body' => $body, 'createdAt' => date(DATE_ATOM)];
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($handle);
}

$comments = $data[$articleId];
flock($handle, LOCK_UN);
fclose($handle);
echo json_encode(['articleId' => $articleId, 'count' => count($comments), 'comments' => $comments], JSON_UNESCAPED_UNICODE);