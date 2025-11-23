# main.py (Updated & Correct)

from fastapi import FastAPI, Depends, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi_utils.tasks import repeat_every
import logging
import uvicorn

from internal.database.db import init_db, SessionLocal
from internal.database.redis_client import init_redis
from internal.services.reminder_service import ReminderService

# Routers
from internal.controllers.auth_controller import auth_router
from internal.controllers.bank_controller import bank_router
from internal.controllers.nlp_controller import nlp_router
from internal.controllers.loan_controller import loan_router
from internal.controllers.reminder_controller import reminder_router
from internal.controllers.admin_controller import admin_router

from internal.middleware.rate_limiter import rate_limit

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

app = FastAPI(
    title="EchoFi AI Voice Banking Backend",
    version="1.0.0",
    description="Secure API for voice-driven financial operations."
)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# STARTUP EVENTS
# ----------------------------
@app.on_event("startup")
async def startup():
    log.info("Starting backend...")
    init_db()
    init_redis()


@app.on_event("startup")
@repeat_every(seconds=60 * 60 * 24, wait_first=False)
def daily_reminder_check():
    try:
        with SessionLocal() as db:
            ReminderService(db).check_and_send_alerts()
            log.info("Reminder check completed.")
    except Exception as e:
        log.error(f"Reminder task error: {e}")


# ----------------------------
# HEALTH CHECK
# ----------------------------
@app.get("/api/v1/health")
async def health():
    return {"status": "ok"}


# ----------------------------
# API v1 ROUTER GROUP
# ----------------------------
v1 = APIRouter(prefix="/api/v1", dependencies=[Depends(rate_limit)])

v1.include_router(auth_router)
v1.include_router(bank_router)
v1.include_router(nlp_router)
v1.include_router(loan_router)
v1.include_router(reminder_router)
v1.include_router(admin_router)

app.include_router(v1)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
