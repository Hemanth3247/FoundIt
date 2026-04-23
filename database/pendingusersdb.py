from pymongo import MongoClient
from datetime  import datetime
import hashlib
import os
from dotenv import load_dotenv
load_dotenv()

database = MongoClient(os.getenv("MONGODB_URL"))["lost_and_found"]
pendingusers = database['pendingusers']

def add_user( collegeid, email, password_hash, otp, timestamp):

    dt = datetime.now().isoformat().encode('utf-8')

    userid = (hashlib.sha256(dt)).hexdigest()
    doc = {
        '_id': userid,
        'collegeid': collegeid,
        'email': email,
        'password_hash': password_hash,
        'otp': otp,
        'timestamp': timestamp
    }

    response = pendingusers.insert_one(doc)
    return str(response.inserted_id)

def fetch_user(doc):

    response = pendingusers.find_one(doc)
    return response


print(add_user(collegeid="20261001", email="john@example.com", password_hash="hashed_password", otp="123456", timestamp=datetime.now().isoformat()))