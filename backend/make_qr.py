import os
import qrcode
from database import SessionLocal
from models import Node

# Change this to your PC's address when testing on a phone (see Step 5)
BASE_URL = "http://localhost:5173"

os.makedirs("qr_codes", exist_ok=True)
db = SessionLocal()

for n in db.query(Node).all():
    url = f"{BASE_URL}/?from={n.code}"
    img = qrcode.make(url)
    img.save(f"qr_codes/{n.code}.png")
    print("Created", n.code, "->", url)

db.close()