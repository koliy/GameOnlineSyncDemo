var util = require('util');

/**
 * 所有行为树节点的父节点
 * @param blackboard：行为树之间数据传输黑板
 * @constructor
 */
var Node = function(blackboard){
	this.blackboard = blackboard;
};

module.exports = Node;