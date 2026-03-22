from pymongo import MongoClient
from datetime import date

database = MongoClient("mongodb://localhost:27017")["lost_and_found"]
items = database['Items']



def add_item( name, description, category, image_url, type, location, lostdate, userid , username, usermail, userphone, status):
    
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
        "type": type,
        "location": location,
        "date": lostdate,
        "userid": userid,
        "username": username,
        "usermail": usermail,
        "userphone": userphone,
        "status": status
    }

    response = items.insert_one(doc)
    return str(response.inserted_id)

def fetch_item(id):

    response = items.find_one({"_id":id})
    return response






reply = add_item(name= "SpiderMan", description="I lost the suit", category="Personal", image_url="image/suit.jpg",
type="lost", location="Chenab", lostdate="16-02-2026", userid="URGY4TGBG9344", username="Peter Parker", usermail="xyz@gmail.com", userphone="342934328", status="open")
print(reply)

response = fetch_item(110320260001)
print(response)


