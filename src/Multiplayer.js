/* global Phaser */

class Multiplayer extends Phaser.Scene {
    constructor() {
        super({ key: 'Multiplayer'});
    }
    init (data) {
        this.cameras.main.setBackgroundColor('#ffffff')
    }

    preload() {
        this.load.image('WwalkUp1', 'assets/8-dir-chars/WwalkUp1.png')
        this.load.image('WwalkUp2', 'assets/8-dir-chars/WwalkUp2.png')
        this.load.image('WwalkUp3', 'assets/8-dir-chars/WwalkUp3.png')
        this.load.image('WwalkRight1', 'assets/8-dir-chars/WwalkRight1.png')
        this.load.image('WwalkRight2', 'assets/8-dir-chars/WwalkRight2.png')
        this.load.image('WwalkRight3', 'assets/8-dir-chars/WwalkRight3.png')
        this.load.image('WwalkUpRight1', 'assets/8-dir-chars/WwalkUpRight1.png')
        this.load.image('WwalkUpRight2', 'assets/8-dir-chars/WwalkUpRight2.png')
        this.load.image('WwalkUpRight3', 'assets/8-dir-chars/WwalkUpRight3.png')
        this.load.image('WwalkDownRight1', 'assets/8-dir-chars/WwalkDownRight1.png')
        this.load.image('WwalkDownRight2', 'assets/8-dir-chars/WwalkDownRight2.png')
        this.load.image('WwalkDownRight3', 'assets/8-dir-chars/WwalkDownRight3.png')
        this.load.image('WwalkDown1', 'assets/8-dir-chars/WwalkDown1.png')
        this.load.image('WwalkDown2', 'assets/8-dir-chars/WwalkDown2.png')
        this.load.image('WwalkDown3', 'assets/8-dir-chars/WwalkDown3.png')
        this.load.image('WwalkDownLeft1', 'assets/8-dir-chars/WwalkDownLeft1.png')
        this.load.image('WwalkDownLeft2', 'assets/8-dir-chars/WwalkDownLeft2.png')
        this.load.image('WwalkDownLeft3', 'assets/8-dir-chars/WwalkDownLeft3.png')
        this.load.image('WwalkLeft1', 'assets/8-dir-chars/WwalkLeft1.png')
        this.load.image('WwalkLeft2', 'assets/8-dir-chars/WwalkLeft2.png')
        this.load.image('WwalkLeft3', 'assets/8-dir-chars/WwalkLeft3.png')
        this.load.image('WwalkUpLeft1', 'assets/8-dir-chars/WwalkUpLeft1.png')
        this.load.image('WwalkUpLeft2', 'assets/8-dir-chars/WwalkUpLeft2.png')
        this.load.image('WwalkUpLeft3', 'assets/8-dir-chars/WwalkUpLeft3.png')
        this.load.image('mapas', 'assets/mapas.png')
        this.load.image('player', 'assets/player_23.png')
        this.load.image('bullet', 'assets/bullet.jpg')

    }

// var player;
// var otherPlayers = {}; // Object to store other players
// var cursors;
// var socket = io(); // Connect to the server

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.vaizdasImage = this.add.sprite(centerX, centerY, 'mapas');
        this.player = this.physics.add.sprite(1920 / 2, 1080 /2, 'player')
        this.player.setCollideWorldBounds(true);
        const otherPlayers = {};

    this.anims.create({
        key: 'WwalkUp',
        frames: [
            { key: 'WwalkUp1' },
            { key: 'WwalkUp2' },
            { key: 'WwalkUp3' }
        ],
        frameRate: 10,
        repeat: -1
    });
  
    this.anims.create({
      key: 'WwalkUpRight',
      frames: [
          { key: 'WwalkUpRight1' },
          { key: 'WwalkUpRight2' },
          { key: 'WwalkUpRight3' }
      ],
      frameRate: 10,
      repeat: -1
  });
  
    this.anims.create({
      key: 'WwalkRight',
      frames: [
          { key: 'WwalkRight1' },
          { key: 'WwalkRight2' },
          { key: 'WwalkRight3' }
      ],
      frameRate: 10,
      repeat: -1
  });
  
  this.anims.create({
    key: 'WwalkDownRight',
    frames: [
        { key: 'WwalkDownRight1' },
        { key: 'WwalkDownRight2' },
        { key: 'WwalkDownRight3' }
    ],
    frameRate: 10,
    repeat: -1
  });
  
  this.anims.create({
    key: 'WwalkDown',
    frames: [
        { key: 'WwalkDown1' },
        { key: 'WwalkDown2' },
        { key: 'WwalkDown3' }
    ],
    frameRate: 10,
    repeat: -1
  });
  
  this.anims.create({
    key: 'WwalkDownLeft',
    frames: [
        { key: 'WwalkDownLeft1' },
        { key: 'WwalkDownLeft2' },
        { key: 'WwalkDownLeft3' }
    ],
    frameRate: 10,
    repeat: -1
  });
  
  this.anims.create({
    key: 'WwalkLeft',
    frames: [
        { key: 'WwalkLeft1' },
        { key: 'WwalkLeft2' },
        { key: 'WwalkLeft3' }
    ],
    frameRate: 10,
    repeat: -1
  });
  
  this.anims.create({
    key: 'WwalkUpLeft',
    frames: [
        { key: 'WwalkUpLeft1' },
        { key: 'WwalkUpLeft2' },
        { key: 'WwalkUpLeft3' }
    ],
    frameRate: 10,
    repeat: -1
  });
        
        // this.cursors = this.input.keyboard.createCursorKeys();
        //player movement
        this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.player = this.physics.add.sprite(1920 / 2, 1080 /2, 'WwalkDown2')
        this.player.setScale(2);
        this.player.setCollideWorldBounds(true);
        

        // Listen for new player connections
        socket.on('newPlayer', (playerInfo) => {
            addOtherPlayer(this, playerInfo.id, playerInfo.x, playerInfo.y);
            console.log(this.addOtherPlayer)
        });

        // Listen for player movements
        socket.on('playerMove', (moveInfo) => {
            if (otherPlayers[moveInfo.id]) {
                otherPlayers[moveInfo.id].setPosition(moveInfo.x, moveInfo.y);
            }
        });

        // Listen for player disconnections
        socket.on('playerDisconnected', (info) => {
            if (otherPlayers[info.id]) {
                otherPlayers[info.id].destroy();
                delete otherPlayers[info.id];
            }
        });
    }

    update() {
     let keyInputs = this.input.keyboard.createCursorKeys();
     // Get the horizontal and vertical velocity components
     let velocityX = 0;
     let velocityY = 0;
 
     if (keyInputs.left.isDown || this.a.isDown) {
         velocityX = -300;
     } else if (keyInputs.right.isDown || this.d.isDown) {
         velocityX = 300;
     }
 
     if (keyInputs.up.isDown || this.w.isDown) {
         velocityY = -300;
     } else if (keyInputs.down.isDown || this.s.isDown) {
         velocityY = 300;
     }
 
     // Set the player's velocity
     this.player.setVelocityX(velocityX);
     this.player.setVelocityY(velocityY);
 
     // Determine the animation based on the combined velocity components
     if (velocityX < 0 && velocityY < 0) {
         this.player.anims.play('WwalkUpLeft', true);
     } else if (velocityX > 0 && velocityY < 0) {
         this.player.anims.play('WwalkUpRight', true);
     } else if (velocityX < 0 && velocityY > 0) {
         this.player.anims.play('WwalkDownLeft', true);
     } else if (velocityX > 0 && velocityY > 0) {
         this.player.anims.play('WwalkDownRight', true);
     } else if (velocityX < 0) {
         this.player.anims.play('WwalkLeft', true);
     } else if (velocityX > 0) {
         this.player.anims.play('WwalkRight', true);
     } else if (velocityY < 0) {
         this.player.anims.play('WwalkUp', true);
     } else if (velocityY > 0) {
         this.player.anims.play('WwalkDown', true);
     } else {
         this.player.anims.stop();
     }
        // Example movement logic for the player
        // if (cursors.left.isDown) {
        //     player.x -= 2;
        //     this.socket.emit('playerMove', { x: player.x, y: player.y });
        // } else if (cursors.right.isDown) {
        //     player.x += 2;
        //     socket.emit('playerMove', { x: player.x, y: player.y });
        // }

        // if (cursors.up.isDown) {
        //     player.y -= 2;
        //     socket.emit('playerMove', { x: player.x, y: player.y });
        // } else if (cursors.down.isDown) {
        //     player.y += 2;
        //     socket.emit('playerMove', { x: player.x, y: player.y });
        // }
    }

    addOtherPlayer(scene, id, x, y) {
        const otherPlayer = scene.add.circle(x, y, 20, 0xff0000); // Different color for other players
        otherPlayers[id] = otherPlayer;
    }
    }
export default Multiplayer