from fastapi import FastAPI, Response, Request
from pydantic import BaseModel
from datetime import datetime, timedelta, UTC
from jose import jwt
import sys, os
from dotenv import load_dotenv
load_dotenv()
sys.path.append("../")

from database import usersdb, itemsdb, pendingusersdb
from backend import auth, otpmail

app = FastAPI()

class SignUp(BaseModel):

    email: str
    collegeid: str
    password_hash: str

class Login(BaseModel):
    
    email: str | None = None
    password_hash: str

SECRET = os.environ.get("JWT_SECRET")

def generate_JWT(collegeid):
    payload = {
        'sub': collegeid,
        'iat':  datetime.now(UTC),
        'exp': datetime.now(UTC) + timedelta(days=5)
    }

    jwt_token = jwt.encode(payload,SECRET,"HS256")
    return jwt_token

@app.post('/signup/start')
def signup(body: SignUp,response: Response,request: Request):
    
    if Request.cookies.get("token"):
        jwttoken = Request.cookies.get("token")
        try:
            payload = jwt.decode(jwttoken, SECRET, "HS256")
            if payload['exp'] > datetime.now(UTC):
                "Invalid token"
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
        otp = otp
        timestamp = datetime.now(UTC)
    )      

    return "OTP sent"  

@app.post('/signup/verify')
def verifyotp(body: SignUp,response: Response):

    doc = {
        'email': body.email,
        'otp': body.otp
    }

    user = pendingusersdb.fetch_user(doc)

    if user:
        jwttoken = generate_JWT(user['collegeid'])
        usersdb.add_user(
            collegeid = user['collegeid'],
            email = user['email'], 
            password_hash = user['password_hash'],
            jwt_token = jwttoken,
            is_verified = True
        )
        response.set_cookie(key="token", token=jwttoken)
        return {
            collegeid = user['collegeid'],
            email = user['email'], 
            password_hash = user['password_hash'],
            jwt_token = jwttoken,
            is_verified = True
        }
    else:
        return "Incorrect OTP"

@app.post('/login')
def login(body: Login,response: Response):
    
    doc = {'email': body.email,
        'password_hash': body.password_hash
    }
    
    user = auth.authenticate(doc,body.password_hash)
    if user:
        userdetails = usersdb.fetch_user(doc)
        token = generate_JWT(userdetails['collegeid'])
        response.set_cookie(key="token", token=token)
        return userdetails
    else:
        return "Incorrect Credentials"
    
@app.post('/additem')
def additem( name, description, category, image_url, type, location, date, userid , username, usermail, userphone, status):
    itemsdb.add_item(
         name, description, category, image_url, type, location, date, userid , username, usermail, userphone, status
    )


@app.post('/fetchitem')
def fetchitem(id):
    response = itemsdb.fetch_item({"id":id})
    return response


@app.post('/fetchuser')
def fetchuser(doc):
    response = userdb.fetch_user(doc)
    return response

@app.post('/lostpage/{id}')
def lostpage(id: int):
    total = itemsdb.count_documents({"type":"lost","status": "active"})
    tens = total // 10
    single = total % 10
    list1 = [10 for i in range(tens)]
    list1.append(single)
    try:
        if id > len(list1):
            return "No more items"
        elif id == 0:
            return "Invalid page number"
        elif id == len(list1) - 1:
            itemsfrom = id*10 - 10
            try:
                items = list(itemsdb.find({"type": "lost","status": "active"}).sort("date", -1).skip(itemsfrom).limit(10))
                return items
            except:
                return "Error occurred"
        else:
            toskip = sum(list1) -list1[-1]
            items = list(itemsdb.find({"type": "lost","status": "active"}).sort("date", -1).skip(toskip).limit(list1[-1]))
            return items
    except:
        return "Error occurred"
@app.post('/foundpage/{id}')
def foundpage(id: int):
    total = itemsdb.count_documents({"type":"found","status": "active"})
    tens = total // 10
    single = total % 10
    list1 = [10 for i in range(tens)]
    list1.append(single)
    try:
        if id > len(list1):
            return "No more items"
        elif id == 0:
            return "Invalid page number"
        elif id == len(list1) - 1:
            itemsfrom = id*10 - 10
            try:
                items = list(itemsdb.find({"type": "found","status": "active"}).sort("date", -1).skip(itemsfrom).limit(10))
                return items
            except:
                return "Error occurred"
        else:
            toskip = sum(list1) -list1[-1]
            items = list(itemsdb.find({"type": "found","status": "active"}).sort("date", -1).skip(toskip).limit(list1[-1]))
            return items
    except:
        return "Error occurred"

