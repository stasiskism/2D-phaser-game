class Login extends Phaser.Scene {
    constructor() {
        super({ key: 'login'});
    }
    init() {
    }
    preload() {

    }
    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.add.sprite(centerX, centerY, 'menu');
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
    }

    sendData(username, password) {
        const data = {username, password}
        socket.emit('login', data)
        socket.on('loginResponse', (response) => {
            if (response.success) {
                alert('Login successful');
                this.scene.start('Multiplayer');
            } else {
                alert('Login failed');
            }
        });

}

export default Login;
