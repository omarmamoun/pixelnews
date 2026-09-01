# Project Structure

## Active Pages

- `404.html`: fallback page for unknown routes.
- `index.html`: homepage and news discovery.
- `article.html`: article details, comments, and real metrics.
- `politics.html`, `economy.html`, `sports.html`, `technology.html`: category pages.
- `contact.html`: contact page.
- `login/login.html`: local account and profile settings.

## Shared Frontend

- `style.css`: shared responsive and dark-mode styles.
- `script.js`: navigation, filters, articles, accounts, comments UI, and metrics.
- `articles-data.js`: article content source.
- `img/`: logo and image assets.
- `robots.txt` and `sitemap.xml`: search-engine crawling and discovery; replace the placeholder domain before deployment.

## Project Setup

- `README.md`: local and production setup overview.
- `.env.example`: safe template for server environment variables; never fill it with real secrets in the repository.
- `start-php-server.cmd`: Windows development server launcher.
- `tools/set-owner-password.php`: CLI-only developer tool to create a new Owner password hash without email recovery.

## Server API

- `api/views.php`: unique IP-based views and shares.
- `api/comments.php`: shared comments and comment counts.
- `api/auth.php`: PHP-session authentication and password hashing.
- `api/Save-Data`: encrypted account storage; the encryption key is kept outside the project.
- `api/secure-storage.php`: libsodium encryption/decryption for private account data.
- `api/password-resets.json`: hashed, expiring password-reset tokens.
- `api/admins.php`: Owner-only management of admin email, phone, and job title.
- `api/admin-auth.php`: shared Owner/admin authorization for protected content APIs.
- `api/admins-data.json`: legacy migration source only; new admin records are stored in encrypted `Save-Data`.
- `api/social-publisher.php`: publishes saved news to the social accounts configured on the server.
- `api/social-posts.json`: social publishing results and history.
- `api/*-data.json`: server storage files; the hosting account must allow PHP to write them.

## Social Publishing

Creating a new article automatically attempts to publish it as `منصة ظاهر الإعلامية` on Facebook, Instagram, Telegram, and X. Editing an existing article does not create a duplicate social post. Configure these server environment variables; never put tokens in JavaScript or JSON files:

- `ZAHER_SITE_URL`
- `ZAHER_FACEBOOK_PAGE_ID` and `ZAHER_FACEBOOK_PAGE_TOKEN`
- `ZAHER_INSTAGRAM_USER_ID` and `ZAHER_INSTAGRAM_ACCESS_TOKEN`
- `ZAHER_TELEGRAM_BOT_TOKEN` and `ZAHER_TELEGRAM_CHAT_ID`
- `ZAHER_X_ACCESS_TOKEN`

## Admin Roles

- The Owner is configured by `ZAHER_ADMIN_EMAIL` and defaults to `omarmamoun2004@gmail.com`.
- The Owner adds team members from `admin/admin.html` using email, phone number, job title, and role.
- Available roles: `admin`, `editor`, `writer`, `moderator`, and `viewer`.
- An added team member must create a normal account using the same email, then log in to receive the assigned role.

The PHP API must be served over HTTP(S). Opening HTML files directly with `file://` intentionally skips server metrics.

## Security

- Authentication is stored in PHP sessions; browser storage contains display data only.
- Production HTTP requests are redirected to HTTPS by the root `.htaccess`; use a trusted hosting certificate in production.
- Admin writes require the session cookie and a matching CSRF token.
- Set `ZAHER_OWNER_PASSWORD_HASH` on the server for the configured Owner email. Generate it on the server with `php -r "echo password_hash('CHANGE_THIS_PASSWORD', PASSWORD_DEFAULT), PHP_EOL;"` and never commit the result to the repository.
- Set `ZAHER_DATA_ENCRYPTION_KEY` to a base64-encoded random 32-byte key. Generate it with `php -r "echo base64_encode(random_bytes(SODIUM_CRYPTO_SECRETBOX_KEYBYTES)), PHP_EOL;"` and keep it only in the server environment.
- PHP must have the Sodium extension enabled. For stronger isolation, set `ZAHER_PRIVATE_DATA_PATH` to a `Save-Data` path outside the public web root and keep the included web rule as a second layer.
- For local HTTPS certificate setup, run `powershell -ExecutionPolicy Bypass -File .\setup-https.ps1`; the generated PFX is ignored by Git and should remain local.
- Set `ZAHER_MAIL_FROM` and enable PHP mail/SMTP delivery so the reset link can be sent.
- Use HTTPS in production and confirm Apache allows the included `.htaccess` rules.

## Legacy Placeholders

`article-loader.js`, `settings.html`, `settings-script.js`, `Untitled-1.html`, `admin/admin`, and `login/login` are retained as empty legacy placeholders and are not loaded by active pages.