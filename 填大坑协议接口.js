////////////////////////////////////////
////////////////申请房间列表/////////////////
////////////////////////////////////////
路由请求 : home.kengHandler.applyRoomList   

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
路由请求 : home.kengHandler.match   

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
路由请求 : home.kengHandler.createRoom   

参数 : {
    rule: {
        roomLaw: 1/2/3,//// 1  半坑9， 2 半坑10， 3 全坑 
        maxPersons: 5,
        GPSActive: 0,
        midJoinStat: 1,
        baseCoin: 0,
        roomType: 1/2/3,    ///1 匹配房， 2 大厅房， 3 私密房
        rulePlay: {
            betPlay: 1,     //1 不可减少， 2 随意下注
            gongzhang: 2,   //1 公张随豹， 2 公张随点
            daiwang: 1,     //0 不带王， 1 带王14，  2 带王16
            zhuaApao: 1,    //抓A必炮，0 不炮
            daiti: 1,       //1 带踢， 0 不带踢
            languobei: 1,   //烂锅翻倍，0 不翻倍
            sitiao60: 0,    //四条100分， 1  四条60分
            bipai: 1,       //1 比点， 2 比豹
        }
    };
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
路由请求 : home.kengHandler.joinKengRoom   

参数 : {
    roomId: "",

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
////////////////准备/////////////////
////////////////////////////////////////
路由请求 : game_keng.kengHandler.ready   

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
    firstId: "",
    startId: "",
}

////////////////推送一张牌////////////////
消息监听:  onOneCard
参数: {
    playerHandData: {
        userId: 404,   ////userId ===> cardId
    },
    firstId: "",
    startId: "",
}

////////////////////////////////////////
////////////////跟注/////////////////
////////////////////////////////////////
路由请求 : game_keng.kengHandler.betCoin   

参数 : {
    coin: 0
}

返回参数:
{
    code: 0,
}

//////////////////推送跟注////////////////////

消息监听:  onBetCoin
参数: {
    userId: "",
    betCoin: 0,
    operateId: "",
    stakeId: "",
}

////////////////////////////////////////
////////////////弃牌/////////////////
////////////////////////////////////////
路由请求 : game_keng.kengHandler.discard   

参数 : {
}

返回参数:
{
    code: 0,
}

//////////////////推送弃牌////////////////////

消息监听:  onDiscard
参数: {
    userId: "",
    operateId: "",
    stakeId: "",
}

////////////////////////////////////////
////////////////亮牌/////////////////
////////////////////////////////////////
路由请求 : game_keng.kengHandler.flop   

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
}

//////////////////推送结算//////////////////

消息监听:  onResult
参数: {
    result: {

    }
}

////////////////////////////////////////
////////////////坐下/////////////////
////////////////////////////////////////
路由请求 : game_keng.kengHandler.seatdown   

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
路由请求 : game_keng.kengHandler.transpose   

参数 : {
}

返回参数:
{
    code: 0,
    roomData: {

    }
}

/////////////////推送换桌//////////////////
消息监听: onTranspose
参数: {
    exitRoomId: "",
    joinRoomId: "",
    userId: "",
    nickname: "",
    iconurl: "",
    userNo: ""
}

////////////////////////////////////////
////////////////离开房间/////////////////
////////////////////////////////////////
路由请求 : game_keng.kengHandler.exitRoom   

参数 : {
}

返回参数:
{
    code: 0,
}

/////////////////推送退出//////////////////
消息监听: onExit
参数: {
    userId: "",
}

////////////////////////////////////////
////////////////重连/////////////////
////////////////////////////////////////
路由请求 : game_keng.kengHandler.reconnect   

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

路由请求 : game_keng.kengHandler.chat
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