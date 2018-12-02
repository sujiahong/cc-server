"use_strict";
const TAG = "connectHandler.js";
const async = require('async');
const errcode  = require('../../../shared/errcode');
const constant = require("../../../shared/constant");
const loginer = require("../../../conn_logic/login");
const logouter = require("../../../conn_logic/logout");
const redis = require('../../../redis/redisDb');

module.exports = function (app) {
	return new Handler(app);
}
var Handler = function (app) {
	this.app = app;
	this.sessionService = this.app.get("sessionService");
}
var handle = Handler.prototype;

// client login, bind user info to session
handle.login = function (msg, session, next) {
	var self = this;
	if (!msg.wxOpenId) {
		return next(null, {code: errcode.WXOPNEID_NULL});
	}
	var clientIP = session.__session__.__socket__.remoteAddress.ip;
	if (clientIP.substr(0, 7) == "::ffff:") {
		clientIP = clientIP.substr(7);
	}
	var serverId = this.app.getServerId();
	var userId = "";
	console.log(TAG, clientIP, "登录 登录 登录  login::msg: ",  msg.wxOpenId, serverId);
	async.waterfall([
	function (cb) { //检查注册
		var param = {
			userIconUrl: msg.iconurl,
			sex        : msg.sex ? msg.sex : '1',
			nickName   : msg.nickName,
			wxOpenId   : msg.wxOpenId,
			wxUnionId  : msg.wxUnionId,
			loginIp    : clientIP,
			serverId   : serverId,
			plat	   : msg.plat,
			clientPlat : msg.clientType
		};
		loginer.login(param, cb);
	}, function (res, cb) { //更新session, bind uid
		userId = res.userId;
		redis.existServerId(userId, function(err, is){
			if (err){
				return cb(errcode.REDIS_DATABASE_ERR);
			}
			if (is == 1){
				return cb(errcode.LOGINED);
			}
			loginer.notifyOnline(self, res, serverId);
			session.bind(userId, function(err){
				console.log(TAG, "绑定完成 session！！！", userId, err);
				if (err){
					return cb(errcode.BIND_UID_FAIL, err);
				}
				redis.setUserIdServerId(userId, serverId);
				session.set("roomId", res.roomId);
				session.set("serverId", serverId);
				session.set("gamePlay", res.gamePlay);
				session.on("closed", onUserLogout.bind(null, self.app));
				session.pushAll(function(){next(null, res);});
			});
		});
	}], function (code, data) {
		console.log(TAG, "登录 错误 登录 错误 errcode::  ", code, "data:::  ", data);
		next(null, {code: code});
		if (code == errcode.BIND_UID_FAIL || code == errcode.FAIL){
			self.sessionService.kick(userId, function(){});
		}
	});
};

var onUserLogout = function (app, session) {
	if (!session || !session.uid) {
		return;
	}
	redis.rmvUserIdServerId(session.uid);
	console.log(TAG, "serverId::  ", session.frontendId, "=======onUserLogout====userId:: ", session.uid);
	logouter.logout(app, session, function(error, data){
		console.log(TAG, "connectorToOffline== error:", error, data);
		session.unbind(session.uid);
	});
};

