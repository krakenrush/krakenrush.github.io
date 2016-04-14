var game = new Phaser.Game(
	800, 600, Phaser.AUTO, 'game',
	{
		preload: preload,
		create: create,
		update: update
	}
);

var player_vspeed = 180;
var player_hspeed = 180;

var background_hspeed = 400;

var fish_hspeed = 50;

var health = 1;
var score = 0;

var easy_factor = 5;

function increaseHealth(v){
	health += v;
	if (health > 1)
		health = 1;
}

function decreaseHealth(v){
	health -= v;
	if (health < 0) {
		health = 0;
	}
	if (health == 0)
		gameOver();
}

function gameOver(){
		game.destroy();
		$('#modal-game-over').modal();
		$('#modal-game-over-text').text("You scored " + score + "!");
}

function createFish(sprite, movement_start, speed, speed_variation, mirror){
	var new_fish = fish.create(
		game.world.width+64,
		64 + (game.world.height-128) * Math.random(),
		sprite || 'fish_1'
	);
	new_fish.anchor.setTo(.5,.5);
	new_fish.scale.setTo(0.5, 0.5)
	new_fish.body.velocity.x = -speed + (speed_variation || 50)*Math.random();
	new_fish.customSeparateX = true;
	new_fish.customSeparateY = true;
	new_fish.animations.add('default').loop=true;
	new_fish.animations.play('default');

	if (movement_start == "left") {
		new_fish.body.velocity.x *= -1;
		new_fish.x = -64;
	}
	if (mirror) {
		new_fish.scale.x *= -1;
	}
}

function createObstacle(){
		var mode = Math.round(Math.random()*1);
		var new_obstacle = on_top_obstacles.create(game.world.width+256, -32 - 128*Math.random(),'obstacle_1');
		new_obstacle.scale.setTo(1.2, 1.2);
		new_obstacle.body.immovable = true;
		new_obstacle.body.velocity.x = -background_hspeed;
		if (mode == 0) {
			new_obstacle.y = game.world.height - new_obstacle.height + 32 + 128*Math.random();
		}
}

function createCoin(){
	var new_coin = coins.create(game.world.width+256, 100+400*Math.random(),'coin');
	new_coin.scale.setTo(0.3, 0.3)
	new_coin.body.immovable = true;
	new_coin.body.velocity.x = -background_hspeed;

}

function overlapFish(player, current_fish){
	if (current_fish.key == 'fish_5' || current_fish.key == 'fish_6') {
		fish_scream.play();
		decreaseHealth(0.1);
	}
	else {
		fish_eat.play();
		increaseHealth(0.05*Math.random());
	}
	current_fish.kill();
}

function preload() {
	// Load sprites
	game.load.image('fish_1', 'assets/fishes/fish_1.svg');
	game.load.image('fish_2', 'assets/fishes/fish_2.svg');
	game.load.image('fish_3', 'assets/fishes/fish_3.svg');
	game.load.image('fish_4', 'assets/fishes/fish_4.svg');
	game.load.image('fish_5', 'assets/fishes/fish_5.svg');
	game.load.image('fish_6', 'assets/fishes/fish_6.svg');

	game.load.image('water_plants_1', 'assets/backgrounds/water_plants_1.svg');
	game.load.image('water_plants_2', 'assets/backgrounds/water_plants_2.svg');
	game.load.image('blue', 'assets/backgrounds/blurry_blue.svg');
	game.load.image('ground', 'assets/ground_dynamic.svg');
	game.load.image('ceiling', 'assets/ceiling.svg');
	game.load.image('obstacle_1', 'assets/obstacles/obstacle_1.svg');
	game.load.image('health_bg', 'assets/health_bar_background.svg');
	game.load.image('health_fg', 'assets/health_bar.svg');
	game.load.image('score_symbol', 'assets/score_symbol.svg');
	game.load.image('coin', 'assets/coin.svg');
	game.load.audio('orbital_colossus', 'assets/music/Orbital Colossus.mp3');
	game.load.audio('fish_eat', 'assets/audio/eating.mp3');
	game.load.audio('fish_scream', 'assets/audio/scream.mp3');
	game.load.audio('coin_select', 'assets/audio/Pickup_Coin.wav');
	game.load.spritesheet('kraken', 'assets/result-sprite.png', 270, 270);
	game.load.spritesheet('raptor_1', 'assets/fishes/raptor_1.png', 270, 270);
}

function create() {
	// music
	music = game.add.audio('orbital_colossus');
	music.loopFull();

	fish_eat = game.add.audio('fish_eat');
	fish_scream = game.add.audio('fish_scream');
	coin_select = game.add.audio('coin_select');

	// Init physics
  game.physics.startSystem(Phaser.Physics.ARCADE);

	// Backgrounds
	game.add.sprite(0,0,'blue')

	// Waterplants
	water_plants = game.add.group();
	water_plants.enableBody = true;

	water_plants_1 = water_plants.create(0,0,'water_plants_1');
	water_plants_1.y = game.world.height - water_plants_1.height;
	water_plants_1.body.immovable = true;

	water_plants_2 = water_plants.create(game.world.width,0,'water_plants_2');
	water_plants_2.y = game.world.height - water_plants_2.height;
	water_plants_2.body.immovable = true;

	// Coins
	coins = game.add.group();
	coins.enableBody = true;
	game.physics.arcade.enable(coins);

	// Fish
	fish = game.add.group();
	fish.enableBody = true;
	game.physics.arcade.enable(fish);

	// on_top_obstacles
	on_top_obstacles = game.add.group();
	on_top_obstacles.enableBody = true;

	// Obstacles
	obstacles = game.add.group();
	obstacles.enableBody = true;

	// Ground
	ground1 = obstacles.create(0, game.world.height - 32, 'ground');
  ground1.body.immovable = true;

	ground2 = obstacles.create(game.world.width, game.world.height - 32, 'ground');
  ground2.body.immovable = true;

	// Ceiling
	ceiling1 = obstacles.create(0, 0, 'ceiling');
	ceiling1.body.immovable = true;

	ceiling2 = obstacles.create(game.world.width, 0, 'ceiling');
	ceiling2.body.immovable = true;

	// Player
  player = game.add.sprite(game.world.width/2, game.world.height / 2, 'kraken');
	player.animations.add('left');
	player.scale.setTo(0.5, 0.5)
  game.physics.arcade.enable(player);
	player.body.allowGravity = false;
	player.body.collideWorldBounds = true;
	player.anchor.setTo(.5,.5);

	game.add.sprite(16,16,'health_bg');
	health_bar = game.add.sprite(16,16,'health_fg');

	score_symbol = game.add.sprite(680, 4, "score_symbol");
	score_symbol.scale.setTo(0.9, 0.9)

	var style = { font: "40px Ubuntu", fill: "#000000" };
	score_text = game.add.text(710, 32, "0", style);


	// Events
	var fish_timer = game.time.create(false);
	fish_timer.loop(2000, function(){
		var r = Math.round(Math.random()*5);
		switch(r) {
			case 0:
				createFish(
					'fish_1',
					'left',
					250
				);
				break;
			case 1:
				createFish(
					'fish_2',
					'left',
					350
				);
				break;
			case 2:
				createFish(
					'fish_3',
					'right',
					60
				);
				break;
			case 3:
				createFish(
					'fish_4',
					'right',
					350,
					50,
					true
				);
				break;
		}
	}, this);
	fish_timer.loop(5000, function(){
		createObstacle();
	}, this);
	fish_timer.loop(7000, function(){
		createCoin();
	}, this);
	fish_timer.start();

	fish_timer.loop(1000, function(){
		var r = Math.round(Math.random()*(1+easy_factor));
		console.log(r);
		switch(r) {
			case 0:
				createFish(
					'fish_5',
					'right',
					500,
					50,
					true
				);
				break;
			case 1:
				createFish(
					'fish_6',
					'right',
					500,
					50,
					true
				);
				break;
			}

	});
}

function update() {
	// Health
	health_bar.scale.x = health;
	score_text.text = score;
	player.animations.play('left')

	// Check if kraken went out of game
	if (player.x < 0)
		gameOver();

	// Handle collisions
  game.physics.arcade.collide(player, obstacles);
	game.physics.arcade.collide(player, on_top_obstacles);
	game.physics.arcade.overlap(player, coins, function(player, coin){
		if (score == 5)
			easy_factor = 4;
		else if (score == 10)
			easy_factor = 3;
		else if (score == 20)
			easy_factor = 2;
		else if (score == 30)
			easy_factor = 0;
		score++;
		coin.kill();
		coin_select.play();
	}, null, this);
	game.physics.arcade.overlap(player, fish, overlapFish, null, this);

	// Move the ground
	ground1.body.velocity.x = -background_hspeed;
	ground2.body.velocity.x = -background_hspeed;

	if (ground1.x <= -game.world.width) {
		ground1.x = ground2.x+ground2.width;
	}
	else if (ground2.x <= -game.world.width)
		ground2.x = ground1.x+ground1.width

	// Move the ceiling
	ceiling1.body.velocity.x = -background_hspeed;
	ceiling2.body.velocity.x = -background_hspeed;

	if (ceiling1.x <= -game.world.width) {
		ceiling1.x = ceiling2.x+ceiling2.width;
	}
	else if (ceiling2.x <= -game.world.width)
		ceiling2.x = ceiling1.x+ceiling1.width

	// Move water_plants
	water_plants_1.body.velocity.x = -background_hspeed;
	water_plants_2.body.velocity.x = -background_hspeed;

	if (water_plants_1.x <= -game.world.width) {
		water_plants_1.x = water_plants_2.x+water_plants_2.width;
	}
	else if (water_plants_2.x <= -game.world.width)
		water_plants_2.x = water_plants_1.x+water_plants_1.width

	// Input
	cursors = game.input.keyboard.createCursorKeys();
	if (cursors.left.isDown) {
		player.body.velocity.x = -player_hspeed;
		player.scale.x = -0.5;
	}
	else if (cursors.right.isDown) {
		player.body.velocity.x = player_hspeed;
		player.scale.x = 0.5;
	}
	else {
		if (player.body.velocity.x > 0)
		 	player.body.velocity.x -= 5;
		else if (player.body.velocity.x < 0) {
			player.body.velocity.x += 5;
		}
	}

	if (cursors.up.isDown) {
		player.body.velocity.y = -player_vspeed;
	}
	else if (cursors.down.isDown) {
		player.body.velocity.y = player_vspeed;
	}
	else {
		if (player.body.velocity.y > 0)
		 	player.body.velocity.y -= 5;
		else if (player.body.velocity.y < 0) {
			player.body.velocity.y += 5;
		}
	}
}
$( document ).ready(function() {
	$('#modal-game-over').on('hidden.bs.modal', function(){
		location.reload();
		console.log("!!!")

	});
});
