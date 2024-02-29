/* global Phaser */

class Scene1 extends Phaser.Scene {
    constructor() {
        super({ key: 'scene1'});
    }

    init (data) {
        this.cameras.main.setBackgroundColor('#ffffff')
    }

    preload () {
        this.load.image('vaizdas', 'assets/INTRO.png')
    }

    create (data) {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;

      this.vaizdasImage = this.add.sprite(centerX, centerY, 'vaizdas');

    }

    update (time, delta) {
        if (time > 5000){
        this.scene.switch('mainMenu')
        }
    }
}

export default Scene1