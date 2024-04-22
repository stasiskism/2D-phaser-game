class Lobby extends Phaser.Scene {
    constructor() {
        super({ key: 'lobby'});
    }
    init() {

    }
    preload() {
        this.load.image('menu', 'assets/menuPhoto.jpg');
        this.load.image('create', 'assets/create.png')
        this.load.image('join', 'assets/join.png')
    }
    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.add.sprite(centerX, centerY, 'menu');
        this.createButton = this.add.sprite(1920 / 2, (1080 / 2) - 200, 'create');
        this.joinButton = this.add.sprite(1920 / 2, (1080 / 2) + 200, 'join')
        this.joinButton.setInteractive({ useHandCursor: true })
        this.joinButton.on('pointerdown', () => this.joinRoom())
        this.createButton.setInteractive({ useHandCursor: true })
        this.createButton.on('pointerdown', () => this.createRoom())
    }
    
    update() {
    }

    createRoom() {
        const roomName = window.prompt('Enter the name of the room:');
        socket.emit('createRoom', roomName)
        this.scene.start('room')
    }

    joinRoom() {
        const roomName = window.prompt('Enter the name of the room to join:');
        socket.emit('joinRoom', roomName)
    }

}

export default Lobby
