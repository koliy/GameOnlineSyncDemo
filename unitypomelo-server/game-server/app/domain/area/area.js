var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../util/utils');
var MobZone = require('./../map/mobzone');
var NPC = require('./../entity/npc');
var dataApi = require('../../util/dataApi');
var pomelo = require('pomelo');
var channelUtil = require('../../util/channelUtil');
var EntityType = require('../../consts/consts').EntityType;
var aoiManager = require("../aoi/aoiService");
var aoiEventManager = require('../aoi/aoiEventManager');
var eventManager = require('./../event/eventManger');
var ActionManager = require('./../action/actionManager');
var ai = require('../../ai/ai');
var patrol = require('../../ai/patrol/patrol');

var Timer = require('./timer');


var Instance = function(opts){
	this.areaId = opts.id;
	this.type = opts.type;
	this.map = opts.map;
	
	//The map from player to entity
	this.players = {};
	this.users = {};
	this.entities = {};
	this.zones = {};
	this.items = {};
	this.channel = null;
	
	this.playerNum = 0;
	this.emptyTime = Date.now();
	this.aoi = aoiManager.getService(opts);
	this.actionManager = new ActionManager();
	this.aiManager = ai.createManager({area:this});
	this.patrolManager = patrol.createManager();
	
	this.timer = new Timer({
		area:this,
		interval:100
	});
	
	this.start();
};

module.exports = Instance;

Instance.prototype.start = function(){
	aoiEventManager.addEvent(this,this.aoi.aoi);
	
	this.initMobZones(this.map.getMobZones());
	this.initNPCs();
	
	this.aiManager.start();
	this.timer.run();
};

Instance.prototype.close = function(){
	this.timer.close();
};

/**
 * 初始怪物数据
 * @param mobZones
 */
Instance.prototype.initMobZones = function(mobZones){
	//mobZones.length =1;
	for(var i =0;i<mobZones.length;i++){
		var opts = mobZones[i];
		opts.area = this;
		var zone = new MobZone(opts);
		this.zones[zone.zoneId]=zone;
	}
};

/**
 * 初始化NPC数据
 */
Instance.prototype.initNPCs = function(){
	var npcs = this.map.getNPCs();
	for(var i =0;i<npcs.length;i++){
		var data = npcs[i];
		data.kindId = data.id;
		var npcInfo = dataApi.npc.findById(data.kindId);
		data.kindName = npcInfo.name;
		data.englishName = npcInfo.englishName;
		data.kindType = npcInfo.kindType;
		data.orientation = data.orientation;
		data.areaId = this.id;
		var npc = new NPC(data);
		this.addEntity(npc);
	}
};

Instance.prototype.addEntity = function(e){
	var entities = this.entities;
	var players = this.players;
	var users = this.users;
	
	if(!e || !e.entityId) return false;
	
	if(!!players[e.id]){
		logger.error('add player twice! player :%j',e);
		return false;
	}
	
	e.area = this;
	entities[e.entityId] = e;
	eventManager.addEvent(e);//添加监听事件
	
	
	if(e.type === EntityType.PLAYER){
		this.getChannel().add(e.userId,e.serverId);
		this.aiManager.addCharacters([e]);//添加AI行为，根据客户端上传的目标id，AI执行相应的策略
		this.aoi.addWatcher({id:e.entityId,type:e.type},{x:e.x,y:e.y},e.range);
		
		players[e.id] = e.entityId;
		users[e.userId] = e.id;
		
		this.playerNum++;
		
	}else if(e.type === EntityType.MOB){
		this.aiManager.addCharacters([e]);
		this.aoi.addWatcher({id:e.entityId,type:e.type},{x:e.x,y:e.y},e.range)
	}else if(e.type === EntityType.ITEM){
		this.items[e.entityId] = e.entityId;
	}else if(e.type === EntityType.EQUIPMENT){
		this.items[e.entityId] = e.entityId;
	}
	
	this.aoi.addObject({id:e.entityId,type:e.type},{x:e.x,y:e.y});
	return true;
};

Instance.prototype.removeEntity = function(entityId){
	var zones = this.zones;
	var entities = this.entities;
	var players = this.players;
	var users = this.users;
	var items = this.items;
	
	var e = entities[entityId];
	if(!e) return true;
	
	if(!!zones[e.zoneId]) zones[e.zoneId].remove(entityId);
	
	if(e.type=== 'player'){
		this.getChannel().leave(e.userId,pomelo.app.getServerId());
		this.aiManager.removeCharacter(e.entityId);
		this.patrolManager.removeCharacter(e.entityId);
		this.aoi.removeObject({id:e.entityId,type:e.type},{x:e.x,y:e.y});
		
		this.aoi.removeWatcher({id:e.entityId,type:e.type},{x:e.x,y:e.y},e.range);
		this.actionManager.abortAllAction(entityId);
		
		delete players[e.id];
		delete users[e.userId];
		
		this.playerNum--;
		if(this.playerNum === 0) this.emptyTime = Date.now();
		
		delete entities[entityId];
	}else if(e.type === 'mob'){
		this.aiManager.removeCharacter(e.entityId);
		this.patrolManager.removeCharacter(e.entityId);
		this.aoi.removeObject({id:e.entityId,type:e.type},{x:e.x,y:e.y});
		
		this.aoi.removeWatcher({id:e.entityId,type:e.type},{x:e.x,y:e.y},e.range);
		this.actionManager.abortAllAction(entityId);
		
		delete entities[entityId];
	}
	
	return true;
};


Instance.prototype.getAllEntities = function(){
	return this.entities;
};

Instance.prototype.getEntities = function(ids){
	var result = {};
	result.length = 0;
	for(var i =0;i<ids.length;i++){
		var entity = this.entities[ids[i]];

		if(!!entity){
			if(!result[entity.type]) result[entity.type] = [];
			result[entity.type].push(entity);
			result.length++;
		}
	}
	
	return result;
};


Instance.prototype.getPlayer = function(playerId){
	var entityId = this.players[playerId];
	if(!!entityId) return this.entities[entityId];
	
	return null;
};

Instance.prototype.removePlayer = function(playerId) {
	var entityId = this.players[playerId];
	
	if(!!entityId) {
		this.removeEntity(entityId);
	}
};

Instance.prototype.getAreaInfo = function(pos,range){
	var ids = this.aoi.getIdsByPos(pos,range);
	return this.getEntities(ids);
};

Instance.prototype.getChannel= function(){
	if(!this.channel){
		var channelName = channelUtil.getAreaChannelName(this.areaId);
		console.log('channelName = ',channelName);
		this.channel = pomelo.app.get('channelService').getChannel(channelName,true);
	}
	
	//console.log('this.channel = ',this.channel);
	return this.channel;
};

Instance.prototype.getEntity =function(entityId){
	var entity = this.entities[entityId];
	if(!entity) return null;
	return entity;
};



