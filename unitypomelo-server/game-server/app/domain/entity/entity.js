var EventEmitter = require('events').EventEmitter;
var util = require('util');

var id = 1;

var Entity = function(opts){
	EventEmitter.call(this);

	this.entityId = id++;
	this.kindId = Number(opts.kindId || "0002");
	this.kindName = opts.kindName;
	this.englishName= opts.englishName;
	this.type = opts.type;
	this.x = opts.x;
	this.y = opts.y;
	
	this.areaId = Number(opts.areaId || 1);
	this.area = opts.area;
};

util.inherits(Entity, EventEmitter);

module.exports = Entity;


Entity.prototype.getEntityId = function(){
	return this.entityId;
};

Entity.prototype.getState = function(){
	return {x:this.x,y:this.y};
};


Entity.prototype.setPosition = function(x,y){
	this.x = x;
	this.y = y;
};


