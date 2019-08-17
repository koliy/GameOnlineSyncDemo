var EventEmitter = require('events').EventEmitter;
var exp = module.exports;

var Tower =function(){
	this.ids ={};//当前灯塔的所有对象id
	this.watchers ={};//关注此灯塔变化的对象ids
	this.typeMap = {};//当前灯塔下对应类型的id数组
	this.size = 0;
};
exp.create = function(){
	return new Tower();
};

var pro = Tower.prototype;

/***
 * 添加一个对象到灯塔里
 * @param obj
 * @returns {boolean}
 */
pro.add=function(obj){
	var id = obj.id;
	var type = obj.type;
	this.ids[id]=id;
	
	if(!!obj.type){
		this.typeMap[type]=this.typeMap[type]||{};
		if(this.typeMap[type][id] === id) return false;
		this.typeMap[type][id] = id;
		this.size++;
		return true;
	}else
		return false;
};
pro.remove = function(obj){
	var id = obj.id;
	var type = obj.type;
	if(!!this.ids[id]){
		delete this.ids[id];
		if(!!type) delete this.typeMap[type][id];
		this.size--;
	}
}

pro.getIds = function(){
	return this.ids;
};
pro.getIdsByTypes=function(types){
	var result={};
	for(var i =0;i<types.length;i++){
		var type = types[i];
		if(!!this.typeMap[type]) result[type]=this.typeMap[type];
	}
	return result;
};

pro.addWatcher=function(watcher){
	var type = watcher.type;
	var id = watcher.id;
	if(!!type){
		this.watchers[type]=this.watchers[type]||{};
		this.watchers[type][id]=id;
	}
};

pro.removeWatcher=function(watcher){
	var type = watcher.type;
	var id = watcher.id;

	if(!!type && !!this.watchers[type] && !!this.watchers[type][id]){
		delete this.watchers[type][id];
	}
};

pro.getWatchers = function(types){
	var result={};
	if(!!types && !!types.length >0){
		for(var i=0;i<types.length;i++){
			var type = types[i];
			if(!!this.watchers[type]){
				result[type]= this.watchers[type];
			}
		}
	}
	
	return result;
};

