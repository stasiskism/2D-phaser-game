const buttonStartMultiplayerEl = document.querySelector('#buttonStartMultiplayerEl')


//const devicePixelRatio = window.devicePixelRatio || 1
const frontEndPlayers = {}
const frontEndProjectiles = {}

socket.on('updateProjectiles', (backEndProjectiles) => {
    for (const id in backEndProjectiles) {
        const backEndProjectile = backEndProjectiles[id]

        if (!frontEndProjectiles[id]) {
            frontEndProjectiles[id] = new Projectile({x: backEndProjectile.x, y: backEndProjectile.y, radius: 5, color: 'red', velocity: backEndProjectile.velocity})
        } else {
            frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x
            frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y
        }
    }
})

socket.on('updatePlayers', (backEndPlayers) => {
    for (const id in backEndPlayers) {
        const backEndPlayer = backEndPlayers[id]
        
        if (!frontEndPlayers[id]) {
            frontEndPlayers[id] = new Player({x: backEndPlayer.x, y: backEndPlayer.y, radius: backEndPlayer.radius, color: backEndPlayer.color})
        } else {
            // if a player already exists
            frontEndPlayers[id].x = backEndPlayer.x
            frontEndPlayers[id].y = backEndPlayer.y
        }
    }

    for (const id in frontEndPlayers) {
        if (!backEndPlayers[id]) {
            delete frontEndPlayers[id]
        }
    }
})

function animateMultiplayer() {
    animationID = requestAnimationFrame(animateMultiplayer)
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)

    for (const id in frontEndPlayers) {
        const frontEndPlayer = frontEndPlayers[id]
        frontEndPlayer.drawPlayer()
        frontEndPlayer.update()
    }

    for (const id in frontEndProjectiles) {
        const frontEndProjectile = frontEndProjectiles[id]
        frontEndProjectile.drawProjectile()
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
setInterval(() => {
    if (keys.left.pressed) {
        frontEndPlayers[socket.id].x -= SPEED
            socket.emit('keydown', 'a')
    } 
    if (keys.right.pressed) {
        frontEndPlayers[socket.id].x += SPEED
            socket.emit('keydown', 'd')
    } 
    if (keys.up.pressed) {
        frontEndPlayers[socket.id].x -= SPEED
            socket.emit('keydown', 'w')
    } 
    if (keys.down.pressed) {
        frontEndPlayers[socket.id].x += SPEED
            socket.emit('keydown', 's')
    } 
}, 15)