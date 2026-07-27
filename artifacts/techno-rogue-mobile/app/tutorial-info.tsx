'use no memo';

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';

interface Section {
  title: string;
  color: string;
  lines: string[];
}

const SECTIONS: Section[] = [
  {
    title: 'TURN STRUCTURE',
    color: Colors.cyan,
    lines: [
      'Combat alternates between your turn and the enemy turn.',
      'On your turn, play cards using energy, then end your turn.',
      'When you end your turn, enemies act according to their intent.',
      'Block resets at the start of each turn.',
    ],
  },
  {
    title: 'CARDS',
    color: Colors.purple,
    lines: [
      'Each card costs energy to play (shown in the top-left circle).',
      'Cards have types: CODE (attack), FIREWALL (defense), DAEMON, VIRUS, ICE, PROTOCOL.',
      'Tap a card once to select it, tap again to play it.',
      'Long-press a card to play it directly.',
      'Greyed-out cards cost more energy than you have available.',
      'Some cards have EXHAUST — they are removed from your deck for the rest of combat.',
    ],
  },
  {
    title: 'ENERGY',
    color: Colors.yellow,
    lines: [
      'You start each turn with 3 energy (shown as yellow orbs).',
      'Playing cards costs energy. When you run out, you can\'t play more cards.',
      'Some cards give you bonus energy.',
    ],
  },
  {
    title: 'BLOCK',
    color: Colors.cyan,
    lines: [
      'Block (shield icon) absorbs damage before your HP is reduced.',
      'Block resets to 0 at the start of each turn.',
      'Block does NOT stack between turns — use it wisely.',
    ],
  },
  {
    title: 'ENEMY INTENT',
    color: Colors.red,
    lines: [
      'Above each enemy is an icon showing what they plan to do:',
      '  ⚔ Attack — will deal damage to you',
      '  🛡 Defend — will gain block',
      '  ⬆ Buff — will strengthen itself',
      '  ⬇ Debuff — will weaken you',
      '  ☣ Status — will apply poison or similar',
      'Plan your plays around enemy intents!',
    ],
  },
  {
    title: 'EFFECTS',
    color: Colors.green,
    lines: [
      'POISON: Enemy takes damage at end of each turn. Stacks up.',
      'WEAK: Reduces attack damage by 25% for the duration.',
      'VULNERABLE: Takes 50% more damage for the duration.',
      'STRENGTH: Increases attack damage permanently.',
      'FORTIFY: Increases block gained.',
    ],
  },
  {
    title: 'THE MAP',
    color: Colors.yellow,
    lines: [
      '⚔ COMBAT: Fight enemies for CryptoBytes.',
      '☠ ELITE: Tough enemies, better rewards.',
      '💀 BOSS: The final fight of each act.',
      '🛒 SHOP: Spend CryptoBytes to buy cards.',
      '🛏 REST: Heal 20% of your max HP.',
      '❓ EVENT: Random encounter with choices.',
      'Choose your path carefully through the branching map.',
    ],
  },
];

export default function TutorialInfoScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>HOW TO PLAY</Text>
        <Text style={styles.subtitle}>SYSTEM MANUAL</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <View style={[styles.sectionBar, { backgroundColor: section.color }]} />
            <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
            {section.lines.map((line, i) => (
              <Text key={i} style={styles.sectionLine}>{line}</Text>
            ))}
          </View>
        ))}

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>TIP</Text>
          <Text style={styles.tipText}>
            Start with the TUTORIAL on the main menu for a guided first combat experience.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>← BACK</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontFamily: 'Courier New',
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.cyan,
    letterSpacing: 4,
  },
  subtitle: {
    fontFamily: 'Courier New',
    fontSize: 9,
    color: Colors.textDim,
    letterSpacing: 3,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  section: {
    marginBottom: 20,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  sectionBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
  },
  sectionTitle: {
    fontFamily: 'Courier New',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  sectionLine: {
    fontFamily: 'Courier New',
    fontSize: 11,
    color: Colors.textDim,
    lineHeight: 16,
  },
  tipBox: {
    backgroundColor: Colors.bgPanel,
    borderWidth: 1,
    borderColor: Colors.yellow + '44',
    borderRadius: 8,
    padding: 14,
    marginTop: 4,
  },
  tipTitle: {
    fontFamily: 'Courier New',
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.yellow,
    letterSpacing: 2,
    marginBottom: 6,
  },
  tipText: {
    fontFamily: 'Courier New',
    fontSize: 11,
    color: Colors.textDim,
    lineHeight: 16,
  },
  footer: {
    padding: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backBtn: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.bgPanel,
  },
  backBtnText: {
    fontFamily: 'Courier New',
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.cyan,
    letterSpacing: 2,
  },
});
