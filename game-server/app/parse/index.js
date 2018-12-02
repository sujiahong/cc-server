
var fs = require('fs');
var path = require('path');

var index = module.exports = {};

fs.readdirSync(__dirname ).forEach(function (filename) {
	if (!/\.js$/.test(filename)) {
		return;
	}
	var name = path.basename(filename, '.js');
	var _load =  require("./"+name);
	index[name] = _load;
});

