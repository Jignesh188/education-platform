from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DocumentCreate(BaseModel):
    """Document creation (used internally)."""
    title: str
    file_type: str
    file_path: str
    file_size: int


class DocumentResponse(BaseModel):
    """Document response model."""
    id: str
    user_id: str
    title: str
    file_type: str
    file_size: int
    extracted_text: Optional[str] = None
    summary: Optional[str] = None
    easy_explanation: Optional[str] = None
    key_concepts: List[str] = []
    page_count: int = 0
    processing_status: ProcessingStatus = ProcessingStatus.PENDING
    created_at: datetime
    updated_at: datetime


class DocumentListResponse(BaseModel):
    """List of documents response."""
    documents: List[DocumentResponse]
    total: int
    page: int
    limit: int


class DocumentSummaryRequest(BaseModel):
    """Request to regenerate summary."""
    document_id: str
