var bt = require('../bt/bt');
var BTNode = bt.Node;
var util =require('util');

var Action = function(opts){
	BTNode.call(this,opts.blackboard);
};
util.inherits(Action,BTNode);

module.exports = Action;

var pro = Action.prototype;

pro.doAction = function(){
	var character = this.blackboard.curCharacter;
	var area = this.blackboard.area;
	area.timer.patrol(character.entityId);

	return bt.RES_SUCCESS;
};

module.exports.create = function(){
	return Action;
};