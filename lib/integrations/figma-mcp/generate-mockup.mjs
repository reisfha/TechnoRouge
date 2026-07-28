import { createEmptyFigDoc, encodeFigParts, assembleCanvasFig, createFigZip } from 'openfig-core';
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
const require = createRequire(import.meta.url);
const { ZstdCodec } = require('zstd-codec');

let nextId = 3;
function genId() { return nextId++; }
function guid() { return { sessionID: 1, localID: genId() }; }
function childOf(g) { return { guid: g, position: 'a' + genId() }; }
function pageOf(s, l) { return { guid: { sessionID: s, localID: l }, position: 'a' + genId() }; }

function paint(hex, a = 1) {
  return { type: 'SOLID', color: { r: parseInt(hex.slice(1, 3), 16) / 255, g: parseInt(hex.slice(3, 5), 16) / 255, b: parseInt(hex.slice(5, 7), 16) / 255, a }, visible: true, blendMode: 'NORMAL', opacity: 1 };
}

function n(doc, f) {
  const node = {
    guid: guid(), phase: 'CREATED', visible: true, opacity: 1,
    transform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 },
    strokeWeight: 0, strokeAlign: 'CENTER', strokeJoin: 'BEVEL',
    ...f
  };
  doc.message.nodeChanges.push(node);
  return node.guid;
}

function rect(doc, nm, x, y, w, h, fill, r, p) {
  return n(doc, {
    type: 'RECTANGLE', name: nm, parentIndex: p,
    size: { x: w, y: h },
    transform: { m00: 1, m01: 0, m02: x, m10: 0, m11: 1, m12: y },
    fillPaints: fill ? [fill] : [],
    strokePaints: [],
    cornerRadius: r || 0,
  });
}

function frame(doc, nm, x, y, w, h, fill, p) {
  return n(doc, {
    type: 'FRAME', name: nm, parentIndex: p,
    size: { x: w, y: h },
    transform: { m00: 1, m01: 0, m02: x, m10: 0, m11: 1, m12: y },
    clipsContent: true,
    fillPaints: fill ? [fill] : [],
    strokePaints: [],
  });
}

function txt(doc, str, x, y, sz, clr, p, bold) {
  return n(doc, {
    type: 'TEXT', name: str.slice(0, 30), parentIndex: p,
    textData: { characters: str },
    size: { x: sz * Math.max(str.length * 0.55 + 2, 5), y: sz * 1.4 },
    transform: { m00: 1, m01: 0, m02: x, m10: 0, m11: 1, m12: y },
    fontName: { family: 'Inter', style: bold ? 'Bold' : 'Regular', postscript: '' },
    fontSize: sz,
    lineHeight: { value: sz * 1.4, units: 'PIXELS' },
    letterSpacing: { value: 0, units: 'PIXELS' },
    textAlignHorizontal: 'LEFT',
    textAlignVertical: 'TOP',
    fillPaints: clr ? [clr] : [paint('#ffffff')],
  });
}

function card(doc, nm, cost, desc, dmg, _blk, typ, x, y, p) {
  const cw = 160, ch = 220;
  const isAtk = typ === 'Attack';
  const isSkill = typ === 'Skill';
  const accent = isAtk ? '#ff0040' : isSkill ? '#4488ff' : '#00ff88';
  const cardBg = isAtk ? '#1a0a0a' : isSkill ? '#0a0a1a' : '#0a1a0a';

  rect(doc, `${nm} sh`, x + 3, y + 3, cw, ch, paint('#000000', 0.4), 10, p);
  rect(doc, `${nm} bg`, x, y, cw, ch, paint(cardBg), 10, p);

  n(doc, {
    type: 'RECTANGLE', name: `${nm} acc`, parentIndex: p,
    size: { x: cw, y: 4 },
    transform: { m00: 1, m01: 0, m02: x, m10: 0, m11: 1, m12: y },
    fillPaints: [paint(accent)],
    strokePaints: [],
    cornerRadius: 10,
  });

  rect(doc, `${nm} cost`, x + 8, y + 8, 28, 28, paint('#ffcc00'), 14, p);
  txt(doc, String(cost), x + 16, y + 11, 15, paint('#000000'), p, true);
  txt(doc, nm, x + 44, y + 12, 13, paint('#ffffff'), p, true);
  txt(doc, typ.toUpperCase(), x + 44, y + 30, 9, paint(accent), p);

  rect(doc, `${nm} art`, x + 10, y + 48, cw - 20, 90, paint('#0d0d1a'), 6, p);
  if (dmg) {
    rect(doc, `${nm} dmg`, x + 55, y + 75, 50, 36, paint(accent, 0.3), 6, p);
    txt(doc, dmg, x + 60, y + 78, 22, paint('#ffffff'), p, true);
    if (!dmg.includes('x')) {
      txt(doc, 'DMG', x + 62, y + 102, 8, paint(accent, 0.7), p);
    }
  }
  txt(doc, desc, x + 10, y + 148, 9, paint('#8888aa'), p);

  n(doc, {
    type: 'RECTANGLE', name: `${nm} bot`, parentIndex: p,
    size: { x: cw, y: 2 },
    transform: { m00: 1, m01: 0, m02: x, m10: 0, m11: 1, m12: y + ch - 2 },
    fillPaints: [paint(accent, 0.5)],
    strokePaints: [],
    cornerRadius: 0,
  });
}

const doc = createEmptyFigDoc();

const bg = frame(doc, 'Game Board', 0, 0, 960, 640, paint('#08080d'), pageOf(0, 1));
rect(doc, 'grid bg', 0, 0, 960, 640, paint('#0a0a12'), 0, childOf(bg));

// Title bar
rect(doc, 'top bar', 0, 0, 960, 3, paint('#ff0040'), 0, childOf(bg));
txt(doc, 'TECHNOROUGE', 16, 10, 22, paint('#ff0040'), childOf(bg), true);
txt(doc, 'COMBAT PHASE - v1.0', 16, 38, 11, paint('#555566'), childOf(bg));
rect(doc, 'turn badge', 828, 8, 114, 28, paint('#ff0040', 0.12), 6, childOf(bg));
txt(doc, 'YOUR TURN', 838, 12, 12, paint('#ff4060'), childOf(bg), true);

// Enemy
const ea = frame(doc, 'Enemy', 280, 30, 400, 300, null, childOf(bg));
rect(doc, 'enemy bg', 280, 40, 400, 280, paint('#120808'), 12, childOf(ea));
n(doc, {
  type: 'RECTANGLE', name: 'enemy glow', parentIndex: childOf(ea),
  size: { x: 400, y: 280 }, transform: { m00: 1, m01: 0, m02: 280, m10: 0, m11: 1, m12: 40 },
  fillPaints: [paint('#ff0040', 0.08)],
  strokePaints: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0.25, a: 0.6 }, visible: true, blendMode: 'NORMAL', opacity: 1 }],
  strokeWeight: 2, strokeAlign: 'INSIDE', cornerRadius: 12,
});
txt(doc, 'ICE WALL', 310, 58, 22, paint('#ff4060'), childOf(ea), true);
rect(doc, 'intent', 588, 55, 72, 22, paint('#ff0040', 0.2), 6, childOf(ea));
txt(doc, 'ATTACK', 596, 57, 11, paint('#ff4060'), childOf(ea), true);
rect(doc, 'hp bg', 310, 92, 340, 18, paint('#1a1a1a'), 9, childOf(ea));
rect(doc, 'hp fill', 310, 92, 340, 18, paint('#ff0040'), 9, childOf(ea));
txt(doc, 'HP: 45/45', 310, 115, 13, paint('#ff8080'), childOf(ea));
txt(doc, 'Next: 8 damage', 310, 138, 12, paint('#ff6060'), childOf(ea));
txt(doc, 'VULNERABLE', 310, 163, 11, paint('#ff4444'), childOf(ea), true);

// HUD
const hud = frame(doc, 'HUD', 16, 480, 320, 140, null, childOf(bg));
txt(doc, 'HP', 20, 486, 13, paint('#00ff88'), childOf(hud), true);
rect(doc, 'hphp bg', 50, 488, 200, 14, paint('#1a1a1a'), 7, childOf(hud));
rect(doc, 'hphp fill', 50, 488, 160, 14, paint('#00ff88'), 7, childOf(hud));
txt(doc, '62/75', 260, 486, 11, paint('#00ff88'), childOf(hud));
txt(doc, 'ENERGY', 20, 512, 13, paint('#ffcc00'), childOf(hud), true);
for (let i = 0; i < 3; i++)
  rect(doc, `e orb ${i}`, 100 + i * 22, 512, 16, 16, paint('#ffcc00'), 8, childOf(hud));
txt(doc, '3/3', 170, 512, 11, paint('#ffcc00'), childOf(hud));
txt(doc, 'BLOCK', 20, 538, 13, paint('#4488ff'), childOf(hud), true);
rect(doc, 'blk bg', 78, 540, 150, 14, paint('#1a1a1a'), 7, childOf(hud));
rect(doc, 'blk fill', 78, 540, 75, 14, paint('#4488ff'), 7, childOf(hud));
txt(doc, '12', 238, 538, 11, paint('#4488ff'), childOf(hud));
txt(doc, 'Deck: 12', 20, 566, 11, paint('#777788'), childOf(hud));
txt(doc, 'Discard: 5', 100, 566, 11, paint('#777788'), childOf(hud));
txt(doc, 'Hand: 7', 195, 566, 11, paint('#777788'), childOf(hud));

// Cards
const ch = frame(doc, 'Cards', 16, 340, 928, 130, null, childOf(bg));
card(doc, 'Slice', 1, 'Deal 8 damage', '8', null, 'Attack', 30, 350, childOf(ch));
card(doc, 'Double Slice', 2, 'Deal 5 dmg x2', '5x2', null, 'Attack', 205, 350, childOf(ch));
card(doc, 'Defend', 1, 'Gain 5 Block', null, '5', 'Skill', 380, 350, childOf(ch));
card(doc, 'Neural Surge', 3, 'Deal 14 damage', '14', null, 'Attack', 555, 350, childOf(ch));
card(doc, 'Overclock', 1, 'Draw 2 cards', null, null, 'Skill', 730, 350, childOf(ch));

// End turn
rect(doc, 'end turn', 840, 580, 104, 44, paint('#ff0040'), 8, childOf(bg));
txt(doc, 'END TURN', 852, 593, 13, paint('#ffffff'), childOf(bg), true);

console.log(`Nodes: ${doc.message.nodeChanges.length}`);

const parts = encodeFigParts(doc);
const messageCompressed = await new Promise((resolve, reject) => {
  ZstdCodec.run((zstd) => {
    try { resolve(new zstd.Simple().compress(parts.messageRaw, 3)); }
    catch (e) { reject(e); }
  });
});
const canvasFig = assembleCanvasFig({ ...parts, messageCompressed });
const figZip = createFigZip({
  canvasFig,
  meta: { file_name: 'TechnoRouge Mockup', version: '1' },
  thumbnail: new Uint8Array(0),
});
writeFileSync('TechnoRouge-Mockup.fig', Buffer.from(figZip));
console.log('Generated TechnoRouge-Mockup.fig');
