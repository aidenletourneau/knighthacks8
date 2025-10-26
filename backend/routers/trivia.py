from fastapi import APIRouter, Depends, HTTPException
from ..schemas import schemas
from typing import Annotated
from sqlmodel import Field, Session, SQLModel, create_engine, select
from fastapi import Depends, FastAPI, HTTPException, Query
from dotenv import load_dotenv
from pydantic import BaseModel, TypeAdapter
from typing import List
import os
import json


load_dotenv()

postgres_url = os.getenv("DB_URL")
engine = create_engine(postgres_url, echo=True)


def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]


router = APIRouter(
    prefix="/trivia",
    tags=["trivia"],
    responses={404: {"description": "Not found"}},
)


from google import genai
from google.genai import types

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY env var not set")

client = genai.Client(api_key=api_key)

class PromptRequest(BaseModel):
    topic: str
    numQuestions: int

class Question(BaseModel):
    topic: str 
    question: str
    answer: str



@router.post("/", response_model=list[Question])
def get_questions(req: PromptRequest, session: SessionDep):
    prompt = (
        f"Generate exactly {req.numQuestions} trivia questions about {req.topic}. "
        "Return ONLY JSON (an array). Each item must have fields: topic, question, answer. "
        f"Set topic exactly to '{req.topic}'."
    )

    try:
        resp = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=list[Question], 
            ),
        )

        data = getattr(resp, "parsed", None)
        if data is None:
            data = json.loads(resp.text)

        questions: list[Question] = TypeAdapter(list[Question]).validate_python(data)

        return questions

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))