<?php
declare(strict_types=1);

function secure_storage_key(): string {
    $encoded = getenv('ZAHER_DATA_ENCRYPTION_KEY') ?: '';
    $key = base64_decode($encoded, true);
    if ($key === false || strlen($key) !== SODIUM_CRYPTO_SECRETBOX_KEYBYTES) {
        throw new RuntimeException('ZAHER_DATA_ENCRYPTION_KEY is missing or invalid');
    }
    return $key;
}

function secure_read(string $path): array {
    if (!is_file($path) || filesize($path) === 0) return [];
    $encoded = file_get_contents($path);
    $encrypted = base64_decode((string)$encoded, true);
    if ($encrypted === false || strlen($encrypted) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES) throw new RuntimeException('Encrypted storage is invalid');
    $nonce = substr($encrypted, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
    $ciphertext = substr($encrypted, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
    $plain = sodium_crypto_secretbox_open($ciphertext, $nonce, secure_storage_key());
    if ($plain === false) throw new RuntimeException('Encrypted storage cannot be opened');
    $data = json_decode($plain, true);
    return is_array($data) ? $data : [];
}

function secure_write(string $path, array $data): void {
    $directory = dirname($path);
    if (!is_dir($directory) || !is_writable($directory)) throw new RuntimeException('Encrypted storage directory is not writable');
    $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
    $plain = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
    $encrypted = $nonce . sodium_crypto_secretbox($plain, $nonce, secure_storage_key());
    $temporary = $path . '.tmp';
    if (file_put_contents($temporary, base64_encode($encrypted), LOCK_EX) === false || !rename($temporary, $path)) throw new RuntimeException('Encrypted storage cannot be written');
    @chmod($path, 0600);
}
