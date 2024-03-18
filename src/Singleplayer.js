/* global Phaser */

class Singleplayer extends Phaser.Scene {

  constructor() {
      super({ key: 'Singleplayer'});
      this.score = 0
      this.scoreText
  }

  init (data) {
      this.cameras.main.setBackgroundColor('#ffffff')
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
      this.load.image('bullet', 'assets/bullet.jpg')
      this.load.image('enemy', 'assets/enemy.png')
    }

  create () {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.vaizdasImage = this.add.sprite(centerX, centerY, 'mapas');
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

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



    //player movement
    this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.player = this.physics.add.sprite(1920 / 2, 1080 /2, 'WwalkDown2')
    this.player.setScale(2);
    this.player.setCollideWorldBounds(true);

    this.interval
    this.intervalID
    this.bullets = []
    this.enemies = []
    //for everything else to load we need to delay the spawning of enemies
    this.time.delayedCall(500, this.spawnEnemies, [], this);
    this.input.on('pointerdown', this.fireBullet, this);
  }

  update () {
    //player movement
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


    //Player and enemy collision
    for (let enemyIndex = this.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
      const enemy = this.enemies[enemyIndex]
      const distance = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y)
      //player dies end game change distance for more accurate collision
      if (distance < 50) {
          clearInterval(this.intervalID)
          this.scene.start('Restart', {score: this.score})
          }
    

    //player bullet and enemy collision
    for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
      const bullet = this.bullets[bulletIndex]
      const distance = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y)
      
      if (distance < 50) {    
      this.score += 1
      this.scoreText.setText('Score: ' + this.score);
      this.enemies.splice(enemyIndex, 1);
      enemy.destroy()
      this.bullets.splice(bulletIndex, 1);
      bullet.destroy()
     }
  }
}
}

fireBullet() {
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.x, this.input.activePointer.y)
    const velocity = new Phaser.Math.Vector2(300 * Math.cos(angle), 300 * Math.sin(angle))
    this.bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet')
    this.bullet.setScale(0.1)
    this.bullet.setVelocity(velocity.x, velocity.y)
    this.bullets.push(this.bullet)
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
