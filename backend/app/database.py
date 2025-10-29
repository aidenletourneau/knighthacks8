from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://appuser:apppass@localhost:5432/appdb",
)


class Base(DeclarativeBase):
    pass


engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def init_db() -> None:
    from . import models  # noqa: F401 ensure models import registers metadata
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


