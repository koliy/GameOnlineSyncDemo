


//是否连接socket
var isConnected = false;
var gameStatus = STATUS.WAIT;
var inputDirection = Direction.NULL;
var frame=0;//间隔帧
var stepTime = 0;//帧下标
var stepInterval = 20;//每个step间隔，单位ms，表示客户端1秒内刷新50次数据
var stepUpdateDt=0;
//模拟丢包数
var simulateLossCount =0;
//模拟30ms的正常网络延迟RTT
var simulateNetDelay = 30;


//游戏开始时间
var gameStartTime =0;
//所有在线玩家
var onlineuser={};
var playeraccount='';
//所有游戏对象
var gameobjects={};
//所有接受的指令
var recvCommands = new Array();
//所有丢包的指令
var delayCommands = new Array();
var socket = null;
var context = null;
//本地和服务端的时差
var timeDiff = 0;
function getTime(){
	return Date.now()+timeDiff;
}

$(document).ready(function(){
	context = document.getElementById('canvas').getContext('2d');

	function getTime(){
		return Date.now() + timeDiff;
	}
	
	recvCommands = new Array();
	delayCommands = new Array();
	
	$('#content').hide();
	$('#login').show();
	$('#tips').hide();
	
	$('body').keydown(ListenKeyDown);
	$('#btnStart').click(btnStartGameEvent);
	//模拟丢包
	$('#btnLoss').click(function(){
		simulateLossCount +=20;
	});
	//模拟断线重来了
	$('#btnReconnect').click(function(){
		location.reload();
	});
	initSocket();
	
	var lastUpdate = getTime();
	setInterval(function(){
		var now = getTime();
		var dt = now - lastUpdate;
		lastUpdate = now;
		update(dt);
		if(isConnected === true && socket){
			socket.emit('timeSync',now);
		}
	})
});

//监听按键
function ListenKeyDown(e){

		if(gameStatus !== STATUS.START) return;
		switch (e.keyCode){
			case 38:inputDirection = Direction.UP;break;
			case 40: inputDirection = Direction.DOWN; break;
			case 37: inputDirection = Direction.LEFT; break;
			case 39: inputDirection = Direction.RIGHT; break;
			case 13: inputDirection = Direction.STOP; break;
		}
		
		sendCommand();
	
};
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
		}
		gameStartTime = data.time;
		//处理重连
		var delay = getTime() - gameStartTime;
		if(delay > 0){
			stepTime = Math.floor(delay/stepInterval); //当前帧下标
		}
	});
	
	//对时
	var totalDiff=0;
	var diffCount=0;
	socket.on('timeSync',function(json){
		var client = json.client;
		var server = json.server;
		var now = getTime();
		var delay = (now - client) * 0.5;//网络延迟时间
		//本地时差
		var diff = server - (client + delay);
		
		diffCount++;
		totalDiff += diff;
		if(diffCount>60){
			$("#lag").text('延迟：'+delay+"ms");
			diff = Math.round(totalDiff/diffCount);
			timeDiff += diff;
			diffCount = 0;
			totalDiff =0;
		}
	});
	
	//收到指令
	socket.on('message',function(json){
		if(simulateLossCount > 0){
			simulateLossCount--;
			delayCommands = delayCommands.concat(json);
			return;
		}
		recvCommands = recvCommands.concat(delayCommands);
		recvCommands = recvCommands.concat(json);
		delayCommands = new Array();

	});
}

function sendCommand(){
	var direction = inputDirection;
	var time = stepTime;
	
	//setTimeout(function(){
		socket.emit('message',{direction:direction,time:time});
	//},simulateNetDelay);

};

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

function drawGameSceen(dt){
	context.clearRect(0,0,800,600);
	for(var key in gameobjects){
		var obj = gameobjects[key];
		context.fillStyle = '#000000';
		context.fillRect(obj.x,obj.y,30,30);
	}
}

function update(dt){
	var now = getTime();
	if(gameStatus === STATUS.START){
		stepUpdateDt +=dt;
		if(stepUpdateDt >= stepInterval){
			
			stepUpdate(dt);
			stepUpdateDt -= stepInterval;
		}
	}else if(gameStartTime !== 0 && now > gameStartTime){
		console.log('游戏开始:',now);
		gameStatus = STATUS.START;
	}
};

function stepUpdate(dt){
	//当前关键帧，没有数据则等待
	if((frame+1  )%3=== 0 && recvCommands.length === 0){
		return;
	}

	frame++;
	//每隔3帧应用数据
	if(frame %3 === 0){
		stepTime++;
		
		for(var i=0;i<recvCommands.length;++i){
			var commands = recvCommands[i].step;
			var _dt = recvCommands[i].dt;
			for(var j=0;j<commands.length;++j){
				var command = commands[j];
				var id = onlineuser[command.account];
				var obj = gameobjects[id];
				if(command.direction && obj) obj.direction = command.direction;
				obj.move(_dt);
			}
			
		}

		recvCommands = new Array();
	}

	drawGameSceen(dt);

}

