var bt = require('../../bt/bt');
var BTNode = bt.Node;
var util =require('util');
var Loop = bt.Loop;

/**
 * 循环巡逻节点
 * @param opts
 *        opts.character {Character} current character
 *        opts.path {Array} pos array
 *        opts.rounds {Number} loop rounds. -1 stands for infinite loop
 *        opts.standTick {Number} rest tick after per step. 0 stands for no rest
 * @constructor
 */
var Action = function(opts){
	
	this.blackboard = {};
	this.blackboard.character = opts.character;
	this.blackboard.path = opts.path.slice(0);
	this.blackboard.rounds = opts.rounds || 1;
	this.blackboard.step = opts.path.length;
	this.blackboard.standTick = opts.standTick || 0;

	this.blackboard.started = false;

	
	BTNode.call(this,this.blackboard);

	var moveaction = function(blackboard){
		this.blackboard = blackboard;

	};
	moveaction.prototype.doAction  =function(){
		var path = this.blackboard.path;
		if(path.length === 0 || this.blackboard.rounds === 0){
			return bt.RES_SUCCESS;
		}
		
		var character = this.blackboard.character;
		
		if(!this.blackboard.started){
			this.blackboard.started = true;
			character.move(path[0].x,path[0].y,true);
			return bt.RES_WAIT;
		}
		
		var dest = path[0];
		
		if(character.x !== dest.x || character.y !== dest.y){
			return bt.RES_WAIT;
		}

		//每移动一格，休息一会
		if(this.blackboard.tick > 0){
			this.blackboard.tick--;
			return bt.RES_WAIT;
		}
		this.blackboard.tick = this.blackboard.standTick;

		return bt.RES_SUCCESS;
	};

	moveaction.prototype.loopCond = function(blackboard){
		
		if(blackboard.rounds < 0) {// -1,无限循环
			if(blackboard.path.length > 1){
				blackboard.path.push(blackboard.path.shift());
			}
			blackboard.started = false;
			return true;
		}
		if(blackboard.rounds === 0) return false;

		blackboard.step--;

		if(blackboard.step === 0){
			blackboard.rounds--;
			if(blackboard.rounds === 0) return false;
			blackboard.step = blackboard.path.length;
		}
		if(blackboard.path.length > 1){
			blackboard.path.push(blackboard.path.shift());
		}
		blackboard.started = false;
		return true;
	};

	var child = new moveaction(this.blackboard);

	this.action = new Loop({
		blackboard:this.blackboard,
		child:child,
		loopCond:child.loopCond
	});
};

util.inherits(Action,BTNode);


Action.prototype.doAction = function(){
	return this.action.doAction();
};
module.exports = Action;
