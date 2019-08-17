var sqlclient =module.exports;
var _pool;
var NND={};

NND.init = function(app){
	if(!_pool) _pool = require('./dao-pool').createMysqlPool(app);
};

NND.query = function(sql,args,callback){
	var promise = _pool.acquire();
	promise.then(function(client){
		console.log('query sql:',sql,args)
		client.query(sql,args,function(err,res){
			if(!!err){
				_pool.destroy(client);
				callback.call(null,err);
				return;
			}
			_pool.release(client);
			callback.apply(null,[err,res]);
		});
	},function(){console.log('reject')})
	.catch(function(err){
		callback.call(null,err);
		console.log(err);
	});
};

NND.shutdown = function(){
	_pool.drain().then(function(){
		_pool.clear();
	});
};

sqlclient.init = function(app){
	if(!!_pool) return sqlclient;
	else{
		NND.init(app);
		sqlclient.insert = NND.query;
		sqlclient.update = NND.query;
		sqlclient.delete = NND.query;
		sqlclient.query = NND.query;
		return sqlclient;
	}
};
sqlclient.shutdown = function(){
	NND.shutdown();
};


















