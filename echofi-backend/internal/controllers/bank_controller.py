# internal/controllers/bank_controller.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from internal.database.db import get_db
from internal.database.schemas import AccountBase, TransactionResponse, TransferRequest
from internal.middleware.auth_middleware import get_current_user
from internal.services.bank_service import BankService, InsufficientFundsError
from internal.database import models

bank_router = APIRouter(tags=["Banking Operations"], 
                        dependencies=[Depends(get_current_user)]) # <-- PROTECT ALL ROUTES!

@bank_router.get("/bank/balance", response_model=AccountBase)
def get_balance(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetches the user's primary account balance."""
    service = BankService(db)
    balance_info = service.get_account_balance(current_user.id)
    
    if not balance_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found."
        )
        
    return balance_info

@bank_router.get("/bank/history", response_model=List[TransactionResponse])
def get_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetches the transaction history for the user."""
    service = BankService(db)
    return service.get_transaction_history(current_user.id)

# --- Fund Transfer Endpoints ---

@bank_router.post("/bank/transfer/initiate")
def initiate_transfer(request: TransferRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Initiates a fund transfer and returns a unique transfer ID."""
    service = BankService(db)
    
    try:
        transfer_id = service.initiate_transfer(current_user.id, request)
        # Assuming OTP is sent as part of the initiation in a real system
        return {"transfer_id": transfer_id, "message": "Transfer initiated. Please check phone for OTP to confirm."}
    except InsufficientFundsError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@bank_router.post("/bank/transfer/execute")
def execute_transfer(request: TransferRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Finalizes the transfer using the transfer ID and the confirmed OTP/token."""
    service = BankService(db)

    if not request.otp_token:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP token is required to execute transfer.")

    # Note: We use the description field as a mock transfer ID for simplicity here.
    try:
        result = service.execute_transfer(current_user.id, request.description, request.otp_token)
        return {"message": result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))