# internal/controllers/admin_controller.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from internal.database.db import get_db
from internal.middleware.auth_middleware import role_required
from internal.database import models

# Admin router, secured by the RBAC middleware
admin_router = APIRouter(
    tags=["Admin & Compliance"], 
    dependencies=[Depends(role_required("admin"))] # <-- PROTECTED BY RBAC
)

@admin_router.get("/admin/audit-logs", status_code=status.HTTP_200_OK)
def get_audit_logs(db: Session = Depends(get_db)):
    """
    Retrieves the full list of system audit logs. 
    Only accessible by users with role='admin'.
    """
    # Note: In a real system, this should use pagination.
    logs = db.query(models.AuditLog).order_by(models.AuditLog.id.desc()).limit(50).all()
    
    # Mocking a list of audit logs for demonstration
    return [{"id": log.id, "user_id": log.user_id, "action": log.action, "timestamp": log.created_at} for log in logs]

@admin_router.get("/admin/users-count", status_code=status.HTTP_200_OK)
def get_users_count(db: Session = Depends(get_db)):
    """Returns the total number of registered users."""
    count = db.query(models.User).count()
    return {"total_users": count}