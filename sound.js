let audioCtx = null;
let initialized = false;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playTone(frequency, duration, volume = 0.3) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start();
    osc.stop(now + duration);
}

export function playCollectGood() {
    if (!audioCtx) return;
    playTone(880, 0.1, 0.2);
}

export function playCollectBad() {
    if (!audioCtx) return;
    playTone(220, 0.2, 0.25);
}

export function playBoost() {
    if (!audioCtx) return;
    playTone(1200, 0.08, 0.25);
    setTimeout(() => playTone(1500, 0.08, 0.25), 80);
}

export function playDamage() {
    if (!audioCtx) return;
    playTone(150, 0.3, 0.35);
}

export function playGameOver() {
    if (!audioCtx) return;
    playTone(300, 0.2, 0.3);
    setTimeout(() => playTone(200, 0.3, 0.3), 200);
    setTimeout(() => playTone(100, 0.5, 0.3), 400);
}

export function enableAudio() {
    if (!initialized) {
        initAudio();
        initialized = true;
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }
}
