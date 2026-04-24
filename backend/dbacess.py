from pymongo import MongoClient
from datetime import date
import os
from dotenv import load_dotenv

load_dotenv()

from database import usersdb as udb

database = MongoClient(os.getenv("MONGODB_URL"))["lost_and_found"]
items = database['Items']
users = database['Users']