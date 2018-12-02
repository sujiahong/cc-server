"use_strict";
const TAG = "gobangCombatRecord.js";
const pomelo = require("pomelo");
var Parse = pomelo.app.get("Parse");
var Combat = Parse.Object.extend("gobangCombatRecord");

exports.addRecord = function(param, callback){
    var combat = new Combat();
    var _add = function(){
        combat.save(param, {
            success: function (record) {
                callback ? callback(record) : null;
            },
            error: function (record, error) {
                console.log(TAG, "addRecord error", error);
                setTimeout(_add, 1000);
            }
        });
    }
    _add();
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