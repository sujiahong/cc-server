"use_strict";
const TAG = "http app.js";
var express = require('express');
var cookieParser = require('cookie-parser');
var path = require('path');
var logger = require('morgan');
var index = require('./routes/index');
var bodyParser = require("body-parser");
require("body-parser-xml")(bodyParser);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.xml({
	limit: "2MB",
	xmlParseOptions:{
		normalize: true,
		normalizeTags: true,
		explicitArray: false,
	}
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.all('*', function(req, res, next){
	var reqUrl=req.ip
	console.log(reqUrl)
//	res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
//	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//	res.header('Access-Control-Allow-Headers', 'Content-Type');
//	res.header('Access-Control-Allow-Credentials', 'true');
	next();
})
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;