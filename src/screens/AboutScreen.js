import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradient } from '../theme';

const { width } = Dimensions.get('window');

export default function AboutScreen({ navigation }) {
  const description =
    'Number Rush trains quick mental math: tap numbers in order on a shuffled grid. Short rounds, rising difficulty, and two modes keep sessions fast and replayable.';

  const features = [
    'Quick 30–90s rounds',
    '3 difficulty levels',
    'Classic & Time Attack',
    'Randomized every game',
    'Local leaderboard',
    'Tracks mistakes + time',
    'Offline friendly',
  ];

  return (
    <LinearGradient colors={[Gradient.from, Gradient.to]} style={styles.root}>
      <ScrollView contentContainerStyle={styles.center} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>About Number Rush</Text>

          <Text style={styles.desc}>{description}</Text>

          <Text style={styles.section}>Key Features</Text>
          {features.map((f, i) => (
            <Text key={i} style={styles.bullet}>{`\u2022 ${f}`}</Text>
          ))}

          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  card: {
    width: Math.min(width - 40, 640),
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'flex-start',
    elevation: 6,
  },
  title: { alignSelf: 'center', fontSize: 26, fontWeight: '900', color: Colors.primary },
  desc: { color: Colors.muted, fontSize: 15, marginTop: 10 },
  section: { marginTop: 15, fontWeight: '800', color: '#0f172a' },
  bullet: { color: Colors.muted, marginTop: 6 },
  closeBtn: {
    alignSelf: 'stretch',
    marginTop: 18,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontWeight: '800' },
});
