var util = require('util');
var EventEmitter = require('events').EventEmitter;

var id = 0;

var Zone = function(opts){
	this.zoneId = id++;
	this.width = opts.width;
	this.height = opts.height;
	this.x = opts.x;
	this.y = opts.y;
	this.area = opts.area;
};

util.inherits(Zone,EventEmitter);

Zone.prototype.update = function(){};
Zone.prototype.remove = function(){};

module.exports = Zone;

















