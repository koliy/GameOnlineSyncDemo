var Map = require('../../../domain/map/map');
var dataApi = require('../../../util/dataApi');
var utils =require('../../../util/utils');


module.exports = function(app){
	return new Remote(app);
};

var Remote = function(app){
	this.app = app;
	this.maps ={};
	var areasConfig = dataApi.area.all();
	for(var key in areasConfig){
		var areaConfig = areasConfig[key];
		areaConfig.weightMap = true;
		this.maps[areaConfig.id] = new Map(areaConfig);
	}
};

Remote.prototype.findPath = function(args,cb){
	var start = args.start;
	var end = args.end;
	var areaId = args.areaId;
	var map = this.maps[areaId];
	
	if(!map){
		utils.invokeCallback(cb,'no map exist');
		return;
	}
	
	var path = map.findPath(start.x, start.y, end.x, end.y);
	
	if(!path){
		utils.invokeCallback(cb, 'find path error!');
	}else{
		utils.invokeCallback(cb, null, path);
	}
	
};