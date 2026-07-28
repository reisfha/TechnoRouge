import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { GameProvider } from '../context/GameContext';
import { Colors } from '../constants/colors';
import { WebExpoPopup } from '../components/WebExpoPopup';

export default function RootLayout() {
  return (
    <GameProvider>
      <View style={styles.root}>
        <StatusBar style="light" backgroundColor={Colors.bg} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="map" />
          <Stack.Screen name="combat" />
          <Stack.Screen name="tutorial-combat" />
          <Stack.Screen name="tutorial-info" />
        </Stack>
        {Platform.OS === 'web' && <WebExpoPopup />}
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
