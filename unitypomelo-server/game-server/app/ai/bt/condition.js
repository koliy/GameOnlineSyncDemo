var bt = require('./bt');
var util =require('util');
var BTNode = require('./node');

/**
 * 条件节点: 不包含孩子节点行为，只判断条件。相当于没个节点的前提
 * 		条件成立，则立即返回succ，失败返回fail。
 * @param opts
 * opts.cond(blackboard) - 条件判断函数，返回true表示条件成立，否则不成立。
 * @constructor
 */
var Node = function(opts){
	BTNode.call(this,opts.blackboard);
	this.cond = opts.cond;
};

util.inherits(Node,BTNode);
module.exports = Node;

Node.prototype.doAction = function(){
	
	if(this.cond && this.cond.call(null,this.blackboard)) return bt.RES_SUCCESS;
	else bt.RES_FAIL;
};
