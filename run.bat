@echo off
echo ==================================================
echo Starting 4Bangs Project (Frontend + Backend)
echo ==================================================

echo [1/2] Starting FastAPI Backend on Port 8000...
start "FastAPI Backend" cmd /k "cd backend && uvicorn main:app --reload"

echo [2/2] Starting Next.js Frontend on Port 3000...
start "Next.js Frontend" cmd /k "cd modo-app && npm run dev"

echo.
echo Both servers are starting up in separate windows!
echo - Frontend will be at: http://localhost:3000
echo - Backend API will be at: http://localhost:8000
echo.
pause
