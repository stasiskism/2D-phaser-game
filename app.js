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
const players = {

}

io.on('connection', (socket) => {
  console.log('a user connected')
  //create a player with random player id
  players[socket.id] = {
    x: 500 * Math.random(),
    y: 500 * Math.random()
  }

  io.emit('updatePlayers', players)

  socket.on('disconnect', (reason) => {
    console.log(reason)
    delete players[socket.id]
    io.emit('updatePlayers', players)
  })

  console.log(players)
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})