var bt = require('../bt/bt');
var BTNode = bt.Node;
var util = require('util');

var Node = function(opts){
	BTNode.call(this,opts.blackboard);
	var adjustAndTryAgain = new bt.Sequence(opts);
	adjustAndTryAgain.addChild(opts.adjustAction);
	adjustAndTryAgain.addChild(opts.tryAction);

	this.action = new bt.Select(opts);
	this.action.addChild(opts.tryAction);
	this.action.addChild(adjustAndTryAgain);
};
util.inherits(Node,BTNode);
module.exports = Node;

Node.prototype.doAction = function(){
	var res = this.action.doAction();
	return res;
};
