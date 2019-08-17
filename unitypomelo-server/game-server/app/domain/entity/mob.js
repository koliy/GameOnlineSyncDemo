var util = require('util');
var formula = require('../../consts/formula');
var EntityType = require('../../consts/consts').EntityType;
var Character = require('./character');
var dataApi = require('../../util/dataApi');
var logger = require('pomelo-logger').getLogger(__filename);
var Item = require('./item');

var Mob = function(opts){
	Character.call(this,opts);
	this.type = EntityType.MOB;
	this.spawningX = opts.x;
	this.spawningY = opts.y;
	this.level = Number(opts.level);
	this.armorLevel = opts.armorLevel;
	this.weaponLevel = opts.weaponLevel;
	this.zoneId = opts.zoneId;
	
	this.hp = formula.calMobValue(this.characterData.hp,this.level,this.characterData.upgradeParam);
	this.mp = formula.calMobValue(this.characterData.mp,this.level,this.characterData.upgradeParam);
	this.maxHp = this.hp;
	this.maxMp = this.mp;
	
	this.attackValue = formula.calMobValue(this.characterData.attackValue, this.level, this.characterData.upgradeParam);
	this.defenceValue = formula.calMobValue(this.characterData.defenceValue, this.level, this.characterData.upgradeParam);
	
	this.range = this.range || 0;
	
	
	this.setTotalAttackAndDefence();
};

util.inherits(Mob,Character);

module.exports = Mob;

Mob.prototype.setTotalAttackAndDefence = function() {
	this.totalAttackValue = this.getAttackValue();
	this.totalDefenceValue = this.getDefenceValue();
};

Mob.prototype.afterDied = function(){
	this.emit('died',this);
};
//Emit the event 'killed'
Mob.prototype.afterKill = function(target) {
	this.emit('killed', target);
};

Mob.prototype.dropItems = function(player) {
	var itemCount = 1;//Math.floor(Math.random()*2.1);
	var dropItems =[];
	for(var i =0;i<itemCount;i++){
		var itemType = Math.floor(Math.random()*10);
		//if(itemType >= 4)
		{
			var item = this._dropItem(player);
			if(!!item) dropItems.push(item);
		}
	}
	return dropItems;
};

Mob.prototype._dropItem = function(player){

	var pos = this.area.map.genPos(this,200);
	if(!pos){
		logger.warn('Generate position for drop item error!');
		return null;
	}
	
	var index = Math.floor(Math.random()*10);
	index = Math.max(index,1);
	var itemData = dataApi.item.findById(index);
	var dropItem = new Item({
		kindId:itemData.id,
		x:Math.floor(pos.x),
		y:Math.floor(pos.y),
		kindName:itemData.name,
		englishName : itemData.englishName,
		name: itemData.name,
		desc : itemData.desc,
		englishDesc : itemData.englishDesc,
		kind : itemData.kind,
		hp : itemData.hp,
		mp : itemData.mp,
		price : itemData.price,
		playerId: player.id,
		imgId: itemData.imgId,
		heroLevel: itemData.heroLevel
	});
	
	return dropItem;
};

Mob.prototype.hit = function(attacker,damage){
	Character.prototype.hit.call(this,attacker,damage);
	this.increaseHateFor(attacker.entityId,5);
};

Mob.prototype.increaseHateFor = function(entityId,points){
	this.target = entityId;
	this.area.timer.enterAI(this.entityId);
};

// Forget the hater
Mob.prototype.forgetHater = function(entityId) {
	if(this.haters[entityId]) {
		delete this.haters[entityId];
	}
	this.target = null;
};

Mob.prototype.toJSON = function() {
	return {
		id: this.id,
		entityId: this.entityId,
		kindId: this.kindId,
		kindName: this.kindName,
		englishName: this.englishName,
		x: this.x,
		y: this.y,
		hp: this.hp,
		mp: this.mp,
		maxHp: this.maxHp,
		maxMp: this.maxMp,
		type: this.type,
		level: this.level,
		zoneId: this.zoneId,
		range:this.range,
		walkSpeed: this.walkSpeed
	};
};