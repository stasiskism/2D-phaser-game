class Player {
    constructor({x, y, radius, color}) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = {
            x: 0,
            y: 0
        }
    }
    drawPlayer() {
        context.beginPath() 
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
    }
    update() {
        this.y += this.velocity.y
        this.x += this.velocity.x
    }
    }