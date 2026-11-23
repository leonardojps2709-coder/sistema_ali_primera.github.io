@echo off
set DB_NAME=sistema_ali
set DB_USER=root
set DB_PASS=12345678
set DB_HOST=localhost

set BACKUP_DIR=C:\AppServ\www\Proyecto\backups
set MYSQLDUMP_BIN=C:\AppServ\MySQL\bin\mysqldump.exe

if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
)

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set YYYY=%dt:~0,4%
set MM=%dt:~4,2%
set DD=%dt:~6,2%
set HH=%dt:~8,2%
set Min=%dt:~10,2%
set Sec=%dt:~12,2%
set STAMP=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%

set TARGET_FILE=%BACKUP_DIR%\backup_auto_%DB_NAME%_%STAMP%.sql

echo [%DATE% %TIME%] Iniciando respaldo de %DB_NAME%...
"%MYSQLDUMP_BIN%" --no-defaults --user=%DB_USER% --password=%DB_PASS% --host=%DB_HOST% --databases %DB_NAME% --routines --triggers --result-file="%TARGET_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo [%DATE% %TIME%] Respaldo generado con exito en: %TARGET_FILE%
) else (
    echo [%DATE% %TIME%] ERROR al generar el respaldo (Codigo: %ERRORLEVEL%)
)

forfiles /P "%BACKUP_DIR%" /M *.sql /D -30 /C "cmd /c del @path" 2>nul
echo [%DATE% %TIME%] Proceso completado.