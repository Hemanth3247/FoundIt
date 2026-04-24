# FoundIt - Setup and Running Guide

## Project Structure
```
FoundIt/
├── backend/                 # Python FastAPI Backend
│   ├── server.py           # Main server with routes
│   ├── auth.py             # Authentication logic
│   ├── otpmail.py          # OTP sending via email
│   ├── dbacess.py          # Database access
│   └── imagecloud.py       # Image upload handling
├── frontend/               # Express.js + Vanilla JS Frontend
│   ├── index.js            # Express server
│   ├── index.html          # HTML pages
│   ├── app.js              # Main JavaScript logic
│   ├── style.css           # Styling
│   ├── package.json        # Node dependencies
│   └── .env                # Frontend environment config
├── database/               # MongoDB database modules
│   ├── usersdb.py          # Users collection
│   ├── itemsdb.py          # Lost/Found items
│   ├── messagesdb.py       # Chat messages
│   └── pendingusersdb.py   # Pending user registrations
├── ml/                     # Machine Learning
│   └── vectormodel.py      # Image vector embedding
└── .env                    # Backend environment config
```

## Prerequisites
- Python 3.8+ with pip
- Node.js 14+ with npm
- MongoDB (local or Atlas cloud)
- PyTorch and torchvision (for image matching)

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/Scripts/activate  # On Windows

# Install Python dependencies
pip install -r ../requirements.txt

# Configure .env file
# Copy the .env file and update with your credentials:
# - MONGODB_URL: Your MongoDB connection string
# - JWT_SECRET: Your JWT secret key
# - EMAIL_PASSWORD: Gmail app password for OTP
# - CLOUDINARY_* : Cloudinary credentials for image hosting
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Configure .env file
# VITE_API_BASE_URL=http://localhost:8000
```

### 3. Database Setup

MongoDB should be running. Update `.env` with:
- Local: `mongodb://localhost:27017`
- Cloud: `mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0`

## Running the Application

### Option A: Run Both Services (Recommended)

**Terminal 1 - Start Backend (Python)**
```bash
cd backend
python -m uvicorn server:app --reload --port 8000
```

**Terminal 2 - Start Frontend (Node)**
```bash
cd frontend
npm start
```

### Option B: Run Services Separately

**Backend:**
```bash
cd backend
uvicorn server:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
node index.js
```

### Development Mode

For development with hot reload:

**Backend:**
```bash
cd backend
pip install watchfiles
python -m uvicorn server:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)

## Environment Variables

### .env (Backend - in root directory)
```
MONGODB_URL=mongodb+srv://dbuser:password@cluster0.rocu4cg.mongodb.net/?appName=Cluster0
JWT_SECRET=HS202_GROUP8
EMAIL_PASSWORD=otskgwqvwtbxlfse
CLOUDINARY_NAME=dqsje3yis
CLOUDINARY_API_KEY=542434459525368
CLOUDINARY_API_SECRET=yQ1KwyfgD5K1jMoLvNmlENUlH5M
```

### frontend/.env
```
VITE_API_BASE_URL=http://localhost:8000
```

## API Endpoints

### Authentication
- `POST /signup/start` - Start signup with email OTP
- `POST /signup/verify` - Verify OTP and create account
- `POST /signup/resend` - Resend OTP code

### Items
- `GET /items` - Get all items
- `POST /items/add` - Post a lost/found item
- `GET /items/{id}` - Get item details

### Messaging
- `GET /messages/{userid}` - Get messages with user
- `POST /messages/send` - Send a message

## Troubleshooting

### Connection Refused
- Make sure both backend (port 8000) and frontend (port 3000) are running
- Check if ports are already in use: `lsof -i :8000` or `lsof -i :3000`

### MongoDB Connection Error
- Verify MongoDB is running: `mongosh`
- Check MONGODB_URL in .env file
- Ensure IP whitelist includes your current IP (for Atlas)

### OTP Not Sending
- Verify EMAIL_PASSWORD in .env
- Check Gmail app password is correct
- Ensure "Less secure apps" is enabled or use App Password

### Module Import Errors
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Check Python path: `echo $PYTHONPATH`
- Verify __init__.py files exist in directories if needed

### Frontend Not Loading
- Clear browser cache (Ctrl+Shift+Delete)
- Check console for errors (F12)
- Verify API_BASE_URL is correctly set
- Ensure API is running on localhost:8000

## Features Implemented

✅ User authentication with email OTP
✅ Post lost/found items with images
✅ AI-powered matching using image vectors
✅ Real-time messaging between users
✅ User profiles and item management
✅ Dark/Light theme toggle
✅ Responsive design for mobile and desktop
✅ Category-based filtering
✅ Location-based search

## Common Commands

```bash
# Install missing packages
pip install package_name

# Run backend tests
python -m pytest

# Check MongoDB connection
mongosh "mongodb://localhost:27017"

# View logs
tail -f server.log

# Kill process on port
lsof -i :8000
kill -9 <PID>
```

## Support

For issues:
1. Check the browser console for errors
2. Check backend terminal for error messages
3. Verify all .env variables are set correctly
4. Ensure all dependencies are installed
5. Check MongoDB connection status

---
**Last Updated**: April 2026
**FoundIt Team**
