#!/bin/bash
echo "打包 game-server 开始"
pwd
tar -cvzf ./game-server/app.tar ./game-server/app ./game-server/app.js
echo "打包 game-server 结束"
echo "上传 game-server 开始"
expect -c "spawn scp ./game-server/app.tar root@47.105.38.139:/opt/game-server;
expect password;
send Slhy20181806\r;
expect $;exit"
echo "上传 game-server 结束"
rm -rf game-server.tar ./game-server/app.tar
echo "重新启动！"
./restart.sh "47.105.38.139" "Slhy20181806"