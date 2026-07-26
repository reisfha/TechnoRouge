import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { GameProvider } from '../context/GameContext';
import { Colors } from '../constants/colors';
import { WebExpoPopup } from '../components/WebExpoPopup';
import { GridScanBackground } from '../components/GridScanBackground';

export default function RootLayout() {
  return (
    <GameProvider>
      <View style={styles.root}>
        <GridScanBackground />
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
