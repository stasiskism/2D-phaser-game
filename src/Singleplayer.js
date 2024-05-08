/* global Phaser */

class Singleplayer extends Phaser.Scene {

  constructor() {
      super({ key: 'Singleplayer'});
      this.score = 0
      this.scoreText
      this.weapon
  }

  init (data) {
    this.cameras.main.setBackgroundColor('#000000');
  }

  preload () {
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
      this.load.image('enemy', 'assets/enemy.png')
      this.load.image('shotgun', 'assets/Weapons/tile001.png')
      this.load.image('crosshair', 'assets/crosshair008.png');
      this.load.image('fullscreen', 'assets/full-screen.png')
      this.load.image('wall', 'assets/wall.png');
      this.graphics = this.add.graphics()
    }

  create () {

    this.setupScene();
    this.setupAnimations();
    this.setupInputEvents();
    this.setupPlayer()
    this.generateMap();
    this.time.delayedCall(500, this.spawnEnemies, [], this);
    this.score = 0;
    this.intervalID
    this.enemies = []
    this.bullets = []

  }
  generateMap(){
    const mapWidth = 40;
    const mapHeight = 30;
    const tileSize = 32;
    const walls = this.physics.add.staticGroup();

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            if (Phaser.Math.Between(0, 4) === 0) {
                const wall = walls.create(x * tileSize, y * tileSize, 'wall');
                wall.setOrigin(0);
            }
        }
    }
  }

  setupScene() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    this.vaizdasImage = this.add.sprite(centerX, centerY, 'mapas');
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' }).setPosition(100, 100).setScrollFactor(0);

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

  this.input.on('pointerdown', pointer => {
      if (pointer.leftButtonDown()) {
        this.fireBullet(pointer)
      }
  });

  this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  }

  setupPlayer() {
    this.player = this.physics.add.sprite(1920 / 2, 1080 /2, 'WwalkDown2')
    this.player.setScale(4);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, walls);
    this.weapon = this.physics.add.sprite(this.player.x + 70, this.player.y, 'shotgun');
    this.weapon.setScale(4);
  }

  update () {
    this.updatePlayerMovement();
    this.updateCameraPosition();
    this.updateCrosshairPosition();
    this.updateBullet()
    this.detectCollision()
  }

updatePlayerMovement() {
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
      const orbitDistance = 85;
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
  this.crosshair.body.velocity.x = this.player.body.velocity.x;
  this.crosshair.body.velocity.y = this.player.body.velocity.y;
  this.constrainReticle(this.crosshair, 550);
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

updateBullet() {
  //bullets should be deleted that go out of the screen
  for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
    const bullet = this.bullets[bulletIndex]

    if (bullet.x < 0 ||
        bullet.x > this.cameras.main.width ||
        bullet.y  < 0 ||
        bullet.y  > this.cameras.main.height) 
        {
        this.bullets.splice(bulletIndex, 1)
        bullet.destroy()
        }

}
}

detectCollision() {
    // Player and enemy collision
    for (let enemyIndex = this.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
        const enemy = this.enemies[enemyIndex];
        const distance = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
        // Player dies, end game. Change distance for more accurate collision.
        if (distance < 50) {
            clearInterval(this.intervalID);
            this.scene.start('Restart', { score: this.score });
            this.scene.stop();
        }

        // Player bullet and enemy collision
        for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
            const bullet = this.bullets[bulletIndex];
            const distance = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);

            if (distance < 50) {
                this.score += 1;
                this.scoreText.setText('Score: ' + this.score);
                this.enemies.splice(enemyIndex, 1);
                enemy.destroy();
                this.bullets.splice(bulletIndex, 1);
                bullet.destroy();
            }
        }
    }
}



fireBullet(pointer) {
  const direction = Math.atan((this.crosshair.x - this.player.x) / (this.crosshair.y - this.player.y));
        if (!pointer.leftButtonDown()) return;

        // Create a projectile
        const bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet').setScale(4);
        bullet.setRotation(direction);

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
        bullet.velocity = { x, y };

        // Add the projectile to the list
        this.bullets.push(bullet);
}

updateBullet() {
  this.bullets.forEach((bullet, index) => {
      bullet.x += bullet.velocity.x;
      bullet.y += bullet.velocity.y;
      if (bullet.x < 0 || bullet.x > this.cameras.main.width || bullet.y < 0 || bullet.y > this.cameras.main.height) {
          bullet.destroy();
          this.bullets.splice(index, 1);
      }
  });
}

  spawnEnemies() {
    this.intervalID = setInterval(() => {
      const spawnPoints = [
          { x: 0, y: Phaser.Math.Between(0, 1080) },  // Left border
          { x: 1920, y: Phaser.Math.Between(0, 1080) }, // Right border
          { x: Phaser.Math.Between(0, 1920), y: 0 },   // Top border
          { x: Phaser.Math.Between(0, 1920), y: 1080 } // Bottom border
      ];
      const spawnPoint = Phaser.Utils.Array.GetRandom(spawnPoints);
      const enemy = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'enemy');
      enemy.setScale(0.1)
      enemy.setCollideWorldBounds(false)
      const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x)
      enemy.setVelocity(300 * Math.cos(angle), 300 * Math.sin(angle))
      this.enemies.push(enemy)
    }, 1000)
  }

}

export default Singleplayer
