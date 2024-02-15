const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const modelRestartEl = document.querySelector('#modelRestartEl')
const modelScoreEl = document.querySelector('#modelScoreEl')
const buttonRestartEl = document.querySelector('#buttonRestartEl')
const buttonStartSingleplayerEl = document.querySelector('#buttonStartSingleplayerEl')
const modelStartEl = document.querySelector('#modelStartEl')

const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
    up: {
        pressed: false
    },
    down: {
        pressed: false
    }
}

const friction = 0.99
const x = canvas.width / 2
const y = canvas.height /2

const player = new Player(x, y, 30, 'pink')
const projectiles = []
const enemies = []
const particles = []
let animationID
let intervalID
let score = 0

function restart() {
    player
    projectiles
    enemies 
    particles
    animationID
    score = 0
    scoreEl.innerHTML = 0
}

function spawnEnemies() {
    intervalID = setInterval(() => {
        const radius = Math.random() * (30 - 6) + 6

        let x
        let y
        // for spawning from different directions and on the borders of the page
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        // an angle for the velocity
        const angle = Math.atan2(
            player.y - y,
            player.x - x
        )
        // enemy direction
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000)
}

//AnimationID for stopping the game when player dies

function animateSingleplayer() {
    animationID = requestAnimationFrame(animateSingleplayer)
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
    player.drawPlayer()
    player.update()
    

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
  


    // particle dissapearence
    for (let particleIndex = particles.length - 1; particleIndex >= 0; particleIndex--) {
        const particle = particles[particleIndex]
        if (particle.alpha <= 0) {
            particles.splice(particleIndex, 1)
        } else {
        particle.update()
        }
    }

    // deletion of projectiles when goes out of page border
    for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
        const projectile = projectiles[projectileIndex]
        projectile.update()

        
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            projectiles.splice(projectileIndex, 1) 
        }
    }

    for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
        const enemy = enemies[enemyIndex]
        enemy.update()
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        //player dies end game
        if (distance - player.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationID)
            clearInterval(intervalID)
            modelRestartEl.style.display = 'block'
            gsap.fromTo('#modelRestartEl', {scale: 0.8, opacity: 0}, {scale: 1, opacity: 1, ease: 'expo'})
            modelScoreEl.innerHTML = score
            }
        //enemy and projectile collision    
        for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
            const projectile = projectiles[projectileIndex]
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            
            if (distance - enemy.radius - projectile.radius < 1) {

            // score calculation
            score += 1
            scoreEl.innerHTML = score

            for (let i = 0; i < 8; i++) {
                particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color,
                    {x: (Math.random() - 0.5) * (Math.random() * 5),
                    y: (Math.random() - 0.5) * (Math.random() * 5)}))
            }
            
            enemies.splice(enemyIndex, 1)
            projectiles.splice(projectileIndex, 1)
           }
        }
    }
}

addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
    )

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(new Projectile(player.x, player.y, 5, 'red', velocity))
})

//RESTART GAME
buttonRestartEl.addEventListener('click', () => {
    restart()
    animateSingleplayer()
    spawnEnemies()
    gsap.to('#modelRestartEl', {
        opacity: 0,
        scale: 0.6,
        duration: 0.4,
        ease: 'expo.in',
        onComplete: () => {
            modelRestartEl.style.display = 'none'
        }
    })
})
//Start singleplayer
buttonStartSingleplayerEl.addEventListener('click', () => {
    restart()
    animateSingleplayer()
    spawnEnemies()
    //modelStartEl.style.display = 'none'
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

addEventListener('keydown', ({key}) => {
    switch (key) {
        case ('a') :
            console.log('left')
            keys.left.pressed = true
            break
        case 'd':
            console.log('right')
            keys.right.pressed = true
            break
        case 'w':
            console.log('up')
            keys.up.pressed = true
            break
        case 's':
            console.log('down')
            keys.down.pressed = true
            break
    }
})
addEventListener('keyup', ({key}) => {
    switch (key) {
        case ('a') :
            console.log('left')
            keys.left.pressed = false
            break
        case 'd':
            console.log('right')
            keys.right.pressed = false
            break
        case 'w':
            console.log('up')
            keys.up.pressed = false
            break
        case 's':
            console.log('down')
            keys.down.pressed = false
            break
    }
})
