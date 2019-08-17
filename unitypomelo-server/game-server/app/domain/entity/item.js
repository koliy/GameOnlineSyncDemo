/**
 * Module dependencies
 */
var util = require('util');
var Entity = require('./entity');
var EntityType = require('../../consts/consts').EntityType;

var Item = function(opts){
	Entity.call(this,opts);
	this.type = EntityType.ITEM;
	this.name = opts.name;
	this.desc = opts.desc;
	this.englishDesc = opts.englishDesc;
	this.hp = opts.hp;
	this.mp = opts.mp;
	this.price = opts.price;
	this.heroLevel = opts.heroLevel;
	this.imgId = opts.imgId;
	this.lifetime = 30000;
	this.time = Date.now();
	this.playerId = opts.playerId;
	this.died = false;
};

util.inherits(Item, Entity);
module.exports = Item;

Item.prototype.toJSON = function() {
	return {
		entityId: this.entityId,
		kindId: this.kindId,
		x: this.x,
		y: this.y,
		playerId: this.playerId,
		type: this.type
	};
};