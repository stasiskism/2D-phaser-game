const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    drawPlayer() {
        context.beginPath() 
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    drawProjectile() {
        context.beginPath() 
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
    }

    update() {
        this.drawProjectile()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    drawEnemy() {
        context.beginPath() 
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
    }

    update() {
        this.drawEnemy()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    drawParticle() {
        context.save()
        // fades away hit particles
        context.globalAlpha = this.alpha
        context.beginPath() 
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
        context.restore()
    }

    update() {
        this.drawParticle()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height /2

const player = new Player(x, y, 30, 'pink')

const projectiles = []

const enemies = []

const particles = []

function spawnEnemies() {
    setInterval(() => {
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
            canvas.height / 2 - y,
            canvas.width / 2 - x
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
let animationID
let score = 0
function animate() {
    animationID = requestAnimationFrame(animate)
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
    player.drawPlayer()

    // particle dissapearence
    for (let particleIndex = particles.length - 1; particleIndex >= 0; particleIndex--) {
        const particle = particles[particleIndex]
        if (particle.alpha <= 0) {
            particles.splice(particleIndex, 1)
        } else {
        particle.update()
        }
    }

    for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
        const projectile = projectiles[projectileIndex]
        projectile.update()

        // deletion of projectiles when goes out of page border
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
            }
        for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
            const projectile = projectiles[projectileIndex]
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            //enemy and projectile collision
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
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    )

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'red', velocity))
    
})

animate()
spawnEnemies()