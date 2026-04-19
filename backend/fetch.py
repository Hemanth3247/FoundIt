from pymongo import MongoClient
from datetime import date
import sys
import os 
sys.path.append("../")

from database import userdb as udb

database = MongoClient("mongodb://localhost:27017")["lost_and_found"]
items = database['Items']
users = database['Users']