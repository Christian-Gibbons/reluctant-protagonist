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
	var cursors;

	var RANGE = 50;
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

		player.animations.add('playerWalkRight', [9, 10, 11], 10, true);
		player.animations.add('playerWalkLeft', [27, 28, 29], 10, true);
		player.animations.add('playerWalkUp', [0, 1, 2], 10, true);
		player.animations.add('playerWalkDown', [18, 19, 20], 10, true);

		playerDirection = 'down';

		protagonistStart = findObjectsByType('npcStart', map, 'Objects');
		protagonist = game.add.sprite(protagonistStart[0].x, protagonistStart[0].y, 'protagonist');
		protagonist.anchor.setTo(0.5,0.5);

		game.physics.arcade.enable(protagonist);
		protagonist.body.bounce.y = 0.0;
		protagonist.body.gravity.y = 0;
		protagonist.body.collideWorldBounds = true;


		cursors = game.input.keyboard.createCursorKeys();
	}

	function update() {
		var protagonistRange = getPolarDifference(player,protagonist);

		player.body.velocity.x = 0;
		player.body.velocity.y = 0;
		var walkSpeed = 75;

		protagonist.body.velocity.x = 0;
		protagonist.body.velocity.y = 0;
		var protagonistMaxSpeed = 100;

		if(cursors.down.isDown){
			player.body.velocity.y += walkSpeed;
			playerDirection = 'down';
			player.animations.play('playerWalkDown');
		}
		else if(cursors.up.isDown){
			player.body.velocity.y -= walkSpeed;
			playerDirection = 'up';
			player.animations.play('playerWalkUp');
		}
		if(cursors.left.isDown){
			player.body.velocity.x -= walkSpeed;
			playerDirection = 'left';
			player.animations.play('playerWalkLeft');
		}
		else if(cursors.right.isDown){
			player.body.velocity.x += walkSpeed;
			playerDirection = 'right';
			player.animations.play('playerWalkRight');			
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
		}
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
		var ballSpawn;
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
};
