var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');
var User = require('../domain/user');
var dataApi = require('../util/dataApi');
var Player = require('../domain/entity/player');
var consts = require('../consts/consts');



var userDao = module.exports;

userDao.getUserInfo = function(username,passwd,cb){

};

userDao.createUser = function(username,password,from,cb){
	var sql = 'insert into user (name,password,loginCount,lastLoginTime) values(?,?,?,?)';
	var loginTime = Date.now();
	var args = [username,password,1,loginTime];
	pomelo.app.get('dbclient').insert(sql,args,function(err,res){
		if(err !== null) utils.invokeCallback(cb,{code:err.number,msg:err.message},null);
		else{
			var user = new User({id:res.insertId,name:username,password:password});
			utils.invokeCallback(cb,null,user);
		}
	});
};


userDao.getUserById = function(uid,cb){
	var sql = 'select * from user where id = ?';
	var args =[uid];
	pomelo.app.get('dbclient').query(sql,args,function(err,res){
		if(err !== null){
			utils.invokeCallback(cb,err.message,null);
			return;
		}
		
		if(!!res && res.length>0) utils.invokeCallback(cb,null,new User(res[0]));
		else utils.invokeCallback(cb, ' user not exist ',null);
	});
};


userDao.getUserByName = function(username,cb){
	var sql = 'select * from user where name = ?';
	var args = [username];
	pomelo.app.get('dbclient').query(sql,args,function(err,res){
		
		if(err !== null) utils.invokeCallback(cb,err.message,null);
		else{
		
			if(!!res && res.length === 1){
				var rs = res[0];
				var user = new User({id:rs.id,name:rs.name,password:rs.password});
				utils.invokeCallback(cb,null,user);
			}else utils.invokeCallback(cb,' user not exist ', null);
		}
	});
};
/**
 * Get an user's all players by userId
 * @param {Number} uid User Id.
 * @param {function} cb Callback function.
 */
userDao.getPlayersByUid = function(uid,cb){
	var sql = 'select * from Player where userId = ?';
	var args = [uid];
	
	pomelo.app.get('dbclient').query(sql,args,function(err,res){
		if(err){
			utils.invokeCallback(cb,err.message,null);
			return;
		}
		
		if(!res || res.length <= 0){
			utils.invokeCallback(cb,null,[]);
			return;
		}else{
			utils.invokeCallback(cb,null,res);
		}
	});
};
/***
 *  get user's player by name
 * @param name
 * @param cb
 */
userDao.getPlayerByName = function(name,cb){
	var sql = 'select * from Player where name = ?';
	var args =[name];
	pomelo.app.get('dbclient').query(sql,args,function(err,res){
		if(err !== null) utils.invokeCallback(cb,err.message,null);
		else if(!res || res.length <= 0) utils.invokeCallback(cb,null,null);
		else utils.invokeCallback(cb,null, new Player(res[0]));
	});
};

userDao.createPlayer = function(uid,name,roleId,cb){
	var sql = 'insert into Player (userId,kindId,kindName,name,country,rank,level,experience,attackValue,defenceValue,hitRate, dodgeRate, walkSpeed, attackSpeed, hp, mp, maxHp, maxMp, areaId, x, y, skillPoint) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
	var character = dataApi.character.findById(roleId);
	var role = {name:character.englishName,career:'warrior',country:1,gender:'male'};
	var born = consts.BornPlace;
	var x = born.x + Math.floor(Math.random()*born.width);
	var y = born.y + Math.floor(Math.random()*born.height);
	var areaId = consts.PLAYER.initAreaId;
	
	var args = [uid,roleId,character.englishName,name,1,1,1,0,character.attackValue,character.defenceValue,character.hitRate, character.dodgeRate, character.walkSpeed, character.attackSpeed, character.hp, character.mp, character.hp, character.mp, areaId, x, y, 1];

	pomelo.app.get('dbclient').insert(sql,args,function(err,res){
		if(err !== null){
			logger.error('create player failed! '+err.message);
			logger.error(err);
			utils.invokeCallback(cb,err.message,null);
		}else{
			var player = new Player({
				id:res.insertId, //取得上一步INSERT 操作产生的ID
				userId:uid,
				kindId:roleId,
				kindName:role.name,
				areaId:areaId,
				roleName:name,
				rank:1,
				level:1,
				experience:0,
				attackValue:character.attackValue,
				defenceValue:character.defenceValue,
				skillPoint:1,
				hitRate:character.hitRate,
				dodgeRate: character.dodgeRate,
				walkSpeed: character.walkSpeed,
				attackSpeed: character.attackSpeed,
				equipments: {},
				bag: null
			});
			
			utils.invokeCallback(cb,null,player);
		}
	});
	

};

/**
 * 获取player数据类结构
 * @param playerid
 * @param cb
 */
userDao.getPlayerById = function(playerid,cb){
	var sql = 'select * from Player where id = ?';
	var args =[playerid];
	
	pomelo.app.get('dbclient').query(sql,args,function(err,res){
		if(err !== null){
			utils.invokeCallback(cb,err.message,null);
		}else if(!res || res.length <= 0){
			utils.invokeCallback(cb,null,[]);
			return;
		}else {
			utils.invokeCallback(cb,null ,new Player(res[0]));
		}
	});
};

userDao.getPlayerAllInfo = function(playerId,cb){

		var p0 =  new Promise(function(resolve,reject){
			userDao.getPlayerById(playerId,function(err,player){
				if(!!err || !player) logger.error('Get user for userDao failed! ' + err.stack);
				resolve(player);
			});
		});
	    //获取装备数据
		var p1 = new Promise(function(resolve,reject){
			
			resolve(null);
		})
		//获取背包数据
		var p2 = new Promise(function(resolve,reject){
			resolve(null);
		});
		//获取技能数据
		var p3 = new Promise(function(resolve,reject){
			resolve(null);
		});
		
		//获取任务数据
		var p4 = new Promise(function(resolve,reject){
			resolve(null);
		});
		
		Promise.all([p0,p1,p2,p3,p4]).then((results)=>{
			var player = results[0];
			var equipments = results[1];
			var bag = results[2];
			var fightSkills = results[3];
			var tasks = results[4];
			// player.bag = bag;
			// player.setEquipments(equipments);
			// player.addFightSkills(fightSkills);
			// player.curTasks = tasks || {};
			
			
			utils.invokeCallback(cb,null,player);
			
		}).catch((err)=>{
			logger.error(err);
			utils.invokeCallback(cb,err);
		});

};

userDao.updatePlayer = function(player,cb){
	var sql = 'update Player set x = ? ,y = ? , hp = ?, mp = ? , maxHp = ?, maxMp = ?, country = ?, rank = ?, level = ?, experience = ?, areaId = ?, attackValue = ?, defenceValue = ?, walkSpeed = ?, attackSpeed = ? , skillPoint = ? where id = ?';
	var args = [player.x, player.y, player.hp, player.mp, player.maxHp, player.maxMp, player.country, player.rank, player.level, player.experience, player.areaId, player.attackValue, player.defenceValue, player.walkSpeed, player.attackSpeed, player.skillPoint, player.id];
	
	pomelo.app.get('dbclient').query(sql,args,function(err,res){
		if(err !== null) utils.invokeCallback(cb,err.message,null);
		else{
			if(!!res && res.affectedRows >0) //记录行数
				utils.invokeCallback(cb,null,true);
			else{
				logger.error('update player failed');
				utils.invokeCallback(cb,null,false);
			}
		}
	});
};


