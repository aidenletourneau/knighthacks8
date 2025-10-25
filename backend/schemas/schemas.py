from sqlmodel import Field, SQLModel
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import uuid
from pydantic import UUID4


class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    age: int | None = Field(default=None, index=True)
    secret_name: str

class GeminiPacket(SQLModel):
    prompt: str
    user: str = Field(default=None, foreign_key="User.username")

class User(SQLModel, table=True):
    __tablename__ = "User"

    username: str = Field(unique=True, primary_key=True)
    password: str
    email: Optional[str] = Field(default=None, unique=True)
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Session(SQLModel, table=True):
    user:  str = Field(default=None, foreign_key="User.username")    
    id:  uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Login(SQLModel):
    username: str
    password: str