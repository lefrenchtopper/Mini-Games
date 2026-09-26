// ==========================================
// MINIHUB SUDOKU
// ==========================================


// ==========================================
// GAME STATE
// ==========================================

let solution = [];

let puzzle = [];

let board = [];

let selectedCell = null;

let difficulty = "easy";

let mistakes = 0;

const maxMistakes = 3;

let score = 0;

let seconds = 0;

let timerInterval = null;

let gameRunning = false;


// ==========================================
// DIFFICULTY
// ==========================================

const difficultySettings = {

    easy: 35,

    medium: 45,

    hard: 53

};


// ==========================================
// ELEMENTS
// ==========================================

const sudokuBoard =
    document.getElementById("sudokuBoard");

const timerElement =
    document.getElementById("timer");

const mistakesElement =
    document.getElementById("mistakes");

const scoreElement =
    document.getElementById("score");

const topScoreElement =
    document.getElementById("topScore");

const overlay =
    document.getElementById("gameOverlay");

const overlayTitle =
    document.getElementById("overlayTitle");

const overlayMessage =
    document.getElementById("overlayMessage");

const startButton =
    document.getElementById("startButton");


// ==========================================
// SHUFFLE
// ==========================================

function shuffle(array) {

    const result = [...array];

    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];
    }

    return result;
}


// ==========================================
// CREATE EMPTY BOARD
// ==========================================

function emptyBoard() {

    return Array.from(
        { length: 9 },
        () => Array(9).fill(0)
    );
}


// ==========================================
// VALID NUMBER
// ==========================================

function isValid(board, row, col, number) {

    // Row

    for (let x = 0; x < 9; x++) {

        if (
            board[row][x] === number
        ) {
            return false;
        }
    }


    // Column

    for (let x = 0; x < 9; x++) {

        if (
            board[x][col] === number
        ) {
            return false;
        }
    }


    // 3x3 box

    const startRow =
        row - (row % 3);

    const startCol =
        col - (col % 3);


    for (
        let r = 0;
        r < 3;
        r++
    ) {

        for (
            let c = 0;
            c < 3;
            c++
        ) {

            if (
                board[startRow + r][startCol + c] === number
            ) {
                return false;
            }
        }
    }

    return true;
}


// ==========================================
// SOLVE SUDOKU
// ==========================================

function solveBoard(board) {

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            if (board[row][col] === 0) {

                const numbers =
                    shuffle(
                        [1,2,3,4,5,6,7,8,9]
                    );


                for (const number of numbers) {

                    if (
                        isValid(
                            board,
                            row,
                            col,
                            number
                        )
                    ) {

                        board[row][col] =
                            number;


                        if (
                            solveBoard(board)
                        ) {
                            return true;
                        }


                        board[row][col] = 0;
                    }
                }

                return false;
            }
        }
    }

    return true;
}


// ==========================================
// GENERATE PUZZLE
// ==========================================

function generatePuzzle() {

    solution = emptyBoard();

    solveBoard(solution);


    puzzle =
        solution.map(
            row => [...row]
        );


    const cellsToRemove =
        difficultySettings[difficulty];


    const positions = shuffle(
        Array.from(
            { length: 81 },
            (_, index) => index
        )
    );


    for (
        let i = 0;
        i < cellsToRemove;
        i++
    ) {

        const position =
            positions[i];

        const row =
            Math.floor(position / 9);

        const col =
            position % 9;

        puzzle[row][col] = 0;
    }


    board =
        puzzle.map(
            row => [...row]
        );
}


// ==========================================
// RENDER BOARD
// ==========================================

function renderBoard() {

    sudokuBoard.innerHTML = "";


    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            const cell =
                document.createElement("div");

            cell.classList.add(
                "sudoku-cell"
            );


            const value =
                board[row][col];


            const original =
                puzzle[row][col];


            if (value !== 0) {

                cell.textContent =
                    value;
            }


            if (original !== 0) {

                cell.classList.add(
                    "given"
                );
            }


            cell.dataset.row = row;

            cell.dataset.col = col;


            cell.addEventListener(
                "click",
                () => selectCell(row, col)
            );


            sudokuBoard.appendChild(cell);
        }
    }


    highlightBoard();
}


// ==========================================
// SELECT CELL
// ==========================================

function selectCell(row, col) {

    if (!gameRunning) {
        return;
    }


    selectedCell = {
        row,
        col
    };


    highlightBoard();
}


// ==========================================
// HIGHLIGHT BOARD
// ==========================================

function highlightBoard() {

    const cells =
        document.querySelectorAll(
            ".sudoku-cell"
        );


    cells.forEach(cell => {

        cell.classList.remove(
            "selected",
            "related",
            "same-number"
        );
    });


    if (!selectedCell) {
        return;
    }


    const row =
        selectedCell.row;

    const col =
        selectedCell.col;


    const selectedValue =
        board[row][col];


    cells.forEach(cell => {

        const r =
            Number(cell.dataset.row);

        const c =
            Number(cell.dataset.col);


        if (
            r === row ||
            c === col ||
            (
                Math.floor(r / 3) === Math.floor(row / 3) &&
                Math.floor(c / 3) === Math.floor(col / 3)
            )
        ) {

            cell.classList.add(
                "related"
            );
        }


        if (
            selectedValue !== 0 &&
            board[r][c] === selectedValue
        ) {

            cell.classList.add(
                "same-number"
            );
        }
    });


    const selectedIndex =
        row * 9 + col;


    if (cells[selectedIndex]) {

        cells[selectedIndex]
            .classList.add("selected");
    }
}


// ==========================================
// SELECT NUMBER
// ==========================================

function selectNumber(number) {

    if (
        !gameRunning ||
        !selectedCell
    ) {
        return;
    }


    const row =
        selectedCell.row;

    const col =
        selectedCell.col;


    // Cannot change original cells

    if (
        puzzle[row][col] !== 0
    ) {
        return;
    }


    // Correct number

    if (
        solution[row][col] === number
    ) {

        board[row][col] =
            number;

        score += 10;

        renderBoard();

        updateUI();

        checkWin();

    }


    // Wrong number

    else {

        mistakes++;

        score =
            Math.max(
                0,
                score - 5
            );


        renderBoard();


        const index =
            row * 9 + col;


        const cells =
            document.querySelectorAll(
                ".sudoku-cell"
            );


        cells[index]
            ?.classList.add(
                "wrong"
            );


        updateUI();


        if (
            mistakes >= maxMistakes
        ) {

            gameOver();
        }
    }
}


// ==========================================
// ERASE
// ==========================================

function eraseCell() {

    if (
        !gameRunning ||
        !selectedCell
    ) {
        return;
    }


    const row =
        selectedCell.row;

    const col =
        selectedCell.col;


    if (
        puzzle[row][col] !== 0
    ) {
        return;
    }


    board[row][col] = 0;

    renderBoard();
}


// ==========================================
// HINT
// ==========================================

function giveHint() {

    if (
        !gameRunning ||
        !selectedCell
    ) {
        return;
    }


    const row =
        selectedCell.row;

    const col =
        selectedCell.col;


    if (
        puzzle[row][col] !== 0 ||
        board[row][col] !== 0
    ) {
        return;
    }


    board[row][col] =
        solution[row][col];


    score =
        Math.max(
            0,
            score - 5
        );


    renderBoard();

    updateUI();

    checkWin();
}


// ==========================================
// CHECK WIN
// ==========================================

function checkWin() {

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            if (
                board[row][col] === 0
            ) {
                return false;
            }
        }
    }


    gameWon();

    return true;
}


// ==========================================
// START GAME
// ==========================================

function startGame() {

    generatePuzzle();

    renderBoard();


    mistakes = 0;

    score = 0;

    seconds = 0;

    selectedCell = null;

    gameRunning = true;


    updateUI();


    overlay.classList.add(
        "hidden"
    );


    clearInterval(
        timerInterval
    );


    timerInterval =
        setInterval(
            updateTimer,
            1000
        );
}


// ==========================================
// NEW GAME
// ==========================================

function newGame() {

    clearInterval(
        timerInterval
    );

    startGame();
}


// ==========================================
// DIFFICULTY
// ==========================================

function changeDifficulty(newDifficulty) {

    difficulty =
        newDifficulty;


    document
        .querySelectorAll(
            ".difficulty-btn"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.difficulty ===
                    newDifficulty
            );
        });


    newGame();
}


// ==========================================
// TIMER
// ==========================================

function updateTimer() {

    if (!gameRunning) {
        return;
    }

    seconds++;

    updateTimerDisplay();
}


function updateTimerDisplay() {

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        seconds % 60;


    timerElement.textContent =
        `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}


// ==========================================
// UI
// ==========================================

function updateUI() {

    scoreElement.textContent =
        score;

    topScoreElement.textContent =
        score;

    mistakesElement.textContent =
        `${mistakes} / ${maxMistakes}`;

    updateTimerDisplay();
}


// ==========================================
// GAME WON
// ==========================================

function gameWon() {

    gameRunning = false;

    clearInterval(
        timerInterval
    );


    // Time bonus

    const timeBonus =
        Math.max(
            0,
            500 - seconds
        );


    score += timeBonus;


    // Difficulty multiplier

    if (difficulty === "medium") {

        score =
            Math.floor(
                score * 1.5
            );
    }

    else if (difficulty === "hard") {

        score =
            Math.floor(
                score * 2
            );
    }


    updateUI();


    saveScore();


    overlayTitle.textContent =
        "PUZZLE SOLVED";

    overlayMessage.textContent =
        `Excellent! Final score: ${score}`;

    startButton.textContent =
        "PLAY AGAIN";


    overlay.classList.remove(
        "hidden"
    );
}


// ==========================================
// GAME OVER
// ==========================================

function gameOver() {

    gameRunning = false;

    clearInterval(
        timerInterval
    );


    overlayTitle.textContent =
        "GAME OVER";

    overlayMessage.textContent =
        "Too many mistakes. Try again.";

    startButton.textContent =
        "TRY AGAIN";


    overlay.classList.remove(
        "hidden"
    );
}


// ==========================================
// SAVE SCORE
// ==========================================
//
// TEMPORARY LOCAL SCORE.
//
// Later this will become:
//
// POST /scores
//
// MongoDB:
//
// username
// game
// score
// difficulty
// timestamp
//
// ==========================================

function saveScore() {

    API.saveScore("sudoku", score);

    const storageKey =
        "sudokuBestScore_" +
        difficulty;


    const previousBest =
        Number(
            localStorage.getItem(
                storageKey
            ) || 0
        );


    if (
        score > previousBest
    ) {

        localStorage.setItem(
            storageKey,
            score
        );
    }


    console.log(
        "Sudoku score:",
        score,
        "Difficulty:",
        difficulty
    );
}


// ==========================================
// KEYBOARD
// ==========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (!gameRunning) {
            return;
        }


        const key =
            event.key;


        if (
            /^[1-9]$/.test(key)
        ) {

            selectNumber(
                Number(key)
            );

            return;
        }


        if (
            key === "Backspace" ||
            key === "Delete"
        ) {

            eraseCell();

            return;
        }


        // Arrow navigation

        if (!selectedCell) {
            return;
        }


        let row =
            selectedCell.row;

        let col =
            selectedCell.col;


        if (key === "ArrowUp") {

            row =
                Math.max(
                    0,
                    row - 1
                );
        }

        else if (key === "ArrowDown") {

            row =
                Math.min(
                    8,
                    row + 1
                );
        }

        else if (key === "ArrowLeft") {

            col =
                Math.max(
                    0,
                    col - 1
                );
        }

        else if (key === "ArrowRight") {

            col =
                Math.min(
                    8,
                    col + 1
                );
        }

        else {
            return;
        }


        selectCell(row, col);
    }
);


// ==========================================
// INITIAL STATE
// ==========================================

generatePuzzle();

renderBoard();

updateUI();