#!/bin/bash

echo "======================================================"
echo "🎓 Starting CampusFlow Student Hub..."
echo "======================================================"

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed! Please install Node.js (v18+) from https://nodejs.org"
    exit 1
fi

# Install dependencies if not present
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install --prefix backend
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install --prefix frontend
fi

# Open browser based on OS
echo "🌐 Opening CampusFlow in your browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
else
    xdg-open http://localhost:3000 || sensible-browser http://localhost:3000
fi

# Start servers concurrently
echo "🚀 Launching servers..."
npm run dev
