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
            return (async () => {
                try {
                    await API.signOut();
                } catch (error) {
                    console.error("Supabase sign-out failed:", error);
                }
                localStorage.removeItem("minihub_user");
                window.location.href = `${appRootPath()}pages/login.html`;
            })();
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
        window.location.href = `${appRootPath()}games/${encodeURIComponent(name)}/`;
    }
};


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    updateGlobalUserUI();
    mountGlobalNavigation();
});

function appRootPath() {
    const path = window.location.pathname;
    if (path.includes("/games/")) return "../../";
    if (path.includes("/pages/")) return "../";
    return "";
}

function mountGlobalNavigation() {
    if (!document.body.hasAttribute("data-minihub-shell") || document.getElementById("minihub-global-nav")) {
        return;
    }

    const path = window.location.pathname;
    const onDashboard = path.endsWith("/dashboard.html");
    const onLeaderboard = path.endsWith("/leaderboard.html");
    const onProfile = path.endsWith("/profile.html");
    const onGame = path.includes("/games/");
    const root = appRootPath();
    const currentUser = window.API?.getCurrentUser();
    const nav = document.createElement("header");
    nav.id = "minihub-global-nav";
    nav.innerHTML = `
        <a class="mh-brand" href="${root}pages/dashboard.html" aria-label="MiniHub dashboard">
            <span class="mh-brand-mark">M</span>
            <span class="mh-brand-copy"><strong>MINIHUB</strong><span>PLAY / COMPETE / REPEAT</span></span>
        </a>
        <nav class="mh-nav-links" aria-label="Main navigation">
            <a href="${root}pages/dashboard.html" ${onDashboard ? 'aria-current="page"' : ""}>Dashboard</a>
            <a href="${root}pages/dashboard.html#games-section" ${onGame ? 'aria-current="page"' : ""}>Arcade</a>
            <a href="${root}pages/leaderboard.html" ${onLeaderboard ? 'aria-current="page"' : ""}>Leaderboard</a>
            <a href="${root}pages/profile.html" ${onProfile ? 'aria-current="page"' : ""}>Profile</a>
        </nav>
        <button class="mh-menu-button" type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button>
        <div class="mh-nav-account">
            <span class="mh-user-label"></span>
            <button class="mh-logout" type="button">Logout</button>
        </div>
    `;
    document.body.prepend(nav);
    nav.querySelector(".mh-user-label").textContent = currentUser?.username || "Player";

    const menuButton = nav.querySelector(".mh-menu-button");
    menuButton.addEventListener("click", () => {
        const expanded = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!expanded));
        nav.classList.toggle("menu-open", !expanded);
    });
    nav.querySelector(".mh-logout").addEventListener("click", () => MiniHub.logout());

    if (window.API?.ready) {
        window.API.ready().then(() => {
            const user = window.API.getCurrentUser();
            nav.querySelector(".mh-user-label").textContent = user?.username || "Player";
        });
    }
}


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