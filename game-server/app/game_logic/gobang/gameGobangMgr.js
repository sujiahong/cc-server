"use strict";
const TAG = "gameGobangMgr.js";
const async = require("async");
const redis = require("../../redis/redisDb");
const gobangRedis = require("../../redis/redisGobang");
const errcode = require("../../shared/errcode");
const constant = require("../../shared/constant");
const pusher = require("../../pusher/gobang_push/push");
const gamePusher = require("../../pusher/game_push/push");
const userRecord = require("../../parse/UserRecord");
const tradingRecord = require("../../parse/TransactionRecord");
const combatRecord = require("../../parse/GobangCombatRecord");
const gobangRoom = require("./gameGobangRoom");
const util = require("../../util/utils");

var GameGobangMgr = function(){
    //console.log("=============================================123456789123456789")
    this.rooms = {};
}

module.exports = GameGobangMgr;

var mgr = GameGobangMgr.prototype;

mgr.getRoomById = function(roomId, next){
    var self = this;
    var room = self.rooms[roomId];
    if (room){
        next(errcode.OK, room);
    }else{
        next(errcode.GOBANG_ROOM_NOT_EXIST);
    }
}

////handler

mgr.play = function(roomId, userId, msg, next){
    var type = msg.type
    var data = msg.data;
    this.getRoomById(roomId, function(ecode, room){
        if (ecode == errcode.OK){
            var player = room.getPlayerByUId(userId);
            if (!player){
                return next(null, {code: errcode.NOT_IN_GOBANG_ROOM});
            }
            if (type == 1){
                if (!data){
                    return next(null, {code: errcode.NO_SET_BASE_COIN});
                }
                if (data < constant.GOBANG_BASE_COIN){
                    return next(null, {code: errcode.BASE_COIN_NOT_ENOUGH});
                }
                if (data > player.coinNum){
                    return next(null, {code: errcode.BASE_COIN_UPPER_BOUND});
                }
                room.startStamp = Date.now();
                room.baseCoin = data;
                room.starterId = userId;
            }else if(type == 2){
                if (!room.baseCoin){
                    return next(null, {code: errcode.NO_SET_BASE_COIN});
                }
                if (player.coinNum < room.baseCoin){
                    return next(null, {code: errcode.COIN_NOT_ENOUGH});
                }
                var len = room.gobangSteps.length;
                if (len > 0){
                    if (data.userId == room.gobangSteps[len-1].userId){
                        return next(null, {code: errcode.HAVE_PALYED_GOBANG});
                    }
                }
                room.gobangSteps.push(data);
            }else{
                if (!room.baseCoin){
                    return next(null, {code: errcode.NO_SET_BASE_COIN});
                }
                if (player.coinNum < room.baseCoin){
                    return next(null, {code: errcode.COIN_NOT_ENOUGH});
                }
                if (!data){
                    return next(null, {code: errcode.NO_GOANG_WINNERID});
                }
                room.winnerId = data;
                var record = room.computeResult();
                saveRoomResult(room, record);
            }
            pusher.pushGobang(room, type, data, next);
        }else{
            next(null, {code: ecode});
        }
    });
}

var saveRoomResult = function(room, param){
    tradingRecord.addRecord(param);
    util.generateUniqueId(8, gobangRedis.isExistViewId, function(viewId){
        var combatData = {
            roomId: room.roomId,
            baseCoin: room.baseCoin,
            starterId: room.starterId,
            startStamp: room.startStamp,
            endStamp: room.endStamp,
            steps: room.gobangSteps,
            viewCodeId: viewId,
            players: room.players,
            tradingCoin: param.tradingCoin,
            winnerId: room.winnerId
        };
        combatRecord.addRecord(combatData, function(record){
            gobangRedis.setViewIdCombatId(viewId, record.id);
            for(var uid in room.players){
                var player = room.players[uid];
                userRecord.updateUserByUserId(uid, {coinNum: player.coinNum});
                saveRedisCombatGain(uid, record);
            }
            room.cleanRoom();
        });
    });
}

var saveRedisCombatGain = function(userId, record){
    var _save = function(){
        gobangRedis.getGobangCombatGain(userId, function(err, gainArr){
            if (err){
                console.log(TAG, "saveCombatGain 保存战绩redis出错, error: ", err);
                return setTimeout(_save, 3000);
            }
            if (!gainArr){
                gainArr = [];
            }
            var players = [];
            var rePlayers = record.get("players");
            var winnerId = record.get("winnerId");
            var tradingCoin = record.get("tradingCoin");
            for (var i in rePlayers){
                var player = rePlayers[i];
                var uid = player.userId;
                var coinIncr = tradingCoin;
                if (uid != winnerId){
                    coinIncr = -coinIncr;
                }
                players.push({userId: uid,
                    userNo: player.userNo, 
                    name: player.nickname,
                    coinIncr: coinIncr
                });
            }
            var data = {
                roomId: record.get("roomId"),
                baseCoin: record.get("baseCoin"),
                storeStamp: record.get("endStamp"),
                viewCodeId: record.get("viewCodeId"),
                combatId: record.id.toString(),
                players: players
            };
            gainArr.unshift(data);
            if (gainArr.length > 10){
                gainArr.pop();
            }
            gobangRedis.setGobangCombatGain(userId, gainArr);
        });
    }
    _save();
}

mgr.exit = function(roomId, userId, serverId, next){
    var self = this;
    this.getRoomById(roomId, function(ecode, room){
        if (ecode == errcode.OK){
            var player = room.getPlayerByUId(userId);
            if (!player){
                return next(null, {code: errcode.NOT_IN_GOBANG_ROOM});
            }
            var coinNum = player.coinNum;
            userRecord.updateUserByUserId(userId, {roomId: "", gamePlay: constant.GAME_PLAY.none}, function(err){
                console.log(TAG, userId, "====handle.exitGobang=== error: ", err);
                if (err){
                    return next(null, {code: errcode.MONGO_DATABASE_ERR});
                }
                room.leaveRoom(userId);
                if (room.getPlayerCount() == 0){
                    redis.delRoomIdToPlay(roomId);
                    delete self.rooms[roomId];
                }
                gamePusher.pushGameCoin(userId, serverId, coinNum, function(){
                    pusher.pushExitGobang(room, userId, serverId, next);
                });
            });
        }else{
            next(null, {code: ecode});
        }
    });
}

mgr.reconnect = function(roomId, userId, serverId, next){
    var self = this;
    this.getRoomById(roomId, function(ecode, room){
        if (ecode == errcode.OK){
            var player = room.getPlayerByUId(userId);
            if (!player){
                return next(null, {code: errcode.NOT_IN_GOBANG_ROOM});
            }
            player.serverId = serverId;
            userRecord.getRecord(userId, function(err, record){
                if (err){
                    return next(null, {code: errcode.MONGO_DATABASE_ERR});
                }
                player.coinNum = record.get("coinNum");
                next(null, {code: errcode.OK, roomData: room});
            });
        }else{
            userRecord.updateUserByUserId(userId, {roomId: "", gamePlay: constant.GAME_PLAY.none}, function(err){
                if (err){
                    return next(null, {code: errcode.MONGO_DATABASE_ERR});
                }
                next(null, {code: ecode});
            });
        }
    });
}

////remote

mgr.createGobangRoom = function(roomId, userId, serverId, next){
    var self = this;
    userRecord.fetchAndUpdateRecordById(userId, {roomId: roomId, gamePlay: constant.GAME_PLAY.gobang}, function(err, record){
        console.log(TAG, userId, "====handle.createGobang=== error: ", err);
        if (err){
            return next(null, {code: errcode.MONGO_DATABASE_ERR});
        }
        var room = new gobangRoom();
        room.init(roomId, userId);
        var playerData = {
            userId: record.id.toString(),
            userNo: record.get("userNo"),
            seatIdx: 1,
            nickname: record.get("nickname"),
            userIcon: record.get("userIconUrl"),
            coinNum: record.get("coinNum"),
            serverId: serverId
        };
        room.players[userId]= playerData;
        redis.setRoomIdToPlay(roomId, constant.GAME_PLAY.gobang);
        self.rooms[roomId] = room;
        next(null, {code: errcode.OK, roomData: room});
    });
}

mgr.joinGobangRoom = function(roomId, userId, serverId, next){
    var self = this;
    self.getRoomById(roomId, function(ecode, room){
        if (ecode == errcode.OK){
            var player = room.getPlayerByUId(userId);
            if (player){
                return next(null, {code: errcode.HAVE_IN_GOBANG_ROOM});
            }
            if (room.getPlayerCount() > 1){
                return next(null, {code: errcode.GOBANG_ROOM_PERSONS_LIMIT});
            }
            userRecord.fetchAndUpdateRecordById(userId, {roomId: roomId, gamePlay: constant.GAME_PLAY.gobang}, function(err, record){
                console.log(TAG, userId, "====handle.joinRoom=== error: ", err);
                if (err){
                    return next(null, {code: errcode.MONGO_DATABASE_ERR});
                }
                var playerData = {
                    userId: record.id.toString(),
                    userNo: record.get("userNo"),
                    seatIdx: room.getSeatIdx(),
                    nickname: record.get("nickname"),
                    userIcon: record.get("userIconUrl"),
                    coinNum: record.get("coinNum"),
                    serverId: serverId
                };
                room.players[userId] = playerData;
                pusher.pushJoinGobang(room, userId, next);
            });
        }else{
            next(null, {code: ecode});
        }
    });
}

mgr.playerOnline = function(roomId, userId, serverId, next){
    var self = this;
    self.getRoomById(roomId, function(ecode, room){
        if (ecode == errcode.OK){
            var player = room.getPlayerByUId(userId);
            console.log(TAG, "playerOnline  online ", player, roomId, userId);
            if (player){
                player.serverId = serverId;
                pusher.pushGobangLineStat(room, userId, 1, next);
            }else{
                next(null, {code: ecode});
            }
        }else{
            next(null, {code: ecode});
        }
    });
}

mgr.playerOffline = function(roomId, userId, next){
    var self = this;
    self.getRoomById(roomId, function(ecode, room){
        if (ecode == errcode.OK){
            var player = room.getPlayerByUId(userId);            
            console.log(TAG, "playerOffline  offline ", player, roomId, userId);
            if (player){
                player.serverId = "";
                pusher.pushGobangLineStat(room, userId, 0, next);
            }else{
                next(null, {code: ecode});
            }
        }else{
            next(null, {code: ecode});
        }
    });
}