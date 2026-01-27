"""
Video Routes
"""
from flask import Blueprint, request, jsonify, Response, make_response, stream_with_context
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.video import Video
from app.utils.video_token import generate_playback_token, verify_playback_token
import yt_dlp
import threading
import time
import requests

video_bp = Blueprint('video', __name__)

# Cache for extracted stream data (youtube_id -> {url, headers, expires_at})
_stream_cache = {}
_cache_lock = threading.Lock()
CACHE_DURATION = 3600  # 1 hour


def _get_cached_stream_data(youtube_id):
    """Get cached stream data if still valid."""
    with _cache_lock:
        if youtube_id in _stream_cache:
            cached = _stream_cache[youtube_id]
            if cached['expires_at'] > time.time():
                return cached
            else:
                del _stream_cache[youtube_id]
    return None


def _cache_stream_data(youtube_id, url, headers):
    """Cache stream data."""
    with _cache_lock:
        _stream_cache[youtube_id] = {
            'url': url,
            'headers': headers,
            'expires_at': time.time() + CACHE_DURATION
        }


def _extract_stream_data(youtube_id):
    """
    Extract the direct stream URL and required headers from YouTube using yt-dlp.
    Returns both URL and headers needed to access the stream.
    """
    try:
        # Check cache first
        cached = _get_cached_stream_data(youtube_id)
        if cached:
            print(f"Using cached stream data for {youtube_id}")
            return cached['url'], cached['headers']

        youtube_url = f"https://www.youtube.com/watch?v={youtube_id}"
        
        ydl_opts = {
            'format': 'best[ext=mp4][height<=720]/best[ext=mp4]/best',  # Prefer 720p mp4
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            
            # Get the URL and headers
            stream_url = info.get('url')
            http_headers = info.get('http_headers', {})
            
            if stream_url:
                _cache_stream_data(youtube_id, stream_url, http_headers)
                print(f"Extracted stream data for {youtube_id}")
                return stream_url, http_headers
            
            # Try to get from formats
            formats = info.get('formats', [])
            for fmt in reversed(formats):
                if fmt.get('url') and fmt.get('ext') == 'mp4':
                    url = fmt['url']
                    headers = fmt.get('http_headers', http_headers)
                    _cache_stream_data(youtube_id, url, headers)
                    return url, headers
            
            # Fallback to any format
            for fmt in reversed(formats):
                if fmt.get('url'):
                    url = fmt['url']
                    headers = fmt.get('http_headers', http_headers)
                    _cache_stream_data(youtube_id, url, headers)
                    return url, headers
                    
        return None, None
        
    except Exception as e:
        print(f"Error extracting stream data: {e}")
        return None, None


@video_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """
    Get dashboard videos (exactly 2 active videos).
    
    Headers:
        - Authorization: Bearer <token>
    
    Returns:
        - 200: List of 2 video objects
        - 401: Unauthorized
    """
    try:
        # Get 2 active videos
        videos = Video.get_active_videos(limit=2)
        
        # Convert to JSON (youtube_id is hidden)
        videos_json = [video.to_json() for video in videos]
        
        return jsonify({
            'videos': videos_json,
            'count': len(videos_json)
        }), 200
        
    except Exception as e:
        print(f"Dashboard error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@video_bp.route('/video/<video_id>', methods=['GET'])
@jwt_required()
def get_video_details(video_id):
    """
    Get video details with playback token.
    
    Headers:
        - Authorization: Bearer <token>
    
    Path Parameters:
        - video_id: string (required)
    
    Returns:
        - 200: Video details with playback token and player URL
        - 404: Video not found
        - 401: Unauthorized
    """
    try:
        video = Video.find_by_id(video_id)
        
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        
        if not video.is_active:
            return jsonify({'error': 'Video is not available'}), 404
        
        # Get user ID for token generation
        user_id = get_jwt_identity()
        
        # Generate playback token (time-limited)
        playback_token = generate_playback_token(video_id, user_id)
        
        # Generate the player URL (this is what the app loads in WebView)
        # The actual YouTube URL is NEVER exposed to the client
        player_url = f"/video/{video_id}/player?token={playback_token}"
        
        return jsonify({
            'video': video.to_json(),
            'playback_token': playback_token,
            'player_url': player_url  # App loads this in WebView
        }), 200
        
    except Exception as e:
        print(f"Get video error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@video_bp.route('/video/<video_id>/stream', methods=['GET'])
@jwt_required()
def stream_video(video_id):
    """
    Get the direct video stream URL.
    
    This endpoint extracts the actual video stream URL using yt-dlp.
    The URL can be played directly by native video players.
    YouTube is completely hidden from the client!
    
    Headers:
        - Authorization: Bearer <token>
    
    Path Parameters:
        - video_id: string (required)
    
    Query Parameters:
        - token: string (playback token, required)
    
    Returns:
        - 200: Direct stream URL for video playback
        - 400: Missing or invalid token
        - 404: Video not found
        - 500: Failed to extract stream
        - 401: Unauthorized
    """
    try:
        # Get and validate playback token
        playback_token = request.args.get('token')
        
        if not playback_token:
            return jsonify({'error': 'Playback token is required'}), 400
        
        # Verify the playback token
        user_id = get_jwt_identity()
        token_data = verify_playback_token(playback_token, video_id, user_id)
        
        if not token_data:
            return jsonify({'error': 'Invalid or expired playback token'}), 400
        
        # Get video from database
        video = Video.find_by_id(video_id)
        
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        
        if not video.is_active:
            return jsonify({'error': 'Video is not available'}), 404
        
        # Return the proxy URL instead of direct YouTube URL
        # The proxy endpoint will stream the video through our backend
        # This ensures the app NEVER sees YouTube URLs!
        proxy_url = f"/video/{video_id}/proxy?token={playback_token}"
        
        return jsonify({
            'stream_url': proxy_url,  # Proxy URL - YouTube completely hidden!
            'video_id': video_id,
            'title': video.title,
            'description': video.description,
            'thumbnail_url': video.thumbnail_url,
            'expires_in': 3600  # Token valid for 1 hour
        }), 200
        
    except Exception as e:
        print(f"Stream video error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@video_bp.route('/video/<video_id>/proxy', methods=['GET'])
def proxy_video(video_id):
    """
    Proxy the video stream through our backend.
    
    This endpoint fetches the video from YouTube and streams it to the client.
    The client never sees the YouTube URL - complete abstraction!
    
    Query Parameters:
        - token: string (playback token, required)
    
    Returns:
        - 200: Video stream
        - 400: Missing or invalid token
        - 404: Video not found
        - 500: Failed to stream
    """
    try:
        # Get and validate playback token
        playback_token = request.args.get('token')
        
        if not playback_token:
            return "Token required", 400
        
        # Verify token (without user since this might be called without JWT header)
        token_data = verify_playback_token_without_user(playback_token, video_id)
        
        if not token_data:
            return "Invalid or expired token", 400
        
        # Get video from database
        video = Video.find_by_id(video_id)
        
        if not video:
            return "Video not found", 404
        
        if not video.is_active:
            return "Video not available", 404
        
        # Extract stream URL and headers
        stream_url, stream_headers = _extract_stream_data(video.youtube_id)
        
        if not stream_url:
            return "Failed to get video stream", 500
        
        # Handle range requests for seeking
        range_header = request.headers.get('Range')
        req_headers = dict(stream_headers) if stream_headers else {}
        
        if range_header:
            req_headers['Range'] = range_header
        
        # Fetch video from YouTube
        resp = requests.get(stream_url, headers=req_headers, stream=True, timeout=30)
        
        # Build response headers
        response_headers = {
            'Content-Type': resp.headers.get('Content-Type', 'video/mp4'),
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*',
        }
        
        if 'Content-Length' in resp.headers:
            response_headers['Content-Length'] = resp.headers['Content-Length']
        if 'Content-Range' in resp.headers:
            response_headers['Content-Range'] = resp.headers['Content-Range']
        
        # Stream the video
        def generate():
            for chunk in resp.iter_content(chunk_size=8192):
                if chunk:
                    yield chunk
        
        status_code = 206 if range_header and resp.status_code == 206 else 200
        
        return Response(
            stream_with_context(generate()),
            status=status_code,
            headers=response_headers
        )
        
    except requests.exceptions.Timeout:
        print("Video proxy timeout")
        return "Stream timeout", 504
    except Exception as e:
        print(f"Video proxy error: {e}")
        return "Failed to stream video", 500


@video_bp.route('/video/<video_id>/player', methods=['GET'])
def video_player(video_id):
    """
    Serve the video player HTML page.
    
    This endpoint serves an HTML page with embedded video player.
    The YouTube URL is embedded in the HTML, NOT in JSON responses.
    This way, the mobile app never sees the raw YouTube URL.
    
    The app loads this URL in a WebView.
    
    Query Parameters:
        - token: string (playback token, required)
    
    Returns:
        - 200: HTML page with embedded video
        - 400: Missing or invalid token
        - 404: Video not found
    """
    try:
        # Get playback token from query
        playback_token = request.args.get('token')
        
        if not playback_token:
            return _error_html("Playback token is required"), 400
        
        # Verify the playback token (extract user_id from token itself)
        token_data = verify_playback_token_without_user(playback_token, video_id)
        
        if not token_data:
            return _error_html("Invalid or expired playback token"), 400
        
        # Get video from database
        video = Video.find_by_id(video_id)
        
        if not video:
            return _error_html("Video not found"), 404
        
        if not video.is_active:
            return _error_html("Video is not available"), 404
        
        # Generate the HTML player page with YouTube completely hidden
        # Uses YouTube IFrame API for custom controls
        # The YouTube URL is ONLY here - never in JSON responses!
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>{video.title}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        html, body {{
            width: 100%;
            height: 100%;
            background-color: #000;
            overflow: hidden;
            touch-action: manipulation;
        }}
        .player-wrapper {{
            position: relative;
            width: 100%;
            height: 100%;
        }}
        #player {{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }}
        /* Custom controls overlay */
        .controls {{
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 15px;
            background: linear-gradient(transparent, rgba(0,0,0,0.8));
            z-index: 100;
            display: flex;
            align-items: center;
            gap: 15px;
        }}
        .play-btn {{
            width: 44px;
            height: 44px;
            background: rgba(255,255,255,0.2);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        .progress-container {{
            flex: 1;
            height: 6px;
            background: rgba(255,255,255,0.3);
            border-radius: 3px;
            cursor: pointer;
        }}
        .progress-bar {{
            height: 100%;
            background: #ff0000;
            border-radius: 3px;
            width: 0%;
            transition: width 0.1s;
        }}
        .time {{
            color: white;
            font-size: 12px;
            font-family: Arial, sans-serif;
            min-width: 80px;
            text-align: right;
        }}
        .mute-btn {{
            width: 40px;
            height: 40px;
            background: transparent;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
        }}
        /* Tap area for play/pause */
        .tap-area {{
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 60px;
            z-index: 50;
        }}
        /* Center play button */
        .center-play {{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 70px;
            height: 70px;
            background: rgba(0,0,0,0.6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            color: white;
            z-index: 60;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
        }}
        .center-play.visible {{
            opacity: 1;
        }}
    </style>
</head>
<body>
    <div class="player-wrapper">
        <div id="player"></div>
        
        <!-- Tap area for play/pause -->
        <div class="tap-area" id="tapArea"></div>
        
        <!-- Center play indicator -->
        <div class="center-play" id="centerPlay">▶</div>
        
        <!-- Custom controls -->
        <div class="controls">
            <button class="play-btn" id="playBtn">▶</button>
            <div class="progress-container" id="progressContainer">
                <div class="progress-bar" id="progressBar"></div>
            </div>
            <span class="time" id="timeDisplay">0:00 / 0:00</span>
            <button class="mute-btn" id="muteBtn">🔊</button>
        </div>
    </div>

    <script>
        // Load YouTube IFrame API
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        var player;
        var isPlaying = false;
        var isMuted = false;
        var updateInterval;

        function onYouTubeIframeAPIReady() {{
            player = new YT.Player('player', {{
                videoId: '{video.youtube_id}',
                playerVars: {{
                    'autoplay': 1,
                    'controls': 0,
                    'rel': 0,
                    'modestbranding': 1,
                    'playsinline': 1,
                    'fs': 0,
                    'iv_load_policy': 3,
                    'disablekb': 1,
                    'origin': window.location.origin
                }},
                events: {{
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }}
            }});
        }}

        function onPlayerReady(event) {{
            event.target.playVideo();
            startProgressUpdate();
        }}

        function onPlayerStateChange(event) {{
            isPlaying = (event.data === YT.PlayerState.PLAYING);
            updatePlayButton();
        }}

        function updatePlayButton() {{
            document.getElementById('playBtn').textContent = isPlaying ? '⏸' : '▶';
            document.getElementById('centerPlay').textContent = isPlaying ? '⏸' : '▶';
        }}

        function togglePlay() {{
            if (isPlaying) {{
                player.pauseVideo();
            }} else {{
                player.playVideo();
            }}
            // Show center indicator briefly
            var center = document.getElementById('centerPlay');
            center.classList.add('visible');
            setTimeout(function() {{
                center.classList.remove('visible');
            }}, 500);
        }}

        function toggleMute() {{
            if (isMuted) {{
                player.unMute();
                isMuted = false;
                document.getElementById('muteBtn').textContent = '🔊';
            }} else {{
                player.mute();
                isMuted = true;
                document.getElementById('muteBtn').textContent = '🔇';
            }}
        }}

        function formatTime(seconds) {{
            var mins = Math.floor(seconds / 60);
            var secs = Math.floor(seconds % 60);
            return mins + ':' + (secs < 10 ? '0' : '') + secs;
        }}

        function startProgressUpdate() {{
            updateInterval = setInterval(function() {{
                if (player && player.getCurrentTime) {{
                    var current = player.getCurrentTime();
                    var duration = player.getDuration();
                    var percent = (current / duration) * 100;
                    document.getElementById('progressBar').style.width = percent + '%';
                    document.getElementById('timeDisplay').textContent = 
                        formatTime(current) + ' / ' + formatTime(duration);
                }}
            }}, 250);
        }}

        function seek(e) {{
            var container = document.getElementById('progressContainer');
            var rect = container.getBoundingClientRect();
            var percent = (e.clientX - rect.left) / rect.width;
            var duration = player.getDuration();
            player.seekTo(percent * duration, true);
        }}

        // Event listeners
        document.getElementById('playBtn').addEventListener('click', togglePlay);
        document.getElementById('tapArea').addEventListener('click', togglePlay);
        document.getElementById('muteBtn').addEventListener('click', toggleMute);
        document.getElementById('progressContainer').addEventListener('click', seek);

        // Block any navigation attempts
        window.open = function() {{ return null; }};
    </script>
</body>
</html>
"""
        response = make_response(html_content)
        response.headers['Content-Type'] = 'text/html'
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        return response
        
    except Exception as e:
        print(f"Video player error: {e}")
        return _error_html("Internal server error"), 500


def _error_html(message: str) -> Response:
    """Generate error HTML page."""
    html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            background-color: #1a1a1a;
            color: #fff;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }}
        .error-container {{
            text-align: center;
            padding: 20px;
        }}
        h1 {{
            color: #ff4444;
            margin-bottom: 10px;
        }}
        p {{
            color: #ccc;
        }}
    </style>
</head>
<body>
    <div class="error-container">
        <h1>Error</h1>
        <p>{message}</p>
    </div>
</body>
</html>
"""
    response = make_response(html)
    response.headers['Content-Type'] = 'text/html'
    return response


def verify_playback_token_without_user(token: str, video_id: str) -> dict:
    """
    Verify playback token without requiring user_id.
    Used for the HTML player endpoint which doesn't have JWT auth.
    """
    import jwt
    import os
    
    try:
        secret = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key') + '-video'
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        
        # Verify token type
        if payload.get('type') != 'playback':
            return None
        
        # Verify video ID matches
        if payload.get('video_id') != video_id:
            return None
        
        return payload
        
    except jwt.ExpiredSignatureError:
        print("Playback token expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Invalid playback token: {e}")
        return None
