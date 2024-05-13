class Lobby extends Phaser.Scene {
    createdSprites = {}

    constructor() {
        super({ key: 'lobby'});
    }

    init() {

    }
    preload() {

    }
    
    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.add.sprite(centerX, centerY, 'background');
        this.createButton = this.add.sprite(1920 / 2, (1080 / 2) - 170, 'create');
        this.createButton.setInteractive({ useHandCursor: true })
        this.createButton.on('pointerdown', () => this.createRoom())
        this.createButton.on('pointerover', () => this.createButton.setTint(0xf1c40f)) // Change color on mouse over
        this.createButton.on('pointerout', () => this.createButton.clearTint()) // Reset color when mouse leaves
        this.codeButton = this.add.sprite(1920 / 2, (1080 / 2), 'code');
        this.codeButton.setInteractive({ useHandCursor: true })
        this.codeButton.on('pointerdown', () => this.codeRoom())
        this.codeButton.on('pointerover', () => this.codeButton.setTint(0xf1c40f)) // Change color on mouse over
        this.codeButton.on('pointerout', () => this.codeButton.clearTint()) // Reset color when mouse leaves
        this.distance = -100
        this.setupInputEvents()
        this.createdSprites = {}
        this.exitButton = this.add.sprite(1920 / 2, (1080 / 2) + 170, 'exit');
        this.exitButton.setInteractive({ useHandCursor: true })
        this.exitButton.on('pointerdown', () => {
            socket.removeAllListeners()
            this.scene.start('mainMenu')
            this.scene.stop()
        })
        this.exitButton.on('pointerover', () => this.exitButton.setTint(0xf1c40f)) // Change color on mouse over
        this.exitButton.on('pointerout', () => this.exitButton.clearTint()) // Reset color when mouse leaves
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

    codeRoom(){
        let roomCode;
        do {
            roomCode = window.prompt('Enter the name of the room:');
            if (roomCode === null) {
                break;
            }

        } while (!roomCode || !roomCode.trim());
        if (roomCode != null){
            this.joinRoom(roomCode);
        }
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
