var pomelo        = require('pomelo');
var routeUtil     = require('./app/util/routeUtil');

/**
 * Init app for client.
 */
var app = pomelo.createApp();

app.set('name', 'cc-server');

require('./app/util/parseConfig').setParse(app);
require('./app/util/redisConfig').setRedis(app);

app.set('sessionConfig', {singleSession: true});

app.configure('production|development', 'connector', function () {
	app.set('session', require('./config/session.json'));
});

// app configure
app.configure('production|development', function () {
	//app.enable('systemMonitor');
	app.set('connectorConfig', {
		connector          : pomelo.connectors.hybridconnector,
		heartbeat          : 10,
		timeout            : 20,
		disconnectOnTimeout: true
	});
	app.route("home", routeUtil.homeRoute);
	app.route("game_niu", routeUtil.gameRoute);
	app.route("game_gobang", routeUtil.gameRoute);
	app.route("game_keng", routeUtil.gameRoute);
	app.route("game_jin", routeUtil.gameRoute);
	app.route("game_ddz", routeUtil.gameRoute);

	//app.before(pomelo.filters.toobusy());
	//app.filter(pomelo.filters.timeout());
	//app.filter(pomelo.filters.time());
	//app.before(pomelo.filters.serial());
	//app.rpcFilter(pomelo.rpcFilters.rpcLog());
});

app.disable('rpcDebugLog');

app.start();

process.on('uncaughtException', function (err) {
	console.error(' Caught exception: ' + err.stack);
});

