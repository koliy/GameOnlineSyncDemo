module.exports = {
	PLAYER : {
		initAreaId : 1,
		level : 1,
		reviveTime : 5000,
		RECOVER_WAIT : 10000,    //You must wait for at lest 10s to start recover hp.
		RECOVER_TIME : 10000     //You need 10s to recover hp from 0 to full.
	},
	BornPlace : {
		x : 346,
		y : 81,
		width : 126,
		height : 129
	},
	AreaType : {
		SCENE : 1,
		SINGLE_INSTANCE : 2,
		TEAM_INSTANCE : 3
	},
	EntityType:{
		PLAYER:'player',
		NPC:'npc',
		MOB:'mob',
		EQUIPMENT:'equipment',
		ITEM:'item',
		BAG:'bag'
	},
	AttackResult: {
		SUCCESS: 1,
		KILLED : 2,
		MISS: 3,
		NOT_IN_RANGE: 4,
		NO_ENOUGH_MP: 5,
		NOT_COOLDOWN: 6,
		ATTACKER_CONFUSED: 7,
		ERROR: -1
	},
	NPC: {
		SUCCESS: 1,
		NOT_IN_RANGE: 2
	},
	
	//设置哪些npc是传送npc，kindId:areaid
	TraverseNpc:{
		304:2,
		305:1
	}
	
};


