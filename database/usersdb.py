from pymongo import MongoClient
from datetime  import datetime
import hashlib
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

database = MongoClient(os.getenv("MONGODB_URL"))["lost_and_found"]
users = database['Users']

def add_user(collegeid, email, password_hash, jwt_token=None, is_verified=False):

    dt = datetime.now().isoformat().encode('utf-8')
    userid = (hashlib.sha256(dt)).hexdigest()

    users.update_one(
        {'email': email},
        {'$set': {
            'collegeid': collegeid,
            'password_hash': password_hash,
            'jwt_token': jwt_token,
            'is_verified': is_verified
        }, '$setOnInsert': {'_id': userid}},
        upsert=True
    )

def fetch_user(doc):

    response = users.find_one(doc)
    return response