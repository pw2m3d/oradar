@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale a versao 22 ou superior em https://nodejs.org/
  pause
  exit /b 1
)
echo ORadar: acesse http://localhost:4173
node server.mjs
pause
