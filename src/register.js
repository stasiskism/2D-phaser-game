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
        this.centerX = this.cameras.main.width / 2;
        this.centerY = this.cameras.main.height / 2;
        this.vaizdasImage = this.add.sprite(this.centerX, this.centerY, 'background');

        this.register = this.add.dom(this.centerX, this.centerY).createFromHTML(`
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
                    <input type="text" id="email" placeholder="Email" name="email" class="forminput" required><br>
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

        const password = this.register.getChildByID('pswd');
        const confirmPassword = this.register.getChildByID('repeatpswd');
        const login = this.register.getChildByID('login');

        password.addEventListener('change', () => this.checkPassword(password, confirmPassword));
        confirmPassword.addEventListener('keyup', () => this.checkPassword(password, confirmPassword));
        login.addEventListener('click', this.loadLogin.bind(this));

        const registerForm = this.register.getChildByID('register');
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const emailPattern = /\S+@\S+\.\S+/
            const username = document.getElementById('uname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('pswd').value;
            const repeatPassword = document.getElementById('repeatpswd').value;

            if (username.trim() === '' || email.trim() === '' || password.trim() === '') {
                alert('Please enter username, email, and password');
                this.removeInputs();
                return;
            }

            if (username.length > 20 || password.length > 20) {
                alert('Password and username cannot exceed 20 characters');
                this.removeInputs();
                return;
            }

            if (!emailPattern.test(email)) {
                alert('Please enter a valid email address');
                this.removeInputs();
                return;
            }

            if (password !== repeatPassword) {
                alert('Passwords do not match');
                this.removeInputs();
                return;
            }
            this.register.setVisible(false)
            this.sendVerificationEmail(username, email, password);
        });
    }

    update() {

    }

    removeInputs() {
        document.getElementById('uname').value = '';
        document.getElementById('email').value = '';
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
        this.scene.start('login');
        this.scene.stop();
    }

    sendVerificationEmail(username, email, password) {
        socket.emit('sendVerificationEmail', email, username)
        const verificationForm = this.add.dom(this.centerX, this.centerY).createFromHTML(`
            <style>
                #verification {
                    background-color: rgba(255, 255, 255, 0.5);
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);
                    text-align: center;
                }
                #verification input[type="text"] {
                    width: 80%;
                    padding: 10px;
                    margin: 10px auto;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                    display: block;
                }
            </style>

            <form id="verification">
                <div>
                    <input type="text" id="verificationCode" placeholder="Verification Code" required><br>
                </div>
                <div>
                    <input type="submit" value="Submit Verification Code" style="width: 80%; padding: 10px; border-radius: 5px; border: none; color: white; background-color: #5C6BC0;">
                </div>
            </form>
        `);
        const verify = verificationForm.getChildByID('verification')
        verify.addEventListener('submit', (event) => {
            event.preventDefault()
            const code = document.getElementById('verificationCode').value
            if (code.trim() === '') {
                alert('Please enter code')
                document.getElementById('verificationCode').value = ''
            }
            verificationForm.setVisible(false)
            this.sendData(username, email, password, code)
        })
    }

    sendData(username, email, password, code) {
        const data = { username, email, password, code };
        console.log(data)
        socket.emit('register', data);
        socket.once('registerResponse', (response) => {
            if (response.success) {
                alert('Registration successful');
                this.scene.start('login');
                this.scene.stop();
            } else {
                alert('Registration failed: ' + response.error);
                this.removeInputs()
                this.register.setVisible(true)
            }
        });
    }

}

export default Register;
