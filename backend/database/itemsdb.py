from database.connection import db

items = db['items']

def add_item(name, description, category, image_url, typeof, location, lostdate, userid, usercollegeid, usermail, status, vector):
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
    return str(items.insert_one(doc).inserted_id)

def fetch_item(doc):
    return items.find_one(doc)
