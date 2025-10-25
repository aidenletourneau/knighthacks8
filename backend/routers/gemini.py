from fastapi import APIRouter, Depends, HTTPException
from ..schemas import schemas
from typing import Annotated
from sqlmodel import Field, Session, SQLModel, create_engine, select
from fastapi import Depends, FastAPI, HTTPException, Query
from dotenv import load_dotenv

import os

load_dotenv()

postgres_url = os.getenv("DB_URL")
engine = create_engine(postgres_url, echo=True)


def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

router = APIRouter(
    prefix="/gemini",
    tags=["gemini"],
    responses={404: {"description": "Not found"}},
)





@router.post("/")
def get_questions(prompt: schemas.GeminiPacket, session: SessionDep) -> schemas.Hero:
    
    


    session.add(prompt)
    session.commit()
    session.refresh(prompt)
    return prompt

