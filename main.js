import { GameItems, populateItemsList } from './modules/items.js';
import { enableAudio, playCollectGood, playCollectBad, playBoost, playDamage, playGameOver } from './modules/sound.js';
import { setUIElements, updateHealthBarUI, updateUI, updateIntensityUI, showDamageFlash, showBoostMessage, loadHighScore, saveHighScore } from './modules/utils.js';
import { getKeys, initControls } from './modules/controls.js';
import { showStartScreen, showPauseScreen, hidePauseScreen, showGameOverScreen, initMenuButtons } from './modules/menu.js';

// --- Elementos del DOM ---
const uiElements = {
    score: document.getElementById('score'),
    intensity: document.getElementById('intensity'),
    time: document.getElementById('time'),
    healthFill: document.getElementById('healthFill'),
    healthText: document.getElementById('healthText'),
    intensityFill: document.getElementById('intensityFill')
};
setUIElements(uiElements);

// --- Variables globales del juego ---
let canvas, ctx;
let canvasWidth = 0, canvasHeight = 0;
let gameState = 'START'; // START, PLAYING, PAUSED, GAME_OVER
let player;
let fallingObjects = [];
let spawnTimer = 0, spawnRate = 80;
let gameTime = 0;
let objectsPerSpawn = 1;
let gameIntensity = 1.0;
let highScore = loadHighScore();

// --- Clase Player (igual que original) ---
class Player {
    constructor() {
        this.updateDimensions();
        this.x = canvasWidth/2 - this.width/2;
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
        this.width = Math.max(70, Math.min(110, canvasWidth * 0.18));
        this.height = Math.max(35, canvasHeight * 0.07);
        this.speed = Math.max(7, canvasWidth * 0.025);
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
        ctx.arc(this.x + this.width/2, this.y - 12, 16, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(this.x+8, this.y+12);
        ctx.lineTo(this.x-15, this.y+12+this.armOffset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x+this.width-8, this.y+12);
        ctx.lineTo(this.x+this.width+15, this.y+12-this.armOffset);
        ctx.stroke();
        if (this.speedBoost > 0) {
            ctx.fillStyle = '#ffff99';
            ctx.beginPath();
            ctx.arc(this.x+12, this.y+8, 8, 0, Math.PI*2);
            ctx.fill();
        }
    }
    move(dir) {
        let moveSpeed = this.speed + this.speedBoost;
        if (dir === 'left') this.x -= moveSpeed;
        else if (dir === 'right') this.x += moveSpeed;
        if (this.x < 0) this.x = 0;
        if (this.x > canvasWidth - this.width) this.x = canvasWidth - this.width;
    }
    applySpeedBoost() {
        this.speedBoost = 6;
        this.boostTime = 150;
        showBoostMessage();
        playBoost();
    }
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        showDamageFlash();
        playDamage();
    }
    getBounds() {
        return { x: this.x-5, y: this.y-5, width: this.width+10, height: this.height+10 };
    }
    reset() {
        this.updateDimensions();
        this.x = canvasWidth/2 - this.width/2;
        this.y = canvasHeight - this.height - 20;
        this.score = 0;
        this.health = this.maxHealth;
        this.speedBoost = 0;
        this.boostTime = 0;
    }
}

// --- Clase FallingObj (igual que original) ---
class FallingObj {
    constructor(type, intensity) {
        this.type = type;
        const list = type === 'good' ? GameItems.good : GameItems.bad;
        const baseItem = list[Math.floor(Math.random() * list.length)];
        this.id = baseItem.id;
        this.name = baseItem.name;
        this.color = baseItem.color;
        this.value = baseItem.value;
        this.shape = baseItem.shape;
        const scale = Math.min(1, canvasWidth / 420);
        let baseSize = (type === 'good' ? 28 : 30) * Math.min(1.1, scale + 0.7);
        this.size = Math.max(22, Math.min(baseSize, canvasWidth * 0.12));
        this.x = Math.random() * (canvasWidth - this.size - 20) + 10;
        this.y = -this.size;
        this.speed = (Math.random() * 2 + 2.2) * intensity;
        this.rotation = 0;
        this.rotSpeed = (Math.random() - 0.5) * 0.1;
        this.wobble = Math.random() * Math.PI*2;
        this.wobbleSpeed = 0.02;
    }
    update() {
        this.y += this.speed;
        this.rotation += this.rotSpeed;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.8;
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.size/2, this.y + this.size/2);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.type === 'good' ? 8 : 2;
        ctx.shadowColor = this.color;
        const half = this.size/2;
        switch(this.shape) {
            case 'circle': ctx.beginPath(); ctx.arc(0,0, half,0,Math.PI*2); ctx.fill(); break;
            case 'square': ctx.fillRect(-half, -half, this.size, this.size); break;
            case 'triangle': ctx.beginPath(); ctx.moveTo(0,-half); ctx.lineTo(-half, half); ctx.lineTo(half, half); ctx.fill(); break;
            case 'diamond': ctx.beginPath(); ctx.moveTo(0,-half); ctx.lineTo(half,0); ctx.lineTo(0,half); ctx.lineTo(-half,0); ctx.fill(); break;
        }
        if (this.type === 'bad') {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-half/1.5, -half/1.5); ctx.lineTo(half/1.5, half/1.5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(half/1.5, -half/1.5); ctx.lineTo(-half/1.5, half/1.5); ctx.stroke();
        } else {
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.arc(-half/2.5, -half/2.5, half/4, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    }
    getBounds() {
        return { x: this.x, y: this.y, width: this.size, height: this.size };
    }
    isOffScreen() {
        return this.y > canvasHeight + this.size;
    }
}

// --- Funciones del juego ---
function updateGameDifficulty() {
    let target = 1.0 + Math.floor(player.score / 100) * 0.1;
    if (target > gameIntensity) gameIntensity = Math.min(target, gameIntensity + 0.003);
    updateIntensityUI(gameIntensity);
    spawnRate = Math.max(42, Math.floor(85 / gameIntensity));
    objectsPerSpawn = Math.min(1 + Math.floor(gameIntensity * 0.8), 4);
}

function spawnObject() {
    let badProb = Math.min(0.2 + gameIntensity * 0.06, 0.65);
    for (let i = 0; i < objectsPerSpawn; i++) {
        let type = Math.random() < badProb ? 'bad' : 'good';
        fallingObjects.push(new FallingObj(type, gameIntensity));
    }
}

function checkCollisions() {
    for (let i = 0; i < fallingObjects.length; i++) {
        let obj = fallingObjects[i];
        let objBounds = obj.getBounds();
        let playerBounds = player.getBounds();
        if (objBounds.x < playerBounds.x + playerBounds.width &&
            objBounds.x + objBounds.width > playerBounds.x &&
            objBounds.y < playerBounds.y + playerBounds.height &&
            objBounds.y + objBounds.height > playerBounds.y) {
            if (obj.type === 'good') {
                player.score += obj.value;
                playCollectGood();
                if (Math.random() < 0.18) player.applySpeedBoost();
            } else {
                player.takeDamage(Math.abs(obj.value));
                playCollectBad();
                if (player.health <= 0) gameOver();
            }
            fallingObjects.splice(i, 1);
            i--;
        }
    }
}

function gameLoopUpdate() {
    if (gameState !== 'PLAYING') return;
    gameTime++;
    updateGameDifficulty();
    spawnTimer++;
    if (spawnTimer >= spawnRate) {
        spawnObject();
        spawnTimer = 0;
    }
    for (let i = 0; i < fallingObjects.length; i++) {
        fallingObjects[i].update();
        if (fallingObjects[i].isOffScreen()) {
            fallingObjects.splice(i, 1);
            i--;
        }
    }
    checkCollisions();
    if (player.health <= 0) gameOver();
    player.update(gameTime);
}

function drawGame() {
    if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    grad.addColorStop(0, '#0f0f25');
    grad.addColorStop(1, '#1a1a35');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    fallingObjects.forEach(obj => obj.draw(ctx));
    player.draw(ctx);
}

function gameOver() {
    if (gameState !== 'PLAYING') return;
    gameState = 'GAME_OVER';
    playGameOver();
    let finalScoreVal = player.score;
    let finalIntensityVal = gameIntensity;
    let finalTimeVal = gameTime;
    let isNew = false;
    if (finalScoreVal > highScore.score) {
        highScore = { score: finalScoreVal, intensity: finalIntensityVal, time: finalTimeVal, date: new Date().toISOString() };
        saveHighScore(highScore);
        isNew = true;
    }
    showGameOverScreen(finalScoreVal, finalIntensityVal, finalTimeVal, highScore, isNew);
}

function startNewGame() {
    gameState = 'PLAYING';
    fallingObjects = [];
    spawnTimer = 0;
    gameTime = 0;
    gameIntensity = 1.0;
    objectsPerSpawn = 1;
    spawnRate = 85;
    player.reset();
    player.score = 0;
    player.health = 100;
    updateHealthBarUI(player.health, player.maxHealth);
    updateUI(player.score, gameTime);
    updateIntensityUI(gameIntensity);
    hidePauseScreen();
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    enableAudio(); // Activa sonidos al iniciar juego
}

function pauseGame() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        showPauseScreen();
    }
}

function resumeGame() {
    if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        hidePauseScreen();
    }
}

function returnToMenu() {
    gameState = 'START';
    showStartScreen();
    // Reiniciar variables visuales
    if (player) player.reset();
    fallingObjects = [];
    document.getElementById('pauseScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
}

// --- Inicialización y resize ---
function resizeAndAdapt() {
    const container = document.getElementById('gameContainer');
    canvasWidth = container.clientWidth;
    canvasHeight = container.clientHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    if (player) {
        player.updateDimensions();
        player.x = Math.min(Math.max(player.x, 0), canvasWidth - player.width);
        player.y = canvasHeight - player.height - 20;
        player.speed = Math.max(7, canvasWidth * 0.025);
    }
}

function animate() {
    if (gameState === 'PLAYING') {
        const keys = getKeys();
        if (keys.ArrowLeft) player.move('left');
        if (keys.ArrowRight) player.move('right');
        gameLoopUpdate();
        drawGame();
        updateUI(player.score, gameTime);
        updateHealthBarUI(player.health, player.maxHealth);
    } else {
        drawGame(); // Mantiene el canvas en otros estados
    }
    requestAnimationFrame(animate);
}

// --- Arranque ---
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resizeAndAdapt();
    player = new Player();
    populateItemsList();
    initControls(pauseGame, resumeGame);
    initMenuButtons(startNewGame, startNewGame, returnToMenu, (newRecord) => { highScore = newRecord; });
    showStartScreen();
    window.addEventListener('resize', () => {
        resizeAndAdapt();
        if (player && gameState !== 'PLAYING') player.reset();
    });
    animate();
}

init();
