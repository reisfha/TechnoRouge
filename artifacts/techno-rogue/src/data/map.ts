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

const NODE_WEIGHTS: Record<NodeType, number> = {
  combat: 40,
  elite: 10,
  shop: 10,
  rest: 10,
  event: 15,
  boss: 0,
};

function weightedRandomType(floor: number, totalFloors: number): NodeType {
  if (floor === 0) return 'combat';
  if (floor === totalFloors - 1) return 'boss';

  const weights = { ...NODE_WEIGHTS };
  if (floor <= 3) weights.elite = 5;
  if (floor >= totalFloors - 3) weights.rest += 5;

  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;

  for (const [type, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return type as NodeType;
  }
  return 'combat';
}

function generateId(floor: number, col: number): string {
  return `node_${floor}_${col}`;
}

export function generateMap(act: number = 1): GameMap {
  const floorsPerAct = 15;
  const layers: MapLayer[] = [];

  for (let floor = 0; floor < floorsPerAct; floor++) {
    const nodeCount = floor === 0 ? 1 : floor === floorsPerAct - 1 ? 1 : 2 + Math.floor(Math.random() * 2);
    const nodes: MapNode[] = [];

    for (let col = 0; col < nodeCount; col++) {
      const type = weightedRandomType(floor, floorsPerAct);
      nodes.push({
        id: generateId(floor, col),
        type,
        floor,
        column: col,
        connections: [],
        visited: false,
      });
    }

    layers.push({ floor, nodes });
  }

  for (let i = 0; i < layers.length - 1; i++) {
    const current = layers[i];
    const next = layers[i + 1];

    for (const node of current.nodes) {
      const possibleTargets = next.nodes;
      if (possibleTargets.length === 0) continue;

      const targetIndex = Math.min(
        node.column,
        possibleTargets.length - 1
      );
      node.connections.push(possibleTargets[targetIndex].id);

      if (targetIndex > 0 && Math.random() > 0.5) {
        node.connections.push(possibleTargets[targetIndex - 1].id);
      }
      if (targetIndex < possibleTargets.length - 1 && Math.random() > 0.5) {
        node.connections.push(possibleTargets[targetIndex + 1].id);
      }

      node.connections = [...new Set(node.connections)];
    }

    for (const nextNode of next.nodes) {
      const hasIncoming = current.nodes.some((n) =>
        n.connections.includes(nextNode.id)
      );
      if (!hasIncoming && current.nodes.length > 0) {
        const randomParent = current.nodes[Math.floor(Math.random() * current.nodes.length)];
        randomParent.connections.push(nextNode.id);
      }
    }
  }

  return {
    layers,
    currentNodeId: null,
    act,
  };
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
