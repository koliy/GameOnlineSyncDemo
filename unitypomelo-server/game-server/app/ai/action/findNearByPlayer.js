var bt = require('../bt/bt');
var util =require('util');

/**
 * 一个查找最近的玩家的行为节点，
 * @param opts
 * @constructor
 */
var Action = function(opts){
	bt.Node.call(this,opts.blackboard);
	
	this.blackboard = opts.blackboard;
};
util.inherits(Action,bt.Node);

module.exports = Action;

Action.prototype.doAction = function(){
	
};

