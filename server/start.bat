@echo off
echo 正在启动DeepSeek Camera服务器...
cd /d %~dp0
npm install
npm run dev
pause