const express = require('express')
const app = express()

//socket.io setup, creating a server, letting frontend connect to backend
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {pingInterval: 2000, pingTimeout: 5000})

const port = 3000

app.use(express.static('src'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

//Multiplayer game players
const backEndPlayers = {}
const backEndProjectiles = {}
let projectileID = 0

io.on('connection', (socket) => {
  console.log('a user connected')
  //create a player with random player id
  backEndPlayers[socket.id] = {
    x: 500 * Math.random(),
    y: 500 * Math.random(),
    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    radius: 10
    }
  

  io.emit('updatePlayers', backEndPlayers)

  socket.on('disconnect', (reason) => {
    console.log(reason)
    delete backEndPlayers[socket.id]
    io.emit('updatePlayers', backEndPlayers)
  })

  socket.on('shoot', ({x, y, angle}) => {
    projectileID++

    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    }
    backEndProjectiles[projectileID] = {
      x,
      y,
      velocity,
      //find out who shot what
      playerID: socket.id
    }
    console.log(backEndProjectiles)
  })

  const SPEED = 2
  socket.on('keydown', (keyCode) => {
    switch (keyCode) {
      case ('a') :
          console.log('left')
          backEndPlayers[socket.id].x -= SPEED
          break
      case 'd':
          console.log('right')
          backEndPlayers[socket.id].x += SPEED
          break
      case 'w':
          console.log('up')
          backEndPlayers[socket.id].y -= SPEED
          break
      case 's':
          console.log('down')
          backEndPlayers[socket.id].y += SPEED
          break
  }
  })

  console.log(backEndPlayers)
})

//back end tick rate
setInterval(() => {
  //updating projectiles
  for (const id in backEndProjectiles) {
    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y
  }

  io.emit('updateProjectiles', backEndProjectiles)
  io.emit('updatePlayers', backEndPlayers)
}, 15)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})