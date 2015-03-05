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

	var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );

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
	var protagonist;

	function create() {
		map = game.add.tilemap('diamond');

		map.addTilesetImage('tileset_8', 'happylandTiles');

		backgroundLayer = map.createLayer('Background');
		backgroundLayer.resizeWorld();

		playerStart = findObjectsByType('playerStart', map, 'Objects');
		player = game.add.sprite(playerStart[0].x, playerStart[0].y, 'player');

		protagonistStart = findObjectsByType('npcStart', map, 'Objects');
		protagonist = game.add.sprite(protagonistStart[0].x, protagonistStart[0].y, 'protagonist');
	}

	function update() {
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
};
