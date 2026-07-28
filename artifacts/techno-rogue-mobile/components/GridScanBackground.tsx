import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const GRID_COLS = 20;
const GRID_ROWS = 12;
const SCAN_SPEED = 4000;

type Variant = 'grid' | 'dataRain' | 'pulseRings' | 'particles';

interface Props {
  color?: string;
  variant?: Variant;
}

export function GridScanBackground({ color = Colors.cyan, variant = 'grid' }: Props) {
  const scanY = useRef(new Animated.Value(-20)).current;

  const particleOffsets = useRef(
    Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 0.5 + Math.random() * 1.5,
      delay: Math.random() * 3000,
    })),
  ).current;
  const rainColumns = useRef(
    Array.from({ length: 15 }, (_, i) => ({
      x: (width / 15) * i + Math.random() * 30,
      speed: 1 + Math.random() * 2,
      delay: Math.random() * 4000,
    })),
  ).current;
  const rainAnims = useRef(rainColumns.map(() => new Animated.Value(-50))).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(particleOffsets.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (variant === 'grid') {
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
    }
  }, [variant]);

  useEffect(() => {
    if (variant === 'dataRain') {
      const loops = rainAnims.map((anim, i) => {
        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: height + 50,
              duration: rainColumns[i].speed * 2000,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: -50,
              duration: 0,
              useNativeDriver: false,
            }),
          ]),
        );
        return Animated.sequence([
          Animated.delay(rainColumns[i].delay),
          loop,
        ]);
      });
      loops.forEach((a) => a.start());
      return () => loops.forEach((a) => a.stop());
    }
  }, [variant]);

  useEffect(() => {
    if (variant === 'pulseRings') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(ringAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [variant]);

  useEffect(() => {
    if (variant === 'particles') {
      const loops = particleAnims.map((anim, i) => {
        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: particleOffsets[i].speed * 4000,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: false,
            }),
          ]),
        );
        return Animated.sequence([
          Animated.delay(particleOffsets[i].delay),
          loop,
        ]);
      });
      loops.forEach((a) => a.start());
      return () => loops.forEach((a) => a.stop());
    }
  }, [variant]);

  if (variant === 'dataRain') {
    return (
      <View style={styles.container} pointerEvents="none">
        {rainColumns.map((col, i) => {
          const segmentHeight = 20 + Math.random() * 40;
          return (
            <Animated.View
              key={i}
              style={[
                styles.rainColumn,
                {
                  left: col.x,
                  top: rainAnims[i],
                  height: segmentHeight,
                  backgroundColor: color,
                  opacity: 0.3 + Math.random() * 0.3,
                },
              ]}
            />
          );
        })}
      </View>
    );
  }

  if (variant === 'pulseRings') {
    const ringCount = 3;
    return (
      <View style={styles.container} pointerEvents="none">
        {Array.from({ length: ringCount }).map((_, i) => {
          const animVal = Animated.divide(
            Animated.modulo(Animated.add(ringAnim, i / ringCount), 1),
            1,
          );
          const scale = animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1.5],
          });
          const opacity = animVal.interpolate({
            inputRange: [0, 0.8, 1],
            outputRange: [0.4, 0.15, 0],
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.pulseRing,
                {
                  borderColor: color,
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  }

  if (variant === 'particles') {
    return (
      <View style={styles.container} pointerEvents="none">
        {particleOffsets.map((p, i) => {
          const y = particleAnims[i].interpolate({
            inputRange: [0, 1],
            outputRange: [-10, height + 10],
          });
          const opacity = particleAnims[i].interpolate({
            inputRange: [0, 0.1, 0.9, 1],
            outputRange: [0, 0.6, 0.6, 0],
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  left: p.x,
                  top: y,
                  opacity,
                  backgroundColor: color,
                },
              ]}
            />
          );
        })}
      </View>
    );
  }

  const verticalLines = Array.from({ length: GRID_COLS + 1 });
  const horizontalLines = Array.from({ length: GRID_ROWS + 1 });

  return (
    <View style={styles.container} pointerEvents="none">
      {verticalLines.map((_, i) => {
        const x = (width / GRID_COLS) * i;
        return (
          <View
            key={`v${i}`}
            style={[styles.lineVertical, { left: x, backgroundColor: color }]}
          />
        );
      })}
      {horizontalLines.map((_, i) => {
        const y = (height / GRID_ROWS) * i;
        return (
          <View
            key={`h${i}`}
            style={[styles.lineHorizontal, { top: y, backgroundColor: color }]}
          />
        );
      })}

      <Animated.View
        style={[
          styles.scanBeam,
          {
            top: scanY,
            backgroundColor: color,
            shadowColor: color,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.scanGlow,
          {
            bottom: Animated.subtract(height, scanY),
            backgroundColor: color,
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
    opacity: 0.06,
  },
  lineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.06,
  },
  scanBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
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
  },
  rainColumn: {
    position: 'absolute',
    width: 2,
    borderRadius: 1,
  },
  pulseRing: {
    position: 'absolute',
    top: height / 2 - 100,
    left: width / 2 - 100,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
