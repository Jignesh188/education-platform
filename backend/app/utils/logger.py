import logging
import sys
import json
import os
from datetime import datetime
from typing import Any, Dict

# Configure logging
class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging."""
    
    def format(self, record):
        log_obj = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
        }
        
        # Add extra fields if available
        if hasattr(record, "props"):
            log_obj.update(record.props)
            
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_obj)

class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors for different log levels."""
    
    grey = "\x1b[38;5;245m"
    blue = "\x1b[38;5;39m"
    yellow = "\x1b[38;5;226m"
    red = "\x1b[38;5;196m"
    bold_red = "\x1b[38;5;196;1m"
    green = "\x1b[38;5;46m"
    cyan = "\x1b[38;5;51m"
    reset = "\x1b[0m"
    
    FORMATS = {
        logging.DEBUG: grey,
        logging.INFO: green,
        logging.WARNING: yellow,
        logging.ERROR: red,
        logging.CRITICAL: bold_red,
    }
    
    def format(self, record):
        color = self.FORMATS.get(record.levelno, self.grey)
        
        # Custom icons for different levels
        icons = {
            logging.DEBUG: "🔍",
            logging.INFO: "✅",
            logging.WARNING: "⚠️ ",
            logging.ERROR: "❌",
            logging.CRITICAL: "🔥",
        }
        icon = icons.get(record.levelno, "📝")
        
        # Format time
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        # Build the log message
        level_name = f"{color}{record.levelname:8}{self.reset}"
        message = f"{self.cyan}[{timestamp}]{self.reset} {icon} {level_name} │ {record.getMessage()}"
        
        # Add extra props if available
        if hasattr(record, "props"):
            props_str = " ".join([f"{k}={v}" for k, v in record.props.items()])
            if props_str:
                message += f" │ {self.grey}{props_str}{self.reset}"
                
        return message

def setup_logging():
    """Configure professional logging for the application."""
    
    # Determine environment
    env = os.getenv("ENVIRONMENT", "development")
    
    handler = logging.StreamHandler(sys.stdout)
    
    if env == "production":
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(ColoredFormatter())
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Remove existing handlers to avoid duplicates
    if root_logger.handlers:
        root_logger.handlers.clear()
        
    root_logger.addHandler(handler)
    
    # Configure specific loggers to avoid double logging if they propagate
    logging.getLogger("uvicorn.access").handlers = [handler]
    logging.getLogger("uvicorn.error").handlers = [handler]
    
    # Prevent uvicorn from using its own handlers if we successfully attached ours
    # limiting noise
    
    return logging.getLogger("edulearn")


# Initialize logger
logger = setup_logging()


def log_request(method: str, path: str, status: int = None, duration: float = None):
    """Log HTTP request in a clean format."""
    
    # Context data for structured logging
    context = {
        "method": method,
        "path": path,
    }
    
    if status:
        context["status"] = status
    if duration:
        context["duration_ms"] = round(duration, 2)

    # Visual formatting helpers for development
    method_colors = {
        "GET": "\x1b[38;5;39m",  # Blue
        "POST": "\x1b[38;5;46m",  # Green
        "PUT": "\x1b[38;5;226m",  # Yellow
        "DELETE": "\x1b[38;5;196m",  # Red
        "PATCH": "\x1b[38;5;208m",  # Orange
    }
    reset = "\x1b[0m"
    color = method_colors.get(method, reset)
    status_color = "\x1b[38;5;46m" if status and status < 400 else "\x1b[38;5;196m"
    
    if status and duration:
        msg = f"{color}{method:6}{reset} {path} → {status_color}{status}{reset} ({duration:.2f}ms)"
    else:
        msg = f"{color}{method:6}{reset} {path}"
        
    logger.info(msg, extra={"props": context})


def log_db_operation(operation: str, collection: str, details: str = None):
    """Log database operations."""
    context = {
        "operation": operation,
        "collection": collection
    }
    if details:
        context["details"] = details
        
    logger.info(f"📦 DB │ {operation.upper():8} on {collection}", extra={"props": context})


def log_ai_operation(operation: str, details: str = None):
    """Log AI service operations."""
    context = {"operation": operation}
    if details:
        context["details"] = details
        
    logger.info(f"🤖 AI │ {operation}", extra={"props": context})


def log_startup(message: str):
    """Log startup messages."""
    print(f"\n\x1b[38;5;51m{'═' * 60}\x1b[0m")
    print(f"\x1b[38;5;51m  🎓 EduLearn API - {message}\x1b[0m")
    print(f"\x1b[38;5;51m{'═' * 60}\x1b[0m\n")
