var redis = require("redis");
var exp = module.exports;

exp.setRedis = function (app) {

	app.loadConfig('MyConfig', app.getBase() + '/config/myconfig.json');

	var client = redis.createClient(app.get("MyConfig")["redis_port"], app.get("MyConfig")["redis_host"], {auth_pass: "b840fYHc02"});  // 连接

	client.on("error", function (err) {///绑定redis数据库错误回调
		console.error("Redis:Error:" + err);
	});

	app.set("redis", client); // app访问接口
}


