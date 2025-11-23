# internal/services/reminder_service.py

from sqlalchemy.orm import Session
from internal.database import models
from internal.database.schemas import ReminderCreate, ReminderResponse
from internal.services.audit_service import AuditService
from datetime import datetime, timedelta
from typing import List, Optional
import logging

log = logging.getLogger(__name__)

class ReminderService:
    def __init__(self, db: Session):
        self.db = db
        self.audit_service = AuditService(db)

    def create_reminder(self, user_id: int, title: str, due_date: datetime, amount: float, frequency: str = "once") -> models.Reminder:
        """Creates a new payment reminder record for a user."""
        
        new_reminder = models.Reminder(
            user_id=user_id,
            title=title,
            amount=amount,
            due_date=due_date,
            frequency=frequency,
            is_active=True
        )
        self.db.add(new_reminder)
        self.db.commit()
        self.db.refresh(new_reminder)
        
        self.audit_service.log_action(user_id, "REMINDER_CREATED", {"title": title, "due_date": due_date.isoformat()})
        return new_reminder

    def get_reminders_by_user(self, user_id: int) -> List[ReminderResponse]:
        """Fetches all active reminders for a user."""
        reminders = self.db.query(models.Reminder).filter(
            models.Reminder.user_id == user_id,
            models.Reminder.is_active == True
        ).all()
        
        # Using the Pydantic schema for clean output conversion
        return [ReminderResponse.model_validate(r) for r in reminders]


    # =========================================================================
    # SCHEDULER LOGIC (Called by the FastAPI @repeat_every background task)
    # =========================================================================

    def check_and_send_alerts(self) -> None:
        """
        Queries for all active reminders that are due today or overdue.
        In a real application, this would dispatch SMS/Voice alerts.
        """
        today = datetime.now().date()
        
        # Find all active reminders where the due date (ignoring time) is today or earlier
        due_reminders = self.db.query(models.Reminder).filter(
            models.Reminder.is_active == True,
            models.Reminder.due_date <= datetime.combine(today, datetime.max.time())
        ).all()
        
        if not due_reminders:
            log.info("No reminders due today.")
            return

        log.info(f"Found {len(due_reminders)} reminders due. Processing alerts...")

        for reminder in due_reminders:
            try:
                # 1. Send Mock Alert (In a real system: call Twilio/SMS/Voice service)
                user = self.db.query(models.User).filter(models.User.id == reminder.user_id).first()
                if user:
                    alert_message = f"ECHOFI Alert: Your payment of {reminder.amount} for '{reminder.title}' is due today ({reminder.due_date.strftime('%Y-%m-%d')})."
                    # MOCK: Log the alert instead of sending it
                    log.warning(f"ALERT SENT to User {user.id} ({user.phone}): {alert_message}")
                    
                    self.audit_service.log_action(user.id, "REMINDER_SENT", {"reminder_id": reminder.id})

                    # 2. Update Reminder Record
                    reminder.last_sent_date = datetime.now()

                    # 3. Handle Recurrence (Update next due date)
                    if reminder.frequency == "monthly":
                        reminder.due_date = reminder.due_date + timedelta(days=30)
                    
                    elif reminder.frequency == "weekly":
                        reminder.due_date = reminder.due_date + timedelta(days=7)
                    
                    elif reminder.frequency == "once":
                        # Deactivate one-time reminder after sending
                        reminder.is_active = False
                    
                    self.db.add(reminder)
                    
                self.db.commit()

            except Exception as e:
                # Log error and continue to the next reminder
                log.error(f"Failed to process reminder ID {reminder.id}: {e}")
                self.db.rollback() # Rollback changes for this failed reminder only
        
        log.info("Finished processing all due reminders.")