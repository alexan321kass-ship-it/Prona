@echo off
set JAVA_HOME=C:\Users\janus\Desktop\BACKUOv2\openjdk\jdk-26.0.1
set PATH=%JAVA_HOME%\bin;%PATH%
set webdriver.chrome.driver=C:\Users\janus\Desktop\BACKUOv2\chromedriver\chromedriver-win64\chromedriver.exe

echo "Ejecutando pruebas con Maven..."
call "C:\Users\janus\Desktop\BACKUOv2\maven\apache-maven-3.9.6\bin\mvn.cmd" -f "C:\Users\janus\Desktop\BACKUOv2\robot\Proyecto_Robot\pom.xml" clean verify

echo "Abriendo el reporte..."
explorer "C:\Users\janus\Desktop\BACKUOv2\robot\Proyecto_Robot\target\site\serenity\index.html"
