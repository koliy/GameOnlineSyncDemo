var consts = require('../../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);

var handler = module.exports;

handler.attack = function(msg,session,next){
	var player = session.area.getPlayer(session.get('playerId'));
	var target = session.area.getEntity(msg.targetId);
	
	if(!target || !player || (player.target === target.entityId) || (player.entityId === target.entityId)|| target.died){
		next(null,{});
		return;
	}
	
	session.area.timer.abortAction('move',player.entityId);
	player.target = target.entityId;//设置玩家的攻击目标，后续行为交给行为树AI处理

	next(null,{});
};