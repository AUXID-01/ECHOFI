# internal/controllers/auth_controller.py (Corrected)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel # <-- ADDED: Needed for OTPRequest
from typing import Annotated # <-- Added for cleaner dependency injection (optional, but good practice)

from internal.database.db import get_db
from internal.database.schemas import UserCreate, LoginRequest, TokenResponse, User
from internal.services import auth_service
from pkg.utils import otp_handler
from internal.database import models # <-- ADDED: Needed for models.User query in verify_otp
from pkg.utils.security import hash_for_lookup
from internal.middleware.auth_middleware import get_current_user



auth_router = APIRouter(tags=["Auth & Security"])

# --- Request Schema for OTP verification ---
class OTPRequest(BaseModel):
    phone: str
    code: str

# --- New Endpoints ---

@auth_router.post("/auth/send-otp")
# FIX: Use LoginRequest directly as the request body. 
# We'll rename the argument for clarity on what it represents.
@auth_router.post("/auth/send-otp")
def send_otp(login_data: LoginRequest, db: Session = Depends(get_db)):

    user = auth_service.get_user_by_identifier(db, login_data.identifier)
    if not user:
        raise HTTPException(404, "User not found")

    if not auth_service.verify_password(login_data.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")

    print("MOCK OTP SENT: 1234")   # Only logs
    return {"message": "OTP sent successfully (mock)", "mock_code": "1234"}


@auth_router.post("/auth/verify-otp", response_model=TokenResponse)
@auth_router.post("/auth/verify-otp", response_model=TokenResponse)
def verify_otp_and_login(request: OTPRequest, db: Session = Depends(get_db)):

    # Always use mock OTP = 1234
    if request.code != "1234":
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired OTP code."
        )

    # Find the user using hashed phone
    hashed_phone = hash_for_lookup(request.phone)
    user = db.query(models.User).filter(models.User.phone == hashed_phone).first()

    if not user:
        raise HTTPException(404, "User not found")

    # Create token
    from pkg.utils.jwt_handler import create_access_token
    token = create_access_token({"user_id": user.id, "role": user.role})

    return TokenResponse(access_token=token)


# --- Registration Endpoint (Unchanged) ---
@auth_router.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = auth_service.create_user_and_account(db, user)
        return {
            "message": "Registration successful",
            "user_id": db_user.id
        }
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    except Exception:
        raise HTTPException(500, detail="Account setup failed. Please try again.")


# --- Login Endpoint (Unchanged) ---
@auth_router.post("/auth/login", response_model=TokenResponse)
def login_for_access_token(form_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticates the user and returns a JWT access token."""
    access_token = auth_service.authenticate_user(
        db=db, 
        identifier=form_data.identifier, 
        password=form_data.password
    )
    
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username, email, phone, or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Log the successful login
    # user = auth_service.get_user_by_identifier(db, form_data.identifier)
    # audit_service.log_action(db, user.id, "USER_LOGIN") 
    
    return TokenResponse(access_token=access_token)
@auth_router.get("/auth/me", response_model=User)
def get_me(current_user: models.User = Depends(get_current_user)):
    """
    Returns the authenticated user's profile.
    """
    return current_user
