"use_strict";
const TAG = "niuCombatRecord.js";
const pomelo = require("pomelo");
var Parse = pomelo.app.get("Parse");
var Combat = Parse.Object.extend("niuCombatRecord");

exports.addRecord = function(param, callback){
    var combat = new Combat();
    combat.set("roomId", param.roomId);
    combat.set("roomLaw", param.roomLaw);
    combat.set("bankerId", param.bankerId);
    combat.set("baseCoin", param.baseCoin);
    combat.set("startStamp", param.startStamp);
    combat.set("endStamp", param.endStamp);
    combat.set("viewCodeId", param.viewId);
    combat.set("players", param.players);

    combat.save(null, {
        success: function (record) {
			callback(null, record);
		},
		error: function (record, error) {
			callback(error);
		}
    });
};


exports.getRecordById = function(id, callback){
    var query = new Parse.Query(Combat);
    query.get(id, {
        success: function(ret){
            callback(null, ret);
        },
        error: function(ret, error){
            callback(error);
        }
    });
}