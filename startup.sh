#!/bin/bash

# FoundIt - Unix/Linux/Mac Startup Script

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║           FoundIt - Campus Lost & Found            ║"
echo "║                 Starting Services...              ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.8+"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 14+"
    exit 1
fi

echo "✅ Python and Node.js found"
echo ""

# Install dependencies
echo "Installing backend dependencies..."
cd backend
pip install -r ../requirements.txt > /dev/null 2>&1
echo "✅ Backend dependencies installed"

echo ""
echo "Installing frontend dependencies..."
cd ../frontend
npm install > /dev/null 2>&1
echo "✅ Frontend dependencies installed"

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║            Services Ready to Start!                ║"
echo "║                                                    ║"
echo "║ Backend:  python -m uvicorn server:app --reload   ║"
echo "║ Frontend: npm start                                ║"
echo "║                                                    ║"
echo "║ Frontend: http://localhost:3000                    ║"
echo "║ Backend:  http://localhost:8000                    ║"
echo "║ API Docs: http://localhost:8000/docs              ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Start services in background
echo "Starting backend on port 8000..."
cd ../backend
python3 -m uvicorn server:app --reload --port 8000 &
BACKEND_PID=$!

sleep 2

echo "Starting frontend on port 3000..."
cd ../frontend
npm start &
FRONTEND_PID=$!

sleep 2

echo ""
echo "✅ Both services started!"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "Open http://localhost:3000 in your browser"
echo "Press Ctrl+C to stop both services"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
