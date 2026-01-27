"""
Database Seed Script

Run this script to populate the database with sample videos.
Usage: python seed_data.py
"""
from app import create_app
from app.models.video import Video
from app.database import get_db


def seed_videos():
    """Seed the database with sample videos."""
    
    # Sample videos (using popular tech/startup videos that allow embedding)
    # These are real YouTube videos with embedding enabled
    sample_videos = [
        {
            'title': 'How Great Leaders Inspire Action',
            'description': 'Simon Sinek presents a simple but powerful model for how leaders inspire action, starting with a golden circle.',
            'youtube_id': 'qp0HIF3SfI4',  # Simon Sinek - Start With Why TED Talk
            'thumbnail_url': 'https://img.youtube.com/vi/qp0HIF3SfI4/maxresdefault.jpg',
            'is_active': True
        },
        {
            'title': 'The Puzzle of Motivation',
            'description': 'Career analyst Dan Pink examines the puzzle of motivation, starting with a fact that social scientists know.',
            'youtube_id': 'rrkrvAUbU9Y',  # Dan Pink - Drive TED Talk
            'thumbnail_url': 'https://img.youtube.com/vi/rrkrvAUbU9Y/maxresdefault.jpg',
            'is_active': True
        }
    ]
    
    db = get_db()
    
    # Clear existing videos (optional)
    # db.videos.delete_many({})
    
    for video_data in sample_videos:
        # Check if video already exists
        existing = db.videos.find_one({'youtube_id': video_data['youtube_id']})
        
        if not existing:
            video = Video.create(
                title=video_data['title'],
                description=video_data['description'],
                youtube_id=video_data['youtube_id'],
                thumbnail_url=video_data['thumbnail_url'],
                is_active=video_data['is_active']
            )
            print(f"[OK] Created video: {video.title}")
        else:
            print(f"[SKIP] Video already exists: {video_data['title']}")
    
    print("\n[DONE] Seeding complete!")


if __name__ == '__main__':
    print("[SEED] Starting database seeding...")
    print("-" * 40)
    
    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        seed_videos()
