const ui = {
    score: document.getElementById("score")
};

function updateUI(player) {
    ui.score.textContent = player.score;
}
