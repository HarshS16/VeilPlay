"""
Entry point for the Flask application.
Run with: python run.py
"""
from app import create_app

app = create_app()

if __name__ == '__main__':
    import os
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    debug = os.getenv('FLASK_DEBUG', '1') == '1'
    
    print(f"[START] Starting Flask server on {host}:{port}")
    app.run(host=host, port=port, debug=debug)
