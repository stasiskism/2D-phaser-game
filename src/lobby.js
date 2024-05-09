class Lobby extends Phaser.Scene {
    constructor() {
        super({ key: 'lobby'});
    }
    createdSprites = {}
    init() {

    }
    preload() {

    }
    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.add.sprite(centerX, centerY, 'menu');
        this.createButton = this.add.sprite(1920 / 2, (1080 / 2) - 200, 'create');
        this.createButton.setInteractive({ useHandCursor: true })
        this.createButton.on('pointerdown', () => this.createRoom())
        this.distance = -100
        this.setupInputEvents()
        this.createdSprites = {}
        this.exitButton = this.add.sprite(100, 60, 'exit').setScale(0.2)
        this.exitButton.setInteractive({ useHandCursor: true })
        this.exitButton.on('pointerdown', () => {
            socket.removeAllListeners()
            this.scene.start('mainMenu')
            this.scene.stop()
        })
    }

    setupInputEvents() {
        socket.on('updateRooms', (rooms) => {
            for (const roomId in rooms) {
                if (this.createdSprites[roomId]) continue   
                const roomName = rooms[roomId].name
                const roomButton = this.add.text(1920 / 2, (1080 / 2) + this.distance, roomName, { fill: '#ffffff', fontSize: '24px', fontStyle: 'bold'}).setInteractive({useHandCursor: true}).setScale(2).setOrigin(0.5)
                this.distance += 40
                this.createdSprites[roomId] = roomButton
                roomButton.on('pointerdown', () => this.joinRoom(roomId));
            }
            for (const id in this.createdSprites) {
                if (!rooms[id]) {
                    this.createdSprites[id].destroy();
                    delete this.createdSprites[id];
                    this.distance -= 40
                }
            }
        });
    }
    
    update() {
    }

    createRoom() {
        let roomName;
        let maxPlayers;
        do {
            roomName = window.prompt('Enter the name of the room:');
            if (roomName === null) {
                break; 
            }
            maxPlayers = window.prompt('Enter the maximum number of players (2-4):');
            if (maxPlayers === null) {
                break; 
            }
        } while (!roomName || !roomName.trim() || !maxPlayers || isNaN(maxPlayers) || maxPlayers < 2 || maxPlayers > 4);
    
        if (roomName != null && maxPlayers != null) {
            socket.emit('createRoom', { roomName, maxPlayers });
    
            socket.once('roomCreated', (roomId, mapSize) => {
                this.scene.start('room', { roomId: roomId, mapSize });
                this.scene.stop();
            });
        }
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
