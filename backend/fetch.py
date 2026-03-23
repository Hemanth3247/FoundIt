from pymongo import MongoClient
from datetime import date
import sys
import os 
sys.path.append("../")

from database import userdb

database = MongoClient("mongodb://localhost:27017")["lost_and_found"]
items = database['Items']



response = fetch_item(160220260004)
print(response)
