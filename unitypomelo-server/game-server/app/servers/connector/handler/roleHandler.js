var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var userDao = require('../../../dao/userDao');
var async = require('async');

module.exports = function(app){
	return new Handler(app);
};

var Handler = function(app){
	this.app = app;
};


Handler.prototype.createPlayer = function(msg,session,next){
	var self = this;
	var uid = session.uid,roleId=msg.roleId,name=msg.name;
	
	userDao.getPlayerByName(name,function(err,player){
		if(player){
			next(null,{code:500});
			return;
		}
		
		userDao.createPlayer(uid,name,roleId,function(err,player){
			if(err){
				logger.error('[register] fail to invoke createPlayer for ' + err.stack);
				next(null,{code:500,error:err});
				return;
			}else{
				Promise.all([
					new Promise(function(resolve,reject){
							resolve('init equipDao');
					}),
					
					new Promise(function(resolve,reject){
							resolve('init bagDao');
					}),
					
					new Promise(function(resolve,reject){
							resolve('init player skill');
					})
					
				]).then(function(result){
					console.log(result);
					afterLogin(self.app,msg,session,{id:uid,name:name},player.strip(),next);
				}).catch(err=>{
					logger.error(' stack: '+err.stack);
					next(null,{code:500,error:err});
					return;
				});
			}
		});
		
	});
};


var afterLogin = function(app,msg,session,user,player,next){
	
	Promise.resolve()
	.then(function(data){
		return new Promise(function(resolve,reject){
			session.bind(user.id,()=>{resolve();});
		});
	}).then(function(data){
		return new Promise(function(resolve,reject){
			session.set('username',user.name);
			session.set('areaId',player.areaId);
			session.set('serverId',app.get('areaIdMap')[player.areaId]);
			session.set('playername',player.name);
			session.set('playerId',player.id);
			session.on('closed',onUserLeave);
			session.pushAll();
			resolve();
		})
	}).then(function(data){
		return new Promise(function(resolve,reject){
			next(null,{code:200,user:user,player:player});
		});
	})
	.catch(err=>{
		logger.error(' stack: '+err.stack);
		next(null,{code:500,error:err});
		return;
	});
};

var onUserLeave = function(app,session,reason){
	if(!session || !session.uid) return;
	
	console.log('2 ~ OnUserLeave is running ...');
	app.rpc.area.playerRemote.playerLeave(session,{playerId:session.get('playerId'),areaId:session.get('areaId')},
		function(err){
			if(!!err){
				logger.error('user leave error! %j', err);
			}
		});
};