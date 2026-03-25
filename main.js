let keys = {};

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function gameLoop() {
    if(keys["ArrowLeft"]) player.move("left");
    if(keys["ArrowRight"]) player.move("right");

    updateGame();
    drawGame();
    updateUI(player);

    requestAnimationFrame(gameLoop);
}

document.getElementById("startButton").onclick = () => {
    initGame();
    setInterval(spawnObject, 1000);
    gameLoop();
};
