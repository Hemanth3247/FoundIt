from fastapi import FastAPI, Response
from pydantic import BaseModel
from datetime import datetime, timedelta, UTC
from jose import jwt
import sys, os
import dotenv
dotenv.load_dotenv()

sys.path.append("../")

from database import usersdb, itemsdb
from backend import auth, otpmail

app = FastAPI()

class SignUp(BaseModel):
    username: str
    email: str
    phone: int
    password_hash: str

class Login(BaseModel):
    
    email: str | None = None
    phone: int | None = None
    password_hash: str

SECRET = os.environ.get("SECRET")

def generate_JWT(username):
    payload = {
        'sub': username,
        'iat':  datetime.now(UTC),
        'exp': datetime.now(UTC) + timedelta(hours=1)
    }

    jwt_token = jwt.encode(payload,SECRET,"HS256")
    return jwt_token

@app.post('/signup')
def signup(body: SignUp,response: Response):
    
    usersdb.add_user(
        username = body.username,
        email = body.email, 
        phone = body.phone, 
        password_hash = body.password_hash)
        
    token = generate_JWT(body.username)
    response.set_cookie(key="token", token=token)


@app.post('/login')
def login(body: Login,response: Response):
    
    edoc = {'email': body.email}
    pdoc = {'phone': body.phone}
    if body.email:
        doc = edoc
    elif body.phone:
        doc = pdoc
    
    user = auth.authenticate(doc,body.password_hash)

    if user:
        data = usersdb.fetch_user(doc)
    else:
        return "Incorrect Credentials"
    
    token = generate_JWT(data['username'])
    response.set_cookie(key="token", token=token)