import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGame } from '../context/GameContext';
import { getReachableNodes } from '../game/data/map';
import { Colors, NODE_COLORS, NODE_ICONS } from '../constants/colors';

const { width } = Dimensions.get('window');
const COL_WIDTH = (width - 32) / 3;
const NODE_SIZE = Math.min(COL_WIDTH - 12, 64);

export default function MapScreen() {
  const game = useGame();

  const map = game.map;
  const player = game.player;

  if (!map || !player) {
    router.replace('/');
    return null;
  }

  const reachableIds = getReachableNodes(map).map((n) => n.id);

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
      // Heal 20% max HP at rest sites
      if (game.player) {
        game.player.heal(Math.floor(game.player.maxHp * 0.2));
        game.emit('state_changed');
      }
    }
    // shop/event: just advance for now
  }, [map, game]);

  const hpPct = Math.max(0, player.hp / player.maxHp);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.actLabel}>ACT 1 · CORPORATE INTRANET</Text>
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
        {[...map.layers].reverse().map((layer) => (
          <View key={layer.floor} style={styles.floorRow}>
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
        ))}
        <View style={{ height: 24 }} />
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
    marginBottom: 6,
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
