class Login extends Phaser.Scene {
    constructor() {
        super({ key: 'login'});
    }
    init() {
        //this.cameras.main.setBackgroundColor('#ffffff')
    }
    preload() {
        this.load.image('WwalkUp1', 'assets/8-dir-chars/WwalkUp1.png')
        this.load.image('WwalkUp2', 'assets/8-dir-chars/WwalkUp2.png')
        this.load.image('WwalkUp3', 'assets/8-dir-chars/WwalkUp3.png')
        this.load.image('WwalkRight1', 'assets/8-dir-chars/WwalkRight1.png')
        this.load.image('WwalkRight2', 'assets/8-dir-chars/WwalkRight2.png')
        this.load.image('WwalkRight3', 'assets/8-dir-chars/WwalkRight3.png')
        this.load.image('WwalkUpRight1', 'assets/8-dir-chars/WwalkUpRight1.png')
        this.load.image('WwalkUpRight2', 'assets/8-dir-chars/WwalkUpRight2.png')
        this.load.image('WwalkUpRight3', 'assets/8-dir-chars/WwalkUpRight3.png')
        this.load.image('WwalkDownRight1', 'assets/8-dir-chars/WwalkDownRight1.png')
        this.load.image('WwalkDownRight2', 'assets/8-dir-chars/WwalkDownRight2.png')
        this.load.image('WwalkDownRight3', 'assets/8-dir-chars/WwalkDownRight3.png')
        this.load.image('WwalkDown1', 'assets/8-dir-chars/WwalkDown1.png')
        this.load.image('WwalkDown2', 'assets/8-dir-chars/WwalkDown2.png')
        this.load.image('WwalkDown3', 'assets/8-dir-chars/WwalkDown3.png')
        this.load.image('WwalkDownLeft1', 'assets/8-dir-chars/WwalkDownLeft1.png')
        this.load.image('WwalkDownLeft2', 'assets/8-dir-chars/WwalkDownLeft2.png')
        this.load.image('WwalkDownLeft3', 'assets/8-dir-chars/WwalkDownLeft3.png')
        this.load.image('WwalkLeft1', 'assets/8-dir-chars/WwalkLeft1.png')
        this.load.image('WwalkLeft2', 'assets/8-dir-chars/WwalkLeft2.png')
        this.load.image('WwalkLeft3', 'assets/8-dir-chars/WwalkLeft3.png')
        this.load.image('WwalkUpLeft1', 'assets/8-dir-chars/WwalkUpLeft1.png')
        this.load.image('WwalkUpLeft2', 'assets/8-dir-chars/WwalkUpLeft2.png')
        this.load.image('WwalkUpLeft3', 'assets/8-dir-chars/WwalkUpLeft3.png')
        this.load.image('mapas', 'assets/mapas.png')
        this.load.image('player', 'assets/player_23.png')
        this.load.image('bullet', 'assets/Bullets/bullet.png')
        this.load.image('crosshair', 'assets/crosshair008.png')
        this.load.image('shotgun', 'assets/Weapons/tile001.png')
        this.load.image('enemy', 'assets/enemy.png')
        this.load.image('fullscreen', 'assets/full-screen.png')
        this.load.image('multiplayer', 'assets/multiplayer.png');
        this.load.image('singleplayer', 'assets/singleplayer.png');
        this.load.image('marketplace', 'assets/marketplace.png');
        this.load.image("tiles", 'assets/assetas.png')
        this.load.tilemapTiledJSON('map', 'assets/maps.json');
        this.load.image('wasd', 'assets/wasd.png')
        this.load.image('tutorial', 'assets/tutorials.png')
    }
    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.add.sprite(centerX, centerY, 'background');
        const login = this.add.dom(centerX, centerY).createFromHTML(`
        <style>
    #login {
        background-color: rgba(255, 255, 255, 0.5);
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);
        text-align: center;
    }
    #login input[type="text"],
    #login input[type="password"] {
        width: 80%;
        padding: 10px;
        margin: 10px auto;
        border-radius: 5px;
        border: 1px solid #ccc;
        display: block;
    }
</style>

<form id="login">
    <div>
        <input type="text" id="uname" placeholder="Username" name="username" class="forminput" required>
    </div>
    <div>
        <input type="password" id="pswd" placeholder="Password" required>
    </div>
    <div>
        <input type="submit" value="Login" style="width: 80%; padding: 10px; border-radius: 5px; border: none; color: white; background-color: #5C6BC0;">
    </div>
</form>
<p style="color:white">Not a member? <a href="#" id="register">Sign up now</a></p>
        `);

        const register = login.getChildByID('register');
        register.addEventListener('click', this.loadRegister.bind(this));

        const loginForm = login.getChildByID('login')
        //REIKIA PACHEKINT AR YRA TOKS USERNAME SU PASSWORDU DATABASE. JEI TAIP - PALEIDZIA I MULTIPLAYERI.
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault()

            const username = document.getElementById('uname').value
            const password = document.getElementById('pswd').value

            if (username.trim() === '' || password.trim() === '') {
                alert('Please enter username and password')
                return;
            }

            this.sendData(username, password)

        })

    }
        

    
    update() {

    }

    loadRegister() {
        this.scene.start('register')
        this.scene.stop()
    }

    sendData(username, password) {
        const data = {username, password}
        socket.emit('login', data)
        socket.on('loginResponse', (response) => {
            if (response.success) {
                console.log(response.success)
                if (response.firstLogin) {
                    alert('Login successful');
                    this.scene.start('tutorial')
                    this.scene.stop()
                } else {
                    alert('Login successful');
                    this.scene.start('mainMenu');
                    this.scene.stop()
                }
            } else {
                alert('Login failed');
            }
        });
    }

}

export default Login
