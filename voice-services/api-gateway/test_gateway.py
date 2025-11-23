import requests
import base64

AUDIO_PATH = "../stt/Audio5.wav"
GATEWAY = "http://localhost:8000"

# ---------- Test STT ----------
print("\n--- STT TEST ---")
with open(AUDIO_PATH, "rb") as f:
    files = {"audio": f}
    resp = requests.post(f"{GATEWAY}/stt", files=files)
print(resp.status_code, resp.json())

# ---------- Test TTS ----------
print("\n--- TTS TEST ---")
resp2 = requests.post(
    f"{GATEWAY}/tts",
    json={"text": "Hello, the gateway works!"}
)
print(resp2.status_code, resp2.json())

# ---------- Test Full VOICE Pipeline ----------
print("\n--- VOICE PIPELINE TEST ---")
with open(AUDIO_PATH, "rb") as f:
    files = {"audio": f}
    resp3 = requests.post(f"{GATEWAY}/voice", files=files)
print(resp3.status_code, resp3.json())
