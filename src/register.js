class Register extends Phaser.Scene {
    constructor() {
        super({ key: 'register' });
    }

    init() {
        this.cameras.main.setBackgroundColor('#ffffff');
    }

    preload() {
        this.load.image('menu', 'assets/menuPhoto.jpg');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.vaizdasImage = this.add.sprite(centerX, centerY, 'menu');

        const register = this.add.dom(centerX, centerY).createFromHTML(`
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
                    <input type="submit" value="Register account">
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
                return;
            }

            //REIKIA PACHEKINT AR NERA TOKIO USERNAME JAU DATABASE
            if (password !== repeatPassword) {
                alert('Passwords do not match');
                return;
            }

            this.sendData(username, password)

        })
    }

    update() {

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
    }

    sendData(username, password) {
        const data = {username, password}
        socket.emit('register', data)
        socket.on('registerResponse', (response) => {
            if (response.success) {
                alert('Registration successful');
                this.scene.start('login');
            } else {
                alert('Registration failed');
            }
        })
        // fetch('/register', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({username, password})
        // })
        // .then(response => {
        //     if (response.ok) {
        //         alert('Registration successful')
        //         this.scene.start('login')
        //     } else {
        //         alert ('Registration failed')
        //     }
        // })
        // .catch(error => {
        //     console.error('Error:', error)
        //     alert('An error has occured')
        // })
    }

}

export default Register;