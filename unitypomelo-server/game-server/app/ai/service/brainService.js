var Service = function(){
	this.brains={};
};

module.exports = Service;

Service.prototype.registerBrain = function(type,brain){
	this.brains[type]=brain;
};

Service.prototype.getBrain = function(type,blackboard){
	if(type !== 'autoFight' && type !== 'player')
		type = 'tiger';
	var brain = this.brains[type];
	if(brain) return brain.clone({blackboard:blackboard});
	return null;
};





