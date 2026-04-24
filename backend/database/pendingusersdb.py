from datetime import datetime
import hashlib
from database.connection import db

pendingusers = db['pendingusers']

def add_user(collegeid, email, password_hash, otp, timestamp):
    dt = datetime.now().isoformat().encode('utf-8')
    userid = hashlib.sha256(dt).hexdigest()
    pendingusers.delete_many({'email': email})
    doc = {
        '_id': userid,
        'collegeid': collegeid,
        'email': email,
        'password_hash': password_hash,
        'otp': otp,
        'timestamp': timestamp
    }
    return str(pendingusers.insert_one(doc).inserted_id)

def fetch_user(doc):
    return pendingusers.find_one(doc)
