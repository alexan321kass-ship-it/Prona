@echo off
rem -------------------------------------------------
rem  Add platform-tools to PATH and run adb reverse
rem -------------------------------------------------
set "ADB_DIR=%LOCALAPPDATA%\Android\Sdk\platform-tools"
set "PATH=%PATH%;%ADB_DIR%"

rem Verify adb is available
adb version >nul 2>&1
if errorlevel 1 (
    echo ERROR: adb no está en el PATH. Verifique que la carpeta %ADB_DIR% existe.
    pause
    exit /b 1
)

rem List devices
adb devices

rem Create reverse for port 4000
adb -s W8WSE6D6OFFEBAIV reverse tcp:4000 tcp:4000

rem Show reverse list
adb -s W8WSE6D6OFFEBAIV reverse --list

pause
