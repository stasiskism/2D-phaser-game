const buttonStartMultiplayerEl = document.querySelector('#buttonStartMultiplayerEl')


//const devicePixelRatio = window.devicePixelRatio || 1

socket.on('updatePlayers', (backEndPlayers) => {
    for (const id in backEndPlayers) {
        const backEndPlayer = backEndPlayers[id]
        
        if (!frontEndPlayers[id]) {
            frontEndPlayers[id] = new Player({x: backEndPlayer.x, y: backEndPlayer.y, radius: 10, color: `hsl(${Math.random() * 360}, 100%, 50%)`})
        } else {
            if (id === socket.id) {
            // if a player already exists
            frontEndPlayers[id].x = backEndPlayer.x
            frontEndPlayers[id].y = backEndPlayer.y

            const lastBackEndInputIndex = playerInputs.findIndex((input) => {

                return backEndPlayer.sequenceNumber === input.sequenceNumber
            })

            if (lastBackEndInputIndex > -1) {
                playerInputs.splice(0, lastBackEndInputIndex + 1)
            

                playerInputs.forEach(input => {
                    frontEndPlayers[id].x += input.dx
                    frontEndPlayers[id].y += input.dy
            })
            }

        } else {
            //for all other players
            frontEndPlayers[id].x = backEndPlayer.x
            frontEndPlayers[id].y = backEndPlayer.y
        }
    }

    for (const id in frontEndPlayers) {
        if (!backEndPlayers[id]) {
            delete frontEndPlayers[id]
        }
    }
}
})
const frontEndPlayers = {}

function animateMultiplayer() {
    animationID = requestAnimationFrame(animateMultiplayer)
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
    for (const id in frontEndPlayers) {
        const frontEndPlayer = frontEndPlayers[id]
        frontEndPlayer.drawPlayer()
    }
}
buttonStartMultiplayerEl.addEventListener('click', () => {
    animateMultiplayer()
    gsap.to('#modelStartEl', {
        opacity: 0,
        scale: 0.6,
        duration: 0.4,
        ease: 'expo.in',
        onComplete: () => {
            modelStartEl.style.display = 'none'
        }
    })
})

const SPEED = 2
const playerInputs = []
let sequenceNumber = 0
setInterval(() => {
    if (keys.left.pressed) {
        sequenceNumber++
        playerInputs.push({sequenceNumber, dx: -SPEED, dy: 0})
        frontEndPlayers[socket.id].x -= SPEED
            socket.emit('keydown', {keycode: 'a', sequenceNumber})
    } 
    if (keys.right.pressed) {
        sequenceNumber++
        playerInputs.push({sequenceNumber, dx: SPEED, dy: 0})
        frontEndPlayers[socket.id].x += SPEED
            socket.emit('keydown', {keycode: 'd', sequenceNumber})
    } 
    if (keys.up.pressed) {
        sequenceNumber++
        playerInputs.push({sequenceNumber, dx: 0, dy: -SPEED})
        frontEndPlayers[socket.id].x -= SPEED
            socket.emit('keydown', {keycode: 'w', sequenceNumber})
    } 
    if (keys.down.pressed) {
        sequenceNumber++
        playerInputs.push({sequenceNumber, dx: 0, dy: SPEED})
        frontEndPlayers[socket.id].x += SPEED
            socket.emit('keydown', {keycode: 's', sequenceNumber})
    } 
}, 15)
