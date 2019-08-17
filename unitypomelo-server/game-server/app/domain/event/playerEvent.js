var consts = require('../../consts/consts');
var messageService = require('../messageService');
var logger = require('pomelo-logger').getLogger(__filename);
var exp = module.exports;

/**
 * 处理玩家事件，监听player.js类的状态
 * @param player
 */
exp.addEventForPlayer = function(player){
	//玩家升级
	player.on('upgrade',function(){
		logger.debug('event.onUpgrade: %j id: %j',player.level,player.id);
	});
	
	player.on('pickItem',function(args){
		logger.debug('event.pickItem');
	});
};