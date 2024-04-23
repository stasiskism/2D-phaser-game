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
        this.createButton.setInteractive({ useHandCursor: true })
        this.createButton.on('pointerdown', () => this.createRoom())

        this.setupInputEvents()

    }

    setupInputEvents() {
        socket.on('updateRooms', (rooms) => {
            for (const roomId in rooms) {
                const room = rooms[roomId];
                console.log(room);
                
                const roomSprite = this.add.sprite(1920 / 2, (1080 / 2) + 200, 'join').setInteractive({ useHandCursor: true });
                roomSprite.on('pointerdown', () => this.joinRoom(roomId));
            }
        });
    }
    
    update() {
        
    }

   createRoom() {
    const roomName = window.prompt('Enter the name of the room:');
    socket.emit('createRoom', roomName);

    // Listen for the 'roomCreated' event from the server
    socket.on('roomCreated', (roomId) => {
        // Start the 'room' scene with the specified roomId
        this.scene.start('room', {roomId: roomId });
        this.scene.stop()
    });
}

    joinRoom(roomId) {
        console.log('JOININA')
        //const roomName = window.prompt('Enter the name of the room to join:');
        this.scene.start('room', {roomId: roomId });
        this.scene.stop()
    }

}

export default Lobby
