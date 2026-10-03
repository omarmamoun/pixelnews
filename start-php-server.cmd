@echo off
cd /d "%~dp0"
set "PHP_EXE="
where php >nul 2>nul && set "PHP_EXE=php.exe"
if not defined PHP_EXE if exist "C:\php\php.exe" set "PHP_EXE=C:\php\php.exe"
if not defined PHP_EXE if exist "%~dp0php\php.exe" set "PHP_EXE=%~dp0php\php.exe"
if not defined PHP_EXE if exist "%ProgramFiles%\PHP\php.exe" set "PHP_EXE=%ProgramFiles%\PHP\php.exe"
if not defined PHP_EXE if exist "%ProgramFiles%\XAMPP\php\php.exe" set "PHP_EXE=%ProgramFiles%\XAMPP\php\php.exe"
if not defined PHP_EXE if exist "C:\xampp\php\php.exe" set "PHP_EXE=C:\xampp\php\php.exe"
if not defined PHP_EXE if exist "%ProgramFiles(x86)%\XAMPP\php\php.exe" set "PHP_EXE=%ProgramFiles(x86)%\XAMPP\php\php.exe"
if not defined PHP_EXE (
    echo PHP was not found.
    echo Put php.exe in C:\php or install XAMPP, then run this file again.
    echo Expected file: C:\php\php.exe
    pause
    exit /b 1
)
if not defined PIXELNEWS_PORT set "PIXELNEWS_PORT=8081"
set "AUTH_HOME=%LOCALAPPDATA%\PixelNews"
if not defined LOCALAPPDATA set "AUTH_HOME=%APPDATA%\PixelNews"
if not exist "%AUTH_HOME%" mkdir "%AUTH_HOME%"
if not exist "%AUTH_HOME%\Save-Data" mkdir "%AUTH_HOME%\Save-Data"
if not exist "%AUTH_HOME%\data-encryption-key" (
    "%PHP_EXE%" -d extension=sodium -r "echo base64_encode(random_bytes(SODIUM_CRYPTO_SECRETBOX_KEYBYTES));" > "%AUTH_HOME%\data-encryption-key"
)
set /p "ZAHER_DATA_ENCRYPTION_KEY="<"%AUTH_HOME%\data-encryption-key"
set "ZAHER_PRIVATE_DATA_PATH=%AUTH_HOME%\Save-Data\accounts.dat"
"%PHP_EXE%" -d extension=sodium -r "if (!extension_loaded('sodium') || strlen(base64_decode(getenv('ZAHER_DATA_ENCRYPTION_KEY'), true) ?: '') !== SODIUM_CRYPTO_SECRETBOX_KEYBYTES || !is_dir(dirname(getenv('ZAHER_PRIVATE_DATA_PATH'))) || !is_writable(dirname(getenv('ZAHER_PRIVATE_DATA_PATH')))) exit(1);" >nul 2>nul
if errorlevel 1 (
    echo PHP Sodium, encryption-key, or private account-storage setup failed.
    echo Check that php_sodium.dll exists and this Windows account can write to %AUTH_HOME%.
    pause
    exit /b 1
)
echo Using PHP: %PHP_EXE%
echo Encrypted account data is stored outside the project in: %AUTH_HOME%\Save-Data
echo Starting Zaher PHP server...
echo Local:   http://localhost:%PIXELNEWS_PORT%
echo Network: http://192.168.100.33:%PIXELNEWS_PORT%
echo Press Ctrl+C to stop.
"%PHP_EXE%" -d extension=sodium -d upload_max_filesize=50M -d post_max_size=55M -d "error_log=%AUTH_HOME%\php-errors.log" -S 0.0.0.0:%PIXELNEWS_PORT%
pause
