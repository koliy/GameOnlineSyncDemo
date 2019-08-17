var utils = module.exports;

utils.invokeCallback =function (cb) {
	if(!!cb && typeof cb === 'function'){
		cb.apply(null,Array.prototype.slice.call(arguments,1)); //slice返回一个数组，该方法只有一个参数的情况下表示除去数组内的第一个元素。就本上下文而言，原数组的第一个参数是“事件名称”
	}
};

utils.clone = function(origin){

	if(!origin)return ;
	var obj = {};
	for(var f in origin){
		if(origin.hasOwnProperty(f)) obj[f] = origin[f];
	}

	return obj;
};