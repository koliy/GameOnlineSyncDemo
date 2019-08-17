var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');

module.exports = function(){
	return new Filter();
};

var Filter = function(){

};

Filter.prototype.before = function(msg,session,next){
	//根据route，选择到对应area服务器的areaManager
	var area = pomelo.app.areaManager.getArea(session.get('instanceId'));//没有instanceid的话，就是scene.getArea();
	session.area = area;
	
	var player = area.getPlayer(session.get('playerId'));

	if(!player){ //登陆前发送的area指令过滤
		var route = msg.__route__;//获取所有route数据
		if(route.search(/^area\.resourceHandler/i) == 0 || route.search(/enterScene$/i) >= 0){
			next();
			return;
		}else{
			next(new Error('No player exist!'));
			return;
		}
	}
	
	if(player.died){
		next(new Error('You cant move a dead man!!!'));
		return;
	}
	
	next();
};






