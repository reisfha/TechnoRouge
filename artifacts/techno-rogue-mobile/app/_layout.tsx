import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { GameProvider } from '../context/GameContext';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  return (
    <GameProvider>
      <View style={styles.root}>
        <StatusBar style="light" backgroundColor={Colors.bg} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.bg },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="map" />
          <Stack.Screen name="combat" />
        </Stack>
      </View>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
});
