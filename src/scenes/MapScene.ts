import Phaser from 'phaser';
import { Game } from '../Game';
import { GameMap, NodeType, getReachableNodes, advanceToNode, getNode } from '../data/map';

const NODE_ICONS: Record<NodeType, string> = {
  combat: '[X]',
  elite: '[!]',
  shop: '[$]',
  rest: '[R]',
  event: '[?]',
  boss: '[B]',
};

const NODE_COLORS: Record<NodeType, string> = {
  combat: '#ff4455',
  elite: '#ff8800',
  shop: '#ffdd44',
  rest: '#44ff88',
  event: '#bb66ff',
  boss: '#ff2222',
};

const FLOOR_NAMES: Record<number, string> = {
  1: 'Corporate Intranet',
  2: 'Deep Network',
  3: 'Core Mainframe',
};

export class MapScene extends Phaser.Scene {
  private map!: GameMap;
  private nodeElements: Map<string, HTMLElement> = new Map();
  private pathElements: HTMLElement[] = [];
  private overlay!: HTMLElement;

  constructor() {
    super({ key: 'MapScene' });
  }

  init(data: { className?: string }): void {
    if (data.className) {
      Game.startRun(data.className);
    }
    if (!Game.map) {
      Game.map = Game.generateMap();
    }
    this.map = Game.map;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0a0a0f');
    this.overlay = document.getElementById('ui-overlay') as HTMLElement;
    this.overlay.innerHTML = '';

    this.renderMap();
    this.setupInput();
  }

  private renderMap(): void {
    const reachable = getReachableNodes(this.map).map((n) => n.id);

    this.overlay.innerHTML = `
      <div class="map-container">
        <div class="map-header">
          <div class="map-act">ACT ${this.map.act}</div>
          <div class="map-location">${FLOOR_NAMES[this.map.act] || 'Unknown Network'}</div>
          <div class="map-stats">
            <span class="map-stat">HP: ${Game.player?.hp ?? 0}/${Game.player?.maxHp ?? 0}</span>
            <span class="map-stat">CB: ${Game.cryptoBytes}</span>
          </div>
        </div>
        <div class="map-scroll" id="map-scroll">
          <div class="map-grid" id="map-grid"></div>
        </div>
        <div class="map-footer">
          <button id="map-back-btn" class="neon-btn" style="display:none">BACK TO MENU</button>
        </div>
      </div>
    `;

    const grid = document.getElementById('map-grid') as HTMLElement;
    this.nodeElements.clear();
    this.pathElements = [];

    for (let i = this.map.layers.length - 1; i >= 0; i--) {
      const layer = this.map.layers[i];
      const row = document.createElement('div');
      row.className = 'map-row';

      const floorLabel = document.createElement('div');
      floorLabel.className = 'map-floor-label';
      floorLabel.textContent = layer.floor === 0 ? 'START' : layer.floor === this.map.layers.length - 1 ? 'BOSS' : `${layer.floor}`;
      row.appendChild(floorLabel);

      const nodesContainer = document.createElement('div');
      nodesContainer.className = 'map-nodes';

      for (const node of layer.nodes) {
        const el = document.createElement('div');
        el.className = 'map-node';
        el.id = `map-node-${node.id}`;
        el.style.setProperty('--node-color', NODE_COLORS[node.type]);

        if (node.visited) el.classList.add('visited');
        if (reachable.includes(node.id)) el.classList.add('reachable');
        if (node.id === this.map.currentNodeId) el.classList.add('current');
        if (node.type === 'boss') el.classList.add('boss');

        const icon = NODE_ICONS[node.type];
        el.innerHTML = `
          <div class="node-icon">${icon}</div>
          <div class="node-label">${node.type.toUpperCase()}</div>
        `;

        if (reachable.includes(node.id)) {
          el.addEventListener('click', () => this.selectNode(node.id));
        }

        nodesContainer.appendChild(el);
        this.nodeElements.set(node.id, el);
      }

      row.appendChild(nodesContainer);
      grid.appendChild(row);
    }

    this.drawConnections();
    this.scrollToCurrentNode();

    const backBtn = document.getElementById('map-back-btn');
    backBtn?.addEventListener('click', () => {
      this.scene.start('MenuScene');
    });
  }

  private drawConnections(): void {
    const grid = document.getElementById('map-grid') as HTMLElement;

    for (const layer of this.map.layers) {
      for (const node of layer.nodes) {
        for (const targetId of node.connections) {
          const line = document.createElement('div');
          line.className = 'map-connection';

          const fromEl = this.nodeElements.get(node.id);
          const toEl = this.nodeElements.get(targetId);

          if (fromEl && toEl) {
            const isReachablePath = node.visited && getReachableNodes(this.map).some((n) => n.id === targetId);
            if (isReachablePath) line.classList.add('active');
            if (node.visited) line.classList.add('visited');
          }

          grid.appendChild(line);
          this.pathElements.push(line);
        }
      }
    }
  }

  private scrollToCurrentNode(): void {
    const scroll = document.getElementById('map-scroll');
    const currentNode = this.nodeElements.get(this.map.currentNodeId ?? '');

    if (scroll && currentNode) {
      setTimeout(() => {
        currentNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  private selectNode(nodeId: string): void {
    const node = getNode(this.map, nodeId);
    if (!node) return;

    this.map = advanceToNode(this.map, nodeId);

    switch (node.type) {
      case 'combat':
      case 'elite':
      case 'boss':
        this.scene.start('CombatScene', {
          className: Game.classDef?.id ?? 'netrunner',
          enemyType: node.type,
          fromMap: true,
        });
        break;
      case 'shop':
      case 'rest':
      case 'event':
        this.scene.start('CombatScene', {
          className: Game.classDef?.id ?? 'netrunner',
          fromMap: true,
        });
        break;
      default:
        this.scene.start('CombatScene', {
          className: Game.classDef?.id ?? 'netrunner',
          fromMap: true,
        });
    }
  }

  private setupInput(): void {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.scene.start('MenuScene');
      }
    });
  }
}
