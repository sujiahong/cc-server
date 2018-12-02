////////////////////////////////////////
////////////////登陆/////////////////
////////////////////////////////////////
路由请求 : connector.connectHandler.login   

参数 : {
    userId: openId,
    nickName: "",
    sex: 0/1,
    gameType: 1/2,   
    iconUrl: "",
    signStr: "platformToken",
    location: "json串",
    aid: "",  //主播Id
    lid: "",  //主播房间Id
}
回调函数里通知创建房间成功还是失败
返回参数:
{
    code: 0,            //0 成功  500 错误  暂定
    message: "成功",      //提示信息
    userId: "",
    nickName: "",
    roomCard: 334,
    roomId: "394345"   //有房间Id说明玩家在房间里， 空代表不在房间
    loginIp : "",
    serverId : "",
}

////////////////////////////////////////
////////////////用户金币/////////////////
////////////////////////////////////////
路由请求 : connector.matchHandler.refreshUserCoin   

参数 : {
}
回调函数里通知创建房间成功还是失败
返回参数:
{
    code: 0,            //0 成功  500 错误  暂定
    message: "",
    roomCard: 00000,           //剩余房卡数量
}

////////////////////////////////////////
////////////////场次数据//////////////////
///////////////////////////////////////

路由请求：connector.matchHandler.coinArea
参数：{

}
回调函数
返回参数：
{
    code: 0
    coinArea: {
        1: {
            baseScore: 10,
            roomFee: 20,
            downLimit: 100,
            upLimit: 2000,
            highestCoin: 1000
        },
        2: {
            baseScore: 100,
            roomFee: 200,
            downLimit: 2000,
            upLimit: 20000,
            highestCoin: 10000
        },
        3: {
            baseScore: 1000,
            roomFee: 2000,
            downLimit: 20000,
            upLimit: 200000,
            highestCoin: 100000
        },
        4: {
            baseScore: 10000,
            roomFee: 20000,
            downLimit: 200000,
            upLimit: 99999999999999,
            highestCoin: 1000000
        }
    }
}

////////////////////////////////////////
////////////////场次选择/////////////////
////////////////////////////////////////

路由请求：connector.matchHandler.match
参数：{
    index: "1/2/3/4",         //代表4个场次

}
回调函数里通知创建房间成功还是失败
返回参数:
{
    code: 0,
}

////////////////////////////////////////////
///////////////匹配成功后通知别人加入金币场房间
////////////////////////////////////////////
路由监听 : onEnterCoinRoom //
参数 : {
    playerList: [    
    {
        userId       : "",
        nickName     : "",
        sex          : 3,
        userIconUrl  : "",
        isReady      : 0,
        roomScore    : 0,
        inIndex      : 0,
        loginIp      : "",
        location     : "",
    }, {}, {}];                     // 玩家列表
}


//////////////////////////////////////////////
/////////////////通知场次里正在等待和游戏的人数
//////////////////////////////////////////////
路由监听： onWaitingAndGaming
参数：{
    type: 1/2/3,    //1是主界面，2是匹配界面，3是匹配等待界面
    coinDataArr: [{ 
        index: 1/2/3/4, //场次编号 
        curWaitingNum: 0,  //当前正在等待的人数
        curGamingNum: 0,  //当前正在游戏的人数
    }, {}, {}, {}]
}//////有可能发一个或四个，发一个代表刷新特定的金币场次等待人数和游戏人数
/////////发四个就表示刷新所有的金币场次的等待人数和游戏人数




////////////////////////////////////////
//////////////////托管//////////////////
////////////////////////////////////////

路由请求：room.roomHandler.abrogateTrusteeship   //取消托管请求
参数：
{

}
返回参数:
{
    code: 0,
}

路由监听 : onTrusteeship //通知托管

参数 : {
    userId : "",
    trustee: 0/1;   //0代表不托管，，1代表托管
}


////////////////////////////////////////
//////////////////换桌//////////////////
////////////////////////////////////////

路由请求： connector.matchHandler.changeCoinRoom
参数：
{
} 

返回参数：
{
    code: 0,
    message: "",
}

////////////////////////////////////////
//////////////////继续/准备//////////////////
////////////////////////////////////////

路由请求：connector.matchHandler.readyCoinRoom
参数：
{
    ready: 1, // 1 准备 0 不准备
} 

返回参数：
{
    code: 0,
    message: "",
}

////////////////////////////////////////
//////////////////观战//////////////////
////////////////////////////////////////

路由请求： connector.matchHandler.witnessCoinRoom
参数：
{
    type : 1/2,     //1代表加入观战，，2代表退出观战
    witnessId: "",  //被观战的人id
} 

返回参数：
{
    code: 0,   //里面的数据和断线重连返回的一样
    state: 1/2/3,   //1代表没有匹配，没有打牌，2代表匹配中，3代表打牌中
}

////////////////////////////////////////
//////////////////补满//////////////////
////////////////////////////////////////

路由请求： connector.matchHandler.supplementCoin
参数：
{

}

返回参数：
{
    code: 0,
    message: "",
}

////////////////////////////////////////
//////////////////退出//////////////////
////////////////////////////////////////

路由请求： connector.matchHandler.exitCoinArea
参数：
{
    type: 1/2,  // 1是从匹配界面退出，2是从结算界面退出
} 

返回参数：
{
    code: 0,
}

////////////////////////////////////////
//////////////金币场断线重连/////////////
////////////////////////////////////////
路由请求 : room.roomHandler.reconnectCoin   

参数 : {
}

返回参数 : {
    code: 0/500,
    roomId: 393998, //房间Id
    areaIdx: 0,     //场次index
    roomRule: {},   //房间规则
    handCards: [],   //手牌
    dealerId: "",    //地主Id
    winnerId: "",
    playersMap: {    //手上剩余的牌数， 打出去的牌
        "userId1": {userId:"", nickName:"", sex: 0, userIconUrl:"", isReady: "", inIndex: 0, loginIp: "", location: "",
                    roomScore:1, robScore:-1, bombNum: 0, restNum: 0, deskCard: [], trustee: 0/1},
        "userId2": {userId:"", nickName:"", sex: 0, userIconUrl:"", isReady: "", inIndex: 0, loginIp: "", location: "",
                    roomScore:1, robScore:-1, bombNum: 0, restNum: 0, deskCard: [], trustee: 0/1},
        "userId3": {userId:"", nickName:"", sex: 0, userIconUrl:"", isReady: "", inIndex: 0, loginIp: "", location: "",
                    roomScore:1, robScore:-1, bombNum: 0, restNum: 0, deskCard: [], trustee: 0/1},
    },
    nextIndex: 0/1/2,
    isPass: true/false,//是否能过牌  只在打牌有此字段
    landlordCards: [], //地主牌
    curRunNum: 0,  //当前局数
    multiple: 0,   //倍数/分数
    bombNum: 0,    //出的炸弹个数
    runScore: ,    //单局结算分  只有断线重连人的
}

////////////////////////////////////////
/////////////////金币结算/////////////////
///////////////////////////////////////

路由监听： onCoinResult
参数：
{
    winnerId: "", //赢得人Id
    roomEnd: 0/1/2/4, //0代表房间没结束，1代表玩家退出房间结束了，2代表玩家换桌房间结束了, 4代表房间结束回到主界面
    runScore: []  //每个玩家的得分数
}