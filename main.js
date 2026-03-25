import { Player } from './player.js';
import { FallingObj } from './fallingObject.js';
import { 
    initUI, showDamageFlash, showBoostMessage, updateUI, updateIntensityUI,
    updateGameDifficulty, generateItemsListUI, loadHighScoreStorage,
    uiElements
} from './utils.js';

// Variables globales del juego
let canvas, ctx;
let canvasWidth = 0, canvasHeight = 0;
let gameState = 'START'; // START, PLAYING, PAUSED, GAME_OVER
let player = null;
let fallingObjects = [];
let spawnTimer = 0, spawnRate = 80;
let gameTime = 0;
let objectsPerSpawn = 1;
let gameIntensity = 1.0;
let keys = { ArrowLeft: false, ArrowRight: false };
let highScore = { score: 0, intensity: 1.0, time: 0, date: null };

// Funciones de actualización del juego
function updateGameDifficultyWrapper() {
    const result = updateGameDifficulty(
        player, gameIntensity,
        (newIntensity) => { gameIntensity = newIntensity; },
        (newRate) => { spawnRate = newRate; },
        (newCount) => { objectsPerSpawn = newCount; }
    );
    if (result !== gameIntensity) gameIntensity = result;
}

function spawnObject() {
    let badProb = Math.min(0.2 + gameIntensity * 0.06, 0.65);
    for (let i = 0; i < objectsPerSpawn; i++) {
        let type = Math.random() < badProb ? 'bad' : 'good';
        fallingObjects.push(new FallingObj(type, gameIntensity, canvasWidth, canvasHeight));
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
                if (Math.random() < 0.18) player.applySpeedBoost(showBoostMessage);
            } else {
                player.takeDamage(Math.abs(obj.value), showDamageFlash);
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
    updateGameDifficultyWrapper();
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
    let finalScoreVal = player.score;
    let finalIntensityVal = gameIntensity;
    let finalTimeVal = gameTime;
    uiElements.finalScore.textContent = finalScoreVal;
    uiElements.finalIntensity.textContent = finalIntensityVal.toFixed(1) + 'x';
    let mins = Math.floor(finalTimeVal / 3600);
    let secs = Math.floor((finalTimeVal % 3600) / 60);
    uiElements.finalTime.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    let isNew = false;
    if (finalScoreVal > highScore.score) {
        highScore = { score: finalScoreVal, intensity: finalIntensityVal, time: finalTimeVal, date: new Date().toISOString() };
        localStorage.setItem('fitFrenzyHigh', JSON.stringify(highScore));
        isNew = true;
    }
    let recordMins = Math.floor(highScore.time / 3600);
    let recordSecs = Math.floor((highScore.time % 3600) / 60);
    uiElements.recordScore.textContent = highScore.score;
    uiElements.recordDetails.innerHTML = `Intensidad: ${highScore.intensity.toFixed(1)}x | Tiempo: ${recordMins.toString().padStart(2, '0')}:${recordSecs.toString().padStart(2, '0')}`;
    if (isNew) uiElements.newRecordMessage.style.display = 'block';
    else uiElements.newRecordMessage.style.display = 'none';
    uiElements.gameOverScreen.classList.remove('hidden');
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
    updateUI(player, gameTime);
    updateIntensityUI(gameIntensity);
    uiElements.startScreen.classList.add('hidden');
    uiElements.pauseScreen.classList.add('hidden');
    uiElements.gameOverScreen.classList.add('hidden');
}

function pauseGame() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        uiElements.pauseScreen.classList.remove('hidden');
    }
}

function resumeGame() {
    if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        uiElements.pauseScreen.classList.add('hidden');
    }
}

function menuPrincipal() {
    gameState = 'START';
    uiElements.startScreen.classList.remove('hidden');
    uiElements.pauseScreen.classList.add('hidden');
    uiElements.gameOverScreen.classList.add('hidden');
}

function resetHighScoreConfirm() {
    if (confirm('¿Reiniciar récord permanentemente?')) {
        highScore = { score: 0, intensity: 1.0, time: 0, date: null };
        localStorage.setItem('fitFrenzyHigh', JSON.stringify(highScore));
        // Actualizar UI de inicio
        uiElements.startRecordScore.innerText = '0';
        uiElements.startRecordDetails.innerHTML = `Intensidad: 1.0x | Tiempo: 00:00`;
        // También actualizar en gameOver si está visible?
    }
}

function resizeAndAdapt() {
    const container = document.getElementById('gameContainer');
    canvasWidth = container.clientWidth;
    canvasHeight = container.clientHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    if (player) {
        player.setCanvasSize(canvasWidth, canvasHeight);
        player.reset();
    }
}

function initControls() {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') keys.ArrowLeft = true;
        if (e.key === 'ArrowRight') keys.ArrowRight = true;
        if (e.key === 'p' || e.key === 'P') {
            if (gameState === 'PLAYING') pauseGame();
            else if (gameState === 'PAUSED') resumeGame();
            e.preventDefault();
        }
    });
    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') keys.ArrowLeft = false;
        if (e.key === 'ArrowRight') keys.ArrowRight = false;
    });
    const leftBtn = document.getElementById('leftButton');
    const rightBtn = document.getElementById('rightButton');
    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys.ArrowLeft = true; });
    leftBtn.addEventListener('touchend', () => { keys.ArrowLeft = false; });
    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys.ArrowRight = true; });
    rightBtn.addEventListener('touchend', () => { keys.ArrowRight = false; });
    leftBtn.addEventListener('mousedown', () => keys.ArrowLeft = true);
    leftBtn.addEventListener('mouseup', () => keys.ArrowLeft = false);
    rightBtn.addEventListener('mousedown', () => keys.ArrowRight = true);
    rightBtn.addEventListener('mouseup', () => keys.ArrowRight = false);
}

function animate() {
    if (gameState === 'PLAYING') {
        if (keys.ArrowLeft) player.move('left');
        if (keys.ArrowRight) player.move('right');
        gameLoopUpdate();
        drawGame();
        updateUI(player, gameTime);
    } else {
        drawGame(); // Mantener canvas actualizado en otros estados
    }
    requestAnimationFrame(animate);
}

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    initUI();
    resizeAndAdapt();
    player = new Player(canvasWidth, canvasHeight);
    loadHighScoreStorage((hs) => { highScore = hs; });
    generateItemsListUI();
    initControls();

    // Eventos de botones
    document.getElementById('startButton').onclick = startNewGame;
    document.getElementById('resumeButton').onclick = resumeGame;
    document.getElementById('restartButton').onclick = startNewGame;
    document.getElementById('playAgainButton').onclick = startNewGame;
    document.getElementById('menuButton').onclick = menuPrincipal;
    document.getElementById('menuButton2').onclick = menuPrincipal;
    document.getElementById('resetRecordButton').onclick = resetHighScoreConfirm;
    window.addEventListener('resize', () => {
        resizeAndAdapt();
        if (player && gameState !== 'PLAYING') player.reset();
    });

    animate();
}

// Iniciar cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', init);
