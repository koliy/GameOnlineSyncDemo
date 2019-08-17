var EntityType = require('../../consts/consts').EntityType;
var logger = require('pomelo-logger').getLogger(__filename);
var messageService = require('./../messageService');
var consts = require('../../consts/consts');
var Move = require('../action/move');
var Revive =require('../action/revive');

var exp = module.exports;

exp.addEventForCharacter = function(character) {
	character.on('move',function(args){
		var character = args.character;
		var area = character.area;
		var speed = character.walkSpeed;
		var paths = args.paths;
		var action = new Move({
			entity:character,
			path:paths.path,
			speed:speed
		});
		
		if(area.timer.addAction(action)){
			messageService.pushMessageByAOI(area,{
				route:'onMove',
				entityId:character.entityId,
				path:paths.path,
				speed:speed
			},{x:character.x,y:character.y});
		}
	});
	
	
	character.on('attack',function(args){
		var result = args.result;
		var attacker = args.attacker;
		var target = args.target;
		var area = target.area;
		var timer = area.timer;
		
		var attackerPos = {x:attacker.x,y:attacker.y};
		if(!target || !attacker){
			logger.error('args : %j, attacker : %j, target : %j', args, attacker, target);
			return;
		}
		
		var msg ={
			route:'onAttack',
			attacker:attacker.entityId,
			attackerPos:attackerPos,
			target:target.entityId,
			
			result:args.result,
			skillId:args.skillId
		};
		
		if(result.result === consts.AttackResult.KILLED){
			if(target.type === EntityType.MOB){//怪物死亡
				area.removeEntity(target.entityId);
				msg.exp = attacker.experience;
				for(var id in result.items){
					area.addEntity(result.items[id]); //保存id，客户端添加item由attack事件添加
				}
			}else{//玩家死亡
				target.target = null;
				target.forEachEnemy(function(hater){
					hater.forgetHater(target.entityId);
				});
				target.clearHaters();
				target.died = true;
				timer.abortAllAction(target.entityId);
				timer.addAction(new Revive({
					entity:target,
					reviveTime:5000,
					map:area.map
				}));
				target.save();
			}
			
			attacker.target = null;
			messageService.pushMessageByAOI(area,msg,attackerPos);
			
		}else if(result.result === consts.AttackResult.SUCCESS){
			if (!target) {
				logger.error('[onattack] attack result: target is null!	attackerId: ' + attacker.entityId + '	targetId: ' + target.entityId +' result: ' + result);
				return;
			}
			//受击目标开始反击
			if(target.type === EntityType.MOB){
				//timer.enterAI(target.entityId);
			}
			messageService.pushMessageByAOI(area, msg, attackerPos);
		}
		
	});
};



