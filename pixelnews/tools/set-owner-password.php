<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

fwrite(STDOUT, "Enter the new Owner password: ");
$password = trim((string)fgets(STDIN));
if (strlen($password) < 8) {
    fwrite(STDERR, "Password must contain at least 8 characters.\n");
    exit(1);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
fwrite(STDOUT, "\nSet this server environment variable:\n\n");
fwrite(STDOUT, "ZAHER_OWNER_PASSWORD_HASH=" . $hash . "\n");
fwrite(STDOUT, "\nThe plaintext password was not saved.\n");
