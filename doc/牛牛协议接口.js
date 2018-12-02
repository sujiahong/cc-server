////////////////////////////////////////
////////////////申请房间列表/////////////////
////////////////////////////////////////
路由请求 : home.niuHandler.applyRoomList   

参数 : {
}

返回参数:
{
    code: 0,            //0 成功 
    roomList: [{roomId: "",
                baseScore: 0,
                roomType: 0,    //无花  明牌
                curPlayerNum: 0,
                roomPlayerNum: 0,
                isGPSActive: false,
                }, {}, {}]
}

////////////////////////////////////////
////////////////匹配/////////////////
////////////////////////////////////////
路由请求 : home.niuHandler.match   

参数 : {
    baseCoin: 0,
    roomLaw: 1/2  //规则 
}

返回参数:
{
    code: 0,            //0 成功 
    roomData: {
        roomId: "",
        rule: {
            maxPersons: 0,
            GPSActive: 0,
            autoFlopStat: 0,
            midJoinStat: 0,
            roomLaw: 0
        },
        players:{
            "userId": {
                userId: "",
                seatIdx: 0,
                sex: 1,
                location = "",
                userNo = "",
                nickname = "",
                loginIp = "",
                userIcon = "",
                coinNum = 0,
                readyStat = 0
            },
        },
        witnessPlayers: {
            "userId": {
                userId: "",
                nickname = "",
                userIcon = "",
                userNo = ""
            }
        }
    }
}

////////////////////////////////////////
////////////////创建房间/////////////////
////////////////////////////////////////
路由请求 : home.niuHandler.createRoom   

参数 : {
    rule: {
        roomLaw: 1/2,
        maxPersons: 6/8,        
        GPSActive: 1/0,
        autoFlopStat: 1/0,
        midJoinStat: 1/0, 
    }
}

返回参数:
{
    code: 0,
    roomData: {
        roomId: "",
        rule: {
            maxPersons: 0,
            GPSActive: 0,
            autoFlopStat: 0,
            midJoinStat: 0,
            roomLaw: 0
        },
        players:{
            "userId": {
                userId: "",
                seatIdx: 0,
                sex: 1,
                location = "",
                userNo = "",
                nickname = "",
                loginIp = "",
                userIcon = "",
                coinNum = 0,
                readyStat = 0
            },
        },
        witnessPlayers: {
            "userId": {
                userId: "",
                nickname = "",
                userIcon = "",
                userNo = ""
            }
        }
    }
}

////////////////////////////////////////
////////////////加入房间/////////////////
////////////////////////////////////////
路由请求 : home.niuHandler.joinRoom   

参数 : {
    roomId: ""
}

返回参数:
{
    code: 0,
    roomData: {
        roomId: "",
        rule: {
            maxPersons: 0,
            GPSActive: 0,
            autoFlopStat: 0,
            midJoinStat: 0,
            roomLaw: 0
        },
        players:{
            "userId": {
                userId: "",
                seatIdx: 0,
                sex: 1,
                location = "",
                userNo = "",
                nickname = "",
                loginIp = "",
                userIcon = "",
                coinNum = 0,
                readyStat = 0
            },
        },
        witnessPlayers: {
            "userId": {
                userId: "",
                nickname = "",
                userIcon = "",
                userNo = ""
            }
        }
    }
}

//////////////////推送加入/////////////////
消息监听:  onJoinRoom
参数: {
    userId: "",
    nickname: "",
    iconurl: "",
    userNo: ""
}

////////////////////////////////////////
////////////////抢庄/////////////////
////////////////////////////////////////
路由请求 : game_niu.niuHandler.robBanker   

参数 : {
    multi: 0
}

返回参数:
{
    code: 0,
}

////////////////////////////////////////
////////////////叫分/////////////////
////////////////////////////////////////
路由请求 : game_niu.niuHandler.robMultiple   

参数 : {
    multi: 0
}

返回参数:
{
    code: 0,
}

//////////////////推送叫分////////////////////

消息监听:  onMultiple
参数: {
    userId: "",
    multiType: 1/2,   ///1 抢庄  2 叫分
    multi: 0,
    bankerId: ""     //庄家id
}

////////////////////////////////////////
////////////////准备/////////////////
////////////////////////////////////////
路由请求 : game_niu.niuHandler.ready   

参数 : {
}

返回参数:
{
    code: 0,
}

//////////////////推送准备//////////////////

消息监听:  onReady
参数: {
    userId: "",
}

//////////////////推送手牌//////////////////

消息监听:  onHandCard
参数: {
    playerHandData: {
        userId: [],   ////userId ===> handcards
    },
}

////////////////推送一张牌////////////////
消息监听:  onOneCard
参数: {
    playerHandData: {
        userId: 404,   ////userId ===> cardId
    }
}

////////////////////////////////////////
////////////////亮牌/////////////////
////////////////////////////////////////
路由请求 : game_niu.niuHandler.flop   

参数 : {
}

返回参数:
{
    code: 0,
    cardId: 402
}

//////////////////推送亮牌///////////////////
消息监听:  onFlop
参数: {
    playerHandData: {
        userId: [],   ////userId ===> handcards
    },
    niuData{
        type: 0,   ///牛的牌型
        niu: [],
        aux: []
    }
}

//////////////////推送结算//////////////////

消息监听:  onResult
参数: {
    result: {
        userId: {
            type: "",//////算分的牌型
            coinIncr: 839/-398, ///// >0 地主赢
        },
    }
}

////////////////////////////////////////
////////////////坐下/////////////////
////////////////////////////////////////
路由请求 : game_niu.niuHandler.seatdown   

参数 : {
    seatIdx: 0,
}

返回参数:
{
    code: 0,
    playerData: {}
}

//////////////////推送座位改变//////////////////

消息监听:  onSeat
参数: {
    playerData: {}
}

////////////////////////////////////////
////////////////换桌/////////////////
////////////////////////////////////////
路由请求 : game_niu.niuHandler.transpose   

参数 : {
}

返回参数:
{
    code: 0,
    roomData: {

    }
}

/////////////////推送退出//////////////////
消息监听: onExit
参数: {
    userId: "",
}

////////////////////////////////////////
////////////////离开房间/////////////////
////////////////////////////////////////
路由请求 : game_niu.niuHandler.exitRoom   

参数 : {
}

返回参数:
{
    code: 0,
}


////////////////////////////////////////
////////////////重连/////////////////
////////////////////////////////////////
路由请求 : game_niu.niuHandler.reconnect   

参数 : {
}

返回参数:
{
    code: 0,
    roomData: {

    }
}

////////////////////上线/下线///////////////////
消息监听: onLineStat
参数: {
    userId: "",
    lineStat: 0/1    //0下线或者1上线
}

///////////////////////////////////////////
////////////////////聊天////////////////
///////////////////////////////////////////

路由请求 : game_niu.niuHandler.chat
参数 : {
    target: "",
    type: 0,
    message1: "",
    message2: ""
}

返回参数:
{
    code: 0,
}

消息监听: onChat
参数: {
    userId: "",
    target: "",
    type: 0,
    message1: "",
    message2: ""
}

////////////////////////////////////////
////////////////查看战绩列表/////////////////
////////////////////////////////////////
路由请求 : home.homeHandler.lookCombatList   

参数 : {
    gamePlay: 1,
}

返回参数:
{
    code: 0,
    combatList: []
}

////////////////////////////////////////
////////////////查看战绩详情/////////////////
////////////////////////////////////////

路由请求 : home.homeHandler.lookCombatDetail   

参数 : {
    gamePlay: 1,
    viewId: "7489498",
}

返回参数:
{
    code: 0,
    combatData: {

    }
}

////////////////////////////////////////
////////////////查看排行榜列表/////////////////
////////////////////////////////////////

路由请求 : home.homeHandler.lookRankingList   

参数 : {

}

返回参数:
{
    code: 0,
    rankingList: [//////////////////发给客户端时是一个字符串
        {
            userId: "",
            nickname: "",
            userNo: "",
            userIcon: "",
            coinNum: 0
        },
    ]
}

////////////////////////////////////////
/////////////////五子棋创建/////////////////
////////////////////////////////////////

路由请求 : home.gobangHandler.createGobang   

参数: {
}

返回参数:
{
    code: 0,
    roomData: {
        roomId: "",
        baseCoin: "",
        players: [{
            userId: "",
            userNo: "",
            nickname: "",
            userIcon: "",
            coinNum: 0,
        }],
        gobangSteps: [],
        winnerId: ""
    }
}

////////////////////////////////////////
/////////////////五子棋加入/////////////////
////////////////////////////////////////

路由请求 : home.homeHandler.joinRoom   

参数 : {
    roomId: "",
}

返回参数:
{
    code: 0,
    roomData: {
        roomId: "",
        baseCoin: "",
        players: [{
            userId: "",
            userNo: "",
            nickname: "",
            userIcon: "",
            coinNum: 0,
        }],
        gobangSteps: [],
        winnerId: ""
    }
}

//////////////消息监听///////////////
消息监听: onJoinGobang
参数: {
    playerData:{
        userId: "",
        userNo: "",
        nickname: "",
        userIcon: "",
        coinNum: 0,
    }
}

////////////////////////////////////////
/////////////////五子棋游戏/////////////////
////////////////////////////////////////
路由请求 : game_gobang.gobangHandler.playGobang   

参数 : {
    type: 1/2/3, ///////类型 1 开始  2  走棋  3 结束
    data: 38484/{"userId": "", "x": 1, "y": 1}/""///////////底注   走棋数据  赢者ID
}

返回参数:
{
    code: 0
}

////////////////消息监听//////////////////
消息监听: onGobang
参数: {
    type: 1/2/3,
    data: "同上"
}

////////////////////////////////////////
/////////////////退出五子棋/////////////////
////////////////////////////////////////
路由请求 : game_gobang.gobangHandler.exitGobang   

参数 : {

}

返回参数:
{
    code: 0
}

////////////////消息监听//////////////////
消息监听: onExitGobang
参数: {
    userId: ""
}

////////////////////////////////////////
////////////////重连五子棋/////////////////
////////////////////////////////////////
路由请求 : game_gobang.gobangHandler.reconnectGobang   

参数 : {
}

返回参数:
{
    code: 0,
    roomData: {

    }
}

////////////////////五子棋上线/下线///////////////////
消息监听: onGobangLineStat
参数: {
    userId: "",
    lineStat: 0/1    //0下线或者1上线
}

///////////////////////////////////////////
////////////////////游戏公告////////////////
///////////////////////////////////////////

路由请求 : home.homeHandler.editNoticeBoard   

参数 : {
    notice: ""
}

返回参数:
{
    code: 0,
}

消息监听: onGameNotice
参数: {
    notice: ""
}

路由请求 : home.homeHandler.gainNoticeBoard   

参数 : {
}

返回参数:
{
    code: 0,
    notice: ""
}

///////////////////////////////////////////
////////////////////绑定代理////////////////
///////////////////////////////////////////

路由请求 : home.homeHandler.bindPromoter
参数 : {
    bindUserNo: ""
}

返回参数:
{
    code: 0,
}

///////////////////////////////////////////
////////////////////刷新定位////////////////
///////////////////////////////////////////

路由请求 : home.homeHandler.refreshLocation
参数 : {
    location: "" ///////// "" 代表定位打开没有获取到   "closed" 代表定位关闭    "8dj983jdk" 有定位信息
}

返回参数:
{
    code: 0,
}

///////////////////////////////////////////
////////////////////奖励每日首次分享////////////////
///////////////////////////////////////////

路由请求 : home.homeHandler.rewardDayFirstShare
参数 : {
    
}

返回参数:
{
    code: 0,
    rewardCoin: 0,
    totalCoin: 0
}

路由请求 : home.homeHandler.checkFirstShare
参数 : {
    
}

返回参数:
{
    code: 0,
    canShared: 0/1
}


////////////////////金币数量/////////////////////
消息监听: onGameCoin
参数: {
    coinNum: 0, ///剩余的金币
}


////////////////////////////////////////////////
////////////////////商店数据/////////////////////
////////////////////////////////////////////////
路由请求 : home.homeHandler.gainShopData
参数 : {
}

返回参数:
{
    code: 0,
    shopData: {}
}

路由请求 : home.homeHandler.buyCoin
参数 : {
    cash: 0,
    num: 0
}

返回参数:
{
    code: 0,
    orderId: "",
    orderTime: 383939
}

////////////////////监听充值////////////////////
消息监听: onGameRecharge
参数: {
    res: 0/1, ///0,,失败  1,, 成功
}
