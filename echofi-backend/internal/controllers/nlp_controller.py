# internal/controllers/nlp_controller.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from internal.database.db import get_db
from internal.database.schemas import NLPRequest, NLPResponse
from internal.database.models import User
from internal.services.nlp_service import NLPService

nlp_router = APIRouter(tags=["NLP Integration"])

@nlp_router.post("/assistant/process", response_model=NLPResponse)
def process_assistant_request(request: NLPRequest, db: Session = Depends(get_db)):
    """
    Webhook endpoint for the NLP system to send structured intent data for processing.
    """
    
    # 1. Look up the user ID passed by the NLP system
    user = db.query(User).filter(User.id == request.user_id).first()
    
    if not user:
        # Crucial security check: User ID must exist
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found for the provided ID."
        )

    # 2. Dispatch to the NLP Service
    service = NLPService(db)
    response = service.process_intent(user, request)
    
    return response