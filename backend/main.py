from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Node
from routing import build_graph, dijkstra
import os

ADMIN_KEY = os.environ.get("ADMIN_KEY", "admin123")  # demo default


app = FastAPI(title="Smart Railway Station Navigation")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # React dev server
    allow_methods=["*"], allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/nodes")
def list_nodes(category: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Node)
    if category:
        q = q.filter(Node.category == category)
    return [{"code": n.code, "name_en": n.name_en, "name_ta": n.name_ta,
             "category": n.category, "x": n.x, "y": n.y, "is_active": n.is_active}
            for n in q.all()]

@app.get("/route")
def get_route(start: str, end: str, accessible: bool = False,
              db: Session = Depends(get_db)):
    a = db.query(Node).filter(Node.code == start).first()
    b = db.query(Node).filter(Node.code == end).first()
    if not a or not b:
        raise HTTPException(404, "Unknown location code")
    graph = build_graph(db, accessible)
    path, dist = dijkstra(graph, a.id, b.id)
    if path is None:
        raise HTTPException(404, "No route available")
    nodes = {n.id: n for n in db.query(Node).filter(Node.id.in_(path))}
    return {
        "distance_m": dist,
        "accessible": accessible,
        "steps": [{"code": nodes[i].code, "name_en": nodes[i].name_en,
                   "name_ta": nodes[i].name_ta, "x": nodes[i].x, "y": nodes[i].y}
                  for i in path],
    }

@app.patch("/nodes/{code}/status")
def set_status(code: str, is_active: bool,
               x_admin_key: str | None = Header(default=None),
               db: Session = Depends(get_db)):
    if x_admin_key != ADMIN_KEY:
        raise HTTPException(401, "Invalid admin key")
    n = db.query(Node).filter(Node.code == code).first()
    if not n:
        raise HTTPException(404, "Not found")
    n.is_active = is_active
    db.commit()
    return {"code": code, "is_active": is_active}