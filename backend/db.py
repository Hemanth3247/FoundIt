from sqlalchemy import create_engine
from sqlalchemy import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./database.sqlite3"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

Sessionlocal = sessionmaker(bind=engine)

Base = declarative_base()