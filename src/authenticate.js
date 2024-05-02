class Authenticate extends Phaser.Scene {
    constructor() {
        super({ key: 'authenticate'});
    }
    init() {
        this.cameras.main.setBackgroundColor('#ffffff')
    }
    preload() {
        this.load.image('background', 'assets/ginklas.png')
        this.load.image('login', 'assets/login.PNG')
        this.load.image('register', 'assets/register.PNG')

    }
    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.vaizdasImage = this.add.sprite(centerX, centerY, 'background');
        this.loginButton = this.add.sprite(1920 / 2, (1080 / 2) - 200, 'login');
        this.registerButton = this.add.sprite(1920 / 2, (1080 / 2) + 200, 'register')
        this.loginButton.setInteractive({ useHandCursor: true })
        this.loginButton.on('pointerdown', () => this.login())
        this.registerButton.setInteractive({ useHandCursor: true })
        this.registerButton.on('pointerdown', () => this.register())

    }
    update() {

    }

    login() {
        this.scene.start('login')
        this.scene.stop()
    }

    register() {
        this.scene.start('register')
        this.scene.stop()
    }
}
export default Authenticate
