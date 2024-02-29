const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('src'));

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Inform other clients about the new player
    socket.broadcast.emit('newPlayer', { id: socket.id, x: 400, y: 300 });

    // Listen for player movement from this client
    socket.on('playerMove', (data) => {
        console.log(`Broadcasting move from ${socket.id}:`, data);
        // Broadcast this player's movement to all other clients
        socket.broadcast.emit('playerMove', { id: socket.id, x: data.x, y: data.y });
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Inform other clients that this player has disconnected
        socket.broadcast.emit('playerDisconnected', { id: socket.id });
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
