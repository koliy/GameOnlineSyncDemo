var User = function(opts){
	this.id = opts.id;
	this.name = opts.name;
	this.password = opts.password;
	this.loginCount = opts.loginCount;
	this.lastLoginTime = opts.lastLoginTime;
};

module.exports = User;