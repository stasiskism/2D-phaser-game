/* global Phaser */

class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'mainMenu'});
      this.vaizdasImage = null
      this.startButton = null
    }

    init (data) {
      this.cameras.main.setBackgroundColor('#ffffff')
    }

    preload () {
      this.load.image('menu', 'assets/menuPhoto.jpg')
      this.load.image('startButton', 'assets/pngegg.png')

    }

    create (data) {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;

      this.vaizdasImage = this.add.sprite(centerX, centerY, 'menu');
      this.startButton = this.add.sprite(1920 / 2, (1080 / 2) + 100, 'startButton');
      this.startButton.setInteractive({ useHandCursor: true })
      this.startButton.on('pointerdown', () => this.clickButton())

    }

    update (time, delta) {

    }

    clickButton() {
      this.scene.start('gameScene')
    }
}

export default MainMenu