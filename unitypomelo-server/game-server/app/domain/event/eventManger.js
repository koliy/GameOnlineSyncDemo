var EntityType = require('../../consts/consts').EntityType;
var pomelo = require("pomelo");
var characterEvent = require('./characterEvent');
var playerEvent = require('./playerEvent');
var npcEvent = require('./npcEvent');

var exp = module.exports;


exp.addEvent = function(entity){
	switch(entity.type){
		case EntityType.PLAYER:{
			playerEvent.addEventForPlayer(entity);
			characterEvent.addEventForCharacter(entity);
			addSaveEvent(entity);
			break;
		}
		case EntityType.MOB:{
			characterEvent.addEventForCharacter(entity);
			break;
		}
		case EntityType.NPC:{
			npcEvent.addEventForNpc(entity);
			break;
		}
	}
};

function addSaveEvent(player){
	var app = pomelo.app;
	player.on('save',function(){ //添加异步定时执行的数据库更新操作
		app.get('sync').exec('playerSync.updatePlayer',player.id,player.strip());
	});
}



