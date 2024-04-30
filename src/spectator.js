/* global Phaser */

class Spectator extends Phaser.Scene {
    constructor() {
        super({ key: 'spectator'});
    }

    init (data) {
        this.cameras.main.setBackgroundColor('#ffffff')
    }

    preload () {
        this.load.image('quitButton', 'assets/quit.png')
    }

    create () {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      this.quitButton = this.add.sprite(1920 / 2, (1080 / 2) - 400, 'quitButton')
      this.quitButton.setInteractive({useHandCursor: true})
      this.quitButton.on('pointerdown', () => this.clickQuitButton())
    }

    update () {

    }

    // clickQuitButton() {
    //     this.scene.start('mainMenu')
    //     this.scene.stop('spectator')
    //     this.scene.stop()
    // }
}

export default Spectator