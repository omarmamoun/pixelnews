<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . DIRECTORY_SEPARATOR . 'security-headers.php';
require_once __DIR__ . DIRECTORY_SEPARATOR . 'secure-storage.php';

$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params(['httponly' => true, 'secure' => $secure, 'samesite' => 'Lax', 'path' => '/']);
session_start();
require_once __DIR__ . DIRECTORY_SEPARATOR . 'admin-auth.php';
$dataPath = getenv('ZAHER_PRIVATE_DATA_PATH') ?: (__DIR__ . DIRECTORY_SEPARATOR . 'Save-Data');
$resetPath = __DIR__ . DIRECTORY_SEPARATOR . 'password-resets.json';

function auth_respond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function auth_read_users(string $path): array {
    try {
        $data = secure_read($path);
        return is_array($data['users'] ?? null) ? $data['users'] : [];
    } catch (RuntimeException $error) {
        auth_respond(['error' => 'Encrypted account storage is unavailable'], 500);
    }
}

function auth_write_users(string $path, array $users): void {
    try {
        $data = secure_read($path);
        $data['users'] = array_values($users);
        secure_write($path, $data);
    }
    catch (RuntimeException $error) { auth_respond(['error' => 'Encrypted account storage is unavailable'], 500); }
}

function auth_read_resets(string $path): array {
    $contents = is_file($path) ? file_get_contents($path) : '{}';
    $data = json_decode($contents ?: '{}', true);
    return is_array($data) && is_array($data['resets'] ?? null) ? $data['resets'] : [];
}

function auth_write_resets(string $path, array $resets): void {
    $handle = fopen($path, 'c+');
    if (!$handle || !flock($handle, LOCK_EX)) auth_respond(['error' => 'Storage unavailable'], 500);
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode(['resets' => array_values($resets)], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
}

function auth_send_reset_email(string $email, string $token): void {
    $siteUrl = rtrim((string)(getenv('ZAHER_SITE_URL') ?: ''), '/');
    $link = $siteUrl . '/login/login.html?reset=1&email=' . rawurlencode($email) . '&token=' . rawurlencode($token);
    $from = getenv('ZAHER_MAIL_FROM') ?: '';
    if ($siteUrl === '' || $from === '' || !function_exists('mail')) return;
    $headers = 'From: ' . $from . "\r\n" . 'Content-Type: text/plain; charset=UTF-8';
    @mail($email, 'استرجاع كلمة المرور - منصة ظاهر الإعلامية', "رابط استرجاع كلمة المرور صالح لمدة 15 دقيقة:\n\n" . $link, $headers);
}

function auth_public_user(array $user): array {
    return ['name' => $user['name'], 'email' => $user['email'], 'role' => $user['role'] ?? 'user', 'csrf' => $_SESSION['csrf_token'] ?? '', 'wantsNotifications' => (bool)($user['wantsNotifications'] ?? false), 'avatar' => $user['avatar'] ?? null];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (empty($_SESSION['user'])) auth_respond(['authenticated' => false], 401);
    auth_respond(['authenticated' => true, 'user' => $_SESSION['user']]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') auth_respond(['error' => 'Method not allowed'], 405);
$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) auth_respond(['error' => 'Invalid request'], 400);
$action = $payload['action'] ?? '';

if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], '', $params['secure'], $params['httponly']);
    }
    session_destroy();
    auth_respond(['success' => true]);
}

if ($action === 'update_profile') {
    if (empty($_SESSION['user']['email'])) auth_respond(['error' => 'يجب تسجيل الدخول أولاً'], 401);
    $provided = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    if ($provided === '' || empty($_SESSION['csrf_token']) || !hash_equals((string)$_SESSION['csrf_token'], $provided)) auth_respond(['error' => 'رمز الحماية غير صالح'], 419);
    $name = trim((string)($payload['name'] ?? ''));
    $password = (string)($payload['password'] ?? '');
    $wantsNotifications = !empty($payload['wantsNotifications']);
    if (mb_strlen($name) < 2 || mb_strlen($name) > 100 || ($password !== '' && strlen($password) < 8)) auth_respond(['error' => 'بيانات الحساب غير صالحة'], 400);
    $email = strtolower((string)$_SESSION['user']['email']);
    $users = auth_read_users($dataPath);
    $updated = false;
    foreach ($users as &$user) {
        if (is_array($user) && strtolower((string)($user['email'] ?? '')) === $email) {
            $user['name'] = $name;
            $user['wantsNotifications'] = $wantsNotifications;
            if ($password !== '') $user['passwordHash'] = password_hash($password, PASSWORD_DEFAULT);
            $_SESSION['user'] = auth_public_user($user);
            $updated = true;
            break;
        }
    }
    unset($user);
    if (!$updated) auth_respond(['error' => 'الحساب غير موجود'], 404);
    auth_write_users($dataPath, $users);
    auth_respond(['success' => true, 'user' => $_SESSION['user']]);
}

if ($action === 'register') {
    $name = trim((string)($payload['name'] ?? ''));
    $email = strtolower(trim((string)($payload['email'] ?? '')));
    $password = (string)($payload['password'] ?? '');
    if (mb_strlen($name) < 2 || mb_strlen($name) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
        auth_respond(['error' => 'بيانات الحساب غير صالحة'], 400);
    }
    $users = auth_read_users($dataPath);
    foreach ($users as $user) {
        if (strtolower((string)($user['email'] ?? '')) === $email) auth_respond(['error' => 'هذا البريد مسجل مسبقًا'], 409);
    }
    $role = zaher_is_owner($email) ? 'owner' : zaher_admin_role($email);
    $users[] = ['name' => $name, 'email' => $email, 'passwordHash' => password_hash($password, PASSWORD_DEFAULT), 'role' => $role ?: 'user', 'wantsNotifications' => !empty($payload['wantsNotifications']), 'avatar' => null, 'createdAt' => date(DATE_ATOM)];
    auth_write_users($dataPath, $users);
    $user = end($users);
    session_regenerate_id(true);
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    $_SESSION['user'] = auth_public_user($user);
    auth_respond(['success' => true, 'user' => $_SESSION['user']]);
}

if ($action === 'request_reset') {
    $email = strtolower(trim((string)($payload['email'] ?? '')));
    $users = auth_read_users($dataPath);
    $exists = filter_var($email, FILTER_VALIDATE_EMAIL) && array_filter($users, static fn($user) => is_array($user) && strtolower((string)($user['email'] ?? '')) === $email);
    if ($exists) {
        $token = bin2hex(random_bytes(32));
        $resets = array_values(array_filter(auth_read_resets($resetPath), static fn($reset) => (int)($reset['expiresAt'] ?? 0) > time() && strtolower((string)($reset['email'] ?? '')) !== $email));
        $resets[] = ['email' => $email, 'tokenHash' => hash('sha256', $token), 'expiresAt' => time() + 900];
        auth_write_resets($resetPath, $resets);
        auth_send_reset_email($email, $token);
    }
    auth_respond(['success' => true, 'message' => 'إذا كان البريد مسجلاً، سيصلك رابط استرجاع خلال دقائق.']);
}

if ($action === 'reset_password') {
    $email = strtolower(trim((string)($payload['email'] ?? '')));
    $token = trim((string)($payload['token'] ?? ''));
    $password = (string)($payload['password'] ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($token) !== 64 || strlen($password) < 8) auth_respond(['error' => 'بيانات الاسترجاع غير صالحة'], 400);
    $resets = auth_read_resets($resetPath);
    $valid = false;
    foreach ($resets as $reset) {
        if (strtolower((string)($reset['email'] ?? '')) === $email && (int)($reset['expiresAt'] ?? 0) >= time() && hash_equals((string)($reset['tokenHash'] ?? ''), hash('sha256', $token))) { $valid = true; break; }
    }
    if (!$valid) auth_respond(['error' => 'رمز الاسترجاع غير صالح أو منتهي'], 400);
    $users = auth_read_users($dataPath);
    $updated = false;
    foreach ($users as &$user) {
        if (is_array($user) && strtolower((string)($user['email'] ?? '')) === $email) { $user['passwordHash'] = password_hash($password, PASSWORD_DEFAULT); $updated = true; break; }
    }
    unset($user);
    if (!$updated) auth_respond(['error' => 'الحساب غير موجود'], 400);
    auth_write_users($dataPath, $users);
    auth_write_resets($resetPath, array_values(array_filter($resets, static fn($reset) => !hash_equals((string)($reset['tokenHash'] ?? ''), hash('sha256', $token)))));
    auth_respond(['success' => true, 'message' => 'تم تغيير كلمة المرور. يمكنك تسجيل الدخول الآن.']);
}

if ($action === 'login') {
    $email = strtolower(trim((string)($payload['email'] ?? '')));
    $password = (string)($payload['password'] ?? '');
    $users = auth_read_users($dataPath);
    $matched = null;
    foreach ($users as $user) {
        if (is_array($user) && strtolower((string)($user['email'] ?? '')) === $email) { $matched = $user; break; }
    }
    $valid = $matched && !empty($matched['passwordHash']) && password_verify($password, (string)$matched['passwordHash']);
    if (!$valid && zaher_is_owner($email)) {
        $ownerHash = getenv('ZAHER_OWNER_PASSWORD_HASH') ?: '';
        $valid = $ownerHash !== '' && password_verify($password, $ownerHash);
        if ($valid) $matched = ['name' => 'Owner', 'email' => $email, 'role' => 'owner', 'wantsNotifications' => false, 'avatar' => null];
    }
    if (!$valid || !is_array($matched)) auth_respond(['error' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة'], 401);
    $matched['role'] = zaher_is_owner($email) ? 'owner' : (zaher_admin_role($email) ?: 'user');
    session_regenerate_id(true);
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    $_SESSION['user'] = auth_public_user($matched);
    auth_respond(['success' => true, 'user' => $_SESSION['user']]);
}

auth_respond(['error' => 'Unknown action'], 400);
