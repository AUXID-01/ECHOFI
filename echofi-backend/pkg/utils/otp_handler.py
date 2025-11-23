# # pkg/utils/otp_handler.py (Twilio Live Integration - Final Code)

# import logging
# from twilio.rest import Client # Twilio client is imported
# from internal.database.redis_client import get_redis_client
# from configs.config import settings # Needed for Twilio credentials

# log = logging.getLogger(__name__)

# # OTP Configuration
# OTP_EXPIRY_SECONDS = 5 * 60 # 5 minutes (Used for Redis status tracking TTL)
# OTP_KEY_PREFIX = "otp:"

# # Initialize Twilio Client globally (using settings from configs/config.py)
# try:
#     TWILIO_CLIENT = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
# except Exception as e:
#     log.error(f"Failed to initialize Twilio client with credentials: {e}")
#     # Set to None if initialization fails; ensures functions handle the outage gracefully
#     TWILIO_CLIENT = None

# def send_otp_live(phone_number: str) -> str:
#     """Sends an OTP using Twilio Verify service."""
#     if not TWILIO_CLIENT:
#         return "Twilio service is unavailable due to setup error."

#     try:
#         # Twilio handles code generation and SMS sending
#         verification = TWILIO_CLIENT.verify.v2.services(settings.TWILIO_VERIFY_SERVICE_SID).verifications.create(
#             to=phone_number, 
#             channel='sms' # Sends the code via SMS
#         )
        
#         # We store a simple flag in Redis to track the active session status, 
#         # allowing us to apply rate limiting/session management if needed.
#         r = get_redis_client()
#         r.set(OTP_KEY_PREFIX + phone_number, verification.status, ex=OTP_EXPIRY_SECONDS) 
        
#         log.info(f"[Twilio] Verification initiated for {phone_number}. Status: {verification.status}")
#         return "OTP sent successfully via Twilio."
        
#     except Exception as e:
#         log.error(f"Twilio API failed to send OTP to {phone_number}: {e}")
#         return "OTP send failed due to Twilio error."

# def verify_otp_live(phone_number: str, code: str) -> bool:
#     """Verifies the OTP code against Twilio and cleans up Redis state."""
#     if not TWILIO_CLIENT:
#         return False

#     try:
#         # Twilio checks the code and returns the verification status
#         verification_check = TWILIO_CLIENT.verify.v2.services(settings.TWILIO_VERIFY_SERVICE_SID).verification_checks.create(
#             to=phone_number, 
#             code=code
#         )
        
#         if verification_check.status == "approved":
#             # Clean up Redis tracking flag immediately to prevent replay
#             r = get_redis_client()
#             r.delete(OTP_KEY_PREFIX + phone_number)
#             log.info(f"[Twilio] Verification SUCCESS for {phone_number}.")
#             return True
        
#         log.warning(f"[Twilio] Verification FAILED for {phone_number}. Reason: {verification_check.status}")
#         return False
        
#     except Exception as e:
#         log.error(f"Twilio verification check failed: {e}")
#         return False

# # Export the LIVE functions to be used by the controllers
# send_otp_mock = send_otp_live
# verify_otp_mock = verify_otp_live


from pkg.utils.security import hash_for_lookup
import logging

log = logging.getLogger(__name__)

OTP_STORE = {}

def send_otp_mock(phone):
    # phone passed here is ALREADY HASHED (because user.phone is hashed in DB)
    otp = "1234"
    OTP_STORE[phone] = otp
    log.info(f"[MOCK OTP] OTP sent to {phone}: {otp}")

def verify_otp_mock(phone_raw, code):
    # Hash the raw phone provided from frontend
    hashed = hash_for_lookup(phone_raw)

    return OTP_STORE.get(hashed) == code
