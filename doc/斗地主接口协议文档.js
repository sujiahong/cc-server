
////////////////////////////////////////
/////////////////抢地主/////////////////
////////////////////////////////////////
路由请求 : game_ddz.ddzHandler.robLandlord   

参数 : {
   robScore: -2/-1/0/1/2/3, //-2代表抢地主 -1代表叫地主 0代表不叫  1，2，3代表 1分 2分 3分
}

路由监听 : onRob   

参数 : {
   userId : "",
   robScore: -2/-1/0/1/2/3,
   operateId: "",
   dealerId: "", // 地主Id
}

////////////////////////////////////////
/////////////////打牌///////////////////
////////////////////////////////////////
路由请求 : game_ddz.ddzHandler.playCard   

参数 : {
   cards: []   //过牌  发[]
}

路由监听 : onPlayCard   

参数 : {
    userId: "", //出牌人的id
    cards: [], // 打的牌  如果是空的代表过牌
    operateId: "",
}

////////////////////////////////////////
/////////////////取消托管///////////////////
////////////////////////////////////////
路由请求 : game_ddz.ddzHandler.abrogateTrustee   

参数 : {
}

路由监听 : onTrusteeship   

参数 : {
    userId: "", //出牌人的id
    trusteeStat: 0/1,  //  0 不托管 1 托管
}