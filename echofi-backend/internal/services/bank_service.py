# internal/services/bank_service.py

from sqlalchemy.orm import Session
from sqlalchemy import desc
from internal.database import models
from internal.database.schemas import AccountBase, TransactionResponse, TransferRequest
from internal.services.auth_service import get_user_by_identifier 
from internal.services.audit_service import AuditService # <-- IMPORTED FOR AUDITING
from typing import List, Optional
from datetime import datetime
import uuid
import logging

log = logging.getLogger(__name__)

class InsufficientFundsError(Exception):
    """Custom exception for insufficient funds during a transfer."""
    pass

class BankService:
    def __init__(self, db: Session):
        self.db = db
        self.audit_service = AuditService(db) # <-- INITIALIZED AUDIT SERVICE

    def get_account_balance(self, user_id: int) -> Optional[AccountBase]:
        """Fetches the user's primary account balance."""
        account = self.db.query(models.Account).filter(models.Account.user_id == user_id).first()
        
        if account:
            # Log successful balance check <-- AUDIT LOGGING ADDED
            self.audit_service.log_action(
                user_id=user_id, 
                action="BALANCE_CHECKED", 
                metadata={"account_id": account.account_number}
            )
            return AccountBase.model_validate(account)
        
        # Log failed check <-- AUDIT LOGGING ADDED
        self.audit_service.log_action(
            user_id=user_id, 
            action="BALANCE_CHECK_FAILED", 
            metadata={"reason": "Account not found"}
        )
        return None

    def get_transaction_history(self, user_id: int, limit: int = 10) -> List[TransactionResponse]:
        """Fetches the N most recent transactions for the user."""
        transactions = self.db.query(models.Transaction)\
            .filter(models.Transaction.user_id == user_id)\
            .order_by(desc(models.Transaction.initiated_at))\
            .limit(limit)\
            .all()
            
        # Log successful history view (optional, but good for compliance)
        self.audit_service.log_action(
            user_id=user_id, 
            action="HISTORY_VIEWED", 
            metadata={"limit": limit}
        )
            
        # Map SQLAlchemy models to Pydantic schemas
        return [TransactionResponse.model_validate(t) for t in transactions]

    def initiate_transfer(self, user_id: int, request: TransferRequest) -> str:
        """
        Initiates a fund transfer, performs basic validation, and logs the intent.
        """
        source_account = self.db.query(models.Account)\
            .filter(models.Account.user_id == user_id, models.Account.account_number == request.source_account)\
            .first()
            
        if not source_account:
            self.audit_service.log_action(user_id, "TRANSFER_INIT_FAILED", {"reason": "Source account not found"})
            raise ValueError("Source account not found for this user.")

        if source_account.balance < request.amount:
            self.audit_service.log_action(user_id, "TRANSFER_INIT_FAILED", {"reason": "Insufficient funds", "amount": request.amount})
            raise InsufficientFundsError("Insufficient funds for this transfer.")

        # 1. Log the initiation attempt (Audit Log)
        transfer_id = str(uuid.uuid4())
        
        # 2. Create PENDING transaction log
        pending_txn = models.Transaction(
            user_id=user_id,
            transaction_type="transfer",
            amount=request.amount,
            recipient_account=request.recipient_account,
            status="pending",
            description=f"[PENDING] {request.description}",
            initiated_at=datetime.now()
        )
        self.db.add(pending_txn)
        self.db.commit() # Commit the PENDING transaction
        
        # Log the initiation for auditing <-- AUDIT LOGGING ADDED
        self.audit_service.log_action(
            user_id=user_id, 
            action="TRANSFER_INITIATED", 
            metadata={"transfer_id": transfer_id, "amount": request.amount, "recipient": request.recipient_account}
        )
        
        return transfer_id

    def execute_transfer(self, user_id: int, transfer_id: str, otp_token: str) -> str:
        """
        Finalizes the fund transfer after successful OTP verification.
        Uses database transaction control for atomicity (ACID).
        """
        # Find the pending transaction
        pending_txn = self.db.query(models.Transaction)\
            .filter(models.Transaction.user_id == user_id, 
                    models.Transaction.status == "pending")\
            .first()

        if not pending_txn:
            # Log failed execution attempt <-- AUDIT LOGGING ADDED
            self.audit_service.log_action(user_id, "TRANSFER_EXECUTE_FAILED", {"reason": "No pending txn found"})
            raise ValueError("Pending transfer not found or already executed.")
            
        # 1. VERIFY OTP TOKEN 
        if otp_token != "MOCK_OTP_SUCCESS": 
            # Log failed OTP/token check <-- AUDIT LOGGING ADDED
            self.audit_service.log_action(user_id, "TRANSFER_EXECUTE_FAILED", {"reason": "Invalid OTP/Token"})
            raise ValueError("OTP/Transfer token is invalid or expired.")
        
        # 2. Perform Atomic Transaction (Using a dedicated SQLAlchemy session transaction)
        try:
            source_account = self.db.query(models.Account)\
                .filter(models.Account.user_id == user_id)\
                .first()

            # Debit
            source_account.balance -= pending_txn.amount
            
            # Update pending transaction status
            pending_txn.status = "completed"
            pending_txn.description = pending_txn.description.replace("[PENDING]", "[COMPLETED]")
            
            self.db.commit()
            
            # Log successful execution <-- AUDIT LOGGING ADDED
            self.audit_service.log_action(user_id, "TRANSFER_COMPLETED", {"transfer_id": transfer_id, "status": "COMPLETED"})
            return f"Transfer {transfer_id} executed successfully. New balance: {source_account.balance:.2f}"
            
        except Exception as e:
            self.db.rollback()
            # Update status to failed
            pending_txn.status = "failed"
            self.db.commit()
            
            # Log failed execution <-- AUDIT LOGGING ADDED
            self.audit_service.log_action(user_id, "TRANSFER_COMPLETED_FAILED", {"transfer_id": transfer_id, "error": str(e)})
            log.error(f"Transaction failed for {transfer_id}: {e}")
            raise Exception("Transfer failed due to a system error or rollback.")