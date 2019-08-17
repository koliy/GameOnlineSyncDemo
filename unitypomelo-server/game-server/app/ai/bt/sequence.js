var bt = require('./bt');
var util =require('util');
var Composite = require('./composite');

/**
 * 顺序组合节点: 依次执行每个孩子节点，直到所有子行为执行成功或者有一个失败为止。
 * 如果有孩子返回wait，则hold此孩子状态，返回wait。等待此孩子状态结束。
 * @param opts
 * @constructor
 */
var Node = function (opts) {
	Composite.call(this,opts.blackboard);
	this.index = 0;
};

util.inherits(Node,Composite);

Node.prototype.reset = function(){
	this.index = 0;
};


Node.prototype.doAction = function(){
	if(!this.children.length) {
		return bt.RES_SUCCESS;
	}
	
	if(this.index >= this.children.length){
		this.reset();
	}
	
	for(var i = this.children.length;this.index < i;this.index++){

		var res = this.children[this.index].doAction();
		if(res === bt.RES_FAIL){
			this.reset();
			return res;
		}else if(res === bt.RES_WAIT){
			return res;
		}else{
			continue;
		}
	}
	
	this.reset();
	return bt.RES_SUCCESS;
};

module.exports = Node;