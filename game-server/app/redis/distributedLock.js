
"user strict"

var pomelo = require("pomelo");
var redis = pomelo.app.get("redis");


 function lock(lockName, callback){
    lockName = "lock-" + String(lockName);
    var timeout = 2000;

    var _tryExecute = function(lockName, callback){
        redis.set(lockName, 500, "PX", timeout, "NX", function(err, res){
            if(err || !res){
                _tryExecute(lockName, callback);
            }
            else{
                callback(function(){
                    redis.del(lockName, function () {});
                });
            }
        });
    }
    _tryExecute(lockName, callback);
};

module.exports = lock;