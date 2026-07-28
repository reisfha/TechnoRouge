'use no memo';

import { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGame } from '../context/GameContext';
import { getReachableNodes, MapNode } from '@workspace/game-logic';
import { Colors, NODE_COLORS, NODE_ICONS } from '../constants/colors';

const { width } = Dimensions.get('window');
const PADDING_LEFT = 16;
const FLOOR_LABEL_WIDTH = 36;
const COL_WIDTH = (width - PADDING_LEFT * 2 - FLOOR_LABEL_WIDTH) / 3;
const NODE_SIZE = Math.min(COL_WIDTH - 12, 64);
const NODE_OFFSET_Y = 35;
const ROW_HEIGHT = NODE_SIZE + NODE_OFFSET_Y;
const LINE_THICKNESS = 2;

function getNodeCenterX(col: number): number {
  return PADDING_LEFT + FLOOR_LABEL_WIDTH + col * COL_WIDTH + COL_WIDTH / 2;
}

function getNodeCenterY(floorIndex: number): number {
  return floorIndex * ROW_HEIGHT + NODE_SIZE / 2 + 12;
}

function getConnections(map: { layers: { floor: number; nodes: MapNode[] }[] }) {
  const lines: { x1: number; y1: number; x2: number; y2: number; color: string; visited: boolean }[] = [];
  for (let f = 0; f < map.layers.length - 1; f++) {
    const layer = map.layers[f];
    for (const node of layer.nodes) {
      for (const targetId of node.connections) {
        let target: MapNode | undefined;
        for (const nl of map.layers) {
          target = nl.nodes.find((n) => n.id === targetId);
          if (target) break;
        }
        if (!target) continue;
        const srcVisited = node.visited;
        const tgtVisited = target.visited;
        const color = srcVisited && tgtVisited
          ? Colors.cyan + '88'
          : srcVisited
            ? Colors.borderBright + 'aa'
            : Colors.border + '55';
        lines.push({
          x1: getNodeCenterX(node.column),
          y1: getNodeCenterY(f),
          x2: getNodeCenterX(target.column),
          y2: getNodeCenterY(f + 1),
          color,
          visited: srcVisited && tgtVisited,
        });
      }
    }
  }
  return lines;
}

const ACT_NAMES: Record<number, string> = {
  1: 'CORPORATE INTRANET',
  2: 'DEEP NETWORK',
  3: 'CORE MAINFRAME',
};

export default function MapScreen() {
  'use no memo';
  const game = useGame();

  const map = game.map;
  const player = game.player;

  if (!map || !player) {
    router.replace('/');
    return null;
  }

  const reachableIds = getReachableNodes(map).map((n) => n.id);
  const connections = getConnections(map);
  const scrollHeight = map.layers.length * ROW_HEIGHT + 36;

  const selectNode = useCallback((nodeId: string) => {
    const node = map.layers.reduce<any>(
      (found, layer) => found ?? layer.nodes.find((n: any) => n.id === nodeId),
      null,
    );
    if (!node) return;

    game.advanceMap(nodeId);

    if (node.type === 'combat' || node.type === 'elite' || node.type === 'boss') {
      game.spawnEnemies(node.type as 'combat' | 'elite' | 'boss');
      router.push('/combat');
    } else if (node.type === 'rest') {
      if (game.player) {
        game.player.heal(Math.floor(game.player.maxHp * 0.2));
        game.emit('state_changed');
      }
    }
  }, [map, game]);

  const hpPct = Math.max(0, player.hp / player.maxHp);
  const actName = ACT_NAMES[map.act] || 'CORPORATE INTRANET';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.actLabel}>ACT {map.act} · {actName}</Text>
          <Text style={styles.cryptoBytes}>⬡ {game.cryptoBytes} CB</Text>
        </View>
        <View style={styles.playerInfo}>
          <View style={styles.hpRow}>
            <Text style={styles.hpIcon}>♥</Text>
            <View style={styles.hpBarBg}>
              <View style={[styles.hpBarFill, { width: `${hpPct * 100}%` as any }]} />
            </View>
            <Text style={styles.hpText}>{player.hp}/{player.maxHp}</Text>
          </View>
          {player.block > 0 && (
            <Text style={styles.blockBadge}>🛡 {player.block}</Text>
          )}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {[
          ['⚔', 'Combat', Colors.red],
          ['☠', 'Elite', Colors.purple],
          ['💀', 'Boss', '#ff2200'],
          ['🛒', 'Shop', Colors.yellow],
          ['🛏', 'Rest', Colors.green],
          ['❓', 'Event', Colors.cyan],
        ].map(([icon, label, color]) => (
          <View key={label} style={styles.legendItem}>
            <Text style={[styles.legendIcon, { color }]}>{icon}</Text>
            <Text style={styles.legendLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Map — rendered bottom (start) → top (boss) */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: scrollHeight, position: 'relative' }}>
          {/* Connection lines overlay */}
          {connections.map((line, i) => {
            const dx = line.x2 - line.x1;
            const dy = line.y2 - line.y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: line.x1,
                  top: line.y1 - LINE_THICKNESS / 2,
                  width: len,
                  height: LINE_THICKNESS,
                  backgroundColor: line.color,
                  borderRadius: 1,
                  transformOrigin: 'left center',
                  transform: [{ rotate: `${angle}deg` }],
                }}
              />
            );
          })}

          {/* Floor rows */}
          {[...map.layers].reverse().map((layer) => {
            const ri = map.layers.length - 1 - layer.floor;
            return (
              <View
                key={layer.floor}
                style={[styles.floorRow, { position: 'absolute', top: ri * ROW_HEIGHT + 12, left: 0, right: 0 }]}
              >
                <Text style={styles.floorLabel}>
                  {layer.floor === 0 ? 'START' : layer.floor === 14 ? 'BOSS' : String(layer.floor)}
                </Text>
                <View style={styles.floorSlots}>
                  {[0, 1, 2].map((col) => {
                    const node = layer.nodes.find((n: any) => n.column === col);
                    if (!node) {
                      return <View key={col} style={[styles.nodeSlot, { width: COL_WIDTH }]} />;
                    }
                    const isReachable = reachableIds.includes(node.id);
                    const isCurrent = node.id === map.currentNodeId;
                    const nodeColor = NODE_COLORS[node.type] || Colors.textDim;

                    return (
                      <View key={col} style={[styles.nodeSlot, { width: COL_WIDTH }]}>
                        <TouchableOpacity
                          style={[
                            styles.node,
                            { width: NODE_SIZE, height: NODE_SIZE, borderColor: nodeColor },
                            node.visited && styles.nodeVisited,
                            isReachable && !node.visited && styles.nodeReachable,
                            isCurrent && [styles.nodeCurrent, { borderColor: nodeColor, shadowColor: nodeColor }],
                            !isReachable && !node.visited && !isCurrent && styles.nodeUnreachable,
                          ]}
                          onPress={() => isReachable && !node.visited && selectNode(node.id)}
                          disabled={!isReachable || node.visited}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.nodeIcon, { color: node.visited ? Colors.textDim : nodeColor }]}>
                            {NODE_ICONS[node.type]}
                          </Text>
                          <Text style={[styles.nodeLabel, { color: node.visited ? Colors.textDim : nodeColor }]}>
                            {node.type.slice(0, 3).toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Back button (quit run) */}
      <TouchableOpacity style={styles.quitBtn} onPress={() => router.replace('/')}>
        <Text style={styles.quitBtnText}>✕ QUIT RUN</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: { gap: 4 },
  actLabel: {
    fontFamily: 'Courier New', fontSize: 10,
    color: Colors.cyan, letterSpacing: 1,
  },
  cryptoBytes: {
    fontFamily: 'Courier New', fontSize: 12,
    color: Colors.yellow, fontWeight: 'bold',
  },
  playerInfo: { alignItems: 'flex-end', gap: 4 },
  hpRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hpIcon: { fontSize: 13, color: Colors.hp },
  hpBarBg: {
    width: 80, height: 8,
    backgroundColor: Colors.bgPanel,
    borderRadius: 4, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  hpBarFill: {
    height: '100%',
    backgroundColor: Colors.hp,
    borderRadius: 3,
  },
  hpText: { fontFamily: 'Courier New', fontSize: 11, color: Colors.text },
  blockBadge: { fontFamily: 'Courier New', fontSize: 11, color: Colors.block },

  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendIcon: { fontSize: 12 },
  legendLabel: { fontFamily: 'Courier New', fontSize: 9, color: Colors.textDim },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  floorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: NODE_SIZE + 6,
  },
  floorLabel: {
    fontFamily: 'Courier New', fontSize: 9,
    color: Colors.textDim, width: 32,
    textAlign: 'right', marginRight: 4,
  },
  floorSlots: { flexDirection: 'row', flex: 1 },
  nodeSlot: { alignItems: 'center', paddingVertical: 3 },

  node: {
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
  },
  nodeVisited: { opacity: 0.3, backgroundColor: Colors.bg },
  nodeReachable: {
    backgroundColor: Colors.bgPanel,
    shadowOpacity: 0.6, shadowRadius: 8, elevation: 5,
  },
  nodeCurrent: {
    shadowOpacity: 0.8, shadowRadius: 10, elevation: 6,
  },
  nodeUnreachable: { opacity: 0.25 },
  nodeIcon: { fontSize: 18 },
  nodeLabel: { fontFamily: 'Courier New', fontSize: 7, marginTop: 2 },

  quitBtn: {
    margin: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    alignItems: 'center',
  },
  quitBtnText: {
    fontFamily: 'Courier New', fontSize: 11,
    color: Colors.textDim, letterSpacing: 1,
  },
});
