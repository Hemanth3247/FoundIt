from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# from db import Sessionlocal, engine, Base
from models import User
from database.itemsdb import add_item, fetch_item


app = FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class LoginData(BaseModel):
    email: str
    password: str

@app.post("/login")
async def login(data: LoginData):
    print("Server Received", data.email)
    db= Sessionlocal()

    user =User(email=data.email,
               password=data.password)
    db.add(user)
    db.commit()
    db.close()
    print("User added to the database")
    return {"message": "Login data received"}
    

