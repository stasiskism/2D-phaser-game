const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('src'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
  })

const players = {}

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    players[socket.id] = {
        id: socket.id,
        x: 500 * Math.random(),
        y: 500 * Math.random()
    }

    

    // Inform other clients about the new player
    io.emit('updatePlayers', players);

    // Listen for player movement from this client
    socket.on('playerMove', (data) => {
        // Broadcast this player's movement to all other clients
        socket.emit('playerMove', { id: socket.id, x: data.x, y: data.y });
    });

    // Handle client disconnection
    socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.id, reason);
        delete players[socket.id]
        // Inform other clients that this player has disconnected
        io.emit('updatePlayers', players);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
