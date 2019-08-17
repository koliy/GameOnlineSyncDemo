var tokenService = require('../../../util/token');
var userDao = require('../../../dao/userDao');
var DEFAULT_SECRET = 'pomelo_session_secret';
var DEFAULT_EXPIRE = 6 * 60 * 60 * 1000;	// default session expire time: 6 hours

module.exports = function(app){
	return new Remote(app);
};

var Remote = function(app){
	this.app = app;
	var session = app.get('session')||{};
	this.secret = session.secret ||DEFAULT_SECRET;
	this.expire = session.expire || DEFAULT_EXPIRE;
};

Remote.prototype.auth = function(token,cb){

	var res = tokenService.getDAesString(token,this.secret);
	if(!res) {
		cb(null,1001);
		return;
	}
	var ts = res.split('|');
	res = {uid:ts[0],timestamp:Number(ts[1])};
	
	if(!checkExpire(res,this.expire)){
		cb(null,1002);
		return;
	}

	userDao.getUserByName(res.uid,function(err,user){
		if(err) {
			cb(err,1003);
			return;
		}
		cb(null,200,user);
	})
};

var checkExpire = function(token,expire){
	if(expire < 0) return true;
	return (Date.now() - token.timestamp) <expire;
};