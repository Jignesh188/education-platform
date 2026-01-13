from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time

from app.database import connect_to_mongo, close_mongo_connection
from app.routers import auth, documents, quiz, progress
from app.utils.logger import logger, log_request, log_startup


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    log_startup("Starting Server")
    logger.info("Connecting to MongoDB Atlas...")
    await connect_to_mongo()
    logger.info("Server ready to accept connections")
    print()
    yield
    # Shutdown
    logger.info("Shutting down server...")
    await close_mongo_connection()
    logger.info("Server stopped gracefully")


app = FastAPI(
    title="Education Dashboard API",
    description="AI-powered educational platform with document processing, quiz generation, and learning analytics",
    version="1.0.0",
    lifespan=lifespan
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests."""
    start_time = time.time()
    response = await call_next(request)
    duration = (time.time() - start_time) * 1000
    
    # Skip health check logs
    if request.url.path not in ["/", "/api/health"]:
        log_request(request.method, request.url.path, response.status_code, duration)
    
    return response


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz & Exams"])
app.include_router(progress.router, prefix="/api/progress", tags=["Learning Progress"])


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "Education Dashboard API is running",
        "version": "1.0.0"
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "ai_service": "available"
    }
