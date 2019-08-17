var consts = require('../../app/consts/consts');
var should = require('should');
var bt =require('../../app/ai/bt/bt');
var mockData = require('../util/testData');
var Scene = require('../../app/domain/area/scene');
var dataApi = require('../../app/util/dataApi');
var ai = require('../../app/ai/ai');
var Player = require('../../app/ai/brain/player');

describe('Player Brain Test',function(){
	it('should move to the target range if player have a target',function(){
		var target = mockData.getMob();
		var player = mockData.getPlayer();
		player.target = target.entityId;
		
		var moveCount = 0;
		var moveX = -1;
		var moveY = -1;
		player.move = function(x, y) {
			moveCount++;
			moveX = x;
			moveY = y;
		};
		var skill ={
			skillId:1,
			skillData:{distance:1},
			use:function(a,t){return {result:consts.AttackResult.NOT_IN_RANGE,distance:1};}
		}
		player.fightSkills[skill.skillId]=skill;
		var area = {
			getEntity:function(id){
				return target;
			},
			timer: {
				abortAction:function(){
				}
			},
		};
		
		var brain = Player.clone({blackboard:{curCharacter:player,area:area}});
		brain.update();
		moveCount.should.equal(1);
		moveX.should.equal(target.x);
		moveY.should.equal(target.y);
	});
});