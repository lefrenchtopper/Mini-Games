const cells = document.querySelectorAll(".cell");

const statusText = document.getElementById("status");

const playerScoreText = document.getElementById("playerScore");
const computerScoreText = document.getElementById("computerScore");
const drawScoreText = document.getElementById("drawScore");

const newGameBtn = document.getElementById("newGameBtn");
const resetScoresBtn = document.getElementById("resetScoresBtn");


let board = ["", "", "", "", "", "", "", "", ""];

let gameActive = true;
let playerTurn = true;


let playerScore = Number(localStorage.getItem("tttPlayerScore")) || 0;
let computerScore = Number(localStorage.getItem("tttComputerScore")) || 0;
let drawScore = Number(localStorage.getItem("tttDrawScore")) || 0;


const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];


function updateScores() {
    playerScoreText.textContent = playerScore;
    computerScoreText.textContent = computerScore;
    drawScoreText.textContent = drawScore;

    localStorage.setItem("tttPlayerScore", playerScore);
    localStorage.setItem("tttComputerScore", computerScore);
    localStorage.setItem("tttDrawScore", drawScore);
}


function handleCellClick(event) {

    const cell = event.target;

    const index = Number(cell.dataset.index);


    if (
        board[index] !== "" ||
        !gameActive ||
        !playerTurn
    ) {
        return;
    }


    makeMove(index, "X");


    if (checkGameResult()) {
        return;
    }


    playerTurn = false;

    statusText.textContent = "Computer is thinking...";
    statusText.style.color = "#58a6ff";


    setTimeout(() => {

        computerMove();

    }, 500);
}


function makeMove(index, symbol) {

    board[index] = symbol;

    const cell = cells[index];

    cell.textContent = symbol;

    cell.disabled = true;


    if (symbol === "X") {
        cell.classList.add("x");
    } else {
        cell.classList.add("o");
    }
}


function computerMove() {

    if (!gameActive) {
        return;
    }


    const bestMove = getBestMove();

    makeMove(bestMove, "O");


    if (checkGameResult()) {
        return;
    }


    playerTurn = true;

    statusText.textContent = "Your turn";
    statusText.style.color = "#58e391";
}


function getBestMove() {

    const emptyCells = board
        .map((value, index) => value === "" ? index : null)
        .filter(value => value !== null);


    // 1. Try to win
    for (const index of emptyCells) {

        board[index] = "O";

        if (getWinner() === "O") {
            board[index] = "";
            return index;
        }

        board[index] = "";
    }


    // 2. Block the player
    for (const index of emptyCells) {

        board[index] = "X";

        if (getWinner() === "X") {
            board[index] = "";
            return index;
        }

        board[index] = "";
    }


    // 3. Take the center
    if (board[4] === "") {
        return 4;
    }


    // 4. Take a random corner
    const corners = [0, 2, 6, 8]
        .filter(index => board[index] === "");


    if (corners.length > 0) {

        return corners[
            Math.floor(Math.random() * corners.length)
        ];
    }


    // 5. Random available move
    return emptyCells[
        Math.floor(Math.random() * emptyCells.length)
    ];
}


function checkGameResult() {

    const winner = getWinner();


    if (winner) {

        gameActive = false;


        const winningCombo = winningCombinations.find(combo => {

            return combo.every(index => {
                return board[index] === winner;
            });

        });


        winningCombo.forEach(index => {
            cells[index].classList.add("winner");
        });


        if (winner === "X") {

            playerScore++;

            statusText.textContent = "YOU WIN! 🎉";
            statusText.style.color = "#58e391";

        } else {

            computerScore++;

            statusText.textContent = "COMPUTER WINS";
            statusText.style.color = "#ff4f9a";
        }


        updateScores();

        API.saveScore("tictactoe", playerScore);

        disableBoard();

        return true;
    }


    if (!board.includes("")) {

        gameActive = false;

        drawScore++;

        statusText.textContent = "IT'S A DRAW";
        statusText.style.color = "#ffd866";

        updateScores();

        API.saveScore("tictactoe", playerScore);

        disableBoard();

        return true;
    }


    return false;
}


function getWinner() {

    for (const combo of winningCombinations) {

        const [a, b, c] = combo;


        if (
            board[a] !== "" &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {

            return board[a];
        }
    }


    return null;
}


function disableBoard() {

    cells.forEach(cell => {
        cell.disabled = true;
    });
}


function startNewGame() {

    board = ["", "", "", "", "", "", "", "", ""];

    gameActive = true;
    playerTurn = true;


    cells.forEach(cell => {

        cell.textContent = "";

        cell.disabled = false;

        cell.classList.remove(
            "x",
            "o",
            "winner"
        );

    });


    statusText.textContent = "Your turn";
    statusText.style.color = "#58e391";
}


function resetScores() {

    playerScore = 0;
    computerScore = 0;
    drawScore = 0;


    updateScores();

    startNewGame();
}


cells.forEach(cell => {

    cell.addEventListener(
        "click",
        handleCellClick
    );

});


newGameBtn.addEventListener(
    "click",
    startNewGame
);


resetScoresBtn.addEventListener(
    "click",
    resetScores
);


updateScores();