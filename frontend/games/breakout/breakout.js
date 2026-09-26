const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const levelElement = document.getElementById("level");

const startOverlay = document.getElementById("startOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const finalScoreElement = document.getElementById("finalScore");


// ============================================================
// GAME SETTINGS
// ============================================================

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let gameRunning = false;

let score = 0;
let lives = 3;
let level = 1;


// ============================================================
// PADDLE
// ============================================================

const paddle = {
    width: 130,
    height: 14,

    x: WIDTH / 2 - 65,
    y: HEIGHT - 45,

    speed: 9,

    dx: 0
};


// ============================================================
// BALL
// ============================================================

const ball = {
    x: WIDTH / 2,
    y: HEIGHT - 70,

    radius: 8,

    speed: 6,

    dx: 4,
    dy: -4
};


// ============================================================
// BRICKS
// ============================================================

let bricks = [];

const brickRows = 6;
const brickColumns = 10;

const brickWidth = 70;
const brickHeight = 22;

const brickPadding = 12;

const brickOffsetTop = 70;
const brickOffsetLeft = 35;


function createBricks() {

    bricks = [];

    for (let row = 0; row < brickRows; row++) {

        for (let column = 0; column < brickColumns; column++) {

            bricks.push({

                x:
                    brickOffsetLeft +
                    column * (brickWidth + brickPadding),

                y:
                    brickOffsetTop +
                    row * (brickHeight + brickPadding),

                width: brickWidth,
                height: brickHeight,

                alive: true,

                points: (brickRows - row) * 10
            });
        }
    }
}


// ============================================================
// DRAW BACKGROUND
// ============================================================

function drawBackground() {

    ctx.fillStyle = "#10100d";

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );

    // subtle grid

    ctx.strokeStyle = "rgba(255,255,255,0.025)";
    ctx.lineWidth = 1;

    for (let x = 0; x < WIDTH; x += 30) {

        ctx.beginPath();

        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);

        ctx.stroke();
    }

    for (let y = 0; y < HEIGHT; y += 30) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);

        ctx.stroke();
    }
}


// ============================================================
// DRAW PADDLE
// ============================================================

function drawPaddle() {

    ctx.fillStyle = "#d4a84b";

    ctx.fillRect(
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height
    );

    ctx.fillStyle = "#b8832a";

    ctx.fillRect(
        paddle.x,
        paddle.y,
        paddle.width,
        3
    );
}


// ============================================================
// DRAW BALL
// ============================================================

function drawBall() {

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";

    ctx.shadowColor = "#d4a84b";
    ctx.shadowBlur = 15;

    ctx.fill();

    ctx.shadowBlur = 0;
}


// ============================================================
// DRAW BRICKS
// ============================================================

function drawBricks() {

    bricks.forEach(brick => {

        if (!brick.alive) {
            return;
        }

        const gradient = ctx.createLinearGradient(
            brick.x,
            brick.y,
            brick.x,
            brick.y + brick.height
        );

        gradient.addColorStop(
            0,
            "#d4a84b"
        );

        gradient.addColorStop(
            1,
            "#8e641f"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            brick.x,
            brick.y,
            brick.width,
            brick.height
        );

        ctx.strokeStyle =
            "rgba(255,255,255,0.15)";

        ctx.strokeRect(
            brick.x,
            brick.y,
            brick.width,
            brick.height
        );
    });
}


// ============================================================
// RESET BALL
// ============================================================

function resetBall() {

    ball.x = WIDTH / 2;

    ball.y = HEIGHT - 70;

    ball.dx =
        (Math.random() > 0.5 ? 1 : -1) *
        (4 + level * 0.5);

    ball.dy =
        -(4 + level * 0.5);
}


// ============================================================
// RESET PADDLE
// ============================================================

function resetPaddle() {

    paddle.x =
        WIDTH / 2 -
        paddle.width / 2;
}


// ============================================================
// COLLISION: BRICKS
// ============================================================

function checkBrickCollision() {

    bricks.forEach(brick => {

        if (!brick.alive) {
            return;
        }

        if (
            ball.x + ball.radius > brick.x &&
            ball.x - ball.radius <
                brick.x + brick.width &&
            ball.y + ball.radius > brick.y &&
            ball.y - ball.radius <
                brick.y + brick.height
        ) {

            brick.alive = false;

            ball.dy *= -1;

            score += brick.points;

            updateStats();
        }
    });
}


// ============================================================
// COLLISION: PADDLE
// ============================================================

function checkPaddleCollision() {

    if (
        ball.x + ball.radius >= paddle.x &&
        ball.x - ball.radius <=
            paddle.x + paddle.width &&
        ball.y + ball.radius >= paddle.y &&
        ball.y - ball.radius <=
            paddle.y + paddle.height &&
        ball.dy > 0
    ) {

        const hitPosition =
            (ball.x - paddle.x) /
            paddle.width;

        const angle =
            (hitPosition - 0.5) * 2;

        const speed =
            Math.sqrt(
                ball.dx * ball.dx +
                ball.dy * ball.dy
            );

        ball.dx =
            angle * speed;

        ball.dy =
            -Math.abs(
                speed *
                Math.sqrt(
                    1 - angle * angle
                )
            );
    }
}


// ============================================================
// WALL COLLISION
// ============================================================

function checkWallCollision() {

    // left / right

    if (
        ball.x + ball.radius >= WIDTH ||
        ball.x - ball.radius <= 0
    ) {

        ball.dx *= -1;
    }

    // top

    if (
        ball.y - ball.radius <= 0
    ) {

        ball.dy *= -1;
    }
}


// ============================================================
// BALL FALLS
// ============================================================

function checkBallDeath() {

    if (
        ball.y - ball.radius >
        HEIGHT
    ) {

        lives--;

        updateStats();

        if (lives <= 0) {

            endGame();

            return;
        }

        resetBall();
        resetPaddle();
    }
}


// ============================================================
// CHECK LEVEL COMPLETE
// ============================================================

function checkLevelComplete() {

    const remaining =
        bricks.some(
            brick => brick.alive
        );

    if (!remaining) {

        level++;

        updateStats();

        createBricks();

        resetBall();
        resetPaddle();
    }
}


// ============================================================
// UPDATE
// ============================================================

function update() {

    if (!gameRunning) {
        return;
    }

    // paddle

    paddle.x += paddle.dx;

    if (paddle.x < 0) {

        paddle.x = 0;
    }

    if (
        paddle.x + paddle.width >
        WIDTH
    ) {

        paddle.x =
            WIDTH - paddle.width;
    }


    // ball

    ball.x += ball.dx;
    ball.y += ball.dy;


    checkWallCollision();

    checkPaddleCollision();

    checkBrickCollision();

    checkBallDeath();

    checkLevelComplete();
}


// ============================================================
// DRAW
// ============================================================

function draw() {

    drawBackground();

    drawBricks();

    drawPaddle();

    drawBall();
}


// ============================================================
// GAME LOOP
// ============================================================

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(
        gameLoop
    );
}


// ============================================================
// START
// ============================================================

function startGame() {

    score = 0;

    lives = 3;

    level = 1;

    gameRunning = true;

    updateStats();

    createBricks();

    resetBall();

    resetPaddle();

    startOverlay.classList.add(
        "hidden"
    );

    gameOverOverlay.classList.add(
        "hidden"
    );
}


// ============================================================
// GAME OVER
// ============================================================

function endGame() {

    gameRunning = false;

    API.saveScore("breakout", score);

    finalScoreElement.textContent =
        score;

    gameOverOverlay.classList.remove(
        "hidden"
    );
}


// ============================================================
// UPDATE UI
// ============================================================

function updateStats() {

    scoreElement.textContent =
        score;

    livesElement.textContent =
        lives;

    levelElement.textContent =
        level;
}


// ============================================================
// KEYBOARD
// ============================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "ArrowLeft"
        ) {

            paddle.dx =
                -paddle.speed;
        }

        if (
            event.key === "ArrowRight"
        ) {

            paddle.dx =
                paddle.speed;
        }
    }
);


document.addEventListener(
    "keyup",
    event => {

        if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight"
        ) {

            paddle.dx = 0;
        }
    }
);


// ============================================================
// MOUSE
// ============================================================

canvas.addEventListener(
    "mousemove",
    event => {

        const rect =
            canvas.getBoundingClientRect();

        const scaleX =
            WIDTH / rect.width;

        const mouseX =
            (event.clientX - rect.left) *
            scaleX;

        paddle.x =
            mouseX -
            paddle.width / 2;

        if (paddle.x < 0) {

            paddle.x = 0;
        }

        if (
            paddle.x + paddle.width >
            WIDTH
        ) {

            paddle.x =
                WIDTH - paddle.width;
        }
    }
);


// ============================================================
// BUTTONS
// ============================================================

startBtn.addEventListener(
    "click",
    startGame
);

restartBtn.addEventListener(
    "click",
    startGame
);


// ============================================================
// INITIALIZE
// ============================================================

createBricks();

draw();

gameLoop();