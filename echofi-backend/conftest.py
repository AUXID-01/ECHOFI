# conftest.py

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from internal.database.models import Base, User, Account # Import your models
from internal.services.bank_service import BankService
from pkg.utils.security import get_password_hash

# 1. --- SQLAlchemy Fixtures (Using SQLite In-Memory) ---

@pytest.fixture(scope="session")
def engine():
    """Fixture for creating the in-memory SQLite engine."""
    # Use check_same_thread=False for SQLite with threaded environments (like pytest)
    return create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

@pytest.fixture(scope="session")
def tables(engine):
    """Fixture to create and drop all tables once per session."""
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)

@pytest.fixture
def db_session(engine, tables):
    """Fixture to provide a database session for each test."""
    connection = engine.connect()
    # Begin a transaction that can be rolled back later (crucial for clean state)
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()
    yield session
    
    # Teardown: Rollback the transaction to reset the database state
    session.close()
    transaction.rollback()
    connection.close()

# 2. --- Mock Data Fixtures ---

@pytest.fixture
def mock_user_data():
    """Mock user data for creation."""
    return {
        "username": "test_user",
        "email": "test@echofi.com",
        "phone": "9998887770",
        "password_hash": get_password_hash("testpass123")
    }

@pytest.fixture
def mock_transfer_request():
    """Mock request object for testing transfers."""
    from internal.database.schemas import TransferRequest
    return TransferRequest(
        source_account="500123456789",
        recipient_account="500987654321",
        amount=100.00,
        description="Test payment"
    )

@pytest.fixture
def setup_user_and_account(db_session, mock_user_data):
    """Creates a user and their account for testing."""
    user = User(**mock_user_data)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    account = Account(
        user_id=user.id,
        account_number="500123456789",
        account_type="savings",
        balance=500.00 # Starting balance
    )
    db_session.add(account)
    db_session.commit()
    db_session.refresh(account)
    
    return user, account