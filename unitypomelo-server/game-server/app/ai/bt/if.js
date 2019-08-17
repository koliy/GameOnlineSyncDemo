var bt = require('./bt');
var util =require('util');
var BTNode = require('./node');
var Condition =require('./condition');
var Sequence = require('./sequence');

/**
 * 条件组合节点: 根据条件判断，执行关联的孩子节点。
 * @param opts
 * + opts.action - 孩子节点。
 * + opts.cond(blackboard) - 条件判断函数，返回true表示条件成立，否则不成立。
 * @constructor
 */
var Node = function(opts){
	BTNode.call(this,opts.blackboard);
	
	this.action = new Sequence({
		blackboard:opts.blackboard
	});
	
	var condition = new Condition({
		blackboard:opts.blackboard,
		cond:opts.cond
	});
	
	this.action.addChild(condition);
	this.action.addChild(opts.action);
};

util.inherits(Node,BTNode);
module.exports = Node;

Node.prototype.doAction = function(){
	
	return this.action.doAction();
};

