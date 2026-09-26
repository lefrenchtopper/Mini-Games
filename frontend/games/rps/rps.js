// ==========================================
// ROCK PAPER SCISSORS
// MiniHub Arcade
// ==========================================

let playerScore = 0;
let computerScore = 0;
let totalScore = 0;

const choices = ["rock", "paper", "scissors"];


// ==========================================
// ELEMENTS
// ==========================================

const playerChoiceElement =
    document.getElementById("playerChoice");

const computerChoiceElement =
    document.getElementById("computerChoice");

const resultElement =
    document.getElementById("result");

const roundMessageElement =
    document.getElementById("roundMessage");

const playerScoreElement =
    document.getElementById("playerScore");

const computerScoreElement =
    document.getElementById("computerScore");

const scoreElement =
    document.getElementById("score");


// ==========================================
// EMOJIS
// ==========================================

const choiceEmoji = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️"
};


// ==========================================
// COMPUTER CHOICE
// ==========================================

function getComputerChoice() {

    const randomIndex =
        Math.floor(Math.random() * choices.length);

    return choices[randomIndex];
}


// ==========================================
// DETERMINE WINNER
// ==========================================

function determineWinner(player, computer) {

    if (player === computer) {
        return "draw";
    }

    if (
        (player === "rock" && computer === "scissors") ||
        (player === "paper" && computer === "rock") ||
        (player === "scissors" && computer === "paper")
    ) {
        return "player";
    }

    return "computer";
}


// ==========================================
// PLAY ROUND
// ==========================================

function play(playerChoice) {

    const computerChoice = getComputerChoice();

    // Show choices
    playerChoiceElement.textContent =
        choiceEmoji[playerChoice];

    computerChoiceElement.textContent =
        choiceEmoji[computerChoice];

    // Restart animation
    playerChoiceElement.classList.remove("animate");
    computerChoiceElement.classList.remove("animate");

    void playerChoiceElement.offsetWidth;

    playerChoiceElement.classList.add("animate");
    computerChoiceElement.classList.add("animate");


    const winner =
        determineWinner(
            playerChoice,
            computerChoice
        );


    // ======================================
    // PLAYER WINS
    // ======================================

    if (winner === "player") {

        playerScore++;

        totalScore += 10;

        resultElement.textContent = "YOU WIN";

        roundMessageElement.textContent =
            `${capitalize(playerChoice)} beats ${capitalize(computerChoice)}. +10 points`;

    }


    // ======================================
    // COMPUTER WINS
    // ======================================

    else if (winner === "computer") {

        computerScore++;

        resultElement.textContent = "YOU LOSE";

        roundMessageElement.textContent =
            `${capitalize(computerChoice)} beats ${capitalize(playerChoice)}.`;

    }


    // ======================================
    // DRAW
    // ======================================

    else {

        resultElement.textContent = "DRAW";

        roundMessageElement.textContent =
            `Both chose ${capitalize(playerChoice)}.`;
    }


    updateScoreboard();

    saveLocalScore();
}


// ==========================================
// UPDATE SCOREBOARD
// ==========================================

function updateScoreboard() {

    playerScoreElement.textContent =
        playerScore;

    computerScoreElement.textContent =
        computerScore;

    scoreElement.textContent =
        totalScore;
}


// ==========================================
// RESET GAME
// ==========================================

function resetGame() {

    playerScore = 0;

    computerScore = 0;

    totalScore = 0;

    playerChoiceElement.textContent = "?";

    computerChoiceElement.textContent = "?";

    resultElement.textContent =
        "Make your move";

    roundMessageElement.textContent =
        "Choose Rock, Paper or Scissors";

    updateScoreboard();
}


// ==========================================
// CAPITALIZE
// ==========================================

function capitalize(word) {

    return word.charAt(0).toUpperCase() +
           word.slice(1);
}


// ==========================================
// LOCAL SCORE
// ==========================================
//
// This is temporary.
//
// Later, when we reconnect the MongoDB
// backend, this will become:
//
// POST /scores
//
// and the score will be attached
// to the logged-in user's account.
//

function saveLocalScore() {

    API.saveScore("rps", totalScore);

    const currentBest =
        Number(
            localStorage.getItem("rpsBestScore") || 0
        );

    if (totalScore > currentBest) {

        localStorage.setItem(
            "rpsBestScore",
            totalScore
        );
    }
}


// ==========================================
// LOAD PREVIOUS SCORE
// ==========================================

function loadLocalScore() {

    const savedScore =
        Number(
            localStorage.getItem("rpsBestScore") || 0
        );

    // We don't load it into the active
    // round score because that would
    // make the current game confusing.
    console.log(
        "RPS best score:",
        savedScore
    );
}


// ==========================================
// KEYBOARD CONTROLS
// ==========================================

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();

        if (key === "r") {
            play("rock");
        }

        else if (key === "p") {
            play("paper");
        }

        else if (key === "s") {
            play("scissors");
        }

        else if (key === "escape") {
            resetGame();
        }
    }
);


// ==========================================
// START
// ==========================================

loadLocalScore();

updateScoreboard();