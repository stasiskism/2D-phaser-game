/* global Phaser */

class Spectator extends Phaser.Scene {
    frontendPlayers = {};
    frontendWeapons = {};
    frontendProjectiles = {};
    playerHealth = {}
    playerAmmo = {}
    currentPlayerIndex = 0
    playerIds = []

    constructor() {
        super({ key: 'spectator'});
    }

    init (data) {
        this.cameras.main.setBackgroundColor('#000000')
        this.multiplayerId = data.multiplayerId
    }

    preload () {
        this.loadImages();
    }

    loadImages() {
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
        this.load.image('bullet', 'assets/Bullets/bullet.png')
        this.load.image('shotgun', 'assets/Weapons/tile001.png')
        this.load.image('fullscreen', 'assets/full-screen.png')
        this.load.image('quitButton', 'assets/quit.png')
        this.load.image('nextButton', 'assets/arrow-right.png')
        this.load.image('previousButton', 'assets/arrow-left.png')
        this.graphics = this.add.graphics()
    }

    create () {
        this.setupScene();
        this.setupInputEvents();
    }

    setupScene() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.vaizdasImage = this.add.sprite(centerX, centerY, 'mapas');
        this.crosshair = this.physics.add.sprite(centerX, centerY, 'crosshair').setVisible(false);
        this.fullscreenButton = this.add.sprite(1890, 30, 'fullscreen').setDepth().setScale(0.1)
        this.fullscreenButton.setPosition(this.cameras.main.width - 200, 200).setScrollFactor(0)
        this.fullscreenButton.setInteractive({ useHandCursor: true })
        this.fullscreenButton.on('pointerdown', () => {
            document.getElementById('phaser-example');
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();

            }
        })


        this.nextButton = this.add.sprite(0, 0, 'nextButton').setScale(0.2)
        this.nextButton.setPosition(centerX + 200, 1000).setScrollFactor(0)
        this.nextButton.setInteractive({useHandCursor: true})
        this.nextButton.on('pointerdown', () => {
            this.nextPlayer();
        });


        this.previousButton = this.add.sprite(0, 0, 'previousButton').setScale(0.2)
        this.previousButton.setPosition(centerX - 200, 1000).setScrollFactor(0)
        this.previousButton.setInteractive({useHandCursor: true})
        this.previousButton.on('pointerdown', () => {
            this.previousPlayer();
        });
        
        this.graphics.lineStyle(10, 0xff0000);
        this.graphics.strokeRect(0, 0, this.cameras.main.width, this.cameras.main.height);

        this.quitButton = this.add.sprite(1920 / 2, (1080 / 2) - 400, 'quitButton')
        this.quitButton.setInteractive({useHandCursor: true}).setScale(0.75).setPosition(centerX, 1000).setScrollFactor(0)
        this.quitButton.on('pointerdown', () => this.clickQuitButton())
    }
    //NELOADINA PROJECTILE IR ANIMACIJU, BORDERIU
    setupInputEvents() {
        this.input.on('pointermove', pointer => {
            if (this.input.mouse.locked) {
                this.crosshair.x += pointer.movementX;
                this.crosshair.y += pointer.movementY;
            }
        });
        
        socket.on('playerAnimationUpdate', animData => {
            const { playerId, animation } = animData;
            if (this.frontendPlayers[playerId]) {
                this.frontendPlayers[playerId].anims.play(animation, true);
            }
        });
        //AR REIKIA SIUSTI SOCKETA DEL WEAPONO?
        socket.on('weaponStateUpdate', wsData => {
            const { playerId, x, y, rotation } = wsData;
            if (this.frontendPlayers[playerId] && this.frontendWeapons[playerId]) {
                this.frontendWeapons[playerId].setPosition(x, y).setRotation(rotation);
            }
        });

        socket.on('updatePlayers', backendPlayers => {
            const alivePlayers = {}
            // Update existing players and mark them as alive
            for (const id in backendPlayers) {
                const backendPlayer = backendPlayers[id];
                if (this.multiplayerId !== backendPlayer.multiplayerId) return
                const playerId = backendPlayer.id
                if (!this.frontendPlayers[playerId]) {
                    this.setupPlayer(playerId, backendPlayer);
                } else {
                    this.updatePlayerPosition(playerId, backendPlayer);
                }
                // Mark player as alive
                alivePlayers[id] = true;
            }
        
            // Remove players that are not present in the backend data
            for (const id in this.frontendPlayers) {
                if (!alivePlayers[id]) {
                    this.removePlayer(id);
                }
            }

            Object.keys(alivePlayers).forEach(playerId => {
                if (!this.playerIds.includes(playerId)) {
                    this.playerIds.push(playerId);
                }
            });
        
        });

        socket.on('updateProjectiles', backendProjectiles => {
            for (const id in backendProjectiles) {
                if (!this.frontendProjectiles[id]) {
                    this.setupProjectile(backendProjectiles[id].playerId, id, backendProjectiles[id]);
                }
                else {
                    this.updateProjectilePosition(id, backendProjectiles[id]);
                }
            }
            for (const id in this.frontendProjectiles) {
                if (!backendProjectiles[id]) {
                    this.removeProjectile(id);
                }
            }
        });
    }

    setupPlayer(id, playerData) {
        // Cleanup existing player sprites if they exist
        if (this.frontendPlayers[id]) {
            this.frontendPlayers[id].destroy();
            this.frontendWeapons[id].destroy();
            this.playerHealth[id].destroy();
            this.playerAmmo[id].destroy()
        }
        // Setup the player
        this.frontendPlayers[id] = this.physics.add.sprite(playerData.x, playerData.y, 'WwalkDown2').setScale(4);
        console.log('kai setupina playeri: ', this.frontendPlayers[id])
        this.frontendWeapons[id] = this.physics.add.sprite(playerData.x + 80, playerData.y, 'shotgun').setScale(3);
        this.playerHealth[id] = this.add.text(playerData.x, playerData.y - 30, `Health: ${playerData.health}`, { fontFamily: 'Arial', fontSize: 12, color: '#ffffff' });
        this.playerAmmo[id] = this.add.text(playerData.x, playerData.y + 30, `Ammo: ${playerData.bullets}`, { fontFamily: 'Arial', fontSize: 12, color: '#ffffff' });
        // You can add more customization or adjustments here if needed
    }

    updatePlayerPosition(id, backendPlayer) {
        // Update player position, health, etc.
        this.frontendPlayers[id].x = backendPlayer.x;
        this.frontendPlayers[id].y = backendPlayer.y;
        this.playerHealth[id].setPosition(backendPlayer.x - 33, backendPlayer.y - 50);
        this.playerHealth[id].setText(`Health: ${backendPlayer.health}`).setScale(2);
        this.playerAmmo[id].setPosition(backendPlayer.x - 33, backendPlayer.y + 50)
        this.playerAmmo[id].setText(`Ammo: ${backendPlayer.bullets}`).setScale(2);
    }

    removePlayer(id) {
        // Remove player and associated data
        if (this.frontendPlayers[id]) {
            this.frontendPlayers[id].destroy();
            this.frontendWeapons[id].destroy();
            this.playerHealth[id].destroy();
            this.playerAmmo[id].destroy();
            delete this.frontendPlayers[id];
            delete this.frontendWeapons[id];
            delete this.playerHealth[id];
            delete this.playerAmmo[id];
        }
    }

    setupProjectile(playerId, id, backendProjectile) {
        const projectile = this.physics.add.sprite(backendProjectile.x, backendProjectile.y, 'bullet').setScale(4);

        const direction = Phaser.Math.Angle.Between(
            this.frontendPlayers[playerId].x,
            this.frontendPlayers[playerId].y,
            this.crosshair.x,
            this.crosshair.y
        );
        projectile.setRotation(direction);
        this.frontendProjectiles[id] = projectile;
    }

    updateProjectiles(backendProjectiles) {
        for (const id in backendProjectiles) {
            const backendProjectile = backendProjectiles[id];
            if (!this.frontendProjectiles[id]) {
                this.setupProjectile(backendProjectile.playerId, id, backendProjectile);
            } else {
                this.updateProjectilePosition(id, backendProjectile);
            }
        }
        for (const id in this.frontendProjectiles) {
            if (!backendProjectiles[id]) {
                this.removeProjectile(id);
            }
        }
    }

    updateProjectilePosition(id, backendProjectile) {
        const projectile = this.frontendProjectiles[id];
        projectile.x += backendProjectile.velocity.x * 1;
        projectile.y += backendProjectile.velocity.y * 1; 
    }

    removeProjectile(id) {
        this.frontendProjectiles[id].destroy();
        delete this.frontendProjectiles[id];
    }

    update () {
        this.updateCameraPosition();
        this.updateCrosshairPosition();
    }

    updateCameraPosition() {
        if (this.playerIds.length === 0) return; // No players to focus on

        // Get the ID of the current player to focus on
        const playerId = this.playerIds[this.currentPlayerIndex];
        console.log('camera' , playerId)
        if (!this.frontendPlayers[playerId]) return; // Player not found

        const playerX = this.frontendPlayers[playerId].x;
        const playerY = this.frontendPlayers[playerId].y;

        const cameraScrollX = playerX - this.cameras.main.width / 2;
        const cameraScrollY = playerY - this.cameras.main.height / 2;

        this.cameras.main.scrollX = cameraScrollX;
        this.cameras.main.scrollY = cameraScrollY;
    }

    nextPlayer() {
        if (this.playerIds.length === 0) return;
        console.log('next')
        this.currentPlayerIndex++;
        if (this.currentPlayerIndex >= this.playerIds.length) {
            this.currentPlayerIndex = 0; // Reset index to loop back to the first player
        }
    }

    previousPlayer() {
        if (this.playerIds.length === 0) return; // No players to cycle through
        console.log('previous')
        // Decrement the current player index
        this.currentPlayerIndex--;
        if (this.currentPlayerIndex < 0) {
            this.currentPlayerIndex = this.playerIds.length - 1; // Loop back to the last player
        }
    }

    updateCrosshairPosition() {
        for (const id in this.frontendPlayers) {
            const player = this.frontendPlayers[id];
            this.crosshair.body.velocity.x = player.body.velocity.x;
            this.crosshair.body.velocity.y = player.body.velocity.y;
        }
    }

    clickQuitButton() {
        this.scene.start('mainMenu')
        this.scene.stop('spectator')
        this.scene.stop()
        socket.removeAllListeners()
    }
}

export default Spectator