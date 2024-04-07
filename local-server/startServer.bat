@echo off

set curdir=%~dp0
call %curdir%\installDependencies.bat 

node app.mjs