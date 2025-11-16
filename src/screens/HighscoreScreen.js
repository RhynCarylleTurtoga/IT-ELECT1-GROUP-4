// src/screens/HighscoresScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getHighscores } from '../db/database';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradient } from '../theme';

export default function HighscoresScreen() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    (async () => {
      const s = await getHighscores({ limit: 50 });
      setScores(s || []);
    })();
  }, []);

  return (
    <LinearGradient colors={[Gradient.from, Gradient.to]} style={styles.root}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={scores}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.player}>{item.player || 'Guest'}</Text>
              <Text style={styles.meta}>{(item.time || 0).toFixed(2)}s • mistakes {item.mistakes}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 12 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.primary, marginBottom: 12 },
  row: { flexDirection: 'row', paddingVertical: 10, alignItems: 'center' },
  rank: { width: 36, fontWeight: '700' },
  player: { fontWeight: '700' },
  meta: { color: Colors.muted, fontSize: 12 },
  sep: { height: 1, backgroundColor: '#eef6ff', marginVertical: 6 }
});