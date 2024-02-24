/* global Phaser */

class Restart extends Phaser.Scene {
    constructor() {
        super({ key: 'Restart'});
    }

    init (data) {
        this.cameras.main.setBackgroundColor('#ffffff')
    }

    preload () {
        this.load.image('dead', 'assets/dead.jpg')
        this.load.image('restartButton', 'assets/pngegg.png')
    }

    create (data) {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      this.restart = this.add.sprite(centerX, centerY, 'dead');
      this.restartButton = this.add.sprite(1920 / 2, (1080 / 2) + 400, 'restartButton')
      this.restartButton.setInteractive({ useHandCursor: true })
      this.restartButton.on('pointerdown', () => this.clickRestartButton())
    }

    update (time, delta) {

    }
    clickRestartButton() {
        this.scene.restart('Singleplayer')
        this.scene.start('Singleplayer')
        this.scene.stop()
    }
}

export default Restart