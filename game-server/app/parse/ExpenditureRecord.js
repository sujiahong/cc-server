"use_strict";
const TAG = "ExpenditureRecord.js"
const pomelo = require('pomelo');
var Parse = pomelo.app.get("Parse");
var Expenditure = Parse.Object.extend('expenditureRecord');

var exp = module.exports;

exp.addRecord = function (param, callback) {
    var record = new Expenditure();
    var _add = function(){
        record.save(param, {
            success: function (ret) {
                callback ? callback(null, ret) : null;
            },
            error: function (object, error) {
                console.log(TAG, 'Failed: ',  error.message);
                setTimeout(_add, 1000);
            }
        });
    }
    _add();
}