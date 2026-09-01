@echo off
cd /d "%~dp0"
set "PHP_EXE="
where php >nul 2>nul && set "PHP_EXE=php.exe"
if not defined PHP_EXE if exist "C:\php\php.exe" set "PHP_EXE=C:\php\php.exe"
if not defined PHP_EXE if exist "%~dp0php\php.exe" set "PHP_EXE=%~dp0php\php.exe"
if not defined PHP_EXE if exist "%ProgramFiles%\PHP\php.exe" set "PHP_EXE=%ProgramFiles%\PHP\php.exe"
if not defined PHP_EXE if exist "%ProgramFiles%\XAMPP\php\php.exe" set "PHP_EXE=%ProgramFiles%\XAMPP\php\php.exe"
if not defined PHP_EXE if exist "C:\xampp\php\php.exe" set "PHP_EXE=C:\xampp\php\php.exe"
if not defined PHP_EXE (
    echo PHP was not found.
    echo Put php.exe in C:\php or install XAMPP, then run this file again.
    echo Expected file: C:\php\php.exe
    pause
    exit /b 1
)
echo Using PHP: %PHP_EXE%
echo Starting Zaher PHP server...
echo Local:   http://localhost:8080
echo Network: http://192.168.100.33:8080
echo Press Ctrl+C to stop.
"%PHP_EXE%" -S 0.0.0.0:8080
pause
