class FallingObj {
    constructor(type, canvasWidth) {
        this.type = type;
        this.size = 30;
        this.x = Math.random() * (canvasWidth - this.size);
        this.y = -this.size;
        this.speed = 3;
    }

    update() {
        this.y += this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = this.type === "good" ? "green" : "red";
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}
