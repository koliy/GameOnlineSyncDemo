var app = require('pomelo').app;
var dataApi = require('../../../util/dataApi');
var EntityType = require("../../../consts/consts").EntityType;
var fs = require('fs');

var handler = module.exports;

var _getFileVersion = function(path){
	return (new Date(fs.statSync(path).mtime)).getTime();
};

var version ={
	fightskill:_getFileVersion('./config/data/fightskill.json'),
	equipment: _getFileVersion('./config/data/equipment.json'),
	item:_getFileVersion('./config/data/item.json'),
	character:_getFileVersion('./config/data/character.json'),
	npc:_getFileVersion('./config/data/npc.json')
};

handler.loadResource = function(msg,session,next){
	var data = {};
	
	if(msg.version.character !== version.character){
		data.character = dataApi.character.all();
	}
	
	if(msg.version.npc !== version.npc){
		data.npc = dataApi.npc.all();
	}
	if(msg.version.item !== version.item){
		data.item = dataApi.item.all();
	}
	if (msg.version.equipment !== version.equipment) {
		data.equipment = dataApi.equipment.all();
	}
	
	next(null,{
		data:data,
		version:version
	});
};

handler.loadAreaResource = function(msg,session,next){
	var entities = session.area.getAllEntities(); //session.area，每次由filter设置,获取对应area服务器的数据
	var players = {},mobs = {},npcs ={},items ={},equips = {};
	var i,e;
	
	for(i in entities){
		e = entities[i];
		if(e.type === EntityType.PLAYER){
			if(!players[e.kindId]) players[e.kindId] = 1;
		}else if(e.type === EntityType.MOB) {
			if(!mobs[e.kindId]) mobs[e.kindId] = 1;
		}else if(e.type === EntityType.NPC) {
			if (!npcs[e.kindId]) npcs[e.kindId] = 1;
		}else if(e.type === EntityType.ITEM){
			if(!items[e.kindId]) items[e.kindId] = 1;
		}else if(e.type === EntityType.EQUIPMENT)
			if(!equips[e.kindId]) equips[e.kindId] = 1;
	}
	
	next(null,{
		players:Object.keys(players),
		mobs:Object.keys(mobs),
		npcs:Object.keys(npcs),
		items:Object.keys(items),
		equipments:Object.keys(equips),
		mapName:session.area.map.name
	});

};





