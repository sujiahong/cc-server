"use_strict";
const TAG = "logout.js";
const errcode = require('../shared/errcode');
const constant = require("../shared/constant");
const connectorRPC = require("../rpc/connectorRPC");

var exp = module.exports;

exp.logout = function(app, session, next){ 
	var userId = session.uid;
	var roomId = session.get("roomId");
	var gamePlay = session.get("gamePlay");
	console.log(TAG, " Logout+++++++userId:", userId, "roomId:", roomId, "gamePlay: ", gamePlay);
	if (roomId){
		connectorRPC.rpcGameOffline(gamePlay, roomId, userId, next);
	}else{
		next();
	}
}