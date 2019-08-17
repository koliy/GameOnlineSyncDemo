var pomelo =require('pomelo');
var util= require('util');
var dataApi = require('../../util/dataApi');
var utils= require('../../util/utils');
var Entity = require('./entity');
var consts = require('../../consts/consts');
var AttackSkill = require('../skill/attackskill');

var logger = require('pomelo-logger').getLogger(__filename);

var Character = function(opts){
	Entity.call(this,opts);
	this.orientation = opts.orientation;
	this.target = null;
	this.attackers ={};
	//对我发生仇恨的实体对象组,目的是当我消失或者死亡时，通知对方
	this.enemies = {};
	//我仇恨的实体对象，对应的是仇恨值最大的对象
	this.haters = {};
	
	this.died = false;
	this.hp = opts.hp;
	this.mp = opts.mp;
	this.maxHp = opts.maxHp;
	this.maxMp = opts.maxMp;
	this.level = opts.level;
	this.experience = opts.experience;
	this.attackValue = opts.attackValue;
	this.defenceValue = opts.defenceValue;
	this.totalAttackValue = opts.totalAttackValue || 0;
	this.totalDefenceValue = opts.totalDefenceValue || 0;
	this.hitRate = opts.hitRate;
	this.dodgeRate = opts.dodgeRate;
	this.walkSpeed = opts.walkSpeed;
	this.attackSpeed = opts.attackSpeed;
	this.isMoving = false;
	
	this.attackParam = 1;
	this.defenceParam = 1;
	this.equipmentParam = 1;
	this.buffs =[];
	this.curSkill =1;
	this.characterData = dataApi.character.findById(this.kindId); //保存初始角色职业属性
	this.fightSkills={};
	this.fightSkills[1] = new AttackSkill({skillId:1});
};

util.inherits(Character,Entity);

module.exports = Character;


Character.prototype.forgetHater = function(){};

Character.prototype.setTarget = function(targetId){
	this.target = targetId;
};

Character.prototype.addEnemy = function(entityId){
	this.enemies[entityId] =1;
};
Character.prototype.forEachEnemy = function(callback) {
	var enemy;
	for(var enemyId in this.enemies) {
		enemy = this.area.getEntity(enemyId);
		if(!enemy) {
			delete this.enemies[enemyId];
			continue;
		}
		callback(enemy);
	}
};
Character.prototype.forgetEnemy =function(entityId){
	delete this.enemies[entityId];
};

Character.prototype.increaseHateFor = function(){};

Character.prototype.hasTarget = function(){
	return !!this.target;
};

Character.prototype.clearTarget = function(){
	this.target = null;
};

Character.prototype.clearHaters = function() {
	this.haters = {};
};

Character.prototype.hit = function(attacker,damage){
	this.increaseHateFor(attacker.entityId);
	this.reduceHp(damage);
};

Character.prototype.reduceHp = function(damage){
	this.hp -= damage;
	this.hp = Math.max(0,this.hp);
	if(this.hp <= 0){
		this.died = true;
		this.afterDied();
	}
};

Character.prototype.reduceMp = function(mp) {
	this.mp -= mp;
	if (this.mp <= 0) {
		this.mp = 0;
	}
};

Character.prototype.getAttackValue = function() {
	return this.attackValue * this.attackParam;
};

Character.prototype.getDefenceValue = function() {
	return this.defenceValue * this.defenceParam;
};

Character.prototype.move = function(targetX,targetY,useCache,cb) {
	useCahce = useCache || false;
	if (useCache) {
		
		var paths = this.area.map.findPath(this.x, this.y, targetX, targetY, useCache);
		if (!!paths) {
			this.emit('move', {character: this, paths: paths});
			utils.invokeCallback(cb, null, true);
		} else {
			logger.warn('No path exist! {x: %j, y: %j} , target: {x: %j, y: %j} ', this.x, this.y, targetX, targetY);
			utils.invokeCallback(cb, 'find path error', false);
		}
	} else {
		var closure = this;
		pomelo.app.rpc.path.pathFindingRemote.findPath(null, {
				areaId: this.areaId,
				start: {x: this.x, y: this.y},
				end: {x: targetX, y: targetY}
			},
			function (err, paths) {
				if (!!paths) {
					closure.emit('move', {character: closure, paths: paths});
					utils.invokeCallback(cb, null, true);
				} else {
					logger.warn('Remote find path failed! No path exist! {x: %j, y: %j} , target: {x: %j, y: %j} ', closure.x, closure.y, targetX, targetY);
					utils.invokeCallback(cb, 'find path error', false);
				}
			});
		
	}
	
};


Character.prototype.attack = function(target,skillId){
	
	if(target.died){
		return {result:consts.AttackResult.KILLED};
	}
	
	var skill = this.fightSkills[skillId];
	this.setTarget(target.entityId);
	
	this.addEnemy(target.entityId);
	var result = skill.use(this,target);

	this.emit('attack',{
		attacker:this,
		target:target,
		skillId:skillId,
		result:result
	});
	
	return result;
};
















