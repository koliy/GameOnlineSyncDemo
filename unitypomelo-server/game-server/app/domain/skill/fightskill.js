var dataApi = require('../../util/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var logger =require('pomelo-logger').getLogger(__filename);

var FightSkill = function(opts){
	this.skillId = opts.skillId;
	this.level = opts.level;
	this.playerId = opts.playerId;
	this.skillData = dataApi.fightskill.findById(this.skillId);
	this.name = this.skillData.name;
	this.coolDownTime =0;
	
};

FightSkill.prototype.judge = function(attacker,target){
	if(!formula.inRange(attacker,target,this.skillData.distance)){
		return {result:consts.AttackResult.NOT_IN_RANGE,distance:this.skillData.distance};
	}
	
	if(this.coolDownTime > Date.now()){
		return {result:consts.AttackResult.NOT_COOLDOWN};
	}
	
	if(this.mp < this.skillData.mp){
		return {result:consts.AttackResult.NO_ENOUGH_MP};
	}
	
	return {result:consts.AttackResult.SUCCESS};
};

module.exports = FightSkill;