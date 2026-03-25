export class Player {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.updateDimensions();
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - this.height - 20;
        this.speed = Math.max(7, canvasWidth * 0.025);
        this.color = '#4682b4';
        this.score = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.speedBoost = 0;
        this.boostTime = 0;
        this.armOffset = 0;
    }

    updateDimensions() {
        this.width = Math.max(70, Math.min(110, this.canvasWidth * 0.18));
        this.height = Math.max(35, this.canvasHeight * 0.07);
        this.speed = Math.max(7, this.canvasWidth * 0.025);
    }

    update(t) {
        this.armOffset = Math.sin(t * 0.008) * 6;
        if (this.boostTime > 0) {
            this.boostTime--;
            if (this.boostTime === 0) this.speedBoost = 0;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y - 12, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(this.x + 8, this.y + 12);
        ctx.lineTo(this.x - 15, this.y + 12 + this.armOffset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x + this.width - 8, this.y + 12);
        ctx.lineTo(this.x + this.width + 15, this.y + 12 - this.armOffset);
        ctx.stroke();
        if (this.speedBoost > 0) {
            ctx.fillStyle = '#ffff99';
            ctx.beginPath();
            ctx.arc(this.x + 12, this.y + 8, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    move(dir) {
        let moveSpeed = this.speed + this.speedBoost;
        if (dir === 'left') this.x -= moveSpeed;
        else if (dir === 'right') this.x += moveSpeed;
        if (this.x < 0) this.x = 0;
        if (this.x > this.canvasWidth - this.width) this.x = this.canvasWidth - this.width;
    }

    applySpeedBoost(showBoostMessage) {
        this.speedBoost = 6;
        this.boostTime = 150;
        showBoostMessage();
    }

    takeDamage(amount, showDamageFlash) {
        this.health = Math.max(0, this.health - amount);
        showDamageFlash();
    }

    getBounds() {
        return { x: this.x - 5, y: this.y - 5, width: this.width + 10, height: this.height + 10 };
    }

    reset() {
        this.updateDimensions();
        this.x = this.canvasWidth / 2 - this.width / 2;
        this.y = this.canvasHeight - this.height - 20;
        this.score = 0;
        this.health = this.maxHealth;
        this.speedBoost = 0;
        this.boostTime = 0;
    }

    setCanvasSize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.updateDimensions();
        this.reset(); // reajustar posición
    }
}
