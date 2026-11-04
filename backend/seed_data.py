from database import SessionLocal, engine, Base
from models import Node, Edge

Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)
db = SessionLocal()

nodes = [
    # code, English, Tamil, category, x, y
    ("ENT",   "Main Entrance",  "முதன்மை நுழைவாயில்", "entrance",  50, 10),
    ("TKT",   "Ticket Counter", "டிக்கெட் கவுண்டர்",   "ticket",    50, 30),
    ("JA",    "Junction A",     "சந்திப்பு A",         "junction",  50, 50),
    ("RST",   "Restroom",       "கழிவறை",              "restroom",  30, 50),
    ("FOOD",  "Food Court",     "உணவகம்",              "food",      70, 50),
    ("STR1",  "Stairs to PF1",  "படிக்கட்டு 1",        "stairs",    50, 70),
    ("LIFT1", "Lift 1",         "மின்தூக்கி 1",        "lift",      40, 70),
    ("PF1",   "Platform 1",     "நடைமேடை 1",          "platform",  50, 90),
    ("JB",    "Junction B",     "சந்திப்பு B",         "junction",  70, 70),
    ("LIFT2", "Lift 2",         "மின்தூக்கி 2",        "lift",      80, 70),
    ("PF2",   "Platform 2",     "நடைமேடை 2",          "platform",  70, 90),
    ("EXIT",  "Exit",           "வெளியேறும் வழி",      "exit",      90, 10),
]

for code, en, ta, cat, x, y in nodes:
    db.add(Node(code=code, name_en=en, name_ta=ta, category=cat, x=x, y=y))
db.commit()

# map code -> id
ids = {n.code: n.id for n in db.query(Node).all()}

edges = [
    # from, to, distance(m), has_stairs
    ("ENT","TKT",20,False), ("TKT","JA",20,False),
    ("JA","RST",20,False),  ("JA","FOOD",20,False),
    ("JA","STR1",20,False), ("STR1","PF1",20,True),   # stairs
    ("JA","LIFT1",25,False),("LIFT1","PF1",20,False), # accessible
    ("FOOD","JB",20,False), ("JB","PF2",20,True),     # stairs
    ("JB","LIFT2",10,False),("LIFT2","PF2",20,False), # accessible
    ("ENT","EXIT",40,False),
]

for a, b, d, s in edges:
    # add both directions because people can walk both ways
    db.add(Edge(from_node=ids[a], to_node=ids[b], distance=d, has_stairs=s))
    db.add(Edge(from_node=ids[b], to_node=ids[a], distance=d, has_stairs=s))
db.commit()
print("Seeded", len(nodes), "nodes")