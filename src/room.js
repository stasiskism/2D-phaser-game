class Room extends Phaser.Scene {
    frontendPlayers = {};
    readyPlayers = {}
    readyPlayersCount = 0
    countdownTime = 6
    constructor() {
        super({ key: 'room'});
    }
    init(data) {
        this.roomId = data.roomId
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
        this.load.image('multiplayer', 'assets/multiplayer.png');
        this.load.image('singleplayer', 'assets/singleplayer.png');
        this.load.image('marketplace', 'assets/marketplace.png');
        this.load.image("tiles", 'assets/assetas.png')
        this.load.tilemapTiledJSON('map', 'assets/maps.json');
        this.load.image('wasd', 'assets/wasd.png')
        this.load.image('tutorial', 'assets/tutorials.png')
        this.load.image('fullscreen', 'assets/full-screen.png')
        this.load.image('exit', 'assets/exit.png')
    }
    create() {
        this.setupScene()
        this.setupInputEvents()
        this.setupAnimations()
        
        
    }

    setupInputEvents() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        socket.emit('joinRoom', this.roomId)

        socket.on('roomJoinFailed', errorMessage => {
            alert(errorMessage)
            this.scene.start('lobby')
            this.scene.stop()
        })

        //NEGAUNU BACKENDPLAYERIU, GALIMAI NES REIKIA SERVER SIDE UPDATINT PLAAYERIUS ROOME
        socket.on('updateRoomPlayers', roomPlayers => {
            const alivePlayers = {}
            for (const playerIndex in roomPlayers) {
                const playerData = roomPlayers[playerIndex];
                const roomId = playerData.roomId
                if (this.roomId !== roomId) return;
                const id = playerData.id
                if (!this.frontendPlayers[id]) {
                    this.setupPlayer(id, playerData)
                } else {
                    this.updatePlayerPosition(id, playerData)
                }
                alivePlayers[id] = true
            }

            for (const id in this.frontendPlayers) {
                if (!alivePlayers[id]) {
                    console.log(id)
                }
            }

        });

        socket.on('playerAnimationUpdate', animData => {
            const { playerId, animation } = animData;
            if (this.frontendPlayers[playerId]) {
                this.frontendPlayers[playerId].anims.play(animation, true);
            }
        });

    }

    setupScene() {
        this.centerX = this.cameras.main.width / 2;
        this.centerY = this.cameras.main.height / 2;
        const map = this.make.tilemap({ key: "map", tileWidth: 32, tileHeight: 32});
        const tileset = map.addTilesetImage("asd", "tiles");
        const layer = map.createLayer("Tile Layer 1", tileset, 0, 0);
        this.add.sprite(430, 430, 'wasd').setScale(0.2)
        this.add.text(375, 350, 'Movement').setScale(1.5)
        this.fullscreenButton = this.add.sprite(1890, 30, 'fullscreen').setDepth().setScale(0.1)
        this.fullscreenButton.setInteractive({ useHandCursor: true })
        this.fullscreenButton.on('pointerdown', () => {
            document.getElementById('phaser-example');
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        })

        this.exitButton = this.add.sprite(100, 30, 'exit').setScale(0.5)
        this.exitButton.setInteractive({ useHandCursor: true })
        this.exitButton.on('pointerdown', () => {
            socket.emit('leaveRoom', this.roomId)
            this.scene.start('lobby')
            this.scene.stop()
            if (this.frontendPlayers[socket.id]) {
                this.frontendPlayers[socket.id].anims.stop()
                this.frontendPlayers[socket.id].destroy();
                delete this.frontendPlayers[socket.id];
            }
        })

        this.readyButton = this.add.text(800, 400, 'Ready', { fill: '#0f0' }).setInteractive({ useHandCursor: true }).setScale(4);
        this.readyButton.on('pointerdown', () => {
            if (this.readyPlayers[socket.id]) {
                this.readyPlayers[socket.id] = false;
                this.readyPlayersCount--;
            } else {
                this.readyPlayers[socket.id] = true
                this.readyPlayersCount++
            }
            this.updateReadyPlayersText()
            this.checkAllPlayersReady()
        })
        this.readyPlayersText = this.add.text(700, 300, `Ready Players: ${this.readyPlayersCount}`, { fontSize: '32px', fill: '#fff' }).setScale(2)

        // this.objects = this.physics.add.staticGroup();
        // this.singleplayerObject = this.objects.create(720, 653, 'singleplayer')
        // this.multiplayerObject = this.objects.create(1010, 653, 'multiplayer')
        // this.marketplaceObject = this.objects.create(1290, 653, 'marketplace')
        // this.tutorialObject = this.objects.create(1290, 453, 'tutorial')

        // this.objects.getChildren().forEach(object => {
        //     object.setScale(0.2);
        // });

        // const invisibleWalls = [
        //     { x: 336, y: 959, width: 1250, height: 10 }, // Wall 1
        //     { x: 326, y: 315, width: 10, height: 650 }, // Wall 2
        //     { x: 1580, y: 315, width: 10, height: 650 }, // Wall 3
        //     { x: 326, y: 315, width: 1250, height: 10 }, // Wall 4
        // ];

        // invisibleWalls.forEach(wall => {
        //     const invisibleWall = this.physics.add.sprite(wall.x + wall.width / 2, wall.y + wall.height / 2, 'invisible-wall').setVisible(false).setSize(wall.width, wall.height);
        //     invisibleWall.body.setAllowGravity(false);
        //     invisibleWall.body.setImmovable(true);
        //     this.physics.add.collider(this.player, invisibleWall);
        // });

        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.popupText = this.add.text(100, 100, '', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });
        this.popupText.setVisible(false);

        //this.physics.add.overlap(this.player, this.objects, this.interactWithObject, null, this);
    }

    setupAnimations() {
        const animations = [
            { key: 'WwalkUp', frames: ['WwalkUp1', 'WwalkUp2', 'WwalkUp3'] },
            { key: 'WwalkRight', frames: ['WwalkRight1', 'WwalkRight2', 'WwalkRight3'] },
            { key: 'WwalkUpRight', frames: ['WwalkUpRight1', 'WwalkUpRight2', 'WwalkUpRight3'] },
            { key: 'WwalkDownRight', frames: ['WwalkDownRight1', 'WwalkDownRight2', 'WwalkDownRight3'] },
            { key: 'WwalkDown', frames: ['WwalkDown1', 'WwalkDown2', 'WwalkDown3'] },
            { key: 'WwalkDownLeft', frames: ['WwalkDownLeft1', 'WwalkDownLeft2', 'WwalkDownLeft3'] },
            { key: 'WwalkLeft', frames: ['WwalkLeft1', 'WwalkLeft2', 'WwalkLeft3'] },
            { key: 'WwalkUpLeft', frames: ['WwalkUpLeft1', 'WwalkUpLeft2', 'WwalkUpLeft3'] },
            { key: 'idle', frames: ['WwalkDown2'] }
        ];
        animations.forEach(anim => this.anims.create({
            key: anim.key,
            frames: anim.frames.map(frame => ({ key: frame })),
            frameRate: 10,
            repeat: -1
        }));
    }

    setupPlayer(id, playerData) {
        // Cleanup existing player sprites if they exist
        if (this.frontendPlayers[id]) {
            this.frontendPlayers[id].destroy();
        }
        // Setup the respawned player
        this.frontendPlayers[id] = this.physics.add.sprite(playerData.x, playerData.y, 'WwalkDown2').setScale(4);
        //console.log(this.frontendPlayers[id])
    
        // Setup other players
        for (const playerId in this.frontendPlayers) {
            if (playerId !== id) {
                const otherPlayerData = this.frontendPlayers[playerId];
                // Cleanup existing player sprites if they exist
                if (this.frontendPlayers[playerId]) {
                    this.frontendPlayers[playerId].destroy();
                }
                // Create frontend sprites for other players
                this.frontendPlayers[playerId] = this.physics.add.sprite(otherPlayerData.x, otherPlayerData.y, 'WwalkDown2').setScale(4);
            }
        }
    }
    
    update() {
        this.updatePlayerMovement();
    }
    //CIA GAUNU PLAYER ID O REIKIA VISA DATA GAUT

    updatePlayerMovement() {
        if (!this.frontendPlayers[socket.id] || !this.roomId) return;
        const player = this.frontendPlayers[socket.id];
        let moving = false;
        let direction = '';

        if (this.w.isDown) {
            moving = true;
            direction += 'Up';
            player.y -= 2;
            socket.emit('roomPlayerMove', { data: 'w', roomId: this.roomId });
        } else if (this.s.isDown) {
            moving = true;
            direction += 'Down';
            player.y += 2;
            socket.emit('roomPlayerMove', { data: 's', roomId: this.roomId });
        }

        if (this.a.isDown) {
            moving = true;
            direction += 'Left';
            player.x -= 2;
            socket.emit('roomPlayerMove', { data: 'a', roomId: this.roomId });
        } else if (this.d.isDown) {
            moving = true;
            direction += 'Right';
            player.x += 2;
            socket.emit('roomPlayerMove', { data: 'd', roomId: this.roomId });
        }

        if (moving) {
            if (player && player.anims) {
                const animationName = `Wwalk${direction}`;
                player.anims.play(animationName, true);
                socket.emit('playerAnimationChange', { playerId: socket.id, animation: animationName });
            }
        } else {
            if (player && player.anims) {
            player.anims.stop();
            socket.emit('playerAnimationChange', { playerId: socket.id, animation: 'idle' });
            }
        }
    }

    updatePlayerPosition(id, roomPlayer) {
        this.frontendPlayers[id].x = roomPlayer.x;
        this.frontendPlayers[id].y = roomPlayer.y;
    }

    checkAllPlayersReady() {
        for (const playerId in this.readyPlayers) {
            if (!this.readyPlayers[playerId]) {
                break
            }
        }
        this.countdownText = this.add.text(800, 200, '', { fontSize: '64px', fill: '#fff' });
        this.countdownText.setOrigin(0.5);
        this.startCountdown()
    }

    updateReadyPlayersText() {
        this.readyPlayersText.setText(`Ready Players: ${this.readyPlayersCount}`);
    }

    startCountdown() {
        this.timerEvent = this.time.addEvent({
            delay: 1000, // 1 second
            callback: this.updateCountdown,
            callbackScope: this,
            loop: true
        });
    }

    updateCountdown() {
        this.countdownTime--;
        this.countdownText.setText(`Game starts in: ${this.countdownTime}`);
        if (this.countdownTime === 0) {
            // Stop the countdown timer
            this.timerEvent.remove();
            // Start the game
            this.scene.start('Multiplayer');
            this.scene.stop()
        }
    }



}

export default Room
