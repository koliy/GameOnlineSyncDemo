var util =require('util');
var consts = require('../../consts/consts');
var FightSkill = require('./fightskill');

var AttackSkill = function(opts){
	FightSkill.call(this,opts);
	
};

util.inherits(AttackSkill,FightSkill);

module.exports = AttackSkill;

AttackSkill.prototype.use = function(attacker,target){
	//检测cd，攻击范围,耗蓝
	var res = this.judge(attacker,target);
	if(res.result !== consts.AttackResult.SUCCESS) return res;
	
	return attack(attacker,target,this);
};

var attack = function(attacker,target,skill){
	if(attacker.entityId === target.entityId) return {result:consts.AttackResult.ERROR};
	var atk = attacker.attackValue;
	var def = target.defenceValue;
	
	var damageValue =Math.max(1,Math.ceil(atk-def)) ;

	target.hit(attacker,damageValue); //受击进入AI状态
	attacker.reduceMp(skill.skillData.mp);
	if(!!target.save) target.save();
	if(!!attacker.save && skill.skillId > 1) attacker.save();
	//默认普通攻击
	if(skill.skillId ==1){
		skill.coolDownTime = Date.now() + Number(skill.skillData.cooltime / attacker.attackSpeed * 1000);
	}else{
		skill.coolDownTime = Date.now() + Number(skill.skillData.cooltime)* 1000;
	}
	skill.skillData.mp = skill.skillData.mp == ""?0:skill.skillData.mp;
	if(target.died){
		var items = attacker.afterKill(target);
		return {result: consts.AttackResult.KILLED, damage: damageValue, mpUse: skill.skillData.mp, items: items};
	} else{
		return {result: consts.AttackResult.SUCCESS, damage: damageValue, mpUse: skill.skillData.mp};
	}
	
};