var bt = require('./bt');
var util = require('util');
var Composite = require('./composite');

/**
 * 选择组合节点: 依次执行每个孩子节点的行为，只要有一个孩子行为成功，则停止继续执行，直接返回
 * 有一个孩子wait，则hold状态，等待此孩子wait结束。
 * 没有一个孩子返回success，则返回失败
 * @param opts
 * @constructor
 */
var Node = function(opts){
	Composite.call(this,opts.blackboard);
	this.index = 0;
};

util.inherits(Node,Composite);

Node.prototype.reset = function(){
	this.index = 0;
};

Node.prototype.doAction = function(){
	if(!this.children.length){
		return bt.RES_SUCCESS;
	}
	if(this.index >= this.children.length) this.reset();
	
	for(var i = this.children.length;this.index<i;this.index++){
		
		var res = this.children[this.index].doAction();
		if(res === bt.RES_SUCCESS){
			this.reset();
			return res;
		}else if(res === bt.RES_WAIT){
			return res;
		}else{
			continue;
		}
	}
	this.reset();
	return bt.RES_FAIL;
};

module.exports = Node;