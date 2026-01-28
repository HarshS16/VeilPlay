<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Native">
  <img src="https://img.shields.io/badge/Expo-54.0.0-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/Flask-3.0.0-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask">
  <img src="https://img.shields.io/badge/MongoDB-4.6.1-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/License-Educational-blue?style=for-the-badge" alt="License">
</p>

<h1 align="center">🎬 VeilPlay</h1>
Demo Video - https://www.loom.com/share/a58051e25029449e9c799ebf1a902059
<p align="center">
  <strong>A Secure Video Streaming Application with YouTube Abstraction</strong>
</p>

<p align="center">
  VeilPlay is a full-stack mobile application built with React Native (Expo) and Flask that demonstrates API-first architecture with secure YouTube video abstraction. The app completely hides YouTube URLs from the client, streaming videos through a secure backend proxy.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-documentation">API Docs</a> •
  <a href="#-security">Security</a>
</p>

---

## ✨ Features

### 📱 Mobile Application (React Native + Expo)

| Feature | Description |
|---------|-------------|
| **🔐 User Authentication** | Secure signup and login with JWT token-based authentication |
| **🎥 Video Dashboard** | Beautiful video tiles with thumbnails, titles, and descriptions |
| **▶️ Custom Video Player** | Full-screen video playback with custom controls via WebView |
| **🌓 Dark/Light Mode** | Toggle between dark and light themes with persistent preference |
| **👤 User Profile** | View user details and manage account settings |
| **🔄 Pull-to-Refresh** | Refresh video content with native pull gesture |
| **📱 Cross-Platform** | Works on iOS, Android, and Web via Expo |
| **💾 Secure Storage** | JWT tokens stored securely using `expo-secure-store` |

### 🖥️ Backend Server (Flask + MongoDB)

| Feature | Description |
|---------|-------------|
| **🔒 JWT Authentication** | Secure token-based authentication with bcrypt password hashing |
| **🎬 Video Abstraction** | Complete YouTube URL hiding - clients never see raw YouTube URLs |
| **🔑 Playback Tokens** | Time-limited tokens (1 hour) for secure video access |
| **🌐 Video Proxy** | Server-side video streaming with range request support |
| **🎮 Custom HTML Player** | Server-rendered player with YouTube IFrame API integration |
| **📊 Stream Caching** | Intelligent caching of extracted stream URLs |
| **🛡️ Navigation Blocking** | Complete prevention of YouTube app/website redirection |

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          VeilPlay Architecture                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────────┐        ┌──────────────────┐        ┌──────────┐ │
│   │   React Native   │◄──────►│    Flask API     │◄──────►│ MongoDB  │ │
│   │   Mobile App     │  REST  │    Backend       │        │ Database │ │
│   │   (Expo)         │  API   │                  │        │          │ │
│   └──────────────────┘        └────────┬─────────┘        └──────────┘ │
│                                        │                               │
│                                        │ yt-dlp                        │
│                                        ▼                               │
│                               ┌──────────────────┐                     │
│                               │     YouTube      │                     │
│                               │  (Hidden Behind  │                     │
│                               │   Backend)       │                     │
│                               └──────────────────┘                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Principle:** The mobile app acts as a **thin client** — no business logic, only API calls. YouTube URLs are **never exposed** to the client.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.5 | Mobile framework |
| Expo | 54.0.0 | Development platform |
| React Navigation | 7.x | Navigation & routing |
| Axios | 1.7.9 | HTTP client |
| React Native WebView | 13.15.0 | Video player embedding |
| Expo Secure Store | 15.0.8 | Secure token storage |
| Async Storage | 2.2.0 | Theme preference persistence |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Flask | 3.0.0 | Web framework |
| Flask-JWT-Extended | 4.6.0 | JWT authentication |
| PyMongo | 4.6.1 | MongoDB driver |
| Flask-CORS | 4.0.0 | Cross-origin requests |
| bcrypt | 4.1.2 | Password hashing |
| yt-dlp | 2024.1.0+ | YouTube stream extraction |

---

## 🗂️ Project Structure

```
VeilPlay/
├── 📁 Backend/                       # Flask API Server
│   ├── 📁 app/
│   │   ├── 📄 __init__.py           # Flask app factory
│   │   ├── 📄 config.py             # Configuration management
│   │   ├── 📄 database.py           # MongoDB connection
│   │   ├── 📁 models/
│   │   │   ├── 📄 user.py           # User model with auth
│   │   │   └── 📄 video.py          # Video model
│   │   ├── 📁 routes/
│   │   │   ├── 📄 auth.py           # Authentication endpoints
│   │   │   └── 📄 video.py          # Video & streaming endpoints
│   │   └── 📁 utils/
│   │       ├── 📄 validators.py     # Input validation
│   │       └── 📄 video_token.py    # Playback token generation
│   ├── 📄 .env.example              # Environment template
│   ├── 📄 requirements.txt          # Python dependencies
│   ├── 📄 run.py                    # Entry point
│   └── 📄 seed_data.py              # Database seeding script
│
├── 📁 Frontend/                      # React Native App
│   ├── 📁 src/
│   │   ├── 📁 context/
│   │   │   ├── 📄 AuthContext.js    # Authentication state
│   │   │   └── 📄 ThemeContext.js   # Theme management
│   │   ├── 📁 navigation/
│   │   │   └── 📄 AppNavigator.js   # Navigation setup
│   │   ├── 📁 screens/
│   │   │   ├── 📄 DashboardScreen.js    # Video dashboard
│   │   │   ├── 📄 LoginScreen.js        # User login
│   │   │   ├── 📄 SignupScreen.js       # User registration
│   │   │   ├── 📄 SettingsScreen.js     # User settings
│   │   │   └── 📄 VideoPlayerScreen.js  # Video playback
│   │   └── 📁 services/
│   │       └── 📄 api.js            # API service layer
│   ├── 📁 assets/                   # App assets (icons, etc.)
│   ├── 📄 App.js                    # App entry point
│   ├── 📄 app.json                  # Expo configuration
│   ├── 📄 package.json              # Node dependencies
│   └── 📄 .env.example              # Frontend env template
│
└── 📄 README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Installation |
|-------------|---------|--------------|
| **Node.js** | 18+ | [Download](https://nodejs.org/) |
| **Python** | 3.10+ | [Download](https://www.python.org/) |
| **MongoDB** | 4.4+ | [Atlas](https://mongodb.com/atlas) or [Local](https://mongodb.com/docs/manual/installation/) |
| **Git** | Latest | [Download](https://git-scm.com/) |
| **Expo CLI** | Latest | `npm install -g expo-cli` |

---

## ⚙️ Backend Setup

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
```

Edit `.env` with your configuration:

```env
# Flask Configuration
FLASK_DEBUG=1
SECRET_KEY=your-super-secret-key-change-in-production

# MongoDB Configuration
# For MongoDB Atlas:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/video_app?retryWrites=true&w=majority

# For Local MongoDB:
MONGO_URI=mongodb://localhost:27017/video_app

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=86400

# Server Configuration
PORT=5000
HOST=0.0.0.0
```

### Step 6: Seed the Database (Recommended)

```bash
python seed_data.py
```

This creates 2 sample videos in the database for testing.

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

## 📱 Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd Frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure API URL

Edit `src/services/api.js` to set your backend URL:

```javascript
// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:5000';

// For iOS Simulator
const API_BASE_URL = 'http://localhost:5000';

// For Physical Device (use your computer's local IP)
const API_BASE_URL = 'http://192.168.x.x:5000';
```

> 💡 **Tip:** Find your local IP with `ipconfig` (Windows) or `ifconfig` (macOS/Linux)

### Step 4: Start the App

```bash
# Start Expo development server
npm start

# Or run on specific platform
npm run android   # Android
npm run ios       # iOS (macOS only)
npm run web       # Web browser
```

---

## 📡 API Documentation

### Base URL
```
http://127.0.0.1:5000
```

### Health Check
```bash
curl http://127.0.0.1:5000/health
```
**Response:**
```json
{"status": "healthy", "message": "API is running"}
```

---

### 🔐 Authentication Endpoints

#### 1. User Signup
```bash
curl -X POST http://127.0.0.1:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "..."
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. User Login
```bash
curl -X POST http://127.0.0.1:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {...},
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Get User Profile
```bash
curl -X GET http://127.0.0.1:5000/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. Logout
```bash
curl -X POST http://127.0.0.1:5000/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 🎥 Video Endpoints

#### 1. Get Dashboard Videos
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
    }
  ]
}
```

> ⚠️ **Note:** `youtube_id` is **NEVER** exposed in API responses!

#### 2. Get Video Details with Playback Token
```bash
curl -X GET http://127.0.0.1:5000/video/VIDEO_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "video": {...},
  "playback_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "player_url": "/video/VIDEO_ID/player?token=..."
}
```

#### 3. Get Stream URL
```bash
curl -X GET "http://127.0.0.1:5000/video/VIDEO_ID/stream?token=PLAYBACK_TOKEN" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "stream_url": "/video/VIDEO_ID/proxy?token=...",
  "video_id": "...",
  "title": "...",
  "expires_in": 3600
}
```

---

## 🔒 Security

### YouTube URL Abstraction Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Secure Video Playback Flow                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Client requests video details                                       │
│     └──► Backend returns playback_token (valid 1 hour)                  │
│                                                                         │
│  2. Client loads player_url in WebView                                  │
│     └──► Backend validates token & serves HTML player                   │
│                                                                         │
│  3. HTML player uses YouTube IFrame API                                 │
│     └──► YouTube ID embedded in HTML only (never in JSON)               │
│                                                                         │
│  4. OR: Client requests proxy stream URL                                │
│     └──► Backend proxies video data from YouTube                        │
│                                                                         │
│  ✅ Result: Client NEVER sees raw YouTube URLs!                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Security Features

| Feature | Implementation |
|---------|----------------|
| **Password Hashing** | bcrypt with automatic salt |
| **JWT Authentication** | Signed tokens with configurable expiration |
| **Playback Tokens** | Separate time-limited tokens for video access |
| **Token Binding** | Playback tokens bound to specific user + video |
| **Navigation Blocking** | WebView blocks all YouTube redirects |
| **Link Interception** | JavaScript prevents all external link clicks |
| **Context Menu Disabled** | Right-click/long-press disabled in player |
| **Popup Blocking** | `window.open` overridden to prevent popups |

---

## 📊 Database Models

### User Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique identifier |
| `name` | String | User's full name |
| `email` | String | Unique email (indexed) |
| `password_hash` | String | Bcrypt hashed password |
| `created_at` | DateTime | Account creation timestamp |

### Video Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique identifier |
| `title` | String | Video title |
| `description` | String | Video description |
| `youtube_id` | String | **Hidden** YouTube video ID |
| `thumbnail_url` | String | Video thumbnail URL |
| `is_active` | Boolean | Visibility flag |
| `created_at` | DateTime | Creation timestamp |

---

## 📦 Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_DEBUG` | Enable debug mode | `1` |
| `SECRET_KEY` | Flask secret key | **Required** |
| `MONGO_URI` | MongoDB connection string | **Required** |
| `JWT_SECRET_KEY` | JWT signing key | **Required** |
| `JWT_ACCESS_TOKEN_EXPIRES` | Token expiry (seconds) | `86400` |
| `PORT` | Server port | `5000` |
| `HOST` | Server host | `0.0.0.0` |

### Frontend

| Variable | Description | Example |
|----------|-------------|---------|
| `API_URL` | Backend API URL | `http://10.0.2.2:5000` |

---

## 🛠️ Development Commands

### Backend

```bash
# Activate virtual environment
venv\Scripts\activate         # Windows
source venv/bin/activate      # macOS/Linux

# Run development server
python run.py

# Seed database with sample data
python seed_data.py

# Install new package
pip install package_name
pip freeze > requirements.txt
```

### Frontend

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web

# Install new package
npm install package_name
```

---

## 🔧 Troubleshooting

### MongoDB Connection Error
- ✅ Verify your `MONGO_URI` in `.env`
- ✅ For Atlas: Check IP whitelist includes your IP
- ✅ For local: Ensure MongoDB service is running

### JWT Token Errors
- ✅ Token expired: Login again to get a new token
- ✅ Invalid token: Check Authorization header format: `Bearer <token>`

### Video Playback Issues
- ✅ Ensure `yt-dlp` is installed and up to date
- ✅ Check that the video is available in your region
- ✅ Verify playback token hasn't expired

### Network Errors (Mobile)
- ✅ Ensure phone and computer are on the same network
- ✅ Check firewall isn't blocking port 5000
- ✅ Use correct local IP in `api.js`

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

---

## 📸 Screenshots

| Login Screen | Dashboard | Video Player | Settings |
|:------------:|:---------:|:------------:|:--------:|
| 🔐 Secure authentication | 🎬 Video gallery | ▶️ Custom controls | ⚙️ User preferences |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is for **educational purposes**.

---

## 👨‍💻 Author

Made with ❤️ for learning full-stack mobile development with secure video streaming.

---

<p align="center">
  <strong>⭐ Star this repository if you found it helpful!</strong>
</p>


