# internal/services/auth_service.py (Final Code with Tokenization)

from sqlalchemy.orm import Session
from internal.database import models
from internal.database.schemas import UserCreate
from pkg.utils.security import get_password_hash, verify_password, hash_for_lookup # <-- NEW IMPORT
from pkg.utils.jwt_handler import create_access_token
from internal.services.audit_service import AuditService
from pkg.utils.encryption_handler import encrypt_data, decrypt_data 
import string
import random
from typing import Optional
from datetime import datetime, timedelta

# --- Helper Functions (Keep these outside the class) ---

def generate_account_number() -> str:
    """Generates a mock 12-digit account number."""
    digits = ''.join(random.choices(string.digits, k=9))
    return f"500{digits}"

def get_user_by_identifier(db: Session, identifier: str) -> Optional[models.User]:
    """
    Clean lookup:
    - Email → hashed
    - Phone → hashed
    - Username → plaintext
    """

    # EMAIL
    if "@" in identifier:
        hashed = hash_for_lookup(identifier)
        return db.query(models.User).filter(models.User.email == hashed).first()

    # PHONE
    if identifier.isdigit():
        hashed = hash_for_lookup(identifier)
        return db.query(models.User).filter(models.User.phone == hashed).first()

    # USERNAME
    return db.query(models.User).filter(models.User.username == identifier).first()



# --- Core Service Logic ---

def create_user_and_account(db: Session, user: UserCreate) -> models.User:
    """Creates a new user and their initial savings account, protecting PII."""
    
    # Use the email to check for existing users (by hashing it first)
    # Check EMAIL collision
    if get_user_by_identifier(db, user.email):
        raise ValueError("User with this email already exists.")

    # Check USERNAME collision
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise ValueError("Username already taken.")

    # Check PHONE collision
    hashed_phone = hash_for_lookup(user.phone)
    if db.query(models.User).filter(models.User.phone == hashed_phone).first():
        raise ValueError("Phone number already registered.")

        
    hashed_password = get_password_hash(user.password)
    
    # 1. Store PII as HASHES/TOKENS for lookup compliance
    db_user = models.User(
        username=user.username,
        email=hash_for_lookup(user.email),   # <-- NOW STORES HASH
        phone=hash_for_lookup(user.phone),   # <-- NOW STORES HASH
        password_hash=hashed_password,
        role="customer"
    )
    # NOTE: If we wanted to store the *original* email, we would encrypt it 
    # (e.g., email_encrypted=encrypt_data(user.email)) in a separate column here.
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # 2. Create Initial Account 
    db_account = models.Account(
        user_id=db_user.id,
        account_number=generate_account_number(),
        account_type="savings",
        balance=1000.00
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)

    # -------------------------------
    # INSERT DUMMY TRANSACTIONS
    # -------------------------------

    dummy_descriptions = [
        "Initial Deposit",
        "Online Shopping",
        "Electricity Bill",
        "Coffee Shop",
        "Mobile Recharge"
    ]

    for i in range(5):
        ttype = random.choice(["credit", "debit"])
        amount = round(random.uniform(100, 2500), 2)

        txn = models.Transaction(
            user_id=db_user.id,
            transaction_type=ttype,
            amount=amount,
            recipient_account=db_account.account_number if ttype == "credit" else "VENDOR",
            status="completed",
            description=dummy_descriptions[i],
            initiated_at=datetime.now() - timedelta(days=i)
        )

        # Adjust account balance (optional but realistic)
        if ttype == "credit":
            db_account.balance += amount
        else:
            db_account.balance -= amount

        db.add(txn)

    db.commit()  # save all dummy transactions + balance updates

        # Log registration event
    AuditService(db).log_action(
        user_id=db_user.id,
        action="USER_REGISTERED",
        metadata={"email_prefix": user.email[:4], "phone_prefix": user.phone[:4]}
    )

    return db_user


    # 3. Log the action
    AuditService(db).log_action(
        user_id=db_user.id, 
        action="USER_REGISTERED", 
        metadata={"email_prefix": user.email[:4], "phone_prefix": user.phone[:4]}
    )
    
    
    return db_user

def authenticate_user(db: Session, identifier: str, password: str) -> Optional[str]:
    """Authenticates a user and returns an access token if successful."""
    
    # Lookup: The identifier is automatically hashed inside get_user_by_identifier
    user = get_user_by_identifier(db, identifier) 
    
    if not user:
        AuditService(db).log_action(user_id=None, action="LOGIN_FAILED", metadata={"identifier": identifier, "reason": "User not found"})
        return None
    
    # Verify password hash
    if not verify_password(password, user.password_hash):
        AuditService(db).log_action(user_id=user.id, action="LOGIN_FAILED", metadata={"identifier": identifier, "reason": "Invalid password"})
        return None
        
    # Generate JWT Token (Success)
    access_token = create_access_token(data={"user_id": user.id, "role": user.role})
    
    AuditService(db).log_action(user_id=user.id, action="USER_LOGIN_SUCCESS", metadata={"identifier": identifier, "token_issued": True})
    
    return access_token



