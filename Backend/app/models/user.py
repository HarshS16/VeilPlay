"""
User Model
"""
from datetime import datetime
from bson import ObjectId
import bcrypt
from app.database import get_db


class User:
    """User model for authentication and profile management."""
    
    collection_name = 'users'
    
    def __init__(self, name, email, password_hash=None, _id=None, created_at=None):
        self._id = _id or ObjectId()
        self.name = name
        self.email = email.lower()
        self.password_hash = password_hash
        self.created_at = created_at or datetime.utcnow()
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt."""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """Verify a password against its hash."""
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    
    def to_dict(self) -> dict:
        """Convert user to dictionary."""
        return {
            '_id': self._id,
            'name': self.name,
            'email': self.email,
            'password_hash': self.password_hash,
            'created_at': self.created_at
        }
    
    def to_json(self) -> dict:
        """Convert user to JSON-safe dictionary (without password)."""
        return {
            'id': str(self._id),
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def save(self) -> 'User':
        """Save user to database."""
        db = get_db()
        db[self.collection_name].update_one(
            {'_id': self._id},
            {'$set': self.to_dict()},
            upsert=True
        )
        return self
    
    @classmethod
    def find_by_email(cls, email: str) -> 'User':
        """Find user by email."""
        db = get_db()
        data = db[cls.collection_name].find_one({'email': email.lower()})
        if data:
            return cls(
                name=data['name'],
                email=data['email'],
                password_hash=data['password_hash'],
                _id=data['_id'],
                created_at=data.get('created_at')
            )
        return None
    
    @classmethod
    def find_by_id(cls, user_id: str) -> 'User':
        """Find user by ID."""
        db = get_db()
        try:
            data = db[cls.collection_name].find_one({'_id': ObjectId(user_id)})
            if data:
                return cls(
                    name=data['name'],
                    email=data['email'],
                    password_hash=data['password_hash'],
                    _id=data['_id'],
                    created_at=data.get('created_at')
                )
        except Exception:
            pass
        return None
    
    @classmethod
    def create(cls, name: str, email: str, password: str) -> 'User':
        """Create a new user with hashed password."""
        password_hash = cls.hash_password(password)
        user = cls(name=name, email=email, password_hash=password_hash)
        user.save()
        return user
