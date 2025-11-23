FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Security: non-root user
RUN useradd -m appuser
USER appuser

EXPOSE 9000

CMD ["uvicorn", "gateway:app", "--host", "0.0.0.0", "--port", "9000"]
