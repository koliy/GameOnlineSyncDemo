var consts = require('../../consts/consts');
var messageService = require('../messageService');
var logger = require('pomelo-logger').getLogger(__filename);
var dataApi = require('../../util/dataApi');

var exp = module.exports;

exp.addEventForNpc = function (npc) {
	npc.on('onNPCTalk',function(data){
		var npc = data.npc;
		var player = data.player;
		var talk = dataApi.talk;
		var npcTalks = talk.findBy('npc',npc.kindId);
		var npcword = '很高兴见到你,有什么事吗?';
		var myword = '没有,再见!'
		
		if(!!npcTalks && npcTalks.length>0){
			npcword = npcTalks[0].npcword;
			myword = npcTalks[0].myword;
		}
		
		var msg ={
			npc:npc.entityId,
			npcword:npcword,
			myword:myword,
			player:player.entityId,
			kindId:npc.kindId
		};
		//是否传送npc
		if(consts.TraverseNpc[npc.kindId]){
			npc.changeArea('onNPCTalk',msg);
			return;
		}
		//发送给对应玩家
		messageService.pushMessageToPlayer({uid:player.userId,sid:player.serverId},'onNPCTalk',msg);
	});
};