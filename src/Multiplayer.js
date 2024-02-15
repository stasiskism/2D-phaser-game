
const buttonStartMultiplayerEl = document.querySelector('#buttonStartMultiplayerEl')

socket.on('updatePlayers', (BackendPlayers) => {
    for (const id in BackendPlayers) {
        const backendPlayer = BackendPlayers[id]
        
        if (!players[id]) {
            players[id] = new Player(backendPlayer.x, backendPlayer.y, 10, 'yellow')
        }
    }

    for (const id in players) {
        if (!BackendPlayers[id]) {
            delete players[id]
        }
    }
console.log(players)
})
const players = {}

function animateMultiplayer() {
    animationID = requestAnimationFrame(animateMultiplayer)
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
    for (const id in players) {
        const player = players[id]
        player.drawPlayer()
    }
    
    //player movement
    if (keys.right.pressed) {
        player.velocity.x = 2
    } else if (keys.left.pressed) {
        player.velocity.x = -2
    } else player.velocity.x = 0

    if (keys.up.pressed) {
        player.velocity.y = -2
    } else if (keys.down.pressed) {
        player.velocity.y = 2
    } else player.velocity.y = 0
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
