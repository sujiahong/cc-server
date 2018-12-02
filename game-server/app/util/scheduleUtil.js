/**
 * Created by mac on 2016/12/13.
 */
const schedule = require('pomelo-scheduler');
var app = require('pomelo').app;
var server = app.getCurServer();

var jobMap = [];

var exp = module.exports;
/**
 *
 * @param ms 多少毫秒后执行
 * @param next 执行回调
 */
exp.addJob = function (ms, next, params) {
	var time = Date.now() + ms;
	var jobId = schedule.scheduleJob({start: time}, function (data) {
		next(data);
	}, params);
	console.info("add job=========" + jobId);
	jobMap.push({jobId: jobId, time: time});


	for (var i in jobMap) {
		if (jobMap[i].time < (Date.now() - 5000)) {
			console.info("deljob=========" + jobMap[i].jobId);
			schedule.cancelJob(jobMap[i].jobId);
			delete jobMap[i];
		}
	}
	var newArr = [];
	for (var j in jobMap) {
		if (typeof(jobMap[j]) != 'undefined') {
			newArr.push(jobMap[j]);
		}
	}
	jobMap = newArr;

	return jobId;
};
exp.addJobByTime = function (startTime, next, userId) {
	var jobId = schedule.scheduleJob({start: startTime}, function () {
		next();
		schedule.cancelJob(jobId);
	});
	return jobId;
};

exp.addJobByCount = function () {
	var simpleJob = function (data) {
		console.log("run Job :" + data.name);
	}

	return schedule.scheduleJob({start: Date.now(), period: 3000}, simpleJob, {name: 'simpleJobExample'});
};

exp.delJob = function (id) {
	try {
		schedule.cancelJob(id);
	} catch (err) {

	}

}

function cancleJob(data) {
	var jobMap = data.jobMap;
	console.info("server: " + server.id + "=========run deljob")
	for (var i in jobMap) {
		if (jobMap[i].time < Date.now()) {
			jobMap.splice(i, 1);
			console.info("deljob=========" + jobMap[i].jobId);
			data.schedule.cancelJob(jobMap[i].jobId);
		}
	}

}

function scheduleCancleJobTest() {
	var id = schedule.scheduleJob({start: Date.now(), period: 5000, count: jobMap.length}, cancleJob, {
		jobMap: jobMap,
		schedule: schedule
	});
}
//scheduleCancleJobTest();