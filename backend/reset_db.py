import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.database import engine, Base
from backend.models import User, Comment
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("DROP TABLE IF EXISTS likes CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS comments CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
    conn.commit()

Base.metadata.create_all(bind=engine)

print("Tablas recreadas correctamente.")
