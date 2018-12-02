"use strict"
module.exports = function (app) {
	return new Handler(app);
};

var Handler = function (app) {
	this.app = app;
};

var handler = Handler.prototype;

handler.queryEntry = function (msg, session, next) {
	if (session.uid) {
		return next(null, { code: 1});
	}
	// get all connectors
	var connectors = this.app.getServersByType('connector');
	if (!connectors || connectors.length === 0) {
		return next(null, { code: 1 });
	}
	// select connector, because more than one connector existed.
	var index = parseInt(connectors.length * Math.random());
	var res = connectors[index];
	return next(null, {
		code: 0,
		host: res.remote,
		port: res.clientPort
	});
};