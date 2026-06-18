FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
 && pip install --no-cache-dir "torch==2.2.0+cpu" -f https://download.pytorch.org/whl/torch_stable.html
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose the API port
EXPOSE 8081

# Command to run the FastAPI service
CMD ["python", "-m", "uvicorn", "src.integration.nlp_service:app", "--host", "0.0.0.0", "--port", "8081"]
