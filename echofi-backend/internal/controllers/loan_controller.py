# internal/controllers/loan_controller.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from internal.database.db import get_db
from internal.database.schemas import LoanRequest, LoanResponse, ReminderCreate, ReminderResponse
from internal.middleware.auth_middleware import get_current_user
from internal.services.loan_service import LoanService
from internal.services.reminder_service import ReminderService
from internal.database import models

loan_router = APIRouter(tags=["Loans & Reminders"], 
                        dependencies=[Depends(get_current_user)]) 

@loan_router.post("/loans/apply", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
def apply_loan(request: LoanRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Handles the loan application and mock disbursement flow."""
    service = LoanService(db)
    
    try:
        loan = service.apply_and_disburse_loan(current_user.id, request)
        
        # Optionally create a corresponding reminder for the first payment
        reminder_service = ReminderService(db)
        reminder_service.create_reminder(
            user_id=current_user.id,
            title=f"Loan EMI: {loan.loan_type}",
            due_date=loan.next_due_date,
            amount=loan.monthly_emi,
            frequency="monthly"
        )
        
        return loan
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Loan application failed: {e}")

@loan_router.get("/loans/me", response_model=List[LoanResponse])
def get_loans(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetches all active loans for the authenticated user."""
    service = LoanService(db)
    return service.get_user_loans(current_user.id)
