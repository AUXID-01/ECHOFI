# Use slim Python base
FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffer issues
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install OS dependencies needed for audio, builds and runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
        ffmpeg \
        build-essential \
        libstdc++6 \
        libsndfile1 \
        git \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip and install a CPU-only PyTorch wheel first (avoids Triton/CUDA deps)
# NOTE: we install torch here using the official PyTorch wheel index for CPU builds.
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
 && pip install --no-cache-dir "torch==2.2.0+cpu" -f https://download.pytorch.org/whl/torch_stable.html

# Copy requirements and install remaining python deps (excluding torch and openai-whisper)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app sources
COPY . .

# Create and use a non-root user
RUN useradd -m appuser
USER appuser

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
