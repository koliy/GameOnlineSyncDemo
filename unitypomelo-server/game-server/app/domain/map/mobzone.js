var util = require('util');
var utils = require('../../util/utils');
var Zone = require('./zone');
var Mob = require('./../entity/mob');
var dataApi = require('../../util/dataApi');
var logger = require('pomelo-logger').getLogger(__filename);

var defaultLimit = 10;

var MobZone = function(opts){
	Zone.call(this,opts);
	this.area = opts.area;
	this.map = opts.area.map;
	this.mobId = opts.mobId;
	
	this.mobData = utils.clone(dataApi.character.findById(this.mobId));
	this.mobData.zoneId = this.zoneId;
	this.mobData.areaId = this.area.id;
	this.mobData.area = this.area;
	this.mobData.kindId = this.mobData.id;
	this.mobData.kindName = this.mobData.name;
	this.mobData.level = opts.level|| 1;
	this.mobData.weaponLevel = opts.weaponLevel || 1 ;
	this.mobData.armorLevel = opts.armorLevel || 1;
	
	this.limit = opts.mobNum || defaultLimit;
	this.count = 0;
	this.mobs ={};
	
	this.lastGenTime = 0;
	this.genCount = 3;
	this.interval = 5000;
};

util.inherits(MobZone,Zone);

MobZone.prototype.update = function(){
	var time = Date.now();
	if(this.count === this.limit){
		this.lastGenTime = time;
		return;
	}
	var nextTime = this.lastGenTime + this.interval;
	for(var i =0;i<this.genCount;i++){
		if(this.count<this.limit && nextTime <= time){
			this.generateMobs();
			this.lastGenTime = time;
		}
	}
	
};

MobZone.prototype.generateMobs = function(){
	var mobData = this.mobData;
	if(!mobData){
		logger.error('load mobData failed ! mobId:%j',this.mobId);
		return;
	}
	
	var count =0,limit =20;
	do{
		mobData.x = Math.floor(Math.random() * this.width) + this.x;
		mobData.y = Math.floor(Math.random() * this.height)+this.y;
	}while(!this.map.isReachable(mobData.x,mobData.y) && count++<limit);
	
	if(count > limit){
		logger.error('generate mob failed! mob data :%j, area:%j,retry %j timer',mobData,this.area.id,count);
		return;
	}
	
	var mob = new Mob(mobData);
	mob.spawnX = mob.x;
	mob.spawnY = mob.y;
	
	genPatrolPath(mob);
	this.add(mob);
	this.area.addEntity(mob);
	this.count++;
};

MobZone.prototype.add = function(mob){
	this.mobs[mob.entityId]=mob;
};

MobZone.prototype.remove=function(id){
	if(!!this.mobs[id]){
		delete this.mobs[id];
		this.count--;
	}
	return true;
};

var PATH_LENGTH =3;
var MAX_PATH_COST =300;

var genPatrolPath = function(mob){
	var map = mob.area.map;
	var path =[];
	var x = mob.x,y=mob.y,p;
	for(var i=0;i<PATH_LENGTH;i++){
		p = genPoint(map,x,y);
		if(!p) break;
		path.push(p);
		x=p.x;
		y=p.y;
	}
	
	path.push({x:mob.x,y:mob.y});
	mob.path=path;
};
/**
 * 生成一个半径长度为100~200的随机点
 * @param map
 * @param originX
 * @param originY
 * @param count
 */
var genPoint = function(map,originX,originY,count){
	count = count||0;
	var disx = Math.floor(Math.random() * 100) + 100;
	var disy = Math.floor(Math.random() * 100) + 100;
	var x,y;
	
	if(Math.random() > 0.5) x = originX - disx;
	else x = originX + disx;
	
	if(Math.random() > 0.5) y = originY - disy;
	else y=originY + disy;
	
	if(x<0) x = originX +disx;
	else if(x>map.width) x = originX -disx;
	
	if(y<0) y = originY +disy;
	else if(y>map.height) y = originY - disy;
	
	if(checkPoint(map,originX,originY,x,y))
		return {x:x,y:y};
	else{
		if(count > 10) return;
		return genPoint(map,originX,originY,count+1);
	}
	
};

/***
 * 检测到达目标点的路径是否有效，2个限制条件:1,到达目标点间的路径是否有效，没有障碍物，2，到达目标点需要的代价是否超过最大代价。
 * @param map
 * @param ox
 * @param oy
 * @param dx
 * @param dy
 * @returns {boolean}
 */
var checkPoint = function(map,ox,oy,dx,dy){
	if(!map.isReachable(dx,dy)) return false;
	var res = map.findPath(ox,oy,dx,dy);
	if(!res || !res.path || res.cost >MAX_PATH_COST) return false;
	
	return true;
};




module.exports = MobZone;




















