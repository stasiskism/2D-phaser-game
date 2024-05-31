const express = require('express');
const http = require('http');
const {Server} = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {pingInterval: 2000, pingTimeout: 7000});
const bodyParser = require('body-parser')
const { Pool } = require('pg');
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const stripe = require('stripe')('sk_test_51PJtjWP7nzuSu7T74zo0oHgD8swBsZMkud51DKwRHzgza3bPnRcHppcxfiqIiLhU35brBlqe3gJgjEv3NkU31GWb00dKn9t344');

app.use(express.static('src'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.use(bodyParser.json())

const sql = new Pool({
    user: 'postgres',
    host: '193.219.42.55',
    database: 'postgres',
    password: 'newteam',
    port: 8182
})

const sender = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: '2dcspbl@gmail.com',
        pass: 'pakx kcqr lbmk jrrf'
    }
});

sql.on('connect', () => {
    console.log('Connected to PostgreSQL database')
});

sql.on('error', (err) => {
    console.error('Error connecting to PostgreSQL database:', err);
});

const backendPlayers = {}
const backendProjectiles = {}
let projectileId = 0
let grenadeId = 0
const playerUsername = {}
const activeSessions = {}
const weaponIds = {}
const grenadeIds = {}
const rooms = {}
const readyPlayers = {}
let countdownInterval
const weaponDetails = {}
const grenadeDetails = {}
const reloadingStatus = {}
const backendGrenades = {}
const availableWeapons = []
const availableGrenades = []
const token = {}

app.post('/create-payment-intent', async (req, res) => {
  const { amount, username } = req.body;

  let cost;
  switch (amount) {
    case 100:
      cost = 100; // 1 EUR
      break;
    case 500:
      cost = 400; // 4 EUR
      break;
    case 1000:
      cost = 700; // 7 EUR
      break;
    default:
      return res.status(400).json({ error: 'Invalid amount of coins' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: cost,
      currency: 'eur',
      metadata: { integration_check: 'accept_a_payment', username: username }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating Payment Intent:', error);
    res.status(500).json({ error: 'Failed to create Payment Intent' });
  }
});

app.post('/update-coins', async (req, res) => {
    const { username, amount } = req.body;

    try {
        const client = await sql.connect();
        console.log('amount', amount, username)
        await client.query('UPDATE user_profile SET coins = coins + $1 WHERE user_name = $2', [amount, username]);

        console.log(`Updating ${amount} coins for user ${username}`);
        
        const result = await client.query('SELECT coins FROM user_profile WHERE user_name = $1', [username]);
        const data = result.rows[0];
        console.log('cia', data)

        res.json({ success: true, coins: data.coins });
        client.release();
    } catch (error) {
        console.error('Error updating coins:', error);
        res.status(500).json({ success: false, error: 'Failed to update coins' });
    }
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    for (const roomId in rooms) {
        io.to(roomId).emit('updatePlayers', filterPlayersByMultiplayerId(roomId))
    }

    socket.on('sendVerificationEmail', (email) => {
        token[socket.id] = crypto.randomBytes(6).toString('hex')
        const mailOptions = {
            from: '2dcspbl@gmail.com',
            to: email,
            subject: '2DCS Verification',
            text: `Your verification code is: ${token[socket.id]}`
        }
        sender.sendMail(mailOptions, async (error, info) => {
            if (error) {
                    const client = await sql.connect()
                    await client.query('INSERT INTO error_logs (error_message) VALUES ($1)', [error.detail, error])
                    console.error('Error sending email:', error);
                    client.release()
            } else {
                console.log('email sent', info.response)
            }
        })
    })

    socket.on('register', async (data) => {
        const { username, email, password, code } = data;
        if (username === '', email === '', password === '', code === '') {
            socket.emit('registerResponse', { success: false, error: 'Provided blank input' });
            await client.query('INSERT INTO error_logs (error_message) VALUES ($1, )', ['Blank input while registering.'])
            return;
        }

        if (username.length > 20 || password.length > 20) {
            socket.emit('registerResponse', { success: false, error: 'Username and password must be 20 characters or less.' });
            await client.query('INSERT INTO error_logs (error_message) VALUES ($1)', ['Username and password must be 20 characters or less.'])
            return;
        }

        if (code !== token[socket.id]) {
            socket.emit('registerResponse', { success: false, error: 'Verification code is wrong.' });
            await client.query('INSERT INTO error_logs (error_message) VALUES ($1)', ['Verification code is wrong.'])
            return;
        }
        try {
            const client = await sql.connect();
            const encryptedPassword = await client.query('SELECT crypt($1, gen_salt(\'bf\')) AS encrypted_password', [password]);
            const hashedPassword = encryptedPassword.rows[0].encrypted_password;
            const values = [username, hashedPassword, email];
            const result = await client.query('INSERT INTO user_authentication (user_name, user_password, email) VALUES ($1, $2, $3) RETURNING user_id', values);
            const id = result.rows[0].user_id;
            await client.query('INSERT INTO user_profile (user_id, user_name) VALUES ($1, $2)', [id, username]);
            await client.query('INSERT INTO user_weapons (user_id, user_name) VALUES ($1, $2)', [id, username])
            await client.query('INSERT INTO user_grenades (user_id, user_name) VALUES ($1, $2)', [id, username])
            client.release();
            socket.emit('registerResponse', { success: true });
        } catch (error) {
            console.error('Error inserting data into database:', error);
            socket.emit('registerResponse', { success: false, error: error.detail});
        }
    })

    socket.on('login', async (data) => {
        const {username, password} = data
        let weaponId
        try {
            const client = await sql.connect()
            const result = await client.query(`SELECT user_id, first_login from user_authentication WHERE user_name = $1 and user_password = crypt($2, user_password);`, [username, password])
            if (result.rows.length === 0 || activeSessions[username]) {
                socket.emit('loginResponse', { success: false, error: 'Wrong username or password.' });
                await client.query('INSERT INTO error_logs (error_message) VALUES ($1)', ['Wrong username or password.'])
            } else {
                const firstLogin = result.rows[0].first_login
                if (firstLogin) {
                    weaponResult = await client.query('SELECT weapon from user_profile WHERE user_name = $1', [username])
                    weaponId = weaponResult.rows[0].weapon
                    grenadeResult = await client.query('SELECT grenade from user_profile WHERE user_name = $1', [username])
                    grenadeId = grenadeResult.rows[0].grenade
                    await client.query('UPDATE user_authentication SET first_login = FALSE WHERE user_name = $1', [username]);
                    socket.emit('loginResponse', { success: true, firstLogin });
                }
                else {
                weaponResult = await client.query('SELECT weapon from user_profile WHERE user_name = $1', [username])
                weaponId = weaponResult.rows[0].weapon
                grenadeResult = await client.query('SELECT grenade from user_profile WHERE user_name = $1', [username])
                grenadeId = grenadeResult.rows[0].grenade

                socket.emit('loginResponse', { success: true });
                }
                playerUsername[socket.id] = username
                activeSessions[username] = socket.id
                weaponIds[socket.id] = weaponId
                grenadeIds[socket.id] = grenadeId
            }
            
            client.release();
        } catch (error) {
            console.error('Error authenticating user:', error);
            socket.emit('loginResponse', { success: false, error });
            await client.query('INSERT INTO error_logs (error_message, error_details) VALUES ($1, $2)', [error.detail, error])
            
        }
    });

    socket.on('resetPassword', async (data) => {
        const {email, code, newPassword} = data
        if (code !== token[socket.id]) {
            socket.emit('resetResponse', { success: false, error: 'Verification code is wrong.' });
            await client.query('INSERT INTO error_logs (error_message) VALUES ($1)', ['Verification code is wrong.'])
            return;
        }
        try {
            const client = await sql.connect()
            const result = await client.query(`SELECT user_id from user_authentication WHERE email = $1`, [email])
            if (result.rows.length === 0) {
                socket.emit('resetResponse', { success: false, error: 'Email does not exist. Please provide a valid email.' });
                await client.query('INSERT INTO error_logs (error_message) VALUES ($1)', ['Email does not exist.'])
            } else {
                const userId = result.rows[0].user_id
                const pswResult = await client.query('SELECT crypt($1, gen_salt(\'bf\')) AS encrypted_password', [newPassword]);
                const encryptedPassword = pswResult.rows[0].encrypted_password
                await client.query(`UPDATE user_authentication SET user_password = $1 WHERE user_id = $2`, [encryptedPassword, userId])
                socket.emit('resetResponse', { success: true })
            }
        } catch (error) {
            console.error('Error reseting password:', error);
            socket.emit('resetResponse', { success: false, error });
            await client.query('INSERT INTO error_logs (error_message, error_details) VALUES ($1, $2)', [error.detail, error])
        }
    });

    socket.on('createRoom', ({ roomName, maxPlayers, isPrivate }) => {
        const roomId = Math.random().toString(36).substring(7);
        rooms[roomId] = { name: roomName, host: socket.id, players: [socket.id], gameStarted: false, maxPlayers, isPrivate };
        const mapSize = 250 * maxPlayers
        console.log('Created roomId: ', roomId);
        socket.emit('roomCreated', roomId, mapSize);
    });

    socket.on('checkRoom', (roomId) => {
        if (rooms[roomId] && rooms[roomId].players.length < rooms[roomId].maxPlayers && !rooms[roomId].gameStarted) {
            socket.emit('roomJoined', roomId);
        } else {
            socket.emit('roomJoinFailed', 'Room is full or does not exist');
        }
    });

    socket.on('searchRoom', () => {
        for (const roomId in rooms) {
            if (rooms[roomId].players.length < rooms[roomId].maxPlayers && !rooms[roomId].gameStarted && !rooms[roomId].isPrivate) {
                socket.emit('roomJoined', roomId)
            } else {
                socket.emit('roomJoinFailed', 'There are no rooms available')
            }
        }
    })

    socket.on('joinRoom', async (roomId) => {
        if (rooms[roomId]) {
            projectileId = 0
            const username = playerUsername[socket.id];
            const weaponId = weaponIds[socket.id]
            const grenadeId = grenadeIds[socket.id]
            rooms[roomId].players.push({ id: socket.id, roomId, x: 1920 / 2, y: 1080 / 2, username, weaponId, grenadeId });
            console.log('room joined', roomId)
            socket.join(roomId);
            rooms[roomId].players = rooms[roomId].players.filter(player => player.id);
            if (!readyPlayers[roomId]) {
                readyPlayers[roomId] = {}
            }
            readyPlayers[roomId][socket.id] = false
            try {
                const client = await sql.connect()
                const resultGrenades = await client.query('SELECT grenade_id FROM user_grenades WHERE user_name = $1', [username])
                const resultWeapons = await client.query('SELECT weapon_id FROM user_weapons WHERE user_name = $1', [username])
                for (const row of resultGrenades.rows) {
                    availableGrenades.push(row.grenade_id)
                }
                for (const row of resultWeapons.rows) {
                    availableWeapons.push(row.weapon_id)
                }
                io.to(socket.id).emit('availableWeapons', availableWeapons, availableGrenades)
            } catch (error) {
                console.error('Error getting available weapons and grenades:', error);
                await client.query('INSERT INTO error_logs (error_message, error_details) VALUES ($1, $2)', [error.detail, error])
            }
            io.to(roomId).emit('updateRoomPlayers', rooms[roomId].players); // Emit only to players in the same room
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
    
                    try {
                        const client = await sql.connect();
    
                        // Collect weapon details for all players
                        for (const playerId in readyPlayers[roomId]) {
                            if (readyPlayers[roomId][playerId]) {
                                const weaponId = weaponIds[playerId]
                                const grenadeId = grenadeIds[playerId]
                                const weaponDetailsResult = await client.query('SELECT weapon_id, damage, fire_rate, ammo, reload, radius FROM weapons WHERE weapon_id = $1', [weaponId]);
                                const grenadeDetailResult = await client.query('SELECT damage FROM grenades WHERE grenade_id = $1', [grenadeId])
                                const weapons = weaponDetailsResult.rows[0];
                                const grenades = grenadeDetailResult.rows[0]
                                weaponDetails[playerId] = weapons;
                                grenadeDetails[playerId] = grenades
                                delete readyPlayers[roomId][playerId];
                            }
                        }
                        delete readyPlayers[roomId]
                        startGame(roomId);
                        client.release();
                    } catch (error) {
                        console.error('Error in getting weapon details:', error);
                        await client.query('INSERT INTO error_logs (error_message, error_details) VALUES ($1, $2)', [error.detail, error])
                    }
                } else {
                   io.to(roomId).emit('updateCountdown', countdownTime);
                }
            }, 1000);
        }
    });


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

        if (backendPlayers[socket.id] && !reloadingStatus[socket.id]) {
            
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

        }
    })

    socket.on('throw', (frontendPlayer, crosshair, multiplayerId) => {
        //GRANATA TURI SUSTOTI KUR CROSSHAIRAS, IR TADA SPROGTI
        if (backendPlayers[socket.id] && backendPlayers[socket.id].grenades > 0) {
            grenadeId++
            backendPlayers[socket.id].grenades--
            const distanceX = crosshair.x - frontendPlayer.x;
            const distanceY = crosshair.y - frontendPlayer.y;
            
            const x = distanceX / 30
            const y = distanceY / 30           

            const velocity = {
                x,
                y
            }

            const target = {
                x: crosshair.x,
                y: crosshair.y
            }

            backendGrenades[grenadeId] = {
                x: frontendPlayer.x,
                y: frontendPlayer.y,
                velocity,
                playerId: socket.id,
                multiplayerId,
                target,
                grenadeId: backendPlayers[socket.id].grenadeId
            }
        } 
    })

    socket.on('reload', (id) => {
        if (!weaponDetails[id]) return
        const reloadTime = weaponDetails[id].reload
        const bullets = weaponDetails[id].ammo
        reload(reloadTime, bullets, id)
    })

    // Listen for player movement from this client
    socket.on('playerMove', (data) => {
        const movementSpeed = 2
        let mapSize = 250
        if (backendPlayers[socket.id]) {
            const playerId = socket.id;
            let roomId = null;
            let maxPlayers = null
            for (const id in rooms) {
                if (rooms[id].players.find(player => player.id === playerId)) {
                    roomId = id;
                    maxPlayers = rooms[roomId].maxPlayers
                    break;
                }
            } 
            
            if (maxPlayers) {
                mapSize = 250 * maxPlayers
            }
            // Broadcast this player's movement to all other clients
            if (data === 'a') {
                backendPlayers[socket.id].x -= movementSpeed
                if (backendPlayers[socket.id].x < 0) {
                    delete backendPlayers[socket.id]
                }
            } else if (data === 'd') {
                backendPlayers[socket.id].x += movementSpeed
                if (backendPlayers[socket.id].x > 1920 + mapSize) {
                    delete backendPlayers[socket.id]
                }
            }

            if (data === 'w') {
                backendPlayers[socket.id].y -= movementSpeed
                if (backendPlayers[socket.id].y < 0) {
                    delete backendPlayers[socket.id]
                }
            } else if (data === 's') {
                backendPlayers[socket.id].y += movementSpeed
                if (backendPlayers[socket.id].y > 1080 + mapSize) {
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
                io.to(roomId).emit('updateRoomPlayers', room.players);
            }
            socket.leave(roomId);
            delete readyPlayers[socket.id];
            break;
        }
    }
        delete backendPlayers[socket.id]
        delete weaponDetails[socket.id]
        delete grenadeDetails[socket.id]
        delete weaponIds[socket.id]
        delete grenadeIds[socket.id]
        for (const roomId in rooms) {
            io.to(roomId).emit('updatePlayers', filterPlayersByMultiplayerId(roomId))
        }
        //Puts usernames in an array, finds the first username associated with the disconnected socket.id
        const username = Object.keys(activeSessions).find(key => activeSessions[key] === socket.id);
        if (username) {
            delete activeSessions[username];
        }
    });

    socket.on('logout', () => {
        const username = Object.keys(activeSessions).find(key => activeSessions[key] === socket.id);
        if (username) {
            delete activeSessions[username];
        }
    })

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
                        delete readyPlayers[roomId]
                    } else {
                        io.to(roomId).emit('updateRoomPlayers', room.players);
                    }
                    socket.leave(roomId);
                    delete readyPlayers[socket.id];
                    break;
                }
            }
        }
        
    })

    socket.on('singleplayer', async (id, score) => {
        const username = playerUsername[id]
        const client = await sql.connect()
        await client.query(`UPDATE user_profile SET high_score = GREATEST(high_score, $1) WHERE user_name = $2`, [score, username])
        client.release()
    })

    socket.on('gameWon', async (multiplayerId, username) => {
        if (!multiplayerId || !username) return
        delete filterPlayersByMultiplayerId(multiplayerId)
        delete filterProjectilesByMultiplayerId(multiplayerId)
        const client = await sql.connect()
        await client.query(`UPDATE user_profile SET coins = coins + 10, xp = xp + 20 WHERE user_name = $1`, [username])
        client.release()
        delete readyPlayers[multiplayerId];
        delete rooms[multiplayerId];
    })

    socket.on('detect', (multiplayerId, playerId) => {
        let mapSize = 250
        let maxPlayers = null
        if (rooms[multiplayerId].players.find(player => player.id === playerId)) {
            maxPlayers = rooms[multiplayerId].maxPlayers * 250
        }

        if (maxPlayers) {
            mapSize = maxPlayers
        }

        if (backendPlayers[playerId]) {
        backendPlayers[playerId].y += 2
        if (backendPlayers[playerId].y > 1080 + mapSize) {
            delete backendPlayers[playerId]
        }
    }
    })

    socket.on('sendMessage', ({roomId, message}) => {
        io.to(roomId).emit('receiveMessage', message)
    })


    socket.on('changeWeapon', async (weaponId) => {
        try {
            const client = await sql.connect()
            const username = playerUsername[socket.id]
            if (availableWeapons.includes(weaponId)) {
                await client.query('UPDATE user_profile SET weapon = $1 WHERE user_name = $2;', [weaponId, username]);
                weaponIds[socket.id] = weaponId
            }
            client.release()
        } catch (error) {
            console.error('Error updating weaponId:', error);
            await client.query('INSERT INTO error_logs (error_message, error_details) VALUES ($1, $2)', [error.detail, error])
        }
    })

    socket.on('changeGrenade', async (grenadeId) => {
        try {
            const client = await sql.connect()
            const username = playerUsername[socket.id]
            if (availableGrenades.includes(grenadeId)) {
                await client.query('UPDATE user_profile SET grenade = $1 WHERE user_name = $2;', [grenadeId, username]);
                grenadeIds[socket.id] = grenadeId
            }
            client.release()
        } catch (error) {
            console.error('Error updating grenadeId:', error);
            await client.query('INSERT INTO error_logs (error_message, error_details) VALUES ($1, $2)', [error.detail, error])
        }
    })

    socket.on('explode', async (data) => {
        const playerId = data.playerId
        const grenadeId = data.grenadeId
        const damage = grenadeDetails[playerId].damage
        if (backendPlayers[playerId]) {
            backendPlayers[playerId].health -= damage
            if (backendPlayers[playerId].health <= 0) {
                if (backendGrenades[grenadeId].playerId !== playerId && backendPlayers[backendGrenades[grenadeId].playerId]) {
                    const client = await sql.connect();
                    if (!backendPlayers[backendGrenades[grenadeId].playerId].username) return
                    await client.query(`UPDATE user_profile SET coins = coins + 1, xp = xp + 5 WHERE user_name = $1`, [
                    backendPlayers[backendGrenades[grenadeId].playerId].username
                    ]);
                    client.release();
                }
                delete backendPlayers[playerId];
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
    return playersInSession
}

function filterProjectilesByMultiplayerId(multiplayerId) {
    let projectilesInSession = {}
    for (const id in backendProjectiles) {
        if (backendProjectiles[id].multiplayerId === multiplayerId) {
            projectilesInSession[id] = backendProjectiles[id]
        }
    }
    return projectilesInSession
}

function filterGrenadesByMultiplayerId(multiplayerId) {
    let grenadesInSession = {}
    for (const id in backendGrenades) {
        if (backendGrenades[id].multiplayerId === multiplayerId) {
            grenadesInSession[id] = backendGrenades[id]
        }
    }
    return grenadesInSession
}

function initFallingObjects(roomId) {
    let mapSize = rooms[roomId].maxPlayers * 250;
    let fallingObjects = {};
    let objectId = 0;

    // Function to create new falling objects
    function createFallingObjects() {
        const numObjects = Math.floor(Math.random() * (8 - 2) + 2);
        for (let i = 0; i < numObjects; i++) {
            let startX = Math.floor(Math.random() * (1980 + mapSize));
            let startY = Math.floor(Math.random() * (-15 + 350)) - 350;
            fallingObjects[objectId] = { x: startX, y: startY };
            objectId++;
        }
    }

    // Function to update the positions of falling objects
    function updateFallingObjects() {
        for (let id in fallingObjects) {
            if (fallingObjects.hasOwnProperty(id)) {
                fallingObjects[id].y += 3;
                if (fallingObjects[id].y >= 1080 + mapSize) {
                    delete fallingObjects[id];
                }
            }
        }
        io.to(roomId).emit('updateFallingObjects', fallingObjects);
    }

    // Create new objects immediately
    createFallingObjects();

    // Set interval to create new objects at random intervals
    setInterval(createFallingObjects, Math.floor(Math.random() * (5000 - 4000) + 4000));

    // Set interval to update the positions of falling objects continuously
    setInterval(updateFallingObjects, 15); // Update at 60 FPS
}

function startGame(multiplayerId) {
    if (rooms[multiplayerId] && rooms[multiplayerId].players) {
    let playersInRoom = {}
    rooms[multiplayerId].gameStarted = true
    playersInRoom = rooms[multiplayerId].players
    const corners = [
        { x: 50, y: 50 },
        { x: 1870, y: 50 },
        { x: 50, y: 1030 },
        { x: 1870, y: 1030 }
    ];
    for (let i = corners.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [corners[i], corners[j]] = [corners[j], corners[i]];
    }
    playersInRoom.forEach((player, index) => {
        const id = player.id
        const username = playerUsername[id];
        const weaponId = weaponIds[id];
        const bullets = weaponDetails[id].ammo
        const firerate = weaponDetails[id].fire_rate
        const reload = weaponDetails[id].reload
        const radius = weaponDetails[id].radius
        const grenadeId = grenadeIds[id]
        const corner = corners[index]

        backendPlayers[id] = { 
            id,
            multiplayerId,
            x: corner.x,
            y: corner.y,
            score: 0,
            username,
            health: 100,
            bullets,
            firerate,
            reload,
            radius,
            grenades: 1,
            grenadeId,
            weaponId
        };
    });
    initFallingObjects(multiplayerId)
}
}

function reload(reloadTime, bullets, id) {
    reloadingStatus[id] = true
    const reloadInterval = setInterval(() => {
        if (!backendPlayers[id]) return
        backendPlayers[id].bullets = bullets //CHANGE BASED ON WEAPON
        clearInterval(reloadInterval)
        reloadingStatus[id] = false
    }, reloadTime) //RELOAD TIME CHANGE BASED ON WEAPON
}

app.get('/leaderboard', async (req, res) => {
    try {
        const client = await sql.connect()
        const result = await client.query(`SELECT user_name, high_score FROM user_profile WHERE high_score IS NOT NULL AND high_score > 0 ORDER BY high_score desc limit 10;`)
        const data = result.rows
        client.release()
        res.json(data)
    }
    catch (error) {
        console.error('Error fetching leaderboard data:', error);
        await client.query('INSERT INTO error_logs (error_message, error_details) VALUES ($1, $2)', [error.detail, error]) //CLIENTAS NEDEFINED
        res.status(500).json({ error: 'Internal server error' });
    }
})


app.get('/get-info', async (req, res) => {
    try {
        const username = req.query.username
        const client = await sql.connect()
        const result = await client.query(`SELECT coins, level, xp FROM user_profile WHERE user_name = $1;`, [username])
        const data = result.rows[0]

        res.json({coins: data.coins, level: data.level, xp: data.xp})
        client.release()
        
    }
    catch (error) {
        console.error('Error fetching coins data:', error);
        await client.query('INSERT INTO error_logs (error_message) VALUES ($1)', [error])
        res.status(500).json({ error: 'Internal server error' });
    }
})

setInterval(async () => {
    for (const id in backendProjectiles) {
        backendProjectiles[id].x += backendProjectiles[id].velocity.x;
        backendProjectiles[id].y += backendProjectiles[id].velocity.y;

        let mapSize = 250;

        for (const roomId in rooms) {
            const maxPlayers = rooms[roomId].maxPlayers;
            if (maxPlayers) {
                mapSize = maxPlayers * 250;
                break;
            }
        }

        if (
            backendProjectiles[id].x >= 1920 + mapSize ||
            backendProjectiles[id].x <= 0 ||
            backendProjectiles[id].y >= 1080 + mapSize ||
            backendProjectiles[id].y <= 0
        ) {
            delete backendProjectiles[id];
            continue;
        }

        for (const playerId in backendPlayers) {
            if (!playerId) return
            const backendPlayer = backendPlayers[playerId];
            const distance = Math.hypot(
                backendProjectiles[id].x - backendPlayer.x,
                backendProjectiles[id].y - backendPlayer.y
            );
            if (distance < 30 && backendProjectiles[id].playerId !== playerId) {
                const damage = weaponDetails[backendProjectiles[id].playerId].damage;
                backendPlayers[playerId].health -= damage;
                if (backendPlayers[playerId].health <= 0) {
                    if (backendPlayers[backendProjectiles[id].playerId]) {
                        const client = await sql.connect();
                        if (!backendPlayers[backendProjectiles[id].playerId].username) return
                        await client.query(`UPDATE user_profile SET coins = coins + 1, xp = xp + 5 WHERE user_name = $1`, [
                           backendPlayers[backendProjectiles[id].playerId].username
                        ]);
                        client.release();
                    }
                    delete backendPlayers[playerId];
                }
                delete backendProjectiles[id];
                break;
            }
        }
    }

    for (const id in backendGrenades) {
        backendGrenades[id].x += backendGrenades[id].velocity.x
        backendGrenades[id].y += backendGrenades[id].velocity.y
        const radius = 10 // iki granatos kad sustotu
        const distanceX = backendGrenades[id].target.x - backendGrenades[id].x;
        const distanceY = backendGrenades[id].target.y - backendGrenades[id].y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        if (distance <= radius) {
            backendGrenades[id].velocity = { x: 0, y: 0 };
            if (backendGrenades[id].grenadeId === 1) {
                setTimeout(() => {
                    delete backendGrenades[id];
                }, 1000);
            } else if (backendGrenades[id].grenadeId === 2) {
                setTimeout(() => {
                    delete backendGrenades[id];
                }, 400); //2000
            }
        }
    }

    for (const roomId in rooms) {
        const players = filterPlayersByMultiplayerId(roomId)
        const projectiles = filterProjectilesByMultiplayerId(roomId)
        const grenades = filterGrenadesByMultiplayerId(roomId)
        io.to(roomId).emit('updateProjectiles', projectiles, grenades)
        io.to(roomId).emit('updatePlayers', players)
    }
    for (const roomId in rooms) {
        io.emit('updateRoomPlayers', rooms[roomId].players)
    }
}, 15)

const PORT = 443;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
