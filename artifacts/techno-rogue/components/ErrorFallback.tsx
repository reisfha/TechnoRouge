import { StyleSheet, Text, View } from 'react-native';

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <View style={[styles.container, { backgroundColor: '#0a0a0f' }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: '#e0e8ff' }]}>
          Something went wrong
        </Text>

        <Text style={[styles.message, { color: '#6070a0' }]}>
          {error.message}
        </Text>

        <Text
          onPress={resetError}
          style={[styles.button, { backgroundColor: '#44aaff', color: '#0a0a0f' }]}
        >
          Try Again
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 600,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 40,
    fontFamily: 'Courier New',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Courier New',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    paddingHorizontal: 24,
    minWidth: 200,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Courier New',
  },
});
