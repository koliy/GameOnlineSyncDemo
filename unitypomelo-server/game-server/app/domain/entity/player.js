var util = require('util');
var dataApi = require('../../util/dataApi');
var Character = require('./character');
var EntityType = require('../../consts/consts').EntityType;
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('../../util/utils');

var Player = function(opts){
	Character.call(this,opts);
	this.id = Number(opts.id);
	this.type = EntityType.PLAYER;
	this.userId = opts.userId;
	this.name = opts.name;
	this.equipments = opts.equipments;
	this.bag = opts.bag;
	this.skillPoint = opts.skillPoint || 0;
	var _exp = dataApi.experience.findById(this.level+1);
	if(!!_exp) this.nextLevelExp = dataApi.experience.findById(this.level+1).exp;
	else this.nextLevelExp = 999999999;
	
	this.roleData = dataApi.role.findById(this.kindId);
	this.range = opts.range ||2; //
	this.curTasks = opts.curTasks;
	//玩家队伍ID
	this.teamId = 0;
	//队长标志
	this.isCaptain = 0;
	this.isInTeamInstance  = false;
	this.instanceId = 0;
	
};

util.inherits(Player,Character);

module.exports = Player;

Player.prototype.afterDied = function(){
	this.emit('died',this);
};

//Add experience add Drop out items after it kills mob
Player.prototype.afterKill = function(target) {
	var items = null;
	if (target.type === EntityType.MOB) {
		this.addExperience(10);
		items = target.dropItems(this);
	}
	return items;
};

//Add experience
Player.prototype.addExperience = function(exp) {
	this.experience += exp;
	if (this.experience >= this.nextLevelExp) {
		//this.upgrade();
	}
	this.save();
};
Player.prototype.toJSON = function(){
	return {
		id:this.id,
		entityId:this.entityId,
		name:this.name,
		kindId:this.kindId,
		kindName:this.kindName,
		type:this.type,
		x:this.x,
		y:this.y,
		hp:this.hp,
		mp:this.mp,
		maxHp:this.maxHp,
		maxMap:this.maxMp,
		level:this.level,
		walkSpeed:this.walkSpeed,
		areaId:this.areaId,
		range:this.range,
		teamId:this.teamId,
		isCaptain:this.isCaptain
	};
};

Player.prototype.strip = function(){
	return {
		id:this.id,
		entityId:this.entityId,
		name:this.name,
		kindId:this.kindId,
		kindName: this.kindName,
		type: this.type,
		x: Math.floor(this.x),
		y: Math.floor(this.y),
		hp: this.hp,
		mp: this.mp,
		maxHp: this.maxHp,
		maxMp: this.maxMp,
		level: this.level,
		range: this.range,
		experience: this.experience,
		attackValue: this.attackValue,
		defenceValue: this.defenceValue,
		walkSpeed: this.walkSpeed,
		attackSpeed: this.attackSpeed,
		areaId: this.areaId,
		hitRate: this.hitRate,
		dodgeRate: this.dodgeRate,
		nextLevelExp: this.nextLevelExp,
		skillPoint: this.skillPoint,
		teamId: this.teamId,
		isCaptain: this.isCaptain
	};
};


Player.prototype.getInfo = function(){
	var playerData = this.strip();
	playerData.bag = {};
	playerData.equipments ={};
	playerData.fightSkills = {};
	playerData.curTasks = {};
	return playerData;
};

// Emit the event 'save'.
Player.prototype.save = function() {
	this.emit('save');
};