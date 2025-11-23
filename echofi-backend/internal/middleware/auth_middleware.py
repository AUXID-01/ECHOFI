# internal/middleware/auth_middleware.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from internal.database.db import get_db
from internal.database import models
from internal.database.models import User
from pkg.utils.jwt_handler import decode_access_token
from typing import Annotated

# Setup the OAuth2 scheme for dependency injection
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login", # The path where the client gets the token
    scheme_name="JWT"
)

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)) -> models.User:
    """
    Dependency to validate JWT and retrieve the authenticated user object.
    Applied to all protected routes.
    """
    try:
        # 1. Decode and Validate Token
        payload = decode_access_token(token)
        user_id = payload.get("user_id")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # 2. Retrieve User from Database
        user = db.query(models.User).filter(models.User.id == user_id).first()
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User associated with token not found",
            )
            
        return user
        
    except HTTPException:
        # Re-raise explicit HTTP exceptions
        raise
    except Exception:
        # Catch any general token errors (e.g., malformed token)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    

def role_required(required_role: str):
    """
    Decorator/Dependency that checks if the current user has the required role.
    Usage: Depends(role_required("admin"))
    """
    def role_checker(current_user: User = Depends(get_current_user)):
        # Check if the user's role matches the required role
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User requires the '{required_role}' role to access this resource."
            )
        return current_user
    return role_checker