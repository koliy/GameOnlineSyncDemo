var Queue = require('pomelo-collection').queue;
var logger = require('pomelo-logger').getLogger(__filename);

var ActionManager =function(opts){
	opts = opts||{};
	this.limit = opts.limit || 10000;
	//行为映射字典: [type][id]=action
	this.actionMap = {};
	//行为队列，所有的行为以FIFO方式执行
	this.actionQueue = new Queue(this.limit);
	
};

var pro = ActionManager.prototype;
pro.addAction=function(action){
	if(action.singleton) this.abortAction(action.type,action.id);
	
	this.actionMap[action.type] = this.actionMap[action.type]||{};
	this.actionMap[action.type][action.id] =action;
	return this.actionQueue.push(action);
};

pro.abortAction = function(type,id){
	if(!this.actionMap[type] || !this.actionMap[type][id]) return;
	this.actionMap[type][id].aborted = true;
	delete this.actionMap[type][id];
};

pro.abortAllAction = function(id){
	for(var type in this.actionMap){
		if(!!this.actionMap[type][id]) {
			this.actionMap[type][id].aborted = true;
		}
	}
};

pro.update = function(){
	var length = this.actionQueue.length;
	for(var i =0;i<length;i++){
		var action = this.actionQueue.pop();
		if(action.aborted) continue;
		
		action.update();
		if(!action.finished)
			this.actionQueue.push(action);
		else
			delete this.actionMap[action.type][action.id];
	}
};

module.exports=ActionManager;
