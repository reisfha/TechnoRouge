import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const GRID_COLS = 20;
const GRID_ROWS = 12;
const SCAN_SPEED = 4000;

export function GridScanBackground() {
  const scanY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanY, {
          toValue: height + 20,
          duration: SCAN_SPEED,
          useNativeDriver: false,
        }),
        Animated.timing(scanY, {
          toValue: -20,
          duration: SCAN_SPEED,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const verticalLines = Array.from({ length: GRID_COLS + 1 });
  const horizontalLines = Array.from({ length: GRID_ROWS + 1 });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Grid lines */}
      {verticalLines.map((_, i) => {
        const x = (width / GRID_COLS) * i;
        return (
          <View
            key={`v${i}`}
            style={[styles.lineVertical, { left: x }]}
          />
        );
      })}
      {horizontalLines.map((_, i) => {
        const y = (height / GRID_ROWS) * i;
        return (
          <View
            key={`h${i}`}
            style={[styles.lineHorizontal, { top: y }]}
          />
        );
      })}

      {/* Scan beam */}
      <Animated.View
        style={[
          styles.scanBeam,
          {
            top: scanY,
          },
        ]}
      />

      {/* Scan glow above beam */}
      <Animated.View
        style={[
          styles.scanGlow,
          {
            bottom: Animated.subtract(height, scanY),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  lineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: Colors.cyan,
    opacity: 0.06,
  },
  lineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.cyan,
    opacity: 0.06,
  },
  scanBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.cyan,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  scanGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 80,
    opacity: 0.08,
    backgroundColor: Colors.cyan,
  },
});
