import Phaser from 'phaser';
import { Game, GameMap, NodeType, getReachableNodes, advanceToNode, getNode } from '@workspace/game-logic';

const NODE_ICONS: Record<NodeType, string> = {
  combat: '⚔',
  elite:  '☠',
  shop:   '◈',
  rest:   '◉',
  event:  '?',
  boss:   '▲',
};

const NODE_COLORS: Record<NodeType, string> = {
  combat: '#ff4455',
  elite:  '#ff8800',
  shop:   '#ffdd44',
  rest:   '#44ff88',
  event:  '#bb66ff',
  boss:   '#ff2222',
};

const FLOOR_NAMES: Record<number, string> = {
  1: 'Corporate Intranet',
  2: 'Deep Network',
  3: 'Core Mainframe',
};

export class MapScene extends Phaser.Scene {
  private map!: GameMap;
  private nodeElements: Map<string, HTMLElement> = new Map();
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
            <span class="map-stat">HP ${Game.player?.hp ?? 0}/${Game.player?.maxHp ?? 0}</span>
            <span class="map-stat">CB ${Game.cryptoBytes}</span>
          </div>
        </div>
        <div class="map-scroll" id="map-scroll">
          <div class="map-grid" id="map-grid"></div>
        </div>
      </div>
    `;

    const grid = document.getElementById('map-grid') as HTMLElement;
    this.nodeElements.clear();

    // Render floors top→bottom in DOM: boss (floor 14) first, start (floor 0) last.
    // CSS uses flex-direction:column so first child = top of screen.
    // Player starts at the bottom and progresses upward.
    for (let i = this.map.layers.length - 1; i >= 0; i--) {
      const layer = this.map.layers[i];
      const row = document.createElement('div');
      row.className = 'map-row';
      row.dataset.floor = String(layer.floor);

      const floorLabel = document.createElement('div');
      floorLabel.className = 'map-floor-label';
      if (layer.floor === 0) floorLabel.textContent = 'START';
      else if (layer.floor === this.map.layers.length - 1) floorLabel.textContent = 'BOSS';
      else floorLabel.textContent = String(layer.floor);
      row.appendChild(floorLabel);

      // Fixed 3-column slots so nodes stay visually aligned across floors
      const slots = document.createElement('div');
      slots.className = 'map-slots';

      for (let col = 0; col < 3; col++) {
        const slot = document.createElement('div');
        slot.className = 'map-slot';

        const node = layer.nodes.find((n) => n.column === col);
        if (node) {
          const el = document.createElement('div');
          el.className = 'map-node';
          el.id = `map-node-${node.id}`;
          el.style.setProperty('--node-color', NODE_COLORS[node.type]);

          if (node.visited) el.classList.add('visited');
          if (reachable.includes(node.id)) el.classList.add('reachable');
          if (node.id === this.map.currentNodeId) el.classList.add('current');
          if (node.type === 'boss') el.classList.add('boss');

          el.innerHTML = `
            <div class="node-icon">${NODE_ICONS[node.type]}</div>
            <div class="node-label">${node.type.toUpperCase()}</div>
          `;

          if (reachable.includes(node.id)) {
            el.addEventListener('click', () => this.selectNode(node.id));
          }

          slot.appendChild(el);
          this.nodeElements.set(node.id, el);
        }

        slots.appendChild(slot);
      }

      row.appendChild(slots);
      grid.appendChild(row);
    }

    // Draw SVG paths after layout is done
    requestAnimationFrame(() => {
      this.drawConnectionsSVG();
      this.scrollToStart();
    });
  }

  private drawConnectionsSVG(): void {
    const grid = document.getElementById('map-grid');
    if (!grid) return;

    // Remove any existing SVG
    grid.querySelector('svg')?.remove();

    const gridRect = grid.getBoundingClientRect();
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.style.cssText = `
      position:absolute; top:0; left:0;
      width:${grid.scrollWidth}px; height:${grid.scrollHeight}px;
      pointer-events:none; overflow:visible; z-index:0;
    `;

    const reachableIds = getReachableNodes(this.map).map((n) => n.id);

    for (const layer of this.map.layers) {
      for (const node of layer.nodes) {
        for (const targetId of node.connections) {
          const fromEl = this.nodeElements.get(node.id);
          const toEl   = this.nodeElements.get(targetId);
          if (!fromEl || !toEl) continue;

          const fR = fromEl.getBoundingClientRect();
          const tR = toEl.getBoundingClientRect();

          const x1 = fR.left + fR.width  / 2 - gridRect.left;
          const y1 = fR.top  + fR.height / 2 - gridRect.top;
          const x2 = tR.left + tR.width  / 2 - gridRect.left;
          const y2 = tR.top  + tR.height / 2 - gridRect.top;

          const isReachablePath = node.visited && reachableIds.includes(targetId);
          const isWalked        = node.visited && getNode(this.map, targetId)?.visited;

          const line = document.createElementNS(svgNS, 'line');
          line.setAttribute('x1', String(x1));
          line.setAttribute('y1', String(y1));
          line.setAttribute('x2', String(x2));
          line.setAttribute('y2', String(y2));
          line.setAttribute('stroke-linecap', 'round');

          if (isWalked) {
            line.setAttribute('stroke', '#1e3a2a');
            line.setAttribute('stroke-width', '2');
          } else if (isReachablePath) {
            line.setAttribute('stroke', '#44aaff');
            line.setAttribute('stroke-width', '2.5');
            // Glow filter applied via filter element
            line.setAttribute('filter', 'url(#glow)');
          } else {
            line.setAttribute('stroke', '#1a1a35');
            line.setAttribute('stroke-width', '1.5');
          }

          svg.appendChild(line);
        }
      }
    }

    // Add glow filter def
    const defs = document.createElementNS(svgNS, 'defs');
    defs.innerHTML = `
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    `;
    svg.insertBefore(defs, svg.firstChild);

    grid.style.position = 'relative';
    grid.insertBefore(svg, grid.firstChild);
  }

  private scrollToStart(): void {
    const scroll = document.getElementById('map-scroll');
    if (!scroll) return;

    if (!this.map.currentNodeId) {
      // No node selected yet — show the bottom (START floor)
      scroll.scrollTop = scroll.scrollHeight;
      return;
    }

    const currentEl = this.nodeElements.get(this.map.currentNodeId);
    if (currentEl && scroll) {
      currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private selectNode(nodeId: string): void {
    const node = getNode(this.map, nodeId);
    if (!node) return;

    this.map = advanceToNode(this.map, nodeId);
    Game.map = this.map;

    switch (node.type) {
      case 'combat':
      case 'elite':
      case 'boss':
        this.scene.start('CombatScene', {
          enemyType: node.type,
          fromMap: true,
        });
        break;
      case 'shop':
      case 'rest':
      case 'event':
        // Re-render map for now (shop/rest/event scenes to be expanded)
        this.renderMap();
        break;
    }
  }

  private setupInput(): void {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') this.scene.start('MenuScene');
    });
  }
}
