from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
from app.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    """Connect to MongoDB Atlas."""
    global client, db
    client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        server_api=ServerApi('1')
    )
    db = client.education_db
    
    # Verify connection
    try:
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
    except Exception as e:
        print(f"❌ MongoDB connection error: {e}")
        raise e


async def close_mongo_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")


def get_database():
    """Get database instance."""
    return db


# Collection references
def get_users_collection():
    return db.users


def get_documents_collection():
    return db.documents


def get_quizzes_collection():
    return db.quizzes


def get_quiz_results_collection():
    return db.quiz_results


def get_progress_collection():
    return db.learning_progress
