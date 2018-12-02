"use_strict";
const TAG = "parseConfig.js";
const pomelo = require('pomelo');
var Parse = pomelo.app.get("Parse");

var exp = module.exports;

exp.getConfigShopData = function(next){
	Parse.Config.get().then((config)=>{
		var data = config.get("shopData");
		next(null, data);
	}, (error)=>{
		next(error);
	});
}

exp.getConfigShareChance = function(next){
	Parse.Config.get().then((config)=>{
		var data = config.get("shareChance");
		next(null, data);
	}, (error)=>{
		next(error);
	});
}

exp.getConfigRewardCoin = function(next){
	Parse.Config.get().then((config)=>{
		var data = config.get("rewardCoin");
		next(null, data);
	}, (error)=>{
		next(error);
	});
}