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

    // Handle client disconnection
    socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.id, reason);
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
            health: 100
        }
    })

});

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
}, 15)

const PORT = 443;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
