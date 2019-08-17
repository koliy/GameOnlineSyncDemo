var logger = require('pomelo-logger').getLogger(__filename);
var exp = module.exports;


exp.isInPolygon = function(pos,polygon){
	var p = {x:10000000,y:pos.y};
	var count = 0;
	
	for(var i=0;i<polygon.length;i++){
		var p1 = polygon[i];
		var p2 = polygon[(i+1) % polygon.length];
		
		if(this.isOnline(pos,p1,p2)) return true;
		
		if(p1.y !== p2.y){
			if(this.isOnline(p1,pos,p)){
				if(p1.y > p2.y) {
					count++;
					continue;
				}
			}else if(this.isOnline(p2,pos,p)){
				if(p2.y > p1.y){
					count++;
					continue;
				}
			}else if(this.isIntersect(pos,p,p1,p2)){
				count++;
				continue;
			}
		}
	}
	
	if(count % 2 === 1) return true;
	
	return false;
	
};



/**
 * 检测某点是否在p1,p2的2点连线上.
 * 1.点Q首先要在P1P2所在的直线上。 简单点就是用叉乘，如果点Q在P1P2直线上，那么： P1Q x P1P2 = 0（x代表叉乘）:ABxAC =0
 * 2.Q要在以P1P2为对角线的平行矩形内
 * @param pos
 * @param p1
 * @param p2
 */
exp.isOnline = function(pos,p1,p2){
	var v1 = {x:pos.x -p1.x,y:pos.y - p1.y}; //AC -> p2pos
	var v2 = {x: p2.x -p1.x,y:p2.y - p1.y}; //AB-> p2p1
	
	if((v1.x * v2.y - v2.x * v1.y) === 0){ //AB x AC  = 0,2个向量叉积计算
		if(pos.y >= Math.min(p1.y,p2.y) && pos.y <= Math.max(p1.y,p2.y) && //点在对角线矩形内
		 pos.x >= Math.min(p1.x,p2.x) && pos.x<= Math.max(p1.x,p2.x))
			return true;
		
		return false;
	}
	
	return false;
};
/**
 * 判断2条线段是否相交
 * @param p1
 * @param p2
 * @param q1
 * @param q2
 * @returns {boolean}
 */
exp.isIntersect = function(p1,p2,q1,q2){
	// 首先判断以两条线段为对角线的矩形是否相交，如果不相交两条线段肯定也不相交。
	if(!this.isRectIntersect(p1,p2,q1,q2)) return false;
	
	//利用矢量叉乘判断两条线段是否相互跨越，如果相互跨越显然就相交，反之则不相交
	var v1 = {x:(p1.x - q1.x), y:(p1.y - q1.y)};
	var v2 = {x:(q2.x - q1.x), y:(q2.y - q1.y)};
	var v3 = {x:(p2.x - q1.x), y:(p2.y - q1.y)};
	
	if(this.vecCross(v1,v2) * this.vecCross(v2,v3) > 0) return true;
	
	return false;
	
};


/**
 * 测试2个矩形是否相交
 * @param p1
 * @param p2
 * @param q1
 * @param q2
 * @returns {boolean}
 */
exp.isRectIntersect = function(p1,p2,q1,q2){
	//计算P,Q矩形的左上顶点和右下顶点
	var minP = {x:p1.x<p2.x?p1.x:p2.x, y:p1.y<p2.y?p1.y:p2.y};
	var maxP = {x:p1.x>p2.x?p1.x:p2.x, y:p1.y>p2.y?p1.y:p2.y};
	var minQ = {x:q1.x<q2.x?q1.x:q2.x, y:q1.y<q2.y?q1.y:q2.y};
	var maxQ = {x:q1.x>q2.x?q1.x:q2.x, y:q1.y>q2.y?q1.y:q2.y};
	
	//计算2个矩形相交内的矩形面积形成的矩形左上顶点和右下顶点，满足 minx<= maxx && miny <= maxy则相交
	var minx = Math.max(minP.x,minQ.x);
	var miny = Math.max(minP.y,minQ.y);
	var maxx = Math.min(maxP.x,maxQ.x);
	var maxy = Math.min(maxP.y,maxQ.y);
	
	return !(minx > maxx || miny >maxy);
};

/**
 * 2个向量叉积
 * @param v1
 * @param v2
 * @returns {number}
 */
exp.vecCross = function(v1,v2){
	return v1.x * v2.y - v2.x * v1.y;
};
















