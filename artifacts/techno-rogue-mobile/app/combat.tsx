import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  useWindowDimensions, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGame } from '../context/GameContext';
import { Colors } from '../constants/colors';

const CARD_TYPE_COLORS: Record<string, string> = {
  code: Colors.red,
  firewall: Colors.cyan,
  daemon: Colors.purple,
  virus: Colors.green,
  ice: Colors.yellow,
  protocol: Colors.text,
};

const INTENT_ICONS: Record<string, string> = {
  attack: '⚔',
  defend: '🛡',
  buff: '⬆',
  debuff: '⬇',
  status: '☣',
};

const INTENT_COLORS: Record<string, string> = {
  attack: Colors.red,
  defend: Colors.cyan,
  buff: Colors.purple,
  debuff: Colors.yellow,
  status: Colors.green,
};

const EFFECT_COLORS: Record<string, string> = {
  poison: Colors.green,
  weak: Colors.yellow,
  vulnerable: '#ff6644',
  strength: Colors.red,
  fortify: Colors.cyan,
};

export default function CombatScreen() {
  const game = useGame();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const CARD_W = isLandscape
    ? Math.min((height - 80) / 5, Math.min((width - 64) / 6, 140))
    : Math.min((width - 32) / 3.5, 120);
  const CARD_H = CARD_W * 1.45;
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const player = game.player;
  const enemies = game.enemies;
  const phase = game.phase;

  // Show result modal when combat ends
  React.useEffect(() => {
    if (phase === 'victory' || phase === 'defeat') {
      const timer = setTimeout(() => setShowResult(true), 400);
      return () => clearTimeout(timer);
    } else {
      setShowResult(false);
    }
  }, [phase]);

  // Start combat whenever we land here without an active turn
  React.useEffect(() => {
    if (game.phase !== 'player_turn' && game.phase !== 'enemy_turn') {
      game.startCombat();
    }
  }, []);

  if (!player) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loadingText}>INITIALIZING COMBAT...</Text>
      </SafeAreaView>
    );
  }

  function playCard(index: number) {
    if (!game.canPlayCard(index)) return;
    game.playCard(index);
    setSelectedCard(null);
  }

  function endTurn() {
    if (phase !== 'player_turn') return;
    game.endPlayerTurn();
    setSelectedCard(null);
  }

  const hpPct = Math.max(0, player.hp / player.maxHp);
  const isPlayerTurn = phase === 'player_turn';

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Enemy Section ─────────────────────────────── */}
      <View style={styles.enemySection}>
        {enemies.map((enemy, idx) => {
          const eHpPct = Math.max(0, enemy.hp / enemy.maxHp);
          const intent = enemy.currentIntent;
          const intentColor = intent ? (INTENT_COLORS[intent.type] || Colors.textDim) : Colors.textDim;
          const intentIcon = intent ? (INTENT_ICONS[intent.type] || '?') : '?';
          let intentValue = '';
          if (intent?.type === 'attack') intentValue = `${(intent.value ?? 0) + enemy.strength}`;
          else if (intent?.type === 'defend') intentValue = `${intent.value ?? 0}`;
          else if (intent?.effectValue) intentValue = `${intent.effectValue}`;

          return (
            <TouchableOpacity
              key={`${enemy.def.id}-${idx}`}
              style={[
                styles.enemyCard,
                idx === game.selectedTargetIndex && styles.enemyCardSelected,
              ]}
              onPress={() => game.setTarget(idx)}
              activeOpacity={0.85}
            >
              {/* Intent bubble */}
              {intent && (
                <View style={[styles.intentBubble, { borderColor: intentColor }]}>
                  <Text style={[styles.intentIcon, { color: intentColor }]}>{intentIcon}</Text>
                  {intentValue ? <Text style={[styles.intentValue, { color: intentColor }]}>{intentValue}</Text> : null}
                </View>
              )}

              {/* Sprite */}
              <View style={[styles.enemySprite, { borderColor: Colors.red }]}>
                <Text style={styles.enemySpriteGlyph}>⬡</Text>
              </View>

              {/* Block */}
              {enemy.block > 0 && (
                <Text style={styles.enemyBlock}>🛡 {enemy.block}</Text>
              )}

              <Text style={styles.enemyName}>{enemy.name}</Text>

              {/* HP bar */}
              <View style={styles.enemyHpWrap}>
                <View style={styles.hpBarBg}>
                  <View style={[styles.hpBarFill, { width: `${eHpPct * 100}%` as any, backgroundColor: Colors.red }]} />
                </View>
                <Text style={styles.enemyHpText}>{enemy.hp}/{enemy.maxHp}</Text>
              </View>

              {/* Effects */}
              {enemy.effects.length > 0 && (
                <View style={styles.effectRow}>
                  {enemy.effects.map((e) => (
                    <View key={e.id} style={[styles.effectBadge, { borderColor: EFFECT_COLORS[e.name] || Colors.textDim }]}>
                      <Text style={[styles.effectText, { color: EFFECT_COLORS[e.name] || Colors.textDim }]}>
                        {e.name.slice(0, 3).toUpperCase()} {e.stacks}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Player Status Bar ──────────────────────────── */}
      <View style={styles.playerBar}>
        <View style={styles.playerLeft}>
          {/* HP */}
          <View style={styles.hpRow}>
            <Text style={styles.hpIcon}>♥</Text>
            <View style={styles.hpBarBg}>
              <View style={[styles.hpBarFill, { width: `${hpPct * 100}%` as any, backgroundColor: Colors.hp }]} />
            </View>
            <Text style={styles.hpText}>{player.hp}/{player.maxHp}</Text>
          </View>
          {/* Block */}
          {player.block > 0 && (
            <Text style={styles.blockText}>🛡 {player.block}</Text>
          )}
          {/* Player effects */}
          {player.effects.length > 0 && (
            <View style={styles.effectRow}>
              {player.effects.map((e) => (
                <View key={e.id} style={[styles.effectBadge, { borderColor: EFFECT_COLORS[e.name] || Colors.textDim }]}>
                  <Text style={[styles.effectText, { color: EFFECT_COLORS[e.name] || Colors.textDim }]}>
                    {e.name.slice(0, 3).toUpperCase()} {e.stacks}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Energy */}
        <View style={styles.energyCol}>
          <View style={styles.energyOrbs}>
            {Array.from({ length: player.maxEnergy }).map((_, i) => (
              <View key={i} style={[styles.orb, i >= player.energy && styles.orbSpent]} />
            ))}
          </View>
          <Text style={styles.energyText}>{player.energy}/{player.maxEnergy}</Text>
        </View>
      </View>

      {/* ── Phase indicator ────────────────────────────── */}
      {!isPlayerTurn && phase === 'enemy_turn' && (
        <View style={styles.phaseBanner}>
          <Text style={styles.phaseText}>ENEMY TURN</Text>
        </View>
      )}

      {/* ── Hand ──────────────────────────────────────── */}
      <View style={styles.handArea}>
        {/* Draw / Discard counters */}
        <View style={styles.deckInfo}>
          <View style={styles.pileBox}>
            <Text style={styles.pileCount}>{player.drawPile.length}</Text>
            <Text style={styles.pileLabel}>DRAW</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.handScrollView}
          contentContainerStyle={styles.handScroll}
        >
          {player.hand.map((card, i) => {
            const canPlay = game.canPlayCard(i);
            const cardColor = CARD_TYPE_COLORS[card.type] || Colors.text;
            const isSelected = selectedCard === i;

            return (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.card,
                  { width: CARD_W, minHeight: CARD_H, borderColor: canPlay ? cardColor : Colors.border },
                  !canPlay && styles.cardUnplayable,
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => {
                  if (!canPlay) return;
                  if (isSelected) {
                    playCard(i);
                  } else {
                    setSelectedCard(i);
                  }
                }}
                onLongPress={() => canPlay && playCard(i)}
                activeOpacity={canPlay ? 0.85 : 1}
              >
                {/* Cost badge */}
                <View style={[styles.costBadge, { backgroundColor: cardColor }]}>
                  <Text style={styles.costText}>{card.cost}</Text>
                </View>

                {/* Card art area */}
                <View style={[styles.cardArt, { height: CARD_W * 0.7, borderColor: cardColor + '44' }]}>
                  <Text style={[styles.cardArtSymbol, { color: cardColor }]}>
                    {card.type === 'code' ? '⟨/⟩' :
                     card.type === 'firewall' ? '◈' :
                     card.type === 'daemon' ? '⬡' :
                     card.type === 'virus' ? '⬟' :
                     card.type === 'ice' ? '◆' : '⊕'}
                  </Text>
                </View>

                <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{card.description}</Text>
                {card.def.exhaust && <Text style={styles.cardExhaust}>EXHAUST</Text>}

                {isSelected && (
                  <View style={[styles.tapToPlay, { backgroundColor: cardColor }]}>
                    <Text style={styles.tapToPlayText}>TAP TO PLAY</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.deckInfo}>
          <View style={styles.pileBox}>
            <Text style={styles.pileCount}>{player.discardPile.length}</Text>
            <Text style={styles.pileLabel}>DISC</Text>
          </View>
        </View>
      </View>

      {/* ── End Turn Button ────────────────────────────── */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.endTurnBtn, isPlayerTurn && styles.endTurnBtnActive]}
          onPress={endTurn}
          disabled={!isPlayerTurn}
          activeOpacity={0.8}
        >
          <Text style={[styles.endTurnText, isPlayerTurn && styles.endTurnTextActive]}>
            {isPlayerTurn ? 'END TURN' : '...'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Victory / Defeat Modal ─────────────────────── */}
      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            {phase === 'victory' ? (
              <>
                <Text style={[styles.modalTitle, { color: Colors.green }]}>SYSTEM BREACHED</Text>
                <Text style={styles.modalSub}>You cracked the mainframe.</Text>
                <Text style={styles.modalCb}>+{game.cryptoBytes} CB earned</Text>
                <TouchableOpacity
                  style={[styles.modalBtn, { borderColor: Colors.green }]}
                  onPress={() => { setShowResult(false); router.replace('/map'); }}
                >
                  <Text style={[styles.modalBtnText, { color: Colors.green }]}>CONTINUE</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[styles.modalTitle, { color: Colors.red }]}>JACKED OUT</Text>
                <Text style={styles.modalSub}>The system was too strong.</Text>
                <TouchableOpacity
                  style={[styles.modalBtn, { borderColor: Colors.red }]}
                  onPress={() => {
                    setShowResult(false);
                    const className = game.classDef?.id ?? 'netrunner';
                    game.startRun(className);
                    game.generateMap();
                    router.replace('/map');
                  }}
                >
                  <Text style={[styles.modalBtnText, { color: Colors.red }]}>TRY AGAIN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { borderColor: Colors.border, marginTop: 0 }]}
                  onPress={() => { setShowResult(false); router.replace('/'); }}
                >
                  <Text style={[styles.modalBtnText, { color: Colors.textDim }]}>MAIN MENU</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingText: {
    fontFamily: 'Courier New', fontSize: 14, color: Colors.cyan,
    textAlign: 'center', marginTop: 40,
  },

  // Enemy section
  enemySection: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
  },
  enemyCard: {
    flex: 1,
    maxWidth: 180,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  enemyCardSelected: {
    borderColor: Colors.red,
    shadowColor: Colors.red,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  intentBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.bg,
  },
  intentIcon: { fontSize: 14 },
  intentValue: { fontFamily: 'Courier New', fontSize: 16, fontWeight: 'bold' },
  enemySprite: {
    width: 60, height: 60,
    borderWidth: 3, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgPanel,
  },
  enemySpriteGlyph: { fontSize: 28, color: Colors.red },
  enemyBlock: { fontFamily: 'Courier New', fontSize: 11, color: Colors.block },
  enemyName: { fontFamily: 'Courier New', fontSize: 11, fontWeight: 'bold', color: Colors.text },
  enemyHpWrap: { width: '100%', gap: 2 },
  enemyHpText: { fontFamily: 'Courier New', fontSize: 10, color: Colors.textDim, textAlign: 'center' },

  // Player bar
  playerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  playerLeft: { gap: 4, flex: 1 },
  hpRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hpIcon: { fontSize: 14, color: Colors.hp },
  hpBarBg: {
    flex: 1, maxWidth: 120, height: 10,
    backgroundColor: Colors.bgPanel,
    borderRadius: 5, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  hpBarFill: { height: '100%', borderRadius: 4 },
  hpText: { fontFamily: 'Courier New', fontSize: 11, color: Colors.text, minWidth: 50 },
  blockText: { fontFamily: 'Courier New', fontSize: 12, color: Colors.block },
  effectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  effectBadge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  effectText: { fontFamily: 'Courier New', fontSize: 9, fontWeight: 'bold' },
  energyCol: { alignItems: 'center', gap: 4 },
  energyOrbs: { flexDirection: 'row', gap: 5 },
  orb: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.energy,
    shadowColor: Colors.energy, shadowOpacity: 0.6, shadowRadius: 4, elevation: 3,
  },
  orbSpent: { backgroundColor: Colors.bgPanel, shadowOpacity: 0, elevation: 0, opacity: 0.3 },
  energyText: { fontFamily: 'Courier New', fontSize: 11, color: Colors.energy, fontWeight: 'bold' },

  // Phase banner
  phaseBanner: {
    alignItems: 'center', paddingVertical: 6,
    backgroundColor: Colors.bgPanel,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  phaseText: { fontFamily: 'Courier New', fontSize: 13, color: Colors.red, letterSpacing: 3 },

  // Hand area
  handArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  deckInfo: { paddingHorizontal: 6, alignItems: 'center' },
  pileBox: { alignItems: 'center', gap: 2 },
  pileCount: { fontFamily: 'Courier New', fontSize: 16, fontWeight: 'bold', color: Colors.text },
  pileLabel: { fontFamily: 'Courier New', fontSize: 8, color: Colors.textDim, letterSpacing: 1 },
  handScroll: { paddingHorizontal: 4, gap: 8, alignItems: 'center' },
  handScrollView: { flex: 1 },

  // Cards
  card: {
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardUnplayable: { opacity: 0.45 },
  cardSelected: { transform: [{ translateY: -12 }], elevation: 8, shadowOpacity: 0.5, shadowRadius: 10 },
  costBadge: {
    position: 'absolute', top: -2, left: -2,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  costText: { fontFamily: 'Courier New', fontSize: 13, fontWeight: 'bold', color: Colors.bg },
  cardArt: {
    width: '100%',
    borderWidth: 1, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4, marginBottom: 4,
    backgroundColor: Colors.bgPanel,
  },
  cardArtSymbol: { fontSize: 24 },
  cardName: {
    fontFamily: 'Courier New', fontSize: 10, fontWeight: 'bold',
    color: Colors.text, textAlign: 'center',
  },
  cardDesc: {
    fontFamily: 'Courier New', fontSize: 8.5,
    color: Colors.textDim, textAlign: 'center', lineHeight: 12,
    marginTop: 2,
  },
  cardExhaust: {
    fontFamily: 'Courier New', fontSize: 7,
    color: Colors.yellow, marginTop: 2, opacity: 0.8,
  },
  tapToPlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingVertical: 4, alignItems: 'center',
  },
  tapToPlayText: { fontFamily: 'Courier New', fontSize: 8, fontWeight: 'bold', color: Colors.bg, letterSpacing: 1 },

  // Action row
  actionRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 6,
  },
  endTurnBtn: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.bgPanel,
  },
  endTurnBtnActive: {
    borderColor: Colors.cyan,
    shadowColor: Colors.cyan,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  endTurnText: {
    fontFamily: 'Courier New', fontSize: 14, fontWeight: 'bold',
    color: Colors.textDim, letterSpacing: 3,
  },
  endTurnTextActive: { color: Colors.cyan },

  // Modal
  modalBg: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: Colors.bgCard,
    borderWidth: 2, borderColor: Colors.border,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    minWidth: 260,
  },
  modalTitle: { fontFamily: 'Courier New', fontSize: 26, fontWeight: 'bold', letterSpacing: 3 },
  modalSub: { fontFamily: 'Courier New', fontSize: 12, color: Colors.textDim },
  modalCb: { fontFamily: 'Courier New', fontSize: 13, color: Colors.yellow },
  modalBtn: {
    borderWidth: 2, borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 32,
    alignItems: 'center',
  },
  modalBtnText: { fontFamily: 'Courier New', fontSize: 14, fontWeight: 'bold', letterSpacing: 2 },
});
