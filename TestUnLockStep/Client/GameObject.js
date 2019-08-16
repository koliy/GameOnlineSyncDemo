
 function GameObject(id){
	this.id = id;
	this.x = 0;
	this.y = 0;
	this.direction = Direction.STOP;
	this.speed = 0.5;
	this.move = function(dt){
		switch (this.direction){
			case Direction.UP:{
				this.y -= this.speed*dt;
				break;
			}
			case Direction.DOWN:{
				this.y += this.speed*dt;
				break;
			}
			case Direction.LEFT:{
				this.x -= this.speed *dt;
				break;
			}
			case Direction.RIGHT:{
				this.x += this.speed*dt;
				break;
			}
		}
	}
};
