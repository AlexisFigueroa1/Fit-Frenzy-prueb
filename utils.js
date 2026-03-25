// Referencias a elementos DOM (se inicializan desde main)
export let uiElements = {};

export function initUI() {
    uiElements = {
        score: document.getElementById('score'),
        intensity: document.getElementById('intensity'),
        time: document.getElementById('time'),
        healthFill: document.getElementById('healthFill'),
        healthText: document.getElementById('healthText'),
        boostIndicator: document.getElementById('boostIndicator'),
        damageEffect: document.getElementById('damageEffect'),
        startScreen: document.getElementById('startScreen'),
        pauseScreen: document.getElementById('pauseScreen'),
        gameOverScreen: document.getElementById('gameOverScreen'),
        finalScore: document.getElementById('finalScore'),
        finalIntensity: document.getElementById('finalIntensity'),
        finalTime: document.getElementById('finalTime'),
        recordScore: document.getElementById('recordScore'),
        recordDetails: document.getElementById('recordDetails'),
        newRecordMessage: document.getElementById('newRecordMessage'),
        intensityFill: document.getElementById('intensityFill'),
        startRecordScore: document.getElementById('startRecordScore'),
        startRecordDetails: document.getElementById('startRecordDetails')
    };
}

export function showDamageFlash() {
    uiElements.damageEffect.style.opacity = '0.5';
    setTimeout(() => uiElements.damageEffect.style.opacity = '0', 180);
}

export function showBoostMessage() {
    uiElements.boostIndicator.style.display = 'block';
    setTimeout(() => uiElements.boostIndicator.style.display = 'none', 1200);
}

export function updateHealthBarUI(player) {
    let percent = (player.health / player.maxHealth) * 100;
    uiElements.healthFill.style.width = percent + '%';
    uiElements.healthText.textContent = Math.floor(percent) + '%';
}

export function updateUI(player, gameTime) {
    uiElements.score.textContent = player.score;
    let mins = Math.floor(gameTime / 3600);
    let secs = Math.floor((gameTime % 3600) / 60);
    uiElements.time.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    updateHealthBarUI(player);
}

export function updateIntensityUI(gameIntensity) {
    uiElements.intensity.textContent = gameIntensity.toFixed(1) + 'x';
    let percent = Math.min(100, ((gameIntensity - 1) / 4) * 100);
    uiElements.intensityFill.style.width = percent + '%';
}

export function updateGameDifficulty(player, gameIntensity, setGameIntensity, setSpawnRate, setObjectsPerSpawn) {
    let target = 1.0 + Math.floor(player.score / 100) * 0.1;
    if (target > gameIntensity) {
        let newIntensity = Math.min(target, gameIntensity + 0.003);
        setGameIntensity(newIntensity);
        updateIntensityUI(newIntensity);
        setSpawnRate(Math.max(42, Math.floor(85 / newIntensity)));
        setObjectsPerSpawn(Math.min(1 + Math.floor(newIntensity * 0.8), 4));
        return newIntensity;
    }
    return gameIntensity;
}

export function generateItemsListUI() {
    import('./constants.js').then(({ GameItems }) => {
        const goodDiv = document.getElementById('goodItemsList');
        const badDiv = document.getElementById('badItemsList');
        goodDiv.innerHTML = '';
        badDiv.innerHTML = '';
        GameItems.good.forEach(i => {
            goodDiv.innerHTML += `<div class="object-item"><span class="object-bullet" style="color:${i.color}">●</span><span>${i.name} (+${i.value}p)</span></div>`;
        });
        GameItems.bad.forEach(i => {
            badDiv.innerHTML += `<div class="object-item"><span class="object-bullet" style="color:${i.color}">●</span><span>${i.name} (${i.value} salud)</span></div>`;
        });
    });
}

// Cargar y mostrar récord desde localStorage
export function loadHighScoreStorage(setHighScore) {
    try {
        let saved = localStorage.getItem('fitFrenzyHigh');
        if (saved) {
            const highScore = JSON.parse(saved);
            setHighScore(highScore);
            uiElements.startRecordScore.innerText = highScore.score;
            let mins = Math.floor(highScore.time / 3600);
            let secs = Math.floor((highScore.time % 3600) / 60);
            uiElements.startRecordDetails.innerHTML = `Intensidad: ${highScore.intensity.toFixed(1)}x | Tiempo: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    } catch (e) { }
}
