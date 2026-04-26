from fastapi import FastAPI, Response, Request, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta, UTC
import jwt
import os
import certifi
from dotenv import load_dotenv
load_dotenv()

from database import usersdb, itemsdb, pendingusersdb, messagesdb
from database.connection import db as _db
import auth, otpmail, imagecloud

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SignUp(BaseModel):
    email: str
    collegeid: str
    password_hash: str
    otp: str = None

class Login(BaseModel):
    
    email: str | None = None
    password_hash: str    

SECRET = os.environ.get("JWT_SECRET")

def generate_JWT(collegeid):
    key = (SECRET or '').ljust(32, '0')[:64]
    payload = {
        'sub': collegeid,
        'iat':  datetime.now(UTC),
        'exp': datetime.now(UTC) + timedelta(days=5)
    }
    jwt_token = jwt.encode(payload, key, algorithm="HS256")
    return jwt_token

@app.post('/signup/start')
def signup(body: SignUp,response: Response,request: Request):
    
    if request.cookies.get("token"):
        jwttoken = request.cookies.get("token")
        try:
            payload = jwt.decode(jwttoken, SECRET, algorithms=["HS256"])
            if payload['exp'] > datetime.now(UTC):
                return "Invalid token"
            else:
                userdetails = usersdb.fetch_user({"collegeid": payload['sub']})
                return userdetails
        except jwt.JWTError:
            return "Invalid token"

    otp = otpmail.sendotp(body.email)

    pendingusersdb.add_user(
        collegeid = body.collegeid,
        email = body.email, 
        password_hash = body.password_hash,
        otp = otp,
        timestamp = datetime.now(UTC)
    )      

    return "OTP sent"  

@app.post('/signup/verify')
def verifyotp(body: SignUp,response: Response):

    user = pendingusersdb.fetch_user({'email': body.email})
    print(f"DEBUG verify | email={body.email} | entered_otp={body.otp} | db_otp={user.get('otp') if user else 'NO USER'} | ts={user.get('timestamp') if user else 'N/A'}")

    if not user:
        return {"is_verified": False}

    if int(body.otp) != user['otp']:
        print(f"DEBUG: OTP mismatch")
        return {"is_verified": False}

    ts = user['timestamp']
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=UTC)
    if ts < datetime.now(UTC) - timedelta(minutes=10):
        print(f"DEBUG: OTP expired")
        return {"is_verified": False}

    jwttoken = generate_JWT(user['collegeid'])
    try:
        usersdb.add_user(
            collegeid = user['collegeid'],
            email = user['email'],
            password_hash = user['password_hash'],
            jwt_token = jwttoken,
            is_verified = True
        )
        print(f"DEBUG: user saved to DB — {user['email']}")
    except Exception as e:
        print(f"DEBUG: usersdb.add_user FAILED — {e}")
    response.set_cookie(key="token", value=jwttoken)
    return {"is_verified": True}

@app.post('/signup/resend')
def resendotp(body: SignUp):
    user = pendingusersdb.fetch_user({"email": body.email})
    if user:
        otp = otpmail.sendotp(body.email)
        pendingusersdb.pendingusers.update_one(
            {"email": body.email},
            {"$set": {"otp": otp, "timestamp": datetime.now(UTC)}}
        )
        return "OTP sent"

@app.post('/login')
def login(body: Login, response: Response):
    user_exists = usersdb.fetch_user({'email': body.email})
    print(f"DEBUG login | email={body.email} | found={user_exists is not None} | hash_match={user_exists['password_hash'] == body.password_hash if user_exists else 'N/A'}")
    if user_exists and user_exists['password_hash'] == body.password_hash:
        token = generate_JWT(user_exists['collegeid'])
        response.set_cookie(key="token", value=token, samesite='lax', secure=False)
        user_data = {k: v for k, v in user_exists.items() if k not in ('password_hash', 'jwt_token')}
        user_data['_id'] = str(user_data['_id'])
        return {"success": True, "user": user_data}
    elif not user_exists:
        return {"success": False, "message": "No account found with that email"}
    else:
        return {"success": False, "message": "Incorrect password"}
    
def run_ai_matching(vec, item_type, item_name, userid):
    from ml import vectormodel
    try:
        db = _db
        opposite_type = 'found' if item_type == 'lost' else 'lost'
        candidates = list(db['items'].find({"type": opposite_type, "status": "active", "vector": {"$exists": True}}))

        matches = []
        for c in candidates:
            if c.get('vector'):
                score = vectormodel.compare(vec, c['vector'])
                if score > 0.8:
                    matches.append({
                        "matched_item_id": str(c['_id']),
                        "matched_item_name": c.get('item_name', ''),
                        "matched_item_location": c.get('location', ''),
                        "matched_item_image": c.get('image_url', ''),
                        "score": round(float(score), 3)
                    })

        matches.sort(key=lambda x: x['score'], reverse=True)
        print(f"DEBUG AI matching: {item_name} — {len(matches)} match(es)")

        if matches:
            db['matches'].insert_many([{
                "userid": userid,
                "new_item_name": item_name,
                **m,
                "seen": False,
                "timestamp": datetime.now(UTC)
            } for m in matches])
    except Exception as e:
        print(f"DEBUG AI matching ERROR: {e}")

@app.post('/additem')
def additem(background_tasks: BackgroundTasks,
            name: str = Form(), description: str = Form(), category: str = Form(),
            image: UploadFile = File(), type: str = Form(), location: str = Form(),
            date: str = Form(), userid: str = Form(), usercollegeid: str = Form(),
            usermail: str = Form(), userphone: str = Form(''), status: str = Form()):
    try:
        from ml import vectormodel
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            contents = image.file.read()
            tmp.write(contents)
            tmp.flush()
            vec = vectormodel.get_embedding(tmp.name)

        image_url = imagecloud.upload_image(tmp.name)

        itemsdb.add_item(
            name=name, description=description, category=category, image_url=image_url,
            typeof=type, location=location, lostdate=date, userid=userid,
            usercollegeid=usercollegeid, usermail=usermail, status=status, vector=vec
        )

        background_tasks.add_task(run_ai_matching, vec, type, name, userid)
        return {"success": True, "message": "Item posted successfully"}
    except Exception as e:
        print(f"DEBUG additem ERROR: {e}")
        return {"success": False, "message": str(e)}

@app.get('/items')
def get_all_items():
    try:
        database = _db
        items_collection = database['items']
        items = list(items_collection.find({"status": "active"}).sort("date", -1).limit(50))
        # Convert ObjectId to string for JSON serialization
        for item in items:
            item['_id'] = str(item['_id'])
        return {"success": True, "items": items}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get('/items/{item_type}')
def get_items_by_type(item_type: str):
    try:
        database = _db
        items_collection = database['items']
        items = list(items_collection.find({"type": item_type, "status": "active"}).sort("date", -1).limit(50))
        for item in items:
            item['_id'] = str(item['_id'])
        return {"success": True, "items": items}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get('/item/{item_id}')
def get_item(item_id: int):
    try:
        item = itemsdb.fetch_item({"_id": item_id})
        if item:
            return {"success": True, "item": item}
        else:
            return {"success": False, "message": "Item not found"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get('/matches/{userid}')
def get_matches(userid: str):
    try:
        db = _db
        unseen = list(db['matches'].find({"userid": userid, "seen": False}))
        for m in unseen:
            m['_id'] = str(m['_id'])
            m.pop('timestamp', None)
        db['matches'].update_many({"userid": userid, "seen": False}, {"$set": {"seen": True}})
        return {"success": True, "matches": unseen}
    except Exception as e:
        return {"success": False, "matches": []}

@app.get('/user/{user_id}')
def get_user(user_id: str):
    try:
        user = usersdb.fetch_user({"_id": user_id})
        if user:
            # Don't return password hash
            user.pop('password_hash', None)
            return {"success": True, "user": user}
        else:
            return {"success": False, "message": "User not found"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post('/messages/send')
def send_message(sender_id: str = Form(), receiver_id: str = Form(),
                item_id: str = Form(), text: str = Form()):
    try:
        msg_id = messagesdb.add_message(sender_id, receiver_id, item_id, text)
        return {"success": True, "message_id": msg_id}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get('/messages/{sender_id}/{receiver_id}/{item_id}')
def get_messages(sender_id: str, receiver_id: str, item_id: str):
    try:
        msgs = messagesdb.get_conversation(sender_id, receiver_id, item_id)
        messagesdb.mark_as_read(receiver_id, sender_id, item_id)
        for m in msgs:
            m['_id'] = str(m['_id'])
        return {"success": True, "messages": msgs}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get('/conversations/{user_id}')
def get_conversations(user_id: str):
    try:
        convs = messagesdb.get_user_conversations(user_id)
        return {"success": True, "conversations": convs}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get('/debug/user/{email:path}')
def debug_user(email: str):
    user = usersdb.fetch_user({'email': email})
    if not user:
        return {"found": False, "email": email}
    return {
        "found": True,
        "email": user.get('email'),
        "collegeid": user.get('collegeid'),
        "is_verified": user.get('is_verified'),
        "has_password_hash": bool(user.get('password_hash'))
    }

@app.get('/user-items/{userid}')
def get_user_items(userid: str):
    try:
        items = list(_db['items'].find({"userid": userid}).sort("date", -1))
        for item in items:
            item['_id'] = str(item['_id'])
        return {"success": True, "items": items}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post('/items/{item_id}/resolve')
def resolve_item(item_id: str, status: str = Form()):
    try:
        from bson import ObjectId
        item = _db['items'].find_one({"_id": ObjectId(item_id)})
        if not item:
            return {"success": False, "message": "Item not found"}
        _db['items'].update_one({"_id": ObjectId(item_id)}, {"$set": {"status": status}})
        if status == 'returned':
            usersdb.increment_karma(item.get('userid', ''), 5)
        return {"success": True}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get('/karma/{collegeid}')
def get_karma(collegeid: str):
    try:
        karma = usersdb.get_karma(collegeid)
        return {"success": True, "karma": karma}
    except Exception as e:
        return {"success": False, "karma": 0}

@app.get('/health')
def health_check():
    return {"status": "ok", "message": "FoundIt API is running"}

