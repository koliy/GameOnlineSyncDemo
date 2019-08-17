var BTNode = require('./node');
var util =require('util');

/**
 * 组合节点基类：具有多个孩子节点，可以将多个孩子节点的行为组合为更复杂的行为逻辑。
 * @param blackboard
 * @constructor
 */
var Node = function(blackboard){
	BTNode.call(this,blackboard);
	this.blackboard = blackboard;
	this.children = [];
};

util.inherits(Node,BTNode);

Node.prototype.addChild =function(node){
	this.children.push(node);
};

module.exports = Node;