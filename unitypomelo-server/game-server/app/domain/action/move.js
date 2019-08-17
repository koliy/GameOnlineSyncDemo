var Action = require('./action');
var util = require('util');
var messageService = require('../messageService');
var consts = require('../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);

var Move= function(opts){
	opts.type = 'move';
	opts.id = opts.entity.entityId;
	opts.singleton = true; //设置单列，因移动频繁修改目的坐标
	Action.call(this,opts);
	
	this.entity = opts.entity;
	this.area = this.entity.area;
	this.path = opts.path;
	this.speed = Number(opts.speed);
	this.time = Date.now();
	this.pos = this.path[0];
	this.index = 1;
	this.tickNumber = 0;
};

util.inherits(Move,Action);

var pro = Move.prototype;
pro.update = function(){
	this.tickNumber++;
	var time = Date.now() - this.time;
	var speed = this.speed;
	if(speed > 600) logger.warn('move speed too fast :%j',speed);
	
	var path = this.path;
	var index = this.index;
	var traveDistance = speed * time/1000;
	var oldPos = {x:this.pos.x,y:this.pos.y};
	var pos = oldPos;
	var dest = path[index];
	var distance = getDis(this.pos,dest);
	
	//求出当前帧所能移动的最大距离坐标点。
	while(traveDistance > 0){
		if(distance > traveDistance){ //下一点移动长度大于当前帧所需移动的距离
			distance = distance - traveDistance;
			pos = getPos(pos,dest,distance); //获取当前帧移动距离的目标点
			traveDistance = 0;
		}else{
			traveDistance = traveDistance - distance;
			pos = path[index];
			index++;
			//最后点，则移动结束
			if(index >= path.length){
				this.finished = true;
				this.entity.isMoving = false;
				break;
			}
			dest = path[index];
			distance = getDis(pos,dest);
		}
	}
	//保存当前移动的真实坐标
	this.pos = pos;
	this.index = index;
	this.entity.x = Math.floor(pos.x);
	this.entity.y = Math.floor(pos.y);
	
	//update the aoi module
	var watcher = {id:this.entity.entityId,type:this.entity.type};
	
	//检测新的aoi区域，通知新区域内的watcher，添加移动进来的对象，旧区域tower移除对象
	this.area.timer.updateObject(watcher,oldPos,pos);
	//检测对象所关注的tower区域，添加新区域内的对象，移除旧区域内的对象。
	this.area.timer.updateWatcher(watcher,oldPos,pos,this.entity.range,this.entity.range);
	
	if(this.entity.type === consts.EntityType.PLAYER){
		//上报sync时间器异步保存数据到mysql
		this.entity.save();
		if(this.tickNumber %10 === 0){ //每隔10个tick,大概1秒的时间,通知客户端矫正当前坐标
			messageService.pushMessageToPlayer({uid:this.entity.userId,sid:this.entity.serverId},'onPathCheckOut',{
				entityId:this.entity.entityId,
				position:{
					x:this.entity.x,
					y:this.entity.y
				}
			});
		}
	}
	
	this.time = Date.now();
};


function getDis(pos1,pos2){
	return Math.sqrt(Math.pow((pos1.x - pos2.x),2) + Math.pow((pos1.y - pos2.y),2));
}

function getPos(start,end,dis){
	var length = getDis(start,end);
	var pos ={};
	pos.x = end.x - (end.x - start.x) * (dis/length);
	pos.y = end.y - (end.y - start.y) * (dis/length);
	
	return pos;
}

module.exports = Move;