class Room extends Phaser.Scene {
    frontendPlayers = {};
    readyPlayers = {}
    readyPlayersCount = 0
    countdownTime = 0
    constructor() {
        super({ key: 'room'});
    }
    init(data) {
        this.roomId = data.roomId
    }
    preload() {
        this.graphics = this.add.graphics()
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
        //PASTOVIAI NAUJINA NES YRA BACKENDE PLAYERIS
        socket.on('updateRoomPlayers', roomPlayers => {
            for (const playerIndex in roomPlayers) {
                const playerData = roomPlayers[playerIndex];
                const roomId = playerData.roomId
                if (this.roomId !== roomId) return;
                const id = playerData.id
                if (!this.frontendPlayers[id]) {
                    this.setupPlayer(id, playerData)
                    this.readyPlayers[id] = false
                } else {
                    this.updatePlayerPosition(id, playerData)
                }
            }

            for (const playerId in this.frontendPlayers) {
                //goes through players, get their id, and if returns undefined, then the player does not exist
                if (!roomPlayers.find(player => player.id === playerId)) { 
                    this.frontendPlayers[playerId].anims.stop();
                    this.frontendPlayers[playerId].destroy();
                    delete this.frontendPlayers[playerId];
                }
            }

        });

        socket.on('countdownEnd', () => {
            //REIKIA PALEIST MULTIPLAYERI TIK SU PLAYERIAIS ESANCIAIS SITAM ROOM
            this.scene.start('Multiplayer', {multiplayerId: this.roomId})
            this.scene.stop()
            
            for (const id in this.frontendPlayers) {
                this.frontendPlayers[id].anims.stop()
                this.frontendPlayers[id].destroy();
                delete this.frontendPlayers[id];
            }
            socket.off('updateRoomPlayers')
        })

        socket.on('playerAnimationUpdate', animData => {
            const { playerId, animation } = animData;
            if (this.frontendPlayers[playerId]) {
                this.frontendPlayers[playerId].anims.play(animation, true);
            }
        });

        socket.on('updateReadyPlayers', (readyCount) => {
            this.readyPlayersCount = readyCount
            if (this.readyPlayersText) {
                this.readyPlayersText.setText(`Ready Players: ${this.readyPlayersCount}`);
            }
            this.checkAllPlayersReady();
        })

        socket.on('updateCountdown', (countdownTime) => {
            this.countdownTime = countdownTime
            if (this.countdownText) {
                this.countdownText.setText(`Game starts in: ${this.countdownTime}`);
            }
        })

    }

    setupScene() {
        this.centerX = this.cameras.main.width / 2;
        this.centerY = this.cameras.main.height / 2;
        const map = this.make.tilemap({ key: "map", tileWidth: 32, tileHeight: 32});
        const tileset = map.addTilesetImage("asd", "tiles");
        const layer = map.createLayer("Tile Layer 1", tileset, 0, 0);
        this.add.sprite(430, 430, 'wasd').setScale(0.2)
        this.add.text(375, 350, 'Movement').setScale(1.5)
        this.add.image(450, 520, 'R').setScale(1.5)
        this.add.text(385, 480, 'Reload').setScale(1.5)
        this.add.image(450, 590, 'G').setScale(1.5)
        this.add.text(350, 540, 'Smoke grenade').setScale(1.5)
        this.add.image(420, 680, 'left-click').setScale(0.2)
        this.add.text(385, 610, 'Shoot').setScale(1.5)
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

        this.exitButton = this.add.sprite(100, 60, 'exit').setScale(0.2)
        this.exitButton.setInteractive({ useHandCursor: true })
        this.exitButton.on('pointerdown', () => {
            socket.emit('leaveRoom', this.roomId)
            socket.removeAllListeners()
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
            let isReady = !this.readyPlayers[socket.id];
            this.readyPlayers[socket.id] = isReady
            socket.emit('updateReadyState', { playerId: socket.id, isReady, roomId: this.roomId });
        });

        this.readyPlayersText = this.add.text(700, 300, `Ready Players: 0`, { fontSize: '32px', fill: '#fff' }).setScale(2)

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
        // if (this.frontendPlayers[id]) {
        //     this.frontendPlayers[id].destroy();
        // }
        // Setup the respawned player
        //CIA ERRORAI KAI STARTINAM MULTIPLAYER GAME
        this.frontendPlayers[id] = this.physics.add.sprite(playerData.x, playerData.y, 'WwalkDown2').setScale(4);
        //console.log(this.frontendPlayers[id])
    
        // Setup other players
        for (const playerId in this.frontendPlayers) {
            if (playerId !== id) {
                const otherPlayerData = this.frontendPlayers[playerId];
                if (otherPlayerData) {
                    otherPlayerData.destroy()
                    this.frontendPlayers[playerId] = this.physics.add.sprite(otherPlayerData.x, otherPlayerData.y, 'WwalkDown2').setScale(4);
                }
            }
        }
    }
    
    update() {
        this.updatePlayerMovement();
    }

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
        let count = 0
        for (const playerId in this.readyPlayers) {
           count++
        }
        if (count === this.readyPlayersCount) {
            this.readyButton.destroy()
            console.log('VISI PLAYERIAI READY')
            this.countdownText = this.add.text(800, 200, '', { fontSize: '64px', fill: '#fff' });
            this.countdownText.setOrigin(0.5);
            socket.emit('startCountdown', this.roomId)
        }
    }

}

export default Room
