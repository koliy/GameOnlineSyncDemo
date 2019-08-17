var exp = module.exports;

exp.connector = function(session,msg,app,cb){
	if(!session){
		cb(new Error('fail to route to connector server for session is empty'));
		return;
	}
	
	if(!session.frontendId){
		cb(new Error('fail to find fronted id in session'));
		return;
	}
	
	cb(null,session.frontendId);
};

exp.area = function(session,msg,app,cb){
	var serverId = session.get('serverId');//获取想要登入的服务器id,route每次选择哪个area服务器
	if(!serverId){
		cb(new Error('can not find server info for type: '+msg.serverType));
		return;
	}
	
	cb(null,serverId);
};