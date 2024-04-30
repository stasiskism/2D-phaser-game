/* global Phaser */

class Respawn extends Phaser.Scene {
    constructor() {
        super({ key: 'respawn'});
    }

    init (data) {
        this.cameras.main.setBackgroundColor('#ffffff')
    }

    preload () {
        this.load.image('dead', 'assets/dead.jpg')
        this.load.image('respawnButton', 'assets/pngegg.png')
        this.load.image('quitButton', 'assets/quit.png')
    }

    create () {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      this.add.sprite(centerX, centerY, 'dead');
      this.respawnButton = this.add.sprite(1920 / 2, (1080 / 2) + 400, 'respawnButton')
      this.respawnButton.setInteractive({ useHandCursor: true })
      this.respawnButton.on('pointerdown', () => this.clickRespawnButton())
      this.quitButton = this.add.sprite(1920 / 2, (1080 / 2) - 400, 'quitButton')
      this.quitButton.setInteractive({useHandCursor: true})
      this.quitButton.on('pointerdown', () => this.clickQuitButton())
    }

    update () {

    }
    clickRespawnButton() {
        //this.scene.restart('Multiplayer')
        this.scene.start('spectator')
        this.scene.stop()
    }

    clickQuitButton() {
        this.scene.start('mainMenu')
        this.scene.stop('multiplayer')
        this.scene.stop()
    }
}

export default Respawn