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

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    backendPlayers[socket.id] = {
        id: socket.id,
        x: 500 * Math.random(),
        y: 500 * Math.random()
    }

    

    // Inform other clients about the new player
    io.emit('updatePlayers', backendPlayers);

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

setInterval(() => {
    io.emit('updatePlayers', backendPlayers)
}, 15)

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
