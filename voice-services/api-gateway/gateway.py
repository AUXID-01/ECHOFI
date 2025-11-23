# api-gateway/gateway.py
import logging.config
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from utils.http_client import forward_file_to_service, forward_json_to_service

logging.config.fileConfig(settings.LOG_CONFIG_PATH)
logger = logging.getLogger("gateway")

app = FastAPI(title="Voice Assistant API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "api-gateway"}


# ---------------------------------------------------------
# 🔊 STT FORWARDER
# ---------------------------------------------------------
@app.post("/stt")
async def stt_route(audio: UploadFile = File(...)):
    logger.info(f"Gateway → STT (file={audio.filename})")
    try:
        resp = await forward_file_to_service(
            url=settings.STT_URL,
            file_field_name="audio",
            upload_file=audio
        )
    except Exception as e:
        logger.exception("STT forward error")
        return JSONResponse(status_code=500, content={"error": str(e)})

    return JSONResponse(status_code=resp.status_code, content=resp.json())


# ---------------------------------------------------------
# 🔊 TTS FORWARDER
# ---------------------------------------------------------
@app.post("/tts")
async def tts_route(payload: dict):
    logger.info(f"Gateway → TTS (text_len={len(payload.get('text',''))})")
    try:
        resp = await forward_json_to_service(
            url=settings.TTS_URL,
            json_payload=payload
        )
    except Exception as e:
        logger.exception("TTS forward error")
        return JSONResponse(status_code=500, content={"error": str(e)})

    return JSONResponse(status_code=resp.status_code, content=resp.json())


# ---------------------------------------------------------
# 🎤 FULL VOICE PIPELINE (STT → NLP → TTS)
# ---------------------------------------------------------
@app.post("/voice")
async def voice_pipeline(audio: UploadFile = File(...)):
    logger.info(f"Gateway → VOICE PIPELINE (audio={audio.filename})")

    # ------------------- 1) STT -------------------
    try:
        audio.file.seek(0)
        stt_resp = await forward_file_to_service(
            url=settings.STT_URL,
            file_field_name="audio",
            upload_file=audio
        )
        stt_text = stt_resp.json().get("text", "") or ""
        logger.info(f"STT → {stt_text}")

    except Exception as e:
        logger.exception("STT error")
        return {"error": "STT failed", "details": str(e)}

    # ------------------- 2) INTENT -------------------
    intent = detect_intent(stt_text)
    logger.info(f"Intent → {intent}")

    # ------------------- 3) NLP -------------------
    try:
        nlp_resp = await forward_json_to_service(
            url=settings.NLP_URL,  # make configurable
            json_payload={"user_input": stt_text, "session_id": "demo-1"}
        )
        bot_text = nlp_resp.json().get("response", "") or ""
        logger.info(f"NLP → {bot_text}")

    except Exception as e:
        logger.exception("NLP error")
        return {"error": "NLP failed", "details": str(e)}

    # ------------------- 4) TTS -------------------
    try:
        tts_resp = await forward_json_to_service(
            url=settings.TTS_URL,
            json_payload={"text": bot_text}
        )

        raw_url = tts_resp.json().get("audio_url")  # e.g. "/audio/tts_x.mp3"
        audio_url = f"{settings.TTS_BASE_URL}{raw_url}"  # FIXED

        logger.info(f"TTS → {audio_url}")

    except Exception as e:
        logger.exception("TTS error")
        return {"error": "TTS failed", "details": str(e)}

    # ------------------- FINAL RESPONSE -------------------
    return {
        "user_text": stt_text,
        "bot_text": bot_text,
        "intent": intent,
        "audio_url": audio_url,
    }



# ---------------------------------------------------------
# TEMP: MOCK INTENT DETECTION
# ---------------------------------------------------------
def detect_intent(text: str) -> str:
    text_lower = text.lower().strip()

    if any(word in text_lower for word in ["balance", "my balance", "account balance"]):
        return "check_balance"

    if any(word in text_lower for word in ["transfer", "send money", "pay", "send", "give"]):
        return "transfer_funds"

    if any(word in text_lower for word in ["history", "transactions", "statement"]):
        return "view_history"

    if "loan" in text_lower or "apply loan" in text_lower:
        return "apply_loan"

    return "unknown"







# # api-gateway/gateway.py
# import logging.config
# from fastapi import FastAPI, UploadFile, File
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware

# from config.settings import settings
# from utils.http_client import forward_file_to_service, forward_json_to_service

# logging.config.fileConfig(settings.LOG_CONFIG_PATH)
# logger = logging.getLogger("gateway")

# app = FastAPI(title="Voice Assistant API Gateway")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.CORS_ALLOW_ORIGINS,
#     allow_methods=["*"],
#     allow_headers=["*"],
#     allow_credentials=True,
# )

# @app.get("/health")
# async def health():
#     return {"status": "ok", "service": "api-gateway"}


# # ---------------------------------------------------------
# # 🔊 STT FORWARDER
# # ---------------------------------------------------------
# @app.post("/stt")
# async def stt_route(audio: UploadFile = File(...)):
#     logger.info(f"Gateway → STT (file={audio.filename})")
#     try:
#         resp = await forward_file_to_service(
#             url=settings.STT_URL,
#             file_field_name="audio",
#             upload_file=audio
#         )
#     except Exception as e:
#         logger.exception("STT forward error")
#         return JSONResponse(status_code=500, content={"error": str(e)})

#     return JSONResponse(status_code=resp.status_code, content=resp.json())


# # ---------------------------------------------------------
# # 🔊 TTS FORWARDER
# # ---------------------------------------------------------
# @app.post("/tts")
# async def tts_route(payload: dict):
#     logger.info(f"Gateway → TTS (text_len={len(payload.get('text',''))})")
#     try:
#         resp = await forward_json_to_service(
#             url=settings.TTS_URL,
#             json_payload=payload
#         )
#     except Exception as e:
#         logger.exception("TTS forward error")
#         return JSONResponse(status_code=500, content={"error": str(e)})

#     return JSONResponse(status_code=resp.status_code, content=resp.json())


# # ---------------------------------------------------------
# # 🎤 FULL VOICE PIPELINE (STT → NLP → TTS)
# # ---------------------------------------------------------
# @app.post("/voice")
# async def voice_pipeline(audio: UploadFile = File(...)):
#     logger.info(f"Gateway → VOICE PIPELINE (audio={audio.filename})")

#     # ------------------- 1) STT -------------------
#     try:
#         audio.file.seek(0)

#         stt_resp = await forward_file_to_service(
#             url=settings.STT_URL,
#             file_field_name="audio",
#             upload_file=audio
#         )

#         stt_text = stt_resp.json().get("text", "") or ""
#         logger.info(f"STT → {stt_text}")

#     except Exception as e:
#         logger.exception("STT error")
#         return JSONResponse(
#             status_code=500,
#             content={"error": "STT failed", "details": str(e)}
#         )

#     # ------------------- 2) NLP -------------------
#     try:
#         nlp_resp = await forward_json_to_service(
#             url="http://localhost:8081/dialogue",
#             json_payload={"user_input": stt_text, "session_id": "demo-1"}
#         )

#         bot_text = nlp_resp.json().get("response", "") or ""
#         logger.info(f"NLP → {bot_text}")

#     except Exception as e:
#         logger.exception("NLP error")
#         return JSONResponse(
#             status_code=500,
#             content={"error": "NLP failed", "details": str(e)}
#         )

#     # ------------------- 3) TTS -------------------
#     try:
#         tts_resp = await forward_json_to_service(
#             url=settings.TTS_URL,
#             json_payload={"text": bot_text}
#         )

#         raw_url = tts_resp.json().get("audio_url")

#         # 🔥 FINAL FIX: RETURN ABSOLUTE URL (PORT 8002)
#         audio_url = f"http://localhost:8002{raw_url}"

#     except Exception as e:
#         logger.exception("TTS error")
#         return JSONResponse(
#             status_code=500,
#             content={"error": "TTS failed", "details": str(e)}
#         )

#     # ------------------- Final Output -------------------
#     return {
#         "user_text": stt_text,
#         "bot_text": bot_text,
#         "audio_url": audio_url
#     }


# # return app   # ONLY if running via another script

