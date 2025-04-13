var config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image("sky", "./assets/sky.png");
  this.load.image("ground", "./assets/platform.png");
  this.load.image("star", "./assets/star.png");
  this.load.image("bomb", "./assets/bomb.png");
  this.load.spritesheet("dude", "./assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

var platforms;
var player;
var cursors;
var stars;
var score = 0;
var scoreText;
var bombs;
var gameOver = false;

function create() {
  //static components => tile and grounds
  let bg = this.add.image(window.innerWidth / 2, window.innerHeight / 2, "sky");
  bg.setDisplaySize(window.innerWidth, window.innerHeight); //changed the size of the image to the size of window
  platforms = this.physics.add.staticGroup();
  let ground1 = platforms.create(
    window.innerWidth / 2,
    window.innerHeight,
    "ground",
  );
  ground1.setDisplaySize(window.innerWidth, 60).refreshBody();
  platforms.create(window.innerWidth / 2, 550, "ground").refreshBody();
  platforms.create(50, 290, "ground").refreshBody();
  platforms.create(window.innerWidth / 2 + 550, 300, "ground").refreshBody();

  //player
  player = this.physics.add.sprite(100, 450, "dude");
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });
  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  cursors = this.input.keyboard.createCursorKeys();

  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 100 },
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.6));
  });
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(player, platforms);

  this.physics.add.overlap(player, stars, collectStar, null, this);
  scoreText = this.add.text(16, 16, "score : 0", {
    fontSize: "32px",
    fill: "#000",
  });

  bombs = this.physics.add.group();
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn", true);
  }
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText("Score : " + score);

  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x < window.innerWidth / 2
        ? Phaser.Math.Between(window.innerWidth / 2, window.innerWidth)
        : Phaser.Math.Between(0, window.innerWidth / 2);

    console.log(x);
    console.log(player.x);
    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play("turn");

  gameOver = true;
}
