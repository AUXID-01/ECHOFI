# internal/services/loan_service.py

from sqlalchemy.orm import Session
from internal.database import models
from internal.database.schemas import LoanRequest, LoanResponse
from internal.services.audit_service import AuditService
from datetime import datetime, timedelta
from typing import List, Optional

class LoanService:
    def __init__(self, db: Session):
        self.db = db
        self.audit_service = AuditService(db)

    def apply_and_disburse_loan(self, user_id: int, request: LoanRequest) -> models.Loan:
        """
        Mocks the approval, disbursement, and loan creation process.
        Immediately approves and disburses for the prototype.
        """
        # 1. Mock Approval and Disburse
        
        # Calculate a mock EMI (Simplified: Principal / Term)
        # Note: A real system uses complex amortization formulas.
        monthly_emi = (request.principal_amount / request.term_months) * (1 + request.interest_rate / 12)
        
        # 2. Create the Loan Record
        new_loan = models.Loan(
            user_id=user_id,
            loan_type=request.loan_type,
            principal_amount=request.principal_amount,
            interest_rate=request.interest_rate,
            term_months=request.term_months,
            start_date=datetime.now(),
            next_due_date=datetime.now() + timedelta(days=30), # First payment due in 30 days
            monthly_emi=monthly_emi,
            status="active"
        )
        self.db.add(new_loan)
        
        # 3. Disburse Funds to User Account (Mock Credit)
        user_account = self.db.query(models.Account).filter(models.Account.user_id == user_id).first()
        if user_account:
            user_account.balance += request.principal_amount
            
            # Log disbursement as a Transaction
            disbursement_txn = models.Transaction(
                user_id=user_id,
                transaction_type="credit",
                amount=request.principal_amount,
                recipient_account="N/A (Disbursement)",
                status="completed",
                description=f"Loan disbursement for {request.loan_type}",
                initiated_at=datetime.now()
            )
            self.db.add(disbursement_txn)

        self.db.commit()
        self.db.refresh(new_loan)
        
        self.audit_service.log_action(user_id, "LOAN_DISBURSED", {"loan_id": new_loan.id, "amount": request.principal_amount})
        return new_loan

    def get_user_loans(self, user_id: int) -> List[LoanResponse]:
        """Fetches all active loans for the given user."""
        loans = self.db.query(models.Loan).filter(
            models.Loan.user_id == user_id,
            models.Loan.status == "active"
        ).all()
        
        # Use LoanResponse schema for clean API output
        return [LoanResponse.model_validate(loan) for loan in loans]
    
    def get_loan_details(self, user_id: int, loan_id: int) -> Optional[models.Loan]:
        """Fetches a specific loan record for a user."""
        loan = self.db.query(models.Loan).filter(
            models.Loan.user_id == user_id,
            models.Loan.id == loan_id
        ).first()
        
        if loan:
            self.audit_service.log_action(user_id, "LOAN_VIEWED", {"loan_id": loan_id})
        
        return loan

    def process_loan_repayment(self, user_id: int, loan_id: int, payment_amount: float) -> str:
        """
        Processes a loan repayment (EMI). Debits the user's account and updates 
        the Repayment and Loan records atomically.
        """
        loan = self.db.query(models.Loan).filter(
            models.Loan.user_id == user_id,
            models.Loan.id == loan_id,
            models.Loan.status == "active"
        ).first()

        if not loan:
            self.audit_service.log_action(user_id, "REPAYMENT_FAILED", {"reason": "Loan not found or inactive"})
            raise ValueError("Active loan not found for repayment.")
        
        user_account = self.db.query(models.Account).filter(models.Account.user_id == user_id).first()
        
        if user_account.balance < payment_amount:
            self.audit_service.log_action(user_id, "REPAYMENT_FAILED", {"loan_id": loan_id, "reason": "Insufficient funds"})
            raise ValueError("Insufficient funds to cover EMI payment.")

        # --- Begin Atomic Transaction ---
        try:
            # 1. Debit User Account
            user_account.balance -= payment_amount
            
            # 2. Log Repayment Transaction (Transaction Table)
            repayment_txn = models.Transaction(
                user_id=user_id,
                transaction_type="debit",
                amount=payment_amount,
                recipient_account=f"Loan Repayment {loan_id}",
                status="completed",
                description=f"EMI payment for {loan.loan_type} Loan ID {loan_id}",
                initiated_at=datetime.now()
            )
            self.db.add(repayment_txn)
            
            # 3. Log Repayment Record (Repayment Table)
            repayment_record = models.Repayment(
                loan_id=loan.id,
                amount=payment_amount,
                is_successful=True,
                payment_date=datetime.now()
            )
            self.db.add(repayment_record)
            
            # 4. Update Loan Status/Due Date
            # Simple update for prototype: Move the due date forward 
            loan.next_due_date = loan.next_due_date + timedelta(days=30) 
            
            self.db.commit()
            
            self.audit_service.log_action(user_id, "REPAYMENT_SUCCESS", {"loan_id": loan_id, "amount": payment_amount})
            return f"Repayment of {payment_amount} processed successfully."

        except Exception as e:
            self.db.rollback()
            self.audit_service.log_action(user_id, "REPAYMENT_FAILED", {"loan_id": loan_id, "error": str(e)})
            raise Exception("System failed to process repayment atomically.")
        # --- End Atomic Transaction ---