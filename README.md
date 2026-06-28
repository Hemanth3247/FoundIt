# FoundIt

[Visit the website](https://founditfrontend-ibx0.onrender.com/)
## AI-Powered Campus Lost & Found Platform

FoundIt is a web-based Lost & Found platform designed for campus environments such as the Indian Institute of Technology Ropar. It provides a centralized system where users can report, search, match, claim, and recover lost items using AI-powered image matching and secure user interaction.

---

## Table of Contents

1. Overview  
2. Features  
3. Tech Stack  
4. Project Structure  
5. Installation & Setup  
6. Frontend Setup  
7. Backend Setup  
8. Environment Variables  
9. AI Matching Module  
10. API Endpoints  
11. Future Enhancements  
12. License  

---

## Overview

Traditional methods of managing lost and found items through WhatsApp groups, Telegram channels, or email bulletins are often unorganized and inefficient.

FoundIt solves this problem by offering a structured digital platform where users can:

- Report lost items  
- Report found items  
- Browse categorized listings  
- Receive AI-based match alerts  
- Chat with other users  
- Claim and recover items securely  
- Earn karma points for helping others  

### Core Workflow

User Uploads Item → Item Stored in Database → AI Checks Similar Items → Match Notification Sent → Users Connect & Claim → Item Returned

---

## Features

### User Features

- OTP-based signup and login  
- Secure authentication system  
- Password recovery via OTP  
- User profile management  

### Item Management

- Report lost items  
- Report found items  
- Upload item images  
- Categorized listings  
- Search & filtering system  

### AI Features

- AI image matching  
- Match score notifications  
- Smart lost/found recommendations  

### Communication

- Inbuilt messaging system  
- Claim request system  
- Approval / rejection flow  
- Returned button after handover  

### Rewards

- Karma points system  
- User levels:
  - Newcomer
  - Helper
  - Good Samaritan
  - Campus Guardian
  - Campus Hero

---

## Tech Stack

### Frontend

- HTML  
- CSS  
- JavaScript  

### Backend

- FastAPI (Python)  
- Uvicorn  

### Database

- MongoDB  

### AI / Machine Learning

- ResNet50 (Pretrained CNN)  
- Feature Embedding Extraction  
- Cosine Similarity Matching  

### Cloud Storage

- Cloudinary  

---

## Project Structure

FoundIt/

frontend/
- index.html
- style.css
- app.js
- index.js

backend/
- server.py
- auth.py
- otpmail.py
- imagecloud.py
- dbacess.py

database/
- connection.py
- usersdb.py
- pendingusersdb.py
- itemsdb.py
- messagesdb.py

ml/
- vectormodel.py

---

## Installation & Setup

### Clone Repository

git clone <repo-url>  
cd FoundIt

---

## Frontend Setup

cd frontend  
npm install  
npm run start

Frontend runs on:

http://localhost:3000

---

## Backend Setup

cd backend

python -m venv venv

### Activate Virtual Environment

Windows:

venv\Scripts\activate

Linux / Mac:

source venv/bin/activate

### Install Dependencies

pip install -r requirements.txt

### Run Server

uvicorn server:app --reload --port 8000

Backend runs on:

http://127.0.0.1:8000

API Health:

http://127.0.0.1:8000/health

---

## Environment Variables

Create `.env` inside backend:

MONGO_URI=your_mongodb_connection  
CLOUDINARY_URL=your_cloudinary_url  
EMAIL_USER=your_email  
EMAIL_PASS=your_password  
SECRET_KEY=your_secret_key

---

## AI Matching Module

The AI system uses **ResNet50** to compare uploaded lost and found item images.

### Process

1. User uploads image  
2. Image converted to feature vector  
3. Existing item vectors loaded  
4. Cosine similarity calculated  
5. If similarity score is high → match created  
6. User receives notification  

### Benefits

- Faster recovery  
- Better accuracy  
- Less manual searching  

---

## Main API Endpoints

### Authentication

POST /signup/start  
POST /signup/verify  
POST /login

### Items

POST /additem  
GET /items  
GET /matches/{userid}

### Messaging

POST /messages/send  
GET /messages/{sender}/{receiver}/{item_id}  
GET /conversations/{user_id}

---

## Karma System

Users earn points when they:

- Report found items  
- Successfully return items  
- Help other users  

### Rank Levels

0–9 → Newcomer  
10–24 → Helper  
25–49 → Good Samaritan  
50–99 → Campus Guardian  
100+ → Campus Hero  

College administration may reward top contributors periodically.

---

## Future Enhancements

- Android / iOS app  
- Real-time chat with WebSockets  
- Live push notifications  
- QR-based ownership verification  
- Multi-campus support  
- Better AI models  
- Admin dashboard  

---

## License

Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)

Copyright (c) 2026 FoundIt

This project is developed for academic and educational purposes only.

Full License:

https://creativecommons.org/licenses/by-nc/4.0/
