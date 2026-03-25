// Elementos del DOM que se actualizan con frecuencia
let uiElements = {};

export function setUIElements(elements) {
    uiElements = elements;
}

// Actualiza la barra de salud y el texto
export function updateHealthBarUI(health, maxHealth) {
    if (!uiElements.healthFill || !uiElements.healthText) return;
    const percent = (health / maxHealth) * 100;
    uiElements.healthFill.style.width = percent + '%';
    uiElements.healthText.textContent = Math.floor(percent) + '%';
}

// Actualiza el marcador y el tiempo
export function updateUI(score, gameTime) {
    if (uiElements.score) uiElements.score.textContent = score;
    if (uiElements.time) {
        const mins = Math.floor(gameTime / 3600);
        const secs = Math.floor((gameTime % 3600) / 60);
        uiElements.time.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// Actualiza la intensidad visual
export function updateIntensityUI(intensity) {
    if (uiElements.intensity) uiElements.intensity.textContent = intensity.toFixed(1) + 'x';
    if (uiElements.intensityFill) {
        const percent = Math.min(100, (intensity - 1) / 4 * 100);
        uiElements.intensityFill.style.width = percent + '%';
    }
}

// Efecto de flash rojo al recibir daño
export function showDamageFlash() {
    const damageEffect = document.getElementById('damageEffect');
    if (damageEffect) {
        damageEffect.style.opacity = '0.5';
        setTimeout(() => damageEffect.style.opacity = '0', 180);
    }
}

// Mensaje de boost
export function showBoostMessage() {
    const indicator = document.getElementById('boostIndicator');
    if (indicator) {
        indicator.style.display = 'block';
        setTimeout(() => indicator.style.display = 'none', 1200);
    }
}

// Cargar récord desde localStorage
export function loadHighScore() {
    let highScore = { score: 0, intensity: 1.0, time: 0, date: null };
    try {
        const saved = localStorage.getItem('fitFrenzyHigh');
        if (saved) highScore = JSON.parse(saved);
    } catch (e) {}
    return highScore;
}

// Guardar récord
export function saveHighScore(highScore) {
    localStorage.setItem('fitFrenzyHigh', JSON.stringify(highScore));
}

// Actualizar la pantalla de inicio con el récord
export function updateStartScreenRecord(highScore) {
    const startRecordScore = document.getElementById('startRecordScore');
    const startRecordDetails = document.getElementById('startRecordDetails');
    if (startRecordScore) startRecordScore.innerText = highScore.score;
    if (startRecordDetails) {
        const mins = Math.floor(highScore.time / 3600);
        const secs = Math.floor((highScore.time % 3600) / 60);
        startRecordDetails.innerHTML = `Intensidad: ${highScore.intensity.toFixed(1)}x | Tiempo: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}
