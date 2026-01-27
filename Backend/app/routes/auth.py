"""
Authentication Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from app.models.user import User
from app.utils.validators import validate_email, validate_password

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Register a new user.
    
    Request Body:
        - name: string (required)
        - email: string (required)
        - password: string (required, min 6 characters)
    
    Returns:
        - 201: User created successfully with JWT token
        - 400: Validation error
        - 409: Email already exists
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Validation
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        
        if not email or not validate_email(email):
            return jsonify({'error': 'Valid email is required'}), 400
        
        if not password or not validate_password(password):
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Check if email already exists
        existing_user = User.find_by_email(email)
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create user
        user = User.create(name=name, email=email, password=password)
        
        # Generate JWT token
        access_token = create_access_token(identity=str(user._id))
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_json(),
            'access_token': access_token
        }), 201
        
    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate user and return JWT token.
    
    Request Body:
        - email: string (required)
        - password: string (required)
    
    Returns:
        - 200: Login successful with JWT token
        - 400: Validation error
        - 401: Invalid credentials
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Validation
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Find user
        user = User.find_by_email(email)
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Verify password
        if not User.verify_password(password, user.password_hash):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate JWT token
        access_token = create_access_token(identity=str(user._id))
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_json(),
            'access_token': access_token
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Get current user's profile.
    
    Headers:
        - Authorization: Bearer <token>
    
    Returns:
        - 200: User profile
        - 401: Unauthorized
        - 404: User not found
    """
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_json()
        }), 200
        
    except Exception as e:
        print(f"Get profile error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user (client-side token removal).
    
    Note: In a production app, you might want to implement
    a token blacklist for proper invalidation.
    
    Headers:
        - Authorization: Bearer <token>
    
    Returns:
        - 200: Logout successful
    """
    try:
        # In a real-world scenario, you'd add the token to a blacklist
        # For this implementation, the client will remove the token
        return jsonify({
            'message': 'Logout successful'
        }), 200
        
    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
