/**
 * Created by mac on 2017/6/2.
 */
"use strict";

var pomelo = require('pomelo');
var redis  = pomelo.app.get("redis");

function acquireLock(client, lockName, timeout, retryDelay, onLockAquired,data) {
	function retry() {
        console.log("acquireLock " + client.get(lockName));
		setTimeout(function () {
			acquireLock(client, lockName, timeout, retryDelay, onLockAquired,data);
		}, retryDelay);
	}
	//EX seconds − 设置指定的到期时间(以秒为单位)。
	//PX milliseconds - 设置指定的到期时间(以毫秒为单位)。
	//NX - 仅在键不存在时设置键。
	//XX - 只有在键已存在时才设置。
	var lockTimeoutValue = (Date.now() + timeout + 1);
	client.set(lockName, lockTimeoutValue, 'PX', timeout, 'NX', function (err, result) {
		if (err || result === null){
			return retry();
		}
		onLockAquired(lockTimeoutValue,data);
		// setTimeout(function (){
		// 	client.del(lockName,function (err) {
        //
		// 	});
		// },200);
	});

}

module.exports = function (client, retryDelay) {
	client = client ? client : redis;
	if (!(client && client.setnx)) {
		throw new Error("You must specify a client instance of http://github.com/mranney/node_redis");
	}

	retryDelay = retryDelay || 50;

	return function (lockName, timeout, taskToPerform,data) {
		if (!lockName) {
			throw new Error("You must specify a lock string. It is on the redis key `lock.[string]` that the lock is acquired.");
		}
		if (!taskToPerform) {
			taskToPerform = timeout;
			timeout       = 2800;
		}
		var isDone = false;
		var timeId;
		timeId =setTimeout(function () {
			isDone = true;
			clearTimeout(timeId)
			//taskToPerform = function(completed,timeoutErr)
			taskToPerform(function (done) {
				done = done || function () {};
				done()
			}, "time out");
		}, timeout)

		lockName = "lock-" + lockName;

		acquireLock(client, lockName, timeout, retryDelay, function (lockTimeoutValue,funcData) {
			clearTimeout(timeId)
			//is timeout do ?
			if(!isDone){
				taskToPerform(function (done) {
					done = done || function () {};

					if (lockTimeoutValue > Date.now()) {
//						console.log('normal del success',timeout)
						client.del(lockName, done);
					} else if (!isDone) {
						done();
					}
				},null,funcData);
			}else{
				if (lockTimeoutValue > Date.now()) {
//					console.log('timeout del success')
					client.del(lockName, function () {});
				}
			}
		},data);
	}
};
