<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . DIRECTORY_SEPARATOR . 'security-headers.php';
require_once __DIR__ . DIRECTORY_SEPARATOR . 'admin-auth.php';

function admins_respond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    zaher_require_admin();
    $admins = zaher_read_admins();
    admins_respond(['admins' => $admins]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') admins_respond(['error' => 'Method not allowed'], 405);
zaher_require_owner();
zaher_require_csrf();
$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) admins_respond(['error' => 'Invalid request'], 400);

$action = $payload['action'] ?? '';
$admins = zaher_read_admins();
if ($action === 'add') {
    $email = strtolower(trim((string)($payload['email'] ?? '')));
    $phone = trim((string)($payload['phone'] ?? ''));
    $jobTitle = trim((string)($payload['jobTitle'] ?? ''));
    $role = strtolower(trim((string)($payload['role'] ?? 'editor')));
    $allowedRoles = ['admin', 'editor', 'writer', 'moderator', 'viewer'];
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($phone) < 7 || mb_strlen($phone) > 30 || mb_strlen($jobTitle) < 2 || mb_strlen($jobTitle) > 100 || !in_array($role, $allowedRoles, true)) {
        admins_respond(['error' => 'بيانات الأدمن غير صالحة'], 400);
    }
    if ($email === zaher_owner_email()) admins_respond(['error' => 'لا يمكن إضافة المالك كأدمن'], 400);
    foreach ($admins as $admin) {
        if (is_array($admin) && strtolower((string)($admin['email'] ?? '')) === $email) admins_respond(['error' => 'هذا البريد مضاف مسبقًا'], 409);
    }
    $admins[] = ['email' => $email, 'phone' => $phone, 'jobTitle' => $jobTitle, 'role' => $role, 'createdAt' => date(DATE_ATOM)];
} elseif ($action === 'update') {
    $email = strtolower(trim((string)($payload['email'] ?? '')));
    $role = strtolower(trim((string)($payload['role'] ?? '')));
    if (!in_array($role, ['admin', 'editor', 'writer', 'moderator', 'viewer'], true)) admins_respond(['error' => 'الدور غير صالح'], 400);
    $updated = false;
    foreach ($admins as &$admin) {
        if (is_array($admin) && strtolower((string)($admin['email'] ?? '')) === $email) {
            $admin['role'] = $role;
            $updated = true;
            break;
        }
    }
    unset($admin);
    if (!$updated) admins_respond(['error' => 'الأدمن غير موجود'], 404);
} elseif ($action === 'remove') {
    $email = strtolower(trim((string)($payload['email'] ?? '')));
    $admins = array_values(array_filter($admins, static fn($admin) => strtolower((string)($admin['email'] ?? '')) !== $email));
} else {
    admins_respond(['error' => 'Unknown action'], 400);
}

zaher_write_admins($admins);
admins_respond(['success' => true, 'admins' => $admins]);
