class Login extends Phaser.Scene {
    constructor() {
        super({ key: 'login'});
    }
    init() {
        //this.cameras.main.setBackgroundColor('#ffffff')
    }
    preload() {

    }
    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.add.sprite(centerX, centerY, 'menu');
        const login = this.add.dom(centerX, centerY).createFromHTML(`
            <form id="login">
                <div>
                    <input type="text" id="uname" placeholder="Username" name="username" class="forminput" required><br>
                </div>
                <div>
                    <input type="password" id="pswd" placeholder="Password" required><br>
                </div>
                <div>
                    <input type="submit" value="Login">
                </div>
            </form>
            <p style="color:white">Not a member? <a href="#" id="register">Sign up now</a></p>
        `);

        const register = login.getChildByID('register');
        register.addEventListener('click', this.loadRegister.bind(this));

    }
        

    
    update() {

    }

    loadRegister() {
        this.scene.start('register')
    }
}

export default Login