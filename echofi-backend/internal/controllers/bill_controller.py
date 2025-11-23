from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from internal.database.db import get_db
from internal.middleware.auth_middleware import get_current_user
from internal.database.schemas import BillCreate, BillResponse, BillPaymentResponse
from internal.services.bill_service import BillService

router = APIRouter(prefix="/bill", tags=["Bills"], dependencies=[Depends(get_current_user)])

@router.get("/me", response_model=list[BillResponse])
def get_my_bills(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = BillService(db)
    return service.list_bills_for_user(current_user.id)

@router.post("/create", response_model=BillResponse)
def create_bill(request: BillCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = BillService(db)
    return service.create_bill(current_user.id, request)

@router.post("/pay/{bill_id}", response_model=BillPaymentResponse)
def pay_bill(bill_id: int, otp_token: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = BillService(db)
    try:
        return service.pay_bill(current_user.id, bill_id, otp_token)
    except ValueError as e:
        raise HTTPException(400, str(e))
