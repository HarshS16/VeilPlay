"""
Video Playback Token Utilities

This module handles the generation and verification of playback tokens.
This is the KEY security feature that abstracts YouTube URLs from the client.

Flow:
1. Client requests video details → Gets playback_token
2. Client requests stream with token → Backend validates and returns embed URL
3. Token expires after 1 hour → Client must request new token
"""
import jwt
import os
from datetime import datetime, timedelta


def get_video_secret() -> str:
    """Get the secret key for video tokens."""
    return os.getenv('JWT_SECRET_KEY', 'video-secret-key') + '-video'


def generate_playback_token(video_id: str, user_id: str) -> str:
    """
    Generate a time-limited playback token for a video.
    
    This token:
    - Is tied to a specific video and user
    - Expires after 1 hour
    - Must be presented to get the actual stream URL
    
    Args:
        video_id: The video ID
        user_id: The user ID
    
    Returns:
        JWT token string
    """
    payload = {
        'video_id': video_id,
        'user_id': user_id,
        'type': 'playback',
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=1)
    }
    
    token = jwt.encode(payload, get_video_secret(), algorithm='HS256')
    return token


def verify_playback_token(token: str, video_id: str, user_id: str) -> dict:
    """
    Verify a playback token.
    
    Checks:
    - Token is valid and not expired
    - Token matches the requested video
    - Token belongs to the requesting user
    
    Args:
        token: The playback token to verify
        video_id: Expected video ID
        user_id: Expected user ID
    
    Returns:
        Decoded token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, get_video_secret(), algorithms=['HS256'])
        
        # Verify token type
        if payload.get('type') != 'playback':
            return None
        
        # Verify video ID matches
        if payload.get('video_id') != video_id:
            return None
        
        # Verify user ID matches
        if payload.get('user_id') != user_id:
            return None
        
        return payload
        
    except jwt.ExpiredSignatureError:
        print("Playback token expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Invalid playback token: {e}")
        return None
