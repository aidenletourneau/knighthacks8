from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import os

from .routers import auth
from .database import init_db


app = FastAPI(title="Knighthacks8 API", openapi_url="/api/openapi.json")

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/api/health")
def health() -> JSONResponse:
    return JSONResponse({"status": "ok"})


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])


