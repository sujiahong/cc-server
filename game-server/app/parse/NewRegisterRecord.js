"use_strict";
const pomelo = require("pomelo");
var parse = pomelo.app.get("Parse");
var newRegister = parse.Object.extend("newUserRecord");

var exp = module.exports;

exp.addRecord = function(parm, callback){
    var register = new newRegister();
    register.set("userId", parm.userId);
    register.set("userNo", parm.userNo);

    register.save(null, {
        success: function(ret){
            callback ? callback(null, ret) : null;
        },
        error: function(ret, error){
            callback ? callback(error, null) : null;
        }
    })
}