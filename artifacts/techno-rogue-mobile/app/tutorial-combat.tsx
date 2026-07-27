'use no memo';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Modal, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGame } from '../context/GameContext';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

const CARD_W = Math.max(76, Math.min(width * 0.13, 100));
const CARD_H = CARD_W * 1.5;
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

type TutorialStep =
  | 'welcome'
  | 'explain_intent'
  | 'explain_cards'
  | 'play_attack'
  | 'play_defend'
  | 'explain_energy'
  | 'end_turn'
  | 'enemy_turn'
  | 'your_turn'
  | 'free_play'
  | 'victory';

const STEP_MESSAGES: Record<TutorialStep, string> = {
  welcome: 'Welcome to combat! You are facing a Patrol ICE.',
  explain_intent: 'See the ⚔ above the enemy? It will attack for 6 damage next turn.',
  explain_cards: 'Your cards are at the bottom. Red = attack, Blue = defense.',
  play_attack: 'Tap an ATTACK card to deal damage!',
  play_defend: 'Now tap a DEFEND card to gain block (shield).',
  explain_energy: 'Each card costs energy (⚡). You have 3 per turn.',
  end_turn: 'Tap END TURN when you are done playing cards.',
  enemy_turn: 'The enemy is acting...',
  your_turn: 'Your turn again! Keep playing cards to win.',
  free_play: 'Play cards freely to finish the fight.',
  victory: 'Combat complete! You defeated the Patrol ICE.',
};

export default function TutorialCombatScreen() {
  const game = useGame();
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>('welcome');
  const [showTip, setShowTip] = useState(true);
  const tipOpacity = useRef(new Animated.Value(1)).current;
  const stepIndexRef = useRef(0);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const player = game.player;
  const enemies = game.enemies;
  const phase = game.phase;

  const flashTip = useCallback(() => {
    tipOpacity.setValue(0);
    setShowTip(true);
    Animated.timing(tipOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [tipOpacity]);

  const advanceStep = useCallback((step: TutorialStep) => {
    setTutorialStep(step);
    stepIndexRef.current = Object.keys(STEP_MESSAGES).indexOf(step);
    flashTip();
  }, [flashTip]);

  const scheduleAdvance = useCallback((step: TutorialStep, delay: number) => {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    advanceTimeoutRef.current = setTimeout(() => advanceStep(step), delay);
  }, [advanceStep]);

  // Start combat with a weak tutorial enemy
  useEffect(() => {
    game.startRun('netrunner');
    game.spawnEnemies('combat');
    if (game.enemies[0]) {
      game.enemies[0].hp = 10;
      game.enemies[0].maxHp = 10;
    }
    game.startCombat();
  }, []);

  // Listen for game events to advance tutorial
  useEffect(() => {
    const onCardPlayed = (_event: any, data: any) => {
      const card = data?.card;
      if (!card) return;
      const cardType = card.type as string;

      if (tutorialStep === 'play_attack' && cardType === 'code') {
        scheduleAdvance('play_defend', 600);
      } else if (tutorialStep === 'play_defend' && cardType === 'firewall') {
        scheduleAdvance('explain_energy', 600);
      } else if (tutorialStep === 'free_play' || tutorialStep === 'your_turn') {
        // free play, no advancement needed
      }
    };

    const onTurnChanged = (_event: any, data: any) => {
      if (data?.phase === 'enemy_turn') {
        scheduleAdvance('enemy_turn', 300);
      } else if (data?.phase === 'player_turn' && stepIndexRef.current >= 6) {
        if (tutorialStep === 'enemy_turn' || tutorialStep === 'your_turn') {
          scheduleAdvance('your_turn', 500);
          setTimeout(() => advanceStep('free_play'), 2000);
        }
      }
    };

    const onGameOver = (_event: any, data: any) => {
      if (data?.result === 'victory') {
        advanceStep('victory');
        setTimeout(() => setShowResult(true), 800);
      }
    };

    game.on('card_played', onCardPlayed);
    game.on('turn_changed', onTurnChanged);
    game.on('game_over', onGameOver);

    return () => {
      game.off('card_played', onCardPlayed);
      game.off('turn_changed', onTurnChanged);
      game.off('game_over', onGameOver);
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
  }, [tutorialStep, scheduleAdvance, advanceStep]);

  // Auto-advance initial steps
  useEffect(() => {
    if (tutorialStep === 'welcome') {
      scheduleAdvance('explain_intent', 1500);
    } else if (tutorialStep === 'explain_intent') {
      scheduleAdvance('explain_cards', 2500);
    } else if (tutorialStep === 'explain_cards') {
      scheduleAdvance('play_attack', 2000);
    }
  }, [tutorialStep, scheduleAdvance]);

  if (!player) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loadingText}>INITIALIZING TUTORIAL...</Text>
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
  const totalSpread = Math.min(MAX_FAN_SPREAD, (handCount - 1) * DEG_PER_CARD);
  const startAngle = -totalSpread / 2;

  const highlightAttack = tutorialStep === 'play_attack';
  const highlightDefend = tutorialStep === 'play_defend';
  const highlightEndTurn = tutorialStep === 'end_turn';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Tutorial message banner */}
      {showTip && (
        <Animated.View style={[styles.tipBanner, { opacity: tipOpacity }]}>
          <Text style={styles.tipText}>{STEP_MESSAGES[tutorialStep]}</Text>
          {tutorialStep === 'free_play' && (
            <TouchableOpacity onPress={() => setShowTip(false)}>
              <Text style={styles.tipDismiss}>✕</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Enemy Section */}
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

      {/* Phase indicator */}
      {!isPlayerTurn && phase === 'enemy_turn' && (
        <View style={styles.phaseBanner}>
          <Text style={styles.phaseText}>ENEMY TURN</Text>
        </View>
      )}

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {/* Left column: Player stats + Draw pile */}
        <View style={styles.leftCol}>
          <View style={styles.playerStats}>
            <View style={styles.hpRow}>
              <Text style={styles.hpIcon}>♥</Text>
              <View style={styles.hpBarBg}>
                <View style={[styles.hpBarFill, { width: `${hpPct * 100}%` as any, backgroundColor: Colors.hp }]} />
              </View>
              <Text style={styles.hpText}>{player.hp}/{player.maxHp}</Text>
            </View>

            {player.block > 0 && (
              <View style={styles.blockPill}>
                <Text style={styles.blockPillText}>🛡 {player.block}</Text>
              </View>
            )}

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

          <View style={styles.pileBox}>
            <View style={styles.pileIcon}>
              <Text style={styles.pileIconText}>▮</Text>
            </View>
            <Text style={styles.pileCount}>{player.drawPile.length}</Text>
            <Text style={styles.pileLabel}>DRAW</Text>
          </View>
        </View>

        {/* Center: Card fan */}
        <View style={styles.fanContainer}>
          {player.hand.map((card, i) => {
            const canPlay = game.canPlayCard(i);
            const cardColor = CARD_TYPE_COLORS[card.type] || Colors.text;
            const isSelected = selectedCard === i;

            const cardAngle = handCount > 1
              ? startAngle + i * DEG_PER_CARD
              : 0;
            const overlap = CARD_W * 0.55;
            const totalWidth = (handCount - 1) * overlap;
            const offsetX = i * overlap - totalWidth / 2;
            const liftY = isSelected ? -28 : 0;
            const finalAngle = isSelected ? 0 : cardAngle;

            // Tutorial highlights
            const isAttack = card.type === 'code';
            const isDefend = card.type === 'firewall';
            const isHighlighted = (highlightAttack && isAttack && canPlay)
              || (highlightDefend && isDefend && canPlay);

            return (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.card,
                  {
                    borderColor: isHighlighted
                      ? Colors.yellow
                      : canPlay ? cardColor : Colors.border,
                    transform: [
                      { translateX: offsetX },
                      { translateY: liftY },
                      { rotate: `${finalAngle}deg` },
                    ],
                  },
                  !canPlay && styles.cardUnplayable,
                  isSelected && styles.cardSelected,
                  isHighlighted && styles.cardHighlighted,
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
                <View style={[styles.costBadge, { backgroundColor: cardColor }]}>
                  <Text style={styles.costText}>{card.cost}</Text>
                </View>

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

        {/* Right column: Energy + End Turn + Discard */}
        <View style={styles.rightCol}>
          <View style={styles.energyBlock}>
            <View style={styles.energyOrbs}>
              {Array.from({ length: player.maxEnergy }).map((_, i) => (
                <View key={i} style={[styles.orb, i >= player.energy && styles.orbSpent]} />
              ))}
            </View>
            <Text style={styles.energyText}>{player.energy}/{player.maxEnergy}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.endTurnBtn,
              isPlayerTurn && styles.endTurnBtnActive,
              highlightEndTurn && styles.endTurnBtnHighlighted,
            ]}
            onPress={endTurn}
            disabled={!isPlayerTurn}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.endTurnText,
              isPlayerTurn && styles.endTurnTextActive,
              highlightEndTurn && styles.endTurnTextHighlighted,
            ]}>
              {isPlayerTurn ? 'END TURN' : '...'}
            </Text>
          </TouchableOpacity>

          <View style={styles.pileBox}>
            <View style={[styles.pileIcon, styles.pileIconDiscard]}>
              <Text style={styles.pileIconText}>▭</Text>
            </View>
            <Text style={styles.pileCount}>{player.discardPile.length}</Text>
            <Text style={styles.pileLabel}>DISC</Text>
          </View>
        </View>
      </View>

      {/* Victory Modal */}
      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={[styles.modalTitle, { color: Colors.green }]}>TUTORIAL COMPLETE</Text>
            <Text style={styles.modalSub}>You learned the basics of combat.</Text>
            <Text style={styles.modalTip}>Try the main game to test your skills!</Text>
            <TouchableOpacity
              style={[styles.modalBtn, { borderColor: Colors.cyan }]}
              onPress={() => { setShowResult(false); router.replace('/'); }}
            >
              <Text style={[styles.modalBtnText, { color: Colors.cyan }]}>MAIN MENU</Text>
            </TouchableOpacity>
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

  // ── Tutorial tip banner ──────────────────────────
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgPanel,
    borderBottomWidth: 1,
    borderBottomColor: Colors.yellow + '66',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontFamily: 'Courier New',
    fontSize: 11,
    color: Colors.yellow,
    lineHeight: 16,
  },
  tipDismiss: {
    fontFamily: 'Courier New',
    fontSize: 14,
    color: Colors.textDim,
    paddingHorizontal: 4,
  },

  // ── Enemy section ────────────────────────────────
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

  // ── Block pill ───────────────────────────────────
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

  // ── Phase banner ─────────────────────────────────
  phaseBanner: {
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: Colors.bgPanel,
    borderTopWidth: 1, borderTopColor: Colors.border,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  phaseText: { fontFamily: 'Courier New', fontSize: 12, color: Colors.red, letterSpacing: 3 },

  // ── Bottom panel ─────────────────────────────────
  bottomPanel: {
    flex: 0.55,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  leftCol: {
    width: 120,
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 4,
  },
  playerStats: { gap: 4 },
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

  fanContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
    overflow: 'visible',
    position: 'relative',
  },

  rightCol: {
    width: 120,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 4,
    paddingRight: 10,
  },
  energyBlock: { alignItems: 'center', gap: 3 },
  energyOrbs: { flexDirection: 'row', gap: 5 },
  orb: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.energy,
    shadowColor: Colors.energy, shadowOpacity: 0.6, shadowRadius: 4, elevation: 3,
  },
  orbSpent: { backgroundColor: Colors.bgPanel, shadowOpacity: 0, elevation: 0, opacity: 0.3 },
  energyText: { fontFamily: 'Courier New', fontSize: 11, color: Colors.energy, fontWeight: 'bold' },

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

  // ── Effects ──────────────────────────────────────
  effectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 2 },
  effectBadge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  effectText: { fontFamily: 'Courier New', fontSize: 8, fontWeight: 'bold' },

  // ── Cards ────────────────────────────────────────
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
  cardHighlighted: {
    shadowColor: Colors.yellow,
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 10,
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

  // ── End turn button ──────────────────────────────
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
  endTurnBtnHighlighted: {
    borderColor: Colors.yellow,
    shadowColor: Colors.yellow,
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  },
  endTurnText: {
    fontFamily: 'Courier New', fontSize: 12, fontWeight: 'bold',
    color: Colors.textDim, letterSpacing: 2,
  },
  endTurnTextActive: { color: Colors.cyan },
  endTurnTextHighlighted: { color: Colors.yellow },

  // ── Modal ────────────────────────────────────────
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
  modalTitle: { fontFamily: 'Courier New', fontSize: 22, fontWeight: 'bold', letterSpacing: 3 },
  modalSub: { fontFamily: 'Courier New', fontSize: 12, color: Colors.textDim },
  modalTip: { fontFamily: 'Courier New', fontSize: 11, color: Colors.yellow },
  modalBtn: {
    borderWidth: 2, borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 32,
    alignItems: 'center',
  },
  modalBtnText: { fontFamily: 'Courier New', fontSize: 14, fontWeight: 'bold', letterSpacing: 2 },
});
