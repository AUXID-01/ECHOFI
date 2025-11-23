import jwt, datetime

SECRET = "super-secret-key"  # MUST match .env
ALGO = "HS256"

payload = {
    "sub": "ayush-dev",
    "iss": "voice-gateway",
    "aud": "voice-service",
    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
}

token = jwt.encode(payload, SECRET, algorithm=ALGO)
print("\nGenerated JWT Token:\n")
print(token)
