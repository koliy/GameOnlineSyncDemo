var Patrol = require('../action/patrol');
var bt = require('../bt/bt');
var Select = bt.Select;
var Loop= bt.Loop;
var If = bt.If;
var TryAndAdjust = require('../node/tryAndAdjust');
var MoveToTarget = require('../action/moveToTarget');
var TryAttack = require('../action/tryAttack');

var consts = require('../../consts/consts');

var Brain = function(blackboard){
	this.blackboard = blackboard;
	var patrol = new Patrol({blackboard:blackboard});
	var attackIfHaveTarget = genAttackAction(blackboard);

	this.action = new Select({blackboard:blackboard});
	this.action.addChild(attackIfHaveTarget);
	this.action.addChild(patrol);
};

Brain.prototype.update = function(){
	var res = 	this.action.doAction();
	return res;
};

var genAttackAction  =function(bb){
	var attack = new TryAndAdjust({
		blackboard:bb,
		adjustAction:new MoveToTarget({
			blackboard:bb
		}),
		tryAction:new TryAttack({
			blackboard:bb,
			getSkillId:function(bb){ return 1;}
		})
	});
	

	
	var checkTarget = function(bb){
		if(bb.curTarget !== bb.curCharacter.target){
			//target has change
			bb.curTarget = null;
			return false;
		}
		return !!bb.curTarget;
	};
	
	var loopAttack = new Loop({
		blackboard:bb,
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
		
		if(target.type === consts.EntityType.PLAYER){
			bb.curTarget = targetId;
			return true;
		}
		
		return false;
	};
	
	
	return new If({
		blackboard:bb,
		cond:haveTarget,
		action:loopAttack
	});
};


module.exports.clone = function(opts){
	return new Brain(opts.blackboard);
};

module.exports.name = 'tiger';
