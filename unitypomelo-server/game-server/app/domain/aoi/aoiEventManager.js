var EntityType = require('../../consts/consts').EntityType;
var logger = require('pomelo-logger').getLogger(__filename);
var utils =require('../../util/utils');
var messageService = require('../messageService');

var exp = module.exports;

exp.addEvent = function(area,aoi){
	aoi.on('add',function(params){
		params.area = area;
		switch(params.type){
			case EntityType.PLAYER:
				onPlayerAdd(params);
				break;
			case EntityType.MOB:
				onMobAdd(params);
				break;
				
		}
	});
	
	aoi.on('remove',function(params){
		params.area = area;
		switch(params.type){
			case EntityType.PLAYER:
				onPlayerRemove(params);
				break;
			case EntityType.MOB:
				break;
			
		}
	});
	//向关注此tower下的watcher进行对象的添加或移出。
	aoi.on('update',function(params){
		params.area = area;
		switch(params.type){
			case EntityType.PLAYER:
				onObjectUpdate(params);
				break;
			case EntityType.MOB:
				onObjectUpdate(params);
				break;
			
		}
	});
	//对对象所关注的各个tower，进行tower下对象的添加或移除
	aoi.on('updateWatcher',function(params){
		params.area = area;
		switch(params.type){
			case EntityType.PLAYER:
				onPlayerUpdate(params);
				break;
		}
	});
};


function onPlayerAdd(params){
	var area = params.area;
	var watchers = params.watchers;
	var entityId = params.id;
	var player = area.getEntity(entityId);
	
	if(!player) return;
	var uids = [],id;
	for(var type in watchers){
		switch (type){
			case EntityType.PLAYER:
				for(id in watchers[type]){
					var watcher = area.getEntity(watchers[type][id]);
					if(watcher && watcher.entityId !== entityId) uids.push({sid:watcher.serverId,uid:watcher.userId});
				}
				if(uids.length>0) onAddEntity(uids,player);
				break;
		}
	}
	
}

function onAddEntity(uids,entity){
	var entities ={};
	entities[entity.type]=[entity];
	messageService.pushMessageByUids(uids,'onAddEntities',entities);
	
	if(entity.type === EntityType.PLAYER){
		console.log('entities = ',JSON.stringify(entities));
	}
}

function onPlayerRemove(params){
	var area = params.area;
	var watchers = params.watchers;
	var entityId = params.id;
	
	var uids = [];
	for(var type in watchers){
		switch (type){
			case EntityType.PLAYER:
				var watcher;
				for(var id in watchers[type]){
					watcher = area.getEntity(watchers[type][id]);
					if(watcher && entityId !== watcher.entityId) uids.push({sid:watcher.serverId,uid:watcher.userId});
				}
				
				onRemoveEntity(uids,entityId);
				break;
		}
	}
}

function onRemoveEntity(uids,entityId){
	if(uids.length<= 0) return;
	messageService.pushMessageByUids(uids,'onRemoveEntities',{entities:[entityId]});
}

/**
 *
 * @param params
 */
function onObjectUpdate(params){
	var area = params.area;
	var entityId = params.id;
	var entity = area.getEntity(entityId);
	if(!entity) return;
	
	var oldWatchers = params.oldWatchers;
	var newWatchers = params.newWatchers;
	var removeWatchers = {},addWatchers ={},type,w1,w2,id;
	
	//找出只关注旧区域，不关注新区域内的watcher,进行对象移除
	for(type in oldWatchers){
		
		if(!newWatchers[type]) {
			removeWatchers[type] = oldWatchers[type];
			continue;
		}
		w1 = oldWatchers[type];
		w2 = newWatchers[type];
		removeWatchers[type] ={};
		for(id in w1){
			if(!w2[id]) removeWatchers[type][id] = w1[id];
		}
	}
	
	//找出只关注新区域，不关注旧区域的watcher，进行对象添加
	for(type in newWatchers){
		if(!oldWatchers[type]){
			addWatchers[type] = newWatchers[type];
			continue;
		}
		
		w1 = oldWatchers[type];
		w2 = newWatchers[type];
		addWatchers[type]={};
		for(id in w2){
			if(!w1[id]) addWatchers[type][id]=w2[id];
		}
	}

	switch(params.type){
		case EntityType.PLAYER:{
			onPlayerAdd({area:area,id:params.id,watchers:addWatchers});
			onPlayerRemove({area:area,id:params.id,watchers:removeWatchers});
			break;
		}
		case EntityType.MOB:{
			onMobAdd({area:area, id:params.id, watchers:addWatchers});
			onMobRemove({area:area, id:params.id, watchers:removeWatchers});
			break;
		}
	}
}

/**
 * 通知对象，需要添加或移出的物体
 * @param params
 */
function onPlayerUpdate(params){
	var area = params.area;
	var player = area.getEntity(params.id);
	if(player.type !== EntityType.PLAYER) return;
	
	var uid = {sid:player.serverId,uid:player.userId};
	if(params.removeObjs.length > 0) messageService.pushMessageToPlayer(uid,'onRemoveEntities',{'entities':params.removeObjs});
	

	if(params.addObjs.length > 0){
		var entities = area.getEntities(params.addObjs);
		if(!!entities && entities.length > 0) messageService.pushMessageToPlayer(uid,'onAddEntities',entities);
	}
	
}

function onMobAdd(params){
	var area = params.area;
	var watchers = params.watchers;
	var entityId = params.id;
	var mob = area.getEntity(entityId);
	if(!mob) return;
	var uids =[];
	for(var id in watchers[EntityType.PLAYER]){
		var watcher = area.getEntity(watchers[EntityType.PLAYER][id]);
		if(!!watcher) uids.push({sid:watcher.serverId,uid:watcher.userId});
	}
	
	if(uids.length > 0) onAddEntity(uids,mob);
}

function onMobRemove(params){
	var area = params.area;
	var watchers = params.watchers;
	var entityId = params.id;
	var uids =[];
	
	for(var type in watchers){
		switch(type){
			case EntityType.PLAYER:{
				for(var id in watchers[type]){
					var watcher = area.getEntity(watchers[type][id]);
					if(!!watcher) uids.push({sid:watcher.serverId,uid:watcher.userId});
				}
				if(uids.length > 0) onRemoveEntity(uids,entityId);
				break;
			}
			
		}
	}
	
}