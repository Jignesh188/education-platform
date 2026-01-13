from fastapi import APIRouter, HTTPException, status, UploadFile, File, Depends, BackgroundTasks
from datetime import datetime
from typing import List
from bson import ObjectId

from app.models.document import DocumentResponse, DocumentListResponse, ProcessingStatus
from app.database import get_documents_collection, get_users_collection
from app.utils.security import get_current_user
from app.utils.file_handler import (
    save_upload_file, 
    get_file_type, 
    is_allowed_file, 
    extract_text,
    delete_file
)
from app.services.ai_service import ai_service
from app.utils.logger import logger

router = APIRouter()


def document_to_response(doc: dict) -> DocumentResponse:
    """Convert MongoDB document to response model."""
    return DocumentResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        title=doc["title"],
        file_type=doc["file_type"],
        file_size=doc["file_size"],
        extracted_text=doc.get("extracted_text"),
        summary=doc.get("summary"),
        easy_explanation=doc.get("easy_explanation"),
        key_concepts=doc.get("key_concepts", []),
        page_count=doc.get("page_count", 0),
        processing_status=doc.get("processing_status", ProcessingStatus.PENDING),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"]
    )


async def process_document(document_id: str, file_path: str, file_type: str, title: str):
    """Background task to process document with AI."""
    documents = get_documents_collection()
    
    logger.info(f"🔄 Processing │ Started processing document: {title} ({document_id})")
    
    try:
        # Update status to processing
        await documents.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {"processing_status": ProcessingStatus.PROCESSING}}
        )
        
        # Extract text
        if file_type == "image":
            # Use AI to extract text from image
            logger.info(f"🔄 Processing │ Extracting text from image for {document_id}")
            extracted_text = await ai_service.extract_text_from_image(file_path)
            page_count = 1
            pages = [extracted_text] if extracted_text else []
        else:
            logger.info(f"🔄 Processing │ Extracting text from {file_type} for {document_id}")
            extracted_text, page_count, pages = extract_text(file_path, file_type)
        
        if not extracted_text:
            raise Exception("Failed to extract text from document")
        
        logger.info(f"🔄 Processing │ Generatng summary for {document_id}")
        # Generate summary (Clean Text)
        summary = await ai_service.generate_summary(extracted_text, title)
        
        # Initialize page_summaries in DB
        await documents.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {"summary": summary, "page_summaries": []}}
        )
        
        # Generate per-page insights
        page_summaries = []
        logger.info(f"🔄 Processing │ Generatng insights for {len(pages)} pages")
        for i, page_text in enumerate(pages):
            if not page_text.strip():
                continue
            # Process pages (sequentially for now to avoid rate limits/complexity)
            insight = await ai_service.generate_page_insights(page_text, i + 1)
            
            page_summary = {
                "page_number": i + 1,
                "content": insight.get("content", ""),
                "key_points": insight.get("key_points", []),
                "focus_topic": insight.get("focus_topic")
            }
            
            page_summaries.append(page_summary)
            
            # Incrementally update DB
            await documents.update_one(
                {"_id": ObjectId(document_id)},
                {"$push": {"page_summaries": page_summary}}
            )

        logger.info(f"🔄 Processing │ Generatng easy explanation for {document_id}")
        # Generate easy explanation
        easy_explanation = await ai_service.generate_easy_explanation(extracted_text, title)
        
        # Extract key concepts
        key_concepts = await ai_service.extract_key_concepts(extracted_text)
        
        # Fetch Wikipedia context for top concepts
        wiki_context = await ai_service.enrich_context_with_wiki(key_concepts)
        
        # Update document with results
        await documents.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {
                "extracted_text": extracted_text,
                "easy_explanation": easy_explanation,
                "key_concepts": key_concepts,
                # page_summaries is already updated incrementally
                "wiki_context": wiki_context,
                "page_count": page_count,
                "processing_status": ProcessingStatus.COMPLETED,
                "updated_at": datetime.utcnow()
            }}
        )
        
        logger.info(f"✅ Processing │ Successfully completed for {title} ({document_id})")
        
    except Exception as e:
        logger.error(f"❌ Processing │ Failed for {document_id}: {e}", exc_info=True)
        await documents.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {
                "processing_status": ProcessingStatus.FAILED,
                "updated_at": datetime.utcnow()
            }}
        )


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a document for processing."""
    logger.info(f"📤 Upload │ User {current_user['_id']} uploading {file.filename}")
    
    # Validate file type
    if not is_allowed_file(file.content_type):
        logger.warning(f"⚠️ Upload │ Invalid file type {file.content_type} for {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not allowed. Allowed types: PDF, DOCX, JPEG, PNG, GIF, WebP"
        )
    
    # Check for duplicate document
    documents = get_documents_collection()
    existing_doc = await documents.find_one({
        "user_id": current_user["_id"],
        "title": file.filename
    })
    
    if existing_doc:
        logger.warning(f"⚠️ Upload │ Duplicate document {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document '{file.filename}' already exists."
        )

    # Save file
    user_id = str(current_user["_id"])
    file_path, file_size = await save_upload_file(file, user_id)
    file_type = get_file_type(file.content_type)
    
    # Create document record
    documents = get_documents_collection()
    now = datetime.utcnow()
    
    doc = {
        "user_id": current_user["_id"],
        "title": file.filename or "Untitled Document",
        "file_type": file_type,
        "file_path": file_path,
        "file_size": file_size,
        "extracted_text": None,
        "summary": None,
        "easy_explanation": None,
        "key_concepts": [],
        "page_count": 0,
        "processing_status": ProcessingStatus.PENDING,
        "created_at": now,
        "updated_at": now
    }
    
    result = await documents.insert_one(doc)
    doc["_id"] = result.inserted_id
    
    # Update user's document count
    users = get_users_collection()
    await users.update_one(
        {"_id": current_user["_id"]},
        {"$inc": {"total_documents": 1}}
    )
    
    # Start background processing
    logger.info(f"🔄 Upload │ Queuing background processing for {result.inserted_id}")
    background_tasks.add_task(
        process_document,
        str(result.inserted_id),
        file_path,
        file_type,
        file.filename or "Untitled"
    )
    
    return document_to_response(doc)


@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    page: int = 1,
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """List user's documents."""
    logger.debug(f"📂 List Docs │ User {current_user['_id']} requesting page {page}")
    documents = get_documents_collection()
    
    skip = (page - 1) * limit
    
    # Get documents
    cursor = documents.find({"user_id": current_user["_id"]}).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    
    # Get total count
    total = await documents.count_documents({"user_id": current_user["_id"]})
    
    return DocumentListResponse(
        documents=[document_to_response(doc) for doc in docs],
        total=total,
        page=page,
        limit=limit
    )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific document."""
    logger.info(f"👀 View Doc │ User {current_user['_id']} accessing {document_id}")
    documents = get_documents_collection()
    
    try:
        doc = await documents.find_one({
            "_id": ObjectId(document_id),
            "user_id": current_user["_id"]
        })
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    if not doc:
        logger.warning(f"⚠️ View Doc │ Document {document_id} not found for user")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    return document_to_response(doc)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a document."""
    logger.info(f"🗑️ Delete Doc │ User {current_user['_id']} deleting {document_id}")
    documents = get_documents_collection()
    
    try:
        doc = await documents.find_one({
            "_id": ObjectId(document_id),
            "user_id": current_user["_id"]
        })
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    # Delete file
    delete_file(doc["file_path"])
    
    # Delete document record
    await documents.delete_one({"_id": ObjectId(document_id)})
    
    # Update user's document count
    users = get_users_collection()
    await users.update_one(
        {"_id": current_user["_id"]},
        {"$inc": {"total_documents": -1}}
    )
    
    return None


@router.post("/{document_id}/reprocess", response_model=DocumentResponse)
async def reprocess_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Reprocess a document with AI."""
    logger.info(f"🔄 Reprocess │ User {current_user['_id']} requesting reprocessing for {document_id}")
    documents = get_documents_collection()
    
    try:
        doc = await documents.find_one({
            "_id": ObjectId(document_id),
            "user_id": current_user["_id"]
        })
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    # Reset status
    await documents.update_one(
        {"_id": ObjectId(document_id)},
        {"$set": {"processing_status": ProcessingStatus.PENDING}}
    )
    
    # Start reprocessing
    background_tasks.add_task(
        process_document,
        document_id,
        doc["file_path"],
        doc["file_type"],
        doc["title"]
    )
    
    doc["processing_status"] = ProcessingStatus.PENDING
    return document_to_response(doc)
