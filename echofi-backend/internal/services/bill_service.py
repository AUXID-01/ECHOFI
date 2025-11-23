from sqlalchemy.orm import Session
from internal.database import models
from internal.services.audit_service import AuditService
from datetime import datetime
import uuid

class BillService:
    def __init__(self, db: Session):
        self.db = db
        self.audit = AuditService(db)

    def list_bills_for_user(self, user_id: int):
        return self.db.query(models.Bill).filter(models.Bill.user_id == user_id).order_by(models.Bill.due_date).all()

    def create_bill(self, user_id: int, bill_data):
        bill = models.Bill(
            user_id=user_id,
            payee=bill_data.payee,
            bill_type=bill_data.bill_type,
            amount=bill_data.amount,
            due_date=bill_data.due_date
        )
        self.db.add(bill)
        self.db.commit()
        self.db.refresh(bill)
        self.audit.log_action(user_id, "BILL_CREATED", {"bill_id": bill.id})
        return bill

    def pay_bill(self, user_id: int, bill_id: int, otp_token: str = None):
        bill = self.db.query(models.Bill).filter(models.Bill.id == bill_id, models.Bill.user_id == user_id).first()
        if not bill:
            raise ValueError("Bill not found")
        if bill.is_paid:
            raise ValueError("Bill already paid")

        if otp_token != "MOCK_OTP_SUCCESS":
            raise ValueError("Invalid OTP/Token")

        payment = models.BillPayment(
            bill_id=bill.id,
            user_id=user_id,
            amount=bill.amount,
            status="completed",
            transaction_id=str(uuid.uuid4()),
            created_at=datetime.now()
        )
        bill.is_paid = True

        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)

        self.audit.log_action(user_id, "BILL_PAID", {"bill_id": bill.id, "payment_id": payment.id})
        return payment
