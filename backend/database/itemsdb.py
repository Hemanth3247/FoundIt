from pymongo import MongoClient
from datetime import date
from dotenv import load_dotenv
import os
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

database = MongoClient(os.getenv("MONGODB_URL"))["lost_and_found"]
items = database['items']

def add_item( name, description, category, image_url, typeof, location, lostdate, userid , usercollegeid, usermail, status, vector):

    doc = {
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

