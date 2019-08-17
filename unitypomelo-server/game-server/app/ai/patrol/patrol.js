var PatrolManager = require('./patrolManager');

module.exports.createManager = function(){
	return new PatrolManager();
};