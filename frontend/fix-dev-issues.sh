#!/bin/bash

echo "🔧 Fixing AI Workout App Development Issues..."

# Stop any running dev servers
echo "📱 Stopping development servers..."
pkill -f "vite"
pkill -f "npm run dev"

# Clear Vite cache
echo "🧹 Clearing Vite cache..."
rm -rf node_modules/.vite
rm -rf dist

# Clear npm cache (optional)
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Reinstall dependencies (if needed)
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check for TypeScript issues
echo "🔍 Checking TypeScript..."
npx tsc --noEmit

# Restart development server
echo "🚀 Starting development server..."
npm run dev

echo "✅ Development environment should be fixed!"
echo ""
echo "If you still see issues:"
echo "1. Check the browser console for any remaining errors"
echo "2. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)"
echo "3. Clear browser cache and localStorage"
echo ""
echo "🎉 Your enhanced AI Workout app is ready!"
