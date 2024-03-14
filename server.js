const express = require('express');
const http = require('http');
const {Server} = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {pingInterval: 2000, pingTimeout: 5000});

// Serve static files from the 'public' directory
app.use(express.static('src'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
  })

const backendPlayers = {}
const backendProjectiles = {}
let projectileId = 0

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    backendPlayers[socket.id] = {
        id: socket.id,
        x: 500 * Math.random(),
        y: 500 * Math.random()
    }

    // Inform other clients about the new player
    io.emit('updatePlayers', backendPlayers);


    socket.on('shoot', (frontendPlayer, crosshair, direction) => {
        projectileId++
        console.log(frontendPlayer.x, frontendPlayer.y)

        //Calculate X and y velocity of bullet to move it from shooter to target
        if (crosshair.y >= frontendPlayer.y)
        {
            x = 0.02 * Math.sin(direction);
            y = 0.02 * Math.cos(direction);
        }
        else
        {
            x = -0.02 * Math.sin(direction);
            y = -0.02 * Math.cos(direction);
        }

        const velocity = {
            x,
            y
        }

        backendProjectiles[projectileId] = {
            x: frontendPlayer.x,
            y: frontendPlayer.y,
            velocity,
            playerId: socket.id
        }
        console.log(backendProjectiles)
    })

    // Listen for player movement from this client
    socket.on('playerMove', (data) => {
        // Broadcast this player's movement to all other clients
        if (data === 'a') {
            backendPlayers[socket.id].x -= 2
        } else if (data === 'd') {
            backendPlayers[socket.id].x += 2
        }

        if (data === 'w') {
            backendPlayers[socket.id].y -= 2
        } else if (data === 's') {
            backendPlayers[socket.id].y += 2
        }
    });

    // Handle client disconnection
    socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.id, reason);
        delete backendPlayers[socket.id]
        // Inform other clients that this player has disconnected
        io.emit('updatePlayers', backendPlayers);
    });
});
console.log(backendProjectiles)

setInterval(() => {
    for (const id in backendProjectiles) {
        backendProjectiles[id].x += backendProjectiles[id].velocity.x
        backendProjectiles[id].y += backendProjectiles[id].velocity.y

        //REMOVES PROJECTILE, BUT WITH VELOCITY 0.02 TAKES A LONG TIME
        if (backendProjectiles[id].x >= 1920 || backendProjectiles[id].x <= 0 || backendProjectiles[id].y >= 1080 || backendProjectiles[id].y <= 0) {
            delete backendProjectiles[id]
        }
        console.log(backendProjectiles)
    }
    
    io.emit('updateProjectiles', backendProjectiles)
    io.emit('updatePlayers', backendPlayers)
}, 15)

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
