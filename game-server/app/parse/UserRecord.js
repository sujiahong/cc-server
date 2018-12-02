"use_strict";
const TAG = "UserRecord.js";
const pomelo = require("pomelo");
var Parse = pomelo.app.get("Parse");
var User = Parse.Object.extend("userRecord");

exports.addRecord = function(param, callback){
    var user = new User();
    user.set("userNo", param.userNo);
	user.set("nickname", param.nickName);
	user.set("wxOpenId", param.wxOpenId);
    user.set("wxUnionId", param.wxUnionId);
    user.set("entryType", param.plat);
    user.set("clientPlat", param.clientPlat);
	user.set("userIconUrl", param.userIconUrl);
	user.set("sex", param.sex);
	user.set("loginIp", param.loginIp);
	user.set("restCard", 3);
    user.set("coinNum", 0);
    user.set("hadReward", 0);///是否接受过奖励
    user.set("bindId", "");   //绑定的推广员Id
    user.set("bindTimestamp", 0); //绑定的时间戳
    user.set("bindUserNo", "");
    user.set("promoterId", "");// 推广员Id
    user.set("roomId", "");  //哪个房间
    user.set("gamePlay", 0); //哪个玩法
    user.set("freeze", false);
    user.set("comment", "");
    user.set("location", "");
	user.save(null, {
		success: function (user) {
			callback(null, user);
		},
		error: function (user, error) {
			callback(error, null);
		}
	});
};

exports.getRecord = function(userId, callback){
    var query = new Parse.Query(User);
    query.get(userId, {
        success: function(ret){
            callback(null, ret);
        },
        error: function(ret, error){
            callback(error);
        }
    });
};

exports.updateUserByObjectId = function(userId, param, callback){
    var user = new User();
    var options = {id: userId};
    options.nickname =  param.nickName;
    options.userIconUrl= param.userIconUrl;
    options.sex = param.sex;
    options.loginIp = param.loginIp;
    options.clientPlat = param.clientPlat;
    if( param && param.wxUnionId ){
        options.wxUnionId = param.wxUnionId;
    }
    user.save(options, {
        success: function (ret) {
            callback ? callback(null, ret) : null;
        },
        error: function (ret, error) {
            callback ? callback(error, null) : null;
        }
    });
}

exports.updateUserOptionsByObject = function(user, options, callback){
    for (var key in options) {
        user.set(key, options[key]);
    }
    var update = function(){
        user.save(null, {
            success: function (ret) {
                callback ? callback(null, ret) : null;
            },
            error: function (ret, error) {
                console.log(TAG, ret, "error:: ", error);
                update();
            }
        });
    }
    update();
}

exports.updateUserByUserId = function (userId, options, callback) {
    var user = new User();
    user.id = userId;
    var update = function(){
        user.save(options, {
            success: function (ret) {
                callback ? callback(null, ret) : null;
            },
            error: function (ret, error) {
                console.log(TAG, ret, "error:: ", error);
                update();
            }
        });
    }
    update();
}

exports.fetchAndUpdateRecordById = function(userId, options, callback){
    var query = new Parse.Query(User);
    query.get(userId, {
        success: function(ret){
            exports.updateUserOptionsByObject(ret, options, callback);
        },
        error: function(ret, error){
            callback(error);
        }
    });
}

exports.generateCoinRankingList = function(callback){
    var query = new Parse.Query(User);
    query.descending("coinNum");
    query.limit(100);
    query.find({
		success: function (results) {
			callback(null, results);
		},
		error: function (error) {
			callback(error, null);
		}
	});
}