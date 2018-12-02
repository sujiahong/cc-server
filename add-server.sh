#! /bin/bash
#pomelo add -P 4005 id=game_niu-server-1 serverType=game_niu port=10810 host=127.0.0.1 cpu=0
#pomelo add -P 4005 id=game_niu-server-2 serverType=game_niu port=10811 host=127.0.0.1 cpu=0
pomelo add -P 4005 id=connector-server-5 serverType=connector frontend=true port=10111 host=127.0.0.1 clientPort=10550 remote=192.168.10.34 cpu=3
