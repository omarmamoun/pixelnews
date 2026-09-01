<?php
declare(strict_types=1);
require_once __DIR__ . DIRECTORY_SEPARATOR . 'secure-storage.php';

if (session_status() === PHP_SESSION_NONE) {
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_set_cookie_params(['httponly' => true, 'secure' => $secure, 'samesite' => 'Lax', 'path' => '/']);
    session_start();
}

function zaher_owner_email(): string {
    return strtolower(getenv('ZAHER_ADMIN_EMAIL') ?: 'omarmamoun2004@gmail.com');
}

function zaher_request_email(): string {
    return strtolower(trim((string)($_SESSION['user']['email'] ?? '')));
}

function zaher_require_csrf(): void {
    $provided = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    $expected = (string)($_SESSION['csrf_token'] ?? '');
    if ($provided === '' || $expected === '' || !hash_equals($expected, $provided)) {
        http_response_code(419);
        echo json_encode(['error' => 'رمز الحماية غير صالح أو منتهي'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

function zaher_read_admins(): array {
    $path = getenv('ZAHER_PRIVATE_DATA_PATH') ?: (__DIR__ . DIRECTORY_SEPARATOR . 'Save-Data');
    try {
        $data = secure_read($path);
        if (is_array($data['admins'] ?? null)) return $data['admins'];
        $legacyPath = __DIR__ . DIRECTORY_SEPARATOR . 'admins-data.json';
        $legacy = is_file($legacyPath) ? json_decode((string)file_get_contents($legacyPath), true) : [];
        $admins = is_array($legacy['admins'] ?? null) ? $legacy['admins'] : [];
        if ($admins) { $data['admins'] = $admins; secure_write($path, $data); }
        return $admins;
    } catch (RuntimeException $error) {
        http_response_code(500);
        echo json_encode(['error' => 'Encrypted account storage is unavailable'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

function zaher_write_admins(array $admins): void {
    $path = getenv('ZAHER_PRIVATE_DATA_PATH') ?: (__DIR__ . DIRECTORY_SEPARATOR . 'Save-Data');
    try {
        $data = secure_read($path);
        $data['admins'] = array_values($admins);
        secure_write($path, $data);
    } catch (RuntimeException $error) {
        http_response_code(500);
        echo json_encode(['error' => 'Encrypted account storage is unavailable'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

function zaher_is_owner(string $email): bool {
    return $email !== '' && hash_equals(zaher_owner_email(), strtolower($email));
}

function zaher_is_admin(string $email): bool {
    if (zaher_is_owner($email)) return true;
    foreach (zaher_read_admins() as $admin) {
        if (is_array($admin) && strtolower((string)($admin['email'] ?? '')) === strtolower($email)) return true;
    }
    return false;
}

function zaher_admin_role(string $email): string {
    if (zaher_is_owner($email)) return 'owner';
    foreach (zaher_read_admins() as $admin) {
        if (is_array($admin) && strtolower((string)($admin['email'] ?? '')) === strtolower($email)) {
            return (string)($admin['role'] ?? 'admin');
        }
    }
    return '';
}

function zaher_role_capabilities(string $role): array {
    return [
        'owner' => ['manage_admins', 'manage_content', 'upload_media', 'moderate_comments', 'view_dashboard'],
        'admin' => ['manage_content', 'upload_media', 'moderate_comments', 'view_dashboard'],
        'editor' => ['manage_content', 'upload_media', 'view_dashboard'],
        'writer' => ['manage_content', 'view_dashboard'],
        'moderator' => ['moderate_comments', 'view_dashboard'],
        'viewer' => ['view_dashboard']
    ][$role] ?? [];
}

function zaher_has_capability(string $email, string $capability): bool {
    return in_array($capability, zaher_role_capabilities(zaher_admin_role($email)), true);
}

function zaher_require_admin(): string {
    $email = zaher_request_email();
    if (!zaher_is_admin($email)) {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access denied'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    return $email;
}

function zaher_require_capability(string $capability): string {
    $email = zaher_request_email();
    if (!zaher_has_capability($email, $capability)) {
        http_response_code(403);
        echo json_encode(['error' => 'ليس لديك صلاحية لتنفيذ هذه العملية'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    return $email;
}

function zaher_require_owner(): string {
    $email = zaher_request_email();
    if (!zaher_is_owner($email)) {
        http_response_code(403);
        echo json_encode(['error' => 'Owner access denied'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    return $email;
}
