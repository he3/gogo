@echo off
for /f "delims=" %%i in ('npm config get prefix') do set output=%%i
@node %output%/node_modules/gogo/gg.js %*
echo on