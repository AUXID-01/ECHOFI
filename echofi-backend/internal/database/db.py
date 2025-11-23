# internal/database/db.py (Final Version with Loan/Reminder Support)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from configs.config import settings
from internal.database.models import Base 
# CRITICAL ADDITION: Explicitly import the models file to ensure 
# Loan, Repayment, and Reminder models are loaded into Base's metadata 
from internal.database import models as db_models # <-- Added for clarity
import logging

# Set up logging for the database operations
log = logging.getLogger(__name__)

# Create the SQLAlchemy Engine
# The URL is constructed in configs/config.py
engine = create_engine(
    settings.DATABASE_URL, 
    pool_pre_ping=True, 
    # Echo=True is useful for debugging to see raw SQL
    echo=True  
)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """
    Initializes the database connection and runs migrations.
    This function automatically creates tables for User, Account, Transaction, 
    AuditLog, Loan, Repayment, and Reminder because they all inherit from Base 
    which is imported above.
    """
    log.info("Attempting to connect to the database...")
    
    try:
        # Check connection before creating tables
        with engine.connect():
            log.info("Successfully connected to the PostgreSQL database.")
            
            # This line automatically detects all models inheriting from Base
            Base.metadata.create_all(bind=engine)
            log.info("Database migration (table creation) completed successfully!")
            
    except Exception as e:
        log.error(f"FATAL: Could not connect or initialize database. Error: {e}")
        raise e

# Dependency function to get a database session (used in controllers)
def get_db():
    # ... (rest of the function remains the same) ...
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# For scripts that need direct DB access without FastAPI dependency system
def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
