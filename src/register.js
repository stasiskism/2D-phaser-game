class Register extends Phaser.Scene {
    constructor() {
        super({ key: 'register'});
    }
    init() {
        this.cameras.main.setBackgroundColor('#ffffff')
    }
    preload() {
        this.load.image('menu', 'assets/menuPhoto.jpg')

    }
    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.vaizdasImage = this.add.sprite(centerX, centerY, 'menu');

    }
    update() {

    }
}
export default Register