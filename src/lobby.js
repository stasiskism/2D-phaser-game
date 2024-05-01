class Lobby extends Phaser.Scene {
    constructor() {
        super({ key: 'lobby'});
    }
    createdSprites = {}
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
        this.distance = 0
        this.setupInputEvents()
        this.createdSprites = {}
    }

    setupInputEvents() {
        socket.on('updateRooms', (rooms) => {
            for (const roomId in rooms) {
                if (this.createdSprites[roomId]) continue        
                const roomSprite = this.add.sprite(1920 / 2, (1080 / 2) + this.distance, 'join').setInteractive({ useHandCursor: true });
                this.distance += 200
                this.createdSprites[roomId] = roomSprite
                roomSprite.on('pointerdown', () => this.joinRoom(roomId));
            }
            for (const id in this.createdSprites) {
                if (!rooms[id]) {
                    this.createdSprites[id].destroy();
                    delete this.createdSprites[id];
                }
            }
        });
    }
    
    update() {
        
    }

   createRoom() {
    const roomName = window.prompt('Enter the name of the room:');
    //REIKIA PADARYTI KAD KUREJAS GALETU PASIRINKTI MAX PLAYER SKAICIU
    socket.emit('createRoom', roomName);

    socket.once('roomCreated', (roomId) => {
        this.scene.start('room', {roomId: roomId });
        this.scene.stop()
    });
}

    joinRoom(roomId) {
        socket.off('roomJoined');
        socket.off('roomJoinFailed');
        
        socket.emit('checkRoom', roomId)

        socket.on('roomJoined', roomId => {
            this.scene.start('room', {roomId: roomId });
            this.scene.stop()
        })
        socket.on('roomJoinFailed', errorMessage => {
            alert(errorMessage)
        })
    }

}

export default Lobby
