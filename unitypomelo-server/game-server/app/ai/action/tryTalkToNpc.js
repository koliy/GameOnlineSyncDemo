var bt =require('../bt/bt');
var BTNode = bt.Node;
var util = require('util');
var consts = require('../../consts/consts');


var Action = function (opts) {
	BTNode.call(this,opts.blackboard);
	
};
util.inherits(Action,BTNode);

module.exports = Action;

Action.prototype.doAction = function(){
	var character = this.blackboard.curCharacter;
	var targetId = this.blackboard.curTarget;
	var area = this.blackboard.area;
	var target = area.getEntity(targetId);
	
	if(!target){
		this.blackboard.curTarget = null;
		character.target = null;
		return bt.RES_FAIL;
	}
	
	if(target.type !== consts.EntityType.NPC){
		this.blackboard.curTarget = null;
		return bt.RES_FAIL;
	}
	
	var res = target.talk(character);
	if(res.result === consts.NPC.SUCCESS){
		this.blackboard.curTarget = null;
		character.target = null;
		return bt.RES_SUCCESS;
	}
	
	if(res.result === consts.NPC.NOT_IN_RANGE){
		this.blackboard.distanceLimit = res.distance;
	}
	
	return bt.RES_FAIL;
};