"use strict";
const TAG = "util/httpUtil.js";
const  request = require('request');
const qs = require('querystring');
const fs    = require('fs');
const errcode = require("../shared/errcode");
const constant = require("../shared/constant");
const util = require("./utils");
const config = require("../../config/myconfig.json");
const URL = config.promoter_url + "/center/";

var httpUtil = module.exports;

httpUtil.rebateRoomFeeToPromoter = function(rebateData){
    var _send = function(){
        rebateRequest(rebateData, function(data){
            if (data.code != errcode.OK){
                setTimeout(_send, 4000);
            }
        });
    }
    _send();
}

var rebateRequest = function(form, next){
	var url = URL + "rebateRoomFee";
	var options = {
        url: url,
        method: "POST",
        form: form
	};
	request(options, function (err, response, body) {
		console.log("util.rebateRequest", err, body);
		if (err){
			return next({code: errcode.FAIL});
		}
		next(JSON.parse(body));
	});
}

httpUtil.bindPromoterRequest = function(form, next){
	var url = URL + "verifyPromoter";
	var options = {
        url: url,
        method: "POST",
        form: form
	};
	request(options, function (err, response, body) {
		console.log("util.bindPromoterRequest", err, body);
		if (err){
			return next(err);
		}
		next(null, JSON.parse(body));
	});
}

httpUtil.queryRechargeResult = function(data, next){
	var url = "https://cp.iapppay.com/payapi/queryresult";
	var transStr = JSON.stringify(data);
	var rsaSign = util.rsaEncode(transStr);
	var options = {
        url: url,
        method: "POST",
        form: {
			transdata: transStr,
			sign: rsaSign,
			signtype: "RSA"
		}
	};
	var count = 0;
	var _request = function(){
		request(options, function (err, response, body) {
			console.log("util.queryRechargeResult", err, body);
			if (err){
				count++;
				if (count < 5)	
					return setTimeout(_request, 1000);
				else
					return console.log(TAG, "queryRechargeResult 查询错误次数超过上限 count: ", count);
			}
			next(qs.parse(decodeURI(body)));
		});
	}
	_request();
}


httpUtil.get = function (url, callback) {
	callback = callback ? callback : function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body) //
		}
	}
	request(url, callback)
}

httpUtil.pipe = function (url, path) {
	request(url).pipe(fs.createWriteStream(path))
}

httpUtil.bePipe = function (path,url,type) {
	var req =  request.put(url)
	if(type == 'post'){
		req =  request.post(url)
	}
	if(type == 'put'){
		req =  request.put(url)
	}
	fs.createReadStream(path).pipe(req)
}

httpUtil.pipeMysult = function (url1,url2) {
	request.get(url1).pipe(request.put(url2))
}

httpUtil.post = function (url,option) {
//	request.post('http://service.com/upload', {form:{key:'value'}})
	request.post(url).form(option)
}

httpUtil.postOption = function () {
	var http = require('http');

	var post_data = {
		a: 123,
		time: new Date().getTime()};//这是需要提交的数据

	//正式购买地址 沙盒购买地址
	var url_buy     = "https://buy.itunes.apple.com/";
	var url_sandbox = "https://sandbox.itunes.apple.com";// /verifyReceipt

	//	request.post('http://service.com/upload').form({key:'value'})

	var content = qs.stringify(post_data);
	var options = {
		hostname: url_sandbox,
		port: 80,
		path: 'verifyReceipt',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'Content-Length': content.length
		}
	};

	var req = http.request(options, function (res) {
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
		});
	});




	req.on('error', function (e) {
		console.log('problem with request: ' + e.message);
	});

	// write data to request body
	req.write(content);

	req.end();
}

httpUtil.mult = function (url) {
	var r = request.post(url)
//	var form = r.form()
//	form.append('my_field', 'my_value')
//	form.append('my_buffer', new Buffer([1, 2, 3]))
//	form.append('my_file', fs.createReadStream(path.join(__dirname, 'doodle.png'))
//	form.append('remote_file', request('http://google.com/doodle.png'))
}

httpUtil.auth = function (url,username,pwd,flag) {
	request.get(url).auth(username,pwd, flag);

//	request.get('http://some.server.com/', {
//		'auth': {
//			'user': 'username',
//			'pass': 'password',
//			'sendImmediately': false
//		}
//	});

//	sendImmediately，默认为真，发送一个基本的认证header。设为false之后，收到401会重试（服务器的401响应必须包含WWW-Authenticate指定认证方法）。
//
//sendImmediately为真时支持Digest认证。
}


httpUtil.OAuth = function (url) {
	// Twitter OAuth
	var qs = require('querystring')
		, oauth =
			{ callback: 'http://mysite.com/callback/'
				, consumer_key: CONSUMER_KEY
				, consumer_secret: CONSUMER_SECRET
			}
		, url = 'https://api.twitter.com/oauth/request_token'
		;
	request.post({url:url, oauth:oauth}, function (e, r, body) {
		// Ideally, you would take the body in the response
		// and construct a URL that a user clicks on (like a sign in button).
		// The verifier is only available in the response after a user has
		// verified with twitter that they are authorizing your app.
		var access_token = qs.parse(body)
			, oauth =
				{ consumer_key: CONSUMER_KEY
					, consumer_secret: CONSUMER_SECRET
					, token: access_token.oauth_token
					, verifier: access_token.oauth_verifier
				}
			, url = 'https://api.twitter.com/oauth/access_token'
			;
		request.post({url:url, oauth:oauth}, function (e, r, body) {
			var perm_token = qs.parse(body)
				, oauth =
					{ consumer_key: CONSUMER_KEY
						, consumer_secret: CONSUMER_SECRET
						, token: perm_token.oauth_token
						, token_secret: perm_token.oauth_token_secret
					}
				, url = 'https://api.twitter.com/1/users/show.json?'
				, params =
					{ screen_name: perm_token.screen_name
						, user_id: perm_token.user_id
					}
				;
			url += qs.stringify(params)
			request.get({url:url, oauth:oauth, json:true}, function (e, r, user) {
				console.log(user)
			})
		})
	})
}

httpUtil.headReq = function (url,headers) {

	var options = {
		url:url,
		headers: headers
	};

	function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			var info = JSON.parse(body);
			console.log(info.stargazers_count + " Stars");
			console.log(info.forks_count + " Forks");
		}
	}

	request(options, callback);
}

httpUtil.cookies = function () {
//	var request = request.defaults({jar: true})
//	request('http://www.google.com', function () {
//		request('http://images.google.com')
//	})


//	var j = request.jar()
//	var request = request.defaults({jar:j})
//	request('http://www.google.com', function () {
//		request('http://images.google.com')
//	})

//	var j = request.jar()
//	var cookie = request.cookie('your_cookie_here')
//	j.setCookie(cookie, uri, function (err, cookie){})
//	request({url: 'http://www.google.com', jar: j}, function () {
//		request('http://images.google.com')
//	})
}