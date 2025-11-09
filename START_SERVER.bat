@echo off
echo ========================================
echo Starting Chat Interface Development Server
echo ========================================
echo.
echo This will start the Next.js server on port 3000
echo If you get a firewall warning, click "Allow Access"
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "%~dp0"
set HOST=127.0.0.1
npm run dev

pause
