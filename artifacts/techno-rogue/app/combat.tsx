'use no memo';

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGame } from '../context/GameContext';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

// ── Card sizing: 2:3 ratio like STS ──────────────────────────
const CARD_W = Math.max(76, Math.min(width * 0.13, 100));
const CARD_H = CARD_W * 1.5;

// ── Card fan math (matches web HandDisplay.ts) ────────────────
const MAX_FAN_SPREAD = 24;
const DEG_PER_CARD = 5;

const CARD_TYPE_COLORS: Record<string, string> = {
  code: Colors.red,
  firewall: Colors.cyan,
  daemon: Colors.purple,
  virus: Colors.green,
  ice: Colors.yellow,
  protocol: Colors.text,
};

const CARD_TYPE_SYMBOLS: Record<string, string> = {
  code: '</>',
  firewall: '◈',
  daemon: '⬡',
  virus: '⬟',
  ice: '◆',
  protocol: '⊕',
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
  'use no memo';
  const game = useGame();
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const player = game.player;
  const enemies = game.enemies;
  const phase = game.phase;

  React.useEffect(() => {
    if (phase === 'victory' || phase === 'defeat') {
      const timer = setTimeout(() => setShowResult(true), 400);
      return () => clearTimeout(timer);
    } else {
      setShowResult(false);
    }
  }, [phase]);

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
  const handCount = player.hand.length;

  // Fan calculation
  const totalSpread = Math.min(MAX_FAN_SPREAD, (handCount - 1) * DEG_PER_CARD);
  const startAngle = -totalSpread / 2;

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Enemy Section (upper ~45%) ──────────────────── */}
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
              {intent && (
                <View style={[styles.intentBubble, { borderColor: intentColor }]}>
                  <Text style={[styles.intentIcon, { color: intentColor }]}>{intentIcon}</Text>
                  {intentValue ? <Text style={[styles.intentValue, { color: intentColor }]}>{intentValue}</Text> : null}
                </View>
              )}

              <View style={[styles.enemySprite, { borderColor: Colors.red }]}>
                <Text style={styles.enemySpriteGlyph}>⬡</Text>
              </View>

              {enemy.block > 0 && (
                <View style={styles.blockPill}>
                  <Text style={styles.blockPillText}>🛡 {enemy.block}</Text>
                </View>
              )}

              <Text style={styles.enemyName}>{enemy.name}</Text>

              <View style={styles.enemyHpWrap}>
                <View style={styles.hpBarBg}>
                  <View style={[styles.hpBarFill, { width: `${eHpPct * 100}%` as any, backgroundColor: Colors.red }]} />
                </View>
                <Text style={styles.enemyHpText}>{enemy.hp}/{enemy.maxHp}</Text>
              </View>

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

      {/* ── Phase indicator ─────────────────────────────── */}
      {!isPlayerTurn && phase === 'enemy_turn' && (
        <View style={styles.phaseBanner}>
          <Text style={styles.phaseText}>ENEMY TURN</Text>
        </View>
      )}

      {/* ── Bottom Panel: Player | Hand Fan | End Turn ──── */}
      <View style={styles.bottomPanel}>
        {/* ── Left column: Player stats + Draw pile ─────── */}
        <View style={styles.leftCol}>
          <View style={styles.playerStats}>
            {/* HP bar */}
            <View style={styles.hpRow}>
              <Text style={styles.hpIcon}>♥</Text>
              <View style={styles.hpBarBg}>
                <View style={[styles.hpBarFill, { width: `${hpPct * 100}%` as any, backgroundColor: Colors.hp }]} />
              </View>
              <Text style={styles.hpText}>{player.hp}/{player.maxHp}</Text>
            </View>

            {/* Block */}
            {player.block > 0 && (
              <View style={styles.blockPill}>
                <Text style={styles.blockPillText}>🛡 {player.block}</Text>
              </View>
            )}

            {/* Effects */}
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

          {/* Draw pile */}
          <View style={styles.pileBox}>
            <View style={styles.pileIcon}>
              <Text style={styles.pileIconText}>▮</Text>
            </View>
            <Text style={styles.pileCount}>{player.drawPile.length}</Text>
            <Text style={styles.pileLabel}>DRAW</Text>
          </View>
        </View>

        {/* ── Center: Card fan ──────────────────────────── */}
        <View style={styles.fanContainer}>
          {player.hand.map((card, i) => {
            const canPlay = game.canPlayCard(i);
            const cardColor = CARD_TYPE_COLORS[card.type] || Colors.text;
            const isSelected = selectedCard === i;

            // Fan position: centered spread
            const cardAngle = handCount > 1
              ? startAngle + i * DEG_PER_CARD
              : 0;

            // Horizontal offset: spread cards so they overlap
            const overlap = CARD_W * 0.55;
            const totalWidth = (handCount - 1) * overlap;
            const offsetX = i * overlap - totalWidth / 2;

            // Selected card lifts higher and un-rotates
            const liftY = isSelected ? -28 : 0;
            const finalAngle = isSelected ? 0 : cardAngle;

            return (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.card,
                  {
                    borderColor: canPlay ? cardColor : Colors.border,
                    transform: [
                      { translateX: offsetX },
                      { translateY: liftY },
                      { rotate: `${finalAngle}deg` },
                    ],
                  },
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

                {/* Card art */}
                <View style={[styles.cardArt, { borderColor: cardColor + '44' }]}>
                  <Text style={[styles.cardArtSymbol, { color: cardColor }]}>
                    {CARD_TYPE_SYMBOLS[card.type] || '◆'}
                  </Text>
                </View>

                <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{card.description}</Text>

                {card.def.exhaust && <Text style={styles.cardExhaust}>EXHAUST</Text>}

                {isSelected && (
                  <View style={[styles.tapToPlay, { backgroundColor: cardColor }]}>
                    <Text style={styles.tapToPlayText}>PLAY</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Right column: Energy + End Turn + Discard ─── */}
        <View style={styles.rightCol}>
          {/* Energy */}
          <View style={styles.energyBlock}>
            <View style={styles.energyOrbs}>
              {Array.from({ length: player.maxEnergy }).map((_, i) => (
                <View key={i} style={[styles.orb, i >= player.energy && styles.orbSpent]} />
              ))}
            </View>
            <Text style={styles.energyText}>{player.energy}/{player.maxEnergy}</Text>
          </View>

          {/* End Turn button */}
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

          {/* Discard pile */}
          <View style={styles.pileBox}>
            <View style={[styles.pileIcon, styles.pileIconDiscard]}>
              <Text style={styles.pileIconText}>▭</Text>
            </View>
            <Text style={styles.pileCount}>{player.discardPile.length}</Text>
            <Text style={styles.pileLabel}>DISC</Text>
          </View>
        </View>
      </View>

      {/* ── Victory / Defeat Modal ──────────────────────── */}
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

  // ── Enemy section (upper ~45%) ─────────────────────
  enemySection: {
    flex: 0.45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 12,
  },
  enemyCard: {
    flex: 1,
    maxWidth: 160,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 8,
    gap: 4,
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
    gap: 3,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: Colors.bg,
  },
  intentIcon: { fontSize: 13 },
  intentValue: { fontFamily: 'Courier New', fontSize: 14, fontWeight: 'bold' },
  enemySprite: {
    width: 50, height: 50,
    borderWidth: 2, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgPanel,
  },
  enemySpriteGlyph: { fontSize: 24, color: Colors.red },
  enemyName: { fontFamily: 'Courier New', fontSize: 10, fontWeight: 'bold', color: Colors.text },
  enemyHpWrap: { width: '100%', gap: 1 },
  enemyHpText: { fontFamily: 'Courier New', fontSize: 9, color: Colors.textDim, textAlign: 'center' },

  // ── Block pill (shared) ────────────────────────────
  blockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cyan + '22',
    borderWidth: 1,
    borderColor: Colors.cyan + '66',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  blockPillText: { fontFamily: 'Courier New', fontSize: 11, fontWeight: 'bold', color: Colors.block },

  // ── Phase banner ───────────────────────────────────
  phaseBanner: {
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: Colors.bgPanel,
    borderTopWidth: 1, borderTopColor: Colors.border,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  phaseText: { fontFamily: 'Courier New', fontSize: 12, color: Colors.red, letterSpacing: 3 },

  // ── Bottom panel (STS-style three-column) ──────────
  bottomPanel: {
    flex: 0.55,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  // Left column: player stats + draw pile
  leftCol: {
    width: 120,
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 4,
  },
  playerStats: {
    gap: 4,
  },
  hpRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hpIcon: { fontSize: 13, color: Colors.hp },
  hpBarBg: {
    flex: 1, height: 8,
    backgroundColor: Colors.bgPanel,
    borderRadius: 4, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  hpBarFill: { height: '100%', borderRadius: 3 },
  hpText: { fontFamily: 'Courier New', fontSize: 10, color: Colors.text, minWidth: 44 },

  // Center: card fan
  fanContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
    overflow: 'visible',
    position: 'relative',
  },

  // Right column: energy + end turn + discard
  rightCol: {
    width: 120,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 4,
    paddingRight: 10,
  },
  energyBlock: {
    alignItems: 'center',
    gap: 3,
  },
  energyOrbs: { flexDirection: 'row', gap: 5 },
  orb: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.energy,
    shadowColor: Colors.energy, shadowOpacity: 0.6, shadowRadius: 4, elevation: 3,
  },
  orbSpent: { backgroundColor: Colors.bgPanel, shadowOpacity: 0, elevation: 0, opacity: 0.3 },
  energyText: { fontFamily: 'Courier New', fontSize: 11, color: Colors.energy, fontWeight: 'bold' },

  // Pile boxes (shared)
  pileBox: { alignItems: 'center', gap: 2 },
  pileIcon: {
    width: 28, height: 36, borderRadius: 4,
    backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  pileIconDiscard: { borderColor: Colors.textDim + '44' },
  pileIconText: { fontSize: 14, color: Colors.textDim },
  pileCount: { fontFamily: 'Courier New', fontSize: 14, fontWeight: 'bold', color: Colors.text },
  pileLabel: { fontFamily: 'Courier New', fontSize: 7, color: Colors.textDim, letterSpacing: 1 },

  // ── Effects (shared) ───────────────────────────────
  effectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 2 },
  effectBadge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  effectText: { fontFamily: 'Courier New', fontSize: 8, fontWeight: 'bold' },

  // ── Cards ──────────────────────────────────────────
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  cardUnplayable: { opacity: 0.35 },
  cardSelected: {
    elevation: 10,
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  costBadge: {
    position: 'absolute', top: -1, left: -1,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  costText: { fontFamily: 'Courier New', fontSize: 12, fontWeight: 'bold', color: Colors.bg },
  cardArt: {
    width: '100%',
    height: CARD_W * 0.65,
    borderWidth: 1, borderRadius: 5,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2, marginBottom: 2,
    backgroundColor: Colors.bgPanel,
  },
  cardArtSymbol: { fontSize: 22 },
  cardName: {
    fontFamily: 'Courier New', fontSize: 9, fontWeight: 'bold',
    color: Colors.text, textAlign: 'center',
  },
  cardDesc: {
    fontFamily: 'Courier New', fontSize: 7.5,
    color: Colors.textDim, textAlign: 'center', lineHeight: 10,
    marginTop: 1,
  },
  cardExhaust: {
    fontFamily: 'Courier New', fontSize: 6.5,
    color: Colors.yellow, marginTop: 1, opacity: 0.8,
  },
  tapToPlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingVertical: 3, alignItems: 'center',
  },
  tapToPlayText: { fontFamily: 'Courier New', fontSize: 8, fontWeight: 'bold', color: Colors.bg, letterSpacing: 1 },

  // ── End turn button ────────────────────────────────
  endTurnBtn: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: Colors.bgPanel,
    width: '100%',
  },
  endTurnBtnActive: {
    borderColor: Colors.cyan,
    shadowColor: Colors.cyan,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  endTurnText: {
    fontFamily: 'Courier New', fontSize: 12, fontWeight: 'bold',
    color: Colors.textDim, letterSpacing: 2,
  },
  endTurnTextActive: { color: Colors.cyan },

  // ── Modal ──────────────────────────────────────────
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
