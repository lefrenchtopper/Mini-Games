// ============================================================
// MINIHUB DASHBOARD
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    await API.ready();

    const user = API.getCurrentUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    renderDashboardUser();
    renderGameLibrary();
    const scores = await API.getScores();
    renderStatistics(scores);
    renderRecentlyPlayed(scores);
});


// ============================================================
// USER
// ============================================================

function renderDashboardUser() {

    const user = API.getCurrentUser();

    document
        .querySelectorAll("[data-username]")
        .forEach(element => {
            element.textContent = user.username;
        });

    document
        .querySelectorAll("[data-avatar]")
        .forEach(element => {
            element.textContent =
                user.username.charAt(0).toUpperCase();
        });
}


// ============================================================
// GAME LIBRARY
// ============================================================

function renderGameLibrary() {

    const container =
        document.getElementById("gameLibrary");

    if (!container) {
        return;
    }

    const games = API.getGames();

    container.innerHTML = "";

    games.forEach(game => {

        const card = document.createElement("div");

        card.className = "game-card";

        card.innerHTML = `
            <div class="game-card-icon">
                ${game.icon}
            </div>

            <div class="game-card-content">

                <h3>${game.name}</h3>

                <p>${game.description}</p>

                <button
                    class="game-play-btn"
                    onclick="openGame('${game.id}')"
                >
                    PLAY →
                </button>

            </div>
        `;

        container.appendChild(card);
    });
}


// ============================================================
// STATISTICS
// ============================================================

function renderStatistics(allScores) {

    const user = API.getCurrentUser();

    if (!user) {
        return;
    }

    const scores = allScores
        .filter(s => s.username === user.username);

    const gamesPlayed = scores.length;

    const totalScore = scores.reduce(
        (sum, s) => sum + Number(s.score),
        0
    );

    const bestScore = scores.length
        ? Math.max(...scores.map(s => Number(s.score)))
        : 0;

    const uniqueGames = new Set(
        scores.map(s => s.game)
    ).size;


    setElementText(
        "gamesPlayed",
        gamesPlayed
    );

    setElementText(
        "totalScore",
        totalScore
    );

    setElementText(
        "bestScore",
        bestScore
    );

    setElementText(
        "gamesDiscovered",
        uniqueGames
    );
}


function setElementText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


// ============================================================
// RECENTLY PLAYED
// ============================================================

function renderRecentlyPlayed(allScores) {

    const user = API.getCurrentUser();

    if (!user) {
        return;
    }

    const container =
        document.getElementById("recentGames");

    if (!container) {
        return;
    }

    const recent = allScores
        .filter(score => score.username === user.username)
        .sort((left, right) => new Date(right.playedAt) - new Date(left.playedAt))
        .slice(0, 6);

    if (!recent.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎮</div>
                <h3>No games played yet</h3>
                <p>Choose a game and start playing.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = "";

    recent.forEach(item => {

        const game = API.getGames()
            .find(g => g.id === item.game);

        if (!game) {
            return;
        }

        const date =
            new Date(item.playedAt);

        const card =
            document.createElement("div");

        card.className = "recent-game";

        card.innerHTML = `

            <div class="recent-icon">
                ${game.icon}
            </div>

            <div class="recent-info">

                <strong>
                    ${game.name}
                </strong>

                <span>
                    Score: ${item.score}
                </span>

            </div>

            <div class="recent-time">
                ${timeAgo(date)}
            </div>

        `;

        container.appendChild(card);
    });
}


// ============================================================
// TIME AGO
// ============================================================

function timeAgo(date) {

    const seconds =
        Math.floor(
            (Date.now() - date.getTime()) / 1000
        );

    if (seconds < 60) {
        return "Just now";
    }

    const minutes =
        Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours =
        Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days =
        Math.floor(hours / 24);

    if (days < 7) {
        return `${days}d ago`;
    }

    return date.toLocaleDateString();
}


// ============================================================
// LOGOUT
// ============================================================

function logout() {
    MiniHub.logout();
}