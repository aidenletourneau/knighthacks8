from fastapi import APIRouter, Depends, HTTPException
from ..schemas import schemas
from typing import Annotated
from sqlmodel import Field, Session, SQLModel, create_engine, select
from fastapi import Depends, FastAPI, HTTPException, Query, Request
from dotenv import load_dotenv
from ..schemas import schemas
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
import hashlib
import os

load_dotenv()

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)

postgres_url = os.getenv("DB_URL")
engine = create_engine(postgres_url, echo=True)
# oauth = OAuth()

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

def hash_string_to_hex(input_string: str) -> str:
    encoded_string = str(input_string).encode('utf-8')

    hasher = hashlib.sha256()

    hasher.update(encoded_string)

    hex_digest = hasher.hexdigest()

    return hex_digest



@router.post("/signup")
def signup(user : schemas.User, session: SessionDep):

    # hash password
    user.password = hash_string_to_hex(user.password)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user



@router.post("/login")
def login(login : schemas.Login, session: SessionDep):
    
    user = session.get(schemas.User, login.username)
    
    hashedPassword = hash_string_to_hex(login.password)
    if hashedPassword != user.password:
        raise HTTPException(status_code=400, detail="Invalid Username or Password")
    
    return user