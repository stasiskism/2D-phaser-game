/* global Phaser */

class Restart extends Phaser.Scene {
    constructor() {
        super({ key: 'Restart'});
    }

    init (data) {
        this.cameras.main.setBackgroundColor('#ffffff')
        this.score = data.score
    }

    preload () {
        this.load.image('dead', 'assets/dead.jpg')
        this.load.image('restartButton', 'assets/pngegg.png')
    }

    create () {
      console.log(this.score)
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      this.restart = this.add.sprite(centerX, centerY, 'dead');
      this.restartButton = this.add.sprite(1920 / 2, (1080 / 2) + 400, 'restartButton')
    //   this.scoreText = this.add.text(16, 16, 'Score: ' + this.score, { fontSize: '32px', fill: '#ffffff' });
      this.restartButton.setInteractive({ useHandCursor: true })
      this.restartButton.on('pointerdown', () => this.clickRestartButton())
    }

    update () {

    }
    clickRestartButton() {
        this.scene.restart('Singleplayer')
        this.scene.start('Singleplayer')
        this.scene.stop()
    }
}

export default Restart