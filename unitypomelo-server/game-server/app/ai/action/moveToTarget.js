var bt = require('../bt/bt');
var BTNode = bt.Node;
var util= require('util');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);
/**
 * 移动角色到目标节点
 * @param opts
 * @constructor
 */
var Action = function(opts){
	BTNode.call(this,opts.blackboard);
};
util.inherits(Action,BTNode);
module.exports = Action;

Action.prototype.doAction = function(){

	var character = this.blackboard.curCharacter;
	var targetId = this.blackboard.curTarget;
	var distance = this.blackboard.distanceLimit || 100;
	var target = this.blackboard.area.getEntity(targetId);
	
	if(!target){
		character.forgetHater(targetId);
		return bt.RES_FAIL;
	}

	//目标改变
	if(targetId !== character.target){
		this.blackboard.curTarget = null;
		this.blackboard.distanceLimit =0;
		this.blackboard.targetPos = null;
		this.blackboard.moved = false;
		return bt.RES_FAIL;
	}
	
	//已到达目标范围
	if(formula.inRange(character,target,distance)){
		this.blackboard.area.timer.abortAction('move',character.entityId);
		this.blackboard.distanceLimit = 0;
		this.blackboard.moved = false;
		return bt.RES_SUCCESS;
	}
	
	//超出怪物范围
	if(character.type === consts.EntityType.MOB){
		if(Math.abs(character.x - character.spawnX)> 500 || Math.abs(character.y - character.spawnY) > 500){
			character.forgetHater(targetId);
			this.blackboard.moved= false;
			return bt.RES_FAIL;
		}
	}
	
	var targetPos = this.blackboard.targetPos;
	var closure = this;
	
	//开始移动,向path服务器发送rpc请求计算A*路径数据
	if(!this.blackboard.moved){
		character.move(target.x,target.y,false,function(err,result){
			if(err || result === false){
				closure.blackboard.moved = false;
				character.target = null;
			}
		});
		//更新目标最新坐标
		this.blackboard.targetPos ={x:target.x,y:target.y};
		this.blackboard.moved = true;
	}else if(targetPos && (targetPos.x !== target.x || targetPos.y !== target.y)){ //目标坐标改变
		var dis1 = formula.distance(targetPos.x,targetPos.y,target.x,target.y);
		var dis2 = formula.distance(character.x,character.y,target.x,target.y);
		
		if(((dis1 * 3 > dis2 )&&(dis1<distance)) || !this.blackboard.moved)
		{
			targetPos.x = target.x;
			targetPos.y = target.y;
			
			character.move(target.x,target.y,false,function(err,result){
				if(err || result === false){
					closure.blackboard.moved = false;
					character.target = null;
				}
			});
		}
		
	}
	return bt.RES_WAIT;
};
