class Player {
    constructor(canvasWidth, canvasHeight) {
        this.width = 80;
        this.height = 40;
        this.x = canvasWidth / 2;
        this.y = canvasHeight - 60;
        this.speed = 8;
        this.score = 0;
    }

    move(dir) {
        if(dir === "left") this.x -= this.speed;
        if(dir === "right") this.x += this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = "cyan";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
