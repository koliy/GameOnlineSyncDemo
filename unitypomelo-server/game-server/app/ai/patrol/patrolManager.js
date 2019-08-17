var Loop = require('./mode/loop');
var STAND_TICK = 50;

var Manager = function(){
	this.characters = {};
};
module.exports = Manager;

var pro = Manager.prototype;

var getAction = function(character,path){
	return new Loop({
		character:character,
		path:path,
		rounds:-1,
		standTick:STAND_TICK
	});
};

pro.addCharacters = function(cs){
	var c;
	for(var i=0,l=cs.length;i<l;i++){
		c = cs[i];
	
		if(!this.characters[c.character.entityId]){
			this.characters[c.character.entityId] = getAction(c.character,c.path);
		}
	}
};

pro.removeCharacter = function(id){
	delete this.characters[id];
};

pro.update = function(){
	for(var id in this.characters){
		this.characters[id].doAction();
	}
	
};

