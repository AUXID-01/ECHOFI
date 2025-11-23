import base64

b64 = "PUT YOUR audio_base64 HERE"

with open("test.wav", "wb") as f:
    f.write(base64.b64decode(b64))
