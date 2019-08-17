var Entity = require('./entity');
var util = require('util');
var EntityType = require('../../consts/consts').EntityType;
var consts = require('../../consts/consts');
var formula = require('../../consts/formula');
var messageService = require('../messageService');

var Npc = function(opts){
	Entity.call(this,opts);
	this.id = opts.id;
	this.type = EntityType.NPC;
	this.orientation = opts.orientation;
	this.width = opts.width;
	this.height = opts.height;
	this.kindType = opts.kindType;
	this.x = opts.x;
	this.y = opts.y;
	
};

util.inherits(Npc,Entity);


Npc.prototype.talk = function(player){
	if(!formula.inRange(player,this,100)){
		return {result:consts.NPC.NOT_IN_RANGE,distance:100};
	}
	
	this.emit('onNPCTalk',{npc:this,player:player});
	return {result:consts.NPC.SUCCESS};
};

/**
 * 传送
 * @param route
 * @param msg
 */
Npc.prototype.changeArea = function(route,msg){
	var player = this.area.getEntity(msg.player);
	msg.action = 'changeArea';
	msg.params = {target:consts.TraverseNpc[msg.kindId]};
	
	messageService.pushMessageToPlayer({uid:player.userId,sid:player.serverId},route,msg);
};

/**
 * 用于JSON.stringify的对象json转换重载函数
 * @returns {{entityId: *, kindId: *, x: *, y: *}}
 */
Npc.prototype.toJSON = function() {
	return {
		entityId: this.entityId,
		kindId: this.kindId,
		x: this.x,
		y: this.y
	};
};

module.exports = Npc;














