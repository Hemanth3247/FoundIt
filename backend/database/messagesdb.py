from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import os
import hashlib

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

database = MongoClient(os.getenv("MONGODB_URL"))["lost_and_found"]
messages = database['messages']

def add_message(sender_id, receiver_id, item_id, text):
    """Add a new message to the conversation"""
    doc = {
        'sender_id': sender_id,
        'receiver_id': receiver_id,
        'item_id': item_id,
        'text': text,
        'timestamp': datetime.now().isoformat(),
        'read': False
    }
    response = messages.insert_one(doc)
    return str(response.inserted_id)

def get_conversation(user1_id, user2_id, item_id):
    """Get all messages between two users about an item"""
    query = {
        '$or': [
            {'sender_id': user1_id, 'receiver_id': user2_id, 'item_id': item_id},
            {'sender_id': user2_id, 'receiver_id': user1_id, 'item_id': item_id}
        ]
    }
    response = messages.find(query).sort('timestamp', 1)
    return list(response)

def get_user_conversations(user_id):
    """Get all conversations for a user"""
    query = {
        '$or': [
            {'sender_id': user_id},
            {'receiver_id': user_id}
        ]
    }
    result = messages.find(query).sort('timestamp', -1)
    
    # Group by conversation
    conversations = {}
    for msg in result:
        other_id = msg['receiver_id'] if msg['sender_id'] == user_id else msg['sender_id']
        item_id = msg['item_id']
        key = f"{other_id}_{item_id}"
        
        if key not in conversations:
            conversations[key] = {
                'other_user_id': other_id,
                'item_id': item_id,
                'last_message': msg['text'],
                'timestamp': msg['timestamp'],
                'unread': not msg['read'] if msg['receiver_id'] == user_id else False
            }
    
    return list(conversations.values())

def mark_as_read(user_id, other_id, item_id):
    """Mark all messages as read in a conversation"""
    query = {
        'sender_id': other_id,
        'receiver_id': user_id,
        'item_id': item_id
    }
    messages.update_many(query, {'$set': {'read': True}})

def delete_message(message_id):
    """Delete a message"""
    from bson import ObjectId
    messages.delete_one({'_id': ObjectId(message_id)})
