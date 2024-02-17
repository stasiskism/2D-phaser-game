const buttonStartMultiplayerEl = document.querySelector('#buttonStartMultiplayerEl')


const devicePixelRatio = window.devicePixelRatio || 1
const frontEndPlayers = {}
const frontEndProjectiles = {}

let multiplayerAnimationID

function connectServer() {
    socket.on('connect', () => {
    socket.emit('initCanvas', {width: canvas.width, height: canvas.height, devicePixelRatio})
})
}

function updateProjectiles() {
socket.on('updateProjectiles', (backEndProjectiles) => {
    for (const id in backEndProjectiles) {
        const backEndProjectile = backEndProjectiles[id]

        if (!frontEndProjectiles[id]) {
            frontEndProjectiles[id] = new Projectile({
                x: backEndProjectile.x,
                y: backEndProjectile.y,
                radius: 5,
                color: frontEndPlayers[backEndProjectiles.playerID]?.color,
                velocity: backEndProjectile.velocity
            })
        } else {
            frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x
            frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y
        }
    }

    for (const id in frontEndProjectiles) {
        if (!backEndProjectiles[id]) {
            delete frontEndProjectiles[id]
        }
    }

})
}

function updatePlayers() {
socket.on('updatePlayers', (backEndPlayers) => {
    for (const id in backEndPlayers) {
        const backEndPlayer = backEndPlayers[id]
        
        if (!frontEndPlayers[id]) {
            frontEndPlayers[id] = new Player({x: backEndPlayer.x, y: backEndPlayer.y, radius: backEndPlayer.radius, color: backEndPlayer.color})
            document.querySelector('#playerLabels').innerHTML += `<div data-id = "${id}" data-score="${backEndPlayer.score}">${id}: ${backEndPlayer.score}</div>`
        } else {
            document.querySelector(`div[data-id="${id}"]`).innerHTML = `${id}: ${backEndPlayer.score}`

            document.querySelector(`div[data-id="${id}"]`).setAttribute('data-score', backEndPlayer.score)
            
            //sorts the leaderboard based on the score
            const parentDiv = document.querySelector('#playerLabels')
            const childDivs = Array.from(parentDiv.querySelectorAll('div'))
            childDivs.sort((first, second) => {
               const scoreFirst = Number(first.getAttribute('data-score'))
               const scoreSecond = Number(second.getAttribute('data-score'))
                return scoreSecond - scoreFirst
            })
            //removes old elements
            childDivs.forEach(div => {
                parentDiv.removeChild(div)
            })
            //adds sorted elements
            childDivs.forEach(div => {
                parentDiv.appendChild(div)
            })

            // if a player already exists
            frontEndPlayers[id].x = backEndPlayer.x
            frontEndPlayers[id].y = backEndPlayer.y
        }
    }
    // deleting front end players
    for (const id in frontEndPlayers) {
        if (!backEndPlayers[id]) {
            delete frontEndPlayers[id]
            const divToDelete = document.querySelector(`div[data-id="${id}"]`)
            divToDelete.parentNode.removeChild(divToDelete)
        }
    }
})
}

function animateMultiplayer() {
    multiplayerAnimationID = requestAnimationFrame(animateMultiplayer)
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
    document.querySelector('#displayLeaderboard').style.display = 'block'
    connectServer()
    updatePlayers()
    updateProjectiles()
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
    if (!frontEndPlayers[socket.id]) return
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