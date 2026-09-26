/* ==========================================
   MINIHUB WORDLE
========================================== */

const WORDS = [
    "APPLE",
    "BEACH",
    "BRAIN",
    "BRAVE",
    "BRICK",
    "CHAIR",
    "CHESS",
    "CLOUD",
    "CRANE",
    "DANCE",
    "DREAM",
    "DRIVE",
    "EARTH",
    "FLAME",
    "FRAME",
    "FRUIT",
    "GHOST",
    "GIANT",
    "GLASS",
    "GRAPE",
    "GREEN",
    "HEART",
    "HOUSE",
    "LIGHT",
    "MAGIC",
    "MANGO",
    "MONEY",
    "MOUSE",
    "MUSIC",
    "NIGHT",
    "OCEAN",
    "PAINT",
    "PARTY",
    "PEACH",
    "PIANO",
    "PLANT",
    "PLANE",
    "POWER",
    "QUEEN",
    "RADIO",
    "RIVER",
    "ROBOT",
    "ROUND",
    "SCALE",
    "SHARK",
    "SHARE",
    "SHEEP",
    "SHINE",
    "SHIRT",
    "SKATE",
    "SMILE",
    "SPACE",
    "SPOON",
    "SPORT",
    "STORM",
    "SUGAR",
    "TABLE",
    "TIGER",
    "TRAIN",
    "TRUCK",
    "WATER",
    "WORLD",
    "WRITE",
    "YOUTH"
];

const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;

let targetWord = "";
let currentRow = 0;
let currentGuess = "";
let gameOver = false;

let score = 0;
let streak = 0;


/* ==========================================
   DOM
========================================== */

const board = document.getElementById("board");
const message = document.getElementById("message");

const attemptCount = document.getElementById("attemptCount");
const scoreElement = document.getElementById("score");
const streakElement = document.getElementById("streak");

const keyboard = document.getElementById("keyboard");

const resultModal = document.getElementById("resultModal");
const resultIcon = document.getElementById("resultIcon");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const finalScore = document.getElementById("finalScore");

const newGameBtn = document.getElementById("newGameBtn");
const playAgainBtn = document.getElementById("playAgainBtn");


/* ==========================================
   INITIALIZE
========================================== */

function initGame() {

    targetWord =
        WORDS[Math.floor(Math.random() * WORDS.length)];

    currentRow = 0;
    currentGuess = "";
    gameOver = false;

    message.textContent = "";
    message.className = "message";

    createBoard();

    resetKeyboard();

    updateStats();
}


/* ==========================================
   CREATE BOARD
========================================== */

function createBoard() {

    board.innerHTML = "";

    for (let row = 0; row < MAX_ATTEMPTS; row++) {

        for (let col = 0; col < WORD_LENGTH; col++) {

            const tile = document.createElement("div");

            tile.className = "tile";

            tile.dataset.row = row;
            tile.dataset.col = col;

            board.appendChild(tile);
        }
    }
}


/* ==========================================
   GET TILE
========================================== */

function getTile(row, col) {

    return document.querySelector(
        `.tile[data-row="${row}"][data-col="${col}"]`
    );
}


/* ==========================================
   UPDATE CURRENT GUESS
========================================== */

function updateCurrentRow() {

    for (let col = 0; col < WORD_LENGTH; col++) {

        const tile = getTile(currentRow, col);

        if (col < currentGuess.length) {

            tile.textContent = currentGuess[col];
            tile.classList.add("filled");

        } else {

            tile.textContent = "";
            tile.classList.remove("filled");
        }
    }
}


/* ==========================================
   KEYBOARD INPUT
========================================== */

function handleKey(key) {

    if (gameOver) {
        return;
    }

    key = key.toUpperCase();

    if (key === "ENTER") {

        submitGuess();
        return;
    }

    if (key === "BACKSPACE") {

        currentGuess =
            currentGuess.slice(0, -1);

        updateCurrentRow();

        return;
    }

    if (/^[A-Z]$/.test(key)) {

        if (currentGuess.length < WORD_LENGTH) {

            currentGuess += key;

            updateCurrentRow();
        }
    }
}


/* ==========================================
   SUBMIT GUESS
========================================== */

function submitGuess() {

    if (currentGuess.length !== WORD_LENGTH) {

        showMessage(
            "Enter a 5-letter word.",
            "error"
        );

        shakeRow();

        return;
    }

    const guess = currentGuess;

    const result = evaluateGuess(
        guess,
        targetWord
    );

    animateResult(
        guess,
        result
    );

    currentRow++;

    updateAttemptCount();

    if (guess === targetWord) {

        setTimeout(() => {

            winGame();

        }, 700);

        return;
    }

    if (currentRow >= MAX_ATTEMPTS) {

        setTimeout(() => {

            loseGame();

        }, 700);

        return;
    }

    currentGuess = "";
}


/* ==========================================
   EVALUATE WORD
========================================== */

function evaluateGuess(guess, target) {

    const result = Array(WORD_LENGTH)
        .fill("absent");

    const remaining = target.split("");

    /*
        First pass:
        Find exact matches.
    */

    for (let i = 0; i < WORD_LENGTH; i++) {

        if (guess[i] === target[i]) {

            result[i] = "correct";

            remaining[i] = null;
        }
    }

    /*
        Second pass:
        Find letters existing elsewhere.
    */

    for (let i = 0; i < WORD_LENGTH; i++) {

        if (result[i] === "correct") {
            continue;
        }

        const index =
            remaining.indexOf(guess[i]);

        if (index !== -1) {

            result[i] = "present";

            remaining[index] = null;
        }
    }

    return result;
}


/* ==========================================
   ANIMATE RESULT
========================================== */

function animateResult(guess, result) {

    for (let i = 0; i < WORD_LENGTH; i++) {

        const tile =
            getTile(currentRow, i);

        setTimeout(() => {

            tile.classList.add("flip");

            setTimeout(() => {

                tile.classList.remove("flip");

                tile.classList.add(
                    result[i]
                );

            }, 250);

        }, i * 100);
    }

    updateKeyboard(
        guess,
        result
    );
}


/* ==========================================
   KEYBOARD COLORS
========================================== */

function updateKeyboard(guess, result) {

    for (let i = 0; i < WORD_LENGTH; i++) {

        const key =
            document.querySelector(
                `[data-key="${guess[i]}"]`
            );

        if (!key) {
            continue;
        }

        const currentState =
            key.classList.contains("correct")
                ? "correct"
                : key.classList.contains("present")
                    ? "present"
                    : key.classList.contains("absent")
                        ? "absent"
                        : null;

        const newState = result[i];

        /*
            Priority:

            correct > present > absent
        */

        if (
            newState === "correct" ||
            !currentState
        ) {

            key.classList.remove(
                "correct",
                "present",
                "absent"
            );

            key.classList.add(
                newState
            );

        } else if (
            newState === "present" &&
            currentState === "absent"
        ) {

            key.classList.remove("absent");
            key.classList.add("present");
        }
    }
}


/* ==========================================
   WIN
========================================== */

function winGame() {

    gameOver = true;

    /*
        More points for solving
        in fewer attempts.
    */

    const attemptBonus =
        MAX_ATTEMPTS - currentRow + 1;

    const earned =
        100 * attemptBonus;

    score += earned;

    API.saveScore("wordle", score);

    streak++;

    saveLocalStats();

    showResult(
        true,
        earned
    );
}


/* ==========================================
   LOSE
========================================== */

function loseGame() {

    gameOver = true;

    API.saveScore("wordle", score);

    streak = 0;

    saveLocalStats();

    showResult(
        false,
        0
    );
}


/* ==========================================
   RESULT MODAL
========================================== */

function showResult(won, earned) {

    if (won) {

        resultIcon.textContent = "🎉";

        resultTitle.textContent =
            "You got it!";

        resultText.innerHTML =
            `The word was <strong>${targetWord}</strong>.<br>
             You solved it in ${currentRow} attempt${currentRow === 1 ? "" : "s"}.`;

    } else {

        resultIcon.textContent = "😵";

        resultTitle.textContent =
            "Game Over";

        resultText.innerHTML =
            `The word was <strong>${targetWord}</strong>.<br>
             Better luck next time.`;

    }

    finalScore.textContent =
        won ? `+${earned}` : "0";

    resultModal.classList.remove(
        "hidden"
    );
}


/* ==========================================
   MESSAGE
========================================== */

function showMessage(text, type = "") {

    message.textContent = text;

    message.className =
        `message ${type}`;

    setTimeout(() => {

        if (!gameOver) {

            message.textContent = "";
            message.className = "message";
        }

    }, 1800);
}


/* ==========================================
   SHAKE ROW
========================================== */

function shakeRow() {

    for (let col = 0; col < WORD_LENGTH; col++) {

        const tile =
            getTile(currentRow, col);

        tile.animate(
            [
                { transform: "translateX(0)" },
                { transform: "translateX(-5px)" },
                { transform: "translateX(5px)" },
                { transform: "translateX(-5px)" },
                { transform: "translateX(0)" }
            ],
            {
                duration: 300
            }
        );
    }
}


/* ==========================================
   ATTEMPT COUNTER
========================================== */

function updateAttemptCount() {

    attemptCount.textContent =
        `${Math.min(currentRow, MAX_ATTEMPTS)} / ${MAX_ATTEMPTS}`;
}


/* ==========================================
   STATS
========================================== */

function updateStats() {

    scoreElement.textContent =
        score;

    streakElement.textContent =
        streak;

    updateAttemptCount();
}


/* ==========================================
   LOCAL STORAGE
========================================== */

function loadLocalStats() {

    const savedScore =
        localStorage.getItem(
            "minihub_wordle_score"
        );

    const savedStreak =
        localStorage.getItem(
            "minihub_wordle_streak"
        );

    if (savedScore !== null) {

        score =
            Number(savedScore);
    }

    if (savedStreak !== null) {

        streak =
            Number(savedStreak);
    }
}


function saveLocalStats() {

    localStorage.setItem(
        "minihub_wordle_score",
        score
    );

    localStorage.setItem(
        "minihub_wordle_streak",
        streak
    );

    updateStats();
}


/* ==========================================
   RESET KEYBOARD
========================================== */

function resetKeyboard() {

    const keys =
        keyboard.querySelectorAll(
            "button"
        );

    keys.forEach(key => {

        key.classList.remove(
            "correct",
            "present",
            "absent"
        );
    });
}


/* ==========================================
   NEW GAME
========================================== */

function newGame() {

    resultModal.classList.add(
        "hidden"
    );

    initGame();
}


/* ==========================================
   KEYBOARD CLICK
========================================== */

keyboard.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "button"
            );

        if (!button) {
            return;
        }

        handleKey(
            button.dataset.key
        );
    }
);


/* ==========================================
   PHYSICAL KEYBOARD
========================================== */

document.addEventListener(
    "keydown",
    event => {

        let key =
            event.key.toUpperCase();

        if (key === "ENTER") {

            handleKey("ENTER");

        } else if (
            key === "BACKSPACE"
        ) {

            handleKey("BACKSPACE");

        } else if (
            /^[A-Z]$/.test(key)
        ) {

            handleKey(key);
        }
    }
);


/* ==========================================
   BUTTONS
========================================== */

newGameBtn.addEventListener(
    "click",
    newGame
);

playAgainBtn.addEventListener(
    "click",
    newGame
);


/* ==========================================
   START
========================================== */

loadLocalStats();

initGame();