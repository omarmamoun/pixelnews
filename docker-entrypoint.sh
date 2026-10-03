#!/bin/sh
set -eu

RUNTIME_DIR="${ZAHER_RUNTIME_DATA_PATH:-/data/runtime}"
UPLOAD_DIR="${ZAHER_UPLOADS_PATH:-/data/uploads}"
mkdir -p "$RUNTIME_DIR" "$UPLOAD_DIR"

if [ -d /var/www/html/uploads ] && [ ! -L /var/www/html/uploads ]; then
    cp -an /var/www/html/uploads/. "$UPLOAD_DIR/" 2>/dev/null || true
    rm -rf /var/www/html/uploads
fi
if [ ! -e /var/www/html/uploads ]; then
    ln -s "$UPLOAD_DIR" /var/www/html/uploads
fi

if [ -z "${ZAHER_DATA_ENCRYPTION_KEY:-}" ]; then
    KEY_FILE="$RUNTIME_DIR/.encryption-key"
    if [ ! -s "$KEY_FILE" ]; then
        umask 077
        php -r 'echo base64_encode(random_bytes(SODIUM_CRYPTO_SECRETBOX_KEYBYTES));' > "$KEY_FILE"
    fi
    ZAHER_DATA_ENCRYPTION_KEY="$(cat "$KEY_FILE")"
    export ZAHER_DATA_ENCRYPTION_KEY
fi

if [ -z "${ZAHER_VIEW_SECRET:-}" ]; then
    SECRET_FILE="$RUNTIME_DIR/.view-secret"
    if [ ! -s "$SECRET_FILE" ]; then
        umask 077
        php -r 'echo bin2hex(random_bytes(32));' > "$SECRET_FILE"
    fi
    ZAHER_VIEW_SECRET="$(cat "$SECRET_FILE")"
    export ZAHER_VIEW_SECRET
fi

export ZAHER_RUNTIME_DATA_PATH="$RUNTIME_DIR"
export ZAHER_PRIVATE_DATA_PATH="${ZAHER_PRIVATE_DATA_PATH:-$RUNTIME_DIR/accounts.dat}"
export ZAHER_REELS_DATA_PATH="${ZAHER_REELS_DATA_PATH:-$RUNTIME_DIR/reels.dat}"
export ZAHER_ARTICLES_DATA_PATH="${ZAHER_ARTICLES_DATA_PATH:-$RUNTIME_DIR/articles-overrides.json}"
export ZAHER_ADS_DATA_PATH="${ZAHER_ADS_DATA_PATH:-$RUNTIME_DIR/ads-data.json}"
export ZAHER_COMMENTS_DATA_PATH="${ZAHER_COMMENTS_DATA_PATH:-$RUNTIME_DIR/comments-data.json}"
export ZAHER_VIEWS_DATA_PATH="${ZAHER_VIEWS_DATA_PATH:-$RUNTIME_DIR/views-data.json}"
export ZAHER_PASSWORD_RESETS_PATH="${ZAHER_PASSWORD_RESETS_PATH:-$RUNTIME_DIR/password-resets.json}"
export ZAHER_SOCIAL_LOG_PATH="${ZAHER_SOCIAL_LOG_PATH:-$RUNTIME_DIR/social-posts.json}"
export ZAHER_UPLOADS_PATH="$UPLOAD_DIR"

chown www-data:www-data "$RUNTIME_DIR" "$UPLOAD_DIR"
exec "$@"
