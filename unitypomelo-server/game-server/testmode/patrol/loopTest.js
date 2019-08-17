var should = require('should');
var bt =require('../../app/ai/bt/bt');
var Loop = require('../../app/ai/patrol/mode/loop');
var mockData = require('../util/testData');
var Scene = require('../../app/domain/area/scene');
var dataApi = require('../../app/util/dataApi');
/**
 * 说明，测试的时候在testmode目录下 ，用cmd命令:mocha ./patrol/loopTest 测试数据更清晰点，所有需要npm安装mocha，should模块
 */
describe('Loop test',function(){
	it('should loop the rounds and then return success',function(){
		var areaconifg = dataApi.area.findById(1);
		//areaconifg.path = '/game-server/config/map/desert.json';
		Scene.init(areaconifg);
		
		var mob = mockData.getMob();
		mob.x = 0;
		mob.y = 0;
		mob.area=Scene.getArea();
		
		var path = [{x: 100, y: 100}, {x: 100, y: 150}];
		var rounds = 2;
		var loop = new Loop({
			character: mob,
			path: path,
			rounds: rounds
		});
		//
		var res = loop.doAction();
		res.should.equal(bt.RES_WAIT);
		
		var l = path.length * rounds;
		for(var i =0;i<l;i++){
			var pos = path[i%path.length];
			mob.x = pos.x;
			mob.y = pos.y;

			var res = loop.doAction();
			if(i === l -1) res.should.equal(bt.RES_SUCCESS);
			else res.should.equal(bt.RES_WAIT);
		}
	});
	
	
	it('should move around with the path in infinite loop if rounds is -1',function(){
		var areaconifg = dataApi.area.findById(1);
		//areaconifg.path = '/game-server/config/map/desert.json';
		Scene.init(areaconifg);
		
		var mob = mockData.getMob();
		mob.x = 0;
		mob.y = 0;
		mob.area=Scene.getArea();
		var path = [{x: 100, y: 100}, {x: 200, y: 100}, {x: 200, y: 200}];
		var rounds = -1;
		var loop = new Loop({
			character: mob,
			path: path,
			rounds: rounds
		});
		
		var res = loop.doAction();
		res.should.equal(bt.RES_WAIT);
		
		//loop some rounds to test infinite loop
		var l = path.length * 10;
		for(var i=0; i<l; i++) {
			var pos = path[i % path.length];
			mob.x = pos.x;
			mob.y = pos.y;
			var res = loop.doAction();
			res.should.equal(bt.RES_WAIT);
		}
	});
});
