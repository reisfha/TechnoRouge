import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Linking,
} from 'react-native';
import { Colors } from '../constants/colors';

export function WebExpoPopup() {
  const [tunnelUrl, setTunnelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    fetch('/', { headers: { 'Expo-Platform': 'ios' } })
      .then((r) => r.json())
      .then((manifest: any) => {
        const host = manifest?.extra?.expoClient?.hostUri;
        if (host) {
          setTunnelUrl(`exp://${host}`);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (Platform.OS !== 'web' || dismissed) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.popup}>
        <Text style={styles.title}>OPEN IN EXPO GO</Text>
        <Text style={styles.divider}>──────────────────</Text>
        <Text style={styles.desc}>
          This game is designed for mobile.{'\n'}Open it on your phone with Expo Go for the full experience.
        </Text>

        {loading ? (
          <Text style={styles.loading}>Fetching tunnel URL...</Text>
        ) : tunnelUrl ? (
          <>
            <View style={styles.urlBox}>
              <Text style={styles.urlText} selectable numberOfLines={1}>
                {tunnelUrl}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.openBtn}
              onPress={() => Linking.openURL(tunnelUrl!)}
              activeOpacity={0.8}
            >
              <Text style={styles.openBtnText}>[ LAUNCH ON PHONE ]</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>
              Or copy the URL above into Expo Go
            </Text>
          </>
        ) : (
          <Text style={styles.error}>
            Tunnel not available.{'\n'}Run: npx expo start --tunnel
          </Text>
        )}

        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={() => setDismissed(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dismissText}>[ PLAY WEB VERSION ]</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 5, 12, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  popup: {
    backgroundColor: Colors.bgPanel,
    borderWidth: 2,
    borderColor: Colors.cyan,
    borderRadius: 12,
    padding: 28,
    maxWidth: 400,
    width: '90%',
    alignItems: 'center',
    shadowColor: Colors.cyan,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  title: {
    fontFamily: 'Courier New',
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.cyan,
    letterSpacing: 4,
    marginBottom: 4,
  },
  divider: {
    fontFamily: 'Courier New',
    fontSize: 12,
    color: Colors.textDim,
    marginBottom: 16,
  },
  desc: {
    fontFamily: 'Courier New',
    fontSize: 12,
    color: Colors.textDim,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  loading: {
    fontFamily: 'Courier New',
    fontSize: 11,
    color: Colors.textDim,
    marginBottom: 16,
  },
  urlBox: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    width: '100%',
  },
  urlText: {
    fontFamily: 'Courier New',
    fontSize: 13,
    color: Colors.green,
    textAlign: 'center',
  },
  openBtn: {
    borderWidth: 2,
    borderColor: Colors.green,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 10,
    backgroundColor: Colors.greenDim,
    shadowColor: Colors.green,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  openBtnText: {
    fontFamily: 'Courier New',
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.green,
    letterSpacing: 2,
  },
  hint: {
    fontFamily: 'Courier New',
    fontSize: 10,
    color: Colors.textDim,
    marginBottom: 16,
  },
  error: {
    fontFamily: 'Courier New',
    fontSize: 11,
    color: Colors.red,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
  },
  dismissBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dismissText: {
    fontFamily: 'Courier New',
    fontSize: 11,
    color: Colors.textDim,
    letterSpacing: 1,
  },
});
