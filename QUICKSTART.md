# FoundIt - Quick Start Guide 🚀

## What is FoundIt?
A smart campus lost & found platform that helps students find their lost items using AI-powered matching.

## 5-Minute Quick Start

### Step 1: Clone/Download the Project
```bash
cd FoundIt
```

### Step 2: Create Environment File
Create `.env` in the root directory with your credentials:
```
MONGODB_URL=mongodb+srv://dbuser:password@cluster.mongodb.net
JWT_SECRET=HS202_GROUP8
EMAIL_PASSWORD=your_gmail_app_password
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
```

### Step 3: Install Dependencies

**Option A: Automatic (Windows)**
```bash
startup.bat
```

**Option B: Automatic (Mac/Linux)**
```bash
chmod +x startup.sh
./startup.sh
```

**Option C: Manual**

Terminal 1:
```bash
cd backend
pip install -r ../requirements.txt
python -m uvicorn server:app --reload --port 8000
```

Terminal 2:
```bash
cd frontend
npm install
npm start
```

### Step 4: Open in Browser
```
http://localhost:3000
```

## Features to Try

✨ **Sign Up**
- Enter college ID and email
- Verify with OTP
- Create account

📱 **Post an Item**
- Click "Post" button
- Select Lost or Found
- Upload photo
- Add description, location
- Publish

🔍 **AI Matching**
- AI automatically matches similar items
- Check notifications for matches
- Message users directly

💬 **Messaging**
- Chat with people about items
- Arrange meeting locations
- Confirm exchanges

🎨 **Customization**
- Toggle dark/light mode
- Filter by category
- Filter by lost/found

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process: `lsof -i :8000` then `kill -9 PID` |
| MongoDB not connecting | Verify connection string in `.env` |
| OTP not arriving | Check EMAIL_PASSWORD and Gmail settings |
| Frontend not loading | Ensure backend is running on port 8000 |
| Module errors | Run `pip install -r requirements.txt` again |

## Project Architecture

```
Browser (Frontend) 
    ↓ (REST API calls)
Express.js Server (localhost:3000)
    ↓ (serves static files)
HTML/CSS/JavaScript
    ↓ (API requests)
FastAPI Server (localhost:8000)
    ↓ (database operations)
MongoDB (Cloud or Local)
    ↓ (image processing)
PyTorch ML Model
```

## API Endpoints

```
POST /signup/start      - Begin registration
POST /signup/verify     - Verify OTP code
POST /signup/resend     - Resend OTP
GET  /items            - Get all items
POST /items/add        - Post new item
GET  /messages/{id}    - Get messages
POST /messages/send    - Send message
```

## Key Files

| File | Purpose |
|------|---------|
| `backend/server.py` | FastAPI routes and handlers |
| `frontend/app.js` | Frontend logic and UI |
| `frontend/index.html` | HTML structure |
| `database/*.py` | MongoDB operations |
| `ml/vectormodel.py` | Image similarity matching |

## Next Steps

1. ✅ Get it running (you just did!)
2. 📝 Create some test lost items
3. 📸 Upload item photos
4. 🔔 Check AI match notifications
5. 💬 Test messaging between accounts
6. 🎨 Customize styling
7. 🚀 Deploy to production

## Production Deployment

### Heroku
```bash
# Create Procfile with:
web: cd backend && uvicorn server:app --port $PORT
web: cd frontend && npm start

git push heroku main
```

### Docker
```bash
docker build -t foundit .
docker run -p 3000:3000 -p 8000:8000 foundit
```

## Support

- Check `SETUP.md` for detailed setup
- Review error messages in terminals
- Check browser console (F12) for frontend errors
- Verify all environment variables

## Team Info

- **Project**: FoundIt Campus Lost & Found
- **Year**: 2026
- **Status**: ✅ Fully Functional

---
**Happy Finding! 🎉**
