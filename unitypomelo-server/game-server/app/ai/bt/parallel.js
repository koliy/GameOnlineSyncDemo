var bt = require('./bt');
var util =require('util');
var Composite = require('./composite');

/**
 * 并行组合节点: 并行执行每个孩子节点，统计成功/失败的孩子数量。 根据policy策略条件，进行返回状态。
 * 如果有孩子返回wait，则hold此孩子状态，返回wait，等待此孩子状态结束。
 * @param opts
 * 	opts.policy - Parallel节点失败策略，可选值：Parallel.POLICY_FAIL_ON_ONE（一个失败）, Parallel.POLICY_FAIL_ON_ALL(全部失败)。
 * @constructor
 */
var Node = function (opts) {
	Composite.call(this,opts.blackboard);
	this.policy = opts.policy || bt.POLICY_FAIL_NO_ONE;
	this.waits = [];
	this.succ = 0;
	this.fail = 0;
};

util.inherits(Node,Composite);

module.exports = Node;

var pro = Node.prototype;

pro.doAction = function(){
	if(!this.children.length) return bt.RES_SUCCESS;
	var rest= [];
	var origin = this.waits.length ? this.waits: this.children;
	
	for(var i=0,l=origin.length;i<l;i++){
		var res = origin[i].doAction();
		if(res === bt.RES_SUCCESS){
			this.succ++;
			continue;
		}else if(res === bt.RES_FAIL){
			this.fail++;
			continue;
		}else{
			rest.push(origin[i]);
			break;
		}
	}
	
	if(rest.length){
		this.waits = rest;
		return bt.RES_WAIT;
	}
	
	res = this.checkPolicy();
	this.reset();
	return res;
};

pro.reset = function(){
	this.waits.length =0;
	this.succ=0;
	this.fail =0;
};

pro.checkPolicy = function(){
	//只要有1个失败条件则失败
	if(this.policy === bt.POLICY_FAIL_NO_ONE){
		return this.fail? bt.RES_FAIL:bt.RES_SUCCESS;
	}
	//只要全部失败才失败
	if(this.policy === bt.POLICY_FAIL_NO_ALL){
		return this.succ ? bt.RES_SUCCESS:bt.RES_FAIL;
	}
};