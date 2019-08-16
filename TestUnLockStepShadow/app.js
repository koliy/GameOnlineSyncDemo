/**
 * 原理：(影子跟随)
 * 0.解决网络高延迟下，客户端平滑移动问题。
 *  1． 屏幕上现实的实体（entity）只是不停的追逐它的“影子”（shadow）。
 *  2． 服务器向各客户端发送各个影子的状态改变（坐标，方向，速度，时间）。
 *  3． 各个客户端收到以后按照当前重新插值修正影子状态。
 *  4． 影子状态是跳变的，但实体追赶影子是连续的，故整个过程是平滑的。
 *
 */

var http = require('http');
var GameObject = require('./GameObject');

var timestart = Date.now(); //脚本启动时间
var timenow = function(){
	return Date.now() - timestart;
};


var g_onlines = {};//所有在线玩家
var g_commands = new Array();//指令数组
var g_commands_histroy = new Array();//历史指令，用于断线重连
var g_joinCount=0;//已准备的人数
var g_maxJoinCount=2;//最大人数
var g_id =0;//用户id

var FRAME_DELAY=20;
var timebase=0;
var frame =0;//当前step时间戳,帧下标
var frameslap =0;//每个step间隔，单位ms，表示服务器1秒内发送50次数据
var phaselag = 0;

var g_gameStartTime=0;//游戏开始时间
var g_simulateNetDelay = 100;//模拟正常的30ms网络延迟。

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
				var id = g_onlines[account].entity.id;
				var entity =  new GameObject(id);
				entity.initpos();
				entity.mode = 0;
				g_onlines[account] = {socket:client,online:true,entity:entity};

				
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
			var entity =  new GameObject(g_id++);
			entity.initpos();
			entity.mode = 0;
			g_onlines[account]={socket:client,online:true,entity:entity};
			g_joinCount++;
			
		}
		//开始游戏,等待倒计时
		if(g_joinCount === g_maxJoinCount){
			g_gameStatus = STATUS.WAIT;
			g_commands = new Array();
			g_commands_histroy = new Array();
			g_gameStartTime = timenow() + 500;
			console.log('游戏预计开始时间:',g_gameStartTime);
			//向所有客户端发送开始指令
			var players = {};
			for(var key in g_onlines){
				players[key] = g_onlines[key].entity.id;
			}
			io.sockets.emit('start',{time:g_gameStartTime,timebase:timenow(),players:players});
		}
	});
	

	
	//接受客户端按键事件
	client.on('message',function(json){
		if(g_gameStatus === STATUS.START){
			var ac = getAccount(client.id);
			json.account = ac;
			g_commands.push(json);
		}
	});
	
	//相位滞后开关事件
	client.on('phaselag',function(json){
		phaselag = json.phaselag;
		io.sockets.emit('phaselag',json);
	});
	//断开连接
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
				g_id = 0;
				g_joinCount = 0;
				frame = 0;
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

//获取实体的阴影状态数据
function packetStatus(){
	var refresh = {};
	for(var key in g_onlines){
		var user = g_onlines[key];
		var update = {};
		update.x = user.entity.sx;
		update.y = user.entity.sy;
		update.v = user.entity.sv;
		update.d = user.entity.sd;
		update.frame = frame;
		update.entity = user.entity.id;
		refresh[key]=update;
	}
	return refresh;
}
//实时刷新客户端的阴影状态
function onUpdate(data){
	var _frame = frame;
	var entity = g_onlines[data.account].entity;
	entity.sx = data.x;
	entity.sy = data.y;
	entity.sd = data.d;
	entity.sv = data.v;
	
	//console.log('update:',data.account,frame,data.frame,frame-data.frame);

	//追赶客服端数据发送时到服务端接受数据所经过的时间,补偿丢失的帧
	entity.adjust(_frame - 1,data.frame);
}

//服务器每5帧向各客户端发送各个影子的状态改变（坐标，方向，速度，时间）。
function onTimer(){
	var _frame = frame;
	if(_frame % 5 === 0){
		setTimeout(function(){
			var refresh = packetStatus();
			io.sockets.emit('message',refresh);
		},g_simulateNetDelay);
	}
	//按照实体移动的方向每帧开始影子移动，直到d=0，停止
	for(var key in g_onlines){
		var entity = g_onlines[key].entity;
		if(entity.mode < 0) continue;
		entity.shadow_move(1);
	}
}

function __current(){
	return timenow() - timebase;
};

var startup = function(){
	timebase = timenow();
	frame = 0;
	phaselag = 0;
	g_gameStatus = STATUS.START;
	frameslap = __current() + FRAME_DELAY;
};


//启动定时器
setInterval(function(){
		if(g_gameStatus == STATUS.START){
			var current = __current();
			while(current >= frameslap){
				frameslap += FRAME_DELAY;
				frame +=1;
				onTimer();
			}
			//实时等待客户端的实体数据刷新阴影状态
			if(g_commands.length > 0){
				for(var i =0;i<g_commands.length;i++){
					onUpdate(g_commands[i]);
				}
				g_commands = new Array();
			}
		}else if(g_gameStartTime != 0 && timenow() >g_gameStartTime){
			console.log('游戏开始:',timenow());
			startup();
		}

		
});






server.listen(3000,function(){
	console.log('Server Start Listen:3000...');
});


