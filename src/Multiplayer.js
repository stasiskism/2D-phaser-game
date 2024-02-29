/* global Phaser */

class Multiplayer extends Phaser.Scene {
    constructor() {
        super({ key: 'Multiplayer'});
    }
    init (data) {
        this.cameras.main.setBackgroundColor('#ffffff')
    }

    preload() {
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
        
        
        // this.cursors = this.input.keyboard.createCursorKeys();
        //player movement
        this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        

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
        if (
            keyInputs.left.isDown ||
            this.a.isDown ||
            keyInputs.right.isDown ||
            this.d.isDown
          ) {
            this.player.setVelocityX(keyInputs.left.isDown || this.a.isDown ? -300 : 300);
            socket.emit('playerMove', {x: this.player.x, y: this.player.y})
          }
          else this.player.setVelocityX(0);
          if (
            keyInputs.up.isDown ||
            this.w.isDown ||
            keyInputs.down.isDown ||
            this.s.isDown
          ){
            this.player.setVelocityY(keyInputs.up.isDown || this.w.isDown ? -300 : 300);
            socket.emit('playerMove', {x: this.player.x, y: this.player.y})
          }
          else this.player.setVelocityY(0);
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