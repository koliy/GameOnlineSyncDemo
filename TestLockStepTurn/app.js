/**
 * 原理：(帧锁定)
 * 1.服务端设置每秒钟50次向更新所有客户端发送的消息，每update为一帧，每隔几个关键帧便发送同步包。
 *   如果服务端没有接受完所有的客服端关键帧k1的控制数据，则等待接受完再发送同步包
 *   每个关键帧只有1个接收的控制数据有效，接收到多个则覆盖最新。
 *
 * 2.客户端每几个关键帧播放服务端的数据，如果当前关键帧没有数据，就必须等待
 * 3.如果当前关键帧有数据，则应用接受到的上一帧update，并发送当前帧接收到的input和控制信息给服务器
 * 4.如果当前关键帧有多个数据，则快进
 * 5.有1个客户端延迟，则所有客户端都等待
 */

var http = require('http');
var g_onlines = {};//所有在线玩家
var g_commands = new Array();//指令数组
var g_commands_histroy = new Array();//历史指令，用于断线重连
var g_joinCount=0;//已准备的人数
var g_maxJoinCount=2;//最大人数
var frame =0;//间隔帧
var g_stepTime=0;//当前step时间戳,帧下标
var g_stepInterval = 20;//每个step间隔，单位ms，表示服务器1秒内发送50次数据
var g_gameStartTime=0;//游戏开始时间
var g_simulateNetDelay = 30;//模拟正常的30ms网络延迟。

var STATUS={
	WAIT:1,
	START:2
};

var g_gameStatus = STATUS.WAIT;

var server = http.createServer(function(res,rep){

});

const io = require('socket.io')(server);
io.on('connection', client => {
	
	client.emit('open',client.id);
	
	function getAccount(socketid){
		for(var key in g_onlines){
			if(socketid  === g_onlines[key].socket.id){
				return key;
			}
		}
	}
	
	//加入房间
	client.on('join',function(account){
		
		//顶号/断线重连
		if(g_onlines[account]){
			g_onlines[account].socket.disconnect();
			if(g_gameStatus === STATUS.START){
				g_onlines[account] = {socket:client,online:true};

				
				client.emit('join',{result:true,message:"正在断线重连..."});
				console.log(account, "重连游戏");
				var players = {};
				for(var key in g_onlines){
					players[key] = g_onlines[key].socket.id;
				}
		
				client.emit('start',{time:g_gameStartTime,players:players});
				client.broadcast.emit('system',{client:account,message:'重新连接！'});
				client.emit('message',g_commands_histroy);
				return;
			}
		}
		//房间已满
		if(g_joinCount === g_maxJoinCount){
			console.log('房间已满',account,'加入失败');
			client.emit('join',{result:false,message:'房间已满!'});
			client.disconnect();
			return;
		}
		//加入游戏
		if(g_joinCount < g_maxJoinCount){
			console.log(account,'加入游戏');
			client.emit('join',{result:true,message:'匹配中...'});
			g_onlines[account]={socket:client,online:true};
			g_joinCount++;
			
		}
		//开始游戏,等待倒计时
		if(g_joinCount === g_maxJoinCount){
			g_gameStatus = STATUS.WAIT;
			g_gameStartTime = Date.now() + 500;
			g_commands = new Array();
			g_commands_histroy = new Array();
			console.log('游戏预计开始时间:',g_gameStartTime);
			//向所有客户端发送开始指令
			var players = {};
			for(var key in g_onlines){
				players[key] = g_onlines[key].socket.id;
			}
			io.sockets.emit('start',{time:g_gameStartTime,players:players});
		}
	});
	
	//同步客户端的网络延迟和时间差，以保证2边的计时同步
	client.on('timeSync',function(time){
		client.emit('timeSync',{client:time,server:Date.now()});
	});
	
	//接受客户端按键事件
	client.on('message',function(json){
		if(g_gameStatus === STATUS.START){
			var ac = getAccount(client.id);
			json.account = ac;
			
			//覆盖最新控制数据
			for(var i =0,imax = g_commands.length;i<imax;i++)
			{
				
				if(!!g_commands[i] && g_commands[i].account === ac) {
					g_commands[i] = json;
				}
			}
			if(g_commands.length < 2){
				var isadd = true;
				for(var i =0,imax = g_commands.length;i<imax;i++)
				{
					if(!!g_commands[i] && g_commands[i].account === ac) {
						isadd = false;
						break;
					}
				}
				if(isadd) g_commands.push(json);
			}


		}
	});
	
	client.on('disconnect', () => {
		var account = getAccount(client.id);
		if(account){
			g_onlines[account].online = false;
			console.log(account,'离开游戏');
			var isGameOver = true;
			for(var key in g_onlines){
				if(g_onlines[key].online) {
					isGameOver = false;
					break;
				}
			}
			
			if(isGameOver){
				g_joinCount = 0;
				g_stepTime = 0;
				g_gameStartTime =0;
				g_gameStatus = STATUS.WAIT;
				g_onlines ={};
				g_commands ={};
				g_commands_histroy = new Array();
				console.log('游戏结束');
			}else{
				io.sockets.emit('system',{client:account,message:'离开了游戏'});
			}
		}
	});
});

//启动定时器
var lastUpdate = Date.now();
setInterval(function(){
	var now = Date.now();
	var dt = now - lastUpdate;
	lastUpdate = now;
	lockupdate(dt);
});

var stepUpdateDt =0;
function lockupdate(dt){
	var now = Date.now();
	if(g_gameStatus == STATUS.START){
		stepUpdateDt += dt;
		if(stepUpdateDt >= g_stepInterval){
			stepUpdateDt -= g_stepInterval;
			stepUpdate(dt);
		}
	}else if(g_gameStartTime != 0 && now >g_gameStartTime){
		console.log('游戏开始:',now);
		g_gameStatus = STATUS.START;
	}
}

//执行帧
function stepUpdate(dt){
	//启动客户端同步帧
	if(g_stepTime === 0) sendStartPacket(dt);
	

	//当前关键帧是否有接收完所有客户端的控制信息,没有则等待
	if((frame + 1) %3 === 0 && g_commands.length < 2){
		return;
	}

	frame++;
	//服务端每隔3个关键帧发送同步数据
	if(frame % 3 === 0){
		g_stepTime++;
		frame = 0;
		
		var message ={};
		for(var key in g_onlines){
			message[key]={step:g_stepTime,account:key};
		}
		for(var key in g_commands){
			var command = g_commands[key];
			command.step = g_stepTime;
			message[command.account] = command;
		}

		g_commands= new Array();
		
		//模拟30ms的正常网络延迟
		//setTimeout(function(){
			
			var command = new Array();
			for(var key in message){
				command.push(message[key]);
			}
			var commands={step:command,dt:dt};
			
			//if(g_commands_histroy.length >= 2000) g_commands_histroy.splice(0,1000);
			g_commands_histroy.push(commands);
			io.sockets.emit('message',commands);
			
		//},g_simulateNetDelay);
	}




}

/**
 * 发送起始包,便于客户端启动帧同步
 */
function sendStartPacket(dt){
	var message ={};
	for(var key in g_onlines){
		message[key]={step:0,account:key};
	}
	
	var command = new Array();
	for(var key in message){
		command.push(message[key]);
	}
	var commands={step:command,dt:dt};
	
	g_commands_histroy.push(commands);
	io.sockets.emit('message',commands);
}

server.listen(3000,function(){
	console.log('Server Start Listen:3000...');
});


