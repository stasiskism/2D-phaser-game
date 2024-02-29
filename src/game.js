var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var game = new Phaser.Game(config);

function preload() {
    // Preload assets here later
}

var player;
var otherPlayers = {}; // Object to store other players
var cursors;
var socket = io(); // Connect to the server

function create() {
    player = this.add.circle(400, 300, 20, 0x6666ff); // Add player's circle
    cursors = this.input.keyboard.createCursorKeys(); // Input for movement

    // Listen for new player connections
    socket.on('newPlayer', (playerInfo) => {
        addOtherPlayer(this, playerInfo.id, playerInfo.x, playerInfo.y);
    });

    // Listen for player movements
    socket.on('playerMove', (moveInfo) => {
        if (otherPlayers[moveInfo.id]) {
            otherPlayers[moveInfo.id].setPosition(moveInfo.x, moveInfo.y);
        }
    });

    // Listen for player disconnections
    socket.on('playerDisconnected', (info) => {
        if (otherPlayers[info.id]) {
            otherPlayers[info.id].destroy();
            delete otherPlayers[info.id];
        }
    });
}

function update() {
    // Example movement logic for the player
    if (cursors.left.isDown) {
        player.x -= 2;
        socket.emit('playerMove', { x: player.x, y: player.y });
    } else if (cursors.right.isDown) {
        player.x += 2;
        socket.emit('playerMove', { x: player.x, y: player.y });
    }

    if (cursors.up.isDown) {
        player.y -= 2;
        socket.emit('playerMove', { x: player.x, y: player.y });
    } else if (cursors.down.isDown) {
        player.y += 2;
        socket.emit('playerMove', { x: player.x, y: player.y });
    }
}

function addOtherPlayer(scene, id, x, y) {
    const otherPlayer = scene.add.circle(x, y, 20, 0xff0000); // Different color for other players
    otherPlayers[id] = otherPlayer;
}
