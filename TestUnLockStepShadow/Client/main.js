
var timestart = Date.now(); //脚本启动时间
function timenow(){
	return Date.now() - timestart;
};

//是否连接socket
var isConnected = false;
var gameStatus = STATUS.WAIT;

//模拟丢包数
var simulateLossCount =0;
//模拟30ms的正常网络延迟RTT
var simulateNetDelay = 30;

var timebase =0;
var timesvr = 0;

var FRAME_DELAY = 20;
var frame=0;//帧下标
var frameslap = 0;
var phaselag=0;

//游戏开始时间
var gameStartTime =0;
//所有在线玩家
var onlineuser={};
var playeraccount='';
//所有游戏对象
var gameobjects={};
var myself;

//所有接受的指令
var recvCommands = new Array();
//所有丢包的指令
var delayCommands = new Array();
var socket = null;
var context = null;

function __current(){
	return timesvr + timenow() - timebase;
}

function __current2(){
	return timenow() - timebase;
}


$(document).ready(function(){
	context = document.getElementById('canvas').getContext('2d');

	recvCommands = new Array();
	delayCommands = new Array();
	timebase = timenow();
	
	$('#content').hide();
	$('#login').show();
	$('#tips').hide();
	
	$('body').keydown(ListenKeyDown);
	$('body').keyup(ListenKeyUp);
	
	$('#btnStart').click(btnStartGameEvent);
	$('#btnDelay').click(function(){
		simulateNetDelay =100;
	});
	//模拟丢包
	$('#btnLoss').click(function(){
		simulateLossCount +=10;
	});

	initSocket();

	setInterval(function(){

		if(gameStatus === STATUS.START){
			var current = __current2();
			while(current >= frameslap){
				frameslap += FRAME_DELAY;
				frame +=1;
				onTimer();
			}
		}else if(gameStartTime !== 0 && __current() > gameStartTime){
			console.log('游戏开始:',__current());
			startup();
		}
	});

});

function startup(){
	frame = 0;
	gameStatus = STATUS.START;
	timebase = timenow();
	frame = 0;
	frameslap = __current2() + FRAME_DELAY;
	
	drawGameSceen();
};

//客户端主程序，影子表现的方式为：
//主机：影子跟随主角
//从机：从机跟随影子
//概念是明确的：服务端只同步影子数据。对服务器来说影子就是实体对象数据。
//站在主机方向来看：主角就像一个虚构的影子，不考虑网络延迟情况，立即响应按键移动。主角对应的
//影子数据随后平滑插值移动。
//在从机方向来看：从机也像个虚构的影子，因考虑网络延迟情况下，就需要平滑插值移动到影子的状态
//这样，在延迟状态下，各个实体就表现为平滑移动。没有跳变，拉扯的表现。

function onTimer(){
	var _frame = frame;
	var current = __current2();
	//移动本主机对象状态
	var d = KeyBoardDir();
	myself.d=d;
	myself.v=4;
	myself.entity_move(1);

	//每5帧报告一次实体状态
	if(_frame % 5 === 0){
		var update = {};
		update.entity = myself.id;
		update.frame= _frame;
		update.x = myself.x;
		update.y = myself.y;
		update.d = myself.d;
		update.v = myself.v;
		setTimeout(function(){
			
			socket.emit('message',update);
		},simulateNetDelay);
		

	}
	
	//实时等待所有客户端的影子数据,刷新所有影子状态数据,sd=0,停止时，影子就是最后的位置
	if(recvCommands.length > 0){
		for(var i =0;i<recvCommands.length;i++){
			onUpdate(recvCommands[i]);
		}
		recvCommands = new Array();
	}
	
	//每帧移动一次
	//同步服务端的影子状态:让所有实体的影子按影子移动方向先移动，直到sd=0，停止
	for(var key in gameobjects){
		var entity = gameobjects[key];
		if(entity.mode < 0) continue;
		entity.shadow_move(1);
	}
	
	//更新非主角实体，让他朝自己的影子飞过去，每帧移动实体到影子之间的距离，造成跟随现象。
	for(var key in gameobjects){
		var entity = gameobjects[key];
		if(entity.mode < 0) continue;
		
		if(entity.mode === 0){
			entity.trace_mode = phaselag;// 是否开启相位滞后
			entity.trace(1);
		}
	}
	drawEntityAndShadow();
}

//实时刷新客户端的阴影状态
function onUpdate(update){
	var _frame = frame;

	for(var key in update){
	
		if(isNaN(onlineuser[key])) continue;
		
		var data = update[key];
		var id = onlineuser[key];
		var entity = gameobjects[id];
		entity.sx = data.x;
		entity.sy = data.y;
		entity.sd = data.d;
		entity.sv = data.v;
		//追赶服务端数据发送时到客户端端接受数据所经过的时间,补偿丢失的帧
		entity.adjust(_frame,data.frame);
		//console.log('update:',key,frame,data.frame,frame-data.frame);
	}
}




var btnStartGameEvent = function(){
	var account = $('#account').val().trim();
	if(isConnected == false){
		showTips('连接服务器失败');
	}else{
		if(account === ''){
			showTips('账号不能为空');
		}else{
			playeraccount = account;
			socket.emit('join',account);
		}
		
	}
};

function initSocket(){

	socket = io('http://localhost:3000');
	socket.on('open', function(id){
		console.log('连接成功:',id);
		isConnected = true;
	});
	
	socket.on('disconnect', function(){
		gameStatus = STATUS.END;
		gameStartTime = 0;
		showTips('与服务器断开连接');
	});
	
	socket.on('join',function(data){
		showTips(data.message);
		if(data.result){
			$('#login').hide();
			$('#content').show();
		}
	});
	
	socket.on('system',function(data){
		showTips(data.client+data.message);
	});
	
	//游戏开始
	socket.on('start',function(data){
		console.log(data);
		onlineuser = data.players;
		for(var key in data.players){
			var id = data.players[key];
			gameobjects[id] = new GameObject(id);
			gameobjects[id].initpos();
			gameobjects[id].mode = 0;
			if(key === playeraccount) {
				myself = gameobjects[id];
				gameobjects[id].mode = 1;
			}
		}
		
		timebase = timenow();
		gameStartTime = data.time;
		timesvr = data.timebase;
	});
	
	
	//收到指令
	socket.on('message',function(json){
		
		if(simulateLossCount>0){
			simulateLossCount--;
			delayCommands = delayCommands.concat(json);
			return;
		}
		
			recvCommands = recvCommands.concat(delayCommands);
			recvCommands= recvCommands.concat(json);
			delayCommands = new Array();
	
	});
	
	//相位滞后开关事件
	socket.on('phaselag',function(json){
		phaselag = json.phaselag;
		var txt = phaselag == 1?'ON':"Off";
		$('#phaselag').text("相位滞后:" +txt );
	});
}



function showTips(msg){
	var width = msg.length * 20 +50;
	var halfScreenW = $(window).width()/2;
	var halfScreenH = $(window).height()/2;
	
	$('#tips').stop();
	$('#tips').show();
	$('#tips').text(msg);
	$('#tips').css("width",width);
	$("#tips").css("top", halfScreenW);
	$("#tips").css("left", halfScreenH - width / 2);
	$("#tips").animate({top:halfScreenH - 100});
	$("#tips").fadeOut();
};

async function drawGameSceen(){
	context.clearRect(0,0,800,600);
	
	for(var key in gameobjects){
		var obj = gameobjects[key];
		var index = key % 2 + 1;
		
		await Promise.resolve().then(function(data){
			return new Promise(function(resolve,reject){
				var img = new Image();
				img.src = "aircraft"+index+".gif";
				img.onload=function(){
					context.drawImage(img,obj.x,obj.y,32,32);
					console.log(index,obj.x,obj.y);
					obj.img = img;
					resolve();
				};
			});
		}).then(function(data){
			return new Promise(function(resolve,reject){
				
				var img = new Image();
				img.src = "aircraft"+index+".gif";
				img.onload=function(){
					context.globalAlpha =0.3;
					context.beginPath();
					context.drawImage(img,obj.sx,obj.sy,32,32);
					context.closePath();
					context.save();
					context.globalAlpha =1;

					obj.shadow = img;
					resolve();
				};

			});
		});

	}

}




function drawEntityAndShadow(){
	context.clearRect(0,0,800,600);
	for(var key in gameobjects){
		var obj = gameobjects[key];
		if(!!!obj.img) continue;
		context.drawImage(obj.img,obj.x,obj.y,32,32);
		if(!!!obj.shadow) continue;

		context.globalAlpha =0.3;
		context.beginPath();
		context.drawImage(obj.shadow,obj.sx,obj.sy,32,32);
		context.closePath();
		context.save();
		context.globalAlpha =1;
	}
}


function drawShadow(){
	//context.clearRect(0,0,800,600);
	for(var key in gameobjects){
		var obj = gameobjects[key];
		if(!!!obj.shadow) continue;
		context.globalAlpha =0.3;
		context.beginPath();
		context.drawImage(obj.shadow,obj.sx,obj.sy,32,32);
		context.closePath();
		context.save();
		context.globalAlpha =1;
	}
}


function drawEntity(){
	//context.clearRect(0,0,800,600);
	for(var key in gameobjects){
		var obj = gameobjects[key];
		if(!!!obj.img) continue;
		context.drawImage(obj.img,obj.x,obj.y,32,32);
	}
}

function ClearEntity(x,y) {
	context.clearRect(x,y,32,32);
}