module.exports = {
	OK: 0,							//成功
	FAIL: 1,        				//服务器错误
	TIMEOUT: 2,				    	//超时
	HAVE_FROZEN: 3,					//帐号已被冻结
	BIND_UID_FAIL: 8,				//绑定用户id失败
	REGISTER_FAIL: 9,				//注册失败
	WXOPNEID_NULL:10,				//微信openid为空
	LOGIN_ERR: 11,   				//登录失败
	LOGINED: 12,     				//你的账号已登录！
	LOGINED_INVALID: 13,			//登录信息失效
	LOGIN_USERID_NULL: 14,			//登录用户Id为空

	REDIS_DATABASE_ERR: 15,			//redis数据库错误
	MONGO_DATABASE_ERR: 16,			//mongo数据库错误
	PROMOTER_CENTER_ERR: 17,		//推广中心错误
	NO_PROMOTER_ACCOUNT: 18,		//没有推广员帐号
	PUSH_MESSAGE_ERR: 20,			//推送消息错误

	COIN_NOT_ENOUGH: 50,       		//金币不足
	CAN_NOT_FIND_ROOM_TYPE: 51,		//没有找到房间类型
	INVALID_GAMEPALY: 52,			//无效的玩法类型
	ROOM_COIN_UPLIMIT: 53,			//房间金币上限
	PALYER_MATCHING: 54,			//正在匹配中
	CAN_NOT_FIND_PLAYER: 55,		//不能找到玩家

	COMBAT_NOT_EXIST: 60,			//战绩不存在
	ROOM_NOT_EXIST: 61,				//房间不存在
	HAVE_IN_ROOM: 62,				//已经在房间里
	NOT_IN_ROOM_WITNESS: 63,		//不在观战中
	NOT_IN_ROOM_SEAT: 64,	 		//不在座位上
	NOT_IN_ROOM: 65,				//不在房间中
	ROOM_HAVE_DEALED: 66,			//房间已经发过牌
	PLAYER_HAVE_READYED: 67,		//已经准备过了
	GPS_CLOSED: 68,					//GPS关闭中
	ROOM_NOT_MID_JOIN: 69,			//房间不可中途加入
	NOT_YOUR_OPERATION: 70,			//不是你的操作

////////////////////////niuniu////////////////////////
	NOT_IN_NIU_ROOM_WITNESS: 100,	//不在观战中
	NOT_IN_NIU_ROOM_SEAT: 101,	 	//不在座位上

	NIU_ROOM_NOT_EXIST: 110,		//牛牛房间不存在
	NIU_ROOMID_ERR: 111,			//牛牛房间Id错误
	NOT_IN_NIU_ROOM: 112,			//不在牛牛房间里
	NIU_ROOM_HAVE_READYED: 113,		//已经准备了
	HAVE_IN_NIU_ROOM: 114,			//已经在牛牛房间里了
	PLAYER_HAVE_IN_SEAT: 115, 		//座位上已经有玩家了
	NIU_ROOM_NOT_HAVE_BANKER:119,	//房间没有庄家
	NIU_ROOM_HAVE_ROBED: 120,		//已经抢过庄家了
	NIU_ROOM_HAVE_CALL_MULTI: 121,	//已经叫过分了
	NIU_ROOM_HAVE_FLOPED: 122,		//已经亮过牌了
	NIU_ROOM_HAVE_DEALED: 123,		//房间已经发牌
	NIU_ROOM_HAVE_BANKER: 124,		//庄家已经产生
	PLALYER_NOT_HAVE_CARD: 125,		//玩家没有手牌

    //////////////.........ZJH........///////////////
    NOT_IN_ZJH_ROOM_SEAT: 1000,	 	//不在扎金花座位上
    ZJH_ROOM_HAVE_READYED: 1001,  	//已经准备了
    ZJH_ROOM_HAVE_DEALED: 1002,		//房间已经发牌
    NOT_IN_ZJH_ROOM: 1003,			//不在房间中
    ZJH_GAME_IS_OVER: 1004,			//此局已结束
    PLAYER_IS_LOOKED: 1005,			// 当前玩家已经看过牌了
    ZJH_PLAYER_NOT_HAVE_CARD: 1007,	//玩家没有手牌
    ZJH_ROOM_HAVE_DISCARDED: 1008,	//已经弃过牌了
    ZJH_ROOM_HAVE_BETED: 1009,		//已经跟过注了
    ZJH_FLLOW_SAME_WITH_BET: 1011,	//跟注只能和下注一样
    ZJH_BET_COIN_ERROR :1013,		//当前跟注参数不合法
    NOT_COMPARE_MYSELF: 1014,		//不能和自己比牌
    HAVE_IN_ZJH_ROOM: 1018,			//已经在房间里了
    ZJH_PLAYER_HAVE_IN_SEAT: 1019, 	//座位上已经有玩家了
    ZJH_ROOM_NOT_EXIST: 1020,		//房间不存在
	
/////////////////////////gobang///////////////////////////
	HAVE_IN_GOBANG_ROOM: 150,		//已经在五子棋房间里了
	NOT_IN_GOBANG_ROOM: 151,		//不在五子棋房间里
	GOBANG_ROOM_NOT_EXIST: 152,		//五子棋房间不存在
	GOBANG_ROOM_PERSONS_LIMIT: 153,	//五子棋房间人数上限
	NO_GOANG_WINNERID: 154,			//没有五子棋赢家
	NO_SET_BASE_COIN: 155,			//没有设置底注
	HAVE_PALYED_GOBANG: 156,		//已经下过棋了
	BASE_COIN_NOT_ENOUGH: 157,		//五子棋学费设置不足
	BASE_COIN_UPPER_BOUND: 158,		//学费设置超过上限（已有的数量）

/////////////////////////keng/////////////////////////////
	KENG_ROOM_NOT_EXIST: 180,		//大坑房间不存在
	KENG_ROOMID_ERR: 181,			//大坑房间Id错误
	NOT_IN_KENG_ROOM: 182,			//不在大坑房间里
	NOT_IN_KENG_ROOM_WITNESS: 183,	//不在大坑观战中
	NOT_IN_KENG_ROOM_SEAT: 184,	 	//不在大坑座位上
	KENG_ROOM_HAVE_READYED: 185,  	//已经准备了
	HAVE_IN_KENG_ROOM: 186,			//已经在大坑房间里了
	KENG_HAVE_IN_SEAT: 187, 		//座位上已经有玩家了
	KENG_NOT_HAVE_FIRST: 188,		//房间没有发牌人
	KENG_ROOM_HAVE_DISCARDED: 189,	//已经弃过牌了
	KENG_ROOM_HAVE_BETED: 190,		//已经跟过注了
	KENG_ROOM_HAVE_APPENDED: 191,	//已经加过注了
	KENG_ROOM_HAVE_DEALED: 192,		//房间已经发牌
	PLAYER_BET_COIN_UPLIMIT: 193,	//玩家下注超过上限
	KENG_PLAYER_NOT_HAVE_CARD: 194,	//玩家没有手牌
	FLLOW_SAME_WITH_BET: 195,		//跟注只能和下注一样
	ZHUA_A_BI_PAO: 196,				//抓A必炮

//////////////////////////douzizhu//////////////////////////
	DDZ_ROOM_NOT_EXIST: 200,		//斗地主房间不存在
	DDZ_ROOMID_ERR: 201,			//斗地主房间Id错误
	NOT_IN_DDZ_ROOM: 202,			//不在斗地主房间里
	HAVE_IN_DDZ_ROOM: 203,			//已经在斗地主房间里了
	NOT_IN_DDZ_ROOM_WITNESS: 204,	//不在斗地主观战中
	NOT_IN_DDZ_ROOM_SEAT: 205,	 	//不在斗地主座位上
	DDZ_PLAYER_NOT_HAVE_CARD: 206,	//斗地主玩家没有手牌
	PLAYER_NOT_IN_TRUSTEE: 207,		//玩家不在托管中
	PLAYER_HAVE_IN_TRUSTEE: 208,	//玩家已经在托管中
	ROOM_FLOW_RUN: 209,				//房间流局
	PLAYER_HAVE_OPERATED: 210,		//玩家已经操作过了
	DEALER_HAVE_APPEARED: 211,		//地主已经产生
	PLAYER_CAN_NOT_PASS: 212,		//玩家不能过牌
	PLAYER_REDED_CURRENT_SCORE: 213, //玩家加过当前分数了
	PLAYER_NOT_CALL_LANDLORD: 214,	//玩家还没有叫地主

	PLAY_CARD_ERR: 215,				//打牌错误
	CARD_TYPE_ERR: 216,         	//牌型错误
	PRESS_CARD_ERR: 217, 			//压牌错误

//////////////////////////paodekuai/////////////////////////
	PAO_ROOM_NOT_EXIST: 230,		//跑得快房间不存在
	PAO_ROOMID_ERR: 231,			//跑得快房间Id错误
	NOT_IN_PAO_ROOM: 232,			//不在跑得快房间里
	HAVE_IN_PAO_ROOM: 233,			//已经在跑得快房间里了
	NOT_IN_PAO_ROOM_WITNESS: 234,	//不在跑得快观战中
	NOT_IN_PAO_ROOM_SEAT: 235,	 	//不在跑得快座位上
	PAO_PLAYER_NOT_HAVE_CARD: 236,	//跑得快玩家没有手牌
};