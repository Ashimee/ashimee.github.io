/*-------------------------------------------------------------------------------------------------
 All code is copyright Keilan, 2015.
 http://scholtek.com
 Feel free to use the code for learning purposes or adapt sections for building
 your own stuff, but do not claim it as your own.
 /------------------------------------------------------------------------------------------------*/

/*-------------------------------------------------------------------------------------------------
 GENERAL HELPER FUNCTIONS
 /------------------------------------------------------------------------------------------------*/
function get(item){
    return document.getElementById(item);
}

//Gets a random integer between min and max
function getRandom(min, max){
    return Math.floor(Math.random() * (max-min+1)) + min;
}

//Used to set a variable to default if it's undefined
function setDefault(v,def){
    return typeof v !== 'undefined' ? v : def; 
}

function time(){
	return new Date().getTime();
}

//Returns an equivalent angle between 0 and 2*PI, expects the angle in radians
function reduceAngle(a){
	var two_pi = Math.PI*2;
	while(a < 0){
		a += two_pi;
	}
	while(a >= two_pi){
		a -= two_pi;
	}
	return a;
}

/*-------------------------------------------------------------------------------------------------
CONSTANTS
/------------------------------------------------------------------------------------------------*/
//Game parameters
window.BH = {};
BH.ui = {}; //Stores ui elements

BH.width = 800;
BH.height = 600;
BH.playableWidth = 800;
BH.playableHeight = 525;
BH.playableArea = BH.playableWidth*BH.playableHeight;
BH.p2Scale = 1/40; //P2 units per pixel
BH.showFPS = true;

//Constants
BH.baseBeaterSize = 128;
BH.beaterSpriteSize = 64;
BH.burstMinimum = 60;
BH.burstMaximum = 100;
BH.burstTime = 20;
BH.burstSpeed = 500;
BH.cloakMinimum = 30;
BH.cloakMaximum = 40;
BH.cloakDuration = 25;

//Main phaser variables
BH.game = null;
BH.walls = null;
BH.blackholes = null;
BH.enemies = null;
BH.collisionGroup = null;
BH.music = null;
BH.instructions = null;

//Contact Materials
BH.worldMaterial = null;
BH.enemyMaterial = null;
BH.blackholeMaterial = null;

//State variables
BH.currentHole = null;
BH.currentArea = 0;
BH.grow = false;
BH.startTime = null;

//Game variables
BH.stage = 1;
BH.score = 0;
BH.initialLives = 9999;
BH.lives = BH.initialLives;
BH.initialRemaining = 30;
BH.holesRemaining = BH.initialRemaining;
BH.pixelsCovered = 0;
BH.fractionNeeded = 0.5;

//Saving
BH.HTML5_LOCAL_STORAGE_NAME = "SCHOLTEK-BLACKHOLES-SAVEOBJECT";
BH.maxStage = 1;
BH.musicOn = true; //Set at load

//Specify which enemies appear on a given level
BH.levels = [
	{'scout':2},
	{'scout':3},
	{'scout':1,'destroyer':1},
	{'scout':2,'destroyer':2},
	{'destroyer':5},
	{'neutron':1},
	{'scout':5,'neutron':1},
	{'scout':5,'neutron':4},
	{'scout':1,'splitter':1},
	{'splitter':2},
	{'destroyer':2,'splitter':2},
	{'scout':1,'destroyer':1,'neutron':1,'splitter':1},
	{'splitter':3},
	{'beater':1},
	{'beater':1,'scout':2},
	{'beater':3,'scout':2},
	{'beater':2,'neutron':2},
	{'beater':1,'splitter':2},
	{'beater':5},
	{'burster':3},
	{'burster':2,'scout':3},
	{'scout':8},
	{'destroyer':8},
	{'burster':3,'neutron':2},
	{'scout':1,'destroyer':1,'neutron':1,'splitter':1,'beater':1,'burster':1},
	{'burster':5},
	{'scout':5,'speeder':1},
	{'scout':1,'speeder':5},
	{'speeder':3,'beater':2},
	{'speeder':2,'splitter':2},
	{'burster':5},
	{'speeder':4,'neutron':3},
	{'cloaker':1},
	{'cloaker':3},
	{'scout':4,'splitter':1,'speeder':1},
	{'beater':2,'burster':2,'cloaker':2},
	{'speeder':6},
	{'neutron':7},
	{'mothership':1},
	{'cloaker':5},
	{'beater':5,'splitter':1},
	{'mothership':1,'scout':3},
	{'scout':1,'destroyer':1,'neutron':1,'splitter':1,'beater':1,'burster':1,'cloaker':1,'speeder':1},
	{'speeder':3,'cloaker':3},
	{'mothership':1,'speeder':3},
	{'burster':4,'speeder':4},
	{'beater':3,'neutron':3},
	{'mothership':1,'cloaker':2,'speeder':2}
];

/*-------------------------------------------------------------------------------------------------
BLACKHOLES
/------------------------------------------------------------------------------------------------*/
BH.createHole = function(x,y){
	//Setup Physics
	var hole = BH.blackholes.create(x,y,"blackhole");
	BH.game.physics.p2.enable(hole);
	hole.body.collideWorldBounds = true;
	hole.body.angularDamping = 0;
	hole.body.angularVelocity = getRandom(-3,3);

	//Size
	BH.setSize(hole,1)

	//Collision events
	hole.body.onBeginContact.add(BH.blackholeContact,this);

	return hole;
};

//Set sized, based on growth time
BH.setSize = function(hole,t){
	//Change size
	var tScaled = Math.pow(t*3,0.8);
	hole.width = 5*tScaled;
	hole.height = 5*tScaled;
	hole.body.mass = 4*t;
	hole.body.setCircle(hole.width/2);

	//Store pixel size information
	var radius = hole.width/2;
	BH.currentArea = Math.PI*radius*radius;

	//Reset collision info
	hole.body.setCollisionGroup(BH.collisionGroup);
	hole.body.collides([BH.collisionGroup]);
	hole.body.setMaterial(BH.blackholeMaterial);
};

BH.setPosition = function(hole,x,y){
	hole.body.x = x;
	hole.body.y = y;
};

BH.releaseCurrentHole = function(){
	//Remove current listener
	BH.currentHole.body.onBeginContact.remove(BH.blackholeContact,this);

	//Set angular damping
	BH.currentHole.body.angularDamping = 0.5;

	//Store size
	BH.pixelsCovered += BH.currentArea;

	//Change color
	BH.currentHole.animations.frame = 1;

	//Reset variables
	BH.grow = false;
	BH.currentHole = null;
	BH.startTime = null;
	BH.currentArea = 0;

	BH.holesRemaining--;

	//Check if we've won
	if(BH.pixelsCovered >= BH.playableArea*BH.fractionNeeded){
		BH.stage++;

		if(BH.stage > BH.maxStage){
			BH.maxStage = BH.stage;
		}

		//Increase score
		var stage = BH.levels[BH.stage-2]; //-1 for 1-indexing, -1 because we just incremented
		for(e in stage){
			var value = BH.enemy_types[e].score;
			BH.score += value * stage[e];
		}

		BH.lives++;
		BH.startStage(BH.stage);

		BH.save(); //Update local storage
	}

	//Check if we've lost
	if(BH.holesRemaining == 0){
		BH.gameOver();
	}

	//Remove text if present
	if(BH.instructions){
		BH.instructions.destroy();
	}
};

BH.destroyCurrentHole = function(){
	//Remove current listener
	BH.currentHole.body.onBeginContact.remove(BH.blackholeContact,this);

	//Destroy the hole
	BH.currentHole.destroy();
	BH.lives--;

	if(BH.lives == 0){
		BH.gameOver();
	}

	//Reset variables
	BH.grow = false;
	BH.currentHole = null;
	BH.startTime = null;
	BH.currentArea = 0;
};

/*-------------------------------------------------------------------------------------------------
ENEMIES
/------------------------------------------------------------------------------------------------*/
BH.enemy = function(name,description,speed,mass,score){
	this.name = name; //Also the name of the related asset
	this.description = description;
	this.speed = speed;
	this.mass = mass;
	this.score = score;
};

BH.enemy_types = {};
BH.enemy_types["scout"] = new BH.enemy("Scout","These little ships fly around aimlessly and neutralize any black hole threat they discover.",300,6,100);
BH.enemy_types["destroyer"] = new BH.enemy("Destroyer","The big guns - when black hole activity has been confirmed, they arrive to clean up.",150,40,150);
BH.enemy_types["neutron"] = new BH.enemy("Neutron","When the destroyers fail to solve a problem, the neutrons are called in to punch through clogged up spaceways.",50,800,250);
BH.enemy_types["splitter"] = new BH.enemy("Splitter","Slow opponents fail quickly when the splitters appear - don't be fooled by their low numbers.",300,5,400);
BH.enemy_types["beater"] = new BH.enemy("Beater","Thump... thump... thump... the beaters approach.",250,25,300);
BH.enemy_types["burster"] = new BH.enemy("Burster","Why are they so slo-... oh.",100,20,300);
BH.enemy_types["cloaker"] = new BH.enemy("Cloaker","The silent assassins. Watch your back.",200,5,400);
BH.enemy_types["speeder"] = new BH.enemy("Speeder","When the new scout cores proved better than expected... these became a class of their own.",700,6,300);
BH.enemy_types["mothership"] = new BH.enemy("Mothership","After wreaking havoc across the systems, you have finally flushed out the queen.",150,250,1000);
BH.enemy_types["projectile"] = new BH.enemy("Projectile","What is a queen without minions?.",300,40,0);

BH.spawnEnemies = function(name,num,x,y){
	var type = BH.enemy_types[name];
	while(num--){
		var img = BH.game.cache.getImage(type.name.toLowerCase());

		//Handle size for sprite sheet enemies
		if(name === "beater"){
			var width = BH.baseBeaterSize;
			var height = BH.baseBeaterSize;
		}
		else if(name === "burster"){
			var width = 32;
			var height = 32;
		}
		else if(name === "cloaker"){
			var width = 32;
			var height = 32;
		}
		else{
			var width = img.width;
			var height = img.height;			
		}

		//Get random x and y location
		var px = (x === undefined) ? getRandom(0+width,BH.playableWidth-width) : x;
		var py = (y === undefined) ? getRandom(0+height,BH.playableHeight-height) : y;

		//Create and setup physics
		var enemy = BH.enemies.create(px,py,type.name.toLowerCase());
		BH.game.physics.p2.enable(enemy);
		enemy.shape = enemy.body.setCircle(width/2);

		enemy.body.setZeroDamping();
		enemy.body.fixedRotation = true;
		enemy.body.setCollisionGroup(BH.collisionGroup);
		enemy.body.collides([BH.collisionGroup]);
		enemy.body.setMaterial(BH.enemyMaterial);

		enemy.body.data.gravityScale = 0;

		//Set speed in a random direction
		var angle = getRandom(0,360)*(Math.PI/180); //Radians
		BH.setEnemyAngle(enemy,angle,type.speed);

		//Other parameters
		enemy.body.mass = type.mass;

		//Custom parameters
		enemy.lifetime = 0;
		enemy.splits = 0; //Limits the number of times a splitter can split
		enemy.bursting = false; //Used for bursters
		enemy.burstTimer = getRandom(BH.burstMinimum,BH.burstMaximum);
		enemy.cloaked = false;
		enemy.cloakTimer = getRandom(BH.cloakMinimum,BH.cloakMaximum);

		//Custom Setup
		if(enemy.key === "beater"){
			var speed = getRandom(500,1500);
			enemy.animations.add('beat');
			enemy.animations.play('beat',speed/32,true); //One loop for each size fluctuation

			enemy.scale.x = BH.baseBeaterSize/BH.beaterSpriteSize;
			enemy.scale.y = BH.baseBeaterSize/BH.beaterSpriteSize;

			BH.game.add.tween(enemy.scale).to({y:0.5}, speed, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true).loop();
			BH.game.add.tween(enemy.scale).to({x:0.5}, speed, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true).loop();
			BH.game.add.tween(enemy.shape).to({radius : BH.game.physics.p2.pxm(16)}, speed, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true).loop();
		}
		else if(enemy.key === "cloaker"){
			enemy.animations.add('cloak',[0,1,2,3,4,5,6,7]);
			enemy.animations.add('uncloak',[8,9,10,11]);
		}
		else if(enemy.key === "projectile"){
			enemy.bounces = 5; //The number of wall hits before they disappear
			enemy.body.onBeginContact.add(BH.projectileContact,this);
		}
		else if(enemy.key === "mothership"){
			enemy.projectileTimer = getRandom(20,30); //Between 2 and 3 seconds
		}
	}

	return enemy; //Returns the last created enemy, usually used if only one is created
};

BH.setEnemyAngle = function(enemy,angle,speed){
	var vx = Math.cos(angle)*speed;
	var vy = Math.sin(angle)*speed;
	enemy.body.velocity.x = vx;
	enemy.body.velocity.y = vy;
}

BH.projectileContact = function(body,shapeA,shapeB,equation){
	//Find the correct enemy
	for(var i = 0; i < BH.enemies.children.length; i++){
		if(BH.enemies.children[i].shape.id === shapeA.id){
			BH.enemies.children[i].bounces--;

			if(BH.enemies.children[i].bounces < 0){
				BH.enemies.children[i].destroy();
			}
		}
	}
}

/*-------------------------------------------------------------------------------------------------
LEVELS
/------------------------------------------------------------------------------------------------*/
BH.startStage = function(lvl){
	//Clear previous level
	BH.clearLevel();
	BH.startLevel(lvl);
	//Create stage transition (tweens with callbacks)
	// var dot = BH.game.add.image(0,0,'dot');
	// dot.scale.x = BH.playableWidth;
	// var cover = BH.game.add.tween(dot.scale).to({y:450},100, Phaser.Easing.Linear.None,true);
	// cover.onComplete.add(function(){
	// 	var uncover = BH.game.add.tween(dot.position).to({y:BH.playableHeight-400},50,Phaser.Easing.Linear.None,true);
	// 	uncover.onComplete.add(function(){
	// 		dot.destroy();
	// 		BH.startLevel(lvl);
	// 	});
	// })
};

BH.startLevel = function(lvl){
	//Build next level
	var enemies = BH.levels[lvl-1]; //Function call is 1-indexed

	if(enemies == undefined){
		BH.stage = 1;
		BH.game.state.start('VictoryScreen');
	}

	for(var e in enemies){
		BH.spawnEnemies(e,enemies[e]);
	}

	//Create text on first level
	if(lvl === 1){
		BH.instructions = BH.game.add.text(50,50, "Click and hold to draw a black hole. Release to drop it.",{font: "28px Arial"});
	}
};

BH.clearLevel = function(){
	BH.blackholes.removeAll(true);
	BH.enemies.removeAll(true);
	BH.resetVariables();
};

BH.gameOver = function(){
	BH.clearLevel();
	BH.lives = BH.initialLives;
	BH.score = 0;
	BH.game.state.start('GameOver');
};

BH.resetVariables = function(){
	BH.holesRemaining = BH.initialRemaining;	
	BH.pixelsCovered = 0;
};

/*-------------------------------------------------------------------------------------------------
STATES
/------------------------------------------------------------------------------------------------*/
BH.PreLoad = function(){};
BH.PreLoad.prototype = {
	preload: function(){
		//Show Percentage
		BH.game.stage.backgroundColor = '#F5F5F5';
		BH.ui.progressCounter = this.game.add.text(this.game.world.centerX-105, this.game.world.centerY-80, '0% Loaded', {font: "38px Arial",fill: 'black'});
		BH.game.load.onFileComplete.add(BH.fileComplete,this);

		//Menu Buttons
		BH.game.load.spritesheet("playButton","../resources/blackhole/play_button.png",380,98);
		BH.game.load.spritesheet("instructionsButtton","../resources/blackhole/instructions_button.png",380,98);
		BH.game.load.spritesheet("levelButton","../resources/blackhole/level_button.png",380,98);
		BH.game.load.spritesheet("creditsButton","../resources/blackhole/credits_button.png",380,98);
		BH.game.load.spritesheet("backButton","../resources/blackhole/back_button.png",380,98);
		BH.game.load.spritesheet("menuButton","../resources/blackhole/menu_button.png",380,98);
		BH.game.load.spritesheet("retryButton","../resources/blackhole/retry_button.png",380,98);

		//Enemies
		BH.game.load.spritesheet("blackhole","../resources/blackhole/blackhole.png",512,512);
		BH.game.load.image("scout","../resources/blackhole/scout.png");
		BH.game.load.image("destroyer","../resources/blackhole/destroyer.png");
		BH.game.load.image("neutron","../resources/blackhole/neutron.png");
		BH.game.load.image("splitter","../resources/blackhole/splitter.png");
		BH.game.load.spritesheet("beater","../resources/blackhole/beater.png",64,64);
		BH.game.load.spritesheet("burster","../resources/blackhole/burster.png",32,32);
		BH.game.load.spritesheet("cloaker","../resources/blackhole/cloaker.png",32,32);
		BH.game.load.image("speeder","../resources/blackhole/speeder.png");
		BH.game.load.image("mothership","../resources/blackhole/mothership.png");
		BH.game.load.image("projectile","../resources/blackhole/projectile.png");

		//Icons
		BH.game.load.image("heart","../resources/blackhole/heart.png");

		//Music
		BH.game.load.audio('backgroundMusic',["../resources/blackhole/malloga_ballinga.mp3"]);

		//Buttons
		BH.game.load.spritesheet('musicButton',"../resources/blackhole/music_sprites.png",40,40);
		BH.game.load.spritesheet('pauseButton',"../resources/blackhole/play-pause.png",40,40);
		BH.game.load.image("menuIcon","../resources/blackhole/menu.png");
	},
	create: function(){
		//Start
		BH.game.state.start('MainMenu');
	}
};

BH.fileComplete = function(progress){
	BH.ui.progressCounter.text = progress + "% Loaded";
};

BH.MainMenu = function(){};
BH.MainMenu.prototype = {
	create: function(){
		//Set background
		BH.game.stage.backgroundColor = '#F5F5F5';

		//Reset stats
		BH.stage = 1;
		BH.lives = BH.initialLives;
		BH.score = 0;

		//Add buttons
		BH.game.add.button((BH.width-380)/2, 60,'playButton', function(){BH.game.state.start('Gameplay')}, BH.game, 1, 0, 2);
		BH.game.add.button((BH.width-380)/2, 185,'instructionsButtton', function(){BH.game.state.start('Instructions')}, BH.game, 1, 0, 2);
		BH.game.add.button((BH.width-380)/2, 310,'levelButton', function(){BH.game.state.start('LevelSelect')}, BH.game, 1, 0, 2);
		BH.game.add.button((BH.width-380)/2, 435,'creditsButton', function(){BH.game.state.start('Credits')}, BH.game, 1, 0, 2);
	}
};

BH.Instructions = function(){};
BH.Instructions.prototype = {
	create: function(){
		//Create instruction text
		var margin = 50;
		BH.ui.instructionTitle = BH.game.add.text(margin,50,"Instructions",{font: "72px Arial"});

		var style = {font: "18px Arial", wordWrap: true, wordWrapWidth: BH.width-(margin*2)};
		var text = "Black Hole Filler Extreme is Super Fill-Up turned up to 11, and the basic gameplay is very similar. Click and hold on the screen to produce a black hole, and let go to drop it. If your black hole is touched by an enemy before you let go of the mouse button, you lose a life! Don't do that.\n\nYou finish a stage by filling up at least half the screen with black holes. The purple bar on the bottom indicates how close you are to reaching the amount required.";
		BH.ui.instructions = BH.game.add.text(margin,150,text,style);

		BH.game.add.button((BH.width-380)/2, 485,'backButton', function(){BH.game.state.start('MainMenu')}, BH.game, 1, 0, 2);
	}
};

BH.LevelSelect = function(){};
BH.LevelSelect.prototype = {
	create: function(){
		var square = BH.game.add.graphics(0,0);

		for(var i = 0; i < Math.min(BH.maxStage,48); i++){
			//Draw the box
			var j = Math.floor(i/8);
			square.lineStyle(2, '0x000000');
			square.drawRect(80 + (i%8)*81,7 + j*80,73,73);

			//Draw the number
			var text = BH.game.add.text(80 + (i%8)*81,7 + j*80,i+1,{font: "60px Arial"});
			var textOffsetX = 73/2 - text.width/2;
			var textOffsetY = 73/2 - text.height/2;
			text.x += textOffsetX;
			text.y += textOffsetY;
		}

		//Input function
		BH.game.input.onDown.add(function(p){
			//Check if the box is in a box, and if so which one
			var rect = new Phaser.Rectangle(0,0,0,0);
			for(var i = 0; i < Math.min(BH.maxStage,48); i++){
				//Create rectangle object
				var j = Math.floor(i/8);
				rect.setTo(80 + (i%8)*81,7 + j*80,73,73);

				//Check if rect is in that box
				if (rect.contains(p.x,p.y)){
					BH.stage = i+1;
					BH.game.state.start('Gameplay');
					break;
				}
			}	
		});

		BH.game.add.button((BH.width-380)/2, 485,'backButton', function(){BH.game.state.start('MainMenu')}, BH.game, 1, 0, 2);
	},
	update: function(){}
};

BH.Credits = function(){};
BH.Credits.prototype = {
	create: function(){
		//Create credits text
		var margin = 50;
		BH.ui.creditsTitle = BH.game.add.text(margin,50,"Credits",{font: "72px Arial"});

		var style = {font: "32px Arial", wordWrap: true, wordWrapWidth: BH.width-(margin*2)};

		BH.ui.creditsInspiration = BH.game.add.text(margin,150,"Inspiration: Super Fill-Up",style);
		BH.ui.creditsMusic = BH.game.add.text(margin,235,"Music: Joe Reynolds \n(www.joereynoldsaudio.com)",style);
		BH.ui.creditsGame = BH.game.add.text(margin,360,"Game + Art: Keilan \n(www.scholtek.com)",style);

		var setColor = function(text,color){
			var style = text.style;
			style.fill = color;
			text.setStyle(style);
		}

		//Make credits clickable and change colors
		BH.ui.creditsMusic.inputEnabled = true;
		BH.ui.creditsMusic.events.onInputDown.add(function(){
			window.open("http://www.joereynoldsaudio.com", "_blank");
			setColor(this,"black");
		},BH.ui.creditsMusic);
		BH.ui.creditsMusic.events.onInputOver.add(function(){
			setColor(this,"mediumblue");
		},BH.ui.creditsMusic);
		BH.ui.creditsMusic.events.onInputOut.add(function(){
			setColor(this,"black");
		},BH.ui.creditsMusic);

		BH.ui.creditsGame.inputEnabled = true;
		BH.ui.creditsGame.events.onInputDown.add(function(){
			window.open("http://www.scholtek.com", "_blank");
			setColor(this,"black")
		},BH.ui.creditsGame);
		BH.ui.creditsGame.events.onInputOver.add(function(){
			setColor(this,"mediumblue");
		},BH.ui.creditsGame);
		BH.ui.creditsGame.events.onInputOut.add(function(){
			setColor(this,"black");
		},BH.ui.creditsGame);

		BH.game.add.button((BH.width-380)/2, 485,'backButton', function(){BH.game.state.start('MainMenu')}, BH.game, 1, 0, 2);
	},
	update: function(){}
};

BH.GameOver = function(){};
BH.GameOver.prototype = {
	create: function(){
		//Text
		BH.ui.gameOver = BH.game.add.text((800-496)/2,75, "Game Over",{font: "96px Arial"});
		BH.ui.gameOverText = BH.game.add.text((800-233)/2,175, "No cake for you.",{font: "32px Arial"});

		//Buttons
		BH.game.add.button((BH.width-380)/2, 360,'retryButton', function(){
			BH.score = 0;
			BH.lives = BH.initialLives;
			BH.retry();
		}, BH.game, 1, 0, 2);

		BH.game.add.button((BH.width-380)/2, 485,'menuButton', function(){
			BH.score=0;
			BH.lives = BH.initialLives;
			BH.game.state.start('MainMenu');
		}, BH.game, 1, 0, 2);
	},
};

BH.VictoryScreen = function(){};
BH.VictoryScreen.prototype = {
	create: function(){
		//Subtract live awarded after last level
		BH.lives--;

		//Text
		BH.ui.victory = BH.game.add.text((800-293)/2,75, "Victory",{font: "96px Arial"});
		BH.ui.victoryText = BH.game.add.text((800-225)/2,175, "A winner is you.",{font: "32px Arial"});

		BH.ui.scoreText = BH.game.add.text(220,255, "Score: " + BH.score,{font: "32px Arial"});
		BH.ui.livesText = BH.game.add.text(220,305, "Remaining Lives: " + BH.lives,{font: "32px Arial"});
		BH.ui.gradeText = BH.game.add.text(220,355, "Grade: " + BH.computeGrade(BH.score,BH.lives),{font: "32px Arial"});

		//Buttons
		BH.game.add.button((BH.width-380)/2, 485,'menuButton', function(){
			BH.lives = BH.initialLives;
			BH.score = 0;
			BH.game.state.start('MainMenu');
		}, BH.game, 1, 0, 2);
	},
};

BH.computeGrade = function(score,lives){
	var result = "";

	//Get grade
	if (score < 200)
		return "F--- of How?";
	else if(score < 2000)
		result += "F---";
	else if(score < 4000)
		result += "F-";
	else if(score < 6000)
		result += "F";
	else if(score < 8000)
		result += "F+";
	else if(score < 9900)
		return "E of Unlikely";
	else if(score < 10000)
		result += "D-";
	else if(score < 12000)
		result += "D";
	else if(score < 16000)
		result += "D+";
	else if(score < 20000)
		result += "C-";
	else if(score < 24000)
		result += "C";
	else if(score < 28000)
		result += "C+";
	else if(score < 32000)
		result += "B-";
	else if(score < 36000)
		result += "B";
	else if(score < 40000)
		result += "B+";
	else if(score < 44000)
		result += "A-";
	else if(score < 48000)
		result += "A";
	else if(score < 52000)
		result += "A+";
	else if(score < 56000)
		result += "S";
	else if(score < 60000)
		result += "S+";
	else
		return "S+++ of Cheating"


	//Get lives rating
	if (lives === 1){
		result += " of Close Calls";
	}
	else if(lives < 10)
		result += " of Difficulty";
	else if(lives < 20)
		result += " of Struggle";
	else if(lives < 30)
		result += " of Ease";
	else if(lives < 40)
		result += " of Vitality";
	else if(lives < 50)
		result += " of Victory";
	else
		result += " of Triumph";

	return result
};

/*-------------------------------------------------------------------------------------------------
Gameplay Setup
/------------------------------------------------------------------------------------------------*/
BH.Gameplay = function(){};
BH.Gameplay.prototype = {
	create: function(){
		//Setup Stage
		BH.setupUI();
		BH.setupButtons();

		//Enable Physics
		BH.setupPhysics();
		BH.setupContactMaterials();

		//Setup events
		BH.setupEvents();

		//Setup enemies
		BH.enemies = BH.game.add.group();

		//Setup blackholes
		BH.blackholes = BH.game.add.group();

		//Setup audio
		BH.setupAudio();

		//Timers
		BH.game.time.events.loop(100,BH.processEnemyBehaviour,this);

		//First level
		BH.startStage(BH.stage);
	},
	update: function(){
		//Ensure that the speed stays constant for enemies
		BH.adjustEnemySpeed();

		//Update black hole size if applicable
		BH.updateBlackholes();

		//Update UI
		BH.updateUI();
	},
	shutdown: function(){
		//Stop music
		BH.music.pause();
		BH.music = null;
	}
};

BH.setupUI = function(){
	//Set bounds and color background
	BH.game.stage.backgroundColor = '#F5F5F5';
	BH.game.world.setBounds(0,0,BH.playableWidth,BH.playableHeight);

	//Draw border
	var divider = BH.game.add.graphics(0,0);
	divider.lineStyle(2, '0x0000CD');
	divider.moveTo(0,BH.playableHeight);
	divider.lineTo(BH.width,BH.playableHeight);

	//Status Display
	var style = {font: "18px Arial"};
	BH.ui.stage = BH.game.add.text(10,BH.playableHeight + 10, "Stage: 1",style);
	BH.ui.lives = BH.game.add.text(BH.width - 150,BH.playableHeight + 10, "Lives: 3",style);
	BH.ui.score = BH.game.add.text(10, BH.playableHeight + 45, "Score: 0",style);
	BH.ui.remaining = BH.game.add.text(BH.width - 150, BH.playableHeight + 45, "Blackholes: 20",style);

	if(BH.showFPS){
		BH.game.time.advancedTiming = true;
		BH.ui.fps = BH.game.add.text(BH.width-30, 10, "60",style)
	}

	//Progress display
	BH.progress = BH.game.add.graphics(0,0);
	BH.progress.lineStyle(2, '0x000000');
	BH.progress.beginFill('0x000000',1)
	BH.progress.drawRoundedRect(100,BH.playableHeight + 8,BH.playableWidth-280,27,12);

	//Paused Display
	BH.ui.pauseText = BH.game.add.text(170,BH.playableHeight-400, "",{font: "72px Arial"});
};

BH.setupButtons = function(){
	//Add event for unpausing
	BH.ui.pauseButton = BH.game.add.button(BH.playableWidth-255, BH.playableHeight + 35, 'pauseButton', null, this);
	BH.ui.pauseButton.inputEnabled = true;
	BH.ui.pauseButton.events.onInputUp.add(BH.pause);
	BH.game.input.onDown.add(BH.unpause,self);

	BH.ui.musicButton = BH.game.add.button(BH.playableWidth-220, BH.playableHeight + 35, 'musicButton', BH.toggleMusic, this);

	BH.ui.menuButton = BH.game.add.button(BH.playableWidth-290, BH.playableHeight + 35, 'menuIcon', BH.showMenu, this);

};

BH.setupAudio = function(){
	BH.music = BH.game.add.audio("backgroundMusic");

	if(BH.musicOn){
		BH.music.play('', 0, 1, true);
	}
	else{
		BH.music.pause();
		BH.ui.musicButton.animations.frame = 1;
	}
};

BH.setupPhysics = function(){
	BH.game.physics.startSystem(Phaser.Physics.P2JS);
	BH.game.physics.p2.setImpactEvents(true);
	BH.game.physics.p2.restitution = 1;
	BH.game.physics.p2.friction = 0;

	BH.game.physics.p2.applyGravity = true;
	BH.game.physics.p2.gravity.y = 500;

	BH.collisionGroup = BH.game.physics.p2.createCollisionGroup();
	BH.game.physics.p2.updateBoundsCollisionGroup();
};

BH.setupContactMaterials = function(){
	//Create materials
	BH.worldMaterial = BH.game.physics.p2.createMaterial('world');
	BH.enemyMaterial = BH.game.physics.p2.createMaterial('enemy');
	BH.blackholeMaterial = BH.game.physics.p2.createMaterial('blackhole');

	//Set world material
	BH.game.physics.p2.setWorldMaterial(BH.worldMaterial,true,true,true,true); //Set the 4 walls

	//Create contacts
	var contactMaterial = BH.game.physics.p2.createContactMaterial(BH.worldMaterial,BH.blackholeMaterial);
	contactMaterial.restitution = 0.3;

	var contactMaterial = BH.game.physics.p2.createContactMaterial(BH.blackholeMaterial,BH.blackholeMaterial);
	contactMaterial.restitution = 0.3;
};

BH.setupEvents = function(){
	BH.game.input.onDown.add(BH.mouseDown,this);
	BH.game.input.onUp.add(BH.mouseUp,this);
};

/*-------------------------------------------------------------------------------------------------
EVENTS
/------------------------------------------------------------------------------------------------*/
BH.mouseDown = function(e){
	if(e.button == Phaser.Mouse.LEFT_BUTTON){
		//Ensure location is valid for creating a new black hole
		if(BH.game.physics.p2.hitTest(new Phaser.Point(e.x,e.y)).length == 0 && e.y <= BH.playableHeight){
			BH.grow = true;
			BH.currentHole = BH.createHole(e.x,e.y);
			BH.startTime = time();
		}
	}
};

BH.mouseUp = function(e){
	if(BH.grow){
		BH.releaseCurrentHole();
	}
};

BH.blackholeContact = function(body,shapeA,shapeB,equation){
	//If we hit a wall or another blackhole, act as if the mouse was raised
	if(body === null || body.sprite.key == "blackhole"){
		BH.releaseCurrentHole();
	}
	else{
		//Draw a lives lost sign at the colllision point
		var heart = BH.game.add.image(body.x,body.y,'heart');
		heart.scale.x = 0.75;
		heart.scale.y = 0.75;
		BH.game.add.tween(heart.scale).to({y:1}, 250, Phaser.Easing.Linear.None, true);
		var tweenY = BH.game.add.tween(heart.scale).to({x:1}, 250, Phaser.Easing.Linear.None, true);
		tweenY.onComplete.add(function(){
			heart.destroy();
		});

		BH.destroyCurrentHole();
	}
};

BH.toggleMusic = function(){
	if(BH.music.isPlaying){
		BH.music.pause();
		BH.ui.musicButton.animations.frame = 1;
	}
	else{
		if(BH.music.paused){
			BH.music.resume();
		}
		else{
			BH.music.play('', 0, 1, true);
		}
		BH.ui.musicButton.animations.frame = 0;
	}

	BH.save(); //Update music settings
};

BH.pause = function(){
	BH.ui.pauseButton.animations.frame = 1;
	BH.game.paused = true;
	BH.ui.pauseText = BH.game.add.text(170,BH.playableHeight-400, "Game Paused",{font: "72px Arial"});
};

BH.unpause = function(){
	BH.ui.pauseButton.animations.frame = 0;
	BH.ui.pauseText.destroy();
	BH.game.paused = false;
};

BH.showMenu = function(){
	BH.game.state.start('MainMenu');
};

BH.retry = function(){
	BH.stage = (BH.stage ? BH.stage : 1);
	BH.game.state.start('Gameplay');
}

/*-------------------------------------------------------------------------------------------------
 SAVE/LOAD
 /------------------------------------------------------------------------------------------------*/
BH.save = function(){
	var so = {};
	so.max = BH.maxStage;
	so.music = BH.music.isPlaying;
	so = Base64.encode(JSON.stringify(so));

	localStorage.setItem(BH.HTML5_LOCAL_STORAGE_NAME,so);
};

BH.load = function(){
	var so = localStorage.getItem(BH.HTML5_LOCAL_STORAGE_NAME);

	if(so !== null){
		so = JSON.parse(Base64.decode(so));
		BH.maxStage = so.max;
		BH.musicOn = so.music;
	}
};

/*-------------------------------------------------------------------------------------------------
MAIN LOOP
/------------------------------------------------------------------------------------------------*/
BH.adjustEnemySpeed = function(){
	for(var i = 0; i < BH.enemies.length; i++){
		var x = BH.enemies.children[i].body.velocity.x;
		var y = BH.enemies.children[i].body.velocity.y;
		var speed = x*x + y*y;

		//Use specified speed or default
		if(BH.enemies.children[i].speed !== undefined){
			var goalSpeed = BH.enemies.children[i].speed*BH.enemies.children[i].speed;
		}
		else {
			var type = BH.enemies.children[i].key;
			var goalSpeed = BH.enemy_types[type].speed*BH.enemy_types[type].speed;
		}

		if(speed <= goalSpeed*0.9 || speed >= goalSpeed*1.1){
			ratio = Math.sqrt(goalSpeed/speed);
			BH.enemies.children[i].body.velocity.x *= ratio;
			BH.enemies.children[i].body.velocity.y *= ratio;
		}
	}
};

BH.updateBlackholes = function(){
	if(BH.grow){
		var periods = Math.floor((time()-BH.startTime)/40); //A period is 25ms long
		BH.setSize(BH.currentHole,periods+1);
		BH.setPosition(BH.currentHole,BH.game.input.activePointer.x,BH.game.input.activePointer.y);

		BH.currentHole.body.velocity.y = 0; //Cancel out gravity until we drop it
	}
};

BH.updateUI = function(){
	BH.ui.stage.setText("Stage: " + BH.stage);
	BH.ui.lives.setText("Lives: " + BH.lives);
	BH.ui.remaining.setText("Blackholes: " + BH.holesRemaining);
	BH.ui.score.setText("Score: " + BH.score);

	var area = Math.min((BH.pixelsCovered+BH.currentArea)/(BH.playableArea*BH.fractionNeeded),1);

	BH.progress.clear();
	BH.progress.beginFill('0x000000',1)
	BH.progress.drawRoundedRect(100,BH.playableHeight + 8,BH.playableWidth-280,27,12);

	BH.progress.beginFill('0x401563',1)
	var pixels = Math.max((BH.playableWidth-288)*area,13);
	BH.progress.drawRoundedRect(104,BH.playableHeight + 11,pixels,21,6);

	if(BH.showFPS){
		BH.ui.fps.setText(BH.game.time.fps)
	}
};

//Processes actions taken by enemies that don't need to be dealt with every frame
BH.processEnemyBehaviour = function(){
	for(var i = 0; i < BH.enemies.length; i++){
		var enemy = BH.enemies.children[i];
		enemy.lifetime += 1;

		if(enemy.lifetime % 50 == 0 && enemy.key === "splitter" && enemy.splits < 2){
			var newSplitter = BH.spawnEnemies("splitter",1);
			BH.setPosition(newSplitter,enemy.x,enemy.y);
			enemy.splits++;
			newSplitter.splits = enemy.splits;
		}
		else if(enemy.key === "burster"){
			enemy.burstTimer -= 1;
			if(enemy.burstTimer <= 0){
				enemy.burstTimer = getRandom(BH.burstMinimum,BH.burstMaximum);
				enemy.speed = undefined;
				enemy.animations.frame = 0;
			}
			else if(enemy.burstTimer <= BH.burstTime){
				//Calculate the current speed so it can accelerate
				var ratio = (enemy.burstTimer/BH.burstTime);
				enemy.speed = (ratio > 0.90 ? Math.max(BH.burstSpeed*(1-ratio)*10,100) : BH.burstSpeed);

				enemy.animations.frame = 1;
			}
		}
		else if(enemy.key === "cloaker"){
			enemy.cloakTimer -= 1;
			if(enemy.cloakTimer <= 0){
				if (!enemy.cloaked){
					enemy.animations.play('cloak',20)
					enemy.cloakTimer = BH.cloakDuration;

					//Make transparent (closure voodo)
					BH.game.time.events.add(400,function(e){
						return function(){
							e.alpha = 0;
						};
					}(enemy));
				}
				else{
					enemy.alpha = 1;
					enemy.animations.play('uncloak',4);
					enemy.cloakTimer = getRandom(BH.cloakMinimum,BH.cloakMaximum);
				}
				enemy.cloaked = !enemy.cloaked;
			}
		}
		else if(enemy.key === "projectile"){
			if(enemy.type === "curver" && BH.currentHole){
				//Get angles
				var curAngle = Math.atan2(enemy.body.velocity.x,enemy.body.velocity.y);
				var motherAngle = Math.atan2(BH.currentHole.x-enemy.x,BH.currentHole.y-enemy.y);

				//Make positive
				curAngle = (curAngle >= 0) ? curAngle : curAngle + 2*Math.PI;
				motherAngle = (motherAngle >= 0) ? motherAngle : motherAngle + 2*Math.PI;

				//Adjust to fit with setAngle expectations
				curAngle -= Math.PI/2;
				curAngle = reduceAngle(2*Math.PI - curAngle);
				motherAngle -= Math.PI/2;
				motherAngle = reduceAngle(2*Math.PI - motherAngle);

				//Get new angle
				var diff1 = reduceAngle(motherAngle-curAngle);
				var diff2 = reduceAngle(curAngle-motherAngle);
				if (diff1 <= diff2){
					var newAngle = curAngle + (diff1 * 0.45);
				}
				else {
					var newAngle = curAngle - (diff2 * 0.45);
				}

				BH.setEnemyAngle(enemy,newAngle,BH.enemy_types["projectile"].speed)
			}
		}
		else if(enemy.key === "mothership"){
			enemy.projectileTimer--;

			if(enemy.projectileTimer === 0){
				enemy.projectileTimer = getRandom(50,70);

				//Set projectile type
				var rand = getRandom(1,2);
				var projType = (rand === 1) ? "curver" : "bouncer";
				
				//Set type specific parameters
				if (projType === "bouncer"){
					var num = 4;
					var initialAngle = 45;
				}
				else {
					var num = 2;
					var initialAngle = 0;
				}
				var changeAngle = 360/num;


				//Create 3 new projectiles
				var type = BH.enemy_types["projectile"];
				for(var i = 0; i < num; i++){
					//Find position position
					var dist = 64;
					var angle = (initialAngle + i*changeAngle)*(Math.PI/180);

					//Create enemy
					var proj = BH.spawnEnemies("projectile",1,enemy.x+(Math.cos(angle)*dist),enemy.y-Math.sin(angle)*dist);
					proj.type = projType;

					//Set angle
					if (projType === "bouncer"){
						angle -= Math.PI/2;
					}
					BH.setEnemyAngle(proj,angle,type.speed);
				}
			}
		}
	}
};

/*-------------------------------------------------------------------------------------------------
START
/------------------------------------------------------------------------------------------------*/

BH.start = function(){
	BH.game = new Phaser.Game(BH.width,BH.height, Phaser.AUTO, ',');

	//Add game states
	BH.game.state.add("PreLoad",BH.PreLoad);
	BH.game.state.add('MainMenu',BH.MainMenu);
	BH.game.state.add('Instructions',BH.Instructions);
	BH.game.state.add('LevelSelect',BH.LevelSelect);
	BH.game.state.add('Credits',BH.Credits);
	BH.game.state.add('Gameplay',BH.Gameplay);
	BH.game.state.add('GameOver',BH.GameOver);
	BH.game.state.add('VictoryScreen',BH.VictoryScreen);

	BH.game.state.start('PreLoad');
};

BH.load();
BH.start();
