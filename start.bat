@echo off
title CampusFlow Launcher
echo ======================================================
echo 🎓 Starting CampusFlow Student Hub...
echo ======================================================

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed! Please install Node.js (v18+) from https://nodejs.org
    pause
    exit /b
)

:: Install root dependencies if not present
if not exist "node_modules\" (
    echo 📦 Installing root dependencies...
    call npm install
)

:: Install backend dependencies if not present
if not exist "backend\node_modules\" (
    echo 📦 Installing backend dependencies...
    call npm install --prefix backend
)

:: Install frontend dependencies if not present
if not exist "frontend\node_modules\" (
    echo 📦 Installing frontend dependencies...
    call npm install --prefix frontend
)

:: Open browser
echo 🌐 Opening CampusFlow in your browser...
start http://localhost:3000

:: Start servers concurrently
echo 🚀 Launching servers...
call npm run dev

pause
