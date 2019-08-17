var consts = require('../../app/consts/consts');
var should = require('should');
var bt =require('../../app/ai/bt/bt');
var mockData = require('../util/testData');
var Scene = require('../../app/domain/area/scene');
var dataApi = require('../../app/util/dataApi');
var ai = require('../../app/ai/ai');
var Triger = require('../../app/ai/brain/tiger');

describe('Tiger brain Test',function(){
	it('should patrol if it could not find a target ',function(){
		//var areaconifg = dataApi.area.findById(1);
		//Scene.init(areaconifg);
		var mob = mockData.getMob();
		mob.x = 0;
		mob.y = 0;
		//mob.area=Scene.getArea();
		
		var patrolCount = 0;
		var area = {
			timer: {
				patrol: function () {
					patrolCount++;
				}
			},
			getEntity:function(id){
				return null;
			},
		};


		var brain = Triger.clone({blackboard:{curCharacter:mob,area:area}});
		brain.update();
		patrolCount.should.equal(1);
	});
	
	it('should attack the target with normal attack',function(){
		var mob = mockData.getMob();
		var target = mockData.getPlayer();
		mob.target = target.entityId;
		var attackCount =0;
		mob.attack = function(){
			attackCount++;
			return {result:consts.AttackResult.SUCCESS};
		};
		
		var patrolCount = 0;
		var area = {
			getEntity:function(id){
				if(id === target.entityId){
					return target;
				}else{
					return null;
				}

			}
		};
		
		var brain = Triger.clone({blackboard:{curCharacter:mob,area:area}});
		brain.update();
		attackCount.should.equal(1);
	});

	it('should move to the target if the target is beyond the attack range',function(){
		var mob = mockData.getMob();
		var target = mockData.getPlayer();
		mob.target = target.entityId;
		mob.x = 0;mob.y=0;
		target.x = 100;
		target.y = 100;
		var moveCount = 0;
		var moveX = -1;
		var moveY = -1;
		
		mob.move = function(x, y) {
			moveCount++;
			moveX = x;
			moveY = y;
		};
		
		var skill ={
			skillId:1,
			skillData:{distance:1},
			use:function(a,t){return {result:consts.AttackResult.NOT_IN_RANGE,distance:1};}
		}
		mob.fightSkills[skill.skillId]=skill;
		var area = {
			getEntity:function(id){
				if(id === target.entityId){
					return target;
				}else{
					return null;
				}
				
			},
			timer: {
				patrol: function () {
				
				},
				abortAction:function(){
				
				}
			},
		};
		
		var brain = Triger.clone({blackboard:{curCharacter:mob,area:area}});
		brain.update();
		moveCount.should.equal(1);
		moveX.should.equal(target.x);
		moveY.should.equal(target.y);
		
	});
	
	it('should attack the new target if the target has change',function(){
		var mob = mockData.getMob();
		var target = mockData.getPlayer();
		mob.target = target.entityId;
		mob.x = 0;mob.y=0;
		target.x = 100;
		target.y = 100;
		var moveCount = 0;
		var moveX = -1;
		var moveY = -1;
		
		mob.move = function(x, y) {
			moveCount++;
			moveX = x;
			moveY = y;
		};
		
		var skill ={
			skillId:1,
			skillData:{distance:1},
			use:function(a,t){return {result:consts.AttackResult.NOT_IN_RANGE,distance:1};}
		}
		mob.fightSkills[skill.skillId]=skill;
		var area = {
			getEntity:function(id){
				if(id === target.entityId){
					return target;
				}else{
					return null;
				}
				
			},
			timer: {
				patrol: function () {
				
				},
				abortAction:function(){
				
				}
			},
		};
		
		var brain = Triger.clone({blackboard:{curCharacter:mob,area:area}});
		var res = brain.update();
		res.should.equal(bt.RES_WAIT);
		moveCount.should.equal(1);
		moveX.should.equal(target.x);
		moveY.should.equal(target.y);
		
		var target2 = mockData.getPlayer();
		target2.id =3;
		target2.x = 200;
		target2.y = 300;
		mob.target = target2.entityId;
		area.getEntity=function(id){
				return target2;
		};
		
		res = brain.update();
		res.should.equal(bt.RES_SUCCESS);
		res = brain.update();
		res.should.equal(bt.RES_WAIT);
		moveCount.should.equal(2);
		moveX.should.equal(target2.x);
		moveY.should.equal(target2.y);
		
	});
	
	it('should invoke move again if the target position changed',function(){
		var mob = mockData.getMob();
		var target = mockData.getPlayer();
		mob.target = target.entityId;
		mob.x = 0;mob.y=0;
		target.x = 100;
		target.y = 100;
		var moveCount = 0;
		var moveX = -1;
		var moveY = -1;
		
		mob.move = function(x, y) {
			moveCount++;
			moveX = x;
			moveY = y;
		};
		
		var skill ={
			skillId:1,
			skillData:{distance:1},
			use:function(a,t){return {result:consts.AttackResult.NOT_IN_RANGE,distance:1};}
		}
		mob.fightSkills[skill.skillId]=skill;
		var area = {
			getEntity:function(id){
				if(id === target.entityId){
					return target;
				}else{
					return null;
				}
				
			},
			timer: {
				patrol: function () {
				
				},
				abortAction:function(){
				
				}
			},
		};
		
		var brain = Triger.clone({blackboard:{curCharacter:mob,area:area}});
		var res = brain.update();
		res.should.equal(bt.RES_WAIT);
		moveCount.should.equal(1);
		moveX.should.equal(target.x);
		moveY.should.equal(target.y);
		
		target.x +=100;
		target.y += 100;
		brain.update();
		moveCount.should.equal(2);
		moveX.should.equal(target.x);
		moveY.should.equal(target.y);
		
	});
});