var Parse = require("parse/node");//连接Parse服务器
var exp = module.exports;

exp.setParse = function (app) {

	app.loadConfig('ParseConfig', app.getBase() + '/config/parse.json');

	Parse.initialize(app.get('ParseConfig').appId,app.get('ParseConfig').javascriptKey,app.get('ParseConfig').masterKey);
	Parse.serverURL = app.get('ParseConfig').serverURL;

	app.set("Parse",Parse);//Parse访问接口
}




