// src/components/NumberCell.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../theme';

export default function NumberCell({ value, onPress, status = 'idle', size = 70 }) {
  const bg =
    status === 'correct' ? Colors.accent :
    status === 'wrong' ? '#ffd6d6' :
    status === 'disabled' ? '#f1f5f9' :
    '#dbeffd';

  const textColor = status === 'correct' ? '#064e26' : Colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={status === 'correct' || status === 'disabled'}
      style={[styles.wrap, { backgroundColor: bg, width: size, height: size, borderRadius: 12 }]}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Text style={[styles.num, { color: textColor }]}>{String(value)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  num: {
    fontSize: 20,
    fontWeight: '800',
  },
});