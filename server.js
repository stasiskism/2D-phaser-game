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

app.post('/register', async(req, res) => {
    const { username, password } = req.body

    try {
        const client = await sql.connect()
        const encryptedPassword = await client.query('SELECT crypt($1, gen_salt(\'bf\')) AS encrypted_password', [password]);
        const hashedPassword = encryptedPassword.rows[0].encrypted_password;
        console.log(hashedPassword)
        const values = [username, hashedPassword]
        await client.query('INSERT INTO user_authentication (user_name, user_password) VALUES ($1, $2)', values)
        client.release()
        res.sendStatus(200)
    } catch (error) {
        res.status(500).send('Error inserting data into database')
    }
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body

    try {
        const client = await sql.connect()
        const result = await client.query(`SELECT user_id from user_authentication WHERE user_name = $1 and user_password = crypt($2, user_password);`, [username, password])
        if (result.rows.length === 0) {
            res.status(401).send('Invalid username or password')
            return;
        }

        res.sendStatus(200);
        
        client.release()
    } catch (error) {
        console.error('Error authenticating user:', error)
        res.status(500).send('Error authenticating user')
    }
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
                console.log(distance)
                delete backendProjectiles[id]
                delete backendPlayers[playerId]
                break
            }
        }
    }
    
    io.emit('updateProjectiles', backendProjectiles)
    io.emit('updatePlayers', backendPlayers)
})

const PORT = 433;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
