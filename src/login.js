class Login extends Phaser.Scene {
    constructor() {
        super({ key: 'login'});
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

        const text = this.add.text(300, 10, 'Username', {color: 'white', fontSize: '20px'})
        

    }
    update() {

    }
}
export default Login