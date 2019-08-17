var logger = require('pomelo-logger').getLogger(__filename);
var userDao = require('../../../dao/userDao');

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
  if(!this.app) logger.error(app);
};

/**
 * New client entry.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {

  var token = msg.token,self = this;
  if(!token){
  	next(new Error('invalid entry request: empty token'),{code:500});
  	return;
  }
  var username = msg.username,password = msg.password;
  var uid,players,player;
  
  Promise.resolve().then(function(data) {
	  return new Promise(function (resolve, reject) {
		  self.app.rpc.auth.authRemote.auth(session, token, function (err, code, user) {
			  if (code === 1003) { //用户不存在
				  userDao.createUser(username, password, 1, function (err, user) {
					  resolve(user);
				  });
				  return;
			  }
			  if (code !== 200) {
				  next(null, {code: code});
				  return;
			  }
			  resolve(user);
		  });
	  });
  }).then(function(data){
	  if(!!!data) {
		  next(null,{code:1003});
		  return;
	  }
	
	  if(data.password !== password){
		  next(null,{code:500});
		  return;
	  }
	  uid = data.id;
	  return new Promise(function(resovle,reject){
		
		  userDao.getPlayersByUid(uid,function(err,res){
			  //剔除当前已上线的用户
			  self.app.get('sessionService').kick(uid,()=>{
				  resovle(res);
			  });
		  });
	  });
  }).then(function(res){
  	  players = res;
	  session.bind(uid, ()=>{
	  	 if(!players || players.length === 0){
	  	 	next(null,{code:200});
	  	 	return;
		 }
		 
		 player = players[0];
	  	 session.set('serverId',self.app.get('areaIdMap')[player.areaId]);
	  	 session.set('playername',player.name);
	  	 session.set('playerId',player.id);
	  	 session.on('closed',onUserLeave.bind(null,self.app));
	  	 session.pushAll();
	  	 
	  	 next(null,{code:200,player:players?players[0]:null});
	  });
  }).catch(function(err){
  	 console.log(err);
  });


  
};

var onUserLeave = function(app,session,reason){
	if(!session || !session.uid) return;
	
	console.log('1 ~ OnUserLeave is running ...');
	app.rpc.area.playerRemote.playerLeave(session,{playerId:session.get('playerId'),instanceId:session.get('instanceId')},
		function(err){
			if(!!err){
				logger.error('user leave error! %j', err);
			}
		});
	
};



/**
 * Publish route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.publish = function(msg, session, next) {
	var result = {
		topic: 'publish',
		payload: JSON.stringify({code: 200, msg: 'publish message is ok.'})
	};
  next(null, result);
};

/**
 * Subscribe route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.subscribe = function(msg, session, next) {
	var result = {
		topic: 'subscribe',
		payload: JSON.stringify({code: 200, msg: 'subscribe message is ok.'})
	};
  next(null, result);
};
