/* global Phaser */

class MainMenu extends Phaser.Scene {
  constructor() {
      super({ key: 'mainMenu'});
    this.vaizdasImage = null
    this.startSingleButton = null
    this.startMultiButton = null
  }

  init (data) {
    this.cameras.main.setBackgroundColor('#ffffff')
  }

  preload () {
    this.load.image('menu', 'assets/menuPhoto.jpg')
    this.load.image('startSingleButton', 'assets/pngegg.png')
    this.load.image('startMultiButton', 'assets/pngegg.png')

  }

  create (data) {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.vaizdasImage = this.add.sprite(centerX, centerY, 'menu');
    this.startSingleButton = this.add.sprite(1920 / 2, (1080 / 2) - 200, 'startSingleButton');
    this.startMultiButton = this.add.sprite(1920 / 2, (1080 / 2) + 200, 'startMultiButton')
    this.startSingleButton.setInteractive({ useHandCursor: true })
    this.startSingleButton.on('pointerdown', () => this.clickSingleButton())
    this.startMultiButton.setInteractive({ useHandCursor: true })
    this.startMultiButton.on('pointerdown', () => this.clickMultiButton())

  }

  update (time, delta) {

  }

  clickSingleButton() {
    this.scene.start('Singleplayer')
  }

  clickMultiButton() {
    //this.scene.start('Multiplayer')
    this.scene.start('authenticate')
  }
}

export default MainMenu