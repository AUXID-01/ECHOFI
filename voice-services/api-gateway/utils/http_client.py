# api-gateway/utils/http_client.py
import httpx
from typing import Optional
import logging

logger = logging.getLogger("gateway.http_client")

DEFAULT_TIMEOUT = 30.0

async def forward_file_to_service(url: str, file_field_name: str, upload_file, headers: Optional[dict] = None, timeout: float = DEFAULT_TIMEOUT):
    """
    Forward a FastAPI UploadFile to another HTTP service as multipart/form-data.
    - upload_file: FastAPI UploadFile
    - file_field_name: form field name expected by destination (e.g., "file")
    Returns httpx.Response
    """
    # Reset file pointer to start
    try:
        upload_file.file.seek(0)
    except Exception:
        pass

    # Prepare multipart payload
    files = {file_field_name: (upload_file.filename, upload_file.file, upload_file.content_type or "application/octet-stream")}
    async with httpx.AsyncClient(timeout=timeout) as client:
        logger.debug("Forwarding file to %s", url)
        resp = await client.post(url, files=files, headers=headers)
        resp.raise_for_status()
        return resp

async def forward_json_to_service(url: str, json_payload: dict, headers: Optional[dict] = None, timeout: float = DEFAULT_TIMEOUT):
    async with httpx.AsyncClient(timeout=timeout) as client:
        logger.debug("Forwarding JSON to %s", url)
        resp = await client.post(url, json=json_payload, headers=headers)
        resp.raise_for_status()
        return resp
