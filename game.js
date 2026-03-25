let canvas, ctx;
let player;
let objects = [];

function initGame() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;

    player = new Player(canvas.width, canvas.height);
}

function spawnObject() {
    let type = Math.random() < 0.7 ? "good" : "bad";
    objects.push(new FallingObj(type, canvas.width));
}

function updateGame() {
    objects.forEach(obj => obj.update());
}

function drawGame() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    player.draw(ctx);
    objects.forEach(obj => obj.draw(ctx));
}
