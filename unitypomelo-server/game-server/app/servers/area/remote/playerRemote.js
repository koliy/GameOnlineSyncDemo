var pomelo = require('pomelo');
var consts = require('../../../consts/consts');
var utils = require('../../../util/utils');
var userDao = require('../../../dao/userDao');
var logger = require('pomelo-logger').getLogger(__filename);
var messageService = require('../../../domain/messageService');

var exp = module.exports;

exp.playerLeave =function(args,cb){
	var playerId = args.playerId;
	var area = pomelo.app.areaManager.getArea(args.instanceId); //场景，或副本区分
	var player = area.getPlayer(playerId);
	
	console.log('0 ~ area type = ',area.type);
	console.log('1 ~ areaId = ',area.areaId);
	console.log('2 ~ instanceId = ',args.instanceId);
	console.log('3 ~ args = ',JSON.stringify(args));
	
	if(!player){
		logger.warn('player not in the area ! %j',args);
		utils.invokeCallback(cb);
		return;
	}
	
	var sceneId = player.areaId;
	//重登后复活
	if(player.hp === 0) player.hp = Math.floor(player.maxHp /2);
	if(area.type != consts.AreaType.SCENE){
		var pos = area.getBornPoint(sceneId);
		player.x = pos.x;
		player.y = pos.y;
	}
	
	userDao.updatePlayer(player);
	area.removePlayer(playerId);
	//向通道中的所有成员推送消息
	area.channel.pushMessage({route:'onUserLeave',code:200,playerId:playerId});
	utils.invokeCallback(cb);
};