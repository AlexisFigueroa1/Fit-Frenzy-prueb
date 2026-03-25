import { GameItems } from './constants.js';

export class FallingObj {
    constructor(type, intensity, canvasWidth, canvasHeight) {
        this.type = type;
        const list = type === 'good' ? GameItems.good : GameItems.bad;
        const baseItem = list[Math.floor(Math.random() * list.length)];
        this.id = baseItem.id;
        this.name = baseItem.name;
        this.color = baseItem.color;
        this.value = baseItem.value;
        this.shape = baseItem.shape;
        
        // Escala dinámica basada en el ancho del canvas
        const scale = Math.min(1, canvasWidth / 420);
        let baseSize = (type === 'good' ? 28 : 30) * Math.min(1.1, scale + 0.7);
        this.size = Math.max(22, Math.min(baseSize, canvasWidth * 0.12));
        this.x = Math.random() * (canvasWidth - this.size - 20) + 10;
        this.y = -this.size;
        this.speed = (Math.random() * 2 + 2.2) * intensity;
        this.rotation = 0;
        this.rotSpeed = (Math.random() - 0.5) * 0.1;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.02;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotSpeed;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.8;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.type === 'good' ? 8 : 2;
        ctx.shadowColor = this.color;
        const half = this.size / 2;
        switch (this.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, half, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'square':
                ctx.fillRect(-half, -half, this.size, this.size);
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(0, -half);
                ctx.lineTo(-half, half);
                ctx.lineTo(half, half);
                ctx.fill();
                break;
            case 'diamond':
                ctx.beginPath();
                ctx.moveTo(0, -half);
                ctx.lineTo(half, 0);
                ctx.lineTo(0, half);
                ctx.lineTo(-half, 0);
                ctx.fill();
                break;
        }
        if (this.type === 'bad') {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-half / 1.5, -half / 1.5);
            ctx.lineTo(half / 1.5, half / 1.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(half / 1.5, -half / 1.5);
            ctx.lineTo(-half / 1.5, half / 1.5);
            ctx.stroke();
        } else {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(-half / 2.5, -half / 2.5, half / 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.size, height: this.size };
    }

    isOffScreen() {
        return this.y > this.canvasHeight + this.size;
    }
}
