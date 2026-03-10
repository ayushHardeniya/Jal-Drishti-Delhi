@echo off
echo ============================================
echo  Jal-Drishti Delhi - Full Stack Application
echo  Urban Flooding ^& Hydrology Command Center
echo ============================================
echo.

echo Starting Backend (Flask API on port 5000)...
cd /d "%~dp0backend"
start "Jal-Drishti Backend" cmd /k "pip install -r requirements.txt >nul 2>&1 && python app.py"
cd /d "%~dp0"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend (React on port 3000)...
cd /d "%~dp0frontend"
start "Jal-Drishti Frontend" cmd /k "npm install && npm start"
cd /d "%~dp0"

echo.
echo ============================================
echo  Backend: http://localhost:5000
echo  Frontend: http://localhost:3000
echo ============================================
echo.
echo Both servers starting. Frontend will open in browser automatically.
pause
