"use_strict";
const TAG = "OnlineRecord"
const pomelo = require('pomelo');
var Parse = pomelo.app.get("Parse");
var Online = Parse.Object.extend('onlineRecord');

var exp = module.exports;

exp.addRecord = function (num, callback) {
    var online = new Online();
    var _add = function(){
        online.save({userCount: num}, {
            success: function (ret) {
                callback ? callback(null, ret) : null;
            },
            error: function (object, error) {
                console.log(TAG, 'Failed with error code: ',  error.message);
                setTimeout(_add, 100);
            }
        });
    }
    _add();
}