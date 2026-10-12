@echo off
setlocal
set "MAVEN_HOME=%~dp0.mvn\apache-maven-3.9.6"
call "%MAVEN_HOME%\bin\mvn.cmd" %*
exit /b %ERRORLEVEL%
