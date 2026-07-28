import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const GRID_COLS = 4;
const GRID_ROWS = 6;
const SCAN_SPEED = 3000;

interface ClassBackgroundProps {
  color: string;
}

export function ClassBackground({ color }: ClassBackgroundProps) {
  const scanY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanY, {
          toValue: 200,
          duration: SCAN_SPEED,
          useNativeDriver: false,
        }),
        Animated.timing(scanY, {
          toValue: -10,
          duration: SCAN_SPEED,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: GRID_COLS + 1 }).map((_, i) => (
        <View
          key={`v${i}`}
          style={[styles.lineVertical, { left: `${(100 / GRID_COLS) * i}%`, backgroundColor: color }]}
        />
      ))}
      {Array.from({ length: GRID_ROWS + 1 }).map((_, i) => (
        <View
          key={`h${i}`}
          style={[styles.lineHorizontal, { top: `${(100 / GRID_ROWS) * i}%`, backgroundColor: color }]}
        />
      ))}
      <Animated.View
        style={[styles.scanBeam, { top: scanY, backgroundColor: color, shadowColor: color }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    opacity: 0.15,
  },
  lineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    opacity: 0.3,
  },
  lineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.3,
  },
  scanBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
});
