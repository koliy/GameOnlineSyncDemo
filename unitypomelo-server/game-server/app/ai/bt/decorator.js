var BTNode = require('./node');
var util = require('util');

/**
 * 装饰节点:只有一个孩子节点的行为,目的是在孩子节点的原有逻辑上添加细节(重复执行子节点Loop，改变子节点的返回状态)
 * @param blackboard
 * @param child
 * @constructor
 */
var Node = function(blackboard,child){
	BTNode.call(this,blackboard);
	this.blackboard = blackboard;
	this.child =  child;
};

util.inherits(Node,BTNode);

Node.prototype.setChild = function(node){
	this.child = node;
};

module.exports = Node;




