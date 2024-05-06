/* global Phaser, socket */

class Multiplayer extends Phaser.Scene {
    frontendPlayers = {};
    frontendWeapons = {};
    frontendProjectiles = {};
    frontendGrenades = {}
    frontendSmoke = {}
    playerHealth = {}
    weaponDetails = {}
    playerUsername = {}
    gameStop = false

    constructor() {
        super({ key: 'Multiplayer' });
    }

    init(data) {
        this.cameras.main.setBackgroundColor('#000000');
        this.multiplayerId = data.multiplayerId
    }

    preload() {
        this.loadImages();
    }

    loadImages() {
        this.graphics = this.add.graphics()
    }

    create() {
        this.setupScene();
        this.setupInputEvents();
        this.gunAnimation();
    }
    gunAnimation(){
        this.anims.create({
            key: 'singleShot',
            frames: this.anims.generateFrameNumbers('singleShot', { start: 0, end: 10 }),
            frameRate: 60,
            repeat: 0 // Play once
        });

        // Define animations for reload
        this.anims.create({
            key: 'reloads',
            frames: this.anims.generateFrameNumbers('reload', { start: 0, end: 10 }),
            frameRate: 10,
            repeat: 0 // Play once
        });

        // Define animations for emptying
        this.anims.create({
            key: 'emptying',
            frames: this.anims.generateFrameNumbers('emptying', { start: 2, end: 12 }),
            frameRate: 10,
            repeat: 0 // Play once
        });
    }
    setupScene() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.vaizdasImage = this.add.sprite(centerX, centerY, 'mapas');
        this.crosshair = this.physics.add.sprite(centerX, centerY, 'crosshair');
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
        this.graphics.lineStyle(10, 0xff0000);
        this.graphics.strokeRect(0, 0, this.cameras.main.width, this.cameras.main.height);

        const smoke = [
            { key: 'smoke', frame: 1, duration: 200 },
            { key: 'smoke', frame: 2, duration: 200 },
            { key: 'smoke', frame: 4, duration: 200 },
            { key: 'smoke', frame: 8, duration: 500 },
            { key: 'smoke', frame: 12, duration: 500 },
            { key: 'smoke', frame: 13, duration: 2000 },
            { key: 'smoke', frame: 14, duration: 2000 },
            { key: 'smoke', frame: 15, duration: 2000 },
            { key: 'smoke', frame: 16, duration: 3000 },
            { key: 'smoke', frame: 17, duration: 2000 },
            { key: 'smoke', frame: 18, duration: 1000 },
            { key: 'smoke', frame: 20, duration: 500 },
            { key: 'smoke', frame: 22, duration: 500 }, 
            { key: 'smoke', frame: 26, duration: 200 },
            { key: 'smoke', frame: 30, duration: 200 },
            { key: 'smoke', frame: 31, duration: 200 },
        ];

        const config = {
            key: 'smokeExplode',
            frames: smoke,
            frameRate: 20,
            repeat: 0,
        };

        this.anims.create(config);
    }


    setupInputEvents() {

        this.input.on('pointermove', pointer => {
            if (this.input.mouse.locked) {
                this.crosshair.x += pointer.movementX;
                this.crosshair.y += pointer.movementY;
            }
        });

        let canShoot = true
        this.input.mouse.requestPointerLock();

        this.input.on('pointerdown', (pointer) => {
            this.input.mouse.requestPointerLock();
            if (!this.weaponDetails) return
            const firerate = this.weaponDetails.fire_rate
            if (pointer.leftButtonDown() && canShoot) {
                this.startShooting(firerate);
                canShoot = false;
                setTimeout(() => {
                    canShoot = true;
                }, firerate); 
            }
        });

        this.input.on('pointerup', this.stopShooting, this)

        let canReload = true

        this.input.keyboard.on('keydown-R', () => {
            if (!this.weaponDetails || !canReload) return;
            this.frontendWeapons[socket.id].anims.play('reloads', true);
            const reloadTime = this.weaponDetails.reload;
            canReload = false;
            socket.emit('reload', socket.id);
            setTimeout(() => {
                canReload = true;
            }, reloadTime);
        });

        this.input.keyboard.on('keydown-G', () => {
            if (!this.frontendPlayers[socket.id] || !this.crosshair) return;
            const direction = Math.atan((this.crosshair.x - this.frontendPlayers[socket.id].x) / (this.crosshair.y - this.frontendPlayers[socket.id].y))
            socket.emit('throw', this.frontendPlayers[socket.id], this.crosshair, direction, this.multiplayerId);
        })

        this.cursors = this.input.keyboard.createCursorKeys();
        this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        //AR REIKIA SIUSTI SOCKETA DEL ANIMACIJU?
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
            const alivePlayers = {}; // To keep track of alive players
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

            // const alivePlayerCount = Object.keys(alivePlayers).length;
            // if (alivePlayerCount === 1) {
            //     this.gameStop = true
            //     const id = Object.keys(alivePlayers)[0]
            //     this.gameWon(backendPlayers[id].username)
            //     socket.off('updatePlayers')
            // }
        
            // Remove players that are not present in the backend data
            for (const id in this.frontendPlayers) {
                if (!alivePlayers[id]) {
                    this.removePlayer(id);
                }
            }
        
        });

        socket.on('updateProjectiles', (backendProjectiles, backendGrenades) => {
            for (const id in backendProjectiles) {
                if (!this.frontendProjectiles[id]) this.setupProjectile(backendProjectiles[id].playerId, id, backendProjectiles[id]);
                else this.updateProjectilePosition(id, backendProjectiles[id]);
            }
            for (const id in backendGrenades) {
                if (!this.frontendGrenades[id]) this.setupGrenade(backendGrenades[id].playerId, id, backendGrenades[id])
                else this.updateGrenadePosition(id, backendGrenades[id])
            }
            for (const id in this.frontendProjectiles) {
                if (!backendProjectiles[id]) this.removeProjectile(id);
            }
            for (const id in this.frontendGrenades) {
                if (!backendGrenades[id]) this.removeGrenade(id)
            }
        });

    }

    startShooting(firerate) {
        if (!this.frontendPlayers[socket.id] || !this.crosshair) return;
        this.frontendWeapons[socket.id].anims.play('singleShot', true);
        const direction = Math.atan((this.crosshair.x - this.frontendPlayers[socket.id].x) / (this.crosshair.y - this.frontendPlayers[socket.id].y))
        socket.emit('shoot', this.frontendPlayers[socket.id], this.crosshair, direction, this.multiplayerId);
        this.shootingInterval = setInterval(() => {
            const direction = Math.atan((this.crosshair.x - this.frontendPlayers[socket.id].x) / (this.crosshair.y - this.frontendPlayers[socket.id].y))
            socket.emit('shoot', this.frontendPlayers[socket.id], this.crosshair, direction, this.multiplayerId);
        }, firerate); // fire rate based on weapon

    }

    stopShooting() {
        clearInterval(this.shootingInterval)
    }


    setupPlayer(id, playerData) {
        // Cleanup existing player sprites if they exist
        if (this.frontendPlayers[id]) {
            this.frontendPlayers[id].destroy();
            this.frontendWeapons[id].destroy();
            this.playerHealth[id].destroy();
            this.playerUsername[id].destroy()
            this.weaponDetails.destroy()
            if (id === socket.id) {
                this.playerAmmo.destroy()
            }
        }
        // Setup the player
        this.frontendPlayers[id] = this.physics.add.sprite(playerData.x, playerData.y, 'WwalkDown2').setScale(4);
        this.frontendWeapons[id] = this.physics.add.sprite(playerData.x + 80, playerData.y, 'shotgun').setScale(3);
        this.playerHealth[id] = this.add.text(playerData.x, playerData.y + 55, '', { fontFamily: 'Arial', fontSize: 12, color: '#ffffff' });
        this.playerUsername[id] = this.add.text(playerData.x, playerData.y - 50, playerData.username, { fontFamily: 'Arial', fontSize: 12, color: '#ffffff' });
        if (id === socket.id) {
            this.playerAmmo = this.add.text(playerData.x, playerData.y + 750, '', { fontFamily: 'Arial', fontSize: 12, color: '#ffffff' });
            this.weaponDetails = { damage: playerData.damage, fire_rate: playerData.firerate, ammo: playerData.bullets, reload: playerData.reload, radius: playerData.radius}
            console.log(this.weaponDetails)
        }

        // Setup other players
        for (const playerId in this.frontendPlayers) {
            if (playerId !== id) {
                const otherPlayerData = this.frontendPlayers[playerId];
                // Cleanup existing player sprites if they exist
                if (this.frontendPlayers[playerId]) {
                    this.frontendPlayers[playerId].destroy();
                    this.frontendWeapons[playerId].destroy();
                    this.playerHealth[playerId].destroy()
                    this.playerUsername[playerId].destroy()
                }
                // Create frontend sprites for other players
                this.frontendPlayers[playerId] = this.physics.add.sprite(otherPlayerData.x, otherPlayerData.y, 'WwalkDown2').setScale(4);
                this.frontendWeapons[playerId] = this.physics.add.sprite(otherPlayerData.x + 80, otherPlayerData.y, 'shotgun').setScale(3);
                this.playerHealth[playerId] = this.add.text(otherPlayerData.x, otherPlayerData.y - 30, '', { fontFamily: 'Arial', fontSize: 12, color: '#ffffff' });
                this.playerUsername[playerId] = this.add.text(otherPlayerData.x, otherPlayerData.y - 50, otherPlayerData.username, { fontFamily: 'Arial', fontSize: 12, color: '#ffffff' });
            }
        }
    }

    updatePlayerPosition(id, backendPlayer) {
        this.frontendPlayers[id].x = backendPlayer.x;
        this.frontendPlayers[id].y = backendPlayer.y;
        this.playerHealth[id].setPosition(backendPlayer.x, backendPlayer.y + 55)
        this.playerHealth[id].setText(`Health: ${backendPlayer.health}`);
        this.playerHealth[id].setOrigin(0.5).setScale(2);
        this.playerUsername[id].setPosition(backendPlayer.x, backendPlayer.y - 50)
        this.playerUsername[id].setText(`${backendPlayer.username}`);
        this.playerUsername[id].setOrigin(0.5).setScale(2);
        if (id === socket.id) {
            this.playerAmmo.setPosition(backendPlayer.x, backendPlayer.y + 75).setText(`Ammo: ${backendPlayer.bullets}`).setOrigin(0.5).setScale(2)
        }
    }

    removePlayer(id) {
  
        if (id === socket.id && !this.gameStop) {
            socket.removeAllListeners()
            this.scene.stop('Multiplayer')
            this.scene.start('respawn', {multiplayerId: this.multiplayerId, frontendPlayers: this.frontendPlayers, frontendProjectiles: this.frontendProjectiles, frontendWeapons: this.frontendWeapons, playerHealt: this.playerHealth})
            this.playerAmmo.destroy()
            delete this.weaponDetails
        }
        if (id === socket.id ) {
            this.playerAmmo.destroy()
        }
        this.frontendPlayers[id].anims.stop()
        this.frontendPlayers[id].destroy();
        this.frontendWeapons[id].destroy();
        this.playerHealth[id].destroy()
        this.playerUsername[id].destroy()
        delete this.frontendPlayers[id];
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

    updateProjectilePosition(id, backendProjectile) {
        const projectile = this.frontendProjectiles[id];
        projectile.x += backendProjectile.velocity.x * 1; // Adjust the multiplier based on the desired speed
        projectile.y += backendProjectile.velocity.y * 1; // Adjust the multiplier based on the desired speed
    }

    removeProjectile(id) {
        this.frontendProjectiles[id].destroy();
        delete this.frontendProjectiles[id];
    }

    setupGrenade(playerId, id, backendGrenade) {
        const grenade = this.physics.add.sprite(backendGrenade.x, backendGrenade.y, 'smokeGrenade').setScale(4)
        const direction = Phaser.Math.Angle.Between(
            this.frontendPlayers[playerId].x,
            this.frontendPlayers[playerId].y,
            this.crosshair.x,
            this.crosshair.y
        );
        grenade.setRotation(direction)
        this.frontendGrenades[id] = grenade
    }

    updateGrenadePosition(id, backendGrenade) {
        const grenade = this.frontendGrenades[id]
        grenade.x += backendGrenade.velocity.x 
        grenade.y += backendGrenade.velocity.y 
        if (backendGrenade.velocity.x === 0 && backendGrenade.velocity.y === 0) {
            this.grenadeExplode(grenade.x, grenade.y, id)
        }
    }

    removeGrenade(id) {
        this.frontendGrenades[id].destroy()
        delete this.frontendGrenades[id]
    }

    update() {
        this.updatePlayerMovement();
        this.updateCameraPosition();
        this.updateCrosshairPosition();
    }

    updatePlayerMovement() {
        if (!this.frontendPlayers[socket.id]) return;
        const player = this.frontendPlayers[socket.id];
        const weapon = this.frontendWeapons[socket.id];
        let moving = false;
        let direction = '';

        if (this.w.isDown) {
            moving = true;
            direction += 'Up';
            player.y -= 2;
            socket.emit('playerMove', 'w');
        } else if (this.s.isDown) {
            moving = true;
            direction += 'Down';
            player.y += 2;
            socket.emit('playerMove', 's');
        }

        if (this.a.isDown) {
            moving = true;
            direction += 'Left';
            player.x -= 2;
            socket.emit('playerMove', 'a');
        } else if (this.d.isDown) {
            moving = true;
            direction += 'Right';
            player.x += 2;
            socket.emit('playerMove', 'd');
        }

        if (moving) {
            const animationName = `Wwalk${direction}`;
            player.anims.play(animationName, true);
            socket.emit('playerAnimationChange', { playerId: socket.id, animation: animationName });
        } else {
            player.anims.stop();
            socket.emit('playerAnimationChange', { playerId: socket.id, animation: 'idle' });
        }

        if (player && weapon) {
            const angleToPointer = Phaser.Math.Angle.Between(player.x, player.y, this.crosshair.x, this.crosshair.y);
            weapon.setRotation(angleToPointer);
            const orbitDistance = 70;
            const weaponX = player.x + Math.cos(angleToPointer) * orbitDistance;
            const weaponY = player.y + Math.sin(angleToPointer) * orbitDistance;
            weapon.setPosition(weaponX, weaponY);
            socket.emit('updateWeaponState', { playerId: socket.id, x: weaponX, y: weaponY, rotation: angleToPointer });
        }
    }

    updateCameraPosition() {
        if (!this.frontendPlayers[socket.id]) return;
        const avgX = (this.frontendPlayers[socket.id].x + this.crosshair.x) / 2 - 1920 / 2;
        const avgY = (this.frontendPlayers[socket.id].y + this.crosshair.y) / 2 - 1080 / 2;
        this.cameras.main.scrollX = avgX;
        this.cameras.main.scrollY = avgY;
    }

    updateCrosshairPosition() {
        if (!this.frontendPlayers[socket.id]) return;
        const crosshairRadius = this.weaponDetails.radius
        const player = this.frontendPlayers[socket.id];
        this.crosshair.body.velocity.x = player.body.velocity.x;
        this.crosshair.body.velocity.y = player.body.velocity.y;
        this.constrainReticle(this.crosshair, crosshairRadius); 
    }

    constrainReticle(reticle, radius) {
        const distBetween = Phaser.Math.Distance.Between(this.frontendPlayers[socket.id].x, this.frontendPlayers[socket.id].y, reticle.x, reticle.y);
        if (distBetween > radius) {
            const scale = distBetween / radius;
            reticle.x = this.frontendPlayers[socket.id].x + (reticle.x - this.frontendPlayers[socket.id].x) / scale;
            reticle.y = this.frontendPlayers[socket.id].y + (reticle.y - this.frontendPlayers[socket.id].y) / scale;
        }
    }

    gameWon(username) {
        socket.removeAllListeners()
        this.cameras.main.centerOn(this.cameras.main.width / 2, this.cameras.main.height / 2);
        const winningText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `${username} has won the game!`,
            { fontFamily: 'Arial', fontSize: 48, color: '#ffffff' }
        );

        winningText.setOrigin(0.5);
        for (const id in this.frontendPlayers) {
            this.removePlayer(id);
        }

        socket.emit('gameWon', this.multiplayerId, username)

        this.time.delayedCall(5000, () => {
            socket.emit('leaveRoom', this.multiplayerId)
            this.scene.stop()
            this.scene.start('lobby');
        });
    }

    grenadeExplode(x, y, id) {
    const smoke = this.add.sprite(x, y, 'smoke').setScale(12);
    this.frontendSmoke[id] = smoke

    smoke.play('smokeExplode');
    //removint granatos sprite
    smoke.on('animationcomplete', () => {
        smoke.destroy(); 
        delete this.frontendSmoke[id]
    });
    }

}

export default Multiplayer;
