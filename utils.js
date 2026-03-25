let keys = { ArrowLeft: false, ArrowRight: false };
let pauseCallback = null;

export function getKeys() {
    return keys;
}

export function initControls(onPause, onResume) {
    pauseCallback = { onPause, onResume };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') keys.ArrowLeft = true;
        if (e.key === 'ArrowRight') keys.ArrowRight = true;
        if (e.key === 'p' || e.key === 'P') {
            if (pauseCallback) {
                // Llamar a la función correspondiente según el estado actual
                // Nota: el estado real del juego se maneja en main, pero podemos invocar
                // un evento personalizado o simplemente llamar a los callbacks.
                // Usaremos un evento para que main decida.
                document.dispatchEvent(new CustomEvent('togglePause'));
            }
            e.preventDefault();
        }
    });
    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') keys.ArrowLeft = false;
        if (e.key === 'ArrowRight') keys.ArrowRight = false;
    });

    const leftBtn = document.getElementById('leftButton');
    const rightBtn = document.getElementById('rightButton');
    if (leftBtn) {
        leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys.ArrowLeft = true; });
        leftBtn.addEventListener('touchend', () => { keys.ArrowLeft = false; });
        leftBtn.addEventListener('mousedown', () => { keys.ArrowLeft = true; });
        leftBtn.addEventListener('mouseup', () => { keys.ArrowLeft = false; });
    }
    if (rightBtn) {
        rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys.ArrowRight = true; });
        rightBtn.addEventListener('touchend', () => { keys.ArrowRight = false; });
        rightBtn.addEventListener('mousedown', () => { keys.ArrowRight = true; });
        rightBtn.addEventListener('mouseup', () => { keys.ArrowRight = false; });
    }
}
