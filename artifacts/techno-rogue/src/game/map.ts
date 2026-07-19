import { MapState, MapNode, NodeType } from './types';

export const generateMap = (act: number): MapState => {
  const rows = 6; // Row 0 is bottom, Row 5 is Boss
  const cols = 4;
  
  const nodes: MapNode[][] = [];
  
  for (let r = 0; r < rows; r++) {
    const rowNodes: MapNode[] = [];
    const numNodesInRow = r === rows - 1 ? 1 : 3 + Math.floor(Math.random() * 2); // 3-4 nodes, except Boss
    
    for (let c = 0; c < numNodesInRow; c++) {
      let type: NodeType = 'COMBAT';
      
      if (r === rows - 1) {
        type = 'BOSS';
      } else if (r === rows - 2) {
        type = 'REST';
      } else if (r === 0) {
        type = 'COMBAT';
      } else {
        const rand = Math.random();
        if (rand < 0.4) type = 'COMBAT';
        else if (rand < 0.6) type = 'EVENT';
        else if (rand < 0.75) type = 'ELITE';
        else if (rand < 0.9) type = 'SHOP';
        else type = 'REST';
      }
      
      rowNodes.push({
        id: `node_${r}_${c}`,
        type,
        row: r,
        col: c,
        connectedTo: []
      });
    }
    nodes.push(rowNodes);
  }
  
  // Connect nodes
  for (let r = 0; r < rows - 1; r++) {
    const currRow = nodes[r];
    const nextRow = nodes[r + 1];
    
    // Ensure every node in nextRow has at least one parent
    nextRow.forEach(nNode => {
      const pNode = currRow[Math.floor(Math.random() * currRow.length)];
      if (!pNode.connectedTo.includes(nNode.id)) {
        pNode.connectedTo.push(nNode.id);
      }
    });
    
    // Ensure every node in currRow has at least one child
    currRow.forEach(cNode => {
      if (cNode.connectedTo.length === 0) {
        const nNode = nextRow[Math.floor(Math.random() * nextRow.length)];
        cNode.connectedTo.push(nNode.id);
      }
    });
  }
  
  return {
    act,
    nodes,
    currentNodeId: null,
    completedNodeIds: [],
    availableNodeIds: nodes[0].map(n => n.id) // Bottom row
  };
};
