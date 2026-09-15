// Pure graph + A* pathfinding used by the Waylo navigation backend.
// Kept dependency-free so it can be unit tested and reused by hardware endpoints.

export type MapNode = {
  id: string;
  x: number;
  y: number;
  node_type: string;
  label: string | null;
};

export type MapEdge = {
  from_node: string;
  to_node: string;
  distance: number;
};

export type Graph = {
  nodes: Map<string, MapNode>;
  adjacency: Map<string, { to: string; distance: number }[]>;
};

export function buildGraph(nodes: MapNode[], edges: MapEdge[]): Graph {
  const nodeMap = new Map<string, MapNode>();
  for (const node of nodes) nodeMap.set(node.id, node);

  const adjacency = new Map<string, { to: string; distance: number }[]>();
  for (const edge of edges) {
    if (!adjacency.has(edge.from_node)) adjacency.set(edge.from_node, []);
    adjacency.get(edge.from_node)!.push({ to: edge.to_node, distance: Number(edge.distance) });
  }
  return { nodes: nodeMap, adjacency };
}

function heuristic(a: MapNode, b: MapNode): number {
  // Straight-line distance in metres (map units are decimetres).
  return Math.hypot(a.x - b.x, a.y - b.y) / 10;
}

export type PathResult = {
  path: MapNode[];
  distance: number;
};

/** A* shortest path over the store's walkable node graph. */
export function aStar(graph: Graph, startId: string, goalId: string): PathResult | null {
  const start = graph.nodes.get(startId);
  const goal = graph.nodes.get(goalId);
  if (!start || !goal) return null;
  if (startId === goalId) return { path: [start], distance: 0 };

  const open = new Set<string>([startId]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[startId, 0]]);
  const fScore = new Map<string, number>([[startId, heuristic(start, goal)]]);

  while (open.size > 0) {
    let current = "";
    let best = Infinity;
    for (const id of open) {
      const score = fScore.get(id) ?? Infinity;
      if (score < best) {
        best = score;
        current = id;
      }
    }

    if (current === goalId) {
      const path: MapNode[] = [];
      let cursor: string | undefined = current;
      while (cursor) {
        path.unshift(graph.nodes.get(cursor)!);
        cursor = cameFrom.get(cursor);
      }
      return { path, distance: Number((gScore.get(goalId) ?? 0).toFixed(1)) };
    }

    open.delete(current);
    for (const neighbour of graph.adjacency.get(current) ?? []) {
      const tentative = (gScore.get(current) ?? Infinity) + neighbour.distance;
      if (tentative < (gScore.get(neighbour.to) ?? Infinity)) {
        cameFrom.set(neighbour.to, current);
        gScore.set(neighbour.to, tentative);
        const node = graph.nodes.get(neighbour.to);
        fScore.set(neighbour.to, tentative + (node ? heuristic(node, goal) : 0));
        open.add(neighbour.to);
      }
    }
  }
  return null;
}

function bearing(from: MapNode, to: MapNode): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "E" : "W";
  return dy >= 0 ? "S" : "N";
}

const TURNS: Record<string, Record<string, string>> = {
  N: { E: "Turn right", W: "Turn left", S: "Turn around" },
  S: { W: "Turn right", E: "Turn left", N: "Turn around" },
  E: { S: "Turn right", N: "Turn left", W: "Turn around" },
  W: { N: "Turn right", S: "Turn left", E: "Turn around" },
};

/** Simple turn-by-turn text for a calculated path. */
export function routeInstructions(path: MapNode[]): string[] {
  if (path.length < 2) return ["You are already here"];
  const steps: string[] = [];
  let previous: string | null = null;

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const dir = bearing(from, to);
    const turn = previous && previous !== dir ? TURNS[previous]?.[dir] : null;
    const target =
      to.node_type === "aisle"
        ? `Continue to ${to.label}`
        : to.node_type === "checkout"
          ? "Continue to Checkout"
          : "Go straight";
    steps.push(turn ? `${turn}, then ${target.toLowerCase()}` : target);
    previous = dir;
  }

  // Collapse repeated "Go straight" steps.
  return steps.filter((step, index) => step !== "Go straight" || steps[index - 1] !== "Go straight");
}
