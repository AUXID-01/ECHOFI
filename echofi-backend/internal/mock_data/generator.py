"""
Mock Data Generator for Echofi
Creates: Users + Accounts + 50–120 random transactions each
All mock users use password: password123
"""

import random
import string
from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from internal.database.db import SessionLocal
from internal.database import models
from pkg.utils.security import get_password_hash, hash_for_lookup


NAMES = ["Aarav", "Vihaan", "Arjun", "Aryan", "Vivaan", "Advik", "Kabir", "Reyansh",
         "Ishaan", "Shaurya", "Atharv", "Ayaan", "Krishna", "Rudra", "Ranveer"]

DESCRIPTIONS = [
    "Grocery Store",
    "Online Shopping",
    "Mobile Recharge",
    "Electricity Bill",
    "Coffee Shop",
    "Restaurant",
    "Fuel Station",
    "Movie Ticket",
    "Hospital Bill",
]
BILL_TYPES = [
    ("electricity", "Electricity Board"),
    ("water", "Water Supply"),
    ("internet", "Internet Provider")
]



def generate_account_number():
    return "500" + "".join(random.choices(string.digits, k=9))


def generate_transactions(db: Session, user_id: int, account_number: str):
    """Generate 50–120 mock transactions."""
    count = random.randint(50, 120)

    for i in range(count):
        txn = models.Transaction(
            user_id=user_id,
            transaction_type=random.choice(["credit", "debit"]),
            amount=round(random.uniform(100, 5000), 2),
            recipient_account=account_number,
            status="completed",
            description=random.choice(DESCRIPTIONS),
            initiated_at=datetime.now() - timedelta(days=random.randint(1, 120))
        )
        db.add(txn)
    # ---------------------------------------------------
# Generate 3 bills for every mock user
# ---------------------------------------------------
    for bill_type, payee in BILL_TYPES:
        amount = round(random.uniform(300, 2500), 2)
        due_date = datetime.now() + timedelta(days=random.randint(1, 25))
        is_paid = random.choice([True, False])

        bill = models.Bill(
            user_id=user.id,
            payee=payee,
            bill_type=bill_type,
            amount=amount,
            due_date=due_date,
            is_paid=is_paid
        )
        db.add(bill)
        db.commit()
        db.refresh(bill)

        # Optionally create a payment record if paid
        if is_paid:
            payment = models.BillPayment(
                bill_id=bill.id,
                user_id=user.id,
                amount=amount,
                status="completed",
                transaction_id=str(uuid.uuid4()),
                created_at=datetime.now() - timedelta(days=random.randint(1, 5))
            )
            db.add(payment)

    db.commit()


def generate_mock_users(count: int = 10):
    db: Session = SessionLocal()

    print(f"✨ Creating {count} mock users...")

    password_hash = get_password_hash("password123")   # <-- SAME PASSWORD FOR ALL

    for i in range(count):
        username = f"user{i+1}"
        email = f"{username}@gmail.com"
        phone = f"90000000{i:02d}"

        user = models.User(
            username=username,
            email=hash_for_lookup(email),
            phone=hash_for_lookup(phone),
            password_hash=password_hash,
            role="customer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Account
        acc = models.Account(
            user_id=user.id,
            account_number=generate_account_number(),
            account_type="savings",
            balance=round(random.uniform(1000, 100000), 2)
        )
        db.add(acc)
        db.commit()
        db.refresh(acc)

        # Transactions
        generate_transactions(db, user.id, acc.account_number)
        db.commit()

        print(f"✔ Created mock user {username} | password: password123")

    db.close()
    print("\n🎉 Mock data generation complete!")


if __name__ == "__main__":
    import sys

    count = 10
    if "--count" in sys.argv:
        idx = sys.argv.index("--count") + 1
        count = int(sys.argv[idx])

    generate_mock_users(count)
