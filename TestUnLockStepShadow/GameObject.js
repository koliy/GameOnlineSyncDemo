
var GameObject =function (id) {

	this.x=0;
	this.y=0;
	this.d=0;//方向
	this.v=0;//速度
	this.sx=0;
	this.sy=0;
	this.sd=0;//影子方向
	this.sv=0;//影子速度
	this.id = id;
	this.mode=-1;
	this.name='';
	this.trace_mode=1;
	this.direction = [[0,0],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];
	
};
var middle = function(begin,n,end){
	return Math.max(begin,Math.min(n,end));
};

GameObject.prototype.initpos= function(){
	this.x = this.sx=400 - 40*4 + this.id *40;
	this.y = this.sy =350;
	this.v = this.sv=3;
	this.d = this.sd =0;
};



/**
 * 影子移動
 * @param step
 */
GameObject.prototype.shadow_move = function(step){
	if(step === 0) return;
	var sx = this.sx,sy=this.sy,sd=this.sd,sv=this.sv;
	
	var inc = 1;
	//客服端跑快了几帧数据，则退回到服务器当前帧的数据
	if(step <0){
		step = -step;
		inc = -1;
	}
	
	for(var i =0;i<step;i++){
		sx += sv * this.direction[sd][0] *inc;
		sy += sv * this.direction[sd][1] * inc;
		sx = middle(0,sx,800);
		sy = middle(0,sy,600);
	}
	this.sx = sx;this.sy=sy;
};
/**
 * 实体移动
 * @param step
 */
GameObject.prototype.entity_move = function(step){
	if(step === 0) return;
	var x = this.x,y=this.y,d=this.d,v=this.v;
	for(var i =0;i<step;i++){
		x += v*this.direction[d][0];
		y += v*this.direction[d][1];
		x = middle(0,x,800);
		y = middle(0,y,600);
	}
	
	this.x = x; this.y=y;
};

/**
 * 影子插值
 * @param curframe
 * @param oldframe
 */
GameObject.prototype.adjust = function(curframe,oldframe){
	this.shadow_move(curframe-oldframe);
};
/**
 * 跟随方式
 * @param step
 */
GameObject.prototype.trace = function(step){
	if(this.trace_mode === 0) trace1(step);
	else trace2(step);
};
/**
 * 同步跟随
 * @param step
 */
var trace1 = function(step){
	if(step === 0) return;
	var sx = this.sx,sy=this.sy,sd=this.sd,sv=this.sv;
	var x = this.x,y=this.y;
	var v2 = sv * 2;
	var min = Math.min;
	//随着距离接近，插值减小到0
	for(var i =0;i<step;i++){
		if(x<sx) x += min(sx-x,v2);
		else if(x>sx) x -= min(x-sx,v2);
		
		if(y <sy) y += min(sy -y,v2);
		else if(y > sy) y-= min(y-sy,v2);
	}
	
	this.x = x;this.y=y;
};
/**
 * 相位滞后
 * @param step
 */
var trace2 = function(step){
	if(step === 0) return;
	var sx = this.sx,sy=this.sy,sd=this.sd,sv=this.sv;
	var x = this.x,y=this.y;
	var v2 = sv * 2;
	var min = Math.min;
	
	var newpos = function(x0,sx0){
		if(x0 === sx0) return x0;
		if(x0 < sx0){
			var d1 = min(sx0-x0,v2);
			var d2 = min(sx0 -x0,sv);
			if(sx0-x0 > sv * 35) x0 +=d1;
			else x0 += d2;
		}else if(x0>sx0){
			var d1 = min(x0-sx0,v2);
			var d2 = min(x0-sx0,sv);
			
			if(x0-sx0 > sv * 35) x0 -=d1;
			else x0 -= d2;
		}
		
		return x0;
	};
	
	for(var i=0;i<step;i++){
		x = newpos(x,sx);
		y = newpos(y,sy);
	}
	
	this.x = x,this.y =y;
};

module.exports = GameObject;