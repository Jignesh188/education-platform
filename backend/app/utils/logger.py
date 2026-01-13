import logging
import sys
from datetime import datetime

# Configure logging
def setup_logging():
    """Configure professional logging for the application."""
    
    # Create custom formatter
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
            
            return message
    
    # Create handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(ColoredFormatter())
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.handlers = [handler]
    
    # Configure uvicorn access logs
    uvicorn_access = logging.getLogger("uvicorn.access")
    uvicorn_access.handlers = [handler]
    
    # Configure uvicorn error logs
    uvicorn_error = logging.getLogger("uvicorn.error")
    uvicorn_error.handlers = [handler]
    
    return logging.getLogger("edulearn")


# Initialize logger
logger = setup_logging()


def log_request(method: str, path: str, status: int = None, duration: float = None):
    """Log HTTP request in a clean format."""
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
        logger.info(f"{color}{method:6}{reset} {path} → {status_color}{status}{reset} ({duration:.2f}ms)")
    else:
        logger.info(f"{color}{method:6}{reset} {path}")


def log_db_operation(operation: str, collection: str, details: str = None):
    """Log database operations."""
    logger.info(f"📦 DB │ {operation.upper():8} on {collection}" + (f" │ {details}" if details else ""))


def log_ai_operation(operation: str, details: str = None):
    """Log AI service operations."""
    logger.info(f"🤖 AI │ {operation}" + (f" │ {details}" if details else ""))


def log_startup(message: str):
    """Log startup messages."""
    print(f"\n\x1b[38;5;51m{'═' * 60}\x1b[0m")
    print(f"\x1b[38;5;51m  🎓 EduLearn API - {message}\x1b[0m")
    print(f"\x1b[38;5;51m{'═' * 60}\x1b[0m\n")
