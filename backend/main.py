from typing import Annotated
from contextlib import asynccontextmanager

from pydantic import BaseModel
from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select
from fastapi import APIRouter
from .routers import gemini, auth
from fastapi.responses import RedirectResponse, HTMLResponse
from urllib.parse import urlencode
from fastapi import Request, Response
import httpx
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from dotenv import load_dotenv
import os

load_dotenv()

postgres_url = os.getenv("DB_URL")

engine = create_engine(postgres_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

def get_session():
    with Session(engine) as session:
        yield session


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SessionMiddleware, secret_key="some-random-string")


app.include_router(auth.router, dependencies=[Depends(get_session)])
app.include_router(gemini.router, dependencies=[Depends(get_session)])
