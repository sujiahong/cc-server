"use strict";
const pomelo = require("pomelo");
const rpc = pomelo.app.rpc;
const rpcJin = rpc.game_jin.jinRemote;
const rpcKeng = rpc.game_keng.kengRemote;
const rpcDDZ = rpc.game_ddz.ddzRemote;
const rpcNiu = rpc.game_niu.niuRemote;
const rpcGobang = rpc.game_gobang.gobangRemote;
//const rpcPao = rpc.game_pao.paoRemote;

exports.gamePlayToRPCGame = {
    [1]: rpcNiu,
    [2]: rpcDDZ,
    [3]: rpcJin,
    [4]: rpcKeng,
    //[5]: rpcPao,
    [50]: rpcGobang
};