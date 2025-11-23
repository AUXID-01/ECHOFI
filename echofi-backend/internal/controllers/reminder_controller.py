# internal/controllers/reminder_controller.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from internal.database.db import get_db
from internal.database.schemas import ReminderCreate, ReminderResponse
from internal.middleware.auth_middleware import get_current_user
from internal.services.reminder_service import ReminderService
from internal.database import models

reminder_router = APIRouter(tags=["Reminders"], 
                            dependencies=[Depends(get_current_user)]) 

@reminder_router.post("/reminders/set", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def set_new_reminder(request: ReminderCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Allows the user/NLP to set a custom payment reminder."""
    service = ReminderService(db)
    try:
        reminder = service.create_reminder(
            user_id=current_user.id,
            title=request.title,
            due_date=request.due_date,
            amount=request.amount,
            frequency=request.frequency
        )
        return reminder
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to set reminder: {e}")

@reminder_router.get("/reminders/me", response_model=List[ReminderResponse])
def get_user_reminders(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetches all active reminders for the authenticated user."""
    service = ReminderService(db)
    reminders = service.get_reminders_by_user(current_user.id)
    return reminders