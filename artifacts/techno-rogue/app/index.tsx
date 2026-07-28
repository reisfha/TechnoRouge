'use no memo';

import { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGame } from '../context/GameContext';
import { CLASS_DEFINITIONS } from '@workspace/game-logic';
import { Colors } from '../constants/colors';
import { GridScanBackground } from '../components/GridScanBackground';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CLASS_BG_VARIANTS: Record<string, 'grid' | 'dataRain' | 'pulseRings' | 'particles'> = {
  netrunner: 'grid',
  cracker: 'dataRain',
  guardian: 'pulseRings',
  infectant: 'particles',
};

export default function MenuScreen() {
  'use no memo'; // React Compiler opt-out: reads the mutation-based Game singleton.
  const game = useGame();
  const [selected, setSelected] = useState<string | null>(null);

  const selectedClass = useMemo(
    () => CLASS_DEFINITIONS.find((c) => c.id === selected),
    [selected],
  );

  function startRun() {
    if (!selected) return;
    game.startRun(selected);
    game.generateMap();
    router.replace('/map');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <GridScanBackground
        color={selectedClass?.color ?? Colors.cyan}
        variant={CLASS_BG_VARIANTS[selected ?? ''] ?? 'grid'}
      />

      <View style={styles.header}>
        <Text style={styles.title}>TECHNO<Text style={styles.titleAccent}>ROGUE</Text></Text>
        <Text style={styles.subtitle}>JACK INTO THE SYSTEM</Text>
      </View>

      <Text style={styles.sectionLabel}>SELECT ARCHETYPE</Text>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {CLASS_DEFINITIONS.map((cls) => {
          const isSelected = selected === cls.id;
          return (
            <TouchableOpacity
              key={cls.id}
              style={[
                styles.classCard,
                { borderColor: isSelected ? cls.color : Colors.border },
                isSelected && { shadowColor: cls.color, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
              ]}
              onPress={() => setSelected(cls.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.classAccentBar, { backgroundColor: cls.color }]} />

              <Text style={[styles.className, { color: cls.color }]}>{cls.name.toUpperCase()}</Text>

              <View style={styles.classStats}>
                <Text style={styles.classStat}>HP {cls.maxHp}</Text>
                <Text style={styles.classStat}>⚡ {cls.maxEnergy}</Text>
              </View>

              <Text style={styles.classDesc}>{cls.description}</Text>

              <Text style={styles.classDeckCount}>{cls.starterDeck.length} cards</Text>

              {isSelected && (
                <View style={[styles.selectedBadge, { backgroundColor: cls.color }]}>
                  <Text style={styles.selectedBadgeText}>SELECTED</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startBtn,
            selected
              ? { borderColor: Colors.cyan, shadowColor: Colors.cyan, shadowOpacity: 0.5, shadowRadius: 16 }
              : styles.startBtnDisabled,
          ]}
          onPress={startRun}
          disabled={!selected}
          activeOpacity={0.8}
        >
          <Text style={[styles.startBtnText, !selected && styles.startBtnTextDisabled]}>
            {selected ? '[ JACK IN ]' : 'SELECT A CLASS'}
          </Text>
        </TouchableOpacity>

        <View style={styles.secondaryBtns}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/tutorial-combat')}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryBtnText, { color: Colors.yellow }]}>⚔ TUTORIAL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/tutorial-info')}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryBtnText, { color: Colors.cyan }]}>? HOW TO PLAY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Courier New',
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.cyan,
    letterSpacing: 6,
  },
  titleAccent: {
    color: Colors.red,
  },
  subtitle: {
    fontFamily: 'Courier New',
    fontSize: 11,
    color: Colors.textDim,
    letterSpacing: 4,
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: 'Courier New',
    fontSize: 10,
    color: Colors.textDim,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 12,
  },
  classCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  classAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.8,
  },
  className: {
    fontFamily: 'Courier New',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 6,
  },
  classStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  classStat: {
    fontFamily: 'Courier New',
    fontSize: 11,
    color: Colors.textDim,
  },
  classDesc: {
    fontFamily: 'Courier New',
    fontSize: 10,
    color: Colors.textDim,
    lineHeight: 15,
  },
  classDeckCount: {
    fontFamily: 'Courier New',
    fontSize: 10,
    color: Colors.textDim,
    marginTop: 8,
    opacity: 0.6,
  },
  selectedBadge: {
    marginTop: 8,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  selectedBadgeText: {
    fontFamily: 'Courier New',
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.bg,
    letterSpacing: 1,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
  },
  startBtn: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Colors.bgPanel,
    elevation: 8,
  },
  startBtnDisabled: {
    borderColor: Colors.border,
    opacity: 0.5,
  },
  startBtnText: {
    fontFamily: 'Courier New',
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.cyan,
    letterSpacing: 3,
  },
  startBtnTextDisabled: {
    color: Colors.textDim,
  },
  secondaryBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
  },
  secondaryBtnText: {
    fontFamily: 'Courier New',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
