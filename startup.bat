@echo off
REM FoundIt - Windows Startup Script

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║           FoundIt - Campus Lost & Found            ║
echo ║                 Starting Services...              ║
echo ╚════════════════════════════════════════════════════╝
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 14+
    pause
    exit /b 1
)

echo ✅ Python and Node.js found
echo.

REM Install dependencies
echo Installing backend dependencies...
cd backend
pip install -r ../requirements.txt >nul 2>&1
echo ✅ Backend dependencies installed

echo.
echo Installing frontend dependencies...
cd ../frontend
npm install >nul 2>&1
echo ✅ Frontend dependencies installed

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║            Services Ready to Start!                ║
echo ║                                                    ║
echo ║ Backend:  python -m uvicorn server:app --reload   ║
echo ║ Frontend: npm start                                ║
echo ║                                                    ║
echo ║ Frontend: http://localhost:3000                    ║
echo ║ Backend:  http://localhost:8000                    ║
echo ║ API Docs: http://localhost:8000/docs              ║
echo ╚════════════════════════════════════════════════════╝
echo.
echo Opening frontend...
start http://localhost:3000

echo Starting backend on port 8000...
cd ../backend
python -m uvicorn server:app --reload --port 8000
