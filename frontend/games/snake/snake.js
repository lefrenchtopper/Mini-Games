// MINIHUB SNAKE

// CANVAS

const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");

// GAME SETTINGS

const gridSize = 20;

const columns = canvas.width / gridSize;

const rows = canvas.height / gridSize;

// GAME STATE

let snake;

let food;

let direction;

let nextDirection;

let score;

let bestScore = Number(localStorage.getItem("snakeBestScore") || 0);

let gameRunning = false;

let paused = false;

let gameLoop;

// ELEMENTS

const scoreElement = document.getElementById("score");

const topScoreElement = document.getElementById("topScore");

const bestScoreElement = document.getElementById("bestScore");

const lengthElement = document.getElementById("length");

const overlay = document.getElementById("gameOverlay");

const overlayTitle = document.getElementById("overlayTitle");

const overlayMessage = document.getElementById("overlayMessage");

const startButton = document.getElementById("startButton");

// INITIALIZE

function initializeGame() {
  snake = [
    { x: 15, y: 15 },
    { x: 14, y: 15 },
    { x: 13, y: 15 },
  ];

  food = {
    x: 20,
    y: 15,
  };
  placeFood();
  direction = "RIGHT";

  nextDirection = "RIGHT";

  score = 0;

  paused = false;

  updateUI();

  draw();
}

// START

function startGame() {
  initializeGame();

  gameRunning = true;

  overlay.classList.add("hidden");

  clearInterval(gameLoop);

  gameLoop = setInterval(updateGame, 100);
}

// UPDATE GAME

function updateGame() {
  if (!gameRunning || paused) {
    return;
  }

  direction = nextDirection;

  const head = {
    x: snake[0].x,
    y: snake[0].y,
  };

  // MOVE

  if (direction === "UP") {
    head.y--;
  } else if (direction === "DOWN") {
    head.y++;
  } else if (direction === "LEFT") {
    head.x--;
  } else if (direction === "RIGHT") {
    head.x++;
  }

  // WALL COLLISION

  if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows) {
    gameOver();

    return;
  }

  // SELF COLLISION

  const hitsSelf = snake.some(
    (segment) => segment.x === head.x && segment.y === head.y,
  );

  if (hitsSelf) {
    gameOver();

    return;
  }

  // ADD HEAD

  snake.unshift(head);

  // FOOD

  if (head.x === food.x && head.y === food.y) {
    score++;

    if (score > bestScore) {
      bestScore = score;

      localStorage.setItem("snakeBestScore", bestScore);
    }

    placeFood();
  } else {
    snake.pop();
  }

  updateUI();

  draw();
}

// FOOD

function placeFood() {
  let validPosition = false;

  while (!validPosition) {
    food = {
      x: Math.floor(Math.random() * columns),
      y: Math.floor(Math.random() * rows),
    };

    validPosition = !snake.some(
      (segment) => segment.x === food.x && segment.y === food.y,
    );
  }
}

// DRAW EVERYTHING

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  drawGrid();

  drawFood();

  drawSnake();
}

// BACKGROUND

function drawBackground() {
  ctx.fillStyle = "#0c0c0b";

  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// GRID

function drawGrid() {
  ctx.strokeStyle = "rgba(255,255,255,0.045)";

  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath();

    ctx.moveTo(x, 0);

    ctx.lineTo(x, canvas.height);

    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath();

    ctx.moveTo(0, y);

    ctx.lineTo(canvas.width, y);

    ctx.stroke();
  }
}

// DRAW SNAKE

function drawSnake() {
  snake.forEach((segment, index) => {
    const x = segment.x * gridSize;

    const y = segment.y * gridSize;

    if (index === 0) {
      // HEAD

      ctx.fillStyle = "#d4a84b";

      ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);

      // Eyes

      ctx.fillStyle = "#11110f";

      const eyeSize = 3;

      if (direction === "RIGHT") {
        ctx.fillRect(x + 13, y + 4, eyeSize, eyeSize);

        ctx.fillRect(x + 13, y + 13, eyeSize, eyeSize);
      } else if (direction === "LEFT") {
        ctx.fillRect(x + 4, y + 4, eyeSize, eyeSize);

        ctx.fillRect(x + 4, y + 13, eyeSize, eyeSize);
      } else if (direction === "UP") {
        ctx.fillRect(x + 4, y + 4, eyeSize, eyeSize);

        ctx.fillRect(x + 13, y + 4, eyeSize, eyeSize);
      } else {
        ctx.fillRect(x + 4, y + 13, eyeSize, eyeSize);

        ctx.fillRect(x + 13, y + 13, eyeSize, eyeSize);
      }
    } else {
      // BODY

      ctx.fillStyle = "#3d4a2a";

      ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
    }
  });
}

// DRAW FOOD

function drawFood() {
  const centerX = food.x * gridSize + gridSize / 2;

  const centerY = food.y * gridSize + gridSize / 2;

  ctx.beginPath();

  ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);

  ctx.fillStyle = "#c0392b";

  ctx.fill();

  // Small highlight

  ctx.beginPath();

  ctx.arc(centerX - 2, centerY - 2, 2, 0, Math.PI * 2);

  ctx.fillStyle = "rgba(255,255,255,0.45)";

  ctx.fill();
}

// CHANGE DIRECTION

function changeDirection(newDirection) {
  if (!gameRunning) {
    return;
  }

  if (newDirection === "UP" && direction !== "DOWN") {
    nextDirection = "UP";
  } else if (newDirection === "DOWN" && direction !== "UP") {
    nextDirection = "DOWN";
  } else if (newDirection === "LEFT" && direction !== "RIGHT") {
    nextDirection = "LEFT";
  } else if (newDirection === "RIGHT" && direction !== "LEFT") {
    nextDirection = "RIGHT";
  }
}

// KEYBOARD

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowUp") {
    event.preventDefault();

    changeDirection("UP");
  } else if (event.key === "ArrowDown") {
    event.preventDefault();

    changeDirection("DOWN");
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();

    changeDirection("LEFT");
  } else if (event.key === "ArrowRight") {
    event.preventDefault();

    changeDirection("RIGHT");
  }

  // SPACE = PAUSE
  else if (event.code === "Space") {
    event.preventDefault();

    togglePause();
  }

  // ESC = RESET
  else if (event.key === "Escape") {
    resetGame();
  }
});

// PAUSE

function togglePause() {
  if (!gameRunning) {
    return;
  }

  paused = !paused;

  if (paused) {
    overlayTitle.textContent = "PAUSED";

    overlayMessage.textContent = "Press SPACE to continue.";

    startButton.textContent = "RESUME";

    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
  }
}

// GAME OVER

function gameOver() {
  gameRunning = false;

  clearInterval(gameLoop);

  overlayTitle.textContent = "GAME OVER";

  overlayMessage.textContent = `Final score: ${score}`;

  startButton.textContent = "PLAY AGAIN";

  overlay.classList.remove("hidden");

  updateUI();

  saveScore();
}

// RESET

function resetGame() {
  gameRunning = false;

  clearInterval(gameLoop);

  initializeGame();

  overlayTitle.textContent = "SNAKE";

  overlayMessage.textContent = "Use the arrow keys to move.";

  startButton.textContent = "START GAME";

  overlay.classList.remove("hidden");
}

// UI

function updateUI() {
  scoreElement.textContent = score;

  topScoreElement.textContent = score;

  bestScoreElement.textContent = bestScore;

  lengthElement.textContent = snake.length;
}

// SAVE SCORE
//
// TEMPORARY.
//
// Later this becomes:
//
// POST /scores
//
// MongoDB will then store:
//
// username
// game = "snake"
// score
// timestamp
//

function saveScore() {
  const previousBest = Number(localStorage.getItem("snakeBestScore") || 0);

  API.saveScore("snake", score);

  if (score > previousBest) {
    localStorage.setItem("snakeBestScore", score);
  }

  console.log("Snake score:", score);
}
initializeGame();
