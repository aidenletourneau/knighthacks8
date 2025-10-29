from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..security import hash_password, verify_password, create_access_token, decode_token


router = APIRouter()


@router.post("/register", response_model=schemas.UserOut)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    existing_username = db.query(models.User).filter(models.User.username == payload.username).first()
    if existing_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")

    user = models.User(
        email=payload.email,
        username=payload.username,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=str(user.id))
    return schemas.TokenResponse(access_token=token)


def _current_user_from_auth_header(request: Request, db: Session) -> models.User:
    auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = auth_header.split(" ", 1)[1]
    subject = decode_token(token)
    if not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.get(models.User, int(subject))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@router.get("/me", response_model=schemas.UserOut)
def me(request: Request, db: Session = Depends(get_db)):
    user = _current_user_from_auth_header(request, db)
    return user


@router.post("/logout")
def logout():
    # Stateless JWT logout handled on the client (remove token)
    return JSONResponse({"success": True})


