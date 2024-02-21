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

    }

    create (data) {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;

      this.vaizdasImage = this.add.sprite(centerX, centerY, 'mapas');

      this.player = this.physics.add.sprite(1920 / 2, 1080 /2, 'player')

    }

    update (time, delta) {

      const keyLeftObj = this.input.keyboard.addKey('LEFT')

      if (keyLeftObj.isDown === true) {
        this.player.x = this.player.x - 5
      }

      const keyRightObj = this.input.keyboard.addKey('RIGHT')

      if (keyRightObj.isDown === true) {
        this.player.x = this.player.x + 5
      }

      const keyUpObj = this.input.keyboard.addKey('UP')

      if (keyUpObj.isDown === true) {
        this.player.y = this.player.y - 5
      }

      const keyDownObj = this.input.keyboard.addKey('DOWN')

      if (keyDownObj.isDown === true) {
        this.player.y = this.player.y + 5
      }

    }
}

export default GameScene