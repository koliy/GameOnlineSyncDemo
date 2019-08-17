
var bt = require('../bt/bt');
var Select = bt.Select;
var If = bt.If;
var Loop = bt.Loop;

var consts = require('../../consts/consts');
var TryAndAdjust = require('../node/tryAndAdjust');
var MoveToTarget = require('../action/moveToTarget');
var TryAttack = require('../action/tryAttack');
var TryTalkToNpc = require('../action/tryTalkToNpc');


var Brain = function(blackboard){
	var attack = genAttackAction(blackboard);
	var talk = genTalkAction(blackboard);
	this.action = new Select({
		blackboard:blackboard
	});
	
	this.action.addChild(attack);
	this.action.addChild(talk);
};

Brain.prototype.update = function(){
	return this.action.doAction();
};

var genAttackAction = function(blackboard){
	var	attack  = new TryAndAdjust({
		blackboard:blackboard,
		adjustAction:new MoveToTarget({
			blackboard:blackboard
		}),
		tryAction:new TryAttack({
			blackboard:blackboard,
			getSkillId:function(bb){ return bb.curCharacter.curSkill || 1;}
		})
	});
	
	
	
	var checkTarget = function(bb){
		//目标是否改变
		if(bb.curTarget !== bb.curTarget.target){
			bb.curTarget = null;
			return false;
		};
		return !!bb.curTarget;
	};
	

	
	var loopAttack = new Loop({
		blackboard:blackboard,
		child:attack,
		loopCond:checkTarget
	});
	
	
	var haveTarget = function(bb){
		var character = bb.curCharacter;
		var targetId = character.target;
		var target = bb.area.getEntity(targetId);
	
		if(!target){
			character.forgetHater(targetId);
			bb.curTarget = null;
			return false;
		}
		
		if(target.type === consts.EntityType.MOB || target.type === consts.EntityType.PLAYER){
			bb.curTarget = targetId;
			return true;
		}
		
		return false;
	};

	return new If({
		blackboard:blackboard,
		cond:haveTarget,
		action:loopAttack
	});
};

var genTalkAction = function(blackboard){
	var talk = new TryAndAdjust({
		blackboard:blackboard,
		adjustAction:new MoveToTarget({
			blackboard:blackboard
		}),
		tryAction:new TryTalkToNpc({
			blackboard:blackboard
		})
	});
	
	
	var haveTarget = function(bb){
		var character = bb.curCharacter;
		var targetId = character.target;
		var target = bb.area.getEntity(targetId);
		
		if(!target){
			character.forgetHater(targetId);
			bb.curTarget = null;
			return false;
		}
		
		if(target.type === consts.EntityType.NPC){
			bb.curTarget = targetId;
			return true;
		}
		
		return false;
	};
	
	return new If({
		blackboard:blackboard,
		cond:haveTarget,
		action:talk
	})
};

module.exports.clone = function(opts){
	return new Brain(opts.blackboard);
};

module.exports.name = 'player';
