var bt = require('../bt/bt');
var BTNode = bt.Node;
var util = require('util');
var consts = require('../../consts/consts');

var Action = function(opts){
	BTNode.call(this,opts.blackboard);
	this.getSkillId = opts.getSkillId;
	
};

util.inherits(Action,BTNode);
module.exports = Action;

var pro = Action.prototype;
pro.doAction = function(){
	var character = this.blackboard.curCharacter;
	var targetId = this.blackboard.curTarget;
	var target = this.blackboard.area.getEntity(targetId);
	
	if(!target){
		this.blackboard.curTarget = null;
		if(targetId === character.target) character.forgetHater(targetId);
		return bt.RES_FAIL;
	}

	if(targetId !== character.target){
		this.blackboard.curTarget = null;

		return bt.RES_FAIL;
	}
	
	if(target.type !== consts.EntityType.MOB &&
		target.type !== consts.EntityType.PLAYER){
		return bt.RES_FAIL;
	}
	
	var res = character.attack(target,this.getSkillId(this.blackboard));
	if(res.result === consts.AttackResult.SUCCESS ||
		res.result === consts.AttackResult.KILLED ||
		res.result === consts.AttackResult.MISS ||
		res.result === consts.AttackResult.NOT_COOLDOWN) {
		
		return bt.RES_SUCCESS;
	}
	
	if(res.result === consts.AttackResult.NOT_IN_RANGE) {
		this.blackboard.distanceLimit = res.distance;
	}
	
	return bt.RES_FAIL;
};