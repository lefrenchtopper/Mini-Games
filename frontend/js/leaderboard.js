document.addEventListener("DOMContentLoaded", async () => {

    await API.ready();

    const user = API.getCurrentUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    populateGameFilter();
    renderLeaderboard();
});

let closeLeaderboardSocket = null;

function populateGameFilter() {

    const select =
        document.getElementById("leaderboardGame");

    if (!select) {
        return;
    }

    const games = API.getGames();

    games.forEach(game => {

        const option =
            document.createElement("option");

        option.value = game.id;
        option.textContent =
            `${game.icon} ${game.name}`;

        select.appendChild(option);
    });

    select.addEventListener(
        "change",
        renderLeaderboard
    );
}

async function renderLeaderboard() {

    const select =
        document.getElementById("leaderboardGame");

    const game =
        select ? select.value : "";

    if (closeLeaderboardSocket) {
        closeLeaderboardSocket();
        closeLeaderboardSocket = null;
    }

    if (API.subscribeLeaderboard) {
        closeLeaderboardSocket = API.subscribeLeaderboard(game || "all", () => {
            renderLeaderboard();
        });
    }

    let leaderboard;

    try {
        leaderboard = await API.getLeaderboard(game || null);
    } catch (error) {
        console.error("Leaderboard loading failed:", error);
        leaderboard = [];
    }

    const container =
        document.getElementById(
            "leaderboardList"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!leaderboard.length) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🏆
                </div>

                <h3>
                    No scores yet
                </h3>

                <p>
                    Be the first player
                    on the leaderboard.
                </p>

            </div>
        `;

        return;
    }


    leaderboard
        .slice(0, 100)
        .forEach((player, index) => {

            const rank = index + 1;

            const row =
                document.createElement("div");

            row.className =
                "leaderboard-row";


            let rankDisplay = rank;

            if (rank === 1) {
                rankDisplay = "🥇";
            }

            if (rank === 2) {
                rankDisplay = "🥈";
            }

            if (rank === 3) {
                rankDisplay = "🥉";
            }


            const gameInfo =
                API.getGames()
                    .find(
                        g =>
                            g.id === player.game
                    );


            row.innerHTML = `

                <div class="leaderboard-rank">
                    ${rankDisplay}
                </div>

                <div class="leaderboard-player">

                    <div class="leaderboard-avatar">
                        ${player.username
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(
                                player.username
                            )}
                        </strong>

                        <span>
                            ${
                                gameInfo
                                    ? gameInfo.name
                                    : player.game
                            }
                        </span>

                    </div>

                </div>

                <div class="leaderboard-score">
                    ${player.score}
                </div>

            `;

            container.appendChild(row);
        });
}
function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}