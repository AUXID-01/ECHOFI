# internal/database/schemas.py

from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

# --- Base Schemas (Used for data coming out of the API) ---

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    phone: str
    role: str

class User(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# --- Request Schemas (Used for data coming into the API) ---

class UserCreate(UserBase):
    password: str

class LoginRequest(BaseModel):
    identifier: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- Banking Schemas ---

class AccountBase(BaseModel):
    account_number: str
    account_type: str
    balance: float

    model_config = ConfigDict(from_attributes=True)

class TransactionResponse(BaseModel):
    transaction_type: str
    amount: float
    recipient_account: Optional[str] = None
    status: str
    description: Optional[str] = None
    initiated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TransferRequest(BaseModel):
    source_account: str
    recipient_account: str
    amount: float
    description: str
    otp_token: Optional[str] = None


# --- NLP/Assistant Schemas ---

class NLPEntity(BaseModel):
    entity: str
    value: str

class NLPRequest(BaseModel):
    user_id: int
    intent: str
    entities: List[NLPEntity]

class NLPResponse(BaseModel):
    status: str
    response_text: str
    data: Optional[dict] = None


# --- Loan Schemas ---

class LoanRequest(BaseModel):
    principal_amount: float
    loan_type: str
    term_months: int
    interest_rate: float

class LoanResponse(BaseModel):
    id: int
    user_id: int
    loan_type: str
    principal_amount: float
    interest_rate: float
    term_months: int
    monthly_emi: float
    start_date: datetime
    next_due_date: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)


# --- Reminder Schemas ---

class ReminderCreate(BaseModel):
    title: str
    amount: float
    due_date: datetime
    frequency: str = "once"

class ReminderResponse(ReminderCreate):
    id: int
    user_id: int
    is_active: bool
    last_sent_date: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
class BillBase(BaseModel):
    payee: str
    bill_type: str
    amount: float
    due_date: datetime
    is_paid: bool = False

    model_config = ConfigDict(from_attributes=True)

class BillCreate(BillBase):
    pass

class BillResponse(BillBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BillPaymentRequest(BaseModel):
    bill_id: int
    otp_token: Optional[str] = None  # used to confirm

class BillPaymentResponse(BaseModel):
    id: int
    bill_id: int
    amount: float
    status: str
    transaction_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    level: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
