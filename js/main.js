window.onload = function() {
	// You might want to start with a template that uses GameStates:
	//     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic

	// You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
	// You will need to change the fourth parameter to "new Phaser.Game()" from
	// 'phaser-example' to 'game', which is the id of the HTML element where we
	// want the game to go.
	// The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
	// You will need to change the paths you pass to "game.load.image()" or any other
	// loading functions to reflect where you are putting the assets.
	// All loading functions will typically all be found inside "preload()".

	"use strict";

	var game = new Phaser.Game( 900, 800, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );

	function preload() {
		game.load.tilemap('diamond', 'assets/tilemaps/maps/diamond.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.image('happylandTiles', 'assets/tilemaps/tilesets/happyland/tileset_8.png');
		game.load.spritesheet('player', 'assets/sprites/sara/sara\ 16x18\ source.png', 16,18);
		game.load.spritesheet('protagonist', 'assets/sprites/base\ hero/Hero.png',16,16);
		game.load.image('base', 'assets/sprites/baseball/base.png');
		game.load.image('homePlate', 'assets/sprites/baseball/homeplate.png');
		game.load.spritesheet('baseball', 'assets/sprites/baseball/baseball.png', 7, 7);
	}
	var map;
	var backgroundLayer;
//	var fringeLayer;
//	var collisionLayer;

	var playerStart;
	var protagonistStart;

	var player;
	var playerDirection;

	var protagonist;
	var protagonistDirection;

	var cursors;

	var RANGE = 50;

	var ballSpawns;

	var baseballs;
	var baseball;

	var spawnTime = 0;

	var score = 0;

	var style = { font: "30px Verdana", fill: "#ffffff", align: "center" };
	var gameTime = 120; //2 minutes
	var timeLeft = gameTime;

	var timeText;
	var scoreText;

	function create() {
		map = game.add.tilemap('diamond');

		map.addTilesetImage('tileset_8', 'happylandTiles');

		backgroundLayer = map.createLayer('Background');
		backgroundLayer.resizeWorld();

		playerStart = findObjectsByType('playerStart', map, 'Objects');
		player = game.add.sprite(playerStart[0].x, playerStart[0].y, 'player');
		player.anchor.setTo(0.5,0.5);

		game.physics.arcade.enable(player);
		player.body.bounce.y = 0.0;
		player.body.gravity.y = 0;
		player.body.collideWorldBounds = true;

		player.animations.add('walkRight', [9, 10, 11], 10, true);
		player.animations.add('walkLeft', [27, 28, 29], 10, true);
		player.animations.add('walkUp', [0, 1, 2], 10, true);
		player.animations.add('walkDown', [18, 19, 20], 10, true);

		playerDirection = 'down';

		protagonistStart = findObjectsByType('npcStart', map, 'Objects');
		protagonist = game.add.sprite(protagonistStart[0].x, protagonistStart[0].y, 'protagonist');
		protagonist.anchor.setTo(0.5,0.5);

		game.physics.arcade.enable(protagonist);
		protagonist.body.bounce.y = 0.0;
		protagonist.body.gravity.y = 0;
		protagonist.body.collideWorldBounds = true;

		protagonist.animations.add('walkRight', [12,13,14], 10, true);
		protagonist.animations.add('walkLeft', [9,10,11], 10, true);
		protagonist.animations.add('walkUp', [1,2,3], 10, true);
		protagonist.animations.add('walkDown', [5,6,7], 10, true);

		protagonistDirection = 'down';
		createBallSpawn();

		baseballs = game.add.group();
		baseballs.enableBody = true;
		baseballs.physicsBodyType = Phaser.Physics.ARCADE;
		baseballs.createMultiple(6, 'baseball');
		baseballs.setAll('anchor.x', 0.5);
		baseballs.setAll('anchor.y', 0.5);
		baseballs.setAll('outOfBoundsKill', true);
		baseballs.setAll('checkWorldBounds', true);
		baseballs.callAll('animations.add', 'animations', 'spinUp', [5,4,3], 10, true);
		baseballs.callAll('animations.add', 'animations', 'spinDown', [3,4,5], 10, true);
		baseballs.callAll('animations.add', 'animations', 'spinLeft', [0,1,2], 10, true);
		baseballs.callAll('animations.add', 'animations', 'spinRight', [2,1,0], 10, true);

		cursors = game.input.keyboard.createCursorKeys();

		timeText = game.add.text( game.world.width/2 , 20, "", style );
		scoreText = game.add.text(game.world.width/2, 60, "", style);
	}

	function update() {
			player.body.velocity.x = 0;
			player.body.velocity.y = 0;

			protagonist.body.velocity.x = 0;
			protagonist.body.velocity.y = 0;

		if(timeLeft >0){
			
			game.physics.arcade.overlap(protagonist, baseballs, killBall, null, this);

			var protagonistRange = getPolarDifference(player,protagonist);

			var walkSpeed = 75;

			var protagonistMaxSpeed = 100;

			if(cursors.down.isDown){
				player.body.velocity.y += walkSpeed;
				playerDirection = 'down';
				player.animations.play('walkDown');
			}
			else if(cursors.up.isDown){
				player.body.velocity.y -= walkSpeed;
				playerDirection = 'up';
				player.animations.play('walkUp');
			}
			if(cursors.left.isDown){
				player.body.velocity.x -= walkSpeed;
				playerDirection = 'left';
				player.animations.play('walkLeft');
			}
			else if(cursors.right.isDown){
				player.body.velocity.x += walkSpeed;
				playerDirection = 'right';
				player.animations.play('walkRight');			
			}
			if(!(cursors.down.isDown || cursors.up.isDown || cursors.left.isDown || cursors.right.isDown)){
				player.animations.stop();
				player.frame = 1;
				switch(playerDirection){
					case 'right':
						player.frame += 9;
						break;
					case 'down':
						player.frame += 18;
						break;
					case 'left':
						player.frame += 27;
						break;
					default:
						break;
				}
			}
			if(protagonistRange.displacement <= RANGE){
				protagonist.body.velocity.x += (1-(protagonistRange.displacement/RANGE)) * protagonistMaxSpeed * Math.cos(protagonistRange.angle);
				protagonist.body.velocity.y += (1-(protagonistRange.displacement/RANGE)) * (-1) * protagonistMaxSpeed * Math.sin(protagonistRange.angle);
				if((protagonistRange.angle >= -Math.PI/4) && (protagonistRange.angle < Math.PI/4)){
					protagonist.animations.play('walkRight');
					protagonistDirection = 'right';
				}
				else if((protagonistRange.angle >= Math.PI/4) && (protagonistRange.angle < (3*Math.PI/4))){
					protagonist.animations.play('walkUp');
					protagonistDirection = 'up';
				}
				else if((protagonistRange.angle >= (-3*Math.PI/4)) && (protagonistRange.angle < -Math.PI/4)){
					protagonist.animations.play('walkDown');
					protagonistDirection = 'down';
				}
				else{
					protagonist.animations.play('walkLeft');
					protagonistDirection = 'left';
				}
			}
			else{
				protagonist.animations.stop();
				if(protagonistDirection === 'right'){
					protagonist.frame = 13;
				}
				else if(protagonistDirection === 'up'){
					protagonist.frame = 0;
				}
				else if(protagonistDirection === 'down'){
					protagonist.frame = 4;
				}
				else if(protagonistDirection === 'left'){
					protagonist.frame = 8;
				}
			}
			if(game.time.now >= spawnTime){
				var spawnPoint = Math.floor(Math.random() * (3.99999));
				spawnBall(ballSpawns.children[spawnPoint]);
				spawnTime = game.time.now + 2000;
			}
			timeLeft = gameTime - (game.time.now/1000);
			timeText.text = 'time remaining: ' + timeLeft;
			scoreText.text = 'Score: ' + score;
		}
		else{
			timeText.text = 'Game Over';
	}

	function findObjectsByType(type, map, layer) {
		var result = new Array();
		map.objects[layer].forEach(function(element){
			if(element.properties.type === type){
				element.y -= map.tileHeight;
				result.push(element);
			}
		});
		return result;
	}

	function createFromTiledObject(element, group){
		var sprite = group.create(element.x, element.y, element.properties.sprite);
		Object.keys(element.properties).forEach(function(key){
			sprite[key] = element.properties[key];
		});
	}

	function createBallSpawn(){
		ballSpawns = game.add.group();
		ballSpawns.enableBody = true;
		ballSpawns.setAll('anchor.x', 0.5);
		ballSpawns.setAll('anchor.y', 0.5);
		var result;
		result = findObjectsByType('ballSpawn', map, 'Objects');
		result.forEach(function(element){
			createFromTiledObject(element, ballSpawns);
		}, this);
	}
	function getPolarDifference(object1, object2){
		var displacement = {};
		var ret = {};
		displacement.x = object2.x - object1.x;
		displacement.y = object1.y - object2.y; //game world exists in quadrant 4
		displacement.abs = Math.sqrt((displacement.x*displacement.x)+(displacement.y*displacement.y));
		ret.displacement = displacement.abs;
		ret.angle = Math.atan2((displacement.y),(displacement.x));
		return ret;
	}
	function spawnBall(ballSpawn){
		var ballSpeed = 100;
		baseball = baseballs.getFirstExists(false);
		if(baseball){
			baseball.reset(ballSpawn.x, ballSpawn.y -9);
			var pitchAngle;
			if(ballSpawn.name === 'homePlate'){
				pitchAngle = Math.PI/2;
				baseball.animations.play('spinUp');
			}
			else if(ballSpawn.name === 'firstBase'){
				pitchAngle = Math.PI;
				baseball.animations.play('spinLeft');
			}
			else if(ballSpawn.name === 'secondBase'){
				pitchAngle = -Math.PI/2;
				baseball.animations.play('spinDown');
			}
			else if(ballSpawn.name === 'thirdBase'){
				pitchAngle = 0;
				baseball.animations.play('spinRight');
			}
			pitchAngle += (.2*Math.random())-.1;
			ballSpeed -= (Math.floor(50*Math.random()));
			baseball.body.velocity.x = ballSpeed * Math.cos(pitchAngle);
			baseball.body.velocity.y = - ballSpeed * Math.sin(pitchAngle);
		}
		
	}
	function killBall(protagonist,baseball){
		baseball.kill();
		score += 100;
	}
};
