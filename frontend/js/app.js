// ============================================================
// MINIHUB - GLOBAL APP
// ============================================================

const MiniHub = {
    getUser() {
        try {
            return JSON.parse(localStorage.getItem("minihub_user")) || null;
        } catch {
            return null;
        }
    },

    setUser(user) {
        localStorage.setItem("minihub_user", JSON.stringify(user));
    },

    async logout() {
        try {
            await API.signOut();
        } catch (error) {
            console.error("Supabase sign-out failed:", error);
        }
        localStorage.removeItem("minihub_user");
        window.location.href = "login.html";
    },

    requireLogin() {
        if (!this.getUser()) {
            window.location.href = "login.html";
            return false;
        }

        return true;
    },

    navigate(path) {
        window.location.href = path;
    },

    game(name) {
        window.location.href = `../games/${name}/index.html`;
    }
};


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    updateGlobalUserUI();
});


// ============================================================
// USER UI
// ============================================================

function updateGlobalUserUI() {
    const user = MiniHub.getUser();

    const usernameElements = document.querySelectorAll("[data-username]");
    const avatarElements = document.querySelectorAll("[data-avatar]");

    if (!user) {
        usernameElements.forEach(el => {
            el.textContent = "Guest";
        });

        avatarElements.forEach(el => {
            el.textContent = "?";
        });

        return;
    }

    usernameElements.forEach(el => {
        el.textContent = user.username;
    });

    avatarElements.forEach(el => {
        el.textContent = user.username.charAt(0).toUpperCase();
    });
}


// ============================================================
// GLOBAL LOGOUT BUTTONS
// ============================================================

document.addEventListener("click", event => {
    const logoutButton = event.target.closest("[data-logout]");

    if (logoutButton) {
        MiniHub.logout();
    }
});


// ============================================================
// GAME NAVIGATION
// ============================================================

function openGame(game) {
    const games = [
        "snake",
        "breakout",
        "dino",
        "rps",
        "wordle",
        "sudoku",
        "tictactoe",
        "graphing",
        "qr",
        "2048",
        "minesweeper",
        "reaction"
    ];

    if (!games.includes(game)) {
        console.error(`Unknown game: ${game}`);
        return;
    }

    MiniHub.game(game);
}


// ============================================================
// BACK TO DASHBOARD
// ============================================================

function backToDashboard() {
    window.location.href = "../../pages/dashboard.html";
}

function goHome() {
    window.location.href = "../index.html";
}

function scrollToGames() {
    const section = document.getElementById("games-section");

    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
    }
}

function openLeaderboard() {
    window.location.href = "leaderboard.html";
}


// ============================================================
// MOBILE MENU
// ============================================================

function toggleMobileMenu() {
    const menu = document.querySelector(".mobile-menu");

    if (menu) {
        menu.classList.toggle("open");
    }
}