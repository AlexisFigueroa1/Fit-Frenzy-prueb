import { updateStartScreenRecord, loadHighScore, saveHighScore } from './utils.js';

let screens = {
    start: document.getElementById('startScreen'),
    pause: document.getElementById('pauseScreen'),
    gameOver: document.getElementById('gameOverScreen')
};

export function showStartScreen() {
    if (screens.start) screens.start.classList.remove('hidden');
    if (screens.pause) screens.pause.classList.add('hidden');
    if (screens.gameOver) screens.gameOver.classList.add('hidden');
    // Actualizar récord en inicio
    const highScore = loadHighScore();
    updateStartScreenRecord(highScore);
}

export function showPauseScreen() {
    if (screens.pause) screens.pause.classList.remove('hidden');
}

export function hidePauseScreen() {
    if (screens.pause) screens.pause.classList.add('hidden');
}

export function showGameOverScreen(finalScore, finalIntensity, finalTime, highScore, isNewRecord) {
    if (!screens.gameOver) return;
    const finalScoreSpan = document.getElementById('finalScore');
    const finalIntensitySpan = document.getElementById('finalIntensity');
    const finalTimeSpan = document.getElementById('finalTime');
    const recordScoreSpan = document.getElementById('recordScore');
    const recordDetailsSpan = document.getElementById('recordDetails');
    const newRecordDiv = document.getElementById('newRecordMessage');

    if (finalScoreSpan) finalScoreSpan.textContent = finalScore;
    if (finalIntensitySpan) finalIntensitySpan.textContent = finalIntensity.toFixed(1) + 'x';
    if (finalTimeSpan) {
        const mins = Math.floor(finalTime / 3600);
        const secs = Math.floor((finalTime % 3600) / 60);
        finalTimeSpan.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    if (recordScoreSpan) recordScoreSpan.textContent = highScore.score;
    if (recordDetailsSpan) {
        const mins = Math.floor(highScore.time / 3600);
        const secs = Math.floor((highScore.time % 3600) / 60);
        recordDetailsSpan.innerHTML = `Intensidad: ${highScore.intensity.toFixed(1)}x | Tiempo: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    if (newRecordDiv) {
        newRecordDiv.style.display = isNewRecord ? 'block' : 'none';
    }
    screens.gameOver.classList.remove('hidden');
}

export function initMenuButtons(onStart, onRestart, onMenu, onResetRecord) {
    const startBtn = document.getElementById('startButton');
    const resetRecordBtn = document.getElementById('resetRecordButton');
    const resumeBtn = document.getElementById('resumeButton');
    const restartBtn = document.getElementById('restartButton');
    const menuBtn = document.getElementById('menuButton');
    const playAgainBtn = document.getElementById('playAgainButton');
    const menuBtn2 = document.getElementById('menuButton2');

    if (startBtn) startBtn.onclick = () => onStart();
    if (resetRecordBtn) resetRecordBtn.onclick = () => {
        if (confirm('¿Reiniciar récord permanentemente?')) {
            const emptyRecord = { score: 0, intensity: 1.0, time: 0, date: null };
            saveHighScore(emptyRecord);
            updateStartScreenRecord(emptyRecord);
            if (onResetRecord) onResetRecord(emptyRecord);
        }
    };
    if (resumeBtn) resumeBtn.onclick = () => onRestart(); // resume
    if (restartBtn) restartBtn.onclick = () => onRestart(); // restart
    if (menuBtn) menuBtn.onclick = () => onMenu();
    if (playAgainBtn) playAgainBtn.onclick = () => onRestart();
    if (menuBtn2) menuBtn2.onclick = () => onMenu();

    // Escuchar el evento de pausa desde los controles
    document.addEventListener('togglePause', () => {
        // La lógica de pausa se maneja en main mediante callbacks
        // Notificamos mediante un evento personalizado que main escuchará
        document.dispatchEvent(new CustomEvent('requestPauseToggle'));
    });
}
