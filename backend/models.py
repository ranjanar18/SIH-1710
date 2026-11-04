from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from database import Base

class Node(Base):
    __tablename__ = "nodes"
    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True)      # e.g. "PF1", "LIFT1"
    name_en = Column(String)
    name_ta = Column(String)                # Tamil name
    category = Column(String)               # platform, lift, restroom...
    x = Column(Float)                       # map position
    y = Column(Float)
    is_active = Column(Boolean, default=True)

class Edge(Base):
    __tablename__ = "edges"
    id = Column(Integer, primary_key=True)
    from_node = Column(Integer, ForeignKey("nodes.id"))
    to_node = Column(Integer, ForeignKey("nodes.id"))
    distance = Column(Float)                # metres
    has_stairs = Column(Boolean, default=False)