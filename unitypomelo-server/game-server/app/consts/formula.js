var formula = module.exports;
var logger = require('pomelo-logger').getLogger(__filename);


formula.distance = function(x1, y1, x2, y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	
	return Math.sqrt(dx * dx + dy * dy);
};

formula.calMobValue = function(baseValue,level,upgradeParam){
	baseValue=Number(baseValue);
	var value = Math.round(baseValue+baseValue*(level-1)*upgradeParam);
	return value;
};

formula.inRange = function(origin,target,range){
	var dx = origin.x - target.x;
	var dy = origin.y - target.y;
	return dx * dx + dy * dy <= range *range;
};