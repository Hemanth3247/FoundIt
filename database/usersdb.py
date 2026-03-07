from pymongo import MongoClient
from datetime  import datetime
import hashlib

database = MongoClient("mongodb://localhost:27017")["lost_and_found"]
users = database['Users']

def add_user( username, email, phone, password_hash):

    dt = datetime.now()

    userid = (hashlib.sha256((dt).encode())).hexdigest()
    doc = {
        '_id': userid,
        'username': username,
        'email': email,
        'phone': phone,
        'password_hash': password_hash
    }

    response = users.insert_one(doc)
    return str(response.inserted_id)

def fetch_user(doc):

    response = users.find_one(doc)
    return response

