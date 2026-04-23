from pymongo import MongoClient
from datetime import date
from dotenv import load_dotenv
import os
load_dotenv()

database = MongoClient(os.getenv("MONGODB_URL"))["lost_and_found"]
items = database['items']

def add_item( name, description, category, image_url, typeof, location, lostdate, userid , usercollegeid, usermail, status, vector):
    
    def generate_token():
        total = f'{items.count_documents({})+1:04d}'
        d = date.today()
        prefix = f'{d.year}{d.month:02d}{d.day}'
        token = prefix + total
        return int(token)

    token = generate_token()

    doc = {
        "_id": token,
        "item_name": name,
        "item_description": description,
        "item_category": category,
        "image_url": image_url,
        "type": typeof,
        "location": location,
        "date": lostdate,
        "userid": userid,
        "usercollegeid": usercollegeid,
        "usermail": usermail,
        "status": status,
        "vector": vector
    }

    response = items.insert_one(doc)
    return str(response.inserted_id)

def fetch_item(doc):

    response = items.find_one(doc)
    return response

