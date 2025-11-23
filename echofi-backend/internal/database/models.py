# internal/database/models.py

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

# Base class for all models
Base = declarative_base()

class User(Base):
    """Represents a customer or administrator of EchoFi."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False)
    # Storing bcrypt hash
    password_hash = Column(String, nullable=False) 
    phone = Column(String, unique=True, nullable=False)
    # RBAC: 'customer', 'admin'
    role = Column(String, default="customer", nullable=False) 
    
    # Relationships
    accounts = relationship("Account", back_populates="owner")
    transactions = relationship("Transaction", back_populates="user")
    
    # GORM-like timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Account(Base):
    """Holds the financial details for a user."""
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    account_number = Column(String, unique=True, nullable=False)
    # 'savings', 'checking'
    account_type = Column(String, default="savings", nullable=False) 
    balance = Column(Float, default=0.0, nullable=False)
    
    # Relationship
    owner = relationship("User", back_populates="accounts")
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Transaction(Base):
    """Logs all movements of funds."""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    # 'debit', 'credit', 'transfer'
    transaction_type = Column(String, nullable=False) 
    amount = Column(Float, nullable=False)
    # Target account number or external ID
    recipient_account = Column(String) 
    # 'pending', 'completed', 'failed'
    status = Column(String, default="pending", nullable=False) 
    description = Column(String)
    initiated_at = Column(DateTime, default=func.now(), nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="transactions")

class AuditLog(Base):
    """Tracks every major system action for compliance."""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True) # 0 if system action
    action = Column(String, nullable=False) # e.g., 'LOGIN', 'TRANSFER_INIT'
    # RENAME THIS FIELD
    details = Column(String) # Renamed from 'metadata' to 'details'
    created_at = Column(DateTime, default=func.now())


class Loan(Base):
    """Tracks the terms and status of an approved loan."""
    __tablename__ = "loans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    loan_type = Column(String, nullable=False) # e.g., 'Home', 'Personal', 'Auto'
    principal_amount = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    term_months = Column(Integer, nullable=False)
    
    start_date = Column(DateTime, nullable=False)
    next_due_date = Column(DateTime, nullable=False, index=True)
    monthly_emi = Column(Float, nullable=False)
    
    status = Column(String, default="active", nullable=False) # 'active', 'paid', 'default'
    
    repayments = relationship("Repayment", back_populates="loan")
    
class Repayment(Base):
    """Logs individual EMI payments made against a loan."""
    __tablename__ = "repayments"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False, index=True)
    
    amount = Column(Float, nullable=False)
    payment_date = Column(DateTime, default=func.now())
    is_successful = Column(Boolean, default=False)
    
    loan = relationship("Loan", back_populates="repayments")


class Reminder(Base):
    """Stores user-defined payment reminders."""
    __tablename__ = "reminders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    title = Column(String, nullable=False) # e.g., "Rent Payment"
    amount = Column(Float, default=0.0)
    
    due_date = Column(DateTime, nullable=False, index=True)
    # Allows for simple scheduling: 'once', 'monthly', 'weekly'
    frequency = Column(String, default="once") 
    is_active = Column(Boolean, default=True)
    last_sent_date = Column(DateTime)

# --- Bills ---
class Bill(Base):
    __tablename__ = "bills"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    payee = Column(String, nullable=False)          # e.g., "Electricity Co."
    bill_type = Column(String, nullable=False)      # e.g., "electricity", "mobile"
    amount = Column(Float, nullable=False)
    due_date = Column(DateTime, nullable=False, index=True)
    is_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User")  # basic backref

class BillPayment(Base):
    __tablename__ = "bill_payments"
    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("bills.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    transaction_id = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    status = Column(String, default="pending")  # 'pending','completed','failed'
    created_at = Column(DateTime, default=func.now())

    bill = relationship("Bill")
    user = relationship("User")

# --- Notifications ---
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    level = Column(String, default="info")  # info, warning, critical
    created_at = Column(DateTime, default=func.now())

    user = relationship("User")
