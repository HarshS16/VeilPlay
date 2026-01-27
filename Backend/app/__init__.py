"""
Flask Application Factory
"""
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize extensions
jwt = JWTManager()

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object('app.config.Config')
    
    # Initialize CORS - allow ngrok header for remote testing
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "ngrok-skip-browser-warning"]
        }
    })
    
    # Initialize JWT
    jwt.init_app(app)
    
    # Initialize MongoDB
    from app.database import init_db
    init_db(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.video import video_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(video_bp)
    
    # Health check route
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'API is running'}, 200
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {'error': 'Token has expired', 'message': 'Please log in again'}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {'error': 'Invalid token', 'message': 'Token verification failed'}, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {'error': 'Authorization required', 'message': 'No token provided'}, 401
    
    print("[OK] Flask app initialized successfully")
    return app
