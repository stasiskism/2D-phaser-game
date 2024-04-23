const express = require('express');
const http = require('http');
const {Server} = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {pingInterval: 2000, pingTimeout: 5000});

const bodyParser = require('body-parser')
const { Pool } = require('pg');

app.use(express.static('src'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.use(bodyParser.json())

const sql = new Pool({
    user: 'postgres',
    host: '193.219.42.55',
    database: 'postgres',
    password: '2dcs',
    port: 14066
})

sql.on('connect', () => {
    console.log('Connected to PostgreSQL database')
});

sql.on('error', (err) => {
    console.error('Error connecting to PostgreSQL database:', err);
});


//SUKURTI USERIO PROFILIUS


const backendPlayers = {}
const backendProjectiles = {}
let projectileId = 0
const playerUsername = {}
const activeSessions = {}
const rooms = {}



io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Inform other clients about the new player
    io.emit('updatePlayers', backendPlayers);


    socket.on('register', async (data) => {
        const { username, password } = data;
        try {
            const client = await sql.connect();
            const encryptedPassword = await client.query('SELECT crypt($1, gen_salt(\'bf\')) AS encrypted_password', [password]);
            const hashedPassword = encryptedPassword.rows[0].encrypted_password;
            const values = [username, hashedPassword];
            const result = await client.query('INSERT INTO user_authentication (user_name, user_password) VALUES ($1, $2) RETURNING user_id', values);
            const id = result.rows[0].user_id;
            await client.query('INSERT INTO user_profile (user_id, user_name) VALUES ($1, $2)', [id, username]);
            client.release();
            socket.emit('registerResponse', { success: true });
        } catch (error) {
            console.error('Error inserting data into database:', error);
            socket.emit('registerResponse', { success: false });
        }
    })
    socket.on('login', async (data) => {
        const {username, password} = data
        try {
                    const client = await sql.connect()
                    const result = await client.query(`SELECT user_id, first_login from user_authentication WHERE user_name = $1 and user_password = crypt($2, user_password);`, [username, password])
                    if (result.rows.length === 0 || activeSessions[username]) {
                        socket.emit('loginResponse', { success: false });
                    } else {
                        const firstLogin = result.rows[0].first_login
                        if (firstLogin) {
                            await client.query('UPDATE user_authentication SET first_login = FALSE WHERE user_name = $1;', [username]);
                            socket.emit('loginResponse', { success: true, firstLogin });
                        }
                        else {
                        // Authentication successful
                        socket.emit('loginResponse', { success: true });
                        }
                        playerUsername[socket.id] = username
                        activeSessions[username] = socket.id
                    }
                    
                    client.release();
                } catch (error) {
                    console.error('Error authenticating user:', error);
                    socket.emit('loginResponse', { success: false });
                }
    })

    socket.on('createRoom', (roomName) => {
        const roomId = Math.random().toString(36).substring(7)
        rooms[roomId] = { name: roomName, host: socket.id, players: [socket.id]}
        console.log('roomId: ', roomId)
        socket.emit('roomCreated', roomId)
        io.emit('updateRooms', rooms)
        
    })

    socket.on('joinRoom', (roomId) => {
        if (rooms[roomId] && rooms[roomId].players.length < 4) {
            const username = playerUsername[socket.id];
            rooms[roomId].players.push({ id: socket.id, roomId, x: 1920 / 2, y: 1080 / 2, username });
            socket.join(roomId);
            socket.emit('roomJoined', roomId);
            //THIS IS CALLED BECAUSE THE FIRST PLAYER WHICH IS PUSHED NOT DEFINED
            rooms[roomId].players = rooms[roomId].players.filter(player => player.id);
            io.to(roomId).emit('updateRoomPlayers', rooms[roomId].players); // Emit only to players in the same room
            console.log(rooms[roomId].players)
        } else {
            socket.emit('roomJoinFailed', 'Room is full or does not exist');
        }
    });

    socket.on('leaveRoom', (roomId) => {
        if (rooms[roomId]) {
            const room = rooms[roomId]
            const index = room.players.findIndex(player => player.id === socket.id);
            if (index !== -1) {
                room.players.splice(index, 1)
                if (socket.id === room.host) {
                    room.host = room.players[Math.floor(Math.random() * room.players.length)]
                }
                if (room.players.length === 0) {
                    delete rooms[roomId]
                }
                socket.leave(roomId)
                io.to(roomId).emit('updateRoomPlayers', rooms[roomId].players);
            }
        }
    })

    socket.on('playerAnimationChange', (AnimData) => {
        const { playerId, animation } = AnimData;
        // Broadcast the animation change to all other clients
        socket.broadcast.emit('playerAnimationUpdate', { playerId, animation });
    });

    socket.on('updateWeaponState', (WSData) => {
        const { playerId, x, y, rotation } = WSData;
        // Broadcast weapon state to all clients except the sender
        socket.broadcast.emit('weaponStateUpdate', { playerId, x, y, rotation });
    });


    socket.on('shoot', (frontendPlayer, crosshair, direction) => {
        projectileId++

        if (backendPlayers[socket.id] && backendPlayers[socket.id].bullets > 0) {
            console.log(backendPlayers[socket.id].bullets)
            backendPlayers[socket.id].bullets--
        }

        let x, y
        //Calculate X and y velocity of bullet to move it from shooter to target
        if (crosshair.y >= frontendPlayer.y)
        {
            x = 30 * Math.sin(direction);
            y = 30 * Math.cos(direction);
        }
        else
        {
            x = -30 * Math.sin(direction);
            y = -30 * Math.cos(direction);
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
        //console.log(backendProjectiles)
    })

    // Listen for player movement from this client
    socket.on('playerMove', (data) => {
        if (backendPlayers[socket.id]) {
            // Broadcast this player's movement to all other clients
            if (data === 'a') {
                backendPlayers[socket.id].x -= 2
                if (backendPlayers[socket.id].x < 0) {
                    delete backendPlayers[socket.id]
                }
            } else if (data === 'd') {
                backendPlayers[socket.id].x += 2
                if (backendPlayers[socket.id].x > 1920) {
                    delete backendPlayers[socket.id]
                }
            }

            if (data === 'w') {
                backendPlayers[socket.id].y -= 2
                if (backendPlayers[socket.id].y < 0) {
                    delete backendPlayers[socket.id]
                }
            } else if (data === 's') {
                backendPlayers[socket.id].y += 2
                if (backendPlayers[socket.id].y > 1080) {
                    delete backendPlayers[socket.id]
                }
            }
        }
    });

    socket.on('roomPlayerMove', (info) => {
        const {data, roomId} = info
        if (rooms[roomId]) {
            // If the player is within a room
            const room = rooms[roomId];
            const playerIndex = room.players.findIndex(player => player.id === socket.id);
            if (playerIndex !== -1) {
                const player = room.players[playerIndex];
                // Update player's position within the room
                if (data === 'a') {
                    player.x -= 2;
                    if (player.x < 0) {
                        player.x = 0;
                    }
                } else if (data === 'd') {
                    player.x += 2;
                    if (player.x > 1920) {
                        player.x = 1920;
                    }
                } else if (data === 'w') {
                    player.y -= 2;
                    if (player.y < 0) {
                        player.y = 0;
                    }
                } else if (data === 's') {
                    player.y += 2;
                    if (player.y > 1080) {
                        player.y = 1080;
                    }
                }
                // Update the player's position in the room's players array
                room.players[playerIndex] = player;
            }
        }
    })


    // Handle client disconnection
    socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.id, reason);
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const index = room.players.indexOf(socket.id);
            if (index !== -1) {
                room.players.splice(index, 1);
                if (socket.id === room.host) {
                    // If host leaves, select a random player as the new host
                    room.host = room.players[Math.floor(Math.random() * room.players.length)];
                }
                if (room.players.length === 0) {
                    // Delete empty room
                    delete rooms[roomId];
                    io.emit('updateRoom', room);
                }
                io.to(roomId).emit('updateRoomPlayers', rooms[roomId].players);
                break;
            }
        }
        delete backendPlayers[socket.id]
        // Inform other clients that this player has disconnected
        io.emit('updatePlayers', backendPlayers);
        //Puts usernames in an array, finds the first username associated with the disconnected socket.id
        const username = Object.keys(activeSessions).find(key => activeSessions[key] === socket.id);
        if (username) {
            delete activeSessions[username];
        }
    });

    socket.on('startGame', () => {
        username = playerUsername[socket.id]
        backendPlayers[socket.id] = { 
            id: socket.id,
            x: 1920 * Math.random(),
            y: 1080 * Math.random(),
            score: 0,
            username,
            health: 100,
            bullets: 10 //NEED TO GET BULLET COUNT FROM DATABASE
        }
    })

});

setInterval(() => {
    for (const playerId in backendPlayers) {
        if (backendPlayers[playerId].bullets === 0) {
            backendPlayers[playerId].bullets = 10 //CHANGE BASED ON WEAPON
        }
    }
}, 3000) //RELOAD TIME CHANGE BASED ON WEAPON

setInterval(() => {
    for (const id in backendProjectiles) {
        backendProjectiles[id].x += backendProjectiles[id].velocity.x
        backendProjectiles[id].y += backendProjectiles[id].velocity.y

        //REMOVES PROJECTILE, BUT WITH VELOCITY 0.02 TAKES A LONG TIME
        if (backendProjectiles[id].x >= 1920 || backendProjectiles[id].x <= 0 || backendProjectiles[id].y >= 1080 || backendProjectiles[id].y <= 0) {
            delete backendProjectiles[id]
            continue
        }
        //console.log(backendProjectiles)

        for (const playerId in backendPlayers) {
            const backendPlayer = backendPlayers[playerId]
            const distance = Math.hypot(backendProjectiles[id].x - backendPlayer.x, backendProjectiles[id].y - backendPlayer.y)
            if (distance < 30 && backendProjectiles[id].playerId !== playerId) {

                //console.log(distance)
                //delete backendPlayers[playerId]

                //change according to the weapon
                backendPlayers[playerId].health -= 20
                console.log(backendPlayers[playerId].health)
                if (backendPlayers[playerId].health <= 0) {
                    delete backendPlayers[playerId]
                    if (backendPlayers[backendProjectiles[id].playerId]) {
                        backendPlayers[backendProjectiles[id].playerId].score++
                    }
                }
                console.log('delete projectile')
                //RESPAWNINTAM PLAYERIUI PROJECTILE NESIDELETINA
                delete backendProjectiles[id]
                break
            }
        }
    }
    
    io.emit('updateProjectiles', backendProjectiles, backendPlayers)
    io.emit('updatePlayers', backendPlayers)
    for (const roomId in rooms) {
        io.emit('updateRoomPlayers', rooms[roomId].players)
    }
}, 15)

const PORT = 443;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
