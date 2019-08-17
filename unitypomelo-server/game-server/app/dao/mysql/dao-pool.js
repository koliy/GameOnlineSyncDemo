var _poolModule = require('generic-pool');
var mysql = require('mysql');

var createMySqlPool = function(app){
	const factory = {
		create :function(){
			var mysqlConfig = app.get('mysql');
		
			return new Promise(function(resolve,reject){
				var client = mysql.createConnection({
					host:mysqlConfig.host,
					port:mysqlConfig.port,
					user:mysqlConfig.user,
					database:mysqlConfig.database,
					password:mysqlConfig.password
				});
				//sql 8小时自动断开会触发error事件，'PROTOCOL_CONNECTION_LOST'
				//重新连接即可
				client.on('error',function(){
					client.connect();
				});
				
				client.connect(function(error){
					if(error) console.error('>>>>>>>>>>>>>sql connect error<<<<<<<<<<<<<');
					resolve(client);
				});
			});
		},
		destroy:function(client){
			return new Promise(function(resolve){
				client.on('end',function(){
					resolve();
				});
				client.end();
			});
		}
	};
	
	const opts ={
		min:2,
		max:10,
		idleTimeoutMillis:30000,
		log:false
	};
	return _poolModule.createPool(factory,opts);
};
exports.createMysqlPool = createMySqlPool;