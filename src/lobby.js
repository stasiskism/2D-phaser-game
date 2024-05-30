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
        this.settingsButton = new SettingsButtonWithPanel(this, 1890, 90);
        this.input.mouse.releasePointerLock();
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.add.sprite(centerX, centerY, 'background');
    
        this.createButton = this.add.sprite(1920 / 2, (1080 / 2) - 170, 'create');
        this.createButton.setInteractive({ useHandCursor: true });
        this.createButton.on('pointerdown', () => this.createRoom());
        this.createButton.on('pointerover', () => this.createButton.setTint(0xf1c40f));
        this.createButton.on('pointerout', () => this.createButton.clearTint());
    
        this.codeButton = this.add.sprite(1920 / 2, (1080 / 2), 'code');
        this.codeButton.setInteractive({ useHandCursor: true });
        this.codeButton.on('pointerdown', () => this.codeRoom());
        this.codeButton.on('pointerover', () => this.codeButton.setTint(0xf1c40f));
        this.codeButton.on('pointerout', () => this.codeButton.clearTint());
    
        this.searchButton = this.add.sprite(1920 / 2, (1080 / 2) + 170, 'Search');
        this.searchButton.setInteractive({ useHandCursor: true });
        this.searchButton.on('pointerdown', () => this.search());
        this.searchButton.on('pointerover', () => this.searchButton.setTint(0xf1c40f));
        this.searchButton.on('pointerout', () => this.searchButton.clearTint());
    
        this.exitButton = this.add.sprite(1920 / 2, (1080 / 2) + 340, 'exit');
        this.exitButton.setInteractive({ useHandCursor: true });
        this.exitButton.on('pointerdown', () => {
            socket.removeAllListeners();
            this.scene.start('mainMenu');
            this.scene.stop();
        });
        this.exitButton.on('pointerover', () => this.exitButton.setTint(0xf1c40f));
        this.exitButton.on('pointerout', () => this.exitButton.clearTint());
    
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
    
        this.searchBox.setVisible(false);
    }

    update() {
    }

    codeRoom() {
        let roomCode;
    
        const overlay = document.getElementById('overlay');
        const codeRoomContainer = document.getElementById('code-room-container');
        const roomCodeInput = document.getElementById('roomCodeInput');
        const roomCodeButton = document.getElementById('roomCodeButton');
        const roomCodeCancelButton = document.getElementById('roomCodeCancelButton');
    
        const handleRoomCodeSubmit = () => {
            roomCode = roomCodeInput.value;
            if (!roomCode || !roomCode.trim()) {
                alert('Please enter a valid room code.');
                return;
            }
            this.joinRoom(roomCode);
            overlay.style.display = 'none';
            codeRoomContainer.style.display = 'none';
            this.enableButtons();
            cleanupEventListeners();
            roomCodeInput.value = '';
        };
    
        const handleCancel = () => {
            overlay.style.display = 'none';
            codeRoomContainer.style.display = 'none';
            this.enableButtons();
            cleanupEventListeners();
            roomCodeInput.value = '';
        };

        const handleEnterKey = (event) => {
            if (event.key === 'Enter') {
                handleRoomCodeSubmit();
            }
        };
    
        const cleanupEventListeners = () => {
            roomCodeButton.removeEventListener('click', handleRoomCodeSubmit);
            roomCodeCancelButton.removeEventListener('click', handleCancel);
            roomCodeInput.removeEventListener('keyup', handleEnterKey);
        };
    
        overlay.style.display = 'block';
        codeRoomContainer.style.display = 'block';
        this.disableButtons();
        this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.W);
        this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.A);
        this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.S);
        this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.D);
    
        roomCodeButton.addEventListener('click', handleRoomCodeSubmit);
        roomCodeInput.addEventListener('keyup', handleEnterKey);
        roomCodeCancelButton.addEventListener('click', handleCancel);
    }
    

    createRoom() {
        let roomName;
        let maxPlayers;
        let isPrivate;
    
        const overlay = document.getElementById('overlay');
        const createRoomContainer = document.getElementById('create-room-container');
        const privateRoomPrompt = document.getElementById('private-room-prompt');
        const maxPlayersPrompt = document.getElementById('max-players-prompt');
        const privateYesButton = document.getElementById('privateYesButton');
        const privateNoButton = document.getElementById('privateNoButton');
        const maxPlayersInput = document.getElementById('maxPlayersInput');
        const maxPlayersButton = document.getElementById('maxPlayersButton');
        const privateCancelButton = document.getElementById('privateCancelButton');
        const maxPlayersCancelButton = document.getElementById('maxPlayersCancelButton');
    
        const handlePrivateYesClick = () => {
            isPrivate = true;
            showMaxPlayersPrompt();
        };
    
        const handlePrivateNoClick = () => {
            isPrivate = false;
            showMaxPlayersPrompt();
        };
    
        const handleMaxPlayersSubmit = () => {
            maxPlayers = maxPlayersInput.value;
            if (!maxPlayers || isNaN(maxPlayers) || maxPlayers < 2 || maxPlayers > 4) {
                alert('Please enter a valid number of players (2-4).');
                return;
            }
            socket.emit('createRoom', { roomName, maxPlayers, isPrivate });
            socket.once('roomCreated', (roomId, mapSize) => {
                this.scene.start('room', { roomId: roomId, mapSize });
                this.scene.stop();
            });
            overlay.style.display = 'none';
            createRoomContainer.style.display = 'none';
            this.enableButtons();
            cleanupEventListeners();
            maxPlayersInput.value = '';
        };

        const handleEnterKey = (event) => {
            if (event.key === 'Enter') {
                handleMaxPlayersSubmit();
            }
        };
    
        const showMaxPlayersPrompt = () => {
            privateRoomPrompt.style.display = 'none';
            maxPlayersPrompt.style.display = 'block';
            maxPlayersInput.focus()
        };
    
        const cleanupEventListeners = () => {
            privateYesButton.removeEventListener('click', handlePrivateYesClick);
            privateNoButton.removeEventListener('click', handlePrivateNoClick);
            maxPlayersButton.removeEventListener('click', handleMaxPlayersSubmit);
            privateCancelButton.removeEventListener('click', handleCancel);
            maxPlayersCancelButton.removeEventListener('click', handleCancel);
            maxPlayersInput.removeEventListener('keyup', handleEnterKey);
        };
    
        const handleCancel = () => {
            overlay.style.display = 'none';
            createRoomContainer.style.display = 'none';
            this.enableButtons();
            cleanupEventListeners();
            maxPlayersInput.value = '';
        };
    
    
        overlay.style.display = 'block';
        createRoomContainer.style.display = 'block';
        privateRoomPrompt.style.display = 'block';
        maxPlayersPrompt.style.display = 'none';
        this.disableButtons();
    
        privateYesButton.addEventListener('click', handlePrivateYesClick);
        privateNoButton.addEventListener('click', handlePrivateNoClick);
        maxPlayersButton.addEventListener('click', handleMaxPlayersSubmit);
        privateCancelButton.addEventListener('click', handleCancel);
        maxPlayersCancelButton.addEventListener('click', handleCancel);
        maxPlayersInput.addEventListener('keyup', handleEnterKey);
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
        const overlay = document.getElementById('overlay');
        const searchRoomContainer = document.getElementById('search-room-container');
        const searchCancelButton = document.getElementById('searchCancelButton');
    
        this.searchBox.setVisible(true);
        this.continueSearching = true;
    
        const handleRoomJoined = (roomId) => {
            if (!this.continueSearching) return;
            this.searchBox.setVisible(false);
            this.continueSearching = false;
            this.scene.start('room', { roomId });
            this.scene.stop();
            cleanupEventListeners();
            hideSearchPrompt();
        };
    
        const handleRoomJoinFailed = (errorMessage) => {
            if (!this.continueSearching) return;
            this.searchBox.setVisible(false);
            alert(errorMessage);
            cleanupEventListeners();
            hideSearchPrompt();
        };
    
        const continuousSearch = () => {
            if (!this.continueSearching) return;
            socket.emit('searchRoom');
        };
    
        const cleanupEventListeners = () => {
            socket.off('roomJoined', handleRoomJoined);
            socket.off('roomJoinFailed', handleRoomJoinFailed);
            clearInterval(searchInterval);
            this.cancelSearch();
        };
    
        const handleCancel = () => {
            this.continueSearching = false;
            cleanupEventListeners();
            hideSearchPrompt();
        };
    
        const hideSearchPrompt = () => {
            overlay.style.display = 'none';
            searchRoomContainer.style.display = 'none';
            this.enableButtons();
        };
    
        overlay.style.display = 'block';
        searchRoomContainer.style.display = 'block';
        this.disableButtons();
    
        searchCancelButton.addEventListener('click', handleCancel);
    
        socket.on('roomJoined', handleRoomJoined);
        socket.on('roomJoinFailed', handleRoomJoinFailed);
        continuousSearch();
        const searchInterval = setInterval(continuousSearch, 5000);
    }
    
    cancelSearch() {
        this.searchBox.setVisible(false);
        this.continueSearching = false;
        this.createButton.setInteractive({ useHandCursor: true });
        this.codeButton.setInteractive({ useHandCursor: true });
        this.searchButton.setInteractive({ useHandCursor: true });
        this.exitButton.setInteractive({ useHandCursor: true });
    }

    disableButtons() {
        this.createButton.disableInteractive();
        this.codeButton.disableInteractive();
        this.searchButton.disableInteractive();
        this.exitButton.disableInteractive();
    }

    enableButtons() {
        this.createButton.setInteractive({ useHandCursor: true });
        this.codeButton.setInteractive({ useHandCursor: true });
        this.searchButton.setInteractive({ useHandCursor: true });
        this.exitButton.setInteractive({ useHandCursor: true });
    }

}

export default Lobby
