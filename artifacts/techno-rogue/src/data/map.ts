export type NodeType = 'combat' | 'elite' | 'shop' | 'rest' | 'event' | 'boss';

export interface MapNode {
  id: string;
  type: NodeType;
  floor: number;
  column: number;
  connections: string[];
  visited: boolean;
}

export interface MapLayer {
  floor: number;
  nodes: MapNode[];
}

export interface GameMap {
  layers: MapLayer[];
  currentNodeId: string | null;
  act: number;
}

// Fixed 3-column layout (L=0, C=1, R=2) — each floor specifies exactly
// which columns have nodes, creating deliberate branching paths.
const COLUMN_PATTERN: number[][] = [
  [1],       // floor  0: START  — single entry point
  [0, 1, 2], // floor  1: branch into all three paths
  [0, 2],    // floor  2: left & right diverge (no centre)
  [0, 1, 2], // floor  3: all paths reconverge briefly
  [0, 1],    // floor  4
  [0, 2],    // floor  5
  [1, 2],    // floor  6
  [0, 1, 2], // floor  7: mid-act crossroads
  [0, 2],    // floor  8
  [0, 1],    // floor  9
  [1, 2],    // floor 10
  [0, 1, 2], // floor 11
  [0, 2],    // floor 12
  [1],       // floor 13: funnel toward boss
  [1],       // floor 14: BOSS
];

const NODE_TYPES_BY_FLOOR: Record<number, NodeType> = {
  0: 'combat',   // always start with a fight
  14: 'boss',
};

const WEIGHTS: Partial<Record<NodeType, number>> = {
  combat: 45,
  elite:  10,
  shop:   10,
  rest:   10,
  event:  15,
};

function rollType(floor: number): NodeType {
  if (NODE_TYPES_BY_FLOOR[floor] !== undefined) return NODE_TYPES_BY_FLOOR[floor];

  const w = { ...WEIGHTS };
  // Elites rarer early, more common late
  if (floor <= 2)  w.elite = 5;
  if (floor >= 11) w.elite = 18;
  // Extra rest/shop before boss
  if (floor === 13) return Math.random() > 0.5 ? 'rest' : 'shop';

  const entries = Object.entries(w) as [NodeType, number][];
  const total = entries.reduce((s, [, v]) => s + v, 0);
  let roll = Math.random() * total;
  for (const [type, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return 'combat';
}

function id(floor: number, col: number): string {
  return `n_${floor}_${col}`;
}

export function generateMap(act: number = 1): GameMap {
  const layers: MapLayer[] = COLUMN_PATTERN.map((cols, floor) => ({
    floor,
    nodes: cols.map((col) => ({
      id: id(floor, col),
      type: rollType(floor),
      floor,
      column: col,
      connections: [],
      visited: false,
    })),
  }));

  // Build connections: each node at column C connects to next-floor nodes
  // at columns within 1 step of C.  We guarantee every next-floor node
  // receives at least one incoming edge.
  for (let f = 0; f < layers.length - 1; f++) {
    const cur  = layers[f];
    const next = layers[f + 1];
    const nextCols = next.nodes.map((n) => n.column);

    for (const node of cur.nodes) {
      const targets = next.nodes.filter((n) => Math.abs(n.column - node.column) <= 1);
      if (targets.length === 0) {
        // fallback: connect to nearest next-floor node
        const nearest = next.nodes.reduce((best, n) =>
          Math.abs(n.column - node.column) < Math.abs(best.column - node.column) ? n : best
        );
        node.connections.push(nearest.id);
      } else {
        for (const t of targets) {
          // Always connect to same column; probabilistic for diagonals
          if (t.column === node.column || Math.random() > 0.45) {
            node.connections.push(t.id);
          }
        }
        // Ensure at least one connection
        if (node.connections.length === 0) {
          const t = targets[Math.floor(Math.random() * targets.length)];
          node.connections.push(t.id);
        }
      }
      node.connections = [...new Set(node.connections)];
    }

    // Ensure every next-floor node has at least one incoming edge
    for (const nextNode of next.nodes) {
      const hasIncoming = cur.nodes.some((n) => n.connections.includes(nextNode.id));
      if (!hasIncoming) {
        // Connect the closest current node to it
        const donor = cur.nodes.reduce((best, n) =>
          Math.abs(n.column - nextNode.column) < Math.abs(best.column - nextNode.column) ? n : best
        );
        donor.connections.push(nextNode.id);
      }
    }
  }

  return { layers, currentNodeId: null, act };
}

export function getNode(map: GameMap, nodeId: string): MapNode | null {
  for (const layer of map.layers) {
    const node = layer.nodes.find((n) => n.id === nodeId);
    if (node) return node;
  }
  return null;
}

export function getReachableNodes(map: GameMap): MapNode[] {
  if (!map.currentNodeId) {
    return map.layers[0]?.nodes ?? [];
  }
  const current = getNode(map, map.currentNodeId);
  if (!current) return [];
  return current.connections
    .map((id) => getNode(map, id))
    .filter((n): n is MapNode => n !== null);
}

export function advanceToNode(map: GameMap, nodeId: string): GameMap {
  const node = getNode(map, nodeId);
  if (!node) return map;
  return {
    ...map,
    currentNodeId: nodeId,
    layers: map.layers.map((layer) => ({
      ...layer,
      nodes: layer.nodes.map((n) =>
        n.id === nodeId ? { ...n, visited: true } : n
      ),
    })),
  };
}

export function isMapComplete(map: GameMap): boolean {
  const bossLayer = map.layers[map.layers.length - 1];
  if (!bossLayer || bossLayer.nodes.length === 0) return false;
  return bossLayer.nodes[0].visited;
}
