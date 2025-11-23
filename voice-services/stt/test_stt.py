import requests

url = "http://127.0.0.1:8001/asr"

# TEMPORARY test token (modify to match your settings.JWT_SECRET)
jwt_token = "testtoken"

headers = {
    "Authorization": f"Bearer {jwt_token}"
}

files = {
    "audio": open("Audios.wav", "rb")
}

resp = requests.post(url, headers=headers, files=files)

print("STATUS:", resp.status_code)
print("RESPONSE:", resp.json())
