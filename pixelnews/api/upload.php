<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . DIRECTORY_SEPARATOR . 'security-headers.php';
require_once __DIR__ . DIRECTORY_SEPARATOR . 'admin-auth.php';
zaher_require_capability('upload_media');
zaher_require_csrf();

$type = $_POST['type'] ?? '';
$file = $_FILES['file'] ?? null;
$limits = ['image' => 5 * 1024 * 1024, 'video' => 50 * 1024 * 1024];
$allowed = ['image' => ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'], 'video' => ['video/mp4' => 'mp4', 'video/webm' => 'webm', 'video/ogg' => 'ogv']];
if (!$file || !isset($limits[$type]) || $file['error'] !== UPLOAD_ERR_OK || $file['size'] > $limits[$type]) { http_response_code(400); echo json_encode(['error' => 'نوع الملف أو حجمه غير صالح']); exit; }
$mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
if (!isset($allowed[$type][$mime])) { http_response_code(400); echo json_encode(['error' => 'صيغة الملف غير مسموحة']); exit; }
$uploadDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
$filename = bin2hex(random_bytes(12)) . '.' . $allowed[$type][$mime];
if (!move_uploaded_file($file['tmp_name'], $uploadDir . DIRECTORY_SEPARATOR . $filename)) { http_response_code(500); echo json_encode(['error' => 'تعذر حفظ الملف']); exit; }
echo json_encode(['success' => true, 'path' => 'uploads/' . $filename], JSON_UNESCAPED_UNICODE);