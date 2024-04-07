@echo off

set curdir=%~dp0
SET nodeModules=%curdir%\node_modules

if not exist %nodeModules% (
    echo Dependencies not found. Installing...
    npm install
)