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
const readyPlayers = {}
let countdownInterval
const weaponDetails = {}




io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    for (const roomId in rooms) {
        io.to(roomId).emit('updatePlayers', filterPlayersByMultiplayerId(roomId))
    }

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
        rooms[roomId] = { name: roomName, host: socket.id, players: [socket.id], gameStarted: false}
        console.log('Created roomId: ', roomId)
        socket.emit('roomCreated', roomId)
        io.emit('updateRooms', rooms)
        
    })

    socket.on('checkRoom', (roomId) => {
        if (rooms[roomId] && rooms[roomId].players.length < 4 && !rooms[roomId].gameStarted) {
            socket.emit('roomJoined', roomId)
        } else {
            socket.emit('roomJoinFailed', 'Room is full or does not exist');
        }
    })

    socket.on('joinRoom', (roomId) => {
        if (rooms[roomId]) {
            const username = playerUsername[socket.id];
            rooms[roomId].players.push({ id: socket.id, roomId, x: 1920 / 2, y: 1080 / 2, username });
            socket.join(roomId);
            console.log('KAI JOININA ROOMA roomId: ', roomId)
            //THIS IS CALLED BECAUSE THE FIRST PLAYER WHICH IS PUSHED NOT DEFINED
            rooms[roomId].players = rooms[roomId].players.filter(player => player.id);
            if (!readyPlayers[roomId]) {
                readyPlayers[roomId] = {}
            }
            readyPlayers[roomId][socket.id] = false
            io.to(roomId).emit('updateRoomPlayers', rooms[roomId].players); // Emit only to players in the same room
            console.log('KAI JOININA', rooms[roomId].players)
        } else {
            socket.emit('roomJoinFailed', 'Room is full or does not exist');
        }
    });

    socket.on('updateReadyState', ({playerId, isReady, roomId}) => {
        readyPlayers[roomId][playerId] = isReady
        console.log('readyPlayers:', readyPlayers)
        io.to(roomId).emit('updateReadyPlayers', calculateReadyPlayers(readyPlayers[roomId]))
    })

    socket.on('startCountdown', async (roomId) => {
        if (roomId && !rooms[roomId].countdownStarted) {
            let countdownTime = 1
            rooms[roomId].countdownStarted = true;
            
            countdownInterval = setInterval(async () => {
                countdownTime--;
                if (countdownTime === 0) {
                    clearInterval(countdownInterval);
                    io.to(roomId).emit('countdownEnd');
                    rooms[roomId].countdownStarted = false;
                    const client = await sql.connect()
                    for (const playerId in readyPlayers[roomId]) {
                        if (readyPlayers[roomId][playerId]) {
                            const username = 'asd' //playerUsername[playerId]
                            const weaponIdResult = await client.query('SELECT weapon FROM user_profile WHERE user_name = $1', [username]);
                            const weaponId = weaponIdResult.rows[0].weapon;
                            const weaponDetailsResult = await client.query('SELECT damage, fire_rate, ammo, reload FROM weapons WHERE weapon_id = $1', [weaponId]);
                            const weapons = weaponDetailsResult.rows[0];
                            weaponDetails[playerId] = weapons
                            console.log('paema detales', weaponDetails[socket.id])
                            io.to(roomId).emit('weapon', weaponDetails)
                            delete readyPlayers[roomId][playerId]
                        }
                    }
                    startGame(roomId)
                    client.release();
                } else {
                    io.to(roomId).emit('updateCountdown', countdownTime);
                }
            }, 1000);
        }
    })


    socket.on('playerAnimationChange', (AnimData) => {
        const { playerId, animation } = AnimData;
        // Broadcast the animation change to all other clients
        io.emit('playerAnimationUpdate', { playerId, animation });
    });

    socket.on('updateWeaponState', (WSData) => {
        const { playerId, x, y, rotation } = WSData;
        // Broadcast weapon state to all clients except the sender
        io.emit('weaponStateUpdate', { playerId, x, y, rotation });
    });


    socket.on('shoot', (frontendPlayer, crosshair, direction, multiplayerId) => {

        if (backendPlayers[socket.id]) {
            if (backendPlayers[socket.id].bullets > 0) {
                backendPlayers[socket.id].bullets--
                projectileId++
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
                    playerId: socket.id,
                    multiplayerId,
                }
            } 
            if (backendPlayers[socket.id].bullets === 0) {
                console.log('reloadina', socket.id)
                const reloadTime = weaponDetails[socket.id].reload
                const bullets = weaponDetails[socket.id].ammo
                reload(reloadTime, bullets, socket.id)
            }

        }
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
        const index = room.players.findIndex(player => player.id === socket.id);
        if (index !== -1) {
            console.log('Player leaving room:', socket.id);
            room.players.splice(index, 1);
            if (socket.id === room.host && room.players.length > 1) {
                room.host = room.players[Math.floor(Math.random() * room.players.length)].id;
            }
            if (room.players.length === 0) {
                console.log('Deleting room:', roomId);
                delete rooms[roomId];
            } else {
                // Update room players for remaining clients
                io.to(roomId).emit('updateRoomPlayers', room.players);
            }
            socket.leave(roomId); // Leave the room
            delete readyPlayers[socket.id]; // Remove from ready players
            io.to(roomId).emit('updateRooms', rooms); // Update room list
            break; // Exit the loop after handling the player's room
        }
    }
        delete backendPlayers[socket.id]
        // Inform other clients that this player has disconnected
        for (const roomId in rooms) {
            io.to(roomId).emit('updatePlayers', filterPlayersByMultiplayerId(roomId))
        }
        //Puts usernames in an array, finds the first username associated with the disconnected socket.id
        const username = Object.keys(activeSessions).find(key => activeSessions[key] === socket.id);
        if (username) {
            delete activeSessions[username];
        }
    });

    socket.on('leaveRoom', (roomId) => {
        for (const id in rooms) {
            if (id === roomId) {
                const room = rooms[roomId];
                const index = room.players.findIndex(player => player.id === socket.id);
                if (index !== -1) {
                    console.log('Player leaving room:', socket.id);
                    room.players.splice(index, 1);
                    if (socket.id === room.host && room.players.length > 1) {
                        room.host = room.players[Math.floor(Math.random() * room.players.length)].id;
                    }
                    if (room.players.length === 0) {
                        console.log('Deleting room:', roomId);
                        delete rooms[roomId];
                    } else {
                        // Update room players for remaining clients
                        io.to(roomId).emit('updateRoomPlayers', room.players);
                    }
                    socket.leave(roomId); // Leave the room
                    delete readyPlayers[socket.id]; // Remove from ready players
                    io.to(roomId).emit('updateRooms', rooms); // Update room list
                    break; // Exit the loop after handling the player's room
                }
            }
        }
        
    })

});

function calculateReadyPlayers(readyPlayers) {
    let count = 0;
    for (const playerId in readyPlayers) {
        if (readyPlayers[playerId]) {
            count++;
        }
    }
    return count;
}

function filterPlayersByMultiplayerId(multiplayerId) {
    let playersInSession = {}
    for (const playerId in backendPlayers) {
        if (backendPlayers[playerId].multiplayerId === multiplayerId) {
            playersInSession[playerId] = backendPlayers[playerId]
        }
    }
    //console.log(playersInSession)
    return playersInSession
}

function filterProjectilesByMultiplayerId(multiplayerId) {
    let projectilesInSession = {}
    for (const id in backendProjectiles) {
        if (backendProjectiles[id].multiplayerId === multiplayerId) {
            projectilesInSession[id] = backendProjectiles[id]
        }
    }
    //console.log('projectiles', projectilesInSession)
    return projectilesInSession
}

function startGame(multiplayerId) {
        if (rooms[multiplayerId] && rooms[multiplayerId].players) {
        let playersInRoom = {}
        rooms[multiplayerId].gameStarted = true
        playersInRoom = rooms[multiplayerId].players
        playersInRoom.forEach((player) => {
            const id = player.id
            const username = playerUsername[id];
            const bullets = weaponDetails[id].ammo
            backendPlayers[id] = { 
                id,
                multiplayerId,
                x: 1920 * Math.random(),
                y: 1080 * Math.random(),
                score: 0,
                username,
                health: 100,
                bullets
            };
        });
    }
}
function reload(reloadTime, bullets, id) {
    const reloadInterval = setInterval(() => {
        backendPlayers[id].bullets = bullets //CHANGE BASED ON WEAPON
        clearInterval(reloadInterval)
    }, reloadTime) //RELOAD TIME CHANGE BASED ON WEAPON
}

setInterval(() => {
    for (const id in backendProjectiles) {
        backendProjectiles[id].x += backendProjectiles[id].velocity.x
        backendProjectiles[id].y += backendProjectiles[id].velocity.y

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
                //RESPAWNINTAM PLAYERIUI PROJECTILE NESIDELETINA
                delete backendProjectiles[id]
                break
            }
        }
    }
    for (const roomId in rooms) {
        //console.log('tikrinu roomus', roomId)
        const players = filterPlayersByMultiplayerId(roomId)
        const projectiles = filterProjectilesByMultiplayerId(roomId)
        io.to(roomId).emit('updateProjectiles', projectiles)
        io.to(roomId).emit('updatePlayers', players)
    }
    io.emit('updateRooms', rooms)
    for (const roomId in rooms) {
        io.emit('updateRoomPlayers', rooms[roomId].players)
    }
}, 15)

const PORT = 443;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
