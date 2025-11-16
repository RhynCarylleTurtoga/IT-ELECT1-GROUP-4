// src/components/ScoreCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ScoreCard({ nextNumber, elapsed, mistakes, timeLeft, formatTime }) {
  const renderTime = () => {
    if (timeLeft != null) {
      return `Time Left: ${timeLeft}s`;
    }
    if (formatTime && typeof elapsed === 'number') return `Time: ${formatTime(elapsed)}`;
    return `Time: ${elapsed ? elapsed.toFixed(2) + 's' : '0.00s'}`;
  };

  return (
    <View style={styles.card}>
      <Text style={styles.row}>Next: {nextNumber}</Text>
      <Text style={styles.row}>{renderTime()}</Text>
      <Text style={styles.row}>Mistakes: {mistakes}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, elevation: 2, marginBottom: 12 },
  row: { fontSize: 14, marginVertical: 2 }
});