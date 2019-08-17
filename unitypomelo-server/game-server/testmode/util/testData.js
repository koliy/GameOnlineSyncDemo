var Mob = require('../../app/domain/entity/mob');
var Player = require('../../app/domain/entity/Player');

module.exports.getMob = function(){
	return new Mob({
		id: 2,
		name: 'tiger',
		x: 310,
		y: 490,
		orientation: 5,
		kindId: 208,
		characterName: 'Tiger',
		spawningX: 400,
		spawningY: 400,
		level: 2,
		armorLevel: 2,
		weaponLevel: 0
	});
};


module.exports.getPlayer = function() {
	return new Player({
		id: 1,
		name: 'xcc',
		x: 300,
		y: 500,
		orientation: 1,
		kindId: 1001,
		characterName: '神天兵',
		hp: 100,
		mp:30,
		maxHp: 100,
		maxMp: 30,
		gender: 'M',
		career: '剑客',
		country: '人',
		rank: 1,
		level: 2,
		experience: 40,
		attackValue: 30,
		defenceValue: 20,
		hitRate: 90,
		dodgeRate: 10,
		speed: 1,
		attackSpeed: 1,
		equipments: {}
	});
};