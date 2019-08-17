var bt = require('./bt');
var Decorator = require('./decorator');
var util = require('util');

/**
 * 循环装饰节点: 根据条件函数，循环执行孩子行为. 直到孩子返回fail,或条件失败
 *  当孩子返回wait。hold此孩子状态，返回父节点wait。等待孩子执行结束。
 * @param opts
 * opts.loopCond(blackboard) - 循环条件判断函数。返回true表示循环条件成立，否则不成立。
 * @constructor
 */
var Node = function(opts){
	Decorator.call(this,opts.blackboard,opts.child);
	this.loopCond = opts.loopCond;
};

util.inherits(Node,Decorator);

module.exports = Node;
var pro = Node.prototype;


pro.doAction = function(){
	var res = this.child.doAction();
	if(res !== bt.RES_SUCCESS)
		return res;
	
	if(this.loopCond && this.loopCond.call(null,this.blackboard)){
		return bt.RES_WAIT;
	}
	
	return bt.RES_SUCCESS;
};





