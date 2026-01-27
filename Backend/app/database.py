"""
MongoDB Database Connection
"""
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from urllib.parse import urlparse
import os

# Global database instance
db = None
client = None

def get_database_name(mongo_uri):
    """Extract database name from MongoDB URI."""
    try:
        parsed = urlparse(mongo_uri)
        # Get the path and remove leading slash
        path = parsed.path.lstrip('/')
        # Remove query parameters if any
        db_name = path.split('?')[0] if '?' in path else path
        # Return database name or default
        return db_name if db_name else 'video_app'
    except Exception:
        return 'video_app'

def init_db(app):
    """Initialize MongoDB connection."""
    global db, client
    
    mongo_uri = app.config.get('MONGO_URI')
    
    try:
        client = MongoClient(mongo_uri)
        # Test connection
        client.admin.command('ping')
        
        # Get database name from URI or use default
        db_name = get_database_name(mongo_uri)
        db = client[db_name]
        
        print(f"[OK] Connected to MongoDB: {db_name}")
        
        # Create indexes
        create_indexes()
        
    except ConnectionFailure as e:
        print(f"[ERROR] MongoDB connection failed: {e}")
        raise e

def create_indexes():
    """Create database indexes for better performance."""
    global db
    
    if db is not None:
        # User indexes
        db.users.create_index('email', unique=True)
        
        # Video indexes
        db.videos.create_index('is_active')
        
        print("[OK] Database indexes created")

def get_db():
    """Get the database instance."""
    global db
    return db
