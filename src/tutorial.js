
class Tutorial extends Phaser.Scene {
    constructor() {
      super({ key: 'tutorial' });
      this.player = null;
      this.crosshair = null;
      this.projectiles = [];
      this.popupText = null;
      this.nextText = null;
      this.eKey = null;
      this.step = 0;
    }
  
    init(data) {
        this.cameras.main.setBackgroundColor('#000000');
    }

    preload() {
    }


    create() {
        this.setupScene();
        this.setupAnimations();
        this.setupPopupText('Hello, this is tutorial');
        this.setupNextText();
        this.setupInputEvents();
    }
    
    setupPopupText(text) {
        this.popupText = this.add.text(100, 100, text, { fontSize: '32px', fill: '#fff' }).setScrollFactor(0).setDepth(1);
        this.player.setPosition(this.centerX, this.centerY)
        this.player.anims.stop();

        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    setupNextText() {
        this.nextText = this.add.text(100, 130, 'Press E to the next step', { fontSize: '24px', fill: '#fff' }).setScrollFactor(0).setDepth(1);
    }

    setupInputEvents() {
        this.input.on('pointerdown', () => {
            this.input.mouse.requestPointerLock();
        });

        this.input.on('pointermove', pointer => {
            if (this.input.mouse.locked) {
                this.crosshair.x += pointer.movementX;
                this.crosshair.y += pointer.movementY;
            }
        });
        // if (this.step === 2) {
        //     this.input.on('pointerdown', this.shootProjectile, this);
        // }

        this.cursors = this.input.keyboard.createCursorKeys();
        this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        if (this.step === 0) {
            this.input.keyboard.on('keydown-E', this.nextStep, this);
        }
    }

    nextStep() {
        // Increment step
        this.step++;
        // Remove popup text
        this.popupText.destroy();
        this.nextText.destroy();
        this.input.keyboard.off('keydown-E', this.nextStep, this);
        // Handle next step
        switch (this.step) {
            case 1:
                this.setupPopupText('To move the player press W to go up, A to go left, D to go right and S to go down.\nGo to the yellow square.')
                this.yellowRectangle = this.add.rectangle(1823, 800, 100, 100, 0xffff00);
                this.physics.add.existing(this.yellowRectangle);
                break;
            case 2:
                //GALIMA PRIDETI NICKNAME
                this.setupPopupText('Good job, now you can have a weapon.\nIt can be fired with left mouse click.\nIt shoots in the direction of the crosshair.\nTry shooting the target.')
                this.weapon = this.physics.add.sprite(this.player.x + 80, this.player.y, 'shotgun').setScale(3);
                this.enemy = this.physics.add.sprite(100, 200, 'enemy').setScale(0.1);
                this.input.on('pointerdown', this.shootProjectile, this);
                break;
            //case 3:
                


            default:
                this.setupPopupText('Congratulations! You have completed the tutorial! Good luck and have fun!')
                setTimeout(() => {
                    this.scene.start('mainMenu');
                    this.scene.stop()
                }, 5000);
                break;
        }
    }

    setupScene() {
        this.centerX = this.cameras.main.width / 2;
        this.centerY = this.cameras.main.height / 2;
        this.vaizdasImage = this.add.sprite(this.centerX, this.centerY, 'mapas');
        this.crosshair = this.physics.add.sprite(this.centerX, this.centerY, 'crosshair').setCollideWorldBounds(true);
        this.player = this.physics.add.sprite(this.centerX, this.centerY, 'WwalkDown2').setScale(4).setCollideWorldBounds(true).setDepth(1);
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

    shootProjectile(pointer) {
        const direction = Math.atan((this.crosshair.x - this.player.x) / (this.crosshair.y - this.player.y));
        if (!pointer.leftButtonDown()) return;

        // Create a projectile
        const projectile = this.physics.add.sprite(this.player.x, this.player.y, 'bullet').setScale(2);
        projectile.setRotation(direction);

        let x, y
        //Calculate X and y velocity of bullet to move it from shooter to target
        if (this.crosshair.y >= this.player.y)
        {
            x = 30 * Math.sin(direction);
            y = 30 * Math.cos(direction);
        }
        else
        {
            x = -30 * Math.sin(direction);
            y = -30 * Math.cos(direction);
        }

        // Calculate velocity based on direction
        projectile.velocity = { x, y };

        // Add the projectile to the list
        this.projectiles.push(projectile);
    }

    update() {
        
        this.updatePlayerMovement();
        if (this.step === 1) {
            this.physics.overlap(this.player, this.yellowRectangle, () => {
                this.yellowRectangle.destroy();
                this.nextStep();
            });
        }
        this.updateCameraPosition();
        this.updateCrosshairPosition();
        this.updateProjectile();

        for (let projectileIndex = this.projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
            const projectile = this.projectiles[projectileIndex]
            const distance = Math.hypot(projectile.x - this.enemy.x, projectile.y - this.enemy.y)
            
            if (distance < 50) {    
            this.enemy.destroy()
            this.projectiles.splice(projectileIndex, 1);
            projectile.destroy()
            this.nextStep()
           }
        }
        
    }

    updatePlayerMovement() {
        if (this.step === 0) return;
        const player = this.player;
        const weapon = this.weapon;
        let moving = false;
        let direction = '';

        if (this.w.isDown) {
            moving = true;
            direction += 'Up';
            player.y -= 2;
        } else if (this.s.isDown) {
            moving = true;
            direction += 'Down';
            player.y += 2;
        }

        if (this.a.isDown) {
            moving = true;
            direction += 'Left';
            player.x -= 2;
        } else if (this.d.isDown) {
            moving = true;
            direction += 'Right';
            player.x += 2;
        }

        if (moving) {
            const animationName = `Wwalk${direction}`;
            player.anims.play(animationName, true);
        } else {
            player.anims.stop();
        }

        if (player && weapon) {
            const angleToPointer = Phaser.Math.Angle.Between(player.x, player.y, this.crosshair.x, this.crosshair.y);
            weapon.setRotation(angleToPointer);
            const orbitDistance = 70;
            const weaponX = player.x + Math.cos(angleToPointer) * orbitDistance;
            const weaponY = player.y + Math.sin(angleToPointer) * orbitDistance;
            weapon.setPosition(weaponX, weaponY);
        }
    }

    updateCameraPosition() {
        const avgX = (this.player.x + this.crosshair.x) / 2 - 1920 / 2;
        const avgY = (this.player.y + this.crosshair.y) / 2 - 1080 / 2;
        this.cameras.main.scrollX = avgX;
        this.cameras.main.scrollY = avgY;
    }

    updateCrosshairPosition() {
        const player = this.player;
        this.crosshair.body.velocity.x = player.body.velocity.x;
        this.crosshair.body.velocity.y = player.body.velocity.y;
        this.constrainReticle(this.crosshair, 550);
    }

    updateProjectile() {
        this.projectiles.forEach((projectile, index) => {
            projectile.x += projectile.velocity.x;
            projectile.y += projectile.velocity.y;
            if (projectile.x < 0 || projectile.x > this.cameras.main.width || projectile.y < 0 || projectile.y > this.cameras.main.height) {
                projectile.destroy();
                this.projectiles.splice(index, 1);
            }
        });
    }

    constrainReticle(reticle, radius) {
        const distX = reticle.x - this.player.x;
        const distY = reticle.y - this.player.y;

        if (distX > 1920) reticle.x = this.player.x + 1920;
        else if (distX < -1920) reticle.x = this.player.x - 1920;

        if (distY > 1080) reticle.y = this.player.y + 1080;
        else if (distY < -1080) reticle.y = this.player.y - 1080;

        const distBetween = Phaser.Math.Distance.Between(this.player.x, this.player.y, reticle.x, reticle.y);
        if (distBetween > radius) {
            const scale = distBetween / radius;
            reticle.x = this.player.x + (reticle.x - this.player.x) / scale;
            reticle.y = this.player.y + (reticle.y - this.player.y) / scale;
        }
    }
}
  
  export default Tutorial;
  