# internal/services/audit_service.py

from sqlalchemy.orm import Session
from internal.database import models
from datetime import datetime
from typing import Optional, Dict, Any
import json
import logging

log = logging.getLogger(__name__)

class AuditService:
    def __init__(self, db: Session):
        self.db = db

    def log_action(self, 
                   user_id: Optional[int], 
                   action: str, 
                   metadata: Optional[Dict[str, Any]] = None):
        """
        Logs a specific action to the audit_logs table.
        user_id can be None (or 0) for system-level actions (e.g., startup failure).
        """
        
        # Convert metadata dictionary to a JSON string for storage
        metadata_str = None
        if metadata:
            try:
                metadata_str = json.dumps(metadata)
            except TypeError as e:
                log.error(f"Failed to serialize audit metadata for action '{action}': {e}")
                # Fallback: store error message
                metadata_str = json.dumps({"error": "Metadata serialization failed", "original_error": str(e)})

        try:
            audit_entry = models.AuditLog(
                user_id=user_id if user_id is not None else 0, # Use 0 for unauthenticated/system actions
                action=action,
                details=metadata_str, # Renamed from 'metadata' to 'details' in models.py
                created_at=datetime.now()
            )
            
            self.db.add(audit_entry)
            # Commit the audit log immediately so it persists even if the main transaction fails
            self.db.commit() 
            log.info(f"AUDIT LOGGED: User {user_id or 'System'} | Action: {action}")
            
        except Exception as e:
            # If the database commit fails, we log the error locally but do not crash the main process
            self.db.rollback() 
            log.critical(f"CRITICAL FAILURE: Could not write to audit log. Error: {e}")