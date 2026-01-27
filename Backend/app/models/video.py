"""
Video Model
"""
from datetime import datetime
from bson import ObjectId
from app.database import get_db


class Video:
    """Video model for storing video metadata."""
    
    collection_name = 'videos'
    
    def __init__(self, title, description, youtube_id, thumbnail_url, 
                 is_active=True, _id=None, created_at=None):
        self._id = _id or ObjectId()
        self.title = title
        self.description = description
        self.youtube_id = youtube_id  # Hidden from frontend
        self.thumbnail_url = thumbnail_url
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self) -> dict:
        """Convert video to dictionary for database storage."""
        return {
            '_id': self._id,
            'title': self.title,
            'description': self.description,
            'youtube_id': self.youtube_id,
            'thumbnail_url': self.thumbnail_url,
            'is_active': self.is_active,
            'created_at': self.created_at
        }
    
    def to_json(self) -> dict:
        """
        Convert video to JSON-safe dictionary.
        NOTE: youtube_id is NOT exposed to frontend!
        """
        return {
            'id': str(self._id),
            'title': self.title,
            'description': self.description,
            'thumbnail_url': self.thumbnail_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def save(self) -> 'Video':
        """Save video to database."""
        db = get_db()
        db[self.collection_name].update_one(
            {'_id': self._id},
            {'$set': self.to_dict()},
            upsert=True
        )
        return self
    
    @classmethod
    def find_by_id(cls, video_id: str) -> 'Video':
        """Find video by ID."""
        db = get_db()
        try:
            data = db[cls.collection_name].find_one({'_id': ObjectId(video_id)})
            if data:
                return cls(
                    title=data['title'],
                    description=data['description'],
                    youtube_id=data['youtube_id'],
                    thumbnail_url=data['thumbnail_url'],
                    is_active=data.get('is_active', True),
                    _id=data['_id'],
                    created_at=data.get('created_at')
                )
        except Exception:
            pass
        return None
    
    @classmethod
    def get_active_videos(cls, limit: int = 2) -> list:
        """Get active videos for dashboard."""
        db = get_db()
        videos = db[cls.collection_name].find(
            {'is_active': True}
        ).limit(limit)
        
        result = []
        for data in videos:
            video = cls(
                title=data['title'],
                description=data['description'],
                youtube_id=data['youtube_id'],
                thumbnail_url=data['thumbnail_url'],
                is_active=data.get('is_active', True),
                _id=data['_id'],
                created_at=data.get('created_at')
            )
            result.append(video)
        
        return result
    
    @classmethod
    def create(cls, title: str, description: str, youtube_id: str, 
               thumbnail_url: str, is_active: bool = True) -> 'Video':
        """Create a new video."""
        video = cls(
            title=title,
            description=description,
            youtube_id=youtube_id,
            thumbnail_url=thumbnail_url,
            is_active=is_active
        )
        video.save()
        return video
