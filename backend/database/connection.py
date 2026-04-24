from pymongo import MongoClient
import certifi
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

_client = MongoClient(os.getenv("MONGODB_URL"), tlsCAFile=certifi.where())
db = _client["lost_and_found"]
