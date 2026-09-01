<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . DIRECTORY_SEPARATOR . 'security-headers.php';
require_once __DIR__ . DIRECTORY_SEPARATOR . 'admin-auth.php';
require_once __DIR__ . DIRECTORY_SEPARATOR . 'social-publisher.php';
$dataPath = __DIR__ . DIRECTORY_SEPARATOR . 'articles-overrides.json';

function respond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function readData(string $path): array {
    $contents = is_file($path) ? file_get_contents($path) : '{}';
    $data = json_decode($contents ?: '{}', true);
    return is_array($data) ? $data : [];
}

function writeData(string $path, array $data): void {
    $handle = fopen($path, 'c+');
    if (!$handle || !flock($handle, LOCK_EX)) respond(['error' => 'Storage unavailable'], 500);
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
}

$data = readData($dataPath);
$data['updates'] = is_array($data['updates'] ?? null) ? $data['updates'] : [];
$data['deleted'] = is_array($data['deleted'] ?? null) ? array_values($data['deleted']) : [];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    respond([
        'articles' => $data['updates'],
        'deleted' => $data['deleted'],
        'version' => is_file($dataPath) ? hash_file('sha256', $dataPath) : 'empty'
    ]);
}

zaher_require_capability('manage_content');
zaher_require_csrf();
$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) respond(['error' => 'Invalid request'], 400);

$action = $payload['action'] ?? '';
$id = $payload['id'] ?? '';
if (!is_string($id) || !preg_match('/^[a-z0-9-]{1,80}$/', $id)) respond(['error' => 'Invalid article id'], 400);

if ($action === 'delete') {
    unset($data['updates'][$id]);
    if (!in_array($id, $data['deleted'], true)) $data['deleted'][] = $id;
} elseif ($action === 'save') {
    $article = $payload['article'] ?? [];
    if (!is_array($article) || trim((string)($article['title'] ?? '')) === '' || trim((string)($article['category'] ?? '')) === '') {
        respond(['error' => 'Title and category are required'], 400);
    }
    $data['updates'][$id] = [
        'category' => trim((string)$article['category']),
        'title' => trim((string)$article['title']),
        'image' => trim((string)($article['image'] ?? '')),
        'video' => trim((string)($article['video'] ?? '')),
        'source' => trim((string)($article['source'] ?? '')),
        'date' => trim((string)($article['date'] ?? date('d F Y'))),
        'body' => (string)($article['body'] ?? '')
    ];
    $data['deleted'] = array_values(array_filter($data['deleted'], static fn($deletedId) => $deletedId !== $id));
} else {
    respond(['error' => 'Unknown action'], 400);
}

writeData($dataPath, $data);
$social = $action === 'save' && ($payload['publishSocial'] ?? true) ? social_publish_article($id, $data['updates'][$id]) : [];
respond(['success' => true, 'version' => hash_file('sha256', $dataPath), 'social' => $social]);