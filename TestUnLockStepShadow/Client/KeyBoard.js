
var keylist={UP:0,DOWN:0,LEFT:0,RIGHT:0,ENTER:0};

//监听按键
function ListenKeyDown(e){
	
	if(gameStatus !== STATUS.START) return;
	switch (e.keyCode){
		case 38: keylist.UP = 1;break;
		case 40: keylist.DOWN = 1; break;
		case 37: keylist.LEFT =1; break;
		case 39: keylist.RIGHT=1;  break;
		case 13: keylist.ENTER = keylist.ENTER ^1; socket.emit('phaselag',{phaselag:keylist.ENTER});break;
	}

};

function ListenKeyUp(e){
	if(gameStatus !== STATUS.START) return;
	switch (e.keyCode){
		case 38: keylist.UP = 0;break;
		case 40: keylist.DOWN = 0; break;
		case 37: keylist.LEFT =0; break;
		case 39: keylist.RIGHT=0;  break;
	}
}

function KeyBoardDir(){
	var d = 0;
	if(keylist.UP === 1){
		if(keylist.LEFT === 1) d=8;
		else if(keylist.RIGHT ===1)  d=2;
		else d=1;
	}
	
	if(keylist.DOWN === 1){
		if(keylist.LEFT === 1) d=6;
		else if(keylist.RIGHT ===1)  d=4;
		else d=5;
	}
	
	if(d=== 0){
		if(keylist.LEFT === 1) d=7;
		if(keylist.RIGHT === 1) d=3
	}
	return d;
}

/**
 * 检测是否开启相位滞后
 * @returns {boolean}
 * @constructor
 */
function CheckPhase(){
	return keylist.ENTER === 1;
}