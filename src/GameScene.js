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

    }

    create (data) {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;

      this.vaizdasImage = this.add.sprite(centerX, centerY, 'mapas');

    }

    update (time, delta) {

    }
}

export default GameScene