
var Manager = function(opts){
	this.brainService = opts.brainService;
	this.area = opts.area;
	//entityid:brainService
	this.players ={};
	this.mobs = {};
};

module.exports = Manager;
var pro = Manager.prototype;

pro.start = function(){
	this.started = true;
};

pro.stop = function(){
	this.closed = true;
};

pro.addCharacters = function(cs){
	if(!this.started || this.closed) return;
	
	if(!cs || !cs.length) return;
	
	var c;
	for(var i=0,l=cs.length;i<l;i++){
		c = cs[i];
		var brain;
		if(c.type === 'player'){
			if(this.players[c.entityId]) continue;
			
			brain = this.brainService.getBrain(c.type,{manager:this,area:this.area,curCharacter:c});
			this.players[c.entityId] = brain;
		}else{
			if(this.mobs[c.entityId]) continue;
			
			brain = this.brainService.getBrain(c.type,{manager:this,area:this.area,curCharacter:c});
			this.mobs[c.entityId] = brain;
		}
	}
	
};

pro.removeCharacter = function(id){
	if(!this.started || this.closed) return;
	delete this.players[id];
	delete this.mobs[id];
};

pro.update = function(){
	if(!this.started || this.closed) return;
	var id;
	for(id in this.players){
		this.players[id].update();
	}
	for(id in this.mobs) {
		this.mobs[id].update();
	}
};
