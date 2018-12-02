"use_strict";
const TAG = "jinCombatRecord.js";
const pomelo = require("pomelo");
var Parse = pomelo.app.get("Parse");
var Combat = Parse.Object.extend("jinCombatRecord");

exports.addRecord = function(param, callback){
    var combat = new Combat();
    combat.save(param, {
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

exports.saveRecord = function(record, callback){
    record.save(null, {
        success: function (record) {
			callback(null, record);
		},
		error: function (record, error) {
			callback(error);
		}
    });
}