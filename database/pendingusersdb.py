from pymongo import MongoClient
from datetime  import datetime
import hashlib
import os
from dotenv import load_dotenv
load_dotenv()

database = MongoClient(os.getenv("MONGODB_URL"))["lost_and_found"]
users = database['pendingusers']

def add_user( collegeid, email, password_hash):

    dt = datetime.now().isoformat().encode('utf-8')

    userid = (hashlib.sha256(dt)).hexdigest()
    doc = {
        '_id': userid,
        'username': username,
        'email': email,
        'password_hash': password_hash
    }

    response = users.insert_one(doc)
    return str(response.inserted_id)

def fetch_user(doc):

    response = users.find_one(doc)
    return response
