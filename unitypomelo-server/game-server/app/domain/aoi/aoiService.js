var towerAOI=require('./towerAOI');
exp= module.exports;

var AOIService = function(config){
	if(!!config.aoi)
		this.aoi = config.aoi.getService(config);
	else
		this.aoi = towerAOI.getService(config);
};

var pro = AOIService.prototype;
/***
 * 获取当前坐标范围内灯塔下的所有ids
 * @param pos
 * @param range
 * @returns {*}
 */
pro.getIdsByPos = function(pos,range){
	return this.aoi.getIdsByPos(pos,range);
};
/**
 * 获取当前坐标范围内灯塔下对应类型的所有ids
 * @param pos
 * @param range
 * @param types
 * @returns {*}
 */
pro.getIdsByRange = function(pos,range,types){
	return this.aoi.getIdsByRange(pos,range,types);
};

pro.addObject = function(obj,pos){
	return this.aoi.addObject(obj,pos);
};

pro.removeObject = function(obj, pos){
	return this.aoi.removeObject(obj, pos);
};

pro.updateObject = function(obj, oldPos, newPos){
	return this.aoi.updateObject(obj, oldPos, newPos);
};

pro.getWatchers = function(pos, types){
	return this.aoi.getWatchers(pos, types);
};

pro.addWatcher = function(watcher, pos, range){
	return this.aoi.addWatcher(watcher, pos, range);
};

pro.removeWatcher = function(watcher, pos, range){
	return this.aoi.removeWatcher(watcher, pos, range);
};

pro.updateWatcher = function(watcher, oldPos, newPos, oldRange, newRange){
	return this.aoi.updateWatcher(watcher, oldPos, newPos, oldRange, newRange);
};

exp.getService = function(config){
	return new AOIService(config);
};