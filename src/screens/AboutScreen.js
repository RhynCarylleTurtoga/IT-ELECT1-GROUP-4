// src/screens/AboutScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradient } from '../theme';

const { width } = Dimensions.get('window');

const SUBMITTED_TO = 'Sir Jay Ian Florenosos Camelotes';
const SUBMITTED_BY = [
  'Rhyn Carylle Turtoga',
  'Jessan John Orevillo',
  'Mae Kayla Cajes',
  'Jv Ayunan',
  'John Micheal Cutamora',
  'Leanardo Felisilda',
  'Diether John Paroginog',
  'Eljhon Nudalo',
  'Jefferson Fernandez',
  'Jayremi Sumatra',
];

// Local uploaded screenshot file (from your environment).
// Developer note: path included exactly as requested.
const screenshotPath = 'file:///mnt/data/Screenshot_2025-11-24-10-23-21-19_f73b71075b1de7323614b647fe394240.jpg';

export default function AboutScreen({ navigation }) {
  const description =
    'Number Rush trains quick mental math: tap numbers in order on a shuffled grid. Short rounds, rising difficulty, and two modes keep sessions fast and replayable.';

  const features = [
    'Classic & Time Attack',
    '3 difficulty levels',
    'Quick 30–25s rounds for time attack mode',
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

          {/* Stylish Submission Card */}
          <View style={styles.submissionWrap}>
            <View style={styles.subLeft}>
              <Text style={styles.subHeading}>Submitted to</Text>
              <Text style={styles.subTo}>{SUBMITTED_TO}</Text>

              <Text style={[styles.subHeading, { marginTop: 12 }]}>Submitted by</Text>

              <View style={styles.namesWrap}>
                {SUBMITTED_BY.map((n, i) => (
                  <View key={i} style={styles.nameRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.nameText}>{n}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* thumbnail of screenshot (optional) */}
            <View style={styles.subRight}>
              <Image source={{ uri: screenshotPath }} style={styles.thumb} resizeMode="cover" />
            </View>
          </View>

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
    paddingHorizontal: 22,
    alignItems: 'flex-start',
    elevation: 6,
  },
  title: { alignSelf: 'center', fontSize: 26, fontWeight: '900', color: Colors.primary },
  desc: { color: Colors.muted, fontSize: 15, marginTop: 10 },
  section: { marginTop: 15, fontWeight: '800', color: '#0f172a' },
  bullet: { color: Colors.muted, marginTop: 8 },

  /* Submission styles */
  submissionWrap: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#f8fbff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  subLeft: {
    flex: 1,
    paddingRight: 8,
  },
  subRight: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  subTo: {
    marginTop: 6,
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 14,
  },
  namesWrap: {
    marginTop: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  nameText: {
    color: Colors.muted,
    fontSize: 13,
  },

  thumb: {
    width: 96,
    height: 96,
    borderRadius: 10,
    backgroundColor: '#e6eefb',
  },

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
