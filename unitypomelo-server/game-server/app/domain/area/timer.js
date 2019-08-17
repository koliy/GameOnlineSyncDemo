var EntityType = require('../../consts/consts').EntityType;
var logger =require('pomelo-logger').getLogger(__filename);

/**
 * 定时器，用于统一刷新所有对象，避免对象的增删造成时间片的紊乱。
 * @param opts
 * @constructor
 */
var Timer = function(opts){
	this.area = opts.area;
	this.interval = opts.interval || 100; //linux时间片间隔以100ms为最佳
};

module.exports = Timer;

var pro = Timer.prototype;
pro.run = function(){
	this.interval = setInterval(this.tick.bind(this),this.interval);
};

pro.close = function(){
	clearInterval(this.interval);
};

pro.tick = function(){
	var area = this.area;
	//mobs
	for(var key in area.zones){
		area.zones[key].update();
	}
	
	area.actionManager.update();
	area.aiManager.update();
	area.patrolManager.update();
};

pro.updateObject = function(obj,oldPos,newPos){
	return this.area.aoi.updateObject(obj,oldPos,newPos);
};

/**
 * Get all the watchers in aoi for given position.
 * @param pos {Object} Given position.
 * @param types {Array} The watchers types.
 * @param ignoreList {Array} The ignore watchers' list.
 * @return {Array} The qualified watchers id list.
 */
pro.getWatchersUids = function(pos,types,ignoreList){
	var area = this.area;
	var watchers = area.aoi.getWatchers(pos,types);
	var result = [];
	if(!!watchers && !!watchers[EntityType.PLAYER]){
		var pWatchers = watchers[EntityType.PLAYER];
		for(var entityId in pWatchers){
			var player = area.getEntity(entityId);
			
			if(!!player && !!player.userId && (!ignoreList || !ignoreList[player.userId])){
				result.push({uid:player.userId,sid:player.serverId});
			}
		}
	}
	
	return result;
};

pro.getWatchers = function(pos,types){
	return this.area.aoi.getWatchers(pos,types);
};

pro.updateWatcher = function(watcher,oldpos,newPos,oldRange,newRange){
	return this.area.aoi.updateWatcher(watcher,oldpos,newPos,oldRange,newRange);
};

pro.addAction = function(action){
	return this.area.actionManager.addAction(action);
};

pro.abortAction = function(type,id){
	return this.area.actionManager.abortAction(type,id);
};

pro.AbortAllAction = function(id){
	this.area.actionManager.abortAllAction(id);
};

pro.patrol = function(entityId){
	var area = this.area;
	area.aiManager.removeCharacter(entityId);
	var entity = area.getEntity(entityId);
	
	if(!!entity){
		area.patrolManager.addCharacters([{character:entity,path:entity.path}]);
	}
};

pro.abortAllAction = function(id) {
	this.area.actionManager.abortAllAction(id);
};

pro.enterAI = function(entityId){
	var area = this.area;
	area.patrolManager.removeCharacter(entityId);
	this.abortAction('move',entityId);
	if(!!area.entities[entityId]){
		area.aiManager.addCharacters([area.entities[entityId]]);
	}
};