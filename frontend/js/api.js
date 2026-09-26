const SUPABASE_URL = "https://lpqbpzlubzufolbpbmri.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_q-bdP_zb4236QdxVjcVz_w_B1UDmglQ";
const API_BASE_URL = window.MINIHUB_API_URL || "http://127.0.0.1:8000";
const SCORE_STORAGE_KEY = "minihub_scores";
const LOWER_IS_BETTER = new Set(["sudoku", "minesweeper", "reaction"]);

const supabaseClient = window.supabase?.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
let authInitialization = Promise.resolve();

const GAMES = [
    { id: "snake", name: "Snake", description: "Grow longer. Survive longer.", icon: "🐍" },
    { id: "breakout", name: "Breakout", description: "Break every brick. Chase the high score.", icon: "🧱" },
    { id: "dino", name: "Dino Run", description: "Jump. Dodge. Do not stop running.", icon: "🦖" },
    { id: "rps", name: "Rock Paper Scissors", description: "Choose wisely. Beat the computer.", icon: "✊" },
    { id: "wordle", name: "Wordle", description: "Find the hidden word in six tries.", icon: "🔤" },
    { id: "sudoku", name: "Sudoku", description: "Test your logic.", icon: "🔢" },
    { id: "tictactoe", name: "Tic Tac Toe", description: "Three in a row.", icon: "❌" },
    { id: "graphing", name: "Graphing Calculator", description: "Plot equations.", icon: "📈" },
    { id: "qr", name: "QR Generator", description: "Create QR codes.", icon: "▦" },
    { id: "2048", name: "2048", description: "Slide tiles. Merge up.", icon: "2048" },
    { id: "minesweeper", name: "Minesweeper", description: "Clear the field.", icon: "✹" },
    { id: "reaction", name: "Reaction Test", description: "Beat your response time.", icon: "⚡" }
];

const DEMO_SCORES = [
    { username: "PixelMaster", game: "snake", score: 12840, playedAt: "2026-09-18T12:00:00Z" },
    { username: "CodeNinja", game: "breakout", score: 10492, playedAt: "2026-09-17T12:00:00Z" },
    { username: "GameLord", game: "2048", score: 9821, playedAt: "2026-09-16T12:00:00Z" }
];

function readJson(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

function readSupabaseUser() {
    const user = readJson("minihub_user", null);
    if (user) return user;

    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;

        const session = readJson(key, null);
        const token = session?.user || session?.currentSession?.user;
        if (!token) continue;

        return {
            id: token.id,
            email: token.email,
            username: token.user_metadata?.username || token.email?.split("@")[0] || "Player"
        };
    }

    return null;
}

function readScores() {
    const scores = readJson(SCORE_STORAGE_KEY, []);
    return Array.isArray(scores) ? scores : [];
}

function currentUser() {
    return readSupabaseUser();
}

function userRecord(user) {
    if (!user) return null;

    return {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || user.email?.split("@")[0] || "Player"
    };
}

function accessToken() {
    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;

        const session = readJson(key, null);
        return session?.access_token || session?.currentSession?.access_token || null;
    }

    return null;
}

const API = {
    ready() {
        return authInitialization;
    },

    getCurrentUser() {
        return currentUser();
    },

    syncAuthUser(user) {
        if (user) {
            localStorage.setItem("minihub_user", JSON.stringify(userRecord(user)));
        } else {
            localStorage.removeItem("minihub_user");
        }
        return userRecord(user);
    },

    getGames() {
        return GAMES.map(game => ({ ...game }));
    },

    async getScores() {
        if (currentUser() && API_BASE_URL) {
            try {
                const result = await API.request("/scores/me");
                if (Array.isArray(result?.scores)) {
                    const scores = result.scores.map(score => ({
                        username: currentUser().username,
                        game: score.game,
                        score: Number(score.score),
                        playedAt: score.played_at
                    }));
                    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
                    return scores;
                }
            } catch (error) {
                console.warn("Remote scores unavailable; using local scores:", error);
            }
        }
        return readScores();
    },

    async signOut() {
        if (supabaseClient) {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
        }
        localStorage.removeItem("minihub_user");
    },

    getRecentlyPlayed(username) {
        return readScores()
            .filter(score => score.username === username)
            .sort((left, right) => new Date(right.playedAt) - new Date(left.playedAt))
            .slice(0, 6);
    },

    getLeaderboard(gameId = null) {
        if (API_BASE_URL) {
            const remote = gameId
                ? API.request(`/leaderboard/${encodeURIComponent(gameId)}`)
                    .then(result => result?.leaderboard || [])
                : Promise.all(GAMES.map(game => API.request(`/leaderboard/${game.id}`)))
                    .then(results => results.flatMap(result => result?.leaderboard || []));

            return remote.then(rows => rows.map(row => ({
                username: row.username,
                game: row.game || gameId,
                score: Number(row.score),
                playedAt: row.played_at
            })));
        }

        const scores = [...DEMO_SCORES, ...readScores()]
            .filter(score => !gameId || score.game === gameId)
            .sort((left, right) => Number(right.score) - Number(left.score));

        const bestByPlayer = new Map();
        scores.forEach(score => {
            const key = `${score.username}:${score.game}`;
            const existing = bestByPlayer.get(key);
            const isBetter = LOWER_IS_BETTER.has(score.game)
                ? Number(score.score) < Number(existing?.score ?? Infinity)
                : Number(score.score) > Number(existing?.score ?? -Infinity);
            if (!existing || isBetter) {
                bestByPlayer.set(key, score);
            }
        });

        return [...bestByPlayer.values()].sort(
            (left, right) => LOWER_IS_BETTER.has(left.game)
                ? Number(left.score) - Number(right.score)
                : Number(right.score) - Number(left.score)
        );
    },

    saveScore(game, score) {
        const user = currentUser();
        if (!user) return null;

        const scores = readScores();
        const entry = {
            username: user.username,
            game,
            score: Number(score),
            playedAt: new Date().toISOString()
        };
        scores.push(entry);
        localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));

        if (API_BASE_URL && accessToken()) {
            API.request("/scores", {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken()}` },
                body: JSON.stringify({ game, score: Number(score) })
            }).catch(error => console.warn("Remote score sync failed:", error));
        }

        return entry;
    },

    async request(path, options = {}) {
        if (!API_BASE_URL) return null;
        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(accessToken() ? { Authorization: `Bearer ${accessToken()}` } : {}),
                ...(options.headers || {})
            }
        });
        if (!response.ok) throw new Error(`MiniHub API request failed: ${response.status}`);
        return response.json();
    },

    subscribeLeaderboard(game, onUpdate) {
        if (!API_BASE_URL || typeof WebSocket === "undefined") return null;

        const games = game === "all" ? GAMES.map(item => item.id) : [game];
        const sockets = games.map(gameId => {
            const socketUrl = API_BASE_URL.replace(/^http/, "ws")
                + `/ws/leaderboard/${encodeURIComponent(gameId)}`;
            const socket = new WebSocket(socketUrl);
            socket.addEventListener("message", event => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === "score_submitted") onUpdate(message);
                } catch (error) {
                    console.warn("Invalid leaderboard update:", error);
                }
            });
            socket.addEventListener("error", error => {
                console.warn("Leaderboard WebSocket unavailable:", error);
            });
            return socket;
        });
        return () => sockets.forEach(socket => socket.close());
    }
};

window.API = API;

if (supabaseClient) {
    authInitialization = supabaseClient.auth.getSession()
        .then(({ data }) => API.syncAuthUser(data?.session?.user || null))
        .catch(error => {
            console.warn("Supabase session initialization failed:", error);
            return null;
        });

    supabaseClient.auth.onAuthStateChange((_event, session) => {
        API.syncAuthUser(session?.user || null);
    });
}