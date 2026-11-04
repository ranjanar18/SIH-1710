from database import SessionLocal
from routing import build_graph, dijkstra
from models import Node

db = SessionLocal()

# Make two lookup tables: code -> id, and id -> code
ids = {n.code: n.id for n in db.query(Node).all()}
names = {v: k for k, v in ids.items()}

for mode in (False, True):
    graph = build_graph(db, accessible_only=mode)
    path, distance = dijkstra(graph, ids["ENT"], ids["PF1"])
    label = "Accessible" if mode else "Normal"

    if path is None:
        print(label, "-> No route available")
    else:
        print(label, [names[p] for p in path], distance, "m")