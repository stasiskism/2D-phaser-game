/* global Phaser */

class Multiplayer extends Phaser.Scene {
    frontendPlayers = {} 
    frontendProjectiles = {}

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
        this.load.image('bullet', 'assets/Bullets/bullet.png')
        this.load.image('crosshair', 'assets/crosshair008.png')
    }
    

    create() {

        this.cameras.main.zoom = 1;

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.vaizdasImage = this.add.sprite(centerX, centerY, 'mapas');


        //CROSSHAIR LOCK ON MOUSE
        this.crosshair = this.physics.add.sprite(centerX, centerY, 'crosshair')
        this.crosshair.setCollideWorldBounds(true)
        this.input.on('pointerdown', () => {
            this.input.mouse.requestPointerLock();
        });

        
        
        this.cursors = this.input.keyboard.createCursorKeys();
        //player movement
        this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        
        
        //CROSSHAIR FOLLOWS MOUSE
        this.input.on('pointermove', (pointer) => {
                if (this.input.mouse.locked)
                {
                    // Move reticle with mousea
                    this.crosshair.x += pointer.movementX;
                    this.crosshair.y += pointer.movementY;
                }
            });
            //SHOOTING
        this.input.on('pointerdown', (pointer) =>
            {
                const direction = Math.atan((this.crosshair.x - this.frontendPlayers[socket.id].x) / (this.crosshair.y - this.frontendPlayers[socket.id].y))
 
                if (!this.frontendPlayers[socket.id]) { return; }
                if (pointer.leftButtonDown()) {
                    socket.emit('shoot', this.frontendPlayers[socket.id], this.crosshair, direction)
                }
            });

            socket.emit('startGame')
            this.frontendPlayers = {}
            console.log(this.frontendPlayers)

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
                key: 'idle',
                frames: [
                    { key: 'WwalkDown2' }
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
            socket.on('playerAnimationUpdate', (AnimData) => {
                const { playerId, animation } = AnimData;
                // Check if the player exists in the current game state
                if (this.frontendPlayers[playerId]) {
                    // Update the animation of the specified player
                    this.frontendPlayers[playerId].anims.play(animation, true);
                }
            });

    }

    update(delta) {

        //PLAYER MOVEMENT, CONNECTION, DISCONNECTION
        socket.on('updatePlayers', (backendPlayers) => {
            for (const id in backendPlayers) {
                const backendPlayer = backendPlayers[id]

                
                if(!this.frontendPlayers[id]) {
                    this.frontendPlayers[id] = this.physics.add.sprite(backendPlayer.x, backendPlayer.y, 'WwalkDown2')
                    this.frontendPlayers[id].setScale(4)
                    this.frontendPlayers[id].setCollideWorldBounds(true);
                } else {
                    //update position if a player exists
                    this.frontendPlayers[id].x = backendPlayer.x
                    this.frontendPlayers[id].y = backendPlayer.y
                }
            }

            for (const id in this.frontendPlayers) {
                if (!backendPlayers[id]) {
                    this.frontendPlayers[id].destroy()
                    delete this.frontendPlayers[id]
                    if (id === socket.id) {
                        this.scene.start('respawn')
                    }
                }
            }
        });


        //SHOOTING PROJECTILES
        socket.on('updateProjectiles', (backendProjectiles) => {
            for (const id in backendProjectiles) {
                const backendProjectile = backendProjectiles[id]
                if (!this.frontendProjectiles[id]) {
                    this.frontendProjectiles[id] = this.physics.add.sprite(backendProjectile.x, backendProjectile.y, 'bullet')
                    this.frontendProjectiles[id].setScale(4)
                    const direction = Phaser.Math.Angle.Between(
                        this.frontendPlayers[socket.id].x,
                        this.frontendPlayers[socket.id].y,
                        this.crosshair.x,
                        this.crosshair.y
                    );
                    this.frontendProjectiles[id].setRotation(direction);
                    //this.constrainVelocity(this.frontendProjectiles[id], 1)
                } else {
                    //KAZKA PATVARKYT REIKIA, NES assetas JUDA GREICIAU NEI PROJECTILE POSITIONAS
                    this.frontendProjectiles[id].x += backendProjectiles[id].velocity.x * 0.0003
                    this.frontendProjectiles[id].y += backendProjectiles[id].velocity.y * 0.0003
                    //this.constrainVelocity(this.frontendProjectiles[id], 1)
                }
            }

            for (const id in this.frontendProjectiles) {
                if (!backendProjectiles[id]) {
                    this.frontendProjectiles[id].destroy()
                    delete this.frontendProjectiles[id]
                }
            }
        });

        // Example movement logic for the playera
        if(!this.frontendPlayers[socket.id]) return
        else {

            let moving = false;
            let direction = '';

            if (this.w.isDown) {
                moving = true;
                direction += 'Up';
                this.frontendPlayers[socket.id].y -= 2
                socket.emit('playerMove', 'w');
            } else if (this.s.isDown) {
                moving = true;
                direction += 'Down';
                this.frontendPlayers[socket.id].y += 2
                socket.emit('playerMove', 's');
            }

            if (this.a.isDown) {
                moving = true;
                direction = direction + 'Left';
                this.frontendPlayers[socket.id].x -= 2
                socket.emit('playerMove', 'a');
            } else if (this.d.isDown) {
                moving = true;
                direction = direction + 'Right';
                this.frontendPlayers[socket.id].x += 2
                socket.emit('playerMove', 'd');
            }

            if (moving) {
                const animationName = `Wwalk${direction}`;
                this.frontendPlayers[socket.id].anims.play(animationName, true);
                socket.emit('playerAnimationChange', { playerId: socket.id, animation: animationName });
            } else {
                this.frontendPlayers[socket.id].anims.stop();
                socket.emit('playerAnimationChange', { playerId: socket.id, animation: "idle" });
            }
        }


        // Camera position is average between reticle and player positions
        const avgX = (this.frontendPlayers[socket.id].x + this.crosshair.x) / 2 - 1920/2;
        const avgY = (this.frontendPlayers[socket.id].y + this.crosshair.y) / 2 - 1080/2;
        this.cameras.main.scrollX = avgX;
        this.cameras.main.scrollY = avgY;

        // Make reticle move with player
        this.crosshair.body.velocity.x = this.frontendPlayers[socket.id].body.velocity.x;
        this.crosshair.body.velocity.y = this.frontendPlayers[socket.id].body.velocity.y;

        // Constrain position of reticle
        this.constrainReticle(this.crosshair, 550);

    }

    // constrainVelocity (sprite, maxVelocity)
    // {
    //     if (!sprite || !sprite.body) { return; }

    //     let angle, currVelocitySqr, vx, vy;
    //     vx = sprite.body.velocity.x;
    //     vy = sprite.body.velocity.y;
    //     currVelocitySqr = vx * vx + vy * vy;

    //     if (currVelocitySqr > maxVelocity * maxVelocity)
    //     {
    //         angle = Math.atan2(vy, vx);
    //         vx = Math.cos(angle) * maxVelocity;
    //         vy = Math.sin(angle) * maxVelocity;
    //         sprite.body.velocity.x = vx;
    //         sprite.body.velocity.y = vy;
    //     }
    // }

    constrainReticle (reticle, radius)
    {
        const distX = reticle.x - this.frontendPlayers[socket.id].x; // X distance between player & reticle
        const distY = reticle.y - this.frontendPlayers[socket.id].y; // Y distance between player & reticle

        // Ensures reticle cannot be moved offscreen
        if (distX > 1920) { reticle.x = this.frontendPlayers[socket.id].x + 1920; }
        else if (distX < -1920) { reticle.x = this.frontendPlayers[socket.id].x - 1920; }

        if (distY > 1080) { reticle.y = this.frontendPlayers[socket.id].y + 1080; }
        else if (distY < -1080) { reticle.y = this.frontendPlayers[socket.id].y - 1080; }

        // Ensures reticle cannot be moved further than dist(radius) from player
        const distBetween = Phaser.Math.Distance.Between(
            this.frontendPlayers[socket.id].x,
            this.frontendPlayers[socket.id].y,
            reticle.x,
            reticle.y
        );
        if (distBetween > radius)
        {
            // Place reticle on perimeter of circle on line intersecting player & reticle
            const scale = distBetween / radius;

            reticle.x = this.frontendPlayers[socket.id].x + (reticle.x - this.frontendPlayers[socket.id].x) / scale;
            reticle.y = this.frontendPlayers[socket.id].y + (reticle.y - this.frontendPlayers[socket.id].y) / scale;
        }
    }
    
    }

export default Multiplayer