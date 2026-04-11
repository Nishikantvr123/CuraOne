#!/bin/bash

# AyurSutra Project Startup Script
echo "🌟 Starting AyurSutra Therapy Management Platform..."
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the ayursutra-app directory"
    echo "   cd /Users/macbookproretina/ayursutra-app"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Error: Node.js is not installed"
    echo "   Please install Node.js from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ Error: npm is not installed"
    echo "   Please install npm (usually comes with Node.js)"
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo "📦 Checking and installing dependencies..."

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "   Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "   Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "✅ Dependencies are ready"
echo ""
echo "🚀 Starting servers..."
echo ""
echo "📌 IMPORTANT: This will open two processes:"
echo "   1. Backend server (port 5001)"
echo "   2. Frontend server (port 5173)"
echo ""
echo "   Keep this terminal open and use Ctrl+C to stop both servers"
echo ""

# Start backend in background
echo "🔧 Starting backend server..."
cd backend && PORT=5001 npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🌐 Starting frontend server..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

echo ""
echo "🎉 AyurSutra is now running!"
echo ""
echo "🔗 Frontend: http://localhost:5173"
echo "🔗 Backend API: http://localhost:5001/api"
echo ""
echo "👤 Test Accounts:"
echo "   Patient: test@example.com / Test123!"
echo "   Practitioner: practitioner@test.com / Test123!"
echo "   Admin: admin@test.com / Test123!"
echo ""
echo "📖 Full documentation available in README.md"
echo ""
echo "⏹️  Press Ctrl+C to stop all servers"

# Function to cleanup processes
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup INT

# Wait for processes to finish
wait