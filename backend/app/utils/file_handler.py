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
    
    return str(file_path), len(content)


def extract_text_from_pdf(file_path: str) -> Tuple[str, int]:
    """Extract text from PDF file."""
    text = ""
    page_count = 0
    
    try:
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            page_count = len(reader.pages)
            
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
    
    return text.strip(), page_count


def extract_text_from_image(file_path: str) -> str:
    """Get image for AI processing (returns path for vision model)."""
    # For vision models, we'll pass the image directly
    # This returns None as text is extracted by AI
    return ""


def extract_text_from_docx(file_path: str) -> Tuple[str, int]:
    """Extract text from DOCX file."""
    text = ""
    page_count = 1  # DOCX doesn't have explicit pages
    
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
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
    
    return text.strip(), page_count


def extract_text(file_path: str, file_type: str) -> Tuple[str, int]:
    """Extract text from file based on type."""
    if file_type == "pdf":
        return extract_text_from_pdf(file_path)
    elif file_type == "docx":
        return extract_text_from_docx(file_path)
    elif file_type == "image":
        return extract_text_from_image(file_path), 1
    else:
        return "", 0


def delete_file(file_path: str) -> bool:
    """Delete a file from storage."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        print(f"Error deleting file: {e}")
    return False
