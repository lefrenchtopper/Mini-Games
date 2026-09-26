const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const speedElement = document.getElementById("speed");

const startOverlay = document.getElementById("startOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const finalScoreElement = document.getElementById("finalScore");


// ============================================================
// SETTINGS
// ============================================================

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const GROUND_Y = 335;

let gameRunning = false;

let score = 0;
let highScore = Number(
    localStorage.getItem("minihub_dino_highscore") || 0
);

let gameSpeed = 7;

let frame = 0;

let spawnTimer = 0;


// ============================================================
// DINO
// ============================================================

const dino = {

    x: 100,

    y: GROUND_Y - 58,

    width: 48,
    height: 58,

    velocityY: 0,

    gravity: 0.75,

    jumpForce: -14,

    grounded: true,

    runFrame: 0
};


// ============================================================
// OBSTACLES
// ============================================================

let obstacles = [];


// ============================================================
// CLOUDS
// ============================================================

let clouds = [
    {
        x: 150,
        y: 80,
        width: 80
    },
    {
        x: 500,
        y: 130,
        width: 100
    },
    {
        x: 820,
        y: 70,
        width: 75
    }
];


// ============================================================
// RESET
// ============================================================

function resetGame() {

    score = 0;

    gameSpeed = 7;

    frame = 0;

    spawnTimer = 0;

    obstacles = [];

    dino.y =
        GROUND_Y -
        dino.height;

    dino.velocityY = 0;

    dino.grounded = true;

    updateUI();
}


// ============================================================
// START
// ============================================================

function startGame() {

    resetGame();

    gameRunning = true;

    startOverlay.classList.add("hidden");

    gameOverOverlay.classList.add("hidden");
}


// ============================================================
// GAME OVER
// ============================================================

function endGame() {

    gameRunning = false;

    API.saveScore("dino", Math.floor(score));

    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "minihub_dino_highscore",
            highScore
        );
    }

    finalScoreElement.textContent =
        Math.floor(score);

    updateUI();

    gameOverOverlay.classList.remove(
        "hidden"
    );
}


// ============================================================
// JUMP
// ============================================================

function jump() {

    if (!gameRunning) {
        return;
    }

    if (dino.grounded) {

        dino.velocityY =
            dino.jumpForce;

        dino.grounded = false;
    }
}


// ============================================================
// UPDATE DINO
// ============================================================

function updateDino() {

    dino.velocityY +=
        dino.gravity;

    dino.y +=
        dino.velocityY;

    if (
        dino.y +
        dino.height >=
        GROUND_Y
    ) {

        dino.y =
            GROUND_Y -
            dino.height;

        dino.velocityY = 0;

        dino.grounded = true;
    }

    if (dino.grounded) {

        dino.runFrame =
            Math.floor(frame / 6) % 2;
    }
}


// ============================================================
// CREATE OBSTACLE
// ============================================================

function createObstacle() {

    const type =
        Math.random() < .75
            ? "cactus"
            : "double";

    let width;
    let height;

    if (type === "cactus") {

        width = 28;
        height = 55;

    } else {

        width = 55;
        height = 50;
    }

    obstacles.push({

        x: WIDTH + 30,

        y:
            GROUND_Y -
            height,

        width,
        height,

        type
    });
}


// ============================================================
// UPDATE OBSTACLES
// ============================================================

function updateObstacles() {

    spawnTimer--;

    if (spawnTimer <= 0) {

        createObstacle();

        const minimum =
            Math.max(
                55,
                105 -
                gameSpeed * 3
            );

        const maximum =
            Math.max(
                80,
                145 -
                gameSpeed * 2
            );

        spawnTimer =
            minimum +
            Math.random() *
            (maximum - minimum);
    }


    obstacles.forEach(
        obstacle => {

            obstacle.x -=
                gameSpeed;
        }
    );


    obstacles =
        obstacles.filter(
            obstacle =>
                obstacle.x +
                obstacle.width >
                -50
        );
}


// ============================================================
// COLLISION
// ============================================================

function checkCollision() {

    // Slightly smaller hitboxes make
    // gameplay fairer.

    const dinoBox = {

        x: dino.x + 8,

        y: dino.y + 6,

        width: dino.width - 16,

        height: dino.height - 8
    };


    for (
        const obstacle
        of obstacles
    ) {

        const obstacleBox = {

            x: obstacle.x + 4,

            y: obstacle.y + 3,

            width:
                obstacle.width - 8,

            height:
                obstacle.height - 3
        };


        if (

            dinoBox.x <
            obstacleBox.x +
            obstacleBox.width &&

            dinoBox.x +
            dinoBox.width >
            obstacleBox.x &&

            dinoBox.y <
            obstacleBox.y +
            obstacleBox.height &&

            dinoBox.y +
            dinoBox.height >
            obstacleBox.y

        ) {

            endGame();

            return;
        }
    }
}


// ============================================================
// SCORE
// ============================================================

function updateScore() {

    if (!gameRunning) {
        return;
    }

    score += 0.05;

    // Gradually increase speed

    gameSpeed =
        7 +
        Math.floor(score / 100) * 0.7;
}


// ============================================================
// CLOUDS
// ============================================================

function updateClouds() {

    clouds.forEach(
        cloud => {

            cloud.x -=
                gameSpeed * 0.15;

            if (
                cloud.x +
                cloud.width <
                0
            ) {

                cloud.x =
                    WIDTH +
                    Math.random() * 200;

                cloud.y =
                    50 +
                    Math.random() * 100;
            }
        }
    );
}


// ============================================================
// DRAW CLOUD
// ============================================================

function drawCloud(cloud) {

    ctx.fillStyle =
        "rgba(255,255,255,.07)";

    ctx.beginPath();

    ctx.arc(
        cloud.x,
        cloud.y,
        20,
        0,
        Math.PI * 2
    );

    ctx.arc(
        cloud.x + 25,
        cloud.y - 10,
        28,
        0,
        Math.PI * 2
    );

    ctx.arc(
        cloud.x + 55,
        cloud.y,
        20,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ============================================================
// DRAW GROUND
// ============================================================

function drawGround() {

    ctx.strokeStyle =
        "rgba(212,168,75,.35)";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
        0,
        GROUND_Y
    );

    ctx.lineTo(
        WIDTH,
        GROUND_Y
    );

    ctx.stroke();


    // Ground details

    ctx.strokeStyle =
        "rgba(255,255,255,.08)";

    ctx.lineWidth = 1;

    const offset =
        -(frame * gameSpeed * .5) % 80;

    for (
        let x = offset;
        x < WIDTH;
        x += 80
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            GROUND_Y + 12
        );

        ctx.lineTo(
            x + 35,
            GROUND_Y + 12
        );

        ctx.stroke();
    }
}


// ============================================================
// DRAW DINO
// ============================================================

function drawDino() {

    const x = dino.x;
    const y = dino.y;

    ctx.fillStyle =
        "#d4a84b";


    // Body

    ctx.fillRect(
        x + 8,
        y + 20,
        30,
        30
    );


    // Head

    ctx.fillRect(
        x + 23,
        y + 5,
        25,
        25
    );


    // Snout

    ctx.fillRect(
        x + 39,
        y + 18,
        15,
        12
    );


    // Tail

    ctx.beginPath();

    ctx.moveTo(
        x + 10,
        y + 25
    );

    ctx.lineTo(
        x - 8,
        y + 36
    );

    ctx.lineTo(
        x + 10,
        y + 38
    );

    ctx.fill();


    // Eye

    ctx.fillStyle =
        "#1c1a14";

    ctx.fillRect(
        x + 39,
        y + 10,
        4,
        4
    );


    // Legs

    ctx.fillStyle =
        "#d4a84b";

    if (dino.grounded) {

        if (dino.runFrame === 0) {

            ctx.fillRect(
                x + 13,
                y + 45,
                8,
                14
            );

            ctx.fillRect(
                x + 31,
                y + 48,
                8,
                11
            );

        } else {

            ctx.fillRect(
                x + 13,
                y + 48,
                8,
                11
            );

            ctx.fillRect(
                x + 31,
                y + 45,
                8,
                14
            );
        }

    } else {

        ctx.fillRect(
            x + 13,
            y + 47,
            8,
            11
        );

        ctx.fillRect(
            x + 30,
            y + 47,
            8,
            11
        );
    }
}


// ============================================================
// DRAW CACTUS
// ============================================================

function drawCactus(obstacle) {

    const x = obstacle.x;
    const y = obstacle.y;

    ctx.fillStyle =
        "#3d4a2a";


    if (
        obstacle.type ===
        "double"
    ) {

        // Left cactus

        ctx.fillRect(
            x + 8,
            y + 10,
            12,
            obstacle.height - 10
        );

        ctx.fillRect(
            x,
            y + 25,
            8,
            8
        );

        ctx.fillRect(
            x + 2,
            y + 18,
            6,
            20
        );


        // Right cactus

        ctx.fillRect(
            x + 28,
            y,
            13,
            obstacle.height
        );

        ctx.fillRect(
            x + 41,
            y + 20,
            8,
            8
        );

        ctx.fillRect(
            x + 41,
            y + 15,
            6,
            20
        );

    } else {

        ctx.fillRect(
            x + 9,
            y,
            12,
            obstacle.height
        );

        // Left arm

        ctx.fillRect(
            x,
            y + 22,
            9,
            8
        );

        ctx.fillRect(
            x,
            y + 17,
            7,
            15
        );

        // Right arm

        ctx.fillRect(
            x + 21,
            y + 30,
            8,
            8
        );

        ctx.fillRect(
            x + 22,
            y + 25,
            7,
            16
        );
    }
}


// ============================================================
// DRAW
// ============================================================

function draw() {

    ctx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    // Background

    ctx.fillStyle =
        "#11110e";

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    // Clouds

    clouds.forEach(
        drawCloud
    );


    // Ground

    drawGround();


    // Dino

    drawDino();


    // Obstacles

    obstacles.forEach(
        drawCactus
    );
}


// ============================================================
// UI
// ============================================================

function updateUI() {

    scoreElement.textContent =
        Math.floor(score);

    highScoreElement.textContent =
        Math.floor(highScore);

    speedElement.textContent =
        (gameSpeed / 7).toFixed(1) +
        "x";
}


// ============================================================
// GAME LOOP
// ============================================================

function gameLoop() {

    if (gameRunning) {

        frame++;

        updateDino();

        updateObstacles();

        updateClouds();

        updateScore();

        checkCollision();

        updateUI();
    }

    draw();

    requestAnimationFrame(
        gameLoop
    );
}


// ============================================================
// KEYBOARD
// ============================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.code === "Space" ||
            event.code === "ArrowUp"
        ) {

            event.preventDefault();

            if (!gameRunning) {

                if (
                    !startOverlay.classList.contains(
                        "hidden"
                    )
                ) {

                    startGame();

                } else if (
                    !gameOverOverlay.classList.contains(
                        "hidden"
                    )
                ) {

                    startGame();
                }

                return;
            }

            jump();
        }
    }
);

canvas.addEventListener(
    "pointerdown",
    () => {

        if (!gameRunning) {
            return;
        }

        jump();
    }
);
startBtn.addEventListener(
    "click",
    startGame
);

restartBtn.addEventListener(
    "click",
    startGame
);

updateUI();

draw();

gameLoop();