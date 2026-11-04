import heapq
from models import Node, Edge

def build_graph(db, accessible_only=False):
    """Load edges from DB into a dictionary: {node_id: [(neighbor, distance), ...]}"""
    inactive = {n.id for n in db.query(Node).filter(Node.is_active == False)}
    graph = {}
    for e in db.query(Edge).all():
        if accessible_only and e.has_stairs:
            continue
        if e.from_node in inactive or e.to_node in inactive:
            continue
        graph.setdefault(e.from_node, []).append((e.to_node, e.distance))
    return graph

def dijkstra(graph, start, end):
    dist = {start: 0}
    prev = {}
    heap = [(0, start)]
    while heap:
        d, node = heapq.heappop(heap)
        if node == end:
            break
        if d > dist.get(node, float("inf")):
            continue
        for neighbor, weight in graph.get(node, []):
            nd = d + weight
            if nd < dist.get(neighbor, float("inf")):
                dist[neighbor] = nd
                prev[neighbor] = node
                heapq.heappush(heap, (nd, neighbor))
    if end not in dist:
        return None, None          # no route exists
    path, cur = [end], end
    while cur != start:
        cur = prev[cur]
        path.append(cur)
    return path[::-1], dist[end]