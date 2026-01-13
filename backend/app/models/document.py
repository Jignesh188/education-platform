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


class PageSummary(BaseModel):
    """Summary and insights for a specific page."""
    page_number: int
    content: str
    key_points: List[str]
    focus_topic: Optional[str] = None


class WikiContext(BaseModel):
    """Wikipedia context for a term."""
    term: str
    definition: str
    url: str


class DocumentResponse(BaseModel):
    """Document response model."""
    id: str
    user_id: str
    title: str
    file_type: str
    file_size: int
    extracted_text: Optional[str] = None
    summary: Optional[str] = None
    page_summaries: List[PageSummary] = []
    easy_explanation: Optional[str] = None
    key_concepts: List[str] = []
    wiki_context: List[WikiContext] = []
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
