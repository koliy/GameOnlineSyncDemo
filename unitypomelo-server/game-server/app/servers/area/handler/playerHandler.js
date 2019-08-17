var utils = require("../../../util/utils");
var pomelo = require("pomelo");
var consts = require('../../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);
var userDao = require('../../../dao/userDao');
var Move = require('../../../domain/action/move');
var messageService = require('../../../domain/messageService');
var areaService =require('../../../domain/area/areaService');

var handler = module.exports;

handler.enterScene =function(msg,session,next){
	var area = session.area; //area服务器的filter设置
	var playerId = session.get('playerId');
	var areaId = session.get('areaId');
	
	var teamId = session.get('teamId') || 0;
	var isCaptain = session.get('isCaptain');
	var isInTeamInstance = session.get('isInTeamInstance');
	var instanceId = session.get('instanceId');
	
	console.log('1 ~ EnterScene: areaId = ',areaId);
	console.log('1 ~ EnterScene: playerId = ',playerId);
	console.log('1 ~ EnterScene: teamId = ',teamId);
	
	//获取用户的基本数据:装备，背包，技能，任务
	userDao.getPlayerAllInfo(playerId,function(err,player){
		
		if(err || !player){
			logger.error('Get user for userDao failed! '+err.stack);
			next(new Error('fail to get user from dao'),{
				route:msg.route,
				code:500
			});
			return ;
		}
		
		player.serverId = session.frontendId;
		player.teamId = teamId;
		player.isCaptain = isCaptain;
		player.isInTeamInstance = isInTeamInstance;
		player.instanceId = instanceId;
		areaId = player.areaId;
		
		console.log('2 ~ GetPlayerAllInfo: player instanceId = ',player.instanceId);
		
		//加入聊天渠道
		
		//当玩家当前坐标非可达时,重置玩家坐标
		var map = area.map;
		if(!map.isReachable(player.x,player.y)){
			var pos = map.getBornPoint();
			player.x = pos.x;
			player.y = pos.y;
		}
	
		
		var data = {
			entities:area.getAreaInfo({x:player.x,y:player.y},player.range),
			curPlayer:player.getInfo(),
			map:{
				name:map.name,
				width:map.width,
				height:map.height,
				tileW:map.tileW,
				tileH:map.tileH,
				weightMap:map.collisions
			}
		};
		
		next(null,data);
		console.log("2 ~ GetPlayerAllInfo player.teamId = ",player.teamId);
		console.log("2 ~ GetPlayerAllInfo player.isCaptain = ",player.isCaptain);

		 var isok = area.addEntity(player);
		
		if(!isok){
			logger.error("Add Player to area faild! areaId : "+player.areaId);
			next(new Error('fail to add user into area'),{route:msg.route,code:500});
			return ;
		}

	});
	
};


handler.changeView = function(msg,session,next){
	var timer = session.area.timer;
	var playerId = session.get('playerId');
	var width = msg.width;
	var height =msg.height;
	//求出最大范围,地图aoi灯塔大小不变默认是300为一个灯塔区域，人物的可视范围设置的是2 * range个灯塔区域，则计算的像素大小为
	//  2 * range * 300，这样求出，当前屏幕宽度内需要几个灯塔完全显示 r = w/s;
	var radius = width>height?width:height;
	var range = Math.ceil(radius/600);
	var player = session.area.getPlayer(playerId);
	if(range < 0 || !player){
		next(new Error('invalid range or player'));
		return;
	}

	//把玩家重新添加到对应范围内的watcher内
	if(player.range !== range){ //r范围有变化
		timer.updateWatcher({id:player.entityId,type:player.type},player,player,player.range,range);
		player.range = range;
	}

	next(null,{route:msg.route,code:200,range:player.range});
};

handler.move = function(msg,session,next){
	var area = session.area;
	var timer = area.timer;
	var path = msg.paths;
	var playerId = session.get('playerId');
	var player = area.getPlayer(playerId);
	var speed = player.walkSpeed;
	
	player.target = null;

	if(!area.map.verifyPath(path)){
		logger.warn('The path is illegal!! The path is:%j',path);
		next(null,{route:msg.route,code:500});
		return;
	}
	//创建一个单列行为，放入行为队列中，让时间片管理调度
	var action = new Move({
		entity:player,
		path:path,
		speed:speed
	});
	if(timer.addAction(action)){

		player.isMoving = true;
		
		//矫正初始位置的AOI区域，因物体在移动的时候有可能再次改变方向，坐标无法精准
		if(player.x !== path[0].x || player.y !== path[0].y) {
			
			timer.updateObject({id: player.entityId, type: consts.EntityType.PLAYER}, {
				x: player.x,
				y: player.y
			}, path[0]);
			timer.updateWatcher({id: player.entityId, type: consts.EntityType.PLAYER}, {
				x: player.x,
				y: player.y
			}, path[0], player.range, player.range);
		}
		
		//通知关注此节点下的watchers，当前对象需要移动更新onmove：路径为 path
		var ignoreList = {};
		ignoreList[player.userId] = true;

		messageService.pushMessageByAOI(area,{route:'onMove',entityId:player.entityId,path:path,speed:speed},path[0],ignoreList);
		
		next(null,{route:msg.route,code:200});
		return;
	}
	
	next(null,{});

};

handler.npcTalk = function(msg,session,next){
	var player = session.area.getPlayer(session.get('playerId'));
	player.target = msg.targetId; //设置玩家的交互目标，后续行为交给行为树AI处理
	next();
};

handler.changeArea = function(msg,session,next){
	var playerId = session.get("playerId");
	var areaId = msg.areaId;
	var target = msg.target;
	logger.debug("=========> areaId , target = ",areaId,target);
	if(areaId === target){
		next(null,{code:500});
		return;
	}
	
	var player = session.area.getPlayer(playerId);
	if(!player){
		next(null,{code:500});
		return;
	}
	//保存用户数据当前背包，装备等数据
	userDao.updatePlayer(player);
	
	var req = {
		areaId:areaId,
		target:target,
		uid:session.uid,
		playerId:playerId,
		frontendId:session.frontendId
	};
	
	areaService.changerArea(req,session,function(err){
		var args ={areaId:areaId,target:target,success:1};
		//发送给对应玩家
		messageService.pushMessageToPlayer({uid:player.userId,sid:player.serverId},'onChangeArea',args);
		
		next(null,args);

	});
	
};
