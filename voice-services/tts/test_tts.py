import requests
import jwt

JWT_SECRET = "change-this"
JWT_ALGO = "HS256"
JWT_AUD = "voice-service"

token = jwt.encode(
    {"aud": JWT_AUD},
    JWT_SECRET,
    algorithm=JWT_ALGO
)

# ----------- 1) Test STT through gateway -----------  
files = {"file": open("Audio.wav", "rb")}

resp = requests.post(
    "http://localhost:8000/stt",
    files=files,
    headers={"Authorization": f"Bearer {token}"}
)

print("STT:", resp.status_code, resp.json())

# ----------- 2) Test TTS through gateway -----------  
resp2 = requests.post(
    "http://localhost:8000/tts",
    json={"text": "Hello Ayush, your gateway works!"},
    headers={"Authorization": f"Bearer {token}"}
)

print("TTS:", resp2.status_code, resp2.json())
