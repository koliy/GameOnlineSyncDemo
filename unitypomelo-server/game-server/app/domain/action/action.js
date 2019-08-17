var id =1;

var Action = function(opts){
	this.data = opts.data;
	this.id = opts.id || id++;
	this.type = opts.type||"defaultAction";
	this.finished = false;
	this.aborted = false;
	this.singleton = false || opts.singleton; //单列,每次只能存在一个行为
};

Action.prototype.update = function(){};

module.exports = Action;
