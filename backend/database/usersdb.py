from datetime import datetime
import hashlib
from database.connection import db

users = db['Users']

def add_user(collegeid, email, password_hash, jwt_token=None, is_verified=False):
    dt = datetime.now().isoformat().encode('utf-8')
    userid = hashlib.sha256(dt).hexdigest()
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
    return users.find_one(doc)

def increment_karma(collegeid, points):
    users.update_one({"collegeid": collegeid}, {"$inc": {"karma": points}})

def get_karma(collegeid):
    user = users.find_one({"collegeid": collegeid}, {"karma": 1})
    return int(user.get("karma", 0)) if user else 0
