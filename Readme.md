# 🎬 API-First Video App

A React Native mobile app with a Flask backend that demonstrates API-first architecture with secure YouTube video abstraction.

## 📐 Architecture

```
React Native App  →  Flask API  →  MongoDB
                         ↓
                    YouTube (hidden behind backend logic)
```

**Key Principle:** The mobile app acts as a thin client — no business logic, only API calls.

---

## 🗂️ Project Structure

```
├── Backend/                    # Flask API Server
│   ├── app/
│   │   ├── __init__.py        # Flask app factory
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # MongoDB connection
│   │   ├── models/            # User & Video models
│   │   ├── routes/            # API endpoints
│   │   └── utils/             # Validators & token handlers
│   ├── .env.example           # Environment template
│   ├── requirements.txt       # Python dependencies
│   ├── run.py                 # Entry point
│   └── seed_data.py           # Database seeding
│
└── Frontend/                   # React Native App (coming soon)
```

---

## 🚀 Backend Setup & Running

### Prerequisites
- Python 3.10+
- MongoDB (local or MongoDB Atlas)
- Git

### Step 1: Navigate to Backend Directory
```bash
cd Backend
```

### Step 2: Create Virtual Environment
```bash
# Windows
python -m venv venv

# macOS/Linux
python3 -m venv venv
```

### Step 3: Activate Virtual Environment
```bash
# Windows (Command Prompt)
venv\Scripts\activate

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate
```

### Step 4: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 5: Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your MongoDB URI
# For MongoDB Atlas:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/video_app?retryWrites=true&w=majority

# For Local MongoDB:
MONGO_URI=mongodb://localhost:27017/video_app
```

### Step 6: Seed the Database (Optional but Recommended)
```bash
python seed_data.py
```
This creates 2 sample videos in the database.

### Step 7: Run the Server
```bash
python run.py
```

**Expected Output:**
```
[OK] Connected to MongoDB: video_app
[OK] Database indexes created
[OK] Flask app initialized successfully
[START] Starting Flask server on 0.0.0.0:5000
 * Running on http://127.0.0.1:5000
```

---

## 🧪 API Testing Guide

### Base URL
```
http://127.0.0.1:5000
```

### Health Check
```bash
curl http://127.0.0.1:5000/health
```
**Expected Response:**
```json
{"status": "healthy", "message": "API is running"}
```

---

## 🔐 Authentication Endpoints

### 1. User Signup
```bash
curl -X POST http://127.0.0.1:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "created_at": "..."
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. User Login
```bash
curl -X POST http://127.0.0.1:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {...},
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get User Profile (Protected)
```bash
curl -X GET http://127.0.0.1:5000/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Logout (Protected)
```bash
curl -X POST http://127.0.0.1:5000/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎥 Video Endpoints

### 1. Get Dashboard Videos (Protected)
```bash
curl -X GET http://127.0.0.1:5000/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "count": 2,
  "videos": [
    {
      "id": "...",
      "title": "How Startups Fail",
      "description": "Lessons from real founders...",
      "thumbnail_url": "https://img.youtube.com/vi/.../maxresdefault.jpg",
      "is_active": true,
      "created_at": "..."
    },
    {...}
  ]
}
```
⚠️ **Note:** `youtube_id` is NOT exposed in the response!

### 2. Get Video Details with Playback Token (Protected)
```bash
curl -X GET http://127.0.0.1:5000/video/VIDEO_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "video": {...},
  "playback_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Stream URL (Protected)
```bash
curl -X GET "http://127.0.0.1:5000/video/VIDEO_ID/stream?token=PLAYBACK_TOKEN" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "stream_url": "https://www.youtube.com/embed/...",
  "video_id": "...",
  "title": "...",
  "expires_in": 3600
}
```

---

## 🔥 YouTube URL Abstraction (The "Twist")

The backend implements **Option B** for YouTube abstraction:

1. **Client requests video details** → Gets `playback_token`
2. **Client requests stream URL** with token → Backend validates & returns embed URL
3. **Token expires after 1 hour** → Must request new token

**Security Features:**
- YouTube IDs never exposed directly to the client
- Playback tokens are time-limited (1 hour)
- Tokens are tied to specific user + video combinations
- Invalid tokens are rejected

---

## 📊 Database Models

### User
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique identifier |
| `name` | String | User's full name |
| `email` | String | Unique email (indexed) |
| `password_hash` | String | Bcrypt hashed password |
| `created_at` | DateTime | Account creation timestamp |

### Video
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique identifier |
| `title` | String | Video title |
| `description` | String | Video description |
| `youtube_id` | String | Hidden YouTube video ID |
| `thumbnail_url` | String | Video thumbnail |
| `is_active` | Boolean | Visibility flag |
| `created_at` | DateTime | Creation timestamp |

---

## 🛠️ Troubleshooting

### MongoDB Connection Error
- Verify your `MONGO_URI` in `.env`
- For Atlas: Check IP whitelist
- For local: Ensure MongoDB service is running

### JWT Token Errors
- Token expired: Login again to get new token
- Invalid token: Check Authorization header format: `Bearer <token>`

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

---

## 📦 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_DEBUG` | Enable debug mode | `1` |
| `SECRET_KEY` | Flask secret key | Required |
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_SECRET_KEY` | JWT signing key | Required |
| `JWT_ACCESS_TOKEN_EXPIRES` | Token expiry (seconds) | `86400` |
| `PORT` | Server port | `5000` |
| `HOST` | Server host | `0.0.0.0` |

---

## 🧑‍💻 Development Commands

```bash
# Activate virtual environment
venv\Scripts\activate   # Windows
source venv/bin/activate # macOS/Linux

# Run server
python run.py

# Seed database
python seed_data.py

# Install new package
pip install package_name
pip freeze > requirements.txt
```

---

## 📄 License

This project is for educational purposes.
