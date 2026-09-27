import os
from collections import defaultdict
from datetime import datetime, timezone
from typing import DefaultDict

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5500,http://127.0.0.1:5500"
    ).split(",")
    if origin.strip()
]

if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is missing from .env")

if not SUPABASE_SECRET_KEY:
    raise RuntimeError("SUPABASE_SECRET_KEY is missing from .env")


# ============================================================
# SUPABASE CLIENT
# ============================================================

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY
)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="MiniHub API",
    description="Backend API for MiniHub games",
    version="1.0.0"
)


class LeaderboardConnectionManager:
    def __init__(self):
        self.connections: DefaultDict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, game: str, websocket: WebSocket):
        await websocket.accept()
        self.connections[game].add(websocket)

    def disconnect(self, game: str, websocket: WebSocket):
        self.connections[game].discard(websocket)
        if not self.connections[game]:
            del self.connections[game]

    async def broadcast(self, game: str, payload: dict):
        stale = []
        for websocket in self.connections.get(game, set()).copy():
            try:
                await websocket.send_json(payload)
            except Exception:
                stale.append(websocket)
        for websocket in stale:
            self.disconnect(game, websocket)


leaderboard_connections = LeaderboardConnectionManager()


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# MODELS
# ============================================================

class SignupRequest(BaseModel):
    email: str
    password: str
    username: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ScoreRequest(BaseModel):
    game: str
    score: int


ALLOWED_GAMES = {
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
}
LOWER_IS_BETTER_GAMES = {"sudoku", "minesweeper", "reaction"}


# ============================================================
# BASIC ROUTE
# ============================================================

@app.get("/")
def root():
    return {
        "message": "MiniHub API is running",
        "status": "online"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "supabase": "connected"
    }


# ============================================================
# SIGN UP
# ============================================================

@app.post("/auth/signup")
def signup(data: SignupRequest):

    # Check whether username already exists
    existing_username = (
        supabase
        .table("profiles")
        .select("id")
        .eq("username", data.username)
        .execute()
    )

    if existing_username.data:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # Create Supabase Auth user
    try:
        response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password
        })
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    if not response.user:
        raise HTTPException(
            status_code=400,
            detail="Could not create account"
        )

    user_id = response.user.id

    # Create profile
    try:
        supabase.table("profiles").insert({
            "id": user_id,
            "username": data.username
        }).execute()

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Account created but profile creation failed: {str(e)}"
        )

    return {
        "message": "Account created successfully",
        "user": {
            "id": user_id,
            "email": data.email,
            "username": data.username
        }
    }


# ============================================================
# LOGIN
# ============================================================

@app.post("/auth/login")
def login(data: LoginRequest):

    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not response.user or not response.session:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Get username
    profile = (
        supabase
        .table("profiles")
        .select("username")
        .eq("id", response.user.id)
        .single()
        .execute()
    )

    username = None

    if profile.data:
        username = profile.data.get("username")

    return {
        "message": "Login successful",
        "user": {
            "id": response.user.id,
            "email": response.user.email,
            "username": username
        },
        "session": {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token
        }
    }


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(authorization: str | None):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header"
        )

    token = authorization.replace("Bearer ", "", 1)

    try:
        response = supabase.auth.get_user(token)

        if not response.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token"
            )

        return response.user

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


# ============================================================
# PROFILE
# ============================================================

@app.get("/profile")
def get_profile(
    authorization: str | None = Header(default=None)
):

    user = get_current_user(authorization)

    profile = (
        supabase
        .table("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .execute()
    )

    if not profile.data:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return {
        "profile": profile.data
    }


# ============================================================
# SUBMIT SCORE
# ============================================================

@app.post("/scores")
async def submit_score(
    data: ScoreRequest,
    authorization: str | None = Header(default=None)
):

    user = get_current_user(authorization)

    if data.score < 0:
        raise HTTPException(
            status_code=400,
            detail="Score cannot be negative"
        )

    if data.game not in ALLOWED_GAMES:
        raise HTTPException(
            status_code=400,
            detail="Invalid game"
        )

    score_data = {
        "user_id": user.id,
        "game": data.game,
        "score": data.score,
        "played_at": datetime.now(timezone.utc).isoformat()
    }

    try:
        result = (
            supabase
            .table("game_scores")
            .insert(score_data)
            .execute()
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    response = {
        "message": "Score saved",
        "score": result.data[0] if result.data else score_data
    }
    await leaderboard_connections.broadcast(data.game, {
        "type": "score_submitted",
        "game": data.game,
        "score": response["score"]
    })
    return response


@app.websocket("/ws/leaderboard/{game}")
async def leaderboard_websocket(websocket: WebSocket, game: str):
    if game not in ALLOWED_GAMES:
        await websocket.close(code=1008, reason="Invalid game")
        return

    await leaderboard_connections.connect(game, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        leaderboard_connections.disconnect(game, websocket)


# ============================================================
# USER'S SCORES
# ============================================================

@app.get("/scores/me")
def get_my_scores(
    authorization: str | None = Header(default=None)
):

    user = get_current_user(authorization)

    try:
        result = (
            supabase
            .table("game_scores")
            .select("*")
            .eq("user_id", user.id)
            .order("played_at", desc=True)
            .execute()
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    return {
        "scores": result.data
    }


# ============================================================
# LEADERBOARD
# ============================================================

@app.get("/leaderboard/{game}")
def leaderboard(game: str):

    if game not in ALLOWED_GAMES:
        raise HTTPException(
            status_code=400,
            detail="Invalid game"
        )

    try:

        result = (
            supabase
            .table("game_scores")
            .select(
                "score, played_at, profiles(username)"
            )
            .eq("game", game)
            .order("score", desc=game not in LOWER_IS_BETTER_GAMES)
            .limit(100)
            .execute()
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    leaderboard_data = []

    for index, row in enumerate(result.data or [], start=1):

        profile = row.get("profiles")

        username = "Unknown"

        if profile:
            username = profile.get("username", "Unknown")

        leaderboard_data.append({
            "rank": index,
            "username": username,
                "game": game,
            "score": row["score"],
            "played_at": row["played_at"]
        })

    return {
        "game": game,
        "leaderboard": leaderboard_data
    }