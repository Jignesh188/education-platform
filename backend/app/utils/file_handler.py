import os
import aiofiles
from fastapi import UploadFile
from typing import Tuple
import uuid
from pathlib import Path
import PyPDF2
from PIL import Image
import io
from docx import Document
from app.utils.logger import logger

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {
    "pdf": ["application/pdf"],
    "image": ["image/jpeg", "image/png", "image/gif", "image/webp"],
    "docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
}


def get_file_type(content_type: str) -> str:
    """Determine file type from content type."""
    for file_type, mime_types in ALLOWED_EXTENSIONS.items():
        if content_type in mime_types:
            return file_type
    return "unknown"


def is_allowed_file(content_type: str) -> bool:
    """Check if file type is allowed."""
    for mime_types in ALLOWED_EXTENSIONS.values():
        if content_type in mime_types:
            return True
    return False


async def save_upload_file(file: UploadFile, user_id: str) -> Tuple[str, int]:
    """Save uploaded file and return path and size."""
    # Create user directory
    user_dir = UPLOAD_DIR / user_id
    user_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = user_dir / unique_filename
    
    # Save file
    content = await file.read()
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)
    
    logger.info(f"💾 File Handled │ Saved {file.filename} ({len(content)} bytes) at {file_path}")
    return str(file_path), len(content)


def extract_text_from_pdf(file_path: str) -> Tuple[str, int, list]:
    """Extract text from PDF file."""
    text = ""
    page_count = 0
    pages = []
    
    logger.info(f"📄 PDF Extract │ Starting extraction for {os.path.basename(file_path)}")
    
    try:
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            page_count = len(reader.pages)
            
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    cleaned_page = page_text.strip()
                    pages.append(cleaned_page)
                    text += cleaned_page + "\n\n"
                    # Log every 5 pages or so to show progress without spamming too much
                    if (i + 1) % 5 == 0:
                        logger.debug(f"📄 PDF Extract │ Processed page {i + 1}/{page_count}")
                else:
                    pages.append("")
                    logger.warning(f"📄 PDF Extract │ Empty text on page {i+1}")
                    
        logger.info(f"📄 PDF Extract │ Completed. Extracted {page_count} pages.")

    except Exception as e:
        logger.error(f"📄 PDF Extract │ Error: {e}", exc_info=True)
    
    return text.strip(), page_count, pages


def extract_text_from_image(file_path: str) -> str:
    """Get image for AI processing (returns path for vision model)."""
    # For vision models, we'll pass the image directly
    # This returns None as text is extracted by AI
    logger.info(f"🖼️ Image Extract │ Prepared {os.path.basename(file_path)} for Vision Model")
    return ""


def extract_text_from_docx(file_path: str) -> Tuple[str, int, list]:
    """Extract text from DOCX file."""
    text = ""
    page_count = 1
    pages = []
    
    logger.info(f"📝 DOCX Extract │ Starting extraction for {os.path.basename(file_path)}")
    
    try:
        doc = Document(file_path)
        paragraphs = []
        
        for para in doc.paragraphs:
            if para.text.strip():
                paragraphs.append(para.text)
        
        text = "\n\n".join(paragraphs)
        # Estimate pages (roughly 500 words per page)
        word_count = len(text.split())
        page_count = max(1, word_count // 500)
        
        # Simulate pages for consistency
        chunk_size = len(text) // page_count if page_count > 0 else len(text)
        for i in range(page_count):
            start = i * chunk_size
            end = (i + 1) * chunk_size if i < page_count - 1 else len(text)
            pages.append(text[start:end])
            
        logger.info(f"📝 DOCX Extract │ Completed. Estimated {page_count} pages.")
            
    except Exception as e:
        logger.error(f"📝 DOCX Extract │ Error: {e}", exc_info=True)
    
    return text.strip(), page_count, pages


def extract_text(file_path: str, file_type: str) -> Tuple[str, int, list]:
    """Extract text from file based on type."""
    if file_type == "pdf":
        return extract_text_from_pdf(file_path)
    elif file_type == "docx":
        return extract_text_from_docx(file_path)
    elif file_type == "image":
        # Images are handled by vision model directly, returns empty text/pages here
        return extract_text_from_image(file_path), 1, []
    else:
        logger.warning(f"⚠️ Extract │ Unknown file type: {file_type}")
        return "", 0, []


def delete_file(file_path: str) -> bool:
    """Delete a file from storage."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"🗑️ File Handled │ Deleted {file_path}")
            return True
    except Exception as e:
        logger.error(f"🗑️ File Handled │ Error deleting {file_path}: {e}", exc_info=True)
    return False
