class Lobby extends Phaser.Scene {
    createdSprites = {}
    searchBox;
    continueSearching = false;

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
        this.createButton.on('pointerover', () => this.createButton.setTint(0xf1c40f))
        this.createButton.on('pointerout', () => this.createButton.clearTint())
        this.codeButton = this.add.sprite(1920 / 2, (1080 / 2), 'code');
        this.codeButton.setInteractive({ useHandCursor: true })
        this.codeButton.on('pointerdown', () => this.codeRoom())
        this.codeButton.on('pointerover', () => this.codeButton.setTint(0xf1c40f))
        this.codeButton.on('pointerout', () => this.codeButton.clearTint())
        this.searchButton = this.add.sprite(1920 / 2, (1080 / 2) + 170, 'Search');
        this.searchButton.setInteractive({ useHandCursor: true });
        this.searchButton.on('pointerdown', () => this.search());
        this.searchButton.on('pointerover', () => this.searchButton.setTint(0xf1c40f));
        this.searchButton.on('pointerout', () => this.searchButton.clearTint());

        // Create the dialog box
        this.searchBox = this.add.container(1920 / 2, 1080 / 2);
        let searchBoxBG = this.add.graphics();
        searchBoxBG.fillStyle(0x000000, 0.7);
        searchBoxBG.fillRect(-150, -50, 300, 100);
        this.searchBox.add(searchBoxBG);

        let searchText = this.add.text(0, -15, 'Searching...', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });
        this.searchBox.add(searchText);

        let cancelButton = this.add.text(0, 15, 'Cancel', { fontFamily: 'Arial', fontSize: 18, color: '#ffffff', backgroundColor: '#3498db', padding: { x: 10, y: 5 } });
        cancelButton.setInteractive({ useHandCursor: true });
        cancelButton.on('pointerdown', () => this.cancelSearch());
        this.searchBox.add(cancelButton);

        // Initially hide the dialog box
        this.searchBox.setVisible(false);
        this.exitButton = this.add.sprite(1920 / 2, (1080 / 2) + 340, 'exit');
        this.exitButton.setInteractive({ useHandCursor: true })
        this.exitButton.on('pointerdown', () => {
            socket.removeAllListeners()
            this.scene.start('mainMenu')
            this.scene.stop()
        })
        this.exitButton.on('pointerover', () => this.exitButton.setTint(0xf1c40f))
        this.exitButton.on('pointerout', () => this.exitButton.clearTint())
    }

    update() {
    }

    codeRoom(){
        let roomCode;
        do {
            roomCode = window.prompt('Enter the code of the room:');
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
        let isPrivate
        do {
            isPrivate = window.confirm('Do you want this room to be private?');
            maxPlayers = window.prompt('Enter the maximum number of players (2-4):');
            if (maxPlayers === null) {
                break;
            }
        } while (!maxPlayers || isNaN(maxPlayers) || maxPlayers < 2 || maxPlayers > 4);

        if (maxPlayers != null) {
            socket.emit('createRoom', { roomName, maxPlayers, isPrivate });

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

    search() {
        this.searchBox.setVisible(true);
        let continueSearching = true;

        const handleRoomJoined = (roomId) => {
            if (!continueSearching) return;
            this.searchBox.setVisible(false);
            continueSearching = false;
            this.scene.start('room', { roomId });
            this.scene.stop();
            cleanupEventListeners();
        };

        const handleRoomJoinFailed = (errorMessage) => {
            if (!continueSearching) return;
            this.searchBox.setVisible(false);
            alert(errorMessage);
            cleanupEventListeners();
        };

        const continuousSearch = () => {
            if (!this.continueSearching) return;
            socket.emit('searchRoom');
        };

        const cleanupEventListeners = () => {
            socket.off('roomJoined', handleRoomJoined);
            socket.off('roomJoinFailed', handleRoomJoinFailed);
        };

        socket.on('roomJoined', handleRoomJoined);
        socket.on('roomJoinFailed', handleRoomJoinFailed);
        continuousSearch();
        const searchInterval = setInterval(continuousSearch, 5000);
        this.searchBox.on('close', () => {
            clearInterval(searchInterval);
            this.cancelSearch(); // Call cancelSearch when the search box is closed
        });
    }

    cancelSearch() {
        this.searchBox.setVisible(false);
        this.continueSearching = false;
    }

}

export default Lobby
