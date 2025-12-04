$ErrorActionPreference = "Stop"

$projectRoot = Get-Location
$backendDir = Join-Path $projectRoot "edu-match-pro-backend"
$frontendDir = Join-Path $projectRoot "edu-match-pro-frontend"

Write-Host "Starting Edu Match PRO..." -ForegroundColor Cyan

# Check Backend
if (-not (Test-Path (Join-Path $backendDir ".venv"))) {
    Write-Error "Backend virtual environment not found in $backendDir. Please run 'python -m venv .venv' and install requirements."
}

# Check Frontend
if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    Write-Error "Frontend node_modules not found in $frontendDir. Please run 'npm install'."
}

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Green
$backendScriptBlock = {
    param($dir)
    Set-Location $dir
    Write-Host "Activating virtual environment..."
    . .venv\Scripts\Activate.ps1
    Write-Host "Starting Uvicorn..."
    uvicorn main:app --host 0.0.0.0 --port 3001 --reload
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$backendScriptBlock} -dir '$backendDir'"

# Start AI Core
Write-Host "Starting AI Core..." -ForegroundColor Green
$aiCoreScriptBlock = {
    param($dir)
    Set-Location $dir
    # Check for venv in root or use global python if not found (assuming user has setup)
    if (Test-Path ".venv") {
        Write-Host "Activating root virtual environment..."
        . .venv\Scripts\Activate.ps1
    }
    Write-Host "Starting AI Core Service..."
    $env:PYTHONPATH = $dir
    uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$aiCoreScriptBlock} -dir '$projectRoot'"

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Green
$frontendScriptBlock = {
    param($dir)
    Set-Location $dir
    Write-Host "Starting Vite..."
    npm run dev
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$frontendScriptBlock} -dir '$frontendDir'"

Write-Host "Services are starting in separate windows." -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:3001"
Write-Host "AI Core API: http://localhost:8000"
Write-Host "Frontend: http://localhost:5173"
