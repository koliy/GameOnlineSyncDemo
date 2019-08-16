/**
 * 原理：(乐观帧:轮结构)
 * 1.服务端设置每秒钟50次向更新所有客户端发送的消息，每update为一帧，每隔几个关键帧便发送同步包。
 *
 * 2.客户端每几个关键帧播放服务端的数据，如果当前关键帧没有数据，就必须等待
 *
 * 3.客户端就像播放游戏录像一样不停的播放这些包含每帧所有玩家操作的 update消息。
 * 4.客户端如果一帧内接受到很多连续的数据，说明延迟或断线重连了，则快进播放。
 * 5.客户端只有按键按下或者放开，就会发送消息给服务端（而不是到每帧开始才采集键盘），
 * 消息只包含一个整数。服务端收到以后，改写player_keyboards
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
			g_commands.push(json);

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
	frame++;
	//服务端每隔3个关键帧发送同步数据
	if(frame % 3 === 0){
		g_stepTime++;
		
		var message ={};
		for(var key in g_onlines){
			message[key]={step:g_stepTime,account:key};
		}
		
		for(var i =0,imax =g_commands.length ;i<imax;i++){
			var command = g_commands[i];
			command.step = g_stepTime;
			message[command.account] = command;
		}
		
		g_commands=new Array();
		
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


server.listen(3000,function(){
	console.log('Server Start Listen:3000...');
});


