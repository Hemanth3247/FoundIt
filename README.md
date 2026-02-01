#  FoundIt
## Lost & Found ML Web System

An image-based Lost and Found web platform that uses Machine Learning to match lost items with found items using visual similarity. Users upload images and details, and the system detects potential matches and notifies users.

---

## Overview

This project provides a centralized web system for reporting lost and found items. It uses a pretrained CNN model to extract image features and compute similarity between uploaded lost and found items.

Core idea:
Upload → Feature Extraction → Similarity Matching → Notification

---

## Tech Stack

Frontend:
- React (Vite)
- JavaScript
- Axios

Backend:
- FastAPI (Python)
- Uvicorn

Machine Learning:
- PyTorch pretrained CNN (feature extractor)
- Cosine similarity matching

Database:
- PostgreSQL (or Firebase alternative)

Storage:
- Cloud image storage (Cloudinary / S3)

---

## Repository Structure

frontend/  → React web UI  
backend/   → FastAPI server and APIs  
ml/        → Image feature extraction and similarity logic  
database/  → Schema and migrations  
docs/      → Architecture diagrams and report files  


---

## Setup Instructions

### Clone Repo

```bash
git clone <repo-url>
cd FoundIt
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs frontend on:
http://localhost:5173

---

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend API docs available at:
http://127.0.0.1:8000/docs

---

## ML Module

ML code is inside `/ml`.

Functions:
- Image preprocessing
- CNN feature extraction
- Vector similarity matching

Uses pretrained model — no full training required.

---

## Features

- Upload lost item images
- Upload found item images
- Automatic image similarity matching
- Match threshold logic
- User notification on match
- Secure data handling

---

## License

Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)

Copyright (c) 2026 FoundIt

This work is licensed under the Creative Commons Attribution-NonCommercial 
4.0 International License.

You are free to:
- Share — copy and redistribute the material
- Adapt — remix, transform, and build upon the material

Under the following terms:
- Attribution — You must give appropriate credit to the authors.
- NonCommercial — You may not use the material for commercial purposes.

This project was developed as an academic course project and is intended 
for educational and research use only.

Full license text:
https://creativecommons.org/licenses/by-nc/4.0/

