var AiManager = require('./service/aiManager');
var BrainService = require('./service/brainService');
var fs = require('fs');
var path = require('path');

var exp = module.exports;
exp.createManager = function(opts){
	var brainservice = new BrainService();
	fs.readdirSync(__dirname+'/brain').forEach(function(filename){
		if(!/\.js$/.test(filename)) return;//忽略不是js的文件
		var name = path.basename(filename,'.js');
		var brain = require('./brain/'+name);
		brainservice.registerBrain(brain.name||name,brain);
	});
	
	opts = opts ||{};
	opts.brainService = brainservice;
	return new AiManager(opts);
};
