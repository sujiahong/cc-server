#!/usr/local/bin/expect

set ip [lindex $argv 0]
set pw [lindex $argv 1]
set timeout 5
spawn ssh -t root@$ip
expect yes {send $pw\r} password {send $pw\r}
expect "#"
send "tar -cvzf /opt/backup.tar /opt/game-server/app /opt/game-server/app.js \r"
send "tar -xvzf /opt/game-server/app.tar -C /opt \r"
send "pm2 reload game-server \r"
send "rm -rf /opt/game-server/app.tar \r"
expect eof
