/* global Phaser */

class Singleplayer extends Phaser.Scene {

  constructor() {
      super({ key: 'Singleplayer'});
  }

  init (data) {
      this.cameras.main.setBackgroundColor('#ffffff')
  }

  preload () {
      console.log('scene1 scene')
      this.load.image('mapas', 'assets/mapas.png')
      this.load.image('player', 'assets/player_23.png')
      this.load.image('bullet', 'assets/bullet.jpg')
      this.load.image('enemy', 'assets/enemy.png')
    }

  create () {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.vaizdasImage = this.add.sprite(centerX, centerY, 'mapas');

    //player movement
    this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.player = this.physics.add.sprite(1920 / 2, 1080 /2, 'player')
    this.player.setCollideWorldBounds(true);
    this.intervalID
    this.bullets = []
    this.enemies = []
    this.time.delayedCall(500, this.spawnEnemies, [], this);
  }

  update () {
    //player movement
    let keyInputs = this.input.keyboard.createCursorKeys();
    if (
      keyInputs.left.isDown ||
      this.a.isDown ||
      keyInputs.right.isDown ||
      this.d.isDown
    )
      this.player.setVelocityX(keyInputs.left.isDown || this.a.isDown ? -300 : 300);
    else this.player.setVelocityX(0);
    if (
      keyInputs.up.isDown ||
      this.w.isDown ||
      keyInputs.down.isDown ||
      this.s.isDown
    )
      this.player.setVelocityY(keyInputs.up.isDown || this.w.isDown ? -300 : 300);
    else this.player.setVelocityY(0);

    //player shooting
    if (this.input.activePointer.isDown) {
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.x, this.input.activePointer.y)
      const velocity = new Phaser.Math.Vector2(300 * Math.cos(angle), 300 * Math.sin(angle))
      this.bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet')
      this.bullet.setScale(0.1)
      this.bullet.setVelocity(velocity.x, velocity.y)
      this.bullets.push(this.bullet)
  }
    //bullets should be deleted that go out of the screen
    for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
        const bullet = this.bullets[bulletIndex]

        if (bullet.x < 0 ||
            bullet.x > this.cameras.main.width ||
            bullet.y  < 0 ||
            bullet.y  > this.cameras.main.height) {
            this.bullets.splice(bulletIndex, 1) }

    }


    //Player and enemy collision
    for (let enemyIndex = this.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
      const enemy = this.enemies[enemyIndex]
      const distance = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y)
      console.log(distance)
      //player dies end game
      if (distance < 50) {
          clearInterval(this.intervalID)
          this.scene.start('Restart')
          }
    }
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