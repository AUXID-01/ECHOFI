# internal/services/nlp_service.py

from sqlalchemy.orm import Session
from internal.services.bank_service import BankService, InsufficientFundsError
from internal.database.schemas import NLPRequest, NLPResponse
from internal.database.models import User
from typing import Dict, Any, List
import logging

log = logging.getLogger(__name__)

class NLPService:
    def __init__(self, db: Session):
        self.db = db
        self.bank_service = BankService(db)

    def _extract_entities(self, entities: List[dict]) -> Dict[str, Any]:
        """Converts the NLP entities list into a dictionary for easy access."""
        entity_map = {}
        for entity in entities:
            entity_map[entity['entity']] = entity['value']
        return entity_map

    def process_intent(self, user: User, request: NLPRequest) -> NLPResponse:
        """
        Dispatches the request to the correct banking service based on the intent.
        """
        entity_map = self._extract_entities(request.entities)
        
        try:
            if request.intent == "check_balance":
                return self._handle_check_balance(user, entity_map)
                
            elif request.intent == "transfer_funds":
                return self._handle_transfer_funds(user, entity_map)
            
            elif request.intent == "view_history":
                return self._handle_view_history(user, entity_map)
                
            else:
                return NLPResponse(status="error", response_text=f"I don't recognize the action '{request.intent}'. Please try again.")

        except Exception as e:
            log.error(f"Error processing intent {request.intent} for user {user.id}: {e}")
            return NLPResponse(status="error", response_text="I encountered a problem accessing your banking data. Please contact support.")

    # --- Intent Handlers ---

    def _handle_check_balance(self, user: User, entities: Dict) -> NLPResponse:
        """Handles the 'check_balance' intent."""
        balance_info = self.bank_service.get_account_balance(user.id)
        
        if not balance_info:
            return NLPResponse(status="error", response_text="I could not find your bank account details.")
            
        return NLPResponse(
            status="success",
            response_text=f"Your current {balance_info.account_type} balance is ₹{balance_info.balance:.2f}.",
            data={"balance": balance_info.balance}
        )
        
    def _handle_transfer_funds(self, user: User, entities: Dict) -> NLPResponse:
        """
        Handles the 'transfer_funds' intent (this requires OTP, so it initiates).
        This is highly simplified and assumes the NLP provides all necessary entities.
        """
        amount_str = entities.get('amount')
        recipient = entities.get('recipient')
        
        if not amount_str or not recipient:
            return NLPResponse(status="prompt", response_text="I need the amount and the recipient name to proceed with the transfer.")
        
        try:
            amount = float(amount_str.replace('₹', '').replace(',', ''))
            
            # NOTE: In a real system, we would call the initiate_transfer service here,
            # then prompt the user for OTP, and create a transfer session.
            
            # Mocking the response here to confirm the action:
            return NLPResponse(
                status="prompt",
                response_text=f"I understood. You want to transfer ₹{amount:.2f} to {recipient}. Please confirm this action with your OTP.",
                data={"requires_otp": True}
            )
        except ValueError:
            return NLPResponse(status="error", response_text="The amount specified is not valid.")
            
    def _handle_view_history(self, user: User, entities: Dict) -> NLPResponse:
        """Handles the 'view_history' intent."""
        history = self.bank_service.get_transaction_history(user.id, limit=3)
        
        if not history:
            return NLPResponse(status="success", response_text="You have no recent transactions.")
            
        # Create a conversational summary
        summary = [f"{t.transaction_type} of ₹{t.amount:.2f} to {t.recipient_account}" for t in history]
        response_text = "Your three most recent transactions are: " + ", ".join(summary) + "."
        
        return NLPResponse(
            status="success",
            response_text=response_text,
            data={"transactions": [t.model_dump() for t in history]}
        )