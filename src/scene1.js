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
        this.load.image('background', 'assets/ginklas.png')
        this.load.image('login', 'assets/login.PNG')
        this.load.image('register', 'assets/register.PNG')
    }

    create (data) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.vaizdasImage = this.add.sprite(centerX, centerY, 'vaizdas');

    }

    update (time, delta) {
        if (time > 1000){
            this.scene.stop()
            this.scene.start('authenticate')
        }
    }
}

export default Scene1
