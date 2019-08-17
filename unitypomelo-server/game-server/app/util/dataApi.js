var character = require('../../config/data/character');
var experience = require('../../config/data/experience');
var role = require('../../config/data/role');
var npc = require('../../config/data/npc');
var item =require('../../config/data/item');
var equipment = require('../../config/data/equipment');
var area = require('../../config/data/area');
var fightskill = require('../../config/data/fightskill');
var talk = require('../../config/data/talk');

var Data = function(data){
	var fields = {};
	data[1].forEach(function(i,k){
		fields[i]=k;
	});
	
	data.splice(0,2);
	var result = {},item;
	data.forEach(function(k){
		item = mapData(fields,k);
		result[item.id] = item;
	});
	this.data = result;
};

var mapData = function(fields,item){
	var obj = {};
	for(var k in fields){
		obj[k] = item[fields[k]];
	}
	return obj;
};

Data.prototype.findBy = function(attr,value){
	var result = [];
	var i, item;
	for(i in this.data){
		item = this.data[i];
		if(item[attr] == value){
			result.push(item);
		}
	}
	return result;
};

Data.prototype.findById= function(id){
	return this.data[id];
};

Data.prototype.all = function(){
	return this.data;
};

module.exports = {
	area:new Data(area),
	character:new Data(character),
	npc:new Data(npc),
	item:new Data(item),
	equipment:new Data(equipment),
	experience:new Data(experience),
	role:new Data(role),
	fightskill:new Data(fightskill),
	talk:new Data(talk)
};