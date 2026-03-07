from pymongo import MongoClient
from datetime import date
import sysimport os 


from ../database.mongodb import fetch_item

database = MongoClient("mongodb://localhost:27017")["lost_and_found"]
items = database['Items']



response = fetch_item(160220260004)
print(response)
