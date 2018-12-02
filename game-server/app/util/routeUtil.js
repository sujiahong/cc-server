"use strict";
const TAG = "routeUtil.js";
var exp = module.exports;

exp.homeRoute = function (session, msg, app, cb) {
	var homeServers = app.getServersByType("home");
	if (!homeServers || homeServers.length === 0) {
		return cb(new Error('can not find room Servers.'));
	}
	var index = parseInt(homeServers.length * Math.random());
	var res = homeServers[index];
	cb(null, res.id);
};

exp.gameRoute = function(session, msg, app, cb){
	var gameServers = app.getServersByType(msg.serverType);
	if (!gameServers || gameServers.length === 0) {
		return cb(new Error('can not find room Servers, bind userId: ' + session.uid));
	}
	var roomId = session['roomId'] || session.get('roomId');
	if (!roomId) {
		var args = msg.args;
		console.log(TAG, "gameRoute msg: ", msg.args);
		if (args && args.length > 0 && args[0].body && args[0].body.roomId){
			roomId = args[0].body.roomId;
		}else{
			return cb(new Error('can not get roomId, bind userId: ' + session.uid));
		}
	}
	var res = dispatchWithId(roomId, gameServers);
	cb(null, res.id);
}

var dispatchWithId = function(id, servers){
	var len = servers.length;
	if(len == 1){
		return servers[0];
	}
	var num = parseInt(id);
	var remainder = num % len;
	return servers[remainder];
}