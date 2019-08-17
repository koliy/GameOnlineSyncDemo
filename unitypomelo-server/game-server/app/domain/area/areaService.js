var dataApi = require('../../util/dataApi');
var utils = require('../../util/utils');
var pomelo = require('pomelo');
var userDao = require('../../dao/userDao');
var Map = require('../map/map');
var logger = require('pomelo-logger').getLogger(__filename);

var maps ={};
var exp = module.exports;

exp.init = function(){
	var areas = dataApi.area.all();
	
	for(var key in areas){
		var area = areas[key];
		area.weightMap = false;//不初始化碰撞区域，只获取地图基本数据
		maps[area.id] = new Map(area);
	}
};

exp.getBornPlace = function(sceneId){
	return maps[sceneId].getBornPlace();
};

exp.getBornPoint = function(sceneId){
	return maps[sceneId].getBornPoint();
};
/**
 * 修改session，为切换场景做前期数据准备
 * @param args
 * @param session
 * @param cb
 */
exp.changerArea = function(args,session,cb){
	var  app = pomelo.app;
	var area = session.area;
	var playerId = args.playerId;
	var target = args.target;
	var player = area.getPlayer(playerId);
	
	var targetInfo = dataApi.area.findById(target); //["2","oasis",1,"绿洲",20,6000,4000,"/config/map/oasis.json",300,300],
	//判断是1: 场景, 2:竞技场，3:副本
	if(targetInfo.type === 1){
		area.removePlayer(playerId);//清除当前area中玩家的数据，以及AI逻辑
		
		var pos = this.getBornPoint(target);
		
		player.areaId = target;
		player.isInTeamInstance = false;
		player.instanceId = 0;
		player.x = pos.x;//设置新场景出生点
		player.y = pos.y;
		
		
		//save mysql
		userDao.updatePlayer(player,function(err,success){
			if(err || !success){
				err = err || "update player failed";
				utils.invokeCallback(cb,err);
			}else{
				
				session.set('areaId',target);
				session.set('serverId',app.get('areaIdMap')[target]);//修改area服务器id，route访问选择area
				session.set('teamId',player.teamId);
				session.set('isCaptain',player.teamId);
				session.set('instanceId',player.instanceId);
				session.pushAll(function(err){
					if(err) logger.error('Change area for session service failed! error is :%j ',err.stack);
					utils.invokeCallback(cb,null);

				});
			}
		});
	}
	
	
};