class Register extends Phaser.Scene {
    constructor() {
        super({ key: 'register' });
    }

    init() {
        this.cameras.main.setBackgroundColor('#ffffff');
    }

    preload() {

    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.vaizdasImage = this.add.sprite(centerX, centerY, 'background');

        const register = this.add.dom(centerX, centerY).createFromHTML(`
            <style>
                #register {
                    background-color: rgba(255, 255, 255, 0.5);
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);
                    text-align: center;
                }
                #register input[type="text"],
                #register input[type="password"] {
                    width: 80%;
                    padding: 10px;
                    margin: 10px auto;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                    display: block;
                }
            </style>

            <form id="register">
                <div>
                    <input type="text" id="uname" placeholder="Username" name="username" class="forminput" required><br>
                </div>
                <div>
                    <input type="password" id="pswd" placeholder="Password" required><br>
                </div>
                <div>
                    <input type="password" id="repeatpswd" placeholder="Confirm Password" required><br>
                </div>
                <div>
                <input type="submit" value="Register account" style="width: 80%; padding: 10px; border-radius: 5px; border: none; color: white; background-color: #5C6BC0;">
                </div>
            </form>
            <p style="color:white">Already have an account? <a href="#" id="login">Sign in</a></p>
        `);

        const password = register.getChildByID('pswd');
        const confirmPassword = register.getChildByID('repeatpswd');
        const login = register.getChildByID('login')

        password.addEventListener('change', () => this.checkPassword(password, confirmPassword));
        confirmPassword.addEventListener('keyup', () => this.checkPassword(password, confirmPassword));
        login.addEventListener('click', this.loadLogin.bind(this));

        const registerForm = register.getChildByID('register')
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault()

            const username = document.getElementById('uname').value
            const password = document.getElementById('pswd').value
            const repeatPassword = document.getElementById('repeatpswd').value

            if (username.trim() === '' || password.trim() === '') {
                alert('Please enter username and password')
                this.removeInputs()
                return;
            }

            if (username.length > 20 || password.length > 20) {
                alert('Password and username cannot exceed 20 characters')
                this.removeInputs()
                return;
            }

            this.sendData(username, password)

        })
    }

    update() {

    }

    removeInputs() {
        document.getElementById('uname').value = '';
        document.getElementById('pswd').value = '';
        document.getElementById('repeatpswd').value = '';
    }

    checkPassword(password, confirmPassword) {
        if (password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity("Passwords Don't Match");
        } else {
            confirmPassword.setCustomValidity('');
        }
    }

    loadLogin() {
        this.scene.start('login')
        this.scene.stop()
    }

    sendData(username, password) {
        const data = {username, password}
        socket.emit('register', data)
        socket.once('registerResponse', (response) => {
            if (response.success) {
                alert('Registration successful');
                this.scene.start('login');
                this.scene.stop()
            } else {
                alert('Registration failed: ' + response.error);
            }
        })
    }

}

export default Register;