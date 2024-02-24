const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve your static files (HTML, CSS, JS, etc.)
app.use(express.static('public'));

// Handle a socket connection request from web clients
io.on('connection', (socket) => {
    console.log('a user connected');

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    // Handle custom messages like player moves or actions
    socket.on('playerAction', (msg) => {
        // Broadcast the action to all clients except the sender
        socket.broadcast.emit('playerAction', msg);
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
