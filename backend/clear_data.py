# borra todos los datos de las tablas

import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("DELETE FROM likes"))
    conn.execute(text("DELETE FROM comments"))
    conn.execute(text("DELETE FROM users"))
    conn.commit()

print("Datos borrados. Las tablas se mantienen.")
