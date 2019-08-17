var dispatcher = require('../../../util/dispatcher');

module.exports = function(app){
	return new Handler(app);
};

var Handler = function(app){
	this.app = app;
};



/***
 *
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.enter = function(msg,session,next){
	
	var uid = msg.uid;
	if(!uid){
		next(null,{code:500});
		return;
	}

	var connectors = this.app.getServersByType('connector');
	if(!connectors || connectors.lengths === 0){
		next(null,{code:2001});
		return;
	}
	
	var res = dispatcher.dispatch(uid,connectors);
	next(null,{code:200,host:res.host,port:res.clientPort});
	
};