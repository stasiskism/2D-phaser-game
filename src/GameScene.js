/* global Phaser */

class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'gameScene'});
    }

    init (data) {
        this.cameras.main.setBackgroundColor('#ffffff')
    }

    preload () {
        console.log('scene1 scene')
        this.load.image('mapas', 'assets/mapas.png')
        this.load.image('player', 'assets/player_23.png')
        this.load.image('bullet', 'assets/bullet.jpg')
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
      let bullets = []
      if (this.input.activePointer.isDown) {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.x, this.input.activePointer.y)
        const velocity = new Phaser.Math.Vector2(300 * Math.cos(angle), 300 * Math.sin(angle))
        this.bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet')
        this.bullet.setScale(0.1)
        this.bullet.setVelocity(velocity.x, velocity.y)
        bullets.push(this.bullet)
    }
      //bullets should be deleted that go out of the screen
      for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
          const bullet = bullets[bulletIndex]

          if (bullet.x < 0 ||
              bullet.x > this.cameras.main.width ||
              bullet.y  < 0 ||
              bullet.y  > this.cameras.main.height) {
              bullets.splice(bulletIndex, 1) 
          }
      }

}
}
  

export default GameScene